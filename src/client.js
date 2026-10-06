const socket = io.connect('http://localhost:3000');

// Send message to the server
function sendMessage() {
  if (!document.getElementById('message').value) return;
  const message = document.getElementById('message').value;
  socket.emit('message', message);
  document.getElementById('message').value = '';
}

// Receive messages from the server
socket.on('message', function(message) {
  const newMessage = document.createElement('div');

  newMessage.className = 'chat-message';

  newMessage.textContent = message;

  document.getElementById('messages').appendChild(newMessage);

  const chatContainer = document.getElementById('chat-container');
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
});
