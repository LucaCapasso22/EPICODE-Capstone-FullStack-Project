import React, { useState, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './styles/custom.css'
// import { toast } from 'react-hot-toast'

// Componenti layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Servizi
import AuthService from './services/auth.service'

// Pagine
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import NotFoundPage from './pages/NotFoundPage'
import AboutUsPage from './pages/AboutUsPage'
import ContactPage from './pages/ContactPage'

// Componente per scorrere all'inizio della pagina quando cambia la rotta
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  const [currentUser, setCurrentUser] = useState(undefined)
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart')
    return savedCart ? JSON.parse(savedCart) : []
  })
  const [currentPath, setCurrentPath] = useState('')
  const [showAdminBoard, setShowAdminBoard] = useState(false)

  useEffect(() => {
    // Salva carrello nello storage locale
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  useEffect(() => {
    const location = window.location.pathname
    setCurrentPath(location)

    const urlParams = new URLSearchParams(window.location.search)
    const expiredParam = urlParams.get('expired')

    // Se c'è il parametro 'expired' nell'URL, mostra un messaggio
    if (expiredParam === 'true') {
      // Usiamo un alert standard invece di toast
      alert('La sessione è scaduta. Effettua nuovamente il login.')
      // Rimuovi il parametro dall'URL per evitare messaggi multipli
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    // Carica i dati utente e aggiorna lo stato
    loadUserData()
  }, [])

  // Funzione per caricare i dati utente
  const loadUserData = () => {
    const user = AuthService.getCurrentUser()
    if (user) {
      // Se l'utente è autenticato, proviamo a ottenere i dati più recenti dal server
      console.log('App: Caricamento dati utente iniziale', user)
      setCurrentUser(user)
      setShowAdminBoard(user.roles && user.roles.includes('ROLE_ADMIN'))

      // Aggiorna i dati dell'utente con quelli più recenti dal server
      AuthService.getUserProfile()
        .then((response) => {
          console.log('App: Dati utente aggiornati dal server', response.data)
          const updatedUser = response.data
          // Aggiorna lo stato dell'app con i dati più recenti
          setCurrentUser(updatedUser)
          setShowAdminBoard(
            updatedUser.roles && updatedUser.roles.includes('ROLE_ADMIN')
          )
        })
        .catch((err) => {
          console.error('App: Errore nel recupero del profilo aggiornato', err)
          // Se c'è un errore, continuiamo a utilizzare i dati dalla cache locale
        })
    }
  }

  const handleLogout = () => {
    AuthService.logout()
    setCurrentUser(undefined)
    window.location.href = '/'
  }

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      // Cerca se il prodotto è già nel carrello
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id
      )

      if (existingItemIndex >= 0) {
        // Se il prodotto esiste, aggiorna la quantità
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += quantity
        return updatedItems
      } else {
        // Altrimenti aggiungi il nuovo prodotto
        return [...prevItems, { ...product, quantity }]
      }
    })
  }

  const updateCartItem = (productId, quantity) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => (item.id === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar
        currentUser={currentUser}
        cartItems={cartItems}
        handleLogout={handleLogout}
      />

      <main className="flex-grow-1">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/products"
            element={<ProductsPage addToCart={addToCart} />}
          />
          <Route
            path="/products/category/:categoryName"
            element={<ProductsPage addToCart={addToCart} />}
          />
          <Route
            path="/products/:id"
            element={<ProductDetailPage addToCart={addToCart} />}
          />
          <Route
            path="/cart"
            element={
              <CartPage
                cartItems={cartItems}
                updateItemQuantity={updateCartItem}
                removeFromCart={removeFromCart}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                cartItems={cartItems}
                clearCart={clearCart}
                currentUser={currentUser}
              />
            }
          />
          <Route
            path="/profile"
            element={<ProfilePage currentUser={currentUser} />}
          />
          <Route
            path="/orders"
            element={<OrdersPage currentUser={currentUser} />}
          />
          <Route
            path="/admin"
            element={<AdminDashboardPage currentUser={currentUser} />}
          />
          <Route path="/chi-siamo" element={<AboutUsPage />} />
          <Route path="/contatti" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
