package main

import (
	"log"
	"net/http"
	"realtime-forum/backend/handlers"
	"sync"

	"github.com/gorilla/websocket"
	_ "github.com/mattn/go-sqlite3"
)

var (
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow all origins for development
		},
	}
	clients    = make(map[*websocket.Conn]string) // map to store client connections
	clientsMux sync.Mutex
)

type Message struct {
	Type    string      `json:"type"`
	Content interface{} `json:"content"`
}

func main() {
	// Initialize the database and create tables
	handlers.InitDB()

	// Create static file servers for different directories
	staticFiles := http.FileServer(http.Dir("frontend/static"))
	imageFiles := http.FileServer(http.Dir("frontend/static/img"))

	// Handle static file routes
	http.Handle("/static/", http.StripPrefix("/static/", staticFiles))
	http.Handle("/img/", http.StripPrefix("/img/", imageFiles))

	// API routes
	http.HandleFunc("/", serveHome)
	http.HandleFunc("/ws", handleConnections)
	http.HandleFunc("/api/register", handlers.HandleRegister)
	http.HandleFunc("/api/login", handlers.HandleLogin)
	http.HandleFunc("/api/posts", handlers.HandlePosts)

	log.Println("Server starting on http://localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func serveHome(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	http.ServeFile(w, r, "frontend/templates/index.html")
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error upgrading connection: %v", err)
		return
	}
	defer ws.Close()

	clientsMux.Lock()
	clients[ws] = ""
	clientsMux.Unlock()

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("Error reading message: %v", err)
			clientsMux.Lock()
			delete(clients, ws)
			clientsMux.Unlock()
			break
		}

		// Handle different message types
		switch msg.Type {
		case "chat":
			broadcastMessage(msg)
		case "status":
			updateUserStatus(ws, msg)
		}
	}
}

func broadcastMessage(msg Message) {
	clientsMux.Lock()
	defer clientsMux.Unlock()

	for client := range clients {
		err := client.WriteJSON(msg)
		if err != nil {
			log.Printf("Error broadcasting message: %v", err)
			client.Close()
			delete(clients, client)
		}
	}
}

func updateUserStatus(ws *websocket.Conn, msg Message) {
	clientsMux.Lock()
	clients[ws] = msg.Content.(string)
	clientsMux.Unlock()
}
