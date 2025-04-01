package com.rnbmx.shop.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    private String firstName;

    @NotBlank
    @Size(max = 50)
    private String lastName;

    @Column(name = "surname", nullable = false)
    private String surname;

    @NotBlank
    @Size(max = 100)
    @Column(name = "name", nullable = false)
    private String name;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(max = 15)
    private String phone;

    @NotBlank
    @Size(max = 120)
    private String password;

    @NotBlank
    @Size(max = 50)
    private String country;

    @NotBlank
    @Size(max = 50)
    private String city;

    @NotBlank
    @Size(max = 200)
    private String address;

    @NotBlank
    @Size(max = 10)
    private String gender;

    @Size(max = 255)
    private String profileImage;

    @NotBlank
    @Size(max = 50)
    private String username;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    public User(String firstName, String lastName, String email, String phone, String password,
            String country, String city, String address, String gender) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.surname = lastName;
        this.name = firstName + " " + lastName;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.country = country;
        this.city = city;
        this.address = address;
        this.gender = gender;
        this.createdAt = LocalDateTime.now();
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    // Metodo per generare automaticamente il campo name e surname quando si
    // impostano firstName o lastName
    public void setFirstName(String firstName) {
        this.firstName = firstName;
        if (firstName != null && this.lastName != null) {
            this.name = firstName + " " + this.lastName;
        } else if (firstName != null) {
            this.name = firstName;
            if (this.surname == null) {
                this.surname = firstName;
            }
        }
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
        if (lastName != null) {
            this.surname = lastName;
            if (this.firstName != null) {
                this.name = this.firstName + " " + lastName;
            } else if (this.name == null) {
                this.name = lastName;
            }
        }
    }

    public String getName() {
        // Se il nome è null ma ci sono firstName o lastName, genera il nome
        if (this.name == null) {
            if (this.firstName != null && this.lastName != null) {
                this.name = this.firstName + " " + this.lastName;
            } else if (this.firstName != null) {
                this.name = this.firstName;
            } else if (this.lastName != null) {
                this.name = this.lastName;
            } else {
                this.name = "Utente";
            }
        }
        return this.name;
    }

    public String getSurname() {
        // Se il cognome è null ma c'è lastName, usa quello
        if (this.surname == null) {
            if (this.lastName != null) {
                this.surname = this.lastName;
            } else if (this.firstName != null) {
                this.surname = this.firstName;
            } else {
                this.surname = "Sconosciuto";
            }
        }
        return this.surname;
    }
}