const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
require('dotenv').config()
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT

const publicDirectoryPath = path.join(__dirname, '../public')
app.use('/', express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New WebSocket connection ')

    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room})
        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        
        socket.emit('message',generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (value, callback) => {
        const user = getUser(socket.id)
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username,value))
        // This allows to display 'me' instead of my username when i send a message
        io.to(socket.id).emit('message',generateMessage('me',value))
        callback()
    })

    socket.on('sendLocation', (values, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('location', generateLocationMessage(user.username,`https://www.google.com/maps?q=${values.lat},${values.lon}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left !`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            }) 
        }  
    })

})


server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})