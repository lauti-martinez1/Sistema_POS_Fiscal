package handlers

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func GenerateInvoice(c *gin.Context) {
	// SIMULACIÓN DOCUMENTOS AFIP

	// 1. Generamos un número de CAE falso aleatorio de 14 dígitos
	rand.Seed(time.Now().UnixNano())
	caeSimulado := fmt.Sprintf("74%012d", rand.Int63n(1000000000000))

	// 2. Simulamos un delay de red de 300 milisegundos para que parezca real
	time.Sleep(300 * time.Millisecond)

	// 3. Log para ver en la terminal que se ejecutó
	fmt.Println("--- [MOCK AFIP] CAE Otorgado con éxito:", caeSimulado)

	// 4. Respondemos solo el JSON limpio (sin generar archivos PDF)
	c.JSON(http.StatusOK, gin.H{
		"status":      "success",
		"environment": "testing_mock",
		"mensaje":     "Factura procesada (Simulador AFIP activo)",
		"cae":         caeSimulado,
	})
}
