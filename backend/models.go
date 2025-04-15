package backend

import "time"

type RegisterRequest struct {
	Nickname  string `json:"nickname"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Age       int    `json:"age"`
	Gender    string `json:"gender"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

type User struct {
	ID        string `json:"id"`
	Nickname  string `json:"nickname"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Age       int    `json:"age"`
	Gender    string `json:"gender"`
	Email     string `json:"email"`
	Password  string `json:"-"`
}

type Session struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	CreatedAt time.Time `json:"createdAt"`
	ExpiresAt time.Time `json:"expiresAt"`
}

type Post struct {
	ID              int       `json:"id"`
	UserID          string    `json:"userId"`
	Title           string    `json:"title"`
	Content         string    `json:"content"`
	Category        string    `json:"category"`
	CreatedAt       time.Time `json:"createdAt"`
	AuthorNickname  string    `json:"authorNickname"`
	AuthorFirstName string    `json:"authorFirstName"`
	AuthorLastName  string    `json:"authorLastName"`
	AuthorGender    string    `json:"authorGender"`
}

type Comment struct {
	ID              int       `json:"id"`
	PostID          int       `json:"postId"`
	UserID          string    `json:"userId"`
	Content         string    `json:"content"`
	CreatedAt       time.Time `json:"createdAt"`
	AuthorNickname  string    `json:"authorNickname"`
	AuthorFirstName string    `json:"authorFirstName"`
	AuthorLastName  string    `json:"authorLastName"`
	AuthorGender    string    `json:"authorGender"`
}
