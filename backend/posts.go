package backend

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"
)

func GetPostsHandler(w http.ResponseWriter, r *http.Request) {
	// Check for session cookie
	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Verify session exists in database
	var session Session
	err = GetDB().QueryRow("SELECT id, user_id, created_at, expires_at FROM sessions WHERE id = ?", cookie.Value).
		Scan(&session.ID, &session.UserID, &session.CreatedAt, &session.ExpiresAt)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if session is expired
	if time.Now().After(session.ExpiresAt) {
		// Delete expired session
		_, err = GetDB().Exec("DELETE FROM sessions WHERE id = ?", session.ID)
		if err != nil {
			log.Printf("Error deleting expired session: %v", err)
		}
		http.Error(w, "Session expired", http.StatusUnauthorized)
		return
	}

	// Handle different HTTP methods
	if r.Method == http.MethodGet {
		// Get category from query parameters
		category := r.URL.Query().Get("category")

		// Build query based on category
		query := `
			SELECT p.id, p.title, p.content, p.likes, p.comment_count, p.category, p.created_at, p.user_id,
				   u.nickname as author_nickname, u.first_name as author_first_name, u.last_name as author_last_name,
				   u.gender as author_gender
			FROM posts p
			JOIN users u ON p.user_id = u.id
		`
		if category != "" && category != "all" {
			query += " WHERE p.category = ?"
		}
		query += " ORDER BY p.created_at DESC"

		// Execute query
		var rows *sql.Rows
		if category != "" && category != "all" {
			rows, err = GetDB().Query(query, category)
		} else {
			rows, err = GetDB().Query(query)
		}
		if err != nil {
			log.Printf("Error querying posts: %v", err)
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// Collect posts
		var posts []Post
		for rows.Next() {
			var post Post
			err := rows.Scan(
				&post.ID,
				&post.Title,
				&post.Content,
				&post.Likes,
				&post.CommentCount,
				&post.Category,
				&post.CreatedAt,
				&post.UserID,
				&post.AuthorNickname,
				&post.AuthorFirstName,
				&post.AuthorLastName,
				&post.AuthorGender,
			)
			if err != nil {
				log.Printf("Error scanning post: %v", err)
				continue
			}
			posts = append(posts, post)
		}

		// Return posts as JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(posts)
	} else if r.Method == http.MethodPost {
		// Create a new post
		var postData struct {
			Title    string `json:"title"`
			Content  string `json:"content"`
			Category string `json:"category"`
		}

		if err := json.NewDecoder(r.Body).Decode(&postData); err != nil {
			http.Error(w, "Invalid request format", http.StatusBadRequest)
			return
		}

		// Validate required fields
		if postData.Title == "" || postData.Content == "" || postData.Category == "" {
			http.Error(w, "Title, content, and category are required", http.StatusBadRequest)
			return
		}

		// Insert the new post
		result, err := GetDB().Exec(`
			INSERT INTO posts (user_id, title, content, category, created_at) 
			VALUES (?, ?, ?, ?, ?)`,
			session.UserID, postData.Title, postData.Content, postData.Category, time.Now())
		if err != nil {
			log.Printf("Error creating post: %v", err)
			http.Error(w, "Error creating post", http.StatusInternalServerError)
			return
		}

		// Get the ID of the newly created post
		postID, err := result.LastInsertId()
		if err != nil {
			log.Printf("Error getting post ID: %v", err)
			http.Error(w, "Error creating post", http.StatusInternalServerError)
			return
		}

		// Get the created post with author information
		var post Post
		err = GetDB().QueryRow(`
			SELECT p.id, p.title, p.content, p.category, p.created_at, p.user_id,
				   u.nickname as author_nickname, u.first_name as author_first_name, u.last_name as author_last_name,
				   u.gender as author_gender
			FROM posts p
			JOIN users u ON p.user_id = u.id
			WHERE p.id = ?`,
			postID).
			Scan(&post.ID, &post.Title, &post.Content, &post.Category, &post.CreatedAt, &post.UserID,
				&post.AuthorNickname, &post.AuthorFirstName, &post.AuthorLastName, &post.AuthorGender)
		if err != nil {
			log.Printf("Error retrieving created post: %v", err)
			http.Error(w, "Error creating post", http.StatusInternalServerError)
			return
		}

		// Return the created post as JSON
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(post)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func LikePostHandler(w http.ResponseWriter, r *http.Request, postIdStr string) {
	// vars := mux.Vars(r)

	cookie, err := r.Cookie("session_id")
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Verify session exists in database
	var session Session
	err = GetDB().QueryRow("SELECT id, user_id, created_at, expires_at FROM sessions WHERE id = ?", cookie.Value).
		Scan(&session.ID, &session.UserID, &session.CreatedAt, &session.ExpiresAt)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Check if session is expired
	if time.Now().After(session.ExpiresAt) {
		// Delete expired session
		_, err = GetDB().Exec("DELETE FROM sessions WHERE id = ?", session.ID)
		if err != nil {
			log.Printf("Error deleting expired session: %v", err)
		}
		http.Error(w, "Session expired", http.StatusUnauthorized)
		return
	}

	postID, err := strconv.Atoi(postIdStr) // strconv.Atoi(vars["postId"])
	if err != nil {
		http.Error(w, "Invalid post ID", http.StatusBadRequest)
		return
	}

	var userId string
	err = GetDB().QueryRow(`
    SELECT user_id 
    FROM sessions 
    WHERE id = ?`, cookie.Value).Scan(&userId)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "User not found", http.StatusNotFound)
			fmt.Println("User not found for userID:", cookie.Value)
		} else {
			http.Error(w, "Failed to fetch user id", http.StatusInternalServerError)
			fmt.Println("Error querying user id:", err)
		}
		return
	}

	found, eRr := checkUserLikedPost(postID, userId)
	if found {
		err = removeRowFromTable("posts_likes", postID, userId)
		if err != nil {
			http.Error(w, "Failed to unlike post", http.StatusInternalServerError)
			return
		}
	} else {
		err = incrementPostLikes(postID, userId)
		if err != nil {
			http.Error(w, "Failed to like post", http.StatusInternalServerError)
			return
		}
	}
	if eRr != nil {
		http.Error(w, "Failed to unlike post", http.StatusInternalServerError)
		return
	}

	likes, err := getPostLikes(postID)
	if err != nil {
		http.Error(w, "Failed to retrieve like count", http.StatusInternalServerError)
		return
	}

	// Respond with the updated like count
	response := map[string]interface{}{
		"postId": postID,
		"likes":  likes,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// function to check whether the user had liked a post
func checkUserLikedPost(postID int, userID string) (bool, error) {
	query := `SELECT COUNT(*) FROM posts_likes WHERE post_id = ? AND user_id = ?`
	var count int

	err := db.QueryRow(query, postID, userID).Scan(&count)
	if err != nil {
		return false, err
	}

	if count > 0 {
		return true, nil
	}
	return false, nil
}

func removeRowFromTable(tableName string, postID int, userID string) error {
	query := fmt.Sprintf("DELETE FROM %s WHERE post_id = ? AND user_id = ?", tableName)

	_, err := db.Exec(query, postID, userID)
	if err != nil {
		return fmt.Errorf("failed to remove row from table %s: %v", tableName, err)
	}

	return nil
}

func incrementPostLikes(postID int, userID string) error {

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %v", err)
	}

	query := `UPDATE posts SET likes = likes + 1 WHERE id = ?`
	_, err = tx.Exec(query, postID)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to increment likes: %v", err)
	}

	query = `INSERT INTO posts_likes (post_id, user_id) VALUES (?, ?)`
	_, err = tx.Exec(query, postID, userID)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to add row to posts_likes table: %v", err)
	}

	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("failed to commit transaction: %v", err)
	}
	return nil
}

// getPostLikes retrieves the current like count for a post from the database
func getPostLikes(postID int) (int, error) {
	var likes int
	query := `SELECT likes FROM posts WHERE id = ?`
	err := db.QueryRow(query, postID).Scan(&likes)
	return likes, err
}
