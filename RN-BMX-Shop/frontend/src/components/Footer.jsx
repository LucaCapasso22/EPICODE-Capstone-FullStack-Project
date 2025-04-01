import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark text-white pt-5 pb-4">
      <div className="container">
        <div className="row">
          <div className="col-md-3 mb-4">
            <h5 className="mb-3">RN BMX Shop</h5>
            <p className="mb-3">
              Il negozio specializzato in BMX e accessori per tutti gli
              appassionati.
            </p>
            <div className="d-flex gap-3">
              <a
                href="https://www.facebook.com/RNBMXCrew"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white"
              >
                <i className="bi bi-facebook fs-4"></i>
              </a>
              <a
                href="https://www.instagram.com/rn_bmx_crew/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white"
              >
                <i className="bi bi-instagram fs-4"></i>
              </a>
              <a
                href="https://www.youtube.com/@rnbmxcrewnapoli"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white"
              >
                <i className="bi bi-youtube fs-4"></i>
              </a>
            </div>
          </div>

          <div className="col-md-3 mb-4">
            <h5 className="mb-3">Informazioni</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link
                  to="/chi-siamo"
                  className="text-white text-decoration-none"
                >
                  Chi siamo
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/contatti"
                  className="text-white text-decoration-none"
                >
                  Contatti
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/faq" className="text-white text-decoration-none">
                  FAQ
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/blog" className="text-white text-decoration-none">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-3 mb-4">
            <h5 className="mb-3">Acquisti</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link
                  to="/shipping"
                  className="text-white text-decoration-none"
                >
                  Spedizioni
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/returns" className="text-white text-decoration-none">
                  Resi e rimborsi
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/payments"
                  className="text-white text-decoration-none"
                >
                  Metodi di pagamento
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/terms" className="text-white text-decoration-none">
                  Termini e condizioni
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-3 mb-4">
            <h5 className="mb-3">Contatti</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="bi bi-geo-alt me-2"></i>
                Centro Direzionale, Isola E7, Napoli, Italia
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i>
                +39 02 123 4567
              </li>
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i>
                info@rnbmxshop.it
              </li>
              <li className="mb-2">
                <i className="bi bi-clock me-2"></i>
                Lun-Ven: 9:00-18:00
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4" />

        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="mb-0">
              &copy; {currentYear} RN BMX Shop. Tutti i diritti riservati.
            </p>
          </div>

          <div className="col-md-6 text-center text-md-end">
            <Link
              to="/privacy"
              className="text-white text-decoration-none me-3"
            >
              Privacy Policy
            </Link>
            <Link to="/cookies" className="text-white text-decoration-none">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
