const Posts = {
    currentCategory: 'all',
    posts: new Map(),

    init() {
        this.postsContainer = document.getElementById('posts-container');
        this.bindEvents();
        this.loadPosts();
    },

    bindEvents() {
        // Category selection
        document.querySelector('.categories-nav').addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const category = e.target.dataset.category;
                this.setActiveCategory(category);
                this.loadPosts(category);
            }
        });

        // Create post button
        document.querySelector('.create-post-btn').addEventListener('click', () => {
            this.showCreatePostForm();
        });

        // Post interactions
        this.postsContainer.addEventListener('click', (e) => {
            const postId = e.target.closest('.post')?.dataset.postId;
            if (!postId) return;

            if (e.target.closest('.like-btn')) {
                this.handleLike(postId);
            } else if (e.target.closest('.comment-btn')) {
                this.toggleComments(postId);
            }
        });

        // Comment form submissions
        this.postsContainer.addEventListener('submit', (e) => {
            if (e.target.classList.contains('comment-form')) {
                e.preventDefault();
                const postId = e.target.closest('.post').dataset.postId;
                const input = e.target.querySelector('input[name="comment"]');
                this.submitComment(postId, input.value);
                input.value = '';
            }
        });
    },

    setActiveCategory(category) {
        this.currentCategory = category;
        document.querySelectorAll('.categories-nav a').forEach(link => {
            link.classList.toggle('active', link.dataset.category === category);
        });
    },

    async loadPosts(category = this.currentCategory) {
        try {
            const response = await fetch(`/api/posts${category !== 'all' ? `?category=${category}` : ''}`);
            if (response.ok) {
                const posts = await response.json();
                this.postsContainer.innerHTML = '';
                posts.forEach(post => {
                    this.posts.set(post.id, post);
                    this.renderPost(post);
                });
            }
        } catch (error) {
            console.error('Failed to load posts:', error);
        }
    },

    renderPost(post, prepend = false) {
        const postHTML = Templates.post(post);
        if (prepend) {
            this.postsContainer.insertAdjacentHTML('afterbegin', postHTML);
        } else {
            this.postsContainer.insertAdjacentHTML('beforeend', postHTML);
        }
    },

    showCreatePostForm() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = Templates.createPostForm;
        document.body.appendChild(modal);
    },

    cancelPostForm() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
    },

    async handlePostSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        // Get the selected category
        const categoryCheckboxes = form.querySelectorAll('input[name="category"]:checked');
        let category = 'general'; // Default category
        
        if (categoryCheckboxes.length > 0) {
            category = categoryCheckboxes[0].value;
        }

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.get('title'),
                    content: formData.get('content'),
                    category: category,
                }),
            });

            if (response.ok) {
                const post = await response.json();
                this.handlePostUpdate(post);
                
                // Remove the modal
                const modal = document.querySelector('.modal');
                if (modal) {
                    modal.remove();
                }
            } else {
                const error = await response.text();
                this.showError(error);
            }
        } catch (error) {
            console.error('Failed to create post:', error);
            this.showError('Failed to create post. Please try again.');
        }
        
        return false;
    },

    async handleLike(postId) {
        try {
            const response = await fetch(`/api/posts/${postId}/like`, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();
                this.handleLikeUpdate(data);
            }
        } catch (error) {
            console.error('Failed to like post:', error);
        }
    },

    toggleComments(postId) {
        const post = document.querySelector(`.post[data-post-id="${postId}"]`);
        const commentsSection = post.querySelector('.comments-section');
        commentsSection.classList.toggle('hidden');

        if (!commentsSection.classList.contains('hidden') && !commentsSection.dataset.loaded) {
            this.loadComments(postId);
        }
    },

    async loadComments(postId) {
        try {
            const response = await fetch(`/api/posts/${postId}/comments`);
            if (response.ok) {
                const comments = await response.json();
                const post = document.querySelector(`.post[data-post-id="${postId}"]`);
                const commentsList = post.querySelector('.comments-list');
                commentsList.innerHTML = comments.map(comment => Templates.comment(comment)).join('');
                post.querySelector('.comments-section').dataset.loaded = 'true';
            }
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    },

    async submitComment(postId, content) {
        try {
            const response = await fetch(`/api/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });

            if (response.ok) {
                const comment = await response.json();
                this.handleCommentUpdate({ postId, comment });
            }
        } catch (error) {
            console.error('Failed to submit comment:', error);
        }
    },

    handlePostUpdate(post) {
        this.posts.set(post.id, post);
        const existingPost = document.querySelector(`.post[data-post-id="${post.id}"]`);
        
        if (existingPost) {
            existingPost.outerHTML = Templates.post(post);
        } else if (this.currentCategory === 'all' || this.currentCategory === post.category) {
            this.renderPost(post, true);
        }
    },

    handleCommentUpdate({ postId, comment }) {
        const post = document.querySelector(`.post[data-post-id="${postId}"]`);
        if (!post) return;

        const commentsList = post.querySelector('.comments-list');
        commentsList.insertAdjacentHTML('beforeend', Templates.comment(comment));

        // Update comment count
        const commentsCount = post.querySelector('.comments-count');
        commentsCount.textContent = parseInt(commentsCount.textContent) + 1;
    },

    handleLikeUpdate({ postId, likes }) {
        const post = document.querySelector(`.post[data-post-id="${postId}"]`);
        if (!post) return;

        const likesCount = post.querySelector('.likes-count');
        likesCount.textContent = likes;
    },

    showError(message) {
        // Implement error notification
        console.error(message);
        // You can add a toast notification system here
    }
}; 