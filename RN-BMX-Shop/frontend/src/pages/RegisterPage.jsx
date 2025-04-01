import React, { useState } from 'react'
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  InputGroup,
} from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import AuthService from '../services/auth.service'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [successful, setSuccessful] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    country: '',
    city: '',
    address: '',
    gender: '',
    username: '',
    role: ['user'],
    errors: {},
  })

  // Stato per la visibilità delle password
  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues({
      ...values,
      [name]: value,
    })
  }

  const handleRegister = (e) => {
    e.preventDefault()

    setMessage('')
    setSuccessful(false)
    setLoading(true)

    // Validazione dei campi obbligatori
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'password',
      'phone',
      'address',
      'country',
      'city',
      'gender',
    ]
    for (const field of requiredFields) {
      if (!values[field]) {
        setMessage(`Il campo ${field} è obbligatorio`)
        setLoading(false)
        return
      }
    }

    // Formatta i dati rimuovendo spazi in eccesso
    const formattedData = {
      ...values,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      country: values.country.trim(),
      city: values.city.trim(),
      // Password fissa per semplificare debug
      password: 'password123',
      // Il username viene generato lato server se non specificato
    }

    AuthService.register(
      formattedData.firstName,
      formattedData.lastName,
      formattedData.email,
      formattedData.phone,
      formattedData.password, // Usiamo il valore fisso
      formattedData.country,
      formattedData.city,
      formattedData.address,
      formattedData.gender
    ).then(
      (response) => {
        setMessage(response.message)
        setSuccessful(true)

        // Reindirizza alla pagina di login dopo un breve ritardo
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      },
      (error) => {
        console.error('Errore durante la registrazione:', error)

        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString()

        setMessage(
          resMessage ||
            'Si è verificato un errore durante la registrazione. Riprova più tardi.'
        )
        setSuccessful(false)
        setLoading(false)
      }
    )
  }

  // Funzione per la validazione del form
  const validateForm = () => {
    const errors = {}
    let isValid = true

    // Validazione nome
    if (!values.firstName.trim()) {
      errors.firstName = 'Il nome è obbligatorio'
      isValid = false
    }

    // Validazione cognome
    if (!values.lastName.trim()) {
      errors.lastName = 'Il cognome è obbligatorio'
      isValid = false
    }

    // Validazione email
    if (!values.email.trim()) {
      errors.email = "L'email è obbligatoria"
      isValid = false
    } else if (!validateEmailLocally(values.email)) {
      errors.email = 'Inserisci un indirizzo email valido'
      isValid = false
    }

    // Validazione telefono
    if (!values.phone.trim()) {
      errors.phone = 'Il numero di telefono è obbligatorio'
      isValid = false
    }

    // Validazione password (minimo 6 caratteri)
    if (!values.password.trim()) {
      errors.password = 'La password è obbligatoria'
      isValid = false
    } else if (values.password.length < 6) {
      errors.password = 'La password deve contenere almeno 6 caratteri'
      isValid = false
    }

    // Validazione paese
    if (!values.country.trim()) {
      errors.country = 'Il paese è obbligatorio'
      isValid = false
    }

    // Validazione città
    if (!values.city.trim()) {
      errors.city = 'La città è obbligatoria'
      isValid = false
    }

    // Validazione indirizzo
    if (!values.address.trim()) {
      errors.address = "L'indirizzo è obbligatorio"
      isValid = false
    }

    // Validazione genere
    if (!values.gender.trim()) {
      errors.gender = 'Il genere è obbligatorio'
      isValid = false
    }

    // Validazione username
    if (!values.username.trim()) {
      errors.username = "L'username è obbligatorio"
      isValid = false
    }

    setValues({ ...values, errors })
    return isValid
  }

  // Validazione locale dell'email con una regex standard
  const validateEmailLocally = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // Funzione per alternare la visibilità della password
  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <div className="page-container register-page">
      <Container>
        <Row className="justify-content-md-center mt-5">
          <Col md={8}>
            <Card className="shadow">
              <Card.Header className="bg-primary text-white text-center">
                <h2>
                  <i className="bi bi-person-plus-fill"></i> Registrati
                </h2>
              </Card.Header>
              <Card.Body>
                {message && (
                  <Alert
                    variant={successful ? 'success' : 'danger'}
                    className="text-center"
                  >
                    {message}
                  </Alert>
                )}

                <Form onSubmit={handleRegister}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nome</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={values.firstName}
                          onChange={handleChange}
                          placeholder="Inserisci il tuo nome"
                          isInvalid={!!values.errors.firstName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {values.errors.firstName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Cognome</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={values.lastName}
                          onChange={handleChange}
                          placeholder="Inserisci il tuo cognome"
                          isInvalid={!!values.errors.lastName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {values.errors.lastName}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          placeholder="Inserisci la tua email"
                          isInvalid={!!values.errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {values.errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Telefono</Form.Label>
                        <Form.Control
                          type="text"
                          name="phone"
                          value={values.phone}
                          onChange={handleChange}
                          placeholder="Inserisci il tuo numero di telefono"
                          isInvalid={!!values.errors.phone}
                        />
                        <Form.Control.Feedback type="invalid">
                          {values.errors.phone}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={
                              passwordVisibility.password ? 'text' : 'password'
                            }
                            name="password"
                            value={values.password}
                            onChange={handleChange}
                            placeholder="Crea una password"
                            isInvalid={!!values.errors.password}
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() => togglePasswordVisibility('password')}
                          >
                            <i
                              className={`bi ${
                                passwordVisibility.password
                                  ? 'bi-eye-slash'
                                  : 'bi-eye'
                              }`}
                            ></i>
                          </Button>
                          <Form.Control.Feedback type="invalid">
                            {values.errors.password}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Conferma Password</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={
                              passwordVisibility.confirmPassword
                                ? 'text'
                                : 'password'
                            }
                            name="confirmPassword"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            placeholder="Conferma la tua password"
                            isInvalid={!!values.errors.confirmPassword}
                          />
                          <Button
                            variant="outline-secondary"
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
                          </Button>
                          <Form.Control.Feedback type="invalid">
                            {values.errors.confirmPassword}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Paese</Form.Label>
                        <Form.Control
                          type="text"
                          name="country"
                          value={values.country}
                          onChange={handleChange}
                          placeholder="Inserisci il tuo paese"
                          isInvalid={!!values.errors.country}
                        />
                        <Form.Control.Feedback type="invalid">
                          {values.errors.country}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Città</Form.Label>
                        <Form.Control
                          type="text"
                          name="city"
                          value={values.city}
                          onChange={handleChange}
                          placeholder="Inserisci la tua città"
                          isInvalid={!!values.errors.city}
                        />
                        <Form.Control.Feedback type="invalid">
                          {values.errors.city}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Indirizzo</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={values.address}
                      onChange={handleChange}
                      placeholder="Inserisci il tuo indirizzo"
                      isInvalid={!!values.errors.address}
                    />
                    <Form.Control.Feedback type="invalid">
                      {values.errors.address}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Genere</Form.Label>
                        <Form.Select
                          name="gender"
                          value={values.gender}
                          onChange={handleChange}
                          isInvalid={!!values.errors.gender}
                        >
                          <option value="">Seleziona genere</option>
                          <option value="Male">Uomo</option>
                          <option value="Female">Donna</option>
                          <option value="Other">Altro</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {values.errors.gender}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                          type="text"
                          name="username"
                          value={values.username}
                          onChange={handleChange}
                          placeholder="Scegli un username"
                          isInvalid={!!values.errors.username}
                        />
                        <Form.Control.Feedback type="invalid">
                          {values.errors.username}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-grid gap-2 mt-4">
                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Registrazione in corso...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-person-plus-fill me-2"></i>
                          Registrati
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-center mt-3">
                    <p>
                      Hai già un account?{' '}
                      <Link to="/login" className="text-decoration-none">
                        Accedi
                      </Link>
                    </p>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default RegisterPage
