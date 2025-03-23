# Real-time Forum

A modern real-time forum application built with Go and WebSocket technology. Features include user authentication, real-time messaging, post creation and interaction, and a beautiful dark-themed UI.

## Features

- User registration and authentication
- Post creation and interaction
- Story sharing
- Friend requests
- Modern dark theme UI
- WebSocket-based real-time updates

## Prerequisites

- Go 1.21 or higher
- SQLite3

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Wendy-Tabitha/SocialSculpt.git
cd SocialSculpt
```

1. Start the server:
```bash
go run .
```

2. Open your browser and navigate to:
```
http://localhost:8080
```

## Project Structure

```
realtime-forum/
├── main.go              # Main application entry point
├── handlers.go          # HTTP request handlers
├── go.mod              # Go module file
├── forum.db            # SQLite database
├── frontend/
│   ├── static/
│   │   ├── css/        # Stylesheets
│   │   ├── js/         # JavaScript files
│   │   └── img/        # Images and assets
│   └── templates/
│       └── index.html  # Main HTML template
└── README.md
```

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
- `WS /ws` - WebSocket endpoint for real-time communication

## WebSocket Events

- `chat` - Real-time chat messages
- `post` - New post notifications
- `status` - User online/offline status updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 