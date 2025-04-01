import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Spinner,
  Alert,
} from 'react-bootstrap'
import ProductService from '../services/product.service'

const ProductsPage = ({ addToCart }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const { categoryName } = useParams()
  const navigate = useNavigate()

  // Immagine placeholder come data URI per fallback
  const placeholderImage =
    'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20200%20200%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23ddd%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20style%3D%22dominant-baseline%3Amiddle%3Btext-anchor%3Amiddle%3Bfont-size%3A18px%3Bfill%3A%23555%22%3EImmagine%20non%20disponibile%3C%2Ftext%3E%3C%2Fsvg%3E'

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        let data = []

        if (categoryName) {
          data = await ProductService.getProductsByCategory(categoryName)
        } else {
          data = await ProductService.getAllProducts()
        }

        setProducts(data)
        setError(null)
      } catch (err) {
        console.error('Errore durante il caricamento dei prodotti:', err)
        setError('Impossibile caricare i prodotti. Riprova più tardi.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categoryName])

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const handleSortDirectionChange = (e) => {
    setSortDirection(e.target.value)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  const navigateToProductDetail = (productId) => {
    navigate(`/products/${productId}`)
  }

  // Filtra i prodotti in base alla ricerca
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Ordina i prodotti
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0

    if (sortBy === 'price') {
      comparison = a.price - b.price
    } else if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name)
    }

    return sortDirection === 'asc' ? comparison : -comparison
  })

  const pageTitle = categoryName
    ? `Prodotti nella categoria: ${categoryName}`
    : 'Tutti i prodotti'

  const handleAddToCart = (product, event) => {
    // Evita che il click sul pulsante faccia navigare al dettaglio prodotto
    event.stopPropagation()

    // Aggiungi il prodotto al carrello
    addToCart(product)

    // Puoi aggiungere una notifica o un feedback per l'utente
    // ad esempio con un toast o un alert temporaneo
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">{pageTitle}</h1>

      {error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group controlId="search">
                <Form.Control
                  type="text"
                  placeholder="Cerca prodotti..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Select value={sortBy} onChange={handleSortChange}>
                <option value="name">Ordina per nome</option>
                <option value="price">Ordina per prezzo</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={sortDirection}
                onChange={handleSortDirectionChange}
              >
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </Form.Select>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Caricamento...</span>
              </Spinner>
            </div>
          ) : (
            <>
              {sortedProducts.length === 0 ? (
                <Alert variant="info" className="my-4">
                  Nessun prodotto trovato.
                </Alert>
              ) : (
                <Row xs={1} md={2} lg={3} className="g-4">
                  {sortedProducts.map((product) => (
                    <Col key={product.id}>
                      <Card className="h-100 shadow-sm product-card">
                        <div
                          className="product-image-container"
                          style={{ cursor: 'pointer' }}
                          onClick={() => navigateToProductDetail(product.id)}
                        >
                          <Card.Img
                            variant="top"
                            src={product.image_url || product.imageUrl}
                            alt={product.name}
                            className="product-image"
                            style={{ height: '200px', objectFit: 'contain' }}
                            onError={(e) => {
                              e.target.onerror = null
                              try {
                                e.target.src =
                                  'https://placehold.co/200x200?text=Immagine+non+disponibile'
                              } catch (err) {
                                // Fallback finale a data URI in caso di errore
                                e.target.src = placeholderImage
                              }
                            }}
                          />
                        </div>
                        <Card.Body className="d-flex flex-column">
                          <Card.Title
                            className="fs-5"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigateToProductDetail(product.id)}
                          >
                            {product.name}
                          </Card.Title>
                          <div className="mb-2">
                            <span className="badge bg-secondary">
                              {product.category}
                            </span>
                          </div>
                          <Card.Text className="small text-muted text-truncate">
                            {product.description}
                          </Card.Text>
                          <div className="d-flex align-items-center mt-auto">
                            {(product.stockQuantity || product.stock_quantity) >
                            0 ? (
                              <i className="bi bi-check-circle-fill text-success"></i>
                            ) : (
                              <i className="bi bi-x-circle-fill text-danger"></i>
                            )}
                            <span
                              className="ms-2 fw-bold"
                              style={{ color: '#000000', fontSize: '1.1rem' }}
                            >
                              €{product.price.toFixed(2)}
                            </span>
                            <Button
                              variant="primary"
                              size="sm"
                              className="ms-auto"
                              onClick={(e) => handleAddToCart(product, e)}
                              disabled={
                                (product.stockQuantity ||
                                  product.stock_quantity) <= 0
                              }
                            >
                              <i className="bi bi-cart-plus me-1"></i>
                              Aggiungi
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </>
          )}
        </>
      )}
    </Container>
  )
}

export default ProductsPage
