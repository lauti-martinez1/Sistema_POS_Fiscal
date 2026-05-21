package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Creamos la estructura para poder leer el mail y clave que vienen de la pantalla
type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var req LoginRequest

	// Leemos los datos que mandó el usuario en el formulario
	if err := c.BindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Datos inválidos",
		})
		return
	}

	// FILTRO DE CREDENCIALES FIJAS
	isValidUser := (req.Email == "usuario@gmail.com" && req.Password == "1234") ||
		(req.Email == "admin@gmail.com" && req.Password == "admin123")

	if !isValidUser {
		// Si no coincide ninguno, devuelve un 401 (No autorizado) y el cartel de error
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Usuario o contraseña incorrectos",
		})
		return
	}

	// Si los datos son correctos, le devuelve el OK y el token falso
	c.JSON(http.StatusOK, gin.H{
		"message": "login ok",
		"token":   "token-falso-de-prueba-rotiseria-uda", // El Frontend guarda esto en el localStorage
		"user":    req.Email,
	})
}
