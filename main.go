package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"socialsculpt/backend"
)

func main() {
	// Initialize database
	db, err := backend.InitDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Static files
	fs := http.FileServer(http.Dir("frontend/static"))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// API routes
	http.HandleFunc("/api/register", backend.RegisterHandler)
	http.HandleFunc("/api/login", backend.LoginHandler)
	http.HandleFunc("/api/logout", backend.LogoutHandler)
	// http.HandleFunc("/api/ws/messages/recent", backend.PrivateMessagesHandler)
	// http.HandleFunc("/api/ws", backend.WebSocketHandler)
	http.HandleFunc("/api/check-session", backend.CheckSessionHandler)
	http.HandleFunc("/api/posts", backend.GetPostsHandler)
	http.HandleFunc("/api/posts/my", backend.GetUserPosts)
	http.HandleFunc("/api/friend/request", backend.SendFriendRequest)
	http.HandleFunc("/api/friend/accept", backend.AcceptFriendRequest)
	http.HandleFunc("/api/friend/remove", backend.RemoveFriend)
	// http.HandleFunc("/api/messages/recent", backend.LatestMessagesHandler)
	http.HandleFunc("/api/user/profile", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			backend.UserProfileHandler(w, r)
		} else if r.Method == http.MethodPut {
			backend.UpdateUserProfileHandler(w, r)
		} else if r.Method == http.MethodDelete {
			backend.DeleteUserAccountHandler(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc("/api/posts/", func(w http.ResponseWriter, r *http.Request) {
		if len(r.URL.Path) > len("/api/posts/") {
			pathParts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/posts/"), "/")
			if len(pathParts) == 2 && pathParts[1] == "comments" {
				postId := pathParts[0]
				if r.Method == http.MethodGet {
					backend.FetchCommentsHandler(w, r, postId)
				} else if r.Method == http.MethodPost {
					backend.CreateCommentHandler(w, r, postId)
				} else {
					http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
				}
				return
			} else if len(pathParts) == 2 && pathParts[1] == "like" {
				postId := pathParts[0]
				if r.Method == http.MethodPost {
					backend.LikePostHandler(w, r, postId)
				} else {
					http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
				}
				return
			}
		}
		http.NotFound(w, r)
	})

	http.HandleFunc("/api/comments/", func(w http.ResponseWriter, r *http.Request) {
		if len(r.URL.Path) > len("/api/comments/") {
			pathParts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/comments/"), "/")
			if len(pathParts) == 3 && pathParts[0] == "replies" && pathParts[2] == "like" {
				replyId := pathParts[1]
				if r.Method == http.MethodPost {
					backend.LikeReplyHandler(w, r, replyId)
				} else {
					http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
				}
				return
			} else if len(pathParts) == 2 && pathParts[1] == "like" {
				commentId := pathParts[0]
				if r.Method == http.MethodPost {
					backend.LikeCommentHandler(w, r, commentId)
				} else {
					http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
				}
				return
			} else if len(pathParts) == 2 && pathParts[1] == "replies" {
				commentId := pathParts[0]
				if r.Method == http.MethodGet {
					backend.FetchRepliesHandler(w, r, commentId)
				} else if r.Method == http.MethodPost {
					backend.CreateReplyHandler(w, r, commentId)
				} else {
					http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
				}
				return
			}
		}
		http.NotFound(w, r)
	})

	// Register the route for fetching online users
	http.HandleFunc("/api/users/online", backend.FetchOnlineUsers)

	// Register the routes for fetching messages and user details for the chat section
	http.HandleFunc("/api/messages/", func(w http.ResponseWriter, r *http.Request) {
		pathParts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/messages/"), "/")
		userId := pathParts[0]
		backend.FetchMessagesHandler(w, r, userId)
	})
	http.HandleFunc("/api/users/", func(w http.ResponseWriter, r *http.Request) {
		pathParts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/users/"), "/")
		userId := pathParts[0]
		backend.FetchUserHandler(w, r, userId)
	})
	http.HandleFunc("/api/messages/send/", func(w http.ResponseWriter, r *http.Request) {
		pathParts := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/messages/send/"), "/")
		recipent_id := pathParts[0]
		backend.SendMessageHandler(w, r, recipent_id)
	})

	// Main template route
	http.HandleFunc("/", backend.ServeTemplate)

	port := os.Getenv("PORT")
	if port == "" {
		port = "33333"
	}
	port = ":" + port
	fmt.Printf("Server starting on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
