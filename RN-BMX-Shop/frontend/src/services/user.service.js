import axios from 'axios'
import authHeader from './auth-header'
import AuthService from './auth.service'

const API_URL = '/api/users/'

// Ottiene tutti gli utenti (solo per admin)
const getAllUsers = async () => {
  try {
    console.log('Richiesta di tutti gli utenti...')
    return await axios.get(API_URL, { headers: authHeader() })
  } catch (error) {
    console.error('Errore nella richiesta utenti:', error)

    // Se otteniamo un errore 401, proviamo a refreshare il token e rifare la richiesta
    if (error.response && error.response.status === 401) {
      console.log('Token scaduto, tento il refresh...')
      try {
        // Refresh del token
        await AuthService.refreshToken()

        // Riprova con il nuovo token
        console.log('Riprovo la richiesta con il nuovo token')
        return await axios.get(API_URL, { headers: authHeader() })
      } catch (refreshError) {
        console.error('Impossibile refreshare il token:', refreshError)
        throw new Error('Sessione scaduta. Effettua nuovamente il login.')
      }
    }

    throw error
  }
}

// Ottiene un utente specifico tramite ID
const getUserById = (id) => {
  return axios.get(API_URL + id, { headers: authHeader() })
}

// Aggiorna un utente
const updateUser = (id, userData) => {
  return axios.put(API_URL + id, userData, { headers: authHeader() })
}

// Elimina un utente
const deleteUser = (id) => {
  return axios.delete(API_URL + id, { headers: authHeader() })
}

// Modifica i ruoli di un utente (solo per admin)
const updateUserRoles = async (id, rolesData) => {
  console.log(
    `Invio richiesta di aggiornamento ruoli per l'utente con ID ${id}:`,
    rolesData
  )

  // Assicuriamoci che i ruoli siano nel formato corretto
  const roles = rolesData.roles
  console.log('Ruoli da inviare:', roles)

  try {
    return await axios.put(
      API_URL + id + '/roles',
      { roles },
      {
        headers: authHeader(),
        timeout: 15000, // Aumentiamo il timeout per gestire eventuali problemi di rete
      }
    )
  } catch (error) {
    console.error('Errore risposta:', error.response || error)

    // Se otteniamo un errore 401, proviamo a refreshare il token e rifare la richiesta
    if (error.response && error.response.status === 401) {
      console.log('Token scaduto, tento il refresh...')
      try {
        // Refresh del token
        await AuthService.refreshToken()

        // Riprova con il nuovo token
        console.log('Riprovo la richiesta con il nuovo token')
        return await axios.put(
          API_URL + id + '/roles',
          { roles },
          {
            headers: authHeader(),
            timeout: 15000,
          }
        )
      } catch (refreshError) {
        console.error('Impossibile refreshare il token:', refreshError)
        throw new Error('Sessione scaduta. Effettua nuovamente il login.')
      }
    }

    throw error
  }
}

// Ottiene il profilo dell'utente corrente
const getCurrentUserProfile = () => {
  return axios.get(API_URL + 'profile', { headers: authHeader() })
}

// Aggiorna il profilo dell'utente corrente
const updateProfile = (profileData) => {
  return axios.put(API_URL + 'profile', profileData, { headers: authHeader() })
}

// Modifica la password dell'utente corrente
const changePassword = (currentPassword, newPassword) => {
  return axios.post(
    API_URL + 'change-password',
    { currentPassword, newPassword },
    { headers: authHeader() }
  )
}

export default {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRoles,
  getCurrentUserProfile,
  updateProfile,
  changePassword,
}
