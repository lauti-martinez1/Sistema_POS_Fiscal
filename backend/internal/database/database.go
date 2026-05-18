package database

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"pos-fiscal/internal/models"
)

var DB *gorm.DB

func Connect() {

	err := godotenv.Load()

	if err != nil {
		panic("Error loading .env")
	}

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})

	if err != nil {
		panic(err)
	}

	DB = db

	// Crear tablas automáticamente
	DB.AutoMigrate(
		&models.Product{},
		&models.Sale{},
	)
}
