export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'))

  // Logging della richiesta
  console.log('Generazione headers per autenticazione')

  if (user && (user.token || user.accessToken)) {
    const tokenValue = user.accessToken || user.token
    const headers = {
      Authorization: 'Bearer ' + tokenValue,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }

    // Logging dei ruoli per debug
    if (user.roles && Array.isArray(user.roles)) {
      console.log('Ruoli utente:', user.roles.join(', '))
      console.log(
        "L'utente ha il ruolo admin:",
        user.roles.includes('ROLE_ADMIN')
      )
    } else {
      console.warn('Utente senza ruoli definiti o formato ruoli non valido')
    }

    console.log(
      'Token di autenticazione trovato:',
      tokenValue.substring(0, 10) + '...'
    )
    return headers
  } else {
    console.log(
      'Nessun token di autenticazione trovato, inoltro richiesta senza autenticazione'
    )
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }
  }
}
