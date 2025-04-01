import React, { useState } from 'react'
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Spinner,
  InputGroup,
} from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import AuthService from '../services/auth.service'

const LoginPage = () => {
  const navigate = useNavigate()
  const [values, setValues] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [successful, setSuccessful] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setValues({
      ...values,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setMessage('')
    setSuccessful(false)
    setLoading(true)

    // Validazione base
    if (!values.email || !values.password) {
      setMessage('Inserisci email e password')
      setSuccessful(false)
      setLoading(false)
      return
    }

    // Rimuovi spazi bianchi e formatta i dati
    const cleanEmail = values.email.trim()
    const cleanPassword = values.password

    // Procedo con il login
    AuthService.login(cleanEmail, cleanPassword).then(
      (userData) => {
        // Recupera immediatamente il profilo completo per avere tutti i campi
        AuthService.getUserProfile()
          .then(() => {
            // Reindirizza alla home dopo aver aggiornato i dati
            navigate('/')
            window.location.reload()
          })
          .catch(() => {
            // Procedi comunque con il reindirizzamento
            navigate('/')
            window.location.reload()
          })
      },
      (error) => {
        let errorMessage = 'Errore durante il login. Riprova.'

        // Utilizzo il campo customMessage se presente
        if (error.customMessage) {
          errorMessage = error.customMessage
        }
        // Altrimenti cerco di estrarre il messaggio dalla risposta
        else if (error.response && error.response.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message
          } else if (typeof error.response.data === 'string') {
            errorMessage = error.response.data
          }
        }

        setMessage(errorMessage)
        setSuccessful(false)
        setLoading(false)
      }
    )
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-5">
              <Card.Title className="text-center mb-4">Accedi</Card.Title>

              {message && (
                <Alert variant={successful ? 'success' : 'danger'}>
                  {message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleInputChange}
                    placeholder="Inserisci la tua email"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={values.password}
                      onChange={handleInputChange}
                      placeholder="Inserisci la tua password"
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={togglePasswordVisibility}
                    >
                      <i
                        className={`bi ${
                          showPassword ? 'bi-eye-slash' : 'bi-eye'
                        }`}
                      ></i>
                    </Button>
                  </InputGroup>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="w-100"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="mr-2"
                        />{' '}
                        Accesso in corso...
                      </>
                    ) : (
                      'Accedi'
                    )}
                  </Button>
                </div>
              </Form>

              <div className="text-center mt-4">
                Non hai un account?{' '}
                <Link to="/register" className="text-primary">
                  Registrati
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default LoginPage
