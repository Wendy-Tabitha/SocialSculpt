package backend

// import (
// 	"encoding/json"
// 	"log"
// 	"net/http"
// 	"sync"
// 	"time"

// 	"github.com/gorilla/websocket"
// )

// var (
// 	upgrader = websocket.Upgrader{
// 		ReadBufferSize:  1024,
// 		WriteBufferSize: 1024,
// 		CheckOrigin: func(r *http.Request) bool {
// 			return true
// 		},
// 	}
// 	clients      = make(map[string]*Client)
// 	clientsMutex = sync.RWMutex{}
// )

// func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
// 	// Upgrade the HTTP connection to a WebSocket
// 	conn, err := upgrader.Upgrade(w, r, nil)
// 	if err != nil {
// 		log.Printf("WebSocket upgrade error: %v", err)
// 		return
// 	}

// 	// Ensure the connection is closed when the function returns
// 	defer conn.Close()

// 	// Retrieve the user ID from the query parameters
// 	userID := r.URL.Query().Get("userID")
// 	if userID == "" {
// 		log.Println("Missing userID in query parameters")
// 		return
// 	}

// 	// Create a new client instance
// 	client := &Client{
// 		ID:     userID,
// 		Conn:   conn,
// 		SendCh: make(chan []byte, 256), // Buffered channel to prevent blocking
// 	}

// 	// Register the client
// 	clientsMutex.Lock()
// 	clients[userID] = client
// 	clientsMutex.Unlock()

// 	// Start goroutines for reading and writing messages
// 	go client.readMessages()
// 	go client.writeMessages()
// }

// func (c *Client) readMessages() {
// 	defer func() {
// 		clientsMutex.Lock()
// 		delete(clients, c.ID)
// 		clientsMutex.Unlock()
// 		c.Conn.Close()
// 	}()

// 	for {
// 		_, msgData, err := c.Conn.ReadMessage()
// 		if err != nil {
// 			log.Println("Read error:", err)
// 			break
// 		}

// 		var incomingMsg Message
// 		if err := json.Unmarshal(msgData, &incomingMsg); err != nil {
// 			log.Println("Invalid message format:", err)
// 			continue
// 		}

// 		// Store the message in the database
// 		result, err := db.Exec(
// 			`INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, ?)`,
// 			c.ID, incomingMsg.ReceiverID, incomingMsg.Content, time.Now(),
// 		)
// 		if err != nil {
// 			log.Println("Failed to store message:", err)
// 			continue
// 		}

// 		// OK these errorrs in this file suggest that I have to handle ever data type scenario coming in from the different handlers. 
// 		messageID, err := result.LastInsertId()
// 		if err != nil {
// 			log.Println("Failed to retrieve message ID:", err)
// 			continue
// 		}

// 		var msg WSMessage
//         err = c.Conn.ReadJSON(&msg)
//         if err != nil {
//             log.Println("Read error:", err)
//             break
//         }

// 		// switch case to handle the different messages
// 		switch msg.Type {
// 		case "private_msg":
// 			// Create the message object to send
// 			msg.Data = handlePrivateMsg()
// 		default: 
// 			log.Println("Invalid message type:", msg.Type)
// 		}

// 		// Send the message to the recipient if they're connected
// 		clientsMutex.RLock()
// 		recipientClient, ok := clients[incomingMsg.ReceiverID]
// 		clientsMutex.RUnlock()
// 		if ok {
// 			msgBytes, err := json.Marshal(message)
// 			if err != nil {
// 				log.Println("Failed to marshal message:", err)
// 				continue
// 			}
// 			recipientClient.SendCh <- msgBytes
// 		}
// 	}
// }

// func (c *Client) writeMessages() {
// 	for msg := range c.SendCh {
// 		err := c.Conn.WriteMessage(websocket.TextMessage, msg)
// 		if err != nil {
// 			log.Println("Write error:", err)
// 			break
// 		}
// 	}
// }

// // The function will fetch data from one user and broadcast it to the intended recipient.
// func handlePrivateMsg() {
	
// }