const Templates = {
    loginForm: `
        <div class="auth-container">
            <div class="auth-form login-form">
                <h2>Login</h2>
                <form id="login-form" >
                    <div class="form-group">
                        <input type="text" name="identifier" placeholder="Email or Nickname" required>
                    </div>
                    <div class="form-group">
                        <input type="password" name="password" placeholder="Password" required>
                    </div>
                    <button type="submit" class="btn-primary">Login</button>
                </form>
                <p>Don't have an account? <a href="#" onclick="Auth.showRegisterForm()">Register</a></p>
            </div>
        </div>
    `,

    registerForm: `
        <div class="auth-container">
            <div class="auth-form register-form">
                <h2>Register</h2>
                <form id="register-form">
                    <div class="form-group">
                        <input type="text" name="nickname" placeholder="Nickname" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <input type="text" name="firstName" placeholder="First Name" required>
                        </div>
                        <div class="form-group">
                            <input type="text" name="lastName" placeholder="Last Name" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <input type="number" name="age" placeholder="Age" min="13" required>
                        </div>
                        <div class="form-group">
                            <select name="gender" required>
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer-not">Prefer not to say</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <input type="email" name="email" placeholder="Email" required>
                    </div>
                    <div class="form-group">
                        <input type="password" name="password" placeholder="Password" required>
                        <small class="password-requirements">
                            Password must be at least 8 characters long and include uppercase, lowercase, number, and special character
                        </small>
                    </div>
                    <div class="form-group">
                        <input type="password" name="confirm_password" placeholder="Confirm Password" required>
                    </div>
                    <button type="submit" class="btn-primary">Register</button>
                </form>
                <p>Already have an account? <a href="#" onclick="Auth.showLoginForm()">Login</a></p>
            </div>
        </div>
    `,

    createPostForm: `
        <div class="create-post-form">
            <h2>Create New Post</h2>
            <form id="post-form" onsubmit="return Posts.handlePostSubmit(event)">
                <div class="form-group">
                    <input type="text" name="title" placeholder="Post Title" required>
                </div>
                <div class="form-group">
                    <div class="category-checkboxes">
                        <label class="category-checkbox">
                            <input type="checkbox" name="category" value="general">
                            <span>General</span>
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" name="category" value="tech">
                            <span>Technology</span>
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" name="category" value="creative">
                            <span>Creative Corner</span>
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" name="category" value="help">
                            <span>Help & Support</span>
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" name="category" value="food">
                            <span>Food</span>
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" name="category" value="sports">
                            <span>Sports</span>
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" name="category" value="lifestyle">
                            <span>Lifestyle</span>
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" name="category" value="beauty">
                            <span>Beauty</span>
                        </label>
                        <label class="category-checkbox">
                            <input type="checkbox" name="category" value="health">
                            <span>Health</span>
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <textarea name="content" placeholder="Write your post here..." required></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="cancel-post" onclick="Posts.cancelPostForm()">Cancel</button>
                    <button type="submit" class="btn-primary">Post</button>
                </div>
            </form>
        </div>
    `,

    post: (post) => `
        <div class="post" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${post.authorGender && post.authorGender.toLowerCase() === 'male' ? '/static/img/maleavatar.jpeg' : '/static/img/avatar.jpeg'}" 
                     alt="Avatar" 
                     class="post-avatar">
                <div class="post-meta">
                    <h3 class="post-title">${post.title}</h3>
                    <div class="post-info">
                        <span class="post-author">${post.authorNickname || `${post.authorFirstName} ${post.authorLastName}`}</span>
                        <span class="post-date">${new Date(post.createdAt).toLocaleString()}</span>
                        <span class="post-category">${post.category}</span>
                    </div>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <button class="like-btn" data-post-id="${post.id}">
                    <i class="fas fa-heart"></i>
                    <span class="likes-count">${post.likes || 0}</span>
                </button>
                <button class="comment-btn" data-post-id="${post.id}">
                    <i class="fas fa-comment"></i>
                    <span class="comments-count">${post.comments?.length || 0}</span>
                </button>
            </div>
            <div class="comments-section hidden">
                <div class="comments-list">
                    ${post.comments?.map(comment => Templates.comment(comment)).join('') || ''}
                </div>
                <form class="comment-form">
                    <input type="text" name="comment" placeholder="Write a comment..." required>
                    <button type="submit"><i class="fas fa-paper-plane"></i></button>
                </form>
            </div>
        </div>
    `,

    comment: (comment) => `
        <div class="comment" data-comment-id="${comment.id}">
            <img src="${comment.authorGender && comment.authorGender.toLowerCase() === 'male' ? '/static/img/maleavatar.jpeg' : '/static/img/avatar.jpeg'}" 
                 alt="Avatar" 
                 class="comment-avatar">
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${comment.authorNickname || `${comment.authorFirstName} ${comment.authorLastName}`}</span>
                    <span class="comment-date">${new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p class="comment-text">${comment.content}</p>
            </div>
        </div>
    `,

    friendRequest: (request) => `
        <div class="friend-request" data-request-id="${request.id}">
            <img src="${request.sender.avatar || '/static/img/default-avatar.png'}" alt="Avatar" class="request-avatar">
            <div class="request-info">
                <span class="request-username">${request.sender.username}</span>
                <div class="request-actions">
                    <button class="accept-request" data-request-id="${request.id}">Accept</button>
                    <button class="decline-request" data-request-id="${request.id}">Decline</button>
                </div>
            </div>
        </div>
    `,

    contact: (contact) => `
        <div class="contact ${contact.online ? 'online' : ''}" data-user-id="${contact.id}">
            <img src="${contact.avatar || '/static/img/default-avatar.png'}" alt="Avatar" class="contact-avatar">
            <div class="contact-info">
                <span class="contact-username">${contact.username}</span>
                <span class="contact-status">${contact.online ? 'Online' : 'Offline'}</span>
            </div>
        </div>
    `,

    message: (message) => `
        <div class="message ${message.sender.id === currentUser.id ? 'sent' : 'received'}" data-message-id="${message.id}">
            <div class="message-content">
                <p class="message-text">${message.content}</p>
                <span class="message-time">${new Date(message.created_at).toLocaleString()}</span>
            </div>
        </div>
    `,

    chatWindow: (contact) => `
        <div class="chat-window" data-user-id="${contact.id}">
            <div class="chat-header">
                <img src="${contact.avatar || '/static/img/default-avatar.png'}" alt="Avatar" class="chat-avatar">
                <span class="chat-username">${contact.username}</span>
                <button class="close-chat"><i class="fas fa-times"></i></button>
            </div>
            <div class="chat-messages">
                <!-- Messages will be injected here -->
            </div>
            <form class="chat-form">
                <input type="text" name="message" placeholder="Type a message..." required>
                <button type="submit"><i class="fas fa-paper-plane"></i></button>
            </form>
        </div>
    `
};

