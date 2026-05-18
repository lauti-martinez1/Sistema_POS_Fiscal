package services

func ProcessSale() {

	go func() {
		GenerateInvoice()
	}()

	go func() {
		PrintTicket()
	}()

	go func() {
		SendEmail()
	}()
}
