const users = []

const addUser = ({id, username, room}) =>{

    // Filter the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return{
            error: "please enter valid username or room name"
        }
    }

    //Duplicate users
    const existinguser = users.find((user) =>{
        return user.username === username && user.room === room
        
    })

    //send error
    if(existinguser){
        return{
            error:"username is in use! "
        }
    }

    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) =>{
        return user.id === id
    })

    if(index !== -1){
        return users.splice(index, 1)[0]
    }

}
const getUser = (id) =>{
    return users.find((user) =>
       user.id === id 
    )
}

const getUserInRoom = (room) =>{
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}