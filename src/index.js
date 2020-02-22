const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT

const publicDirectoryPath = path.join(__dirname, '../public')
app.use('/', express.static(publicDirectoryPath));

let message = 'Welcome to our chat app'
io.on('connection', (socket) => {
    console.log('New WebSocket connection ')

    socket.emit('message',message)

    socket.on('sendMessage', (value, callback) => {
        io.emit('message', value)
        callback('Delivered!')
    })

    socket.on('sendLocation', (values, callback) => {
        io.emit('location', `https://www.google.com/maps?q=${values.lat},${values.lon}`)
        callback()
    })

})


server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})