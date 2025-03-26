package handlers

import (
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

func HandleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	// Insert user into database
	result, err := db.Exec(`
		INSERT INTO users (nickname, age, gender, first_name, last_name, email, password)
		VALUES (?, ?, ?, ?, ?, ?, ?)`,
		user.Nickname, user.Age, user.Gender, user.FirstName, user.LastName, user.Email, hashedPassword)
	if err != nil {
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	id, _ := result.LastInsertId()
	user.ID = int(id)
	user.Password = "" // Don't send password back

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var credentials struct {
		Login    string `json:"login"` // Can be either email or nickname
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var user User
	var hashedPassword string

	// Try to find user by email or nickname
	err := db.QueryRow(`
		SELECT id, nickname, password FROM users 
		WHERE email = ? OR nickname = ?`,
		credentials.Login, credentials.Login).Scan(&user.ID, &user.Nickname, &hashedPassword)
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(credentials.Password)); err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Create session token
	// In a real application, you would create a proper session token here

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":       user.ID,
		"nickname": user.Nickname,
		"message":  "Login successful",
	})
}

func HandlePosts(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		// Get all posts
		rows, err := db.Query(`
			SELECT p.id, p.user_id, p.title, p.content, p.category, p.created_at, u.nickname
			FROM posts p
			JOIN users u ON p.user_id = u.id
			ORDER BY p.created_at DESC`)
		if err != nil {
			http.Error(w, "Error fetching posts", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var posts []map[string]interface{}
		for rows.Next() {
			var post Post
			var nickname string
			var createdAt string
			err := rows.Scan(&post.ID, &post.UserID, &post.Title, &post.Content,
				&post.Category, &createdAt, &nickname)
			if err != nil {
				continue
			}
			posts = append(posts, map[string]interface{}{
				"id":        post.ID,
				"userId":    post.UserID,
				"title":     post.Title,
				"content":   post.Content,
				"category":  post.Category,
				"createdAt": createdAt,
				"nickname":  nickname,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(posts)

	case http.MethodPost:
		// Create new post
		var post Post
		if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		result, err := db.Exec(`
			INSERT INTO posts (user_id, title, content, category)
			VALUES (?, ?, ?, ?)`,
			post.UserID, post.Title, post.Content, post.Category)
		if err != nil {
			http.Error(w, "Error creating post", http.StatusInternalServerError)
			return
		}

		id, _ := result.LastInsertId()
		post.ID = int(id)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(post)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
