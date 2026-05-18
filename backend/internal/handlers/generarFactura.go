package handlers

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"

	// Comentamos tu paquete de AFIP por ahora para que no te pida credenciales
	// "pos-fiscal/internal/afip"

	"github.com/gin-gonic/gin"
	"github.com/johnfercher/maroto/pkg/consts"
	"github.com/johnfercher/maroto/pkg/pdf"
	"github.com/johnfercher/maroto/pkg/props"
)

func GenerateInvoice(c *gin.Context) {
	// 1. Definimos el monto (a futuro lo leerás del carrito de React)
	montoTotal := 15000.0

	// ==========================================
	//  ZONA DE SIMULACIÓN AFIP (MODO PRUEBA)
	// ==========================================

	// Generamos un número de CAE falso aleatorio de 14 dígitos (formato estándar de AFIP)
	rand.Seed(time.Now().UnixNano())
	// Los CAE reales suelen empezar con 7 o 6 según el tipo
	caeSimulado := fmt.Sprintf("74%012d", rand.Int63n(1000000000000))

	// Simulamos un delay de red de 300 milisegundos para que parezca real
	time.Sleep(300 * time.Millisecond)

	// Log para que veas en la consola de Go lo que está pasando
	fmt.Println("--- [MOCK AFIP] Autorizando factura por $", montoTotal)
	fmt.Println("--- [MOCK AFIP] CAE Otorgado con éxito:", caeSimulado)

	// ==========================================

	// 3. ¡Empezamos a dibujar el PDF con Maroto usando el CAE simulado!
	m := pdf.NewMaroto(consts.Portrait, consts.A4)

	// Título principal avisando que es simulación
	m.Row(10, func() {
		m.Col(12, func() {
			m.Text("FACTURA ELECTRÓNICA (ENTORNO DE PRUEBA)", props.Text{
				Top:   3,
				Style: consts.Bold,
				Align: consts.Center,
			})
		})
	})

	// Detalle del total
	m.Row(10, func() {
		m.Col(12, func() {
			m.Text(fmt.Sprintf("Total Facturado: $%.2f", montoTotal), props.Text{
				Top:   5,
				Align: consts.Left,
			})
		})
	})

	// Imprimimos el CAE de mentira en el documento
	m.Row(10, func() {
		m.Col(12, func() {
			m.Text(fmt.Sprintf("CAE N°: %s (MOCK)", caeSimulado), props.Text{
				Top:   5,
				Style: consts.Bold,
				Align: consts.Left,
			})
		})
	})

	// 4. Guardamos el archivo PDF en el servidor
	nombreArchivo := fmt.Sprintf("factura_simulada_%s.pdf", caeSimulado)
	err := m.OutputFileAndClose(nombreArchivo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Error al generar archivo PDF: " + err.Error(),
		})
		return
	}

	// 5. Le respondemos a React. El frontend ni se va a enterar de que es un clon.
	c.JSON(http.StatusOK, gin.H{
		"status":      "success",
		"environment": "testing_mock",
		"mensaje":     "Factura procesada (Simulador AFIP activo)",
		"cae":         caeSimulado,
		"archivo":     nombreArchivo,
	})
}
