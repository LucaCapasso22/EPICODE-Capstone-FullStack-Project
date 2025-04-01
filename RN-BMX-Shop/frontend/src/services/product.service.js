import axios from 'axios'
import authHeader from './auth-header'

// Dati mock per fallback
const mockProducts = [
  {
    id: 1,
    name: 'BMX Freestyle Pro',
    description: 'Bicicletta BMX professionale per freestyle e trick.',
    price: 699.99,
    stock_quantity: 15,
    category: 'Biciclette complete',
    image_url:
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    featured: true,
  },
  {
    id: 2,
    name: 'BMX Race Elite',
    description: 'Bicicletta BMX da gara leggera e aerodinamica.',
    price: 899.99,
    stock_quantity: 8,
    category: 'Biciclette complete',
    image_url:
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    featured: true,
  },
  {
    id: 3,
    name: 'Casco BMX Pro',
    description: 'Casco professionale per BMX con protezione avanzata.',
    price: 89.99,
    stock_quantity: 25,
    category: 'Accessori',
    image_url:
      'https://images.unsplash.com/photo-1573496773905-f5b17e717f05?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    featured: false,
  },
  {
    id: 4,
    name: 'Manubrio BMX Cromato',
    description: 'Manubrio in acciaio cromato per BMX freestyle.',
    price: 49.99,
    stock_quantity: 30,
    category: 'Componenti',
    image_url:
      'https://images.unsplash.com/photo-1605965462688-7b62a4c41298?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    featured: false,
  },
  {
    id: 5,
    name: 'Maglietta BMX Team',
    description:
      'Maglietta ufficiale del team BMX, traspirante e confortevole.',
    price: 29.99,
    stock_quantity: 50,
    category: 'Abbigliamento',
    image_url:
      'https://images.unsplash.com/photo-1512327536842-5aa37d1ba3e3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    featured: true,
  },
  {
    id: 6,
    name: 'Pedali BMX Platform',
    description: 'Pedali platform in alluminio con pin per massima aderenza.',
    price: 39.99,
    stock_quantity: 40,
    category: 'Componenti',
    image_url:
      'https://images.unsplash.com/photo-1583227122027-d2d360c66d3c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    featured: false,
  },
]

const API_URL = '/api/products'

