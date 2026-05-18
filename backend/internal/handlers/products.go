package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"pos-fiscal/internal/database"
	"pos-fiscal/internal/models"
)

func GetProducts(c *gin.Context) {
	var products []models.Product

	category := c.Query("category")
	search := c.Query("search")

	query := database.DB

	if category != "" && category != "all" {
		query = query.Where("category = ?", category)
	}

	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	result := query.Find(&products)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": result.Error.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, products)
}

func GetProduct(c *gin.Context) {
	var product models.Product

	id := c.Param("id")

	result := database.DB.First(&product, id)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Producto no encontrado",
		})
		return
	}

	c.JSON(http.StatusOK, product)
}

// Actualizar producto (Editar o cambiar disponibilidad)
func UpdateProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product

	// 1. Buscamos el producto original en la base de datos
	if err := database.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Producto no encontrado"})
		return
	}

	// 2. Creamos un "molde" temporal para recibir los datos de React de forma segura
	var reqData struct {
		Name      string  `json:"name"`
		Category  string  `json:"category"`
		Price     float64 `json:"price"`
		Stock     int     `json:"stock"`
		Available bool    `json:"available"`
		ImageURL  string  `json:"image_url"`
	}

	if err := c.BindJSON(&reqData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 3. LA MAGIA: Usamos Select() para OBLIGAR a GORM a guardar todo,
	// incluso si el stock es 0 o el Available es false.
	database.DB.Model(&product).Select("Name", "Price", "Stock", "Available", "ImageURL", "Category").Updates(models.Product{
		Name:      reqData.Name,
		Category:  reqData.Category,
		Price:     reqData.Price,
		Stock:     reqData.Stock,
		Available: reqData.Available,
		ImageURL:  reqData.ImageURL,
	})

	// 4. Devolvemos un OK para que React actualice la pantalla
	c.JSON(http.StatusOK, product)
}

// Borrar producto permanentemente
func DeleteProduct(c *gin.Context) {
	id := c.Param("id")
	database.DB.Delete(&models.Product{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Producto eliminado exitosamente"})
}

// Crear un nuevo producto
func CreateProduct(c *gin.Context) {
	var product models.Product

	// Leemos los datos que vienen desde el formulario de React
	if err := c.BindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Por defecto, todo producto nuevo nace disponible
	product.Available = true

	// Guardamos en la base de datos
	if err := database.DB.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear el producto"})
		return
	}

	c.JSON(http.StatusCreated, product)
}
