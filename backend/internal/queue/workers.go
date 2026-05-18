package queue

import "fmt"

func StartWorkers() {

	go func() {

		for saleID := range SalesQueue {

			fmt.Println("Procesando venta:", saleID)

			// generar factura
			// imprimir ticket
			// enviar email
		}

	}()
}
