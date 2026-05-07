// ========== DOM Elements ==========
const joinSection = document.getElementById('joinSection');
const chatSection = document.getElementById('chatSection');
const usernameInput = document.getElementById('usernameInput');
const joinBtn = document.getElementById('joinBtn');
const leaveBtn = document.getElementById('leaveBtn');
const userList = document.getElementById('userList');
const userCount = document.getElementById('userCount');
const chatTitle = document.getElementById('chatTitle');
const chatStatus = document.getElementById('chatStatus');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const typingUsername = document.getElementById('typingUsername');
const onlineIndicator = document.getElementById('onlineIndicator');
const systemMessage = document.getElementById('systemMessage');

// ========== Global Variables ==========
let socket = null;
let currentUsername = '';
let currentUserId = '';
let selectedUser = null;
let conversationHistory = {}; // Store conversations
let typingTimeout = null;
let messageHistory = [];

// ========== Initialize Socket.IO ==========
function initializeSocket() {
    socket = io();

    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('userList', (users) => {
        updateUserList(users);
    });

    socket.on('newMessage', (data) => {
        handleNewMessage(data);
    });

    socket.on('messageSent', (data) => {
        handleMessageSent(data);
    });

    socket.on('notification', (data) => {
        handleNotification(data);
    });

    socket.on('userTyping', (data) => {
        showTypingIndicator(data);
    });

    socket.on('userStopTyping', (data) => {
        hideTypingIndicator();
    });

    socket.on('messageHistory', (history) => {
        messageHistory = history;
        // Group messages by conversation
        history.forEach(msg => {
            const key = getConversationKey(msg.sender, msg.receiver);
            if (!conversationHistory[key]) {
                conversationHistory[key] = [];
            }
            conversationHistory[key].push(msg);
        });
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
}

// ========== Join Chat ==========
joinBtn.addEventListener('click', joinChat);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinChat();
});

function joinChat() {
    const username = usernameInput.value.trim();
    if (!username) {
        alert('Vui lòng nhập tên người dùng');
        return;
    }

    if (username.length < 2) {
        alert('Tên phải có ít nhất 2 ký tự');
        return;
    }

    if (username.length > 20) {
        alert('Tên không được vượt quá 20 ký tự');
        return;
    }

    currentUsername = username;
    socket.emit('join', username);

    // Switch to chat section
    joinSection.classList.remove('active');
    chatSection.classList.add('active');

    // Focus on message input
    setTimeout(() => messageInput.focus(), 300);
}

// ========== Leave Chat ==========
leaveBtn.addEventListener('click', () => {
    if (confirm('Bạn chắc chắn muốn thoát khỏi cuộc trò chuyện?')) {
        socket.disconnect();
        location.reload();
    }
});

// ========== Update User List ==========
function updateUserList(users) {
    userList.innerHTML = '';
    userCount.textContent = users.length;

    if (users.length === 0) {
        userList.innerHTML = '<div style="padding: 20px; text-align: center; color: rgba(255,255,255,0.6);">Chưa có người dùng nào</div>';
        return;
    }

    users.forEach(user => {
        if (user.id !== socket.id) {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            if (selectedUser && selectedUser.id === user.id) {
                userItem.classList.add('active');
            }
            userItem.innerHTML = `
                <span class="status"></span>
                <span>${sanitizeHTML(user.username)}</span>
            `;
            userItem.addEventListener('click', () => selectUser(user));
            userList.appendChild(userItem);
        }
    });
}

// ========== Select User ==========
function selectUser(user) {
    selectedUser = user;
    updateUserList(JSON.parse(JSON.stringify(Array.from(document.querySelectorAll('.user-item')).map(el => ({
        username: el.textContent.trim(),
        id: el.dataset.userId
    })))));

    // Update chat header
    chatTitle.textContent = `💬 Chat với ${sanitizeHTML(user.username)}`;
    chatStatus.textContent = 'Đang trực tuyến';
    onlineIndicator.style.animation = 'pulse 2s infinite';

    // Clear and load conversation
    messagesContainer.innerHTML = '';
    loadConversation(user);

    // Enable message input
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();

    // Update active user in sidebar
    document.querySelectorAll('.user-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// ========== Load Conversation ==========
function loadConversation(user) {
    const key = getConversationKey(currentUsername, user.username);
    const messages = conversationHistory[key] || [];

    if (messages.length === 0) {
        messagesContainer.innerHTML = `
            <div class="system-message">
                <p>Bắt đầu một cuộc trò chuyện mới với ${sanitizeHTML(user.username)}</p>
            </div>
        `;
        return;
    }

    messages.forEach(msg => {
        displayMessage(msg);
    });

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ========== Get Conversation Key ==========
function getConversationKey(user1, user2) {
    const users = [user1, user2].sort();
    return `${users[0]}__${users[1]}`;
}

// ========== Send Message ==========
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function sendMessage() {
    if (!selectedUser) {
        alert('Vui lòng chọn một người dùng');
        return;
    }

    const message = messageInput.value.trim();
    if (!message) {
        return;
    }

    socket.emit('sendMessage', {
        receiver: selectedUser.username,
        receiverId: selectedUser.id,
        message: message
    });

    messageInput.value = '';
    messageInput.focus();
    socket.emit('stopTyping', { receiverId: selectedUser.id });
}

// ========== Handle New Message ==========
function handleNewMessage(data) {
    const key = getConversationKey(data.sender, data.receiver);
    if (!conversationHistory[key]) {
        conversationHistory[key] = [];
    }
    conversationHistory[key].push(data);

    // Display if conversation is open
    if (selectedUser && (data.sender === selectedUser.username || selectedUser.username === data.sender)) {
        displayMessage(data);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// ========== Handle Message Sent ==========
function handleMessageSent(data) {
    const key = getConversationKey(data.sender, data.receiver);
    if (!conversationHistory[key]) {
        conversationHistory[key] = [];
    }
    conversationHistory[key].push(data);

    displayMessage(data);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ========== Display Message ==========
function displayMessage(msg) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.sender === currentUsername ? 'sender' : 'receiver'}`;

    const time = new Date(msg.timestamp);
    const timeString = time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    messageDiv.innerHTML = `
        <div>
            <div class="message-content">
                ${sanitizeHTML(msg.message)}
            </div>
            <div class="message-time">${timeString}</div>
        </div>
    `;

    // Clear system message if exists
    const systemMsg = messagesContainer.querySelector('.system-message');
    if (systemMsg) {
        systemMsg.remove();
    }

    messagesContainer.appendChild(messageDiv);
}

// ========== Handle Notification ==========
function handleNotification(data) {
    const notifDiv = document.createElement('div');
    notifDiv.className = `notification ${data.type}`;
    notifDiv.textContent = data.message;

    messagesContainer.appendChild(notifDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Auto-remove notification after 5 seconds
    setTimeout(() => notifDiv.remove(), 5000);
}

// ========== Typing Indicators ==========
messageInput.addEventListener('input', () => {
    if (!selectedUser) return;

    socket.emit('typing', { receiverId: selectedUser.id });

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        socket.emit('stopTyping', { receiverId: selectedUser.id });
    }, 1000);
});

function showTypingIndicator(data) {
    if (selectedUser && data.senderId === selectedUser.id) {
        typingUsername.textContent = sanitizeHTML(data.username);
        typingIndicator.style.display = 'flex';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

// ========== Utility Functions ==========
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========== Initialize Application ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeSocket();
    usernameInput.focus();
});

// ========== Handle Page Unload ==========
window.addEventListener('beforeunload', () => {
    if (currentUsername && socket) {
        socket.disconnect();
    }
});
