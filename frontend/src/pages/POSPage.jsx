import {
  ShoppingCart,
  Search,
  Receipt,
  Package,
  X,
  Plus,
  Minus,
  History,
  CreditCard,
  Banknote,
  Smartphone,
  LogOut
} from "lucide-react"

import { useEffect, useMemo, useState } from "react"
import api from "../services/api"
import useCartStore from "../store/useCartStore"
import toast from "react-hot-toast"
import { printTicket, printInvoice } from "../utils/printer"
import AdminPanel from "../components/AdminPanel"
import SalesHistory from "../components/SalesHistory"

// CONEXIÓN OFFLINE
import { saveOfflineSale } from "../offline/db"

function POSPage() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [view, setView] = useState("pos") 

  // ESTADO DE CONEXIÓN CON EL BACKEND DE GO
  const [backendOnline, setBackendOnline] = useState(true)

  // ESTADOS DEL CHECKOUT
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerLastName, setCustomerLastName] = useState("") 
  const [customerDocument, setCustomerDocument] = useState("")
  const [paymentType, setPaymentType] = useState("Efectivo") 

  // ESTADOS PARA LA TARJETA
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")

  const {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    decreaseQuantity,
  } = useCartStore()

  const fetchProducts = () => {
    api.get("/products")
      .then((res) => {
        setProducts(res.data)
        setBackendOnline(true) 
      })
      .catch((err) => {
        console.error(err)
        setBackendOnline(false) 
      });
  };

  useEffect(() => {
    fetchProducts();

    const interval = setInterval(() => {
      api.get("/products")
        .then(() => setBackendOnline(true))
        .catch(() => setBackendOnline(false))
    }, 5000);

    return () => clearInterval(interval); 
  }, []);

  useEffect(() => {
    if (!backendOnline) {
      setPaymentType("Efectivo");
    }
  }, [backendOnline]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (product.available === false) return false;
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" ? true : product.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const total = useMemo(() => {
    return cart.reduce((acc, item) => {
      return acc + item.price * item.quantity
    }, 0)
  }, [cart])

  const categories = [
    "all",
    ...new Set(products.map((p) => p.category)),
  ]

  // VALIDACIONES EN TIEMPO REAL
  const isCardValid = paymentType !== "Tarjeta" || (cardNumber.length === 16 && cardExpiry.length === 5 && cardCvc.length === 3);
  const isCustomerValid = customerName.trim() !== "" && customerLastName.trim() !== "" && customerDocument.length >= 7;

  const handleConfirmSale = async (tipoComprobante) => { 
    // 🚀 MAGIA ANTI-BLOQUEO: Abrimos la ventana inmediatamente al hacer clic
    const printWindow = window.open('', '_blank');
    
    // Si Chrome bloqueó el pop-up agresivamente, avisamos al cajero
    if (!printWindow) {
      toast.error("Por favor, habilita los pop-ups en tu navegador para imprimir.");
      return;
    }

    const nombreCompleto = `${customerName} ${customerLastName}`.trim();

    const saleData = {
      total: total,
      payment_type: paymentType, 
      customer_name: nombreCompleto,         
      customer_document: customerDocument, 
      receipt_type: tipoComprobante,
      items: cart.map(item => ({
        ID: item.ID,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    };

    try {
      const res = await api.post("/sales", saleData);

      toast.success("Venta registrada con éxito");
      setBackendOnline(true) 
      const saleId = res.data.ID;

      // Le pasamos la ventana abierta a nuestras funciones de impresión
      if (tipoComprobante === 'factura') {
        printInvoice(printWindow, cart, total, nombreCompleto, customerDocument, paymentType, saleId);
      } else {
        printTicket(printWindow, cart, total, saleId); 
      }

      clearCart(); 
      fetchProducts();
      setShowCheckoutModal(false);

    } catch (error) {
      console.warn("Servidor caído. Activando contingencia Offline...");
      setBackendOnline(false) 

      if (paymentType !== "Efectivo") {
        toast.error("Error: Los pagos digitales requieren conexión. Seleccione Efectivo.");
        printWindow.close(); // Cerramos la pestaña vacía porque se canceló la venta
        return; 
      }

      try {
        await saveOfflineSale(saleData);
        
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-amber-950 border border-amber-800 p-4 rounded-xl shadow-lg flex items-center gap-3 text-amber-200`}>
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold">Modo Offline (Solo Efectivo)</p>
              <p className="text-xs text-amber-300/80">Venta en efectivo guardada localmente en el navegador.</p>
            </div>
          </div>
        ));

        // En offline, también usamos la ventana abierta
        if (tipoComprobante === 'factura') {
          printInvoice(printWindow, cart, total, nombreCompleto, customerDocument, paymentType, "OFFLINE");
        } else {
          printTicket(printWindow, cart, total, "OFFLINE"); 
        }

        clearCart();
        setShowCheckoutModal(false);

      } catch (dbErr) {
        toast.error("Error crítico al guardar en IndexedDB");
        console.error(dbErr);
        printWindow.close(); // Cerramos si hubo un error crítico
      }
    } finally {
      if (paymentType === "Efectivo" || backendOnline) {
        setCustomerName("");
        setCustomerLastName(""); 
        setCustomerDocument("");
        setPaymentType("Efectivo");
        setCardNumber("");
        setCardExpiry("");
        setCardCvc("");
      }
    }
  };

  return (
    <div className="h-screen bg-zinc-950 text-white flex relative overflow-hidden">
      
      {/* MODAL DE CHECKOUT */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[24px] w-full max-w-[450px] shadow-2xl overflow-y-auto max-h-[95vh]">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-black">Confirmar Pago</h2>
              <button onClick={() => setShowCheckoutModal(false)} className="text-zinc-400 hover:text-white p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition"><X size={20} /></button>
            </div>
            
            <div className="bg-zinc-950 rounded-2xl p-4 text-center mb-5 border border-zinc-800 shadow-inner">
              <p className="text-zinc-500 font-bold uppercase mb-1 text-xs">Monto Total a Cobrar</p>
              <p className="text-5xl font-black text-green-400">${total.toFixed(2)}</p>
            </div>

            <div className="mb-5">
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-[11px] text-zinc-500 font-bold uppercase block">Método de Pago</label>
                {!backendOnline && <span className="text-[10px] text-amber-500 font-black uppercase tracking-wider animate-pulse">⚠️ Servidor Caído</span>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setPaymentType("Efectivo")} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl font-bold transition border text-sm ${paymentType === "Efectivo" ? 'bg-white text-black border-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}><Banknote size={20} />Efectivo</button>
                <button type="button" onClick={() => setPaymentType("Tarjeta")} disabled={!backendOnline} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl font-bold transition border text-sm ${!backendOnline ? 'bg-zinc-950/40 border-zinc-900/50 text-zinc-600 cursor-not-allowed opacity-20 select-none' : paymentType === "Tarjeta" ? 'bg-white text-black border-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}><CreditCard size={20} />Tarjeta</button>
                <button type="button" onClick={() => setPaymentType
