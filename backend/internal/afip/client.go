package afip

import (
	"bytes"
	"encoding/json"
	"net/http"
)

type InvoiceRequest struct {
	Total float64 `json:"total"`
}

func AuthorizeInvoice(total float64) (string, error) {

	payload := InvoiceRequest{
		Total: total,
	}

	body, _ := json.Marshal(payload)

	_, err := http.Post(
		"https://api.afip.gob.ar/facturacion",
		"application/json",
		bytes.NewBuffer(body),
	)

	if err != nil {
		return "", err
	}

	return "CAE123456789", nil
}
