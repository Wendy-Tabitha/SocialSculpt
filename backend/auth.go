package backend

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Nickname == "" || req.FirstName == "" || req.LastName == "" ||
		req.Age < 13 || req.Gender == "" || req.Email == "" || req.Password == "" {
		http.Error(w, "All fields are required and age must be at least 13", http.StatusBadRequest)
		return
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error processing password", http.StatusInternalServerError)
		return
	}

	// Generate UUID for user
	userID := uuid.New().String()

	// Insert the new user
	_, err = GetDB().Exec(`
        INSERT INTO users (id, nickname, first_name, last_name, age, gender, email, password) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		userID, req.Nickname, req.FirstName, req.LastName, req.Age, req.Gender, req.Email, string(hashedPassword))
	if err != nil {
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var loginData struct {
		Identifier string `json:"identifier"`
		Password   string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&loginData); err != nil {
		http.Error(w, "Invalid request format", http.StatusBadRequest)
		return
	}

	var user User
	err := GetDB().QueryRow(`
        SELECT id, nickname, first_name, last_name, age, gender, email, password 
        FROM users 
        WHERE nickname = ? OR email = ?`,
		loginData.Identifier, loginData.Identifier).
		Scan(&user.ID, &user.Nickname, &user.FirstName, &user.LastName,
			&user.Age, &user.Gender, &user.Email, &user.Password)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginData.Password)); err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Clear existing sessions for the user
	_, err = GetDB().Exec("DELETE FROM sessions WHERE user_id = ?", user.ID)
	if err != nil {
		http.Error(w, "Error clearing previous sessions", http.StatusInternalServerError)
		return
	}

	// Create new session
	sessionID := uuid.New().String()
	expiresAt := time.Now().Add(24 * time.Hour)

	_, err = GetDB().Exec("INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
		sessionID, user.ID, time.Now(), expiresAt)
	if err != nil {
		http.Error(w, "Error creating session", http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Expires:  expiresAt,
		Path:     "/",
		HttpOnly: true,
	})

	user.Password = ""
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "No session found", http.StatusUnauthorized)
		return
	}

	// Delete session from database
	_, err = GetDB().Exec("DELETE FROM sessions WHERE id = ?", cookie.Value)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Clear cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    "",
		Expires:  time.Now().Add(-1 * time.Hour),
		Path:     "/",
		HttpOnly: true,
	})

	w.WriteHeader(http.StatusOK)
}

func CheckSessionHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "No session found", http.StatusUnauthorized)
		return
	}

	var session Session
	err = GetDB().QueryRow("SELECT id, user_id, created_at, expires_at FROM sessions WHERE id = ?", cookie.Value).
		Scan(&session.ID, &session.UserID, &session.CreatedAt, &session.ExpiresAt)
	if err != nil {
		http.Error(w, "Invalid session", http.StatusUnauthorized)
		return
	}

	if time.Now().After(session.ExpiresAt) {
		// Delete expired session
		_, _ = GetDB().Exec("DELETE FROM sessions WHERE id = ?", session.ID)
		http.Error(w, "Session expired", http.StatusUnauthorized)
		return
	}

	var user User
	err = GetDB().QueryRow("SELECT id, nickname, first_name, last_name, age, gender, email FROM users WHERE id = ?", session.UserID).
		Scan(&user.ID, &user.Nickname, &user.FirstName, &user.LastName, &user.Age, &user.Gender, &user.Email)
	if err != nil {
		http.Error(w, "User  not found", http.StatusUnauthorized)
		return
	}

	json.NewEncoder(w).Encode(user)
}