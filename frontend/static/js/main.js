// WebSocket connection
const socket = new WebSocket('ws://' + window.location.host + '/ws');

// Authentication state
let authToken = localStorage.getItem('authToken');
const mainApp = document.getElementById('main-app');
const authContainer = document.getElementById('auth-container');

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        // Verify token with server
        verifyToken(authToken);
    } else {
        showAuthContainer();
    }
});

// Show/hide main app and auth container
function showMainApp() {
    mainApp.style.display = 'block';
    authContainer.style.display = 'none';
    console.log('Showing main app, loading data...'); // Debug log
    loadInitialData();
}

function showAuthContainer() {
    mainApp.style.display = 'none';
    authContainer.style.display = 'flex';
}

// Verify token with server
async function verifyToken(token) {
    try {
        const response = await fetch('/api/verify-token', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            currentUser = userData;
            showMainApp();
            connectWebSocket();
        } else {
            // Token is invalid or expired
            localStorage.removeItem('authToken');
            showAuthContainer();
        }
    } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('authToken');
        showAuthContainer();
    }
}

// Auth form submission
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                login: formData.get('login'),
                password: formData.get('password')
            })
        });

        if (response.ok) {
            const data = await response.json();
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data;
            showMainApp();
            connectWebSocket();
        } else {
            const errorData = await response.json();
            showError('Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Login failed. Please try again.');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(registerForm);
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nickname: formData.get('nickname'),
                age: parseInt(formData.get('age')),
                gender: formData.get('gender'),
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password')
            })
        });

        if (response.ok) {
            showSuccess('Registration successful! Please login.');
            // Switch to login tab
            loginTab.click();
            // Clear the register form
            registerForm.reset();
        } else {
            const errorData = await response.json();
            showError(errorData.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('Registration failed. Please try again.');
    }
});

// Auth form switching
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginSection = document.getElementById('login-form');
const registerSection = document.getElementById('register-form');

loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginSection.style.display = 'flex';
    registerSection.style.display = 'none';
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerSection.style.display = 'flex';
    loginSection.style.display = 'none';
});

// Logout functionality
const logoutBtn = document.querySelector('.logout-btn');
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    showAuthContainer();
});

// Handle WebSocket messages
function handleWebSocketMessage(message) {
    switch (message.type) {
        case 'chat':
            addMessageToChat(message.content);
            break;
        case 'post':
            addPostToFeed(message.content);
            break;
        case 'status':
            updateUserStatus(message.content);
            break;
    }
}

// Posts
function loadInitialData() {
    console.log('Loading initial data...'); // Debug log
    loadPosts();
    loadContacts();
    loadFriendRequests();
}

async function loadPosts() {
    try {
        const response = await fetch('/api/posts', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const posts = await response.json();
            const postsContainer = document.getElementById('posts-container');
            postsContainer.innerHTML = '';
            posts.forEach(post => addPostToFeed(post));
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function addPostToFeed(post) {
    const postsContainer = document.getElementById('posts-container');
    const postElement = document.createElement('div');
    postElement.className = 'post';

    let mediaHtml = '';
    if (post.media && post.media.length > 0) {
        mediaHtml = `
            <div class="post-media">
                ${post.media.map(media => {
                    if (media.type.startsWith('image/')) {
                        return `<img src="${media.url}" alt="Post media" class="post-image">`;
                    }
                    return '';
                }).join('')}
            </div>
        `;
    }

    postElement.innerHTML = `
        <div class="post-header">
            <img src="/img/avatars/${post.userId}.jpg" alt="" class="user-avatar">
            <div class="post-info">
                <h4>${post.nickname}</h4>
                <span>${new Date(post.createdAt).toLocaleString()}</span>
            </div>
        </div>
        <div class="post-content">
            <p>${post.content}</p>
            ${mediaHtml}
        </div>
        <div class="post-actions">
            <button class="action-btn">
                <i class="material-icons">thumb_up</i>
                Like
            </button>
            <button class="action-btn">
                <i class="material-icons">comment</i>
                Comment
            </button>
            <button class="action-btn">
                <i class="material-icons">share</i>
                Share
            </button>
        </div>
    `;
    postsContainer.prepend(postElement);
}

// Create post
const postInput = document.querySelector('.post-input input');
postInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && postInput.value.trim()) {
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    content: postInput.value.trim(),
                    userId: currentUser.id
                })
            });

            if (response.ok) {
                const post = await response.json();
                socket.send(JSON.stringify({
                    type: 'post',
                    content: post
                }));
                postInput.value = '';
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    }
});