// Add Auth object for handling authentication
const Auth = {
    init() {
        // Hide forum content immediately
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.classList.add('hidden');
        }
        
        // Check if user is already logged in
        const user = localStorage.getItem('user');
        if (user) {
            this.verifySession().then(isValid => {
                if (isValid) {
                    this.showForumContent();
                } else {
                    localStorage.removeItem('user');
                    this.showLoginForm();
                }
            });
        } else {
            this.showLoginForm();
        }
    },

    async verifySession() {
        try {
            const response = await fetch('/api/check-session', {
                method: 'GET',
                credentials: 'include'
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    },

    showLoginForm() {
        // Ensure forum content is hidden
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.classList.add('hidden');
        }
        
        // Remove any existing auth forms
        const existingAuth = document.querySelector('.auth-container');
        if (existingAuth) {
            existingAuth.remove();
        }
        
        // Show login form
        document.body.insertAdjacentHTML('beforeend', Templates.loginForm);
        
        // Add form validation feedback
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    },

    showRegisterForm() {
        // Remove any existing auth forms
        const existingAuth = document.querySelector('.auth-container');
        if (existingAuth) {
            existingAuth.remove();
        }
        
        // Show register form
        document.body.insertAdjacentHTML('beforeend', Templates.registerForm);
        
        // Add form validation feedback
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
            
            // Add real-time password validation
            const passwordInput = registerForm.querySelector('input[name="password"]');
            const confirmPasswordInput = registerForm.querySelector('input[name="confirm_password"]');
            
            if (passwordInput && confirmPasswordInput) {
                const validatePasswords = () => {
                    const password = passwordInput.value;
                    const confirmPassword = confirmPasswordInput.value;
                    
                    if (password !== confirmPassword) {
                        confirmPasswordInput.setCustomValidity('Passwords do not match');
                    } else {
                        confirmPasswordInput.setCustomValidity('');
                    }
                    
                    if (!this.validatePassword(password)) {
                        passwordInput.setCustomValidity('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
                    } else {
                        passwordInput.setCustomValidity('');
                    }
                };
                
                passwordInput.addEventListener('input', validatePasswords);
                confirmPasswordInput.addEventListener('input', validatePasswords);
            }
        }
    },

    showForumContent() {
        // Remove auth container if it exists
        const authContainer = document.querySelector('.auth-container');
        if (authContainer) {
            authContainer.remove();
        }
        
        // Show the main forum content
        const appContainer = document.querySelector('.app-container');
        if (appContainer) {
            appContainer.classList.remove('hidden');
        }

        // Show posts container
        const postsContainer = document.getElementById('posts-container');
        if (postsContainer) {
            postsContainer.classList.remove('hidden');
        }

        // Load initial posts
        Posts.loadPosts();
    },

    async handleLogin(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const data = {
            identifier: formData.get('identifier'),
            password: formData.get('password')
        };

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('user', JSON.stringify(user));
                this.showForumContent();
            } else {
                const error = await response.text();
                this.showError(error);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('An error occurred during login');
        }
        return false;
    },

    async handleRegister(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        // Validate password match
        if (formData.get('password') !== formData.get('confirm_password')) {
            this.showError('Passwords do not match');
            return false;
        }

        // Validate password requirements
        const password = formData.get('password');
        if (!this.validatePassword(password)) {
            this.showError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
            return false;
        }

        const data = {
            nickname: formData.get('nickname'),
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            age: parseInt(formData.get('age')),
            gender: formData.get('gender'),
            email: formData.get('email'),
            password: password
        };

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Registration successful, automatically show login form
                this.showLoginForm();
            } else {
                const error = await response.text();
                this.showError(error);
            }
        } catch (error) {
            this.showError('An error occurred during registration');
        }
        return false;
    },

    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    },

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const form = document.querySelector('.auth-form');
        if (form) {
            form.insertBefore(errorDiv, form.firstChild);
            setTimeout(() => errorDiv.remove(), 3000);
        }
    },

    async logout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                // Clear user data from localStorage
                localStorage.removeItem('user');
                
                // Hide forum content
                const appContainer = document.querySelector('.app-container');
                if (appContainer) {
                    appContainer.classList.add('hidden');
                }
                
                // Show login form
                this.showLoginForm();
            } else {
                const error = await response.text();
                this.showError(error);
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showError('An error occurred during logout');
        }
    }
};

// Initialize authentication when the page loads
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});

// Prevent direct access to forum content
window.addEventListener('load', () => {
    const user = localStorage.getItem('user');
    if (!user) {
        Auth.showLoginForm();
    }
});