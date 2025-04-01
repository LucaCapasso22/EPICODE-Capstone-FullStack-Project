import React, { useEffect } from 'react'
import { Container, Row, Col, Card, Image } from 'react-bootstrap'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const AboutUsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1
              className="text-center mb-4 display-4 fw-bold"
              style={{ color: '#FF5500' }}
            >
              Chi Siamo
            </h1>
            <div className="text-center mx-auto" style={{ maxWidth: '700px' }}>
              <p className="lead mb-4">
                Street BMX Crew nata a Napoli nel 2009. Quello che ci unisce è
                la passione per questo sport, e la voglia di migliorare ogni
                giorno insieme a quella che più che una crew, è una famiglia.
              </p>
            </div>
          </motion.div>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col xs={12} md={4} className="mb-4 mb-md-0">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card
              className="border-0 shadow h-100"
              style={{ borderColor: '#dedede' }}
            >
              <Card.Img
                variant="top"
                src="/1.jpg"
                alt="BMX Rider esegue un trick"
                style={{
                  height: '350px',
                  objectFit: 'cover',
                  objectPosition: 'center bottom',
                }}
              />
              <Card.Body className="p-3" style={{ height: '150px' }}>
                <Card.Title
                  className="fw-bold"
                  style={{ color: '#FF5500', fontSize: '1.1rem' }}
                >
                  I Nostri Inizi
                </Card.Title>
                <Card.Text style={{ fontSize: '0.9rem' }}>
                  La nostra crew nasce dalla passione di un gruppo di amici che
                  condividono l'amore per il BMX. Dal 2009 ci dedichiamo a
                  costruire una comunità solida e inclusiva.
                </Card.Text>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col xs={12} md={4} className="mb-4 mb-md-0">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Card
              className="border-0 shadow h-100"
              style={{ borderColor: '#dedede' }}
            >
              <Card.Img
                variant="top"
                src="/2.jpeg"
                alt="Gruppo BMX durante un evento"
                style={{ height: '350px', objectFit: 'cover' }}
              />
              <Card.Body className="p-3" style={{ height: '150px' }}>
                <Card.Title
                  className="fw-bold"
                  style={{ color: '#FF5500', fontSize: '1.1rem' }}
                >
                  La Nostra Passione
                </Card.Title>
                <Card.Text style={{ fontSize: '0.9rem' }}>
                  Ogni giorno ci impegniamo per migliorare le nostre abilità,
                  condividere conoscenze e supportarci a vicenda sia dentro che
                  fuori dalle rampe.
                </Card.Text>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        <Col xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card
              className="border-0 shadow h-100"
              style={{ borderColor: '#dedede' }}
            >
              <Card.Img
                variant="top"
                src="/3.jpeg"
                alt="Evento BMX con pubblico"
                style={{ height: '350px', objectFit: 'cover' }}
              />
              <Card.Body className="p-3" style={{ height: '150px' }}>
                <Card.Title
                  className="fw-bold"
                  style={{ color: '#FF5500', fontSize: '1.1rem' }}
                >
                  La Nostra Famiglia
                </Card.Title>
                <Card.Text style={{ fontSize: '0.9rem' }}>
                  Più che una crew, siamo una famiglia. Condividiamo gioie,
                  successi, cadute e momenti difficili, sostenendoci sempre l'un
                  l'altro.
                </Card.Text>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card
              className="border-0 shadow"
              style={{ borderColor: '#dedede' }}
            >
              <Card.Body className="p-5">
                <h3 className="mb-4 fw-bold" style={{ color: '#FF5500' }}>
                  La Nostra Storia
                </h3>
                <p>
                  Nati a Napoli nel 2009, la nostra crew ha iniziato con pochi
                  riders appassionati che si trovavano nei parchi locali. Nel
                  corso degli anni, siamo cresciuti fino a diventare la
                  community di BMX più attiva della regione Campania.
                </p>
                <p>
                  Organizziamo eventi, competizioni amichevoli e workshop per
                  condividere la nostra passione con i più giovani e chiunque
                  voglia avvicinarsi a questo sport. Il nostro obiettivo è
                  diffondere la cultura del BMX e creare uno spazio sicuro e
                  inclusivo dove tutti possano esprimersi.
                </p>
                <p>
                  Quello che è iniziato come una passione condivisa si è
                  trasformato col tempo in un business di successo. Nel 2015
                  abbiamo aperto il nostro negozio specializzato, dove offriamo
                  prodotti selezionati dai migliori brand e la consulenza di
                  rider esperti. Oltre a praticare lo sport, ci impegniamo anche
                  a supportare progetti locali per la costruzione e manutenzione
                  di skate park e aree dedicate al BMX, collaborando con le
                  amministrazioni locali per creare spazi adeguati per i riders.
                </p>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row>
        <Col>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Card
              className="border-0 shadow bg-dark text-white"
              style={{ borderColor: '#222' }}
            >
              <Card.Body className="p-5">
                <h3 className="mb-4 fw-bold" style={{ color: '#FF5500' }}>
                  Unisciti A Noi
                </h3>
                <p>
                  Che tu sia un rider esperto o un principiante, le porte della
                  nostra crew sono sempre aperte. Organizziamo incontri
                  settimanali nei principali skate park di Napoli e dintorni.
                </p>
                <p>
                  Seguici sui social media per rimanere aggiornato sui prossimi
                  eventi e incontri. Non esitare a contattarci se vuoi unirti a
                  noi o semplicemente saperne di più sulla nostra passione!
                </p>
                <div className="d-flex justify-content-center mt-4">
                  <Link
                    to="/contatti"
                    className="btn px-4 py-2 me-3"
                    style={{
                      backgroundColor: '#FF5500',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = '#FF7733')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = '#FF5500')
                    }
                  >
                    Contattaci
                  </Link>
                  <button
                    className="btn btn-outline-light px-4 py-2"
                    style={{
                      borderRadius: '5px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Seguici sui Social
                  </button>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  )
}

export default AboutUsPage
