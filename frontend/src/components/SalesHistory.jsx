import { useEffect, useState } from "react";
import api from "../services/api";
import { TrendingUp, ReceiptText, CalendarDays, Wallet, Printer } from "lucide-react";
import { printTicket, printInvoice } from "../utils/printer"; 
import toast from "react-hot-toast";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  
  const obtenerFechaLocal = () => {
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset() * 60000;
    return new Date(hoy.getTime() - offset).toISOString().split("T")[0];
  };

  const [selectedDate, setSelectedDate] = useState(obtenerFechaLocal());

  useEffect(() => {
    api.get("/sales")
      .then((res) => setSales(res.data || []))
      .catch((err) => console.error("Error al cargar ventas", err));
  }, []);

  const filteredSales = selectedDate
    ? sales.filter((sale) => sale.CreatedAt.startsWith(selectedDate))
    : sales;

  const totalDelDia = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
  const totalHistorico = sales.reduce((acc, sale) => acc + sale.total, 0);

  const handleReprint = (sale, tipo) => {
    // 🚀 Abrimos la ventana inmediatamente al hacer clic
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast.error("Por favor, habilita los pop-ups en el navegador para imprimir.");
      return;
    }

    const cartItems = sale.items ? JSON.parse(sale.items) : [];

    if (tipo === 'factura') {
      printInvoice(
        printWindow, 
        cartItems, 
        sale.total, 
        sale.customer_name, 
        sale.customer_document, 
        sale.payment_type, 
        sale.ID
      );
    } else {
      printTicket(printWindow, cartItems, sale.total, sale.ID);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-3xl p-4 md:p-8 shadow-2xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-black">Cierre de Caja</h2>
        
        <div className="flex items-center gap-2 text-zinc-400 bg-zinc-950 px-4 py-3 md:py-2 rounded-xl border border-zinc-800 focus-within:border-zinc-500 transition w-full md:w-auto">
          <CalendarDays size={20} />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent outline-none font-bold text-zinc-300 cursor-pointer w-full"
            style={{ colorScheme: "dark" }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-green-900 to-green-700 rounded-3xl p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-2xl border border-green-600/30 gap-6">
          <div>
            <p className="text-green-100 mb-1 md:mb-2 text-base md:text-lg font-bold">
              {selectedDate === obtenerFechaLocal() ? "Recaudación de Hoy" : "Recaudación del Día Seleccionado"}
            </p>
            <h1 className="text-4xl md:text-6xl font-black text-white">${totalDelDia.toFixed(2)}</h1>
            <p className="text-green-200 mt-1 md:mt-2 font-semibold text-sm md:text-base">
              {filteredSales.length} {filteredSales.length === 1 ? "venta registrada" : "ventas registradas"}
            </p>
          </div>
          <div className="bg-green-800/50 p-4 md:p-6 rounded-full self-end sm:self-auto hidden sm:block">
            <TrendingUp size={40} className="text-green-300 md:w-[48px] md:h-[48px]" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl p-6 md:p-8 flex flex-col justify-center shadow-2xl border border-zinc-700">
          <div className="flex items-center gap-2 md:gap-3 text-zinc-400 mb-1 md:mb-2">
            <Wallet size={20} className="md:w-[24px] md:h-[24px]" />
            <p className="text-base md:text-lg font-bold">Total Histórico</p>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white">${totalHistorico.toFixed(2)}</h2>
          <p className="text-zinc-500 mt-1 md:mt-2 text-xs md:text-sm font-semibold">Todas las ventas acumuladas</p>
        </div>
      </div>

      <h3 className="text-lg md:text-xl font-bold mb-4 text-zinc-400 border-b border-zinc-800 pb-2">
        Detalle de Tickets
      </h3>
      
      <div className="space-y-4">
        {filteredSales.length === 0 ? (
          <div className="text-center py-10 bg-zinc-800/50 rounded-2xl border border-zinc-800 border-dashed">
            <p className="text-zinc-500 italic text-base md:text-lg">No hay ventas registradas en esta fecha.</p>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <div key={sale.ID} className="bg-zinc-800 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center border border-zinc-700/50 hover:border-zinc-600 transition gap-4 md:gap-0">
              
              <div className="flex items-start md:items-center gap-3 md:gap-5 w-full md:w-auto">
                <div className="flex gap-2 shrink-0 mt-1 md:mt-0">
                  {sale.receipt_type === 'factura' ? (
                    <button 
                      onClick={() => handleReprint(sale, 'factura')}
                      className="bg-zinc-900 p-2 md:p-3 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-zinc-700 transition border border-zinc-800 hover:border-zinc-600"
                      title="Reimprimir Factura (A4)"
                    >
                      <Printer size={20} className="md:w-[22px] md:h-[22px]" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleReprint(sale, 'ticket')}
                      className="bg-zinc-900 p-2 md:p-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-700 transition border border-zinc-800 hover:border-zinc-600"
                      title="Reimprimir Ticket"
                    >
                      <ReceiptText size={20} className="md:w-[22px] md:h-[22px]" />
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-bold text-base md:text-lg text-white mb-1">
                    Venta #{sale.ID}
                    {sale.customer_name && (
                      <span className="ml-2 text-xs md:text-sm text-zinc-400 font-normal block sm:inline">
                        - {sale.customer_name}
                      </span>
                    )}
                  </p>
                  <div className="text-xs md:text-sm text-zinc-400 flex flex-wrap items-center gap-2 mt-1 md:mt-0">
                    <span className="truncate max-w-[200px] sm:max-w-none">
                      {sale.items ? (
                        JSON.parse(sale.items).map(i => `${i.quantity}x ${i.name}`).join(", ")
                      ) : (
                        "Sin detalle"
                      )}
                    </span>
                    <span className="text-[10px] md:text-xs bg-zinc-700 px-2 py-0.5 rounded text-white font-bold tracking-wider">
                      {sale.payment_type.toUpperCase()}
                    </span>
                    <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded font-bold tracking-wider ${sale.receipt_type === 'factura' ? 'bg-blue-900/50 text-blue-400 border border-blue-800/50' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}>
                      {sale.receipt_type === 'factura' ? 'FACTURA' : 'TICKET'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center md:block w-full md:w-auto border-t md:border-t-0 border-zinc-700/50 pt-3 md:pt-0">
                <p className="text-xs text-zinc-500 md:hidden">
                  {new Date(sale.CreatedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <div className="text-right">
                  <p className="text-xl md:text-2xl font-black text-green-400">${sale.total.toFixed(2)}</p>
                  <p className="text-xs text-zinc-500 mt-1 hidden md:block">
                    {new Date(sale.CreatedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}