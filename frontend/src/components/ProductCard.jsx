function ProductCard({ product, onAdd }) {

  return (

    <div className="bg-white rounded-2xl shadow p-4">

      <h2 className="text-xl font-bold mb-2">
        {product.name}
      </h2>

      <p className="text-lg mb-2">
        ${product.price}
      </p>

      <p className="text-sm text-gray-500 mb-4">
        Stock: {product.stock}
      </p>

      <button
        onClick={() => onAdd(product)}
        className="bg-black text-white px-4 py-2 rounded-xl w-full"
      >
        Agregar
      </button>

      <button
        onClick={() => removeFromCart(item.ID)}
        className="text-red-400 hover:text-red-300"
      >
        Eliminar
      </button>

    </div>
  )
}

export default ProductCard