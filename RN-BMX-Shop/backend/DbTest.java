import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DbTest {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/rnbmx_shop";
        String user = "postgres";
        String password = "1hhPgsa127";

        try {
            // Carica il driver JDBC (non necessario dal Java 6 in poi, ma buona pratica)
            Class.forName("org.postgresql.Driver");

            System.out.println("Tentativo di connessione a PostgreSQL...");

            // Apri una connessione
            Connection conn = DriverManager.getConnection(url, user, password);
            System.out.println("✅ Connessione a PostgreSQL riuscita!");

            // Crea uno statement
            Statement stmt = conn.createStatement();

            // Esegui la query per ottenere informazioni sul database
            ResultSet rs = stmt.executeQuery("SELECT current_database(), current_user");
            while (rs.next()) {
                System.out.println("Database: " + rs.getString(1));
                System.out.println("Utente: " + rs.getString(2));
            }

            // Ottieni l'elenco delle tabelle
            System.out.println("\nTabelle nel database:");
            rs = stmt.executeQuery(
                    "SELECT table_name FROM information_schema.tables " +
                            "WHERE table_schema = 'public' ORDER BY table_name");

            while (rs.next()) {
                System.out.println(" - " + rs.getString("table_name"));
            }

            // Ottieni gli utenti
            System.out.println("\nUtenti registrati:");
            rs = stmt.executeQuery(
                    "SELECT id, username, email, password, first_name, last_name, name, surname " +
                            "FROM users ORDER BY id");

            System.out.println(
                    "+------+-----------------+------------------------+------------+----------------+----------------+----------------+----------------+");
            System.out.println(
                    "| ID   | Username        | Email                  | Password   | First Name     | Last Name      | Name           | Surname        |");
            System.out.println(
                    "+------+-----------------+------------------------+------------+----------------+----------------+----------------+----------------+");

            while (rs.next()) {
                long id = rs.getLong("id");
                String username = rs.getString("username");
                String email = rs.getString("email");
                String pwd = rs.getString("password");
                String firstName = rs.getString("first_name");
                String lastName = rs.getString("last_name");
                String name = rs.getString("name");
                String surname = rs.getString("surname");

                String pwdPreview = pwd != null ? pwd.substring(0, Math.min(10, pwd.length())) + "..." : "null";

                System.out.printf("| %-4d | %-15s | %-22s | %-10s | %-14s | %-14s | %-14s | %-14s |\n",
                        id,
                        limit(username, 15),
                        limit(email, 22),
                        limit(pwdPreview, 10),
                        limit(firstName, 14),
                        limit(lastName, 14),
                        limit(name, 14),
                        limit(surname, 14));
            }

            System.out.println(
                    "+------+-----------------+------------------------+------------+----------------+----------------+----------------+----------------+");

            // Chiudi le risorse
            rs.close();
            stmt.close();
            conn.close();

        } catch (Exception e) {
            System.out.println("❌ Errore: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Metodo per limitare la lunghezza delle stringhe per la formattazione della
    // tabella
    private static String limit(String str, int maxLength) {
        if (str == null)
            return "null";
        return str.length() <= maxLength ? str : str.substring(0, maxLength - 3) + "...";
    }
}