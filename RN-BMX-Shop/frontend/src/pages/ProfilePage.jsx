import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../services/auth.service'

function ProfilePage({ currentUser }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    phone: '',
    country: '',
    city: '',
    gender: '',
    profileImage: '',
  })

  // Stato per il cambio password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Stato per la visibilità delle password
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  const [message, setMessage] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    console.log('ProfilePage: currentUser ricevuto:', currentUser)
    console.log(
      'ProfilePage: firstName:',
      currentUser?.firstName,
      'lastName:',
      currentUser?.lastName
    )

    // Verifica se l'utente è già autenticato
    if (!currentUser) {
      console.error('ProfilePage: Utente non autenticato')
      setError(
        'Utente non autenticato. Effettua il login per visualizzare il profilo.'
      )
      setLoading(false)
      // Reindirizza alla pagina di login se non autenticato
      navigate('/login')
      return
    }

    // Imposta i dati iniziali dall'utente corrente
    setUser(currentUser)
    setFormData({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      email: currentUser.email || '',
      address: currentUser.address || '',
      phone: currentUser.phone || '',
      country: currentUser.country || '',
      city: currentUser.city || '',
      gender: currentUser.gender || '',
      profileImage: currentUser.profileImage || '',
    })

    // Ottieni i dati aggiornati dall'API
    AuthService.getUserProfile()
      .then((response) => {
        console.log('ProfilePage: Dati profilo ricevuti:', response.data)
        setUser(response.data)
        setFormData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          address: response.data.address || '',
          phone: response.data.phone || '',
          country: response.data.country || '',
          city: response.data.city || '',
          gender: response.data.gender || '',
          profileImage: response.data.profileImage || '',
        })
      })
      .catch((error) => {
        console.error('ProfilePage: Errore nel recupero del profilo:', error)
        // Se è un errore di autenticazione (401), reindirizza al login
        if (error.response && error.response.status === 401) {
          console.warn(
            'Token scaduto o non valido, effettua nuovamente il login'
          )
          AuthService.logout() // Rimuovi i dati utente
          navigate('/login?expired=true') // Reindirizza alla pagina di login con parametro
          return
        }
        // Non impostare error qui, usa già i dati da currentUser come fallback
      })
      .finally(() => {
        setLoading(false)
      })
  }, [currentUser, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setMessage('')
    setSuccess(false)

    try {
      console.log('ProfilePage: Invio aggiornamento profilo:', formData)
      const updatedUser = await AuthService.updateProfile(formData)
      console.log('ProfilePage: Profilo aggiornato con successo:', updatedUser)
      setUser({ ...user, ...updatedUser }) // Aggiorna lo stato locale con i dati aggiornati
      setSuccess(true)
      setMessage('Profilo aggiornato con successo!')
    } catch (error) {
      console.error('ProfilePage: Errore aggiornamento profilo:', error)

      // Se è un errore di autenticazione, non mostrare il messaggio qui
      // perché verrà gestito dal service che reindirizzerà al login
      if (!(error.response && error.response.status === 401)) {
        setSuccess(false)
        setMessage(
          error.response?.data?.message ||
            "Errore durante l'aggiornamento del profilo. Riprova più tardi."
        )
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    // Validazione password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordSuccess(false)
      setPasswordMessage('Le nuove password non corrispondono')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordSuccess(false)
      setPasswordMessage('La nuova password deve contenere almeno 6 caratteri')
      return
    }

    setPasswordLoading(true)
    setPasswordMessage('')
    setPasswordSuccess(false)

    try {
      await AuthService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      )
      setPasswordSuccess(true)
      setPasswordMessage('Password aggiornata con successo!')
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      console.error('ProfilePage: Errore cambio password:', error)
      setPasswordSuccess(false)
      setPasswordMessage(
        error.response?.data?.message ||
          'Errore durante il cambio della password. Verifica che la password attuale sia corretta.'
      )
    } finally {
      setPasswordLoading(false)
    }
  }

  // Funzione per alternare la visibilità della password
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  // Se è in fase di caricamento, mostra il loader
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
        <p className="mt-3">Caricamento del profilo utente in corso...</p>
      </div>
    )
  }

  // Se c'è un errore, mostra il messaggio
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>
          Vai al login
        </button>
      </div>
    )
  }

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Informazioni utente</h5>
              <p className="card-text">
                <strong>Nome:</strong> {user.firstName} {user.lastName || ''}
              </p>
              <p className="card-text">
                <strong>Username:</strong> {user.username || 'N/A'}
              </p>
              <p className="card-text">
                <strong>Email:</strong> {user.email || 'N/A'}
              </p>
              <p className="card-text">
                <strong>Ruoli:</strong>{' '}
                {user.roles && user.roles.length > 0
                  ? user.roles
                      .map((role) => role.replace('ROLE_', ''))
                      .join(', ')
                  : 'N/A'}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/orders')}
              >
                I miei ordini
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Modifica profilo</h5>

              {message && (
                <div
                  className={`alert ${
                    success ? 'alert-success' : 'alert-danger'
                  }`}
                  role="alert"
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label">
                      Nome
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label">
                      Cognome
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                  />
                  <div className="form-text">
                    L'email non può essere modificata.
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
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
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="gender" className="form-label">
                      Genere
                    </label>
                    <select
                      className="form-select"
                      id="gender"
                      name="gender"
                      value={formData.gender || ''}
                      onChange={handleChange}
                    >
                      <option value="">Seleziona...</option>
                      <option value="M">Uomo</option>
                      <option value="F">Donna</option>
                      <option value="O">Altro</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="country" className="form-label">
                      Paese
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="country"
                      name="country"
                      value={formData.country || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="city" className="form-label">
                      Città
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="city"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="address" className="form-label">
                    Indirizzo
                  </label>
                  <textarea
                    className="form-control"
                    id="address"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    rows="2"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="profileImage" className="form-label">
                    URL Immagine Profilo
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="profileImage"
                    name="profileImage"
                    value={formData.profileImage || ''}
                    onChange={handleChange}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Aggiornamento...
                    </>
                  ) : (
                    'Aggiorna profilo'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sezione cambio password */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Modifica password</h5>

              {passwordMessage && (
                <div
                  className={`alert ${
                    passwordSuccess ? 'alert-success' : 'alert-danger'
                  }`}
                  role="alert"
                >
                  {passwordMessage}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label htmlFor="currentPassword" className="form-label">
                    Password attuale
                  </label>
                  <div className="input-group">
                    <input
                      type={
                        passwordVisibility.currentPassword ? 'text' : 'password'
                      }
                      className="form-control"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() =>
                        togglePasswordVisibility('currentPassword')
                      }
                    >
                      <i
                        className={`bi ${
                          passwordVisibility.currentPassword
                            ? 'bi-eye-slash'
                            : 'bi-eye'
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">
                    Nuova password
                  </label>
                  <div className="input-group">
                    <input
                      type={
                        passwordVisibility.newPassword ? 'text' : 'password'
                      }
                      className="form-control"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength="6"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => togglePasswordVisibility('newPassword')}
                    >
                      <i
                        className={`bi ${
                          passwordVisibility.newPassword
                            ? 'bi-eye-slash'
                            : 'bi-eye'
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Conferma nuova password
                  </label>
                  <div className="input-group">
                    <input
                      type={
                        passwordVisibility.confirmPassword ? 'text' : 'password'
                      }
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() =>
                        togglePasswordVisibility('confirmPassword')
                      }
                    >
                      <i
                        className={`bi ${
                          passwordVisibility.confirmPassword
                            ? 'bi-eye-slash'
                            : 'bi-eye'
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Aggiornamento...
                    </>
                  ) : (
                    'Cambia password'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
