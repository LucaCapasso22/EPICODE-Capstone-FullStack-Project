package com.rnbmx.shop.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class DatabaseTest {

    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/rnbmx_shop";
        String user = "postgres";
        String password = "1hhPgsa127";

        try {
            Connection connection = DriverManager.getConnection(url, user, password);

            // Verifica connessione
            if (connection != null) {
                System.out.println("✅ Connessione a PostgreSQL riuscita!");

                // Ottieni metadati
                System.out.println("Database: " + connection.getCatalog());
                System.out.println("Schema: " + connection.getSchema());

                // Lista delle tabelle
                System.out.println("\n📋 TABELLE NEL DATABASE:");
                Statement stmt = connection.createStatement();
                ResultSet tables = stmt.executeQuery(
                        "SELECT table_name FROM information_schema.tables " +
                                "WHERE table_schema = 'public' ORDER BY table_name");

                while (tables.next()) {
                    System.out.println(" - " + tables.getString("table_name"));
                }

                // Lista degli utenti
                System.out.println("\n👤 UTENTI REGISTRATI:");
                ResultSet users = stmt.executeQuery(
                        "SELECT id, username, email, first_name, last_name, name, surname, password " +
                                "FROM users ORDER BY id");

                System.out.println(
                        "+------+---------------+--------------------+---------------+---------------+--------------+---------------+----------+");
                System.out.println(
                        "| ID   | Username      | Email              | First Name    | Last Name     | Name         | Surname       | Password |");
                System.out.println(
                        "+------+---------------+--------------------+---------------+---------------+--------------+---------------+----------+");

                while (users.next()) {
                    long id = users.getLong("id");
                    String username = users.getString("username");
                    String email = users.getString("email");
                    String firstName = users.getString("first_name");
                    String lastName = users.getString("last_name");
                    String name = users.getString("name");
                    String surname = users.getString("surname");
                    String pwd = users.getString("password");
                    String pwdPreview = pwd != null ? pwd.substring(0, Math.min(8, pwd.length())) + "..." : "null";

                    System.out.printf("| %-4d | %-13s | %-18s | %-13s | %-13s | %-12s | %-13s | %-8s |\n",
                            id,
                            username != null ? username : "null",
                            email != null ? email : "null",
                            firstName != null ? firstName : "null",
                            lastName != null ? lastName : "null",
                            name != null ? name : "null",
                            surname != null ? surname : "null",
                            pwdPreview);
                }

                System.out.println(
                        "+------+---------------+--------------------+---------------+---------------+--------------+---------------+----------+");

                // Chiusura risorse
                users.close();
                tables.close();
                stmt.close();
                connection.close();

            } else {
                System.out.println("❌ Connessione a PostgreSQL fallita!");
            }

        } catch (Exception e) {
            System.out.println("❌ Errore durante la connessione a PostgreSQL: " + e.getMessage());
            e.printStackTrace();
        }
    }
}