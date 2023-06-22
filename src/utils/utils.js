const users = [];

const addUser = ({id, username, room}) => {

    //clean the data
     room = room.trim().toLowerCase();
     username = username.trim().toLowerCase();

    
     //validate the data
     if ((!room) || (!username)) {
        console.log('hahahahah')
        return {
            error: 'username or room cannot be empty'
        }
     }

     //check for existing user
     const existingUser = users.find((user) => {
        return user.username === username && user.room === room; 
     })

     //validate username
     if (existingUser) {
        return {
            error: 'Username in use'
        }
     }
     const user = {id, username, room};
     users.push(user);
     return { user };
}

const removeUser = (id) => {

    const index = users.findIndex((user) =>  user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
    
}

const getUser = (id) => {

    if (!id) {
        return {
            error: 'id is necessary'
        }
    }
    const user = users.find((user) => {
        return user.id === id;
    })
    return user
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    if (!room) {
        return {
            error: 'room name is necessary'
        }
    }
    return users.filter((user) => user.room === room);
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}