const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  console.log('Configurazione proxy per le richieste API...')

  // Configura il proxy per le richieste API
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8080',
      changeOrigin: true,
    })
  )
}
