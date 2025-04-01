import React, { useState, useEffect } from 'react'
import ProductService from '../services/product.service'
import OrderService from '../services/order.service'
import UserService from '../services/user.service'

function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])

  // Stato per gestire il modal di modifica prodotto
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productFormData, setProductFormData] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    categoryId: '',
    category: '',
    imageUrl: '',
    brand: 'RN BMX Shop',
    featured: false,
  })

  // Stato per gestire il modal di modifica utente
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userFormData, setUserFormData] = useState({
    id: '',
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    roles: [],
  })

  // Immagine placeholder come data URI per fallback
  const placeholderImage =
    'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2250%22%20height%3D%2250%22%20viewBox%3D%220%200%2050%2050%22%3E%3Crect%20width%3D%2250%22%20height%3D%2250%22%20fill%3D%22%23ddd%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20style%3D%22dominant-baseline%3Amiddle%3Btext-anchor%3Amiddle%3Bfont-size%3A12px%3Bfill%3A%23555%22%3EN%2FA%3C%2Ftext%3E%3C%2Fsvg%3E'
  const largeplaceholderImage =
    'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%23ddd%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20style%3D%22dominant-baseline%3Amiddle%3Btext-anchor%3Amiddle%3Bfont-size%3A14px%3Bfill%3A%23555%22%3EImmagine%20non%20disponibile%3C%2Ftext%3E%3C%2Fsvg%3E'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log(`Caricamento dati per tab: ${activeTab}`)

        if (activeTab === 'products') {
          console.log('Recupero prodotti...')
          const productsResponse = await ProductService.getAllProducts()
          console.log('Risposta prodotti ricevuta:', productsResponse)

          // Determina se la risposta è già prodotti o contiene dati
          const productsData = Array.isArray(productsResponse)
            ? productsResponse
            : productsResponse.data || []

          console.log('Prodotti da visualizzare:', productsData)
          setProducts(productsData)

          // Carica anche le categorie
          console.log('Recupero categorie...')
          const categoriesResponse = await ProductService.getCategories()
          console.log('Risposta categorie ricevuta:', categoriesResponse)

          // Determina se la risposta è già categorie o contiene dati
          const categoriesData = Array.isArray(categoriesResponse)
            ? categoriesResponse
            : categoriesResponse.data || []

          console.log('Categorie da visualizzare:', categoriesData)
          setCategories(categoriesData)
        } else if (activeTab === 'orders') {
          console.log('Recupero ordini...')
          const response = await OrderService.getAllOrders()
          console.log('Risposta ordini ricevuta:', response)
          setOrders(response.data || [])
        } else if (activeTab === 'users') {
          console.log('Recupero utenti...')
          const response = await UserService.getAllUsers()
          console.log('Risposta utenti ricevuta:', response)
          setUsers(response.data || [])
        }

        setLoading(false)
      } catch (err) {
        console.error('Errore durante il caricamento dei dati:', err)
        setError(`Errore durante il caricamento dei dati: ${err.message}`)
        setLoading(false)
      }
    }

    fetchData()
  }, [activeTab])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  // Formatta la data
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('it-IT', options)
  }

  // Ottieni il nome dello stato dell'ordine in italiano
  const getOrderStatusName = (status) => {
    switch (status) {
      case 'PENDING':
        return 'In attesa'
      case 'PROCESSING':
        return 'In elaborazione'
      case 'SHIPPED':
        return 'Spedito'
      case 'DELIVERED':
        return 'Consegnato'
      case 'CANCELED':
        return 'Annullato'
      default:
        return status
    }
  }

  // Gestione del form del prodotto
  const handleProductInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setProductFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  // Apre il modal per un nuovo prodotto
  const handleNewProduct = () => {
    setEditingProduct(null)
    console.log('Categorie disponibili:', categories)

    // Imposta il form con valori predefiniti
    setProductFormData({
      id: '',
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      categoryId: categories && categories.length > 0 ? categories[0].id : '',
      category: categories && categories.length > 0 ? categories[0] : '', // Per compatibilità
      imageUrl: '',
      brand: 'RN BMX Shop',
      featured: false,
    })
    setShowProductModal(true)
  }

  // Apre il modal per modificare un prodotto esistente
  const handleEditProduct = (product) => {
    console.log('Modifica prodotto:', product)

    // Ottieni i dettagli completi della categoria se disponibili
    let productCategory = null

    // Se product.categoryEntity è un oggetto con un ID, usa quello
    if (product.categoryEntity && product.categoryEntity.id) {
      productCategory = product.categoryEntity
    }
    // Altrimenti, se c'è un nome categoria, cerca la categoria corrispondente
    else if (product.category) {
      const matchingCategory = categories.find((cat) =>
        typeof cat === 'string'
          ? cat === product.category
          : cat.name === product.category
      )

      if (matchingCategory) {
        productCategory = matchingCategory
      }
    }

    console.log('Categoria del prodotto identificata:', productCategory)

    // Assicuriamoci che l'ID sia in formato numerico e normalizziamo i dati
    const productToEdit = {
      ...product,
      id:
        typeof product.id === 'string' ? parseInt(product.id, 10) : product.id,
      // Normalizziamo i nomi delle proprietà
      imageUrl: product.imageUrl || product.image_url || '',
      stockQuantity: product.stockQuantity || product.stock_quantity || 0,
      brand: product.brand || 'RN BMX Shop',
    }

    setEditingProduct(productToEdit)
    setProductFormData({
      id: productToEdit.id,
      name: productToEdit.name || '',
      description: productToEdit.description || '',
      price: productToEdit.price || 0,
      stockQuantity: productToEdit.stockQuantity || 0,
      // Gestiamo la categoria sia come oggetto che come stringa
      categoryId:
        productCategory && productCategory.id ? productCategory.id : '',
      category: productCategory || productToEdit.category || '',
      imageUrl: productToEdit.imageUrl || '',
      brand: productToEdit.brand || 'RN BMX Shop',
      featured: productToEdit.featured || false,
    })
    setShowProductModal(true)
  }

  // Salva le modifiche al prodotto
  const handleSaveProduct = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      // Prepara i dati del prodotto da inviare
      const productData = {
        name: productFormData.name,
        description: productFormData.description,
        price: parseFloat(productFormData.price),
        stockQuantity: parseInt(productFormData.stockQuantity),
        categoryId: productFormData.categoryId || null,
        category:
          typeof productFormData.category === 'string'
            ? productFormData.category
            : productFormData.category?.name || '',
        imageUrl: productFormData.imageUrl,
        brand: productFormData.brand || 'RN BMX Shop',
        featured: productFormData.featured,
      }

      console.log('Dati del prodotto da inviare:', productData)

      let savedProduct
      if (editingProduct) {
        // Aggiorna un prodotto esistente
        console.log(
          `Aggiornamento prodotto con ID ${editingProduct.id}`,
          productData
        )
        try {
          const response = await ProductService.updateProduct(
            editingProduct.id,
            productData
          )
          console.log('Risposta aggiornamento prodotto:', response)

          // Gestione della risposta
          if (response.data) {
            savedProduct = response.data
            // Assicurati che il prodotto abbia tutti i campi necessari
            savedProduct = {
              ...savedProduct,
              imageUrl: savedProduct.imageUrl || savedProduct.image_url || '',
              image_url: savedProduct.imageUrl || savedProduct.image_url || '',
              stockQuantity:
                savedProduct.stockQuantity || savedProduct.stock_quantity || 0,
              stock_quantity:
                savedProduct.stockQuantity || savedProduct.stock_quantity || 0,
            }

            // Aggiorna la lista dei prodotti
            setProducts(
              products.map((p) =>
                p.id === editingProduct.id ? savedProduct : p
              )
            )
            setShowProductModal(false)
          } else {
            setError('La risposta dal server non contiene dati del prodotto')
          }
        } catch (updateError) {
          console.error(
            "Errore durante l'aggiornamento del prodotto:",
            updateError
          )
          // Gestione più dettagliata dell'errore
          let errorMessage = "Errore durante l'aggiornamento del prodotto"
          if (updateError.response) {
            console.error('Stato risposta:', updateError.response.status)
            console.error('Dati risposta:', updateError.response.data)

            if (updateError.response.status === 404) {
              errorMessage = `Il prodotto con ID ${editingProduct.id} non è stato trovato. Potrebbe essere stato eliminato.`
            } else if (
              updateError.response.data &&
              typeof updateError.response.data === 'string'
            ) {
              errorMessage = updateError.response.data
            } else if (
              updateError.response.data &&
              updateError.response.data.message
            ) {
              errorMessage = updateError.response.data.message
            } else {
              errorMessage += `: ${updateError.message}`
            }
          } else {
            errorMessage += `: ${updateError.message}`
          }

          setError(errorMessage)
          // Lasciare aperto il modale per correggere il problema
        }
      } else {
        // Crea un nuovo prodotto
        try {
          const response = await ProductService.createProduct(productData)
          console.log('Risposta creazione prodotto:', response)

          // Gestione della risposta
          if (response && response.data) {
            savedProduct = response.data
            // Assicurati che il prodotto abbia tutti i campi necessari
            savedProduct = {
              ...savedProduct,
              imageUrl: savedProduct.imageUrl || savedProduct.image_url || '',
              image_url: savedProduct.imageUrl || savedProduct.image_url || '',
              stockQuantity:
                savedProduct.stockQuantity || savedProduct.stock_quantity || 0,
              stock_quantity:
                savedProduct.stockQuantity || savedProduct.stock_quantity || 0,
            }

            // Aggiorna la lista dei prodotti
            setProducts([...products, savedProduct])
            setShowProductModal(false)
          } else {
            setError('La risposta dal server non contiene dati del prodotto')
          }
        } catch (createError) {
          console.error(
            'Errore durante la creazione del prodotto:',
            createError
          )

          // Gestione più dettagliata dell'errore
          let errorMessage = 'Errore durante la creazione del prodotto'
          if (createError.response) {
            console.error('Stato risposta:', createError.response.status)
            console.error('Dati risposta:', createError.response.data)

            if (
              createError.response.data &&
              typeof createError.response.data === 'string'
            ) {
              errorMessage = createError.response.data
            } else if (
              createError.response.data &&
              createError.response.data.message
            ) {
              errorMessage = createError.response.data.message
            } else {
              errorMessage += `: ${createError.message}`
            }
          } else {
            errorMessage += `: ${createError.message}`
          }

          setError(errorMessage)
          // Lasciare aperto il modale per correggere il problema
        }
      }

      setLoading(false)
    } catch (err) {
      setError(`Errore durante il salvataggio del prodotto: ${err.message}`)
      setLoading(false)
      console.error('Errore generale:', err)
    }
  }

  // Gestione eliminazione prodotto
  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Sei sicuro di voler eliminare questo prodotto?')) {
      try {
        setLoading(true)
        setError(null)

        // Convertiamo l'ID in numero
        const numericId =
          typeof productId === 'string' ? parseInt(productId, 10) : productId

        console.log(`Tentativo di eliminazione prodotto con ID ${numericId}`)
        await ProductService.deleteProduct(numericId)

        // Rimuovi il prodotto dalla lista
        setProducts(products.filter((p) => p.id !== numericId))
        setLoading(false)
      } catch (err) {
        console.error(`Errore durante l'eliminazione: ${err.message}`)
        setError(`Errore durante l'eliminazione del prodotto: ${err.message}`)
        setLoading(false)

        if (err.response && err.response.status === 404) {
          // Se il prodotto non esiste, rimuoviamolo comunque dalla UI
          console.log(
            `Prodotto con ID ${productId} non trovato, lo rimuovo dalla UI`
          )
          setProducts(products.filter((p) => p.id !== productId))
        }
      }
    }
  }

  // Gestione del form dell'utente
  const handleUserInputChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === 'roles') {
      // Gestisce la selezione dei ruoli (checkbox)
      const currentRoles = [...userFormData.roles]
      if (checked) {
        // Aggiungi il ruolo se non è già presente
        if (!currentRoles.includes(value)) {
          currentRoles.push(value)
        }
      } else {
        // Rimuovi il ruolo
        const index = currentRoles.indexOf(value)
        if (index !== -1) {
          currentRoles.splice(index, 1)
        }
      }

      setUserFormData((prev) => ({
        ...prev,
        roles: currentRoles,
      }))
    } else {
      // Gestisce gli altri campi
      setUserFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // Apre il modal per modificare un utente esistente
  const handleEditUser = (user) => {
    // Verifica che l'utente abbia un ID valido
    if (!user || !user.id) {
      setError('Utente non valido o senza ID')
      return
    }

    console.log(`Modifica utente con ID ${user.id}:`, user)

    setEditingUser(user)
    setUserFormData({
      id: user.id,
      username: user.username || '',
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      roles: user.roles || [],
    })
    setShowUserModal(true)
  }

  // Salva le modifiche all'utente
  const handleSaveUser = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError(null)

      console.log('Salvataggio modifiche utente:', userFormData)

      // Dati dell'utente da aggiornare
      const userData = {
        username: userFormData.username,
        email: userFormData.email,
        firstName: userFormData.firstName,
        lastName: userFormData.lastName,
      }

      // Convertiamo l'ID in numero per sicurezza
      const userId =
        typeof editingUser.id === 'string'
          ? parseInt(editingUser.id, 10)
          : editingUser.id

      console.log(`Aggiornamento utente con ID: ${userId}`, userData)

      // Aggiorna l'utente
      let updatedUser
      try {
        const response = await UserService.updateUser(userId, userData)
        updatedUser = response.data
        console.log('Risposta aggiornamento utente:', updatedUser)
      } catch (updateError) {
        console.error(
          "Errore durante l'aggiornamento dell'utente:",
          updateError
        )
        throw new Error(
          `Errore nell'aggiornamento dei dati utente: ${updateError.message}`
        )
      }

      // Aggiorna anche i ruoli se necessario
      if (userFormData.roles && userFormData.roles.length > 0) {
        try {
          console.log(
            `Aggiornamento ruoli per l'utente ${userId}:`,
            userFormData.roles
          )
          await UserService.updateUserRoles(userId, {
            roles: userFormData.roles,
          })

          // Aggiorna l'oggetto utente con i nuovi ruoli
          updatedUser.roles = userFormData.roles
          console.log('Ruoli aggiornati con successo')
        } catch (rolesError) {
          console.error("Errore durante l'aggiornamento dei ruoli:", rolesError)

          // Non interrompiamo l'operazione se fallisce solo l'aggiornamento dei ruoli
          setError(
            `I dati dell'utente sono stati aggiornati, ma c'è stato un errore con i ruoli: ${rolesError.message}`
          )
        }
      } else {
        console.warn("Nessun ruolo specificato per l'aggiornamento")
      }

      // Aggiorna la lista degli utenti
      setUsers(users.map((u) => (u.id === userId ? updatedUser : u)))

      console.log('Aggiornamento utente completato')

      // Chiudi il modal solo se non ci sono stati errori fatali
      if (!error) {
        setShowUserModal(false)
      }

      setLoading(false)
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message
      setError(`Errore durante l'aggiornamento dell'utente: ${errorMessage}`)
      setLoading(false)
      console.error('Errore completo:', err)
    }
  }

  // Gestione eliminazione utente
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Sei sicuro di voler disattivare questo utente?')) {
      try {
        setLoading(true)
        setError(null)

        await UserService.deleteUser(userId)

        // Rimuovi l'utente dalla lista
        setUsers(users.filter((user) => user.id !== userId))

        setLoading(false)
      } catch (err) {
        setError(`Errore durante la disattivazione dell'utente: ${err.message}`)
        setLoading(false)
        console.error(err)
      }
    }
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">Dashboard Amministratore</h2>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => handleTabChange('products')}
          >
            Prodotti
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            Ordini
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => handleTabChange('users')}
          >
            Utenti
          </button>
        </li>
      </ul>

      {/* Tab dei prodotti */}
      {activeTab === 'products' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Gestione Prodotti</h3>
            <button className="btn btn-primary" onClick={handleNewProduct}>
              <i className="bi bi-plus-lg"></i> Nuovo Prodotto
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Immagine</th>
                  <th>Nome</th>
                  <th>Prezzo</th>
                  <th>Categoria</th>
                  <th>Stock</th>
                  <th>In evidenza</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>
                      <img
                        src={product.imageUrl || product.image_url}
                        alt={product.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'contain',
                        }}
                        onError={(e) => {
                          e.target.onerror = null
                          try {
                            e.target.src =
                              'https://placehold.co/50x50?text=N%2FA'
                          } catch (err) {
                            // Fallback finale a data URI in caso di errore
                            e.target.src = placeholderImage
                          }
                        }}
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>€{product.price.toFixed(2)}</td>
                    <td>{product.category}</td>
                    <td>
                      {product.stockQuantity || product.stock_quantity || 0}
                    </td>
                    <td>{product.featured ? 'Sì' : 'No'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEditProduct(product)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab degli ordini */}
      {activeTab === 'orders' && (
        <div>
          <h3 className="mb-3">Gestione Ordini</h3>

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Totale</th>
                  <th>Stato</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>
                      {order.orderDate ? formatDate(order.orderDate) : 'N/A'}
                    </td>
                    <td>
                      {order.userId ||
                        (order.user && order.user.username) ||
                        'N/A'}
                    </td>
                    <td>
                      €
                      {order.totalAmount !== undefined
                        ? order.totalAmount.toFixed(2)
                        : '0.00'}
                    </td>
                    <td>
                      <span className="badge bg-secondary">
                        {getOrderStatusName(order.status)}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-2">
                        <i className="bi bi-eye"></i> Dettagli
                      </button>
                      <button className="btn btn-sm btn-outline-success">
                        <i className="bi bi-check2"></i> Aggiorna Stato
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab degli utenti */}
      {activeTab === 'users' && (
        <div>
          <h3 className="mb-3">Gestione Utenti</h3>

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Nome</th>
                  <th>Ruoli</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.firstName} {user.lastName}
                    </td>
                    <td>
                      {user.roles &&
                        user.roles.map((role) => (
                          <span key={role} className="badge bg-info me-1">
                            {role}
                          </span>
                        ))}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEditUser(user)}
                        disabled={!user || !user.id}
                      >
                        <i className="bi bi-pencil"></i> Modifica
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={!user || !user.id}
                      >
                        <i className="bi bi-person-x"></i> Disattiva
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal per modifica/creazione prodotto */}
      {showProductModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-lg" style={{ zIndex: 1055 }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProduct ? 'Modifica Prodotto' : 'Nuovo Prodotto'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowProductModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaveProduct}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      Nome Prodotto
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={productFormData.name}
                      onChange={handleProductInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Descrizione
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={productFormData.description}
                      onChange={handleProductInputChange}
                      rows="3"
                      required
                    ></textarea>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="price" className="form-label">
                        Prezzo (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        id="price"
                        name="price"
                        value={productFormData.price}
                        onChange={handleProductInputChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="stockQuantity" className="form-label">
                        Quantità in magazzino
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        id="stockQuantity"
                        name="stockQuantity"
                        value={productFormData.stockQuantity}
                        onChange={handleProductInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="category" className="form-label">
                      Categoria
                    </label>
                    <select
                      className="form-select"
                      id="categoryId"
                      name="categoryId"
                      value={productFormData.categoryId}
                      onChange={handleProductInputChange}
                      required
                    >
                      <option value="">Seleziona una categoria</option>

                      {/* Mappa le categorie disponibili */}
                      {categories.map((category, index) => {
                        // Gestisci sia oggetti che stringhe
                        const categoryId =
                          typeof category === 'object' ? category.id : index
                        const categoryName =
                          typeof category === 'object'
                            ? category.name
                            : category
                        return (
                          <option key={index} value={categoryId}>
                            {categoryName}
                          </option>
                        )
                      })}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="brand" className="form-label">
                      Brand
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="brand"
                      name="brand"
                      value={productFormData.brand}
                      onChange={handleProductInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="imageUrl" className="form-label">
                      URL Immagine
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="imageUrl"
                      name="imageUrl"
                      value={productFormData.imageUrl}
                      onChange={handleProductInputChange}
                    />
                    {productFormData.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={productFormData.imageUrl}
                          alt="Anteprima prodotto"
                          style={{ maxHeight: '100px' }}
                          onError={(e) => {
                            e.target.onerror = null
                            try {
                              e.target.src =
                                'https://placehold.co/100x100?text=Immagine+non+disponibile'
                            } catch (err) {
                              // Fallback finale a data URI in caso di errore
                              e.target.src = largeplaceholderImage
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="featured"
                      name="featured"
                      checked={productFormData.featured}
                      onChange={handleProductInputChange}
                    />
                    <label className="form-check-label" htmlFor="featured">
                      In evidenza
                    </label>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowProductModal(false)}
                    >
                      Annulla
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Salvataggio...
                        </>
                      ) : (
                        'Salva'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </div>
      )}

      {/* Modal per modifica utente */}
      {showUserModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog" style={{ zIndex: 1055 }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modifica Utente</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowUserModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSaveUser}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={userFormData.username}
                      onChange={handleUserInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={userFormData.email}
                      onChange={handleUserInputChange}
                      required
                    />
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label htmlFor="firstName" className="form-label">
                        Nome
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="firstName"
                        value={userFormData.firstName}
                        onChange={handleUserInputChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="lastName" className="form-label">
                        Cognome
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        value={userFormData.lastName}
                        onChange={handleUserInputChange}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Ruoli</label>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="roleUser"
                        name="roles"
                        value="USER"
                        checked={userFormData.roles.includes('USER')}
                        onChange={handleUserInputChange}
                      />
                      <label className="form-check-label" htmlFor="roleUser">
                        Utente
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="roleAdmin"
                        name="roles"
                        value="ADMIN"
                        checked={userFormData.roles.includes('ADMIN')}
                        onChange={handleUserInputChange}
                      />
                      <label className="form-check-label" htmlFor="roleAdmin">
                        Amministratore
                      </label>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowUserModal(false)}
                    >
                      Annulla
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Salva
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage
