import axios from 'axios'
import authHeader from './auth-header'

const API_URL = '/api/reviews/'

class ReviewService {
  // Ottieni le recensioni per un prodotto specifico (non richiede autenticazione)
  getReviewsByProductId(productId) {
    return axios
      .get(API_URL + 'product/' + productId)
      .then((response) => {
        console.log('Recensioni recuperate con successo:', response.data)
        return response.data
      })
      .catch((error) => {
        console.error('Errore durante il recupero delle recensioni:', error)
        console.error('Status code:', error.response?.status)
        console.error('Messaggio errore:', error.response?.data)
        return []
      })
  }

  // Aggiungi una recensione (richiede autenticazione)
  addReview(productId, reviewData) {
    const headers = authHeader()
    console.log(
      `Invio recensione per prodotto ID:${productId} con dati:`,
      reviewData
    )
    console.log(
      'Token di autenticazione:',
      headers.Authorization
        ? `${headers.Authorization.substring(0, 15)}...`
        : 'mancante'
    )

    // Se non c'è un token, non inviare la richiesta
    if (!headers.Authorization) {
      console.error(
        'Tentativo di invio recensione senza token di autenticazione'
      )
      return Promise.reject(
        new Error('Autenticazione richiesta per inviare recensioni')
      )
    }

    return axios
      .post(API_URL + 'product/' + productId, reviewData, {
        headers: headers,
      })
      .then((response) => {
        console.log(
          'Recensione inviata con successo. Server response:',
          response.data
        )
        return response.data
      })
      .catch((error) => {
        console.error(
          "Errore nell'invio della recensione:",
          error.response || error
        )
        if (error.response) {
          console.error('Status:', error.response.status)
          console.error('Data:', error.response.data)
        }
        throw error
      })
  }

  // Elimina una recensione (utile per gli amministratori o per chi ha scritto la recensione)
  deleteReview(reviewId) {
    const headers = authHeader()
    console.log(`Tentativo eliminazione recensione ID:${reviewId}`)
    console.log(
      'Token di autenticazione:',
      headers.Authorization
        ? `${headers.Authorization.substring(0, 15)}...`
        : 'mancante'
    )

    // Se non c'è un token, non inviare la richiesta
    if (!headers.Authorization) {
      console.error(
        'Tentativo di eliminazione recensione senza token di autenticazione'
      )
      return Promise.reject(
        new Error('Autenticazione richiesta per eliminare recensioni')
      )
    }

    return axios
      .delete(API_URL + reviewId, {
        headers: headers,
      })
      .then((response) => {
        console.log(
          `Recensione ${reviewId} eliminata con successo:`,
          response.data
        )
        return response.data
      })
      .catch((error) => {
        console.error(
          `Errore durante l'eliminazione della recensione ${reviewId}:`,
          error
        )
        if (error.response) {
          console.error('Status:', error.response.status)
          console.error('Data:', error.response.data)
        }
        throw error
      })
  }
}

export default new ReviewService()
