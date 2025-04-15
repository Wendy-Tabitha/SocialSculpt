package main

import (
	"fmt"
	"log"
	"net/http"

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
	http.HandleFunc("/api/ws", backend.WebsocketHandler)
	http.HandleFunc("/api/check-session", backend.CheckSessionHandler)
	http.HandleFunc("/api/posts", backend.GetPostsHandler)
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

	// Main template route
	http.HandleFunc("/", backend.ServeTemplate)

	port := ":8080"
	fmt.Printf("Server starting on http://localhost%s\n", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
