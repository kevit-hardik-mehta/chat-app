const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage } = require('./utils/messages')
const { generateLocationMessage } = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/utils')

const app = express();
const server = http.createServer(app)
const io = socketio(server);

const publicDirctoryPath =  path.join(__dirname,'../public')
app.use(express.static(publicDirctoryPath))


io.on('connection', (socket) => {
    console.log("New websocket connection");

    socket.on('join', ({username, room}, callback) => {

    const {error, user} = addUser({id: socket.id, username, room});
        
        if (error) {
            return callback('Sorry, we could not add user')
        }
    
    socket.join(user.room);

    socket.emit('message', generateMessage('Admin' , "Welcome!!"));
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `A new user ${user.username} has joined the room`))
    
    io.to(user.room).emit('roomData',{
        room : user.room,
        users : getUsersInRoom(user.room)
    })

    callback();

    })

    socket.on('sendMessage', (data, callback) => {
        const filter = new Filter();

        if (filter.isProfane(data)) {
            return callback('Profanity is not allowed!!')
        }
        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(user.username,data));
        callback();
    })

    socket.on('sendLocation', (coords, callback) =>{
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, `https://google.com/maps?q=${coords.longitude},${coords.latitude}`));
        callback();
        
    })


    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message',generateMessage('Client has left!!'));

            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }
        
    })

    
})

server.listen(3000, () => {
    console.log("Server up and running on port 3000")
})