# RN BMX Shop

E-commerce completo per un negozio di BMX, sviluppato da Capasso Luca (lucacapasso22 su GitHub) come progetto Capstone.

## Tecnologie Utilizzate

### Frontend

- **React 18**: Libreria JavaScript per la costruzione dell'interfaccia utente
- **React Router v6**: Per la gestione delle rotte e della navigazione
- **React Bootstrap**: Framework CSS per componenti responsive
- **React Hooks**: Per la gestione dello stato globale dell'applicazione
- **Axios**: Per le chiamate API
- **Framer Motion**: Per animazioni fluide nell'interfaccia
- **React Icons**: Per icone moderne e versatili

### Backend

- **Spring Boot 2.7**: Framework Java per lo sviluppo rapido di applicazioni
- **Spring Security**: Per l'autenticazione e l'autorizzazione
- **JWT**: Per la gestione dei token di sicurezza
- **Spring Data JPA**: Per l'accesso ai dati con Hibernate
- **PostgreSQL**: Database relazionale per la persistenza dei dati
- **Lombok**: Per la riduzione del codice boilerplate
- **Maven**: Per la gestione delle dipendenze

## Struttura del Progetto

Il progetto è strutturato come monorepo con:

- `RN-BMX-Shop/frontend`: applicazione React
- `RN-BMX-Shop/backend`: API Spring Boot

## Requisiti di Sistema

- Java 11 o superiore
- Maven 3.6 o superiore
- MySQL 8.0 o superiore

## Guida all'Installazione

### Configurazione del Database

1. Creare un database MySQL chiamato `rnbmx_shop`
2. Aggiornare le credenziali di accesso nel file `backend/src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/rnbmx_shop
spring.datasource.username=root
spring.datasource.password=password
```

### Installazione delle Dipendenze del Frontend

```bash
cd RN-BMX-Shop/frontend
npm install
```

### Compilazione del Backend

```bash
cd RN-BMX-Shop/backend
mvn clean compile
```

## Avvio dell'Applicazione

### Avvio del Backend

```bash
cd RN-BMX-Shop/backend
mvn spring-boot:run
```

Il backend sarà disponibile all'indirizzo http://localhost:8080.

### Avvio del Frontend

```bash
cd RN-BMX-Shop/frontend
npm start
```

Il frontend sarà disponibile all'indirizzo http://localhost:3000.

### Avvio Simultaneo (entrambi i servizi)

Dalla directory principale:

```bash
npm start
```

Questo comando avvierà sia il backend che il frontend in modo concorrente.

## Guida all'Uso

### Registrazione e Login

1. Accedere alla homepage e cliccare su "Registrati"
2. Inserire i dati richiesti nel modulo di registrazione
3. Effettuare il login con le credenziali create

### Navigazione nel Catalogo

- Utilizzare il menu principale per accedere alle diverse categorie di prodotti
- Utilizzare la barra di ricerca per trovare prodotti specifici
- Filtrare i prodotti per prezzo, marca o altre caratteristiche

### Processo di Acquisto

1. Aggiungere i prodotti desiderati al carrello
2. Accedere al carrello e verificare i prodotti selezionati
3. Procedere al checkout
4. Inserire i dati di spedizione e pagamento
5. Confermare l'ordine

### Area Utente

- Visualizzare lo storico degli ordini
- Modificare i dati personali
- Gestire gli indirizzi di spedizione

### Area Amministrativa

- Gestire il catalogo prodotti (aggiunta, modifica, eliminazione)
- Gestire gli ordini (visualizzazione, modifica dello stato)
- Gestire gli utenti

## Funzionalità Principali

- Autenticazione utente sicura con JWT
- Catalogo prodotti con filtri e ricerca avanzata
- Carrello persistente (anche senza login)
- Processo di checkout guidato
- Gestione ordini e profilo utente
- Dashboard amministrativa
- Design responsive per tutti i dispositivi

## Risoluzione di Problemi Comuni

### Errore "No goals have been specified for this build"

Se si riceve questo errore quando si esegue Maven:

```
[ERROR] No goals have been specified for this build.
```

È necessario specificare un goal valido come `compile`, `test` o `spring-boot:run`. Ad esempio:

```bash
cd RN-BMX-Shop/backend
mvn clean compile
mvn spring-boot:run
```

### Errore "Could not read package.json"

Se si riceve questo errore:

```
npm error code ENOENT
npm error syscall open
npm error path [...]/package.json
```

Assicurarsi di essere nella directory corretta (RN-BMX-Shop/frontend) prima di eseguire i comandi npm.

### Problemi di compilazione Java

Se si verificano problemi di compilazione con Java, verificare che la versione di Java sia compatibile con il progetto. Il progetto è configurato per Java 11.

### Porta già in uso

Se si riceve un errore del tipo "Port 3000 is already in use", utilizzare un altro numero di porta:

```bash
cd RN-BMX-Shop/frontend
npm start -- --port 3001
```

## Crediti

Sviluppato da Capasso Luca (lucacapasso22 su GitHub) per il progetto Capstone Epicode.
