package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"pos-fiscal/internal/database"
	"pos-fiscal/internal/handlers"
)

func main() {

	// Conectar base de datos
	database.Connect()

	// Crear servidor Gin
	r := gin.Default()

	// Configuración CORS
	config := cors.DefaultConfig()

	// URL del frontend en Vercel
	config.AllowOrigins = []string{
		"http://localhost:5173",                  // desarrollo local
		"https://sistema-pos-fiscal.vercel.app/", // cambiar después
	}

	config.AllowMethods = []string{
		"GET",
		"POST",
		"PUT",
		"DELETE",
		"OPTIONS",
	}

	config.AllowHeaders = []string{
		"Origin",
		"Content-Type",
		"Authorization",
	}

	r.Use(cors.New(config))

	// Grupo API
	api := r.Group("/api")
	{
		// Auth
		api.POST("/login", handlers.Login)

		// Productos
		api.GET("/products", handlers.GetProducts)
		api.GET("/products/:id", handlers.GetProduct)
		api.POST("/products", handlers.CreateProduct)
		api.PUT("/products/:id", handlers.UpdateProduct)
		api.DELETE("/products/:id", handlers.DeleteProduct)

		// Ventas
		api.POST("/sales", handlers.CreateSale)
		api.GET("/sales", handlers.GetSales)
		api.GET("/sales/:id", handlers.GetSale)

		// Facturación
		api.POST("/invoice", handlers.GenerateInvoice)
	}

	// Puerto dinámico para Railway
	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	log.Println("Servidor corriendo en puerto:", port)

	log.Fatal(r.Run(":" + port))
}
