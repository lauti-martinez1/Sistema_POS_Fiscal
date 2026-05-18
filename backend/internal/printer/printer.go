package printer

import "fmt"

func PrintTicket(total float64) {
	fmt.Println("====================")
	fmt.Println("      TICKET")
	fmt.Println("====================")
	fmt.Println("TOTAL:", total)
}
