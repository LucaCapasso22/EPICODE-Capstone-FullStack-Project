import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Form,
  Alert,
  Spinner,
} from 'react-bootstrap'
import ProductService from '../services/product.service'
import ProductReviews from '../components/ProductReviews'

const ProductDetailPage = ({ addToCart }) => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  // Immagine placeholder come data URI per fallback
  const placeholderImage =
    'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22400%22%20viewBox%3D%220%200%20400%20400%22%3E%3Crect%20width%3D%22400%22%20height%3D%22400%22%20fill%3D%22%23ddd%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20style%3D%22dominant-baseline%3Amiddle%3Btext-anchor%3Amiddle%3Bfont-size%3A24px%3Bfill%3A%23555%22%3EImmagine%20non%20disponibile%3C%2Ftext%3E%3C%2Fsvg%3E'

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await ProductService.getProductById(id)

        if (!data) {
          setError('Il prodotto richiesto non è stato trovato.')
          setProduct(null)
        } else {
          // Normalizziamo i dati del prodotto per gestire sia i nomi delle proprietà del backend che quelli del frontend
          const normalizedProduct = {
            ...data,
            // Gestiamo la proprietà dell'immagine che può essere sia imageUrl (backend) che image_url (dati mock)
            image_url: data.imageUrl || data.image_url,
            // Gestiamo la proprietà della disponibilità che può essere sia stockQuantity (backend) che stock_quantity (dati mock)
            stock_quantity: data.stockQuantity || data.stock_quantity || 0,
          }
          console.log('Prodotto normalizzato:', normalizedProduct)
          setProduct(normalizedProduct)
          setError(null)
        }
      } catch (err) {
        console.error('Errore durante il caricamento del prodotto:', err)
        if (err.response && err.response.status === 404) {
          setError('Il prodotto richiesto non è stato trovato.')
        } else {
          setError('Impossibile caricare il prodotto. Riprova più tardi.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      addToCart(product, quantity)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 3000)
    }
  }

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/products" className="btn btn-primary">
          Torna ai prodotti
        </Link>
      </Container>
    )
  }

  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Prodotto non trovato.</Alert>
        <Link to="/products" className="btn btn-primary">
          Torna ai prodotti
        </Link>
      </Container>
    )
  }

  return (
    <Container className="py-5">
      {addedToCart && (
        <Alert variant="success" className="mb-4">
          Prodotto aggiunto al carrello!
        </Alert>
      )}

      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <div className="product-image-container">
              <img
                src={product.image_url || product.imageUrl}
                alt={product.name}
                className="card-img-top product-image"
                style={{ maxHeight: '400px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.onerror = null
                  try {
                    e.target.src =
                      'https://placehold.co/400x400?text=Immagine+non+disponibile'
                  } catch (err) {
                    // Fallback finale a data URI in caso di errore
                    e.target.src = placeholderImage
                  }
                }}
              />
            </div>
          </Card>
        </Col>

        <Col md={6}>
          <h1 className="mb-2">{product.name}</h1>

          {product.brand && (
            <p className="text-muted mb-3">
              <i className="bi bi-tag me-2"></i>
              Marca: {product.brand}
            </p>
          )}

          <div className="mb-3">
            <Link
              to={`/products/category/${product.category}`}
              className="text-decoration-none"
            >
              <span className="badge bg-secondary">{product.category}</span>
            </Link>
          </div>

          <p className="fs-4 fw-bold text-primary mb-3">
            €{product.price?.toFixed(2)}
          </p>

          <div className="mb-4">
            <h5>Descrizione</h5>
            <p>{product.description}</p>
          </div>

          <div className="mb-4">
            <h5>Disponibilità</h5>
            {product.stock_quantity > 0 || product.stockQuantity > 0 ? (
              <p className="text-success">
                <i className="bi bi-check-circle-fill me-2"></i>
                Disponibile ({product.stock_quantity ||
                  product.stockQuantity}{' '}
                in magazzino)
              </p>
            ) : (
              <p className="text-danger">
                <i className="bi bi-x-circle-fill me-2"></i>
                Non disponibile
              </p>
            )}
          </div>

          {(product.stock_quantity > 0 || product.stockQuantity > 0) && (
            <div className="d-flex mb-4">
              <Form.Group className="me-3" style={{ width: '100px' }}>
                <Form.Label>Quantità</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={product.stock_quantity || product.stockQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </Form.Group>

              <div className="d-flex align-items-end">
                <Button
                  variant="primary"
                  onClick={handleAddToCart}
                  disabled={
                    product.stock_quantity <= 0 && product.stockQuantity <= 0
                  }
                >
                  <i className="bi bi-cart-plus me-2"></i>
                  Aggiungi al carrello
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4">
            <Link to="/products" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Torna ai prodotti
            </Link>
          </div>
        </Col>
      </Row>

      {/* Sezione recensioni */}
      <ProductReviews productId={id} />
    </Container>
  )
}

export default ProductDetailPage
