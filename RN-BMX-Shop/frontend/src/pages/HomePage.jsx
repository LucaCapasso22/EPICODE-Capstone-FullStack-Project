import React, { useState, useEffect } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Form,
} from 'react-bootstrap'
import { Link } from 'react-router-dom'

const mockProducts = [
  {
    id: 1,
    name: 'BMX Wethepeople Reason',
    description: 'Bicicletta BMX professionale per freestyle e trick.',
    price: 779.0,
    stock_quantity: 15,
    category: 'Biciclette complete',
    image_url:
      'https://eu.sourcebmx.com/cdn/shop/files/006cfaa2-c398-4189-88d2-ce6879829063_720x.jpg?v=1741006450',
    featured: true,
  },
  {
    id: 165,
    name: 'BMX Stay Strong PWR Pro',
    description: 'Bicicletta BMX da gara leggera e aerodinamica.',
    price: 559.95,
    stock_quantity: 8,
    category: 'Biciclette complete',
    image_url:
      'https://eu.sourcebmx.com/cdn/shop/files/3042c9d1-c01d-4363-b6dd-a1682687f966_720x.jpg?v=1718635845',
    featured: true,
  },
  {
    id: 177,
    name: 'Felpa RN BMX',
    description: 'Felpa ufficiale del team RN BMX, traspirante e confortevole.',
    price: 29.99,
    stock_quantity: 50,
    category: 'Abbigliamento',
    image_url: '/felpa-crew.jpg',
    featured: true,
  },
]

