// mainApp.js
const mainAppHTML = `
    <header class="main-header">
        <div class="header-left">
            <img src="../static/img/forum.png" class="header-logo">
            <div class="header-search">
                <i class="material-icons">search</i>
                <input type="text" placeholder="Search Forum">
            </div>
        </div>
        <div class="header-right">
            <div class="header-icons">
                <div class="icon-badge">
                    <i class="material-icons">mail</i>
                    <span class="badge">4</span>
                </div>
                <div class="icon-badge">
                    <i class="material-icons">notifications</i>
                    <span class="badge">3</span>
                </div>
            </div>
            <div class="user-profile">
                <img src="../static/img/avatar.jpeg" class="profile-img">
            </div>
        </div>
    </header>

    <div class="app">
        <div class="sidebar">
            <nav class="nav-menu">
                <a href="#" class="nav-item active">
                    <i class="material-icons">home</i>
                    <span>Home</span>
                </a>
                <a href="#" class="nav-item create-post-btn">
                    <i class="material-icons">add_circle</i>
                    <span>Create Post</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="material-icons">people</i>
                    <span>People</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="material-icons">event</i>
                    <span>Event</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="material-icons">pages</i>
                    <span>Pages</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="material-icons">group</i>
                    <span>Group</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="material-icons">store</i>
                    <span>Marketplace</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="material-icons">bookmark</i>
                    <span>Saved</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="material-icons">favorite</i>
                    <span>Favorites</span>
                </a>
                <a href="#" class="nav-item">
                    <i class="material-icons">settings</i>
                    <span>Settings</span>
                </a>
                <a href="#" class="nav-item logout-btn" style="margin-top: auto;">
                    <i class="material-icons">logout</i>
                    <span>Logout</span>
                </a>
            </nav>
        </div>

        <div class="main-content">
            <div class="stories-section">
                <div class="story-card add-story">
                    <div class="add-story-button">
                        <i class="material-icons">add</i>
                    </div>
                    <span>Add Story</span>
                </div>
                <!-- Story cards will be added here dynamically -->
            </div>

            <div class="post-creation">
                <div class="post-input">
                    <img src="../static/img/avatar.jpeg" alt="" class="user-avatar" id="current-user-avatar">
                    <input type="text" placeholder="Write something...">
                </div>
                <div class="post-actions">
                    <button class="action-btn">
                        <i class="material-icons">videocam</i>
                        Live
                    </button>
                    <button class="action-btn">
                        <i class="material-icons">photo_camera</i>
                        Photo/Video
                    </button>
                    <button class="action-btn">
                        <i class="material-icons">mood</i>
                        Feeling/Activity
                    </button>
                </div>
            </div>

            <div class="posts-feed" id="posts-container">
                <!-- Posts will be added here dynamically -->
            </div>
        </div>

        <div class="right-sidebar">
            <div class="friend-requests">
                <h3>Requests <span class="request-count">2</span></h3>
                <div class="request-list">
                    <!-- Friend requests will be added here dynamically -->
                </div>
            </div>

            <div class="contacts">
                <h3>Contacts</h3>
                <div class="contact-list">
                    <!-- Contacts will be added here dynamically -->
                </div>
            </div>
        </div>
    </div>
`;

document.getElementById('main-app').innerHTML = mainAppHTML;

// Add logout functionality
document.querySelector('.logout-btn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    try {
        const response = await fetch('/api/logout', {
            method: 'POST',
            credentials: 'include' // Important: This ensures cookies are sent with the request
        });

        if (response.ok) {
            // Redirect to login page after successful logout
            window.location.href = '/login';
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect to login page even if there's an error
        window.location.href = '/login';
    }
});