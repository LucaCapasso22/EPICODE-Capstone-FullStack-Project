import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import OrderService from '../services/order.service'

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const location = useLocation()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Caricamento ordini utente in corso...')

        const response = await OrderService.getUserOrders()
        console.log('Ordini ricevuti:', response)

        // Verifico se la risposta contiene dati validi
        if (response && response.data) {
          setOrders(response.data)
        } else {
          console.warn('Risposta ricevuta ma senza dati')
          setOrders([])
        }
      } catch (err) {
        console.error('Errore durante il caricamento degli ordini:', err)

        // Messaggio di errore più specifico
        if (err.message && err.message.includes('Sessione scaduta')) {
          setError('Sessione scaduta. Effettua nuovamente il login.')
        } else if (err.response && err.response.status === 403) {
          setError(
            'Non hai i permessi necessari per visualizzare questa pagina.'
          )
        } else {
          setError('Impossibile caricare gli ordini. Riprova più tardi.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Formatta la data
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('it-IT', options)
  }

  // Ottieni il nome dello stato dell'ordine in italiano
  const getStatusName = (status) => {
    switch (status) {
      case 'PENDING':
        return 'In attesa'
      case 'PROCESSING':
        return 'In elaborazione'
      case 'SHIPPED':
        return 'Spedito'
      case 'DELIVERED':
        return 'Consegnato'
      case 'CANCELED':
        return 'Annullato'
      default:
        return status
    }
  }

  // Ottieni la classe del badge in base allo stato dell'ordine
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-warning'
      case 'PROCESSING':
        return 'bg-info'
      case 'SHIPPED':
        return 'bg-primary'
      case 'DELIVERED':
        return 'bg-success'
      case 'CANCELED':
        return 'bg-danger'
      default:
        return 'bg-secondary'
    }
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">I tuoi ordini</h2>

      {location.state?.success && (
        <div className="alert alert-success mb-4" role="alert">
          Ordine completato con successo! Grazie per il tuo acquisto.
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <h3>Non hai ancora effettuato ordini</h3>
          <p>Esplora il nostro catalogo e aggiungi prodotti al carrello.</p>
          <a href="/products" className="btn btn-primary mt-3">
            Vai allo shop
          </a>
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order.id} className="col-12 mb-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">Ordine #{order.id || 'N/A'}</h5>
                    <small className="text-muted">
                      Effettuato il{' '}
                      {order.orderDate
                        ? formatDate(order.orderDate)
                        : 'Data non disponibile'}
                    </small>
                  </div>
                  <span
                    className={`badge ${getStatusBadgeClass(order.status)}`}
                  >
                    {getStatusName(order.status)}
                  </span>
                </div>
                <div className="card-body">
                  <h6 className="card-subtitle mb-3">
                    Dettagli di spedizione:
                  </h6>
                  <p className="card-text">
                    {order.shippingAddress || 'Indirizzo non disponibile'}
                  </p>
                  <p className="card-text">
                    Telefono: {order.phone || 'Telefono non disponibile'}
                  </p>

                  <h6 className="card-subtitle mb-3 mt-4">Prodotti:</h6>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Prodotto</th>
                          <th>Quantità</th>
                          <th>Prezzo unitario</th>
                          <th>Totale</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.orderItems &&
                          order.orderItems.map((item) => (
                            <tr key={item.id}>
                              <td>{item.productName}</td>
                              <td>{item.quantity}</td>
                              <td>
                                €{item.price ? item.price.toFixed(2) : '0.00'}
                              </td>
                              <td>
                                €
                                {item.price && item.quantity
                                  ? (item.price * item.quantity).toFixed(2)
                                  : '0.00'}
                              </td>
                            </tr>
                          ))}
                        {!order.orderItems && (
                          <tr>
                            <td colSpan="4" className="text-center">
                              Dettagli prodotti non disponibili
                            </td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="3" className="text-end">
                            <strong>Totale ordine:</strong>
                          </td>
                          <td>
                            <strong>
                              €
                              {order.totalAmount
                                ? order.totalAmount.toFixed(2)
                                : '0.00'}
                            </strong>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <h6 className="card-subtitle mb-3 mt-4">
                    Metodo di pagamento:
                  </h6>
                  <p className="card-text">
                    {order.paymentMethod === 'CARTA'
                      ? 'Carta di credito/debito'
                      : order.paymentMethod}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
