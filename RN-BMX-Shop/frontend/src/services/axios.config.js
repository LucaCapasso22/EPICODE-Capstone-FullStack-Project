import axios from 'axios'

// Base URL per tutte le richieste API - Assicura che puntino sempre al backend
axios.defaults.baseURL = 'http://localhost:8080'

// Imposta il timeout di default per tutte le richieste Axios
axios.defaults.timeout = 15000

// Aggiungi un interceptor per gestire le risposte
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.response?.status === 504) {
      console.error('Richiesta scaduta per timeout:', error.config?.url)
    }
    if (error.response?.status === 404) {
      console.error('Risorsa non trovata:', error.config?.url)
    }
    return Promise.reject(error)
  }
)

// Aggiungi un interceptor per loggare le richieste in uscita
axios.interceptors.request.use(
  (config) => {
    console.log(
      `Richiesta API ${config.method?.toUpperCase()} a ${config.baseURL}${
        config.url
      }`
    )
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default axios