const mockCategories = [
  {
    id: 1,
    name: 'Biciclette complete',
    image_url:
      'https://eu.sourcebmx.com/cdn/shop/files/BMX-BIKES_FEATURED-TILES_-min_400x.jpg?v=1707486202',
  },
  {
    id: 2,
    name: 'Componenti',
    image_url:
      'https://eu.sourcebmx.com/cdn/shop/files/PARTS-min_400x.jpg?v=1707486202',
  },
  {
    id: 3,
    name: 'Accessori',
    image_url:
      'https://eu.sourcebmx.com/cdn/shop/files/WHEELS-min_400x.jpg?v=1707486202',
  },
  {
    id: 4,
    name: 'Abbigliamento',
    image_url:
      'https://eu.sourcebmx.com/cdn/shop/files/SOFTGOODS-min_400x.jpg?v=1707486202',
  },
]

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false)

  // Immagine placeholder come data URI per fallback
  const placeholderImage =
    'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20200%20200%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23ddd%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20style%3D%22dominant-baseline%3Amiddle%3Btext-anchor%3Amiddle%3Bfont-size%3A18px%3Bfill%3A%23555%22%3EImmagine%20non%20disponibile%3C%2Ftext%3E%3C%2Fsvg%3E'

  useEffect(() => {
    // Simulazione caricamento dati
    const fetchData = async () => {
      try {
        setLoading(true)
        // Carica dati mock
        setFeaturedProducts(mockProducts)
        setCategories(mockCategories)
      } catch (error) {
        console.error('Errore durante il caricamento dei dati:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    // Qui andrebbe implementata la logica per inviare l'email al backend
    setNewsletterSubmitted(true)
    setEmail('')
  }

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </Container>
    )
  }

  return (
    <>
      <Container fluid className="px-0">
        {/* Hero Section */}
        <section className="hero-section">
          <Container>
            <div className="hero-content">
              <h1>RN BMX Shop</h1>
              <p>
                Il miglior negozio di BMX in Italia, con una vasta selezione di
                bici, componenti e accessori.
              </p>
              <Button
                variant="primary"
                size="lg"
                as={Link}
                to="/products"
                className="px-4 py-2"
              >
                Esplora Prodotti
              </Button>
            </div>
          </Container>
        </section>

        {/* Sezione Categorie */}
        <section className="py-5">
          <Container>
            <h2 className="text-center mb-5">Categorie</h2>
            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <Row>
                {categories.map((category) => (
                  <Col md={3} key={category.id} className="mb-4">
                    <Card
                      className="h-100 shadow-sm category-card"
                      style={{
                        borderRadius: '5%',
                        transform: 'scale(1.05)',
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.08)'
                        e.currentTarget.style.boxShadow =
                          '0 10px 20px rgba(0,0,0,0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow =
                          '0 4px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div
                        className="category-image position-relative"
                        style={{
                          height: '300px',
                          backgroundImage: `url(${category.image_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: '5%',
                          overflow: 'hidden',
                          transition: 'transform 0.3s ease-in-out',
                        }}
                      >
                        <div
                          className="position-absolute w-100 d-flex flex-column justify-content-center align-items-center"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            bottom: 0,
                            left: 0,
                            padding: '20px 0',
                            borderBottomLeftRadius: '5%',
                            borderBottomRightRadius: '5%',
                            transition: 'all 0.3s ease-in-out',
                          }}
                        >
                          <Card.Title
                            className="text-white mb-3"
                            style={{
                              fontSize: '1.5rem',
                              fontWeight: 'bold',
                              transition: 'transform 0.3s ease',
                            }}
                          >
                            {category.name}
                          </Card.Title>
                          <Link
                            to={`/products/category/${category.name}`}
                            className="btn btn-sm"
                            style={{
                              backgroundColor: '#FF5500',
                              color: 'white',
                              borderColor: '#FF5500',
                              transition: 'all 0.3s ease',
                              transform: 'translateY(0)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#FF7733'
                              e.currentTarget.style.transform =
                                'translateY(-3px)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#FF5500'
                              e.currentTarget.style.transform = 'translateY(0)'
                            }}
                          >
                            Esplora
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Container>
        </section>

        {/* Sezione Prodotti in Evidenza */}
        <section className="py-5 bg-light">
          <Container>
            <h2 className="text-center mb-5">Prodotti in Evidenza</h2>
            {loading ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <Row>
                {featuredProducts.map((product) => (
                  <Col md={4} key={product.id} className="mb-4">
                    <Card
                      className="h-100 shadow-sm product-card"
                      style={{
                        borderRadius: '5%',
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.08)'
                        e.currentTarget.style.boxShadow =
                          '0 10px 20px rgba(0,0,0,0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1.0)'
                        e.currentTarget.style.boxShadow = ''
                      }}
                    >
                      <div
                        className="position-relative"
                        style={{
                          height: '300px',
                          overflow: 'hidden',
                          borderRadius: '5%',
                        }}
                      >
                        <Card.Img
                          variant="top"
                          src={product.image_url || product.imageUrl}
                          alt={product.name}
                          style={{
                            height: '100%',
                            width: '100%',
                            objectFit: 'cover',
                            borderRadius: '5%',
                          }}
                          onError={(e) => {
                            e.target.onerror = null
                            try {
                              e.target.src = placeholderImage
                            } catch (err) {
                              e.target.src = placeholderImage
                            }
                          }}
                        />
                        <div
                          className="position-absolute w-100 d-flex flex-column justify-content-end align-items-center"
                          style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            padding: '20px',
                            borderRadius: '5%',
                          }}
                        >
                          <Card.Title className="text-white mb-2">
                            {product.name}
                          </Card.Title>
                          <Card.Text className="text-white small mb-2">
                            {product.description.substring(0, 60)}
                            {product.description.length > 60 ? '...' : ''}
                          </Card.Text>
                          <Card.Text className="text-white fw-bold mb-3">
                            €{product.price.toFixed(2)}
                          </Card.Text>
                          <Link
                            to={`/products/${product.id}`}
                            className="btn btn-sm"
                            style={{
                              backgroundColor: '#FF5500',
                              color: 'white',
                              borderColor: '#FF5500',
                              transition: 'all 0.3s ease',
                              transform: 'translateY(0)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#FF7733'
                              e.currentTarget.style.transform =
                                'translateY(-3px)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#FF5500'
                              e.currentTarget.style.transform = 'translateY(0)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Dettagli
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Container>
        </section>

        {/* Newsletter Bar */}
        <section className="py-4">
          <Container>
            <div
              style={{
                backgroundColor: '#FF5500',
                padding: '1.5rem',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              }}
            >
              <Row className="align-items-center">
                <Col md={8}>
                  <h4 className="mb-0 text-white">
                    Iscriviti alla newsletter e ottieni il 10% di sconto sul tuo
                    primo ordine!
                  </h4>
                  <small className="text-white" style={{ opacity: 0.8 }}>
                    Ricevi aggiornamenti sui nuovi prodotti e offerte esclusive
                  </small>
                </Col>
                <Col md={4}>
                  {!newsletterSubmitted ? (
                    <Form
                      onSubmit={handleNewsletterSubmit}
                      className="d-flex gap-2"
                    >
                      <Form.Control
                        type="email"
                        placeholder="Inserisci la tua email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white"
                        style={{
                          border: 'none',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      />
                      <Button
                        type="submit"
                        style={{
                          backgroundColor: '#FF7733',
                          border: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#FF8844'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow =
                            '0 4px 8px rgba(0,0,0,0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FF7733'
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow =
                            '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        Iscriviti
                      </Button>
                    </Form>
                  ) : (
                    <div className="text-center">
                      <p className="mb-0 text-white" style={{ opacity: 0.9 }}>
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Grazie per esserti iscritto! Controlla la tua email per
                        il codice sconto.
                      </p>
                    </div>
                  )}
                </Col>
              </Row>
            </div>
          </Container>
        </section>

        {/* About Us Section */}
        <section className="py-5 bg-light">
          <Container>
            <Row className="align-items-center">
              <Col md={6}>
                <h2>Chi Siamo</h2>
                <p>
                  RN BMX Shop è il negozio di riferimento per gli appassionati
                  di BMX in Italia. Offriamo una vasta gamma di biciclette
                  complete, componenti, accessori e abbigliamento dei migliori
                  marchi sul mercato.
                </p>
                <p>
                  Il nostro team è composto da rider esperti, pronti a
                  consigliarti il prodotto migliore per le tue esigenze.
                </p>
                <Button variant="outline-primary" as={Link} to="/chi-siamo">
                  Scopri di più
                </Button>
              </Col>
              <Col md={6}>
                <img
                  src="https://scontent-mxp2-1.xx.fbcdn.net/v/t39.30808-6/462911319_3950725121823488_824003198893335254_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=QPWmA15-0PcQ7kNvgFKNw3N&_nc_oc=Adlg9_tBw-92caFesA4owPyg-Lt_xCwbZnyCM9uyTNWBi49uMeUDMCJWMfFqBoTQ6N0&_nc_zt=23&_nc_ht=scontent-mxp2-1.xx&_nc_gid=1KHj7bvS3Uf6YTeuUwz7tg&oh=00_AYGB2okZ2Qnd98jaG6Po4LX1j9T1LfVblhQhnwQ4JFVVQA&oe=67EB6A30"
                  alt="Il nostro negozio"
                  className="img-fluid rounded shadow"
                />
              </Col>
            </Row>
          </Container>
        </section>
      </Container>
    </>
  )
}

export default HomePage
