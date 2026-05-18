package models

import "gorm.io/gorm"

type Sale struct {
	gorm.Model
	Total            float64 `json:"total"`
	PaymentType      string  `json:"payment_type"`
	CustomerName     string  `json:"customer_name"`     // ¡NUEVO!
	CustomerDocument string  `json:"customer_document"` // ¡NUEVO! (DNI o CUIT)
	ReceiptType      string  `json:"receipt_type"`
	Items            string  `json:"items"`
}
