const socket = io();

const $messageForm = document.querySelector('#message-form'); 
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $messages = document.querySelector('#messages');
const $locationButton = document.querySelector('#location'); 


const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});




socket.on('message', (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message : msg.text,
        createdAt :moment(msg.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (location) => {
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        link : location.url,
        createdAt : moment(location.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
} )

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html;
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');
    
    const message = e.target.elements.message.value;
    

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if (error) {
            return console.log(error);
        }
        console.log('This message is delivered');
        
    })
})


$locationButton.addEventListener('click',() => {

    if (!navigator.geolocation) {
        return alert('Geo location is not supported by your browser!!')
    }

    $locationButton.setAttribute('disabled', 'disabled');
     navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared!!')
            $locationButton.removeAttribute('disabled');
        })
        
    })
})


socket.emit('join', ({username, room}), (error) => {

    if (error) {
        alert(error);
        location.href = '/'
    }
    console.log('user added successfully')
})

