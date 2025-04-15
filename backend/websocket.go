package backend

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow all origins in development
		},
	}
	clients   = make(map[*websocket.Conn]string) // websocket -> userID
	clientsMu sync.Mutex
)

func WebsocketHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "No session found", http.StatusUnauthorized)
		return
	}

	var userID string
	err = GetDB().QueryRow("SELECT user_id FROM sessions WHERE id = ?", cookie.Value).Scan(&userID)
	if err != nil {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	clientsMu.Lock()
	clients[conn] = userID
	clientsMu.Unlock()

	go handleWebSocket(conn, userID)
}

func handleWebSocket(conn *websocket.Conn, userID string) {
	defer func() {
		clientsMu.Lock()
		delete(clients, conn)
		clientsMu.Unlock()
		conn.Close()
	}()

	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			return
		}

		// Handle different types of messages
		var message map[string]interface{}
		if err := json.Unmarshal(p, &message); err != nil {
			continue
		}

		// Broadcast message to relevant clients based on message type
		clientsMu.Lock()
		for client, clientUserID := range clients {
			if messageType == websocket.TextMessage {
				if err := client.WriteMessage(messageType, p); err != nil {
					log.Printf("Error sending message to user %s: %v", clientUserID, err)
				}
			}
		}
		clientsMu.Unlock()
	}
}
