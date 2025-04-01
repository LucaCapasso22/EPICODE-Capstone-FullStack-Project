import React, { useState, useEffect } from 'react'
import { Modal, Form, Button } from 'react-bootstrap'

const NewsletterModal = () => {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // Controlla se l'utente ha già visto il modale
    const hasSeenModal = localStorage.getItem('hasSeenNewsletterModal')
    if (!hasSeenModal) {
      // Mostra il modale dopo 2 secondi
      const timer = setTimeout(() => {
        setShow(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setShow(false)
    localStorage.setItem('hasSeenNewsletterModal', 'true')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Qui puoi implementare la logica per salvare l'email
    setSubmitted(true)
    setTimeout(handleClose, 2000)
  }

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="sm"
      centered={false}
      className="newsletter-modal"
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        margin: 0,
        maxWidth: '300px',
        border: 'none',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <Modal.Header closeButton style={{ borderBottom: 'none' }}>
        <Modal.Title style={{ fontSize: '1.2rem' }}>
          <i className="bi bi-gift me-2"></i>
          Offerta Speciale!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!submitted ? (
          <>
            <p className="mb-3">
              Iscriviti alla nostra newsletter e ricevi subito uno sconto del{' '}
              <span className="text-primary fw-bold">10%</span> sul tuo primo
              ordine!
            </p>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Control
                  type="email"
                  placeholder="Inserisci la tua email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                className="w-100"
                style={{ backgroundColor: '#0d6efd' }}
              >
                Iscriviti e Ottieni lo Sconto
              </Button>
            </Form>
          </>
        ) : (
          <div className="text-center py-3">
            <i className="bi bi-check-circle-fill text-success fs-4 mb-2"></i>
            <p className="mb-0">
              Grazie per esserti iscritto! Il codice sconto ti verrà inviato via
              email.
            </p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default NewsletterModal
