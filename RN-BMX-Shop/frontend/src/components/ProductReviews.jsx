import React, { useState, useEffect } from 'react'
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap'
import ReviewService from '../services/review.service'
import AuthService from '../services/auth.service'
import { FaStar, FaRegStar, FaTrash } from 'react-icons/fa'

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(null)

  // Stati per il form
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [formError, setFormError] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)

  const currentUser = AuthService.getCurrentUser()

  useEffect(() => {
    loadReviews()
  }, [productId])

  const loadReviews = () => {
    setLoading(true)
    setError(null) // Reset errore precedente
    console.log('Caricamento recensioni per il prodotto ID:', productId)

    ReviewService.getReviewsByProductId(productId)
      .then((data) => {
        console.log('Recensioni caricate con successo:', data)
        setReviews(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Errore durante il caricamento delle recensioni:', err)

        // Messaggio di errore più dettagliato
        let errorMessage =
          'Impossibile caricare le recensioni. Riprova più tardi.'
        if (err.response) {
          if (err.response.status === 401) {
            errorMessage =
              'Errore di autenticazione nel caricamento delle recensioni.'
          } else if (err.response.status === 404) {
            errorMessage = 'Recensioni non trovate per questo prodotto.'
          } else if (err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message
          }
        }

        setError(errorMessage)
        setLoading(false)
      })
  }

  // Funzione per aggiornare manualmente le recensioni
  const handleRefreshReviews = () => {
    console.log('Aggiornamento manuale delle recensioni')
    loadReviews()
  }

  // Funzione per eliminare una recensione
  const handleDeleteReview = (reviewId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questa recensione?')) {
      return
    }

    setDeleteLoading(reviewId)

    ReviewService.deleteReview(reviewId)
      .then(() => {
        console.log(`Recensione ${reviewId} eliminata con successo`)
        // Rimuovi la recensione dalla lista
        const updatedReviews = reviews.filter(
          (review) => review.id !== reviewId
        )
        setReviews(updatedReviews)
        setSuccessMessage('Recensione eliminata con successo')

        // Nascondi il messaggio dopo 3 secondi
        setTimeout(() => {
          setSuccessMessage('')
        }, 3000)
      })
      .catch((error) => {
        console.error("Errore durante l'eliminazione della recensione:", error)
        setError('Impossibile eliminare la recensione. Riprova più tardi.')

        // Nascondi il messaggio di errore dopo 5 secondi
        setTimeout(() => {
          setError(null)
        }, 5000)
      })
      .finally(() => {
        setDeleteLoading(null)
      })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validazione
    if (!rating) {
      setFormError('Seleziona una valutazione da 1 a 5 stelle')
      return
    }

    if (!title.trim()) {
      setFormError('Inserisci un titolo per la tua recensione')
      return
    }

    if (!comment.trim()) {
      setFormError('Inserisci un commento per la tua recensione')
      return
    }

    setFormError('')
    setSubmitLoading(true)

    const reviewData = {
      rating,
      title,
      comment,
    }

    ReviewService.addReview(productId, reviewData)
      .then((response) => {
        setSuccessMessage('Recensione aggiunta con successo!')
        // Reset del form
        setRating(0)
        setTitle('')
        setComment('')
        setShowForm(false)
        setSubmitLoading(false)

        // Aggiungi immediatamente la nuova recensione alla lista locale
        // invece di aspettare il ricaricamento completo
        const newReviews = [...reviews, response]
        setReviews(newReviews)
        console.log('Recensione aggiunta localmente:', response)
        console.log('Nuova lista recensioni:', newReviews)

        // Nascondi il messaggio di successo dopo 3 secondi
        setTimeout(() => {
          setSuccessMessage('')
        }, 3000)
      })
      .catch((error) => {
        const errorMsg =
          error.response?.data?.message ||
          "Errore durante l'invio della recensione"
        setFormError(errorMsg)
        setSubmitLoading(false)
      })
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('it-IT', options)
  }

  // Verifica se l'utente corrente è l'autore della recensione
  const isOwnReview = (review) => {
    if (!currentUser) return false
    return (
      review.user &&
      (review.user.id === 999 ||
        (currentUser.id && review.user.id === currentUser.id))
    )
  }

  const StarRating = ({ value, hover, onChange, onHover, onLeave }) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1
          return (
            <span
              key={index}
              style={{
                cursor: 'pointer',
                fontSize: '1.5rem',
                color: '#FFD700',
              }}
              onClick={() => onChange && onChange(ratingValue)}
              onMouseEnter={() => onHover && onHover(ratingValue)}
              onMouseLeave={() => onLeave && onLeave()}
            >
              {ratingValue <= (hover || value) ? <FaStar /> : <FaRegStar />}
            </span>
          )
        })}
      </div>
    )
  }

  return (
    <div className="product-reviews mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="m-0">Recensioni</h3>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={handleRefreshReviews}
          disabled={loading}
        >
          {loading ? 'Aggiornamento...' : 'Aggiorna recensioni'}
        </Button>
      </div>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {!showForm && currentUser && (
        <Button
          variant="outline-primary"
          className="mb-4"
          onClick={() => setShowForm(true)}
        >
          Scrivi una recensione
        </Button>
      )}

      {!currentUser && (
        <Alert variant="info" className="mb-4">
          <a href="/login" className="alert-link">
            Accedi
          </a>{' '}
          o{' '}
          <a href="/register" className="alert-link">
            registrati
          </a>{' '}
          per lasciare una recensione.
        </Alert>
      )}

      {showForm && (
        <Card className="mb-4">
          <Card.Body>
            <h4 className="mb-3">Scrivi una recensione</h4>

            {formError && <Alert variant="danger">{formError}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Valutazione</Form.Label>
                <div>
                  <StarRating
                    value={rating}
                    hover={hoverRating}
                    onChange={setRating}
                    onHover={setHoverRating}
                    onLeave={() => setHoverRating(0)}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Titolo</Form.Label>
                <Form.Control
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Inserisci un titolo per la tua recensione"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Commento</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Condividi la tua esperienza con questo prodotto"
                  required
                />
              </Form.Group>

              <div className="d-flex">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => {
                    setShowForm(false)
                    setFormError('')
                  }}
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Invio in corso...' : 'Invia recensione'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}

      {loading ? (
        <p>Caricamento recensioni...</p>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : reviews.length === 0 ? (
        <Alert variant="light">
          Nessuna recensione per questo prodotto. Sii il primo a scriverne una!
        </Alert>
      ) : (
        <Row>
          {reviews.map((review) => (
            <Col md={12} key={review.id} className="mb-3">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <StarRating value={review.rating} />
                      <h5 className="mt-2 mb-0">{review.title}</h5>
                    </div>
                    <div className="d-flex align-items-center">
                      <small className="text-muted me-3">
                        {formatDate(review.createdAt)}
                      </small>
                      {isOwnReview(review) && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deleteLoading === review.id}
                          title="Elimina recensione"
                        >
                          {deleteLoading === review.id ? (
                            'Eliminazione...'
                          ) : (
                            <FaTrash />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <Card.Text>{review.comment}</Card.Text>
                  <small className="text-muted">
                    Recensione di {review.user?.name || 'Utente'}
                  </small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}

export default ProductReviews
