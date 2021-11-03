const path = require("path")
const express = require("express")
const http = require("http")
const socketio = require("socket.io")
const Filter = require("bad-words")
const {generatemessages, generatelocation} = require("./utils/messages")
const{addUser, removeUser, getUser, getUserInRoom} = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3001
const publicDictionaryPath = path.join(__dirname,'../public')

app.use(express.static(publicDictionaryPath))


io.on('connection',(socket)=>{
    console.log("New socket is connected ")

    socket.on('join', ({ username, room }, callback) =>{
        const{error, user} = addUser({ id: socket.id, username, room})

        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generatemessages('Admin','welcome'))
        socket.broadcast.to(user.room).emit('message',generatemessages(user.username, `${user.username} has joined the chat!`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback("Profanity is not allowed")
        }

        io.to(user.room).emit('message', generatemessages(user.username, message))
        callback()
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generatemessages(`${user.username} has left the chat`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    })
    
    socket.on('sendlocation',(coords, working)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('LocationMessage',
        generatelocation(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        working("Location has been sent to user")
    })
})

server.listen(port, ()=>{
    console.log(`server is set on port ${port}!`)
})