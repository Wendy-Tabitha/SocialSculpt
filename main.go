package main

import (
	"log"
	"net/http"

	"realtime-forum/backend/handlers"
	"realtime-forum/backend/wbsocket"

	_ "github.com/mattn/go-sqlite3"
)

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
	http.HandleFunc("/ws", wbsocket.HandleConnections)
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
