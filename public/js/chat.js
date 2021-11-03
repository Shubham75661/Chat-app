const socket = io()

//Dom Elements are denoted by $....
const $messageform = document.querySelector('#message-form')
const $messageformButton = $messageform.querySelector('#send-message')
const $messageformInput = $messageform.querySelector('#message')
const $location = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Rooms
const{username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true })

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebatTemplate = document.querySelector('#sidebar-template').innerHTML

const autoscroll = () => {

    const $newMessage = $messages.lastElementChild


    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin


    const visibleHeight = $messages.offsetHeight


    const containerHeight = $messages.scrollHeight


    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username : message.username,
        message: message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('LocationMessage', (message)=>{
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        message: message.url,
        createdAt:  moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})
socket.on('roomData', ({room, users}) =>{
    const html = Mustache.render(sidebatTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageform.addEventListener('submit', (e) =>{
    e.preventDefault()
    //Disable the form 
    $messageformButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message,(error) =>{
        $messageformButton.removeAttribute('disabled')
        $messageformInput.value= ''
        $messageformInput.focus()
        if(error){
            console.log(error)
        }
       
    })
})

$location.addEventListener('click', ()=>
{   
    $location.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation){
        alert("Sorry your browser dosen't support geolocation")
    }

    navigator.geolocation.getCurrentPosition((position) =>{
        socket.emit('sendlocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },(working) =>{
            console.log(working)
            $location.removeAttribute('disabled')
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = "/"
    }
})