import React, { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Navbar as BootstrapNavbar,
  Nav,
  Container,
  NavDropdown,
  Badge,
} from 'react-bootstrap'

const Navbar = ({ currentUser, cartItems, handleLogout }) => {
  const totalItems = cartItems
    ? cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
    : 0

  const [scrolled, setScrolled] = useState(false)

  // Gestione ombra durante lo scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)

    // Pulizia dell'event listener quando il componente viene smontato
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Log per debug
  React.useEffect(() => {
    if (currentUser) {
      console.log('Navbar - Dati utente:', currentUser)
      console.log(
        'Navbar - Nome visualizzato:',
        currentUser.firstName
          ? `${currentUser.firstName} ${currentUser.lastName || ''}`
          : currentUser.username || currentUser.email || 'Utente'
      )
    }
  }, [currentUser])

  return (
    <BootstrapNavbar
      expand="lg"
      variant={scrolled ? 'light' : 'dark'}
      bg={scrolled ? 'light' : 'dark'}
      sticky="top"
      className={`sticky-top w-100 ${scrolled ? 'scrolled' : ''}`}
      style={{
        zIndex: 1030,
        transition: 'all 0.3s ease-in-out',
        backgroundColor: scrolled
          ? 'rgba(255, 255, 255, 0.95)'
          : 'var(--bs-dark)',
        boxShadow: scrolled ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none',
      }}
    >
      <Container>
        <BootstrapNavbar.Brand
          as={Link}
          to="/"
          style={{
            color: scrolled ? '#000' : '#fff',
            transition: 'color 0.3s ease-in-out',
          }}
        >
          RN BMX Shop
        </BootstrapNavbar.Brand>

        {/* Logo centrale */}
        <div
          className="position-absolute d-none d-lg-block"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
          }}
        >
          <Link to="/">
            <img
              src={scrolled ? '/logo-rn-dark.png' : '/logo-rn.png'}
              alt="RN BMX Shop Logo"
              width="50"
              height="auto"
              style={{
                opacity: '0.9',
                transition: 'all 0.3s ease-in-out',
              }}
            />
          </Link>
        </div>

        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={NavLink}
              to="/"
              style={{
                color: scrolled ? '#000' : '#fff',
                transition: 'color 0.3s ease-in-out',
              }}
            >
              Home
            </Nav.Link>
            <Nav.Link
              as={NavLink}
              to="/products"
              style={{
                color: scrolled ? '#000' : '#fff',
                transition: 'color 0.3s ease-in-out',
              }}
            >
              Prodotti
            </Nav.Link>
            <NavDropdown
              title={
                <span
                  style={{
                    color: scrolled ? '#000' : '#fff',
                    transition: 'color 0.3s ease-in-out',
                  }}
                >
                  Categorie
                </span>
              }
              id="basic-nav-dropdown"
              menuVariant={scrolled ? 'light' : 'dark'}
            >
              <NavDropdown.Item
                as={NavLink}
                to="/products/category/Biciclette complete"
              >
                Biciclette complete
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/products/category/Componenti">
                Componenti
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/products/category/Protezioni">
                Protezioni
              </NavDropdown.Item>
              <NavDropdown.Item as={NavLink} to="/products/category/Accessori">
                Accessori
              </NavDropdown.Item>
              <NavDropdown.Item
                as={NavLink}
                to="/products/category/Abbigliamento"
              >
                Abbigliamento
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>

          <Nav>
            <Nav.Link
              as={NavLink}
              to="/cart"
              style={{
                color: scrolled ? '#000' : '#fff',
                transition: 'color 0.3s ease-in-out',
              }}
            >
              <i className="bi bi-cart3"></i>
              <Badge
                bg={scrolled ? 'dark' : 'light'}
                className="ms-1"
                style={{
                  color: scrolled ? '#fff' : '#000',
                  transition: 'all 0.3s ease-in-out',
                }}
              >
                {totalItems}
              </Badge>
            </Nav.Link>

            {currentUser ? (
              <>
                {currentUser.roles &&
                  currentUser.roles.includes('ROLE_ADMIN') && (
                    <Nav.Link
                      as={NavLink}
                      to="/admin"
                      style={{
                        color: scrolled ? '#000' : '#fff',
                        transition: 'color 0.3s ease-in-out',
                      }}
                    >
                      Admin Panel
                    </Nav.Link>
                  )}
                <NavDropdown
                  title={
                    <span
                      style={{
                        color: scrolled ? '#000' : '#fff',
                        transition: 'color 0.3s ease-in-out',
                      }}
                    >
                      {currentUser.firstName
                        ? `${currentUser.firstName} ${
                            currentUser.lastName || ''
                          }`
                        : currentUser.username || currentUser.email || 'Utente'}
                    </span>
                  }
                  id="basic-nav-dropdown"
                  menuVariant={scrolled ? 'light' : 'dark'}
                >
                  <NavDropdown.Item as={NavLink} to="/profile">
                    <i className="bi bi-person me-2"></i>Profilo
                  </NavDropdown.Item>
                  <NavDropdown.Item as={NavLink} to="/orders">
                    <i className="bi bi-box me-2"></i>I miei ordini
                  </NavDropdown.Item>
                  <NavDropdown.Item as={NavLink} to="/contatti">
                    <i className="bi bi-envelope me-2"></i>Contatti
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link
                  as={NavLink}
                  to="/login"
                  style={{
                    color: scrolled ? '#000' : '#fff',
                    transition: 'color 0.3s ease-in-out',
                  }}
                >
                  Login
                </Nav.Link>
                <Nav.Link
                  as={NavLink}
                  to="/register"
                  style={{
                    color: scrolled ? '#000' : '#fff',
                    transition: 'color 0.3s ease-in-out',
                  }}
                >
                  Registrati
                </Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  )
}

export default Navbar
