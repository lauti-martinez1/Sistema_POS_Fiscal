package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"pos-fiscal/internal/database"
	"pos-fiscal/internal/models"
)

type CreateSaleRequest struct {
	Total            float64    `json:"total" binding:"required"`
	PaymentType      string     `json:"payment_type" binding:"required"`
	CustomerName     string     `json:"customer_name"`
	CustomerDocument string     `json:"customer_document"`
	ReceiptType      string     `json:"receipt_type"`
	Items            []SaleItem `json:"items"`
}

type SaleItem struct {
	ID       uint    `json:"ID"`
	Name     string  `json:"name"`
	Price    float64 `json:"price"`
	Quantity int     `json:"quantity"`
}

// 1. Crear una venta nueva y descontar stock
func CreateSale(c *gin.Context) {
	var req CreateSaleRequest

	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// 🛑 CANDADO DE STOCK: Revisamos si hay mercadería ANTES de hacer cualquier cosa
	for _, item := range req.Items {
		var prod models.Product
		// Buscamos el producto en MySQL por su ID
		if err := database.DB.First(&prod, item.ID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Producto no encontrado",
			})
			return
		}
		// Si el stock actual es menor a lo que el cliente quiere comprar... ¡lo rebotamos!
		if prod.Stock < item.Quantity {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "¡Se quedaron sin stock de " + prod.Name + "!",
			})
			return
		}
	}

	// Convertir items a JSON
	itemsJSON, _ := json.Marshal(req.Items)

	sale := models.Sale{
		Total:            req.Total,
		PaymentType:      req.PaymentType,
		CustomerName:     req.CustomerName,
		CustomerDocument: req.CustomerDocument,
		ReceiptType:      req.ReceiptType,
		Items:            string(itemsJSON),
	}

	result := database.DB.Create(&sale)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": result.Error.Error(),
		})
		return
	}

	// Descontar stock de la base de datos
	for _, item := range req.Items {
		database.DB.Model(&models.Product{}).
			Where("id = ?", item.ID).
			Update("stock", gorm.Expr("stock - ?", item.Quantity))
	}

	c.JSON(http.StatusCreated, sale)
}

// 2. Traer todas las ventas (Para el Historial de la Caja)
func GetSales(c *gin.Context) {
	var sales []models.Sale

	result := database.DB.
		Order("created_at DESC").
		Find(&sales)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": result.Error.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, sales)
}

// 3. Traer una venta específica por ID (Por si querés reimprimir un ticket después)
func GetSale(c *gin.Context) {
	var sale models.Sale

	id := c.Param("id")

	result := database.DB.First(&sale, id)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Venta no encontrada",
		})
		return
	}

	c.JSON(http.StatusOK, sale)
}
