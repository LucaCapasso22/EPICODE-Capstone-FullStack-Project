import axios from 'axios'

// URL base API
const API_URL = 'http://localhost:8080/api/auth/'

// Stato server
const serverStatus = {
  available: null, // null=non verificato, true=disponibile, false=non disponibile
  lastChecked: null,
  errorMessage: null,
}

axios.interceptors.request.use(
  (config) => {
    console.log(`Richiesta: ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('Errore richiesta:', error)
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (response) => {
    console.log(`Risposta da ${response.config.url}: ${response.status}`)
    console.log('Dati risposta:', response.data)
    serverStatus.available = true
    return response
  },
  (error) => {
    if (error.response) {
      console.error(
        `Errore risposta da ${error.config?.url}: ${error.response.status}`,
        error.response.data
      )
      serverStatus.available = true
    } else if (error.request) {
      console.error(`Nessuna risposta da ${error.config?.url}:`, error.message)
      serverStatus.available = false
      serverStatus.errorMessage = error.message
    } else {
      console.error('Errore:', error.message)
      serverStatus.errorMessage = error.message
    }
    return Promise.reject(error)
  }
)

const checkServerStatus = async () => {
  const now = Date.now()
  if (
    serverStatus.lastChecked &&
    now - serverStatus.lastChecked < 10000 &&
    serverStatus.available !== null
  ) {
    console.log('Usando stato server in cache:', serverStatus.available)
    return serverStatus.available
  }

  try {
    await axios.get(API_URL + 'roles', { timeout: 5000 })

    serverStatus.available = true
    serverStatus.lastChecked = now
    serverStatus.errorMessage = null
    return true
  } catch (error) {
    if (error.response) {
      serverStatus.available = true
      serverStatus.errorMessage = null
    } else {
      serverStatus.available = false
      serverStatus.errorMessage = error.message
    }
    serverStatus.lastChecked = now
    return serverStatus.available
  }
}

// Funzione per verificare la disponibilità del server
const pingServer = async () => {
  const now = Date.now()

  // Se abbiamo già verificato recentemente, usa il risultato in cache
  if (
    serverStatus.lastChecked &&
    now - serverStatus.lastChecked < 10000 &&
    serverStatus.available !== null
  ) {
    console.log('Usando stato server in cache:', serverStatus.available)
    return {
      available: serverStatus.available,
      errorMessage: serverStatus.errorMessage,
    }
  }

  try {
    // Prova a contattare un endpoint leggero sul server
    await axios.get(API_URL + 'roles', { timeout: 5000 })

    // Se arriviamo qui, il server è disponibile
    serverStatus.available = true
    serverStatus.lastChecked = now
    serverStatus.errorMessage = null

    return {
      available: true,
      errorMessage: null,
    }
  } catch (error) {
    console.error('Errore ping server:', error)

    // Se riceviamo una risposta dal server (anche con errore), il server è disponibile
    if (error.response) {
      serverStatus.available = true
      serverStatus.errorMessage = null
      serverStatus.lastChecked = now

      return {
        available: true,
        errorMessage: null,
      }
    } else {
      // Se non riceviamo risposta, il server non è disponibile
      serverStatus.available = false
      serverStatus.errorMessage = error.message
      serverStatus.lastChecked = now

      return {
        available: false,
        errorMessage: error.message,
      }
    }
  }
}

const login = async (email, password) => {
  const status = await checkServerStatus()
  if (!status) {
    console.error('Server non disponibile, login fallito')
    throw new Error('Server non disponibile. Riprova più tardi.')
  }

  const loginData = {
    email: email.trim(),
    password,
  }
  console.log('Tentativo di login con:', { email: loginData.email })

  try {
    const response = await axios.post(API_URL + 'login', loginData)

    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      const user = {
        id: response.data.id,
        username: response.data.username || response.data.email,
        email: response.data.email,
        roles: response.data.roles,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        accessToken: response.data.token,
      }
      localStorage.setItem('user', JSON.stringify(user))
      return user
    }
    return null
  } catch (error) {
    console.error('Errore di login:', error)
    if (error.response && error.response.data) {
      throw new Error(
        error.response.data.message ||
          error.response.data.error ||
          'Login fallito'
      )
    }
    throw error
  }
}

const register = async (
  username,
  email,
  firstName,
  lastName,
  address,
  phoneNumber,
  password
) => {
  const status = await checkServerStatus()
  if (!status) {
    console.error('Server non disponibile, registrazione fallita')
    throw new Error('Server non disponibile. Riprova più tardi.')
  }

  console.log('Tentativo di registrazione per:', email)

  try {
    const response = await axios.post(API_URL + 'register', {
      username,
      email,
      firstName,
      lastName,
      address,
      phoneNumber,
      password,
    })
    return response.data
  } catch (error) {
    console.error('Errore di registrazione:', error)
    if (error.response && error.response.data) {
      throw new Error(
        error.response.data.message ||
          error.response.data.error ||
          'Registrazione fallita'
      )
    }
    throw error
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

const getCurrentUser = () => {
  const token = localStorage.getItem('token')
  if (!token) return null

  const user = JSON.parse(localStorage.getItem('user'))
  return user
}

const getUserProfile = async () => {
  try {
    const response = await axios.get(API_URL + 'profile', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    const userProfile = response.data

    const user = {
      id: userProfile.id,
      username:
        userProfile.username ||
        response.data.email ||
        JSON.parse(localStorage.getItem('user')).username,
      email:
        userProfile.email || JSON.parse(localStorage.getItem('user')).email,
      roles: userProfile.roles,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      address: userProfile.address,
      phoneNumber: userProfile.phoneNumber,
    }

    localStorage.setItem('user', JSON.stringify(user))
    return response
  } catch (error) {
    console.error('Errore nel recupero profilo utente:', error)

    if (
      error.response &&
      error.response.status === 401 &&
      window.location.pathname !== '/login'
    ) {
      logout()
      window.location.href = '/login?expired=true'
    }

    throw error
  }
}

const updateProfile = async (userData) => {
  try {
    const response = await axios.put(API_URL + 'profile', userData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    const updatedProfile = response.data

    // Aggiorna i dati dell'utente nel localStorage
    const currentUser = JSON.parse(localStorage.getItem('user'))
    const updatedUser = {
      ...currentUser,
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
      address: updatedProfile.address,
      phoneNumber: updatedProfile.phoneNumber,
    }

    localStorage.setItem('user', JSON.stringify(updatedUser))
    return updatedUser
  } catch (error) {
    console.error("Errore durante l'aggiornamento del profilo:", error)

    if (
      error.response &&
      error.response.status === 401 &&
      window.location.pathname !== '/login'
    ) {
      logout()
      window.location.href = '/login?expired=true'
    }

    throw error
  }
}

const changePassword = async (oldPassword, newPassword) => {
  return axios.post(
    API_URL + 'change-password',
    { oldPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  )
}

const checkUserExists = (email) => {
  return axios.get(`${API_URL}debug/check-user?email=${email}`)
}

const resetPasswordDebug = (email, password = 'password123') => {
  return axios.get(`${API_URL}debug/reset-password`, {
    params: { email, password },
  })
}

// Funzione per eseguire test diagnostici del sistema di autenticazione
const runDiagnostics = async () => {
  try {
    const response = await axios.get(`${API_URL}debug/diagnostics`)
    return response.data
  } catch (error) {
    console.error('Errore durante la diagnostica:', error)
    throw error
  }
}

// Funzione per aggiornare il token quando scaduto
const refreshToken = async () => {
  try {
    console.log('Tentativo di aggiornamento token...')
    // Richiesta di refresh token con le credenziali salvate
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user || !user.email) {
      console.error('Nessun utente disponibile per aggiornare il token')
      throw new Error('Sessione scaduta. Effettua nuovamente il login.')
    }

    // Per semplicità, facciamo un nuovo login con un endpoint debug
    // In un'implementazione reale si userebbe un refresh token
    const response = await axios.post(API_URL + 'debug-login', {
      email: user.email,
      debug: true,
    })

    if (response.data.token) {
      // Aggiorna token nel localStorage
      localStorage.setItem('token', response.data.token)

      // Aggiorna l'oggetto utente
      const updatedUser = {
        ...user,
        accessToken: response.data.token,
        token: response.data.token,
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))

      console.log('Token aggiornato con successo')
      return updatedUser
    } else {
      console.error('Nessun token ricevuto dal server')
      throw new Error('Impossibile aggiornare il token')
    }
  } catch (error) {
    console.error('Errore durante il refresh del token:', error)
    throw error
  }
}

const AuthService = {
  login,
  register,
  logout,
  getCurrentUser,
  getUserProfile,
  updateProfile,
  changePassword,
  checkServerStatus,
  pingServer,
  checkUserExists,
  resetPasswordDebug,
  runDiagnostics,
  refreshToken,
}

export default AuthService
