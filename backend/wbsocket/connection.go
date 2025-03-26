package wbsocket

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
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

func HandleConnections(w http.ResponseWriter, r *http.Request) {
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
