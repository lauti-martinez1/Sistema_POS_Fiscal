import { useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { Edit2, Trash2, Check, X, Eye, EyeOff, Plus } from "lucide-react";

export default function AdminPanel({ products, reloadProducts }) {
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    image_url: "",
  });

  const startEdit = (product) => {
    setEditId(product.ID);
    setEditForm(product);
  };

  const handleSave = async () => {
    try {
      await api.put(`/products/${editId}`, editForm);
      toast.success("Producto actualizado");
      setEditId(null);
      reloadProducts();
    } catch (err) {
      toast.error("Error al guardar");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que querés borrar este producto?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Producto eliminado");
      reloadProducts();
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const toggleDisponibilidad = async (product) => {
    try {
      await api.put(`/products/${product.ID}`, {
        ...product,
        available: !product.available,
      });
      toast.success(product.available ? "Producto ocultado" : "Producto activado");
      reloadProducts();
    } catch (err) {
      toast.error("Error al cambiar estado");
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.name || !newProduct.category || !newProduct.price) {
      toast.error("Nombre, Categoría y Precio son obligatorios");
      return;
    }

    try {
      await api.post("/products", {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock) || 0,
      });

      toast.success("¡Producto agregado con éxito!");
      setNewProduct({ name: "", category: "", price: "", stock: "", image_url: "" });
      setShowCreateForm(false);
      reloadProducts(); 
    } catch (err) {
      toast.error("Error al crear el producto");
      console.error(err);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-3xl p-8 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black">Administrar Productos</h2>
        
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold transition ${
            showCreateForm ? "bg-red-600 hover:bg-red-500 text-white" : "bg-white text-black hover:bg-zinc-200"
          }`}
        >
          {showCreateForm ? <X size={20} /> : <Plus size={20} />}
          {showCreateForm ? "Cancelar" : "Nuevo Producto"}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateProduct} className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 mb-8 grid grid-cols-3 gap-4 shadow-inner">
          
          {/* Fila 1 */}
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-400 uppercase">Nombre del Plato / Producto</label>
            <input type="text" placeholder="Ej: Empanada de Pollo Frita" className="bg-zinc-900 p-3 rounded-xl text-white outline-none border border-zinc-800 focus:border-zinc-600" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-400 uppercase">Categoría</label>
            <input type="text" placeholder="Ej: Minutas, Bebidas, Postres" className="bg-zinc-900 p-3 rounded-xl text-white outline-none border border-zinc-800 focus:border-zinc-600" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} />
          </div>

          {/* Fila 2 */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-400 uppercase">Precio ($)</label>
            <input type="number" step="0.01" placeholder="0.00" className="bg-zinc-900 p-3 rounded-xl text-white outline-none border border-zinc-800 focus:border-zinc-600" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
          </div>
          
          {/* PRIMER BLOQUEO: Al crear producto nuevo */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-400 uppercase">Stock Inicial</label>
            <input 
              type="number" 
              min="0" 
              placeholder="Ej: 50" 
              className="bg-zinc-900 p-3 rounded-xl text-white outline-none border border-zinc-800 focus:border-zinc-600" 
              value={newProduct.stock} 
              onChange={(e) => {
                const valor = Math.max(0, parseInt(e.target.value) || 0);
                setNewProduct({...newProduct, stock: valor});
              }} 
            />
          </div>
          
          {/* Fila 3 */}
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs font-bold text-zinc-400 uppercase">URL de la Imagen</label>
            <input type="text" placeholder="Pegá el link de la foto acá..." className="bg-zinc-900 p-3 rounded-xl text-white outline-none border border-zinc-800 focus:border-zinc-600" value={newProduct.image_url} onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})} />
          </div>
          <div className="flex items-end">
            <button type="submit" className="bg-green-500 hover:bg-green-400 text-black font-black w-full py-3 rounded-xl text-lg transition shadow-md">
              GUARDAR
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {products.map((p) => (
          <div key={p.ID} className={`flex items-center gap-4 p-4 rounded-2xl transition border ${p.available ? 'bg-zinc-800 border-zinc-700/50 hover:border-zinc-500' : 'bg-zinc-800/30 border-dashed border-zinc-800 opacity-60'}`}>
            
            <div className="flex gap-2">
              <button onClick={() => toggleDisponibilidad(p)} className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition" title={p.available ? "Ocultar" : "Mostrar"}>
                {p.available ? <Eye size={20} className="text-green-400"/> : <EyeOff size={20} className="text-red-400"/>}
              </button>
              <button onClick={() => handleDelete(p.ID)} className="p-2 bg-red-900/50 hover:bg-red-900 rounded-lg transition text-red-400" title="Borrar permanentemente">
                <Trash2 size={20} />
              </button>
            </div>

            {editId === p.ID ? (
              <div className="flex-1 flex gap-3 items-center ml-2">
                <input className="bg-zinc-950 p-2 rounded text-white w-1/4 text-sm outline-none border border-zinc-700 focus:border-zinc-400" placeholder="Nombre" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                <input className="bg-zinc-950 p-2 rounded text-white w-32 text-sm outline-none border border-zinc-700 focus:border-zinc-400" placeholder="Categoría" value={editForm.category || ""} onChange={(e) => setEditForm({...editForm, category: e.target.value})} />
                
                <div className="flex items-center bg-zinc-950 rounded border border-zinc-700 focus-within:border-zinc-400 overflow-hidden">
                  <span className="pl-3 pr-1 text-zinc-500 font-bold">$</span>
                  <input type="number" className="bg-transparent p-2 text-white w-20 text-sm outline-none" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})} />
                </div>

                {/* SEGUNDO BLOQUEO: Al editar un producto de la lista */}
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 text-sm font-bold">Stock:</span>
                  <input 
                    type="number" 
                    min="0" 
                    className="bg-zinc-950 p-2 rounded text-white w-16 text-sm outline-none border border-zinc-700 focus:border-zinc-400" 
                    value={editForm.stock} 
                    onChange={(e) => {
                      const valor = Math.max(0, parseInt(e.target.value) || 0);
                      setEditForm({...editForm, stock: valor});
                    }} 
                  />
                </div>
                
                <input type="text" className="bg-zinc-950 p-2 rounded text-white flex-1 text-xs outline-none border border-zinc-700 focus:border-zinc-400" placeholder="URL Imagen" value={editForm.image_url || ""} onChange={(e) => setEditForm({...editForm, image_url: e.target.value})} />
                
                <div className="flex gap-2 ml-auto">
                  <button onClick={handleSave} className="p-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition" title="Guardar"><Check size={20}/></button>
                  <button onClick={() => setEditId(null)} className="p-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg transition" title="Cancelar"><X size={20}/></button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex justify-between items-center ml-4">
                
                <div className="flex flex-col flex-1">
                  <span className="text-xl font-bold">{p.name}</span>
                  <span className="text-xs text-zinc-400 bg-zinc-950 border border-zinc-700/50 px-2 py-0.5 rounded-md w-fit mt-1">
                    {p.category || "Sin categoría"}
                  </span>
                </div>

                <div className="flex items-center gap-8">
                  <span className="text-2xl text-green-400 font-black w-28 text-right">
                    ${p.price.toFixed(2)}
                  </span>
                  
                  <div className="flex flex-col items-end w-20">
                    <span className="text-xs text-zinc-500 font-bold uppercase">Stock</span>
                    <span className="text-lg text-white font-bold">{p.stock}</span>
                  </div>

                  <button onClick={() => startEdit(p)} className="p-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-xl transition ml-2" title="Editar Producto">
                    <Edit2 size={20} />
                  </button>
                </div>

              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}