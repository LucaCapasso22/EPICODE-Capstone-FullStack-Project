import React from 'react'
import { Link } from 'react-router-dom'

function CartPage({ cartItems, updateItemQuantity, removeFromCart }) {
  // Calcola il totale del carrello
  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Il tuo carrello</h2>

      {cartItems.length === 0 ? (
        <div className="text-center py-5">
          <h3>Il tuo carrello è vuoto</h3>
          <p className="mb-4">
            Aggiungi alcuni prodotti al tuo carrello per procedere all'acquisto.
          </p>
          <Link to="/products" className="btn btn-primary">
            Continua lo shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th scope="col">Prodotto</th>
                  <th scope="col">Prezzo</th>
                  <th scope="col">Quantità</th>
                  <th scope="col">Totale</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={
                            item.imageUrl || 'https://via.placeholder.com/100'
                          }
                          alt={item.name}
                          className="img-thumbnail me-3"
                          style={{
                            width: '75px',
                            height: '75px',
                            objectFit: 'cover',
                          }}
                        />
                        <div>
                          <h6 className="mb-0">{item.name}</h6>
                        </div>
                      </div>
                    </td>
                    <td>€{item.price.toFixed(2)}</td>
                    <td>
                      <div className="input-group" style={{ width: '120px' }}>
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity - 1)
                          }
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="form-control text-center"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItemQuantity(
                              item.id,
                              parseInt(e.target.value) || 1
                            )
                          }
                          min="1"
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>€{(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <i className="bi bi-trash"></i> Rimuovi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <div>
              <h4>Totale: €{calculateTotal().toFixed(2)}</h4>
            </div>
            <div>
              <Link to="/checkout" className="btn btn-primary">
                Procedi al checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CartPage
