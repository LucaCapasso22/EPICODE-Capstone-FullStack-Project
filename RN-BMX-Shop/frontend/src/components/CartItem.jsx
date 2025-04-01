const CartItem = ({ item, onRemove, updateItemQuantity }) => {
  return (
    <div>
      {/* ... existing code ... */}
      <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)}>
        -
      </button>
      {/* ... existing code ... */}
      <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)}>
        +
      </button>
      {/* ... existing code ... */}
    </div>
  )
}

export default CartItem
