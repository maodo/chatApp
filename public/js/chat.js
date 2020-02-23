const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true})

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        message: message.text,
        createdAt: moment(message.createdAt).format('H:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)

})

socket.on('location', (message) => {
    console.log(message)
    const html = Mustache.render(locationTemplate,{
        location: message.location,
        createdAt: moment(message.createdAt).format('H:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

$messageForm.addEventListener('submit',(e) => {
    e.preventDefault()
    //
    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage',message, (msg) => {
        console.log('The message was delivered', msg)
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
    })

})


$locationButton.addEventListener('click', () => {
    
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    $locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition( (position) => {
        const {latitude, longitude} = position.coords
        socket.emit('sendLocation', {lat:latitude, lon:longitude}, () => {
            $locationButton.removeAttribute('disabled')
            console.log('Location shared')
        })
        
    })
})

socket.emit('join', { username, room})