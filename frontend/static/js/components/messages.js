const Messages = {
    activeChats: new Map(), // userId -> chat window element
    messages: new Map(), // userId -> array of messages

    init() {
        this.messagesContainer = document.getElementById('messages-container');
        this.bindEvents();
    },

    bindEvents() {
        // Open chat from contacts list
        document.getElementById('online-contacts').addEventListener('click', (e) => {
            const contact = e.target.closest('.contact');
            if (contact) {
                const userId = contact.dataset.userId;
                this.openChat(userId);
            }
        });

        // Messages icon click
        document.querySelector('.messages-icon').addEventListener('click', () => {
            this.toggleMessagesList();
        });
    },

    toggleMessagesList() {
        this.messagesContainer.classList.toggle('hidden');
        if (!this.messagesContainer.classList.contains('hidden')) {
            this.loadRecentChats();
        }
    },

    async loadRecentChats() {
        try {
            const response = await fetch('/api/messages/recent');
            if (response.ok) {
                const chats = await response.json();
                chats.forEach(chat => {
                    this.messages.set(chat.user.id, chat.messages);
                    if (chat.unread > 0) {
                        this.openChat(chat.user.id);
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load recent chats:', error);
        }
    },

    async openChat(userId) {
        if (this.activeChats.has(userId)) {
            this.focusChat(userId);
            return;
        }

        try {
            // Load user info and chat history
            const [userResponse, messagesResponse] = await Promise.all([
                fetch(`/api/users/${userId}`),
                fetch(`/api/messages/${userId}`)
            ]);

            if (!userResponse.ok || !messagesResponse.ok) {
                throw new Error('Failed to load chat data');
            }

            const user = await userResponse.json();
            const messages = await messagesResponse.json();

            // Create chat window
            const chatWindow = document.createElement('div');
            chatWindow.innerHTML = Templates.chatWindow(user);
            document.body.appendChild(chatWindow.firstElementChild);

            // Store chat window and messages
            const chatElement = document.body.lastElementChild;
            this.activeChats.set(userId, chatElement);
            this.messages.set(userId, messages);

            // Render messages
            this.renderMessages(userId);

            // Bind chat window events
            this.bindChatEvents(userId);

            // Focus chat
            this.focusChat(userId);

            // Mark messages as read
            this.markAsRead(userId);
        } catch (error) {
            console.error('Failed to open chat:', error);
        }
    },

    renderMessages(userId) {
        const messages = this.messages.get(userId) || [];
        const chatMessages = this.activeChats.get(userId).querySelector('.chat-messages');
        chatMessages.innerHTML = messages.map(msg => Templates.message(msg)).join('');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    },

    bindChatEvents(userId) {
        const chatWindow = this.activeChats.get(userId);

        // Close button
        chatWindow.querySelector('.close-chat').addEventListener('click', () => {
            this.closeChat(userId);
        });

        // Message form
        chatWindow.querySelector('.chat-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = e.target.querySelector('input[name="message"]');
            this.sendMessage(userId, input.value);
            input.value = '';
        });

        // Make chat window draggable
        this.makeDraggable(chatWindow);
    },

    makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        element.querySelector('.chat-header').onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    },

    async sendMessage(userId, content) {
        try {
            const response = await fetch(`/api/messages/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });

            if (response.ok) {
                const message = await response.json();
                this.handleNewMessage(message);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    },

    handleNewMessage(message) {
        const userId = message.sender.id === currentUser.id ? message.receiver.id : message.sender.id;
        
        // Store message
        if (!this.messages.has(userId)) {
            this.messages.set(userId, []);
        }
        this.messages.get(userId).push(message);

        // Open chat if not already open
        if (!this.activeChats.has(userId)) {
            this.openChat(userId);
        } else {
            // Update chat window
            const chatMessages = this.activeChats.get(userId).querySelector('.chat-messages');
            chatMessages.insertAdjacentHTML('beforeend', Templates.message(message));
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Update message count if message is received
        if (message.sender.id !== currentUser.id) {
            this.updateMessageCount(1);
            // Mark as read if chat is focused
            if (document.activeElement.closest('.chat-window') === this.activeChats.get(userId)) {
                this.markAsRead(userId);
            }
        }
    },

    updateMessageCount(increment = 1) {
        const badge = document.querySelector('.messages-count');
        if (badge) {
            const currentCount = parseInt(badge.textContent) || 0;
            badge.textContent = currentCount + increment;
            badge.classList.remove('hidden');
        }
    },

    async markAsRead(userId) {
        try {
            await fetch(`/api/messages/${userId}/read`, {
                method: 'POST',
            });
            this.updateMessageCount(-1);
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
        }
    },

    focusChat(userId) {
        const chatWindow = this.activeChats.get(userId);
        if (!chatWindow) return;

        // Bring to front
        document.querySelectorAll('.chat-window').forEach(window => {
            window.style.zIndex = '1000';
        });
        chatWindow.style.zIndex = '1001';

        // Focus input
        chatWindow.querySelector('input[name="message"]').focus();
    },

    closeChat(userId) {
        const chatWindow = this.activeChats.get(userId);
        if (chatWindow) {
            chatWindow.remove();
            this.activeChats.delete(userId);
        }
    }
}; 