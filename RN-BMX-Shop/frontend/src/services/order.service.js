import axios from 'axios'
import authHeader from './auth-header'
import AuthService from './auth.service'

const API_URL = '/api/orders/'

class OrderService {
  // Ottieni tutti gli ordini dell'utente corrente
  async getUserOrders() {
    try {
      console.log('Richiesta ordini utente...')
      return await axios.get(API_URL + 'my-orders', { headers: authHeader() })
    } catch (error) {
      console.error('Errore nella richiesta ordini utente:', error)

      // Se otteniamo un errore 401, proviamo a refreshare il token e rifare la richiesta
      if (error.response && error.response.status === 401) {
        console.log('Token scaduto, tento il refresh...')
        try {
          // Refresh del token
          await AuthService.refreshToken()

          // Riprova con il nuovo token
          console.log('Riprovo la richiesta con il nuovo token')
          return await axios.get(API_URL + 'my-orders', {
            headers: authHeader(),
          })
        } catch (refreshError) {
          console.error('Impossibile refreshare il token:', refreshError)
          throw new Error('Sessione scaduta. Effettua nuovamente il login.')
        }
      }

      throw error
    }
  }

  // Ottieni i dettagli di un ordine specifico
  getOrderById(id) {
    return axios.get(API_URL + id, { headers: authHeader() })
  }

  // Crea un nuovo ordine con il token di Stripe
  createOrder(orderData, stripeToken) {
    const payload = {
      ...orderData,
      paymentToken: stripeToken,
    }
    return axios.post(API_URL, payload, { headers: authHeader() })
  }

  // Processa un pagamento con Stripe
  processPayment(paymentData) {
    return axios.post('/api/payment/process', paymentData, {
      headers: authHeader(),
    })
  }

  // Solo per amministratori: ottieni tutti gli ordini
  async getAllOrders() {
    try {
      console.log('Richiesta di tutti gli ordini...')
      return await axios.get(API_URL + 'admin/all', { headers: authHeader() })
    } catch (error) {
      console.error('Errore nella richiesta ordini:', error)

      // Se otteniamo un errore 401, proviamo a refreshare il token e rifare la richiesta
      if (error.response && error.response.status === 401) {
        console.log('Token scaduto, tento il refresh...')
        try {
          // Refresh del token
          await AuthService.refreshToken()

          // Riprova con il nuovo token
          console.log('Riprovo la richiesta con il nuovo token')
          return await axios.get(API_URL + 'admin/all', {
            headers: authHeader(),
          })
        } catch (refreshError) {
          console.error('Impossibile refreshare il token:', refreshError)
          throw new Error('Sessione scaduta. Effettua nuovamente il login.')
        }
      }

      throw error
    }
  }

  // Solo per amministratori: aggiorna lo stato di un ordine
  async updateOrderStatus(id, status) {
    try {
      return await axios.put(
        API_URL + 'admin/' + id + '/status',
        { status },
        { headers: authHeader() }
      )
    } catch (error) {
      // Se otteniamo un errore 401, proviamo a refreshare il token e rifare la richiesta
      if (error.response && error.response.status === 401) {
        console.log('Token scaduto, tento il refresh...')
        try {
          // Refresh del token
          await AuthService.refreshToken()

          // Riprova con il nuovo token
          return await axios.put(
            API_URL + 'admin/' + id + '/status',
            { status },
            { headers: authHeader() }
          )
        } catch (refreshError) {
          console.error('Impossibile refreshare il token:', refreshError)
          throw new Error('Sessione scaduta. Effettua nuovamente il login.')
        }
      }

      throw error
    }
  }
}

export default new OrderService()
