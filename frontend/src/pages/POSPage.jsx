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

      if (tipoComprobante === 'factura') {
        printInvoice(cart, total, nombreCompleto, customerDocument, paymentType, saleId);
      } else {
        // Le agregamos el saleId al final
        printTicket(cart, total, saleId); 
      }

      clearCart(); 
      fetchProducts();
      setShowCheckoutModal(false);

    } catch (error) {
      console.warn("Servidor caído. Activando contingencia Offline...");
      setBackendOnline(false) 

      if (paymentType !== "Efectivo") {
        toast.error("Error: Los pagos digitales requieren conexión. Seleccione Efectivo.");
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

        if (tipoComprobante === 'factura') {
          printInvoice(cart, total, nombreCompleto, customerDocument, paymentType, "OFFLINE");
        } else {
          // Le avisamos explícitamente que es OFFLINE
          printTicket(cart, total, "OFFLINE"); 
        }

        clearCart();
        setShowCheckoutModal(false);

      } catch (dbErr) {
        toast.error("Error crítico al guardar en IndexedDB");
        console.error(dbErr);
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
                <button type="button" onClick={() => setPaymentType("Transferencia")} disabled={!backendOnline} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl font-bold transition border text-sm ${!backendOnline ? 'bg-zinc-950/40 border-zinc-900/50 text-zinc-600 cursor-not-allowed opacity-20 select-none' : paymentType === "Transferencia" ? 'bg-white text-black border-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}><Smartphone size={20} />Transferencia</button>
              </div>
            </div>

            {/* FORMULARIO DE TARJETA */}
            {paymentType === "Tarjeta" && (
              <div className="mb-5 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                <label className="text-[11px] text-zinc-500 font-bold uppercase mb-3 block">Datos de la Tarjeta</label>
                <div className="space-y-3">
                  <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} className="w-full bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl text-white outline-none focus:border-zinc-400 transition text-sm tracking-widest text-center" placeholder="0000 0000 0000 0000" />
                  <div className="flex gap-3">
                    <input type="text" value={cardExpiry} onChange={(e) => { let val = e.target.value.replace(/\D/g, ''); if (val.length > 2) { val = val.slice(0, 2) + '/' + val.slice(2, 4); } setCardExpiry(val); }} className="w-1/2 bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl text-white outline-none focus:border-zinc-400 transition text-sm tracking-widest text-center" placeholder="MM/AA" />
                    <input type="text" value={cardCvc} onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))} className="w-1/2 bg-zinc-900 border border-zinc-700 p-2.5 rounded-xl text-white outline-none focus:border-zinc-400 transition text-sm tracking-widest text-center" placeholder="CVC" />
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="text-[11px] text-zinc-500 font-bold uppercase mb-1 block ml-1">Datos del Cliente (Para Factura)</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-zinc-500 transition text-sm" placeholder="Nombre" />
                <input type="text" value={customerLastName} onChange={(e) => setCustomerLastName(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, ''))} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-zinc-500 transition text-sm" placeholder="Apellido" />
              </div>
              <input type="text" value={customerDocument} onChange={(e) => setCustomerDocument(e.target.value.replace(/\D/g, '').slice(0, 8))} className="w-full bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl text-white outline-none focus:border-zinc-500 transition text-sm tracking-widest" placeholder="DNI (7 u 8 números)" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => handleConfirmSale('ticket')} disabled={!isCardValid || (paymentType === "Tarjeta" && !isCustomerValid)} className={`w-1/2 py-3.5 rounded-xl text-sm transition font-bold border ${(!isCardValid || (paymentType === "Tarjeta" && !isCustomerValid)) ? 'bg-zinc-800 text-zinc-600 border-zinc-800 cursor-not-allowed' : 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'}`}>SOLO TICKET</button>
              <button onClick={() => handleConfirmSale('factura')} disabled={!isCustomerValid || !isCardValid} className={`w-1/2 py-3.5 rounded-xl text-sm transition font-black text-black ${(!isCustomerValid || !isCardValid) ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed border border-zinc-800' : 'bg-green-500 hover:bg-green-400 shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]'}`}>EMITIR FACTURA</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-[90px] bg-black border-r border-zinc-800 flex flex-col items-center py-6 gap-6">
        <button onClick={() => setView("pos")} className={`transition p-4 rounded-2xl ${view === "pos" ? "bg-white text-black" : "bg-zinc-900 hover:bg-zinc-800 text-white"}`}><Receipt size={30} /></button>
        <button onClick={() => setView("history")} className={`transition p-4 rounded-2xl ${view === "history" ? "bg-white text-black" : "bg-zinc-900 hover:bg-zinc-800 text-white"}`}><History size={30} /></button>
        <button onClick={() => setView("admin")} className={`transition p-4 rounded-2xl ${view === "admin" ? "bg-white text-black" : "bg-zinc-900 hover:bg-zinc-800 text-white"}`}><Package size={30} /></button>
        <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); toast.success("Sesión cerrada correctamente"); window.location.reload(); }} className="mt-auto transition p-4 rounded-2xl bg-zinc-900 hover:bg-red-950/60 text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-900/50" title="Cerrar Sesión"><LogOut size={30} /></button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {view === "pos" && (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-zinc-400 mb-2">Sistema de Ventas</p>
                <h1 className="text-5xl font-black">Rotiseria UDA</h1>
              </div>
              <div className="bg-zinc-900 rounded-2xl px-6 py-4 flex items-center gap-4 w-[450px] border border-zinc-800">
                <Search className="text-zinc-500" />
                <input type="text" placeholder="Buscar productos..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent outline-none w-full text-lg" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-6 border border-zinc-800 shadow-2xl"><p className="text-zinc-400 mb-3">Productos</p><h2 className="text-5xl font-black">{products.length}</h2></div>
              <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-3xl p-6 shadow-2xl"><p className="text-green-100 mb-3">Total Carrito</p><h2 className="text-5xl font-black">${total.toFixed(2)}</h2></div>
              <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-3xl p-6 shadow-2xl"><p className="text-blue-100 mb-3">Items</p><h2 className="text-5xl font-black">{cart.length}</h2></div>
            </div>

            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setCategory(cat)} className={`px-6 py-3 rounded-2xl transition whitespace-nowrap font-semibold ${category === cat ? "bg-white text-black" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300"}`}>{cat === "all" ? "Todos" : cat}</button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-8">
              <div className="col-span-3">
                <div className="grid grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {

                    // Evalua si el producto no tiene stock
                    const estaAgotado = product.stock <= 0;

                    return (
                      <div
                        key={product.ID}
                        //  MODIFICACIÓN VISUAL DE LA TARJETA: Si está agotado, baja la opacidad y quita el hover
                        className={`bg-zinc-900 border border-zinc-800 rounded-3xl p-5 transition duration-200 shadow-2xl flex flex-col 
                          ${estaAgotado 
                            ? "opacity-40 select-none border-zinc-800/60" 
                            : "hover:scale-[1.02] hover:border-zinc-700"
                          }`}
                      >
                        <div className="bg-zinc-800 rounded-2xl h-[150px] mb-5 flex items-center justify-center overflow-hidden shrink-0 relative">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className={`w-full h-full object-cover transition duration-300 ${!estaAgotado && 'hover:scale-110'}`}/>
                          ) : (
                            <span className="text-zinc-500 text-lg font-bold">SIN FOTO</span>
                          )}
                          
                          {/* 🏷️ BADGE INFORMATIVO EN LA IMAGEN */}
                          {estaAgotado && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="bg-red-600 text-white font-black text-xs px-3 py-1.5 rounded-xl tracking-wider uppercase shadow-md">Agotado</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-start mb-4 flex-1">
                          <div>
                            <h2 className="text-2xl font-bold mb-2 leading-tight">{product.name}</h2>
                            
                            {/* 🛠️ TEXTO DE STOCK DINÁMICO */}
                            <p className={`text-sm font-medium ${estaAgotado ? 'text-red-500 font-bold' : 'text-zinc-400'}`}>
                              {estaAgotado ? "Sin unidades disponibles" : `Stock: ${product.stock}`}
                            </p>
                          </div>
                          <div className={`text-3xl font-black shrink-0 ml-2 ${estaAgotado ? 'text-zinc-500' : 'text-green-400'}`}>
                            ${product.price.toFixed(2)}
                          </div>
                        </div>

                        {/* 🛠️ BOTÓN INTELIGENTE BLOQUEADO */}
                        <button
                          type="button"
                          disabled={estaAgotado}
                          onClick={() => {
                            const itemEnCarrito = cart.find((item) => item.ID === product.ID)
                            const cantidadActual = itemEnCarrito ? itemEnCarrito.quantity : 0
                            if (cantidadActual >= product.stock) { toast.error(`Sin stock: Solo quedan ${product.stock} unidades`); return; }
                            addToCart(product)
                            toast.success(`${product.name} agregado`)
                          }}
                          className={`mt-auto transition w-full py-4 rounded-2xl text-lg font-bold shrink-0 
                            ${estaAgotado 
                              ? "bg-zinc-800 text-zinc-600 cursor-not-allowed border border-zinc-800/30" 
                              : "bg-white text-black hover:bg-zinc-200"
                            }`}
                        >
                          {estaAgotado ? "Agotado" : "Agregar al carrito"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Carrito */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl h-fit sticky top-6 flex flex-col max-h-[calc(100vh-4rem)]">
                <div className="flex items-center gap-3 mb-8 shrink-0"><ShoppingCart size={30} /><h2 className="text-3xl font-black">Carrito</h2></div>
                <div className="space-y-3 overflow-y-auto overflow-x-hidden pr-2 flex-1 mb-8">
                  {cart.map((item) => (
                    <div key={item.ID} className="bg-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-bold text-[15px] leading-tight flex-1 break-words pr-1">{item.name}</p>
                        <div className="text-lg font-black text-green-400 shrink-0">${(item.quantity * item.price).toFixed(2)}</div>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-zinc-400 text-sm font-medium">${item.price.toFixed(2)} c/u</p>
                        <div className="flex items-center bg-zinc-900 rounded-lg p-1 shrink-0">
                          <button onClick={() => decreaseQuantity(item.ID)} className="text-zinc-400 hover:text-white hover:bg-zinc-700 rounded p-1 transition"><Minus size={16} /></button>
                          <span className="font-bold w-6 text-center text-zinc-300 text-sm">{item.quantity}</span>
                          <button onClick={() => { const productoEnVivo = products.find((p) => p.ID === item.ID); const stockReal = productoEnVivo ? productoEnVivo.stock : item.stock; if (item.quantity >= stockReal) { toast.error(`Stock máximo alcanzado (${stockReal})`); return; } addToCart(item); }} className="text-zinc-400 hover:text-white hover:bg-zinc-700 rounded p-1 transition"><Plus size={16} /></button>
                          <div className="w-[1px] h-4 bg-zinc-700 mx-1"></div>
                          <button onClick={() => { removeFromCart(item.ID); toast.success("Item eliminado") }} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded p-1 transition"><X size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-800 pt-6 shrink-0">
                  <div className="flex flex-col mb-6 gap-1">
                    <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Total</p>
                    <h3 className="text-4xl xl:text-5xl font-black text-green-400 text-right break-all leading-none tracking-tight">${total.toFixed(2)}</h3>
                  </div>
                  <button
                    onClick={() => {
                      if (cart.length === 0) {
                        toast.error("Carrito vacío");
                        return;
                      }
                      api.get("/products")
                        .then(() => setBackendOnline(true))
                        .catch(() => setBackendOnline(false));

                      setShowCheckoutModal(true);
                    }}
                    className="bg-green-500 hover:bg-green-400 transition text-black font-black w-full py-5 rounded-2xl text-2xl shadow-2xl"
                  >
                    COBRAR
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {view === "history" && <SalesHistory />}
        {view === "admin" && <AdminPanel products={products} reloadProducts={fetchProducts} />}
      </div>
    </div>
  );
}

export default POSPage;