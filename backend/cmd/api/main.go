package main

import (
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

	// Habilitar CORS
	r.Use(cors.Default())

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

	// Levantar servidor
	r.Run(":8080")
}
