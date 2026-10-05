const socket = io.connect('http://localhost:3000');

// Send message to the server
function sendMessage() {
  const message = document.getElementById('message').value;
  socket.emit('message', message);
  document.getElementById('message').value = '';
}

// Receive messages from the server
socket.on('message', function(message) {
  const newMessage = document.createElement('li');
  newMessage.textContent = message;
  document.getElementById('messages').appendChild(newMessage);
});