class ProductService {
  // Ritorna prodotti reali o mock in caso di errore
  async getAllProducts() {
    try {
      console.log('Tentativo di recuperare tutti i prodotti dal server...')
      console.log('URL completo:', window.location.origin + API_URL)

      const response = await axios.get(API_URL, {
        timeout: 15000,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
        },
      })

      console.log('Risposta API completa:', response)
      console.log('Dati prodotti ricevuti:', response.data)

      // Verifica se la risposta è un array
      if (!Array.isArray(response.data)) {
        console.error('La risposta non è un array di prodotti:', response.data)
        // Tenta di estrarre i dati se sono in un formato diverso
        const productsData =
          response.data.content || response.data.products || response.data

        if (Array.isArray(productsData)) {
          console.log(
            'Estratto array di prodotti da risposta non standard:',
            productsData
          )

          // Normalizza i dati ricevuti
          const normalizedProducts = productsData.map((product) => ({
            ...product,
            // Garantisce entrambi i campi per compatibilità
            imageUrl: product.imageUrl || product.image_url || '',
            image_url: product.imageUrl || product.image_url || '',
            stockQuantity: product.stockQuantity || product.stock_quantity || 0,
            stock_quantity:
              product.stockQuantity || product.stock_quantity || 0,
          }))

          console.log(
            `Recuperati ${normalizedProducts.length} prodotti dal server (formato non standard)`
          )
          return normalizedProducts
        }

        console.error('Impossibile estrarre i prodotti dalla risposta')
        return mockProducts
      }

      // Normalizza i dati ricevuti
      const normalizedProducts = response.data.map((product) => ({
        ...product,
        // Garantisce entrambi i campi per compatibilità
        imageUrl: product.imageUrl || product.image_url || '',
        image_url: product.imageUrl || product.image_url || '',
        stockQuantity: product.stockQuantity || product.stock_quantity || 0,
        stock_quantity: product.stockQuantity || product.stock_quantity || 0,
      }))

      console.log(`Recuperati ${normalizedProducts.length} prodotti dal server`)
      return normalizedProducts
    } catch (error) {
      console.error('Errore nel caricamento dei prodotti:', error.message)
      console.error('Errore completo:', error)
      if (error.response) {
        console.error('Stato risposta:', error.response.status)
        console.error('Dati risposta:', error.response.data)
      }
      console.log('Utilizzo dati mock come fallback')
      return mockProducts
    }
  }

  // Ritorna prodotti in evidenza reali o mock in caso di errore
  async getFeaturedProducts() {
    try {
      const response = await axios.get(`${API_URL}/featured`, {
        timeout: 15000,
      })
      return response.data
    } catch (error) {
      console.log(
        'Errore nel caricamento dei prodotti in evidenza, utilizzo dati mock',
        error
      )
      return mockProducts.filter((product) => product.featured)
    }
  }

  // Ritorna prodotti per categoria reali o mock in caso di errore
  async getProductsByCategory(category) {
    try {
      const response = await axios.get(`${API_URL}/category/${category}`, {
        timeout: 15000,
      })
      return response.data
    } catch (error) {
      console.log(
        `Errore nel caricamento dei prodotti della categoria ${category}, utilizzo dati mock`,
        error
      )
      return mockProducts.filter((product) => product.category === category)
    }
  }

  // Ritorna un prodotto specifico reale o mock in caso di errore
  async getProductById(id) {
    try {
      console.log(`Richiesta prodotto con ID ${id} a ${API_URL}/${id}`)
      const response = await axios.get(`${API_URL}/${id}`, { timeout: 15000 })
      console.log('Risposta API per prodotto:', response.data)

      // Normalizza i nomi delle proprietà per garantire la compatibilità
      const normalizedProduct = {
        ...response.data,
        // Garantiamo che siano presenti entrambi i nomi di proprietà per immagine e stock
        image_url: response.data.imageUrl || response.data.image_url,
        imageUrl: response.data.imageUrl || response.data.image_url,
        stock_quantity:
          response.data.stockQuantity || response.data.stock_quantity || 0,
        stockQuantity:
          response.data.stockQuantity || response.data.stock_quantity || 0,
      }

      return normalizedProduct
    } catch (error) {
      console.error(
        `Errore nel caricamento del prodotto con ID ${id}:`,
        error.message,
        error.response?.status,
        error.response?.data
      )
      if (error.response && error.response.status === 404) {
        console.warn(`Prodotto con ID ${id} non trovato, restituisco null`)
        return null
      }
      // Fallback ai dati mock
      console.log(`Utilizzo dati mock per prodotto con ID ${id}`)
      return mockProducts.find((product) => product.id === parseInt(id)) || null
    }
  }

  searchProducts(query) {
    return axios.get(`${API_URL}/search?query=${query}`)
  }

  // Metodi amministratore (richiedono autenticazione)
  async createProduct(product) {
    try {
      // Prepara un oggetto normalizzato per il backend con gestione migliorata della categoria
      const normalizedProduct = {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stockQuantity: parseInt(
          product.stockQuantity || product.stock_quantity || 0
        ),
        imageUrl: product.imageUrl || product.image_url || '',
        brand: product.brand || 'RN BMX Shop', // Valore di default
        featured: product.featured || false,
      }

      // Gestione della categoria: può essere un oggetto, un ID o una stringa
      if (
        product.categoryEntity &&
        typeof product.categoryEntity === 'object'
      ) {
        // Se la categoria è un oggetto completo, usa l'ID
        if (product.categoryEntity.id) {
          normalizedProduct.categoryId = product.categoryEntity.id
        } else {
          // Se l'oggetto categoria ha solo un nome ma nessun ID
          normalizedProduct.category = product.categoryEntity.name
        }
      } else if (product.categoryId) {
        // Se abbiamo direttamente un ID categoria
        normalizedProduct.categoryId = product.categoryId
      } else if (product.category) {
        // Se abbiamo solo il nome della categoria
        normalizedProduct.category = product.category
      }

      console.log('Invio prodotto normalizzato al backend:', normalizedProduct)

      const response = await axios.post(API_URL, normalizedProduct, {
        headers: authHeader(),
      })

      console.log('Risposta creazione prodotto:', response.data)
      return response
    } catch (error) {
      console.error('Errore durante la creazione del prodotto:', error)
      if (error.response) {
        console.error('Stato risposta:', error.response.status)
        console.error('Dati risposta:', error.response.data)
      }
      throw error
    }
  }

  async updateProduct(id, product) {
    try {
      // Converto l'ID a numero per assicurarmi che corrisponda al tipo atteso dal backend
      const numericId = parseInt(id, 10)

      // Prepara un oggetto normalizzato per il backend con gestione migliorata della categoria
      const normalizedProduct = {
        id: numericId,
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stockQuantity: parseInt(
          product.stockQuantity || product.stock_quantity || 0
        ),
        imageUrl: product.imageUrl || product.image_url || '',
        brand: product.brand || 'RN BMX Shop', // Valore di default
        featured: product.featured || false,
      }

      // Gestione della categoria: può essere un oggetto, un ID o una stringa
      if (
        product.categoryEntity &&
        typeof product.categoryEntity === 'object'
      ) {
        // Se la categoria è un oggetto completo, usa l'ID
        if (product.categoryEntity.id) {
          normalizedProduct.categoryId = product.categoryEntity.id
        } else {
          // Se l'oggetto categoria ha solo un nome ma nessun ID
          normalizedProduct.category = product.categoryEntity.name
        }
      } else if (product.categoryId) {
        // Se abbiamo direttamente un ID categoria
        normalizedProduct.categoryId = product.categoryId
      } else if (product.category) {
        // Se abbiamo solo il nome della categoria
        normalizedProduct.category = product.category
      }

      console.log(
        `Aggiornamento prodotto con ID ${numericId}:`,
        normalizedProduct
      )
      console.log(`URL richiesta: ${API_URL}/${numericId}`)
      console.log('Headers:', authHeader())

      const response = await axios.put(
        `${API_URL}/${numericId}`,
        normalizedProduct,
        {
          headers: authHeader(),
          timeout: 15000,
        }
      )

      console.log('Risposta aggiornamento prodotto:', response.data)
      return response
    } catch (error) {
      console.error(
        `Errore durante l'aggiornamento del prodotto con ID ${id}:`,
        error.message
      )
      if (error.response) {
        console.error('Stato risposta:', error.response.status)
        console.error('Dati risposta:', error.response.data)
      }
      throw error
    }
  }

  async deleteProduct(id) {
    try {
      // Converto l'ID a numero per assicurarmi che corrisponda al tipo atteso dal backend
      const numericId = parseInt(id, 10)
      console.log(`Eliminazione prodotto con ID ${numericId}`)

      const response = await axios.delete(`${API_URL}/${numericId}`, {
        headers: authHeader(),
        timeout: 15000,
      })

      console.log(`Prodotto con ID ${numericId} eliminato con successo`)
      return response
    } catch (error) {
      console.error(
        `Errore durante l'eliminazione del prodotto con ID ${id}:`,
        error.message,
        error.response?.status,
        error.response?.data
      )
      throw error
    }
  }

  // Metodi per categorie
  async getCategories() {
    try {
      console.log('Tentativo di recuperare le categorie dal server...')
      console.log(
        'URL completo:',
        window.location.origin + `${API_URL}/categories`
      )

      const response = await axios.get(`${API_URL}/categories`, {
        timeout: 15000,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
        },
      })

      console.log('Risposta categorie completa:', response)
      console.log('Dati categorie ricevuti:', response.data)

      // Se la risposta è già un array, usala direttamente
      if (Array.isArray(response.data)) {
        console.log(`Recuperate ${response.data.length} categorie dal server`)
        return response.data
      }

      // Se la risposta contiene un array annidato, estrailo
      if (response.data && typeof response.data === 'object') {
        const categoriesData =
          response.data.content ||
          response.data.categories ||
          response.data.data
        if (Array.isArray(categoriesData)) {
          console.log(
            `Estratte ${categoriesData.length} categorie da risposta non standard`
          )
          return categoriesData
        }
      }

      // Se nessuno dei tentativi ha funzionato, usa mock
      console.warn(
        'Formato di risposta categorie non riconosciuto, uso dati mock'
      )
      return [...new Set(mockProducts.map((product) => product.category))]
    } catch (error) {
      console.error('Errore nel caricamento delle categorie:', error.message)
      console.error('Errore completo:', error)
      if (error.response) {
        console.error('Stato risposta:', error.response.status)
        console.error('Dati risposta:', error.response.data)
      }
      // Estrae le categorie uniche dai prodotti mock
      console.log('Utilizzo categorie dai dati mock come fallback')
      return [...new Set(mockProducts.map((product) => product.category))]
    }
  }

  getCategoryById(id) {
    return axios.get(`api/categories/${id}`)
  }

  // Metodi amministratore per categorie
  createCategory(category) {
    return axios.post('api/categories', category, { headers: authHeader() })
  }

  updateCategory(id, category) {
    return axios.put(`api/categories/${id}`, category, {
      headers: authHeader(),
    })
  }

  deleteCategory(id) {
    return axios.delete(`api/categories/${id}`, { headers: authHeader() })
  }
}

export default new ProductService()
