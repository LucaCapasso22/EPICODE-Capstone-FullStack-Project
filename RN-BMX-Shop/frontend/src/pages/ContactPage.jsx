import React, { useState } from 'react'
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap'
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderId: '',
    subject: '',
    message: '',
    attachments: [],
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }))
  }

  const removeFile = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitted(false)

    try {
      // Qui implementeremo la logica per inviare il form al backend
      // Per ora simuliamo un invio riuscito
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        orderId: '',
        subject: '',
        message: '',
        attachments: [],
      })
    } catch (err) {
      setError(
        "Si è verificato un errore durante l'invio del form. Riprova più tardi."
      )
    }
  }

  return (
    <Container className="py-5">
      <Row>
        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h3 className="mb-4">Informazioni di Contatto</h3>
              <div className="d-flex align-items-center mb-3">
                <FaEnvelope
                  className="me-3"
                  style={{ color: '#FF5500' }}
                  size={24}
                />
                <div>
                  <h6 className="mb-0">Email</h6>
                  <p className="mb-0">info@rnbmxshop.com</p>
                </div>
              </div>
              <div className="d-flex align-items-center mb-3">
                <FaPhone
                  className="me-3"
                  style={{ color: '#FF5500' }}
                  size={24}
                />
                <div>
                  <h6 className="mb-0">Telefono</h6>
                  <p className="mb-0">+39 123 456 7890</p>
                </div>
              </div>
              <div className="d-flex align-items-center">
                <FaMapMarkerAlt
                  className="me-3"
                  style={{ color: '#FF5500' }}
                  size={24}
                />
                <div>
                  <h6 className="mb-0">Indirizzo</h6>
                  <p className="mb-0">
                    Centro Direzionale, Isola E7, Napoli, Italia
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body>
              <h3 className="mb-4">Invia una Richiesta</h3>
              {submitted && (
                <Alert variant="success" className="mb-4">
                  La tua richiesta è stata inviata con successo! Ti risponderemo
                  al più presto.
                </Alert>
              )}
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Nome e Cognome</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>ID Ordine (se applicabile)</Form.Label>
                  <Form.Control
                    type="text"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    placeholder="Inserisci l'ID del tuo ordine se la richiesta è relativa a un acquisto"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Oggetto</Form.Label>
                  <Form.Select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Seleziona un oggetto</option>
                    <option value="dubbi">Dubbi sui prodotti</option>
                    <option value="reso">Richiesta di reso</option>
                    <option value="reclamo">Reclamo</option>
                    <option value="altro">Altro</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Messaggio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Allegati</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <Form.Text className="text-muted">
                    Puoi caricare immagini, PDF e documenti Word. Dimensione
                    massima: 5MB per file.
                  </Form.Text>
                </Form.Group>

                {formData.attachments.length > 0 && (
                  <div className="mb-3">
                    <h6>File allegati:</h6>
                    <ul className="list-unstyled">
                      {formData.attachments.map((file, index) => (
                        <li
                          key={index}
                          className="d-flex align-items-center mb-2"
                        >
                          <span className="me-2">{file.name}</span>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            Rimuovi
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-100"
                  style={{
                    backgroundColor: '#FF5500',
                    border: 'none',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF7733'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF5500'
                  }}
                >
                  Invia Richiesta
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default ContactPage