// Contacts and Friend Requests
async function loadContacts() {
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            const contactList = document.querySelector('.contact-list');
            contactList.innerHTML = '';
            
            console.log('Loaded users:', users); // Debug log
            
            users.forEach(user => {
                if (user.id !== currentUser.id) {
                    const contactItem = document.createElement('div');
                    contactItem.className = 'contact-item';
                    contactItem.dataset.userId = user.id;
                    
                    contactItem.innerHTML = `
                        <img src="../static/img/avatar/${user.id}.jpg" alt="${user.nickname}" class="contact-avatar" onerror="this.src='/img/default-avatar.png'">
                        <div class="contact-info">
                            <div class="contact-name">${user.nickname}</div>
                            <div class="contact-status">${user.status || 'Offline'}</div>
                        </div>
                        <button class="contact-options-btn">
                            <i class="material-icons">more_horiz</i>
                        </button>
                    `;
                    
                    // Add click event for options button
                    const optionsBtn = contactItem.querySelector('.contact-options-btn');
                    optionsBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        showContactOptions(e, user);
                    });
                    
                    contactList.appendChild(contactItem);
                }
            });
        } else {
            console.error('Failed to load contacts:', response.status);
        }
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

function showContactOptions(event, user) {
    const menu = document.querySelector('.contact-options-menu');
    const rect = event.currentTarget.getBoundingClientRect();
    
    // Position the menu
    menu.style.display = 'block';
    menu.style.top = `${rect.bottom + window.scrollY}px`;
    menu.style.left = `${rect.left - menu.offsetWidth + rect.width}px`;
    
    // Add event listeners for menu items
    const followBtn = menu.querySelector('.follow-btn');
    const hideBtn = menu.querySelector('.hide-btn');
    
    const handleFollow = async () => {
        try {
            const response = await fetch(`/api/follow/${user.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (response.ok) {
                showSuccess('Successfully followed user');
            } else {
                showError('Failed to follow user');
            }
        } catch (error) {
            console.error('Error following user:', error);
            showError('Failed to follow user');
        }
        hideContactOptions();
    };
    
    const handleHide = async () => {
        try {
            const response = await fetch(`/api/hide-contact/${user.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            
            if (response.ok) {
                const contactItem = document.querySelector(`.contact-item[data-user-id="${user.id}"]`);
                contactItem.style.display = 'none';
                showSuccess('Contact hidden');
            } else {
                showError('Failed to hide contact');
            }
        } catch (error) {
            console.error('Error hiding contact:', error);
            showError('Failed to hide contact');
        }
        hideContactOptions();
    };
    
    followBtn.onclick = handleFollow;
    hideBtn.onclick = handleHide;
    
    // Close menu when clicking outside
    document.addEventListener('click', hideContactOptions);
}

function hideContactOptions() {
    const menu = document.querySelector('.contact-options-menu');
    menu.style.display = 'none';
    document.removeEventListener('click', hideContactOptions);
}

async function loadFriendRequests() {
    // Implementation for loading friend requests
    const requestList = document.querySelector('.request-list');
    // Add friend request elements to the list
}

// Stories
function createStoryCard(story) {
    const storiesSection = document.querySelector('.stories-section');
    const storyCard = document.createElement('div');
    storyCard.className = 'story-card';
    storyCard.style.backgroundImage = `url(${story.image})`;
    storyCard.innerHTML = `
        <div class="story-header">
            <img src="/static/img/avatars/${story.userId}.jpg" alt="" class="user-avatar">
            <span>${story.nickname}</span>
        </div>
    `;
    storiesSection.appendChild(storyCard);
}

// Initialize WebSocket connection
connectWebSocket();

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message show';
    successDiv.textContent = message;
    
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Add the new message
    const activeForm = document.querySelector('.auth-form:not([style*="display: none"])');
    activeForm.insertBefore(successDiv, activeForm.firstChild);
    
    // Remove the message after 3 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message show';
    errorDiv.textContent = message;
    
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.success-message, .error-message');
    existingMessages.forEach(msg => msg.remove());
    
    // Add the new message
    const activeForm = document.querySelector('.auth-form:not([style*="display: none"])');
    activeForm.insertBefore(errorDiv, activeForm.firstChild);
    
    // Remove the message after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
} 