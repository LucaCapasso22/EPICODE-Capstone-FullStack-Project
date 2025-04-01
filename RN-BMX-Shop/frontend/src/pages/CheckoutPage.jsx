import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StripeCheckout from 'react-stripe-checkout'
import OrderService from '../services/order.service'

function CheckoutPage({ cartItems, clearCart, currentUser }) {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Italia',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  // Precompila il form con i dati dell'utente quando il componente viene montato
  useEffect(() => {
    if (currentUser) {
      setFormData((prevData) => ({
        ...prevData,
        fullName: currentUser.fullName || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        postalCode: currentUser.postalCode || '',
        country: currentUser.country || 'Italia',
        phone: currentUser.phone || '',
      }))
    }
  }, [currentUser])

  // Calcola il totale dell'ordine
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Qui potresti implementare la validazione del form
  }

  const handleToken = async (token) => {
    setLoading(true)
    setError('')

    try {
      // Crea l'oggetto ordine
      const order = {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: `${formData.fullName}, ${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
        phone: formData.phone,
        totalAmount: calculateTotal(),
        paymentMethod: 'CARTA',
      }

      // Invia l'ordine al backend
      await OrderService.createOrder(order, token.id)

      // Svuota il carrello
      clearCart()

      // Reindirizza alla pagina degli ordini
      navigate('/orders', { state: { success: true } })
    } catch (err) {
      setError(
        'Si è verificato un errore durante il checkout. Riprova più tardi.'
      )
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <h2>Il tuo carrello è vuoto</h2>
        <p>Aggiungi prodotti al carrello prima di procedere al checkout.</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/products')}
        >
          Torna ai prodotti
        </button>
      </div>
    )
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Checkout</h2>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="row">
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Informazioni di spedizione</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="fullName" className="form-label">
                    Nome completo
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="address" className="form-label">
                    Indirizzo
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="city" className="form-label">
                      Città
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="postalCode" className="form-label">
                      CAP
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="country" className="form-label">
                    Paese
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Telefono
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Riepilogo ordine</h5>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="d-flex justify-content-between mb-2"
                >
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <hr />

              <div className="d-flex justify-content-between mb-3">
                <strong>Totale</strong>
                <strong>€{calculateTotal().toFixed(2)}</strong>
              </div>

              <StripeCheckout
                stripeKey="pk_test_51R6tOEK87s4DKx481RxYqCsfiyPdNxbXNhOGxQ8HEqzoyqyQzxptMiQpji3oVzgWlqMl7kutS7sXHiW6MQQqiHjD00apfUVkPm"
                token={handleToken}
                amount={calculateTotal() * 100} // Stripe richiede l'importo in centesimi
                name="RN BMX Shop"
                description="Pagamento ordine"
                currency="EUR"
                disabled={
                  loading ||
                  !formData.fullName ||
                  !formData.address ||
                  !formData.city ||
                  !formData.postalCode ||
                  !formData.country ||
                  !formData.phone
                }
              >
                <button
                  className="btn btn-primary w-100"
                  disabled={
                    loading ||
                    !formData.fullName ||
                    !formData.address ||
                    !formData.city ||
                    !formData.postalCode ||
                    !formData.country ||
                    !formData.phone
                  }
                >
                  {loading ? 'Elaborazione...' : 'Procedi al pagamento'}
                </button>
              </StripeCheckout>

              <div className="mt-3">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => navigate('/cart')}
                >
                  Torna al carrello
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
