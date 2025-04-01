import React from 'react'
import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="container mt-5 text-center">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h1 className="display-1 fw-bold">404</h1>
          <h2 className="mb-4">Pagina non trovata</h2>
          <p className="lead mb-5">
            La pagina che stai cercando ero troppo pigro per crearla o è stata
            spostata.
          </p>
          <Link to="/" className="btn btn-primary btn-lg mb-2">
            Torna alla home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
