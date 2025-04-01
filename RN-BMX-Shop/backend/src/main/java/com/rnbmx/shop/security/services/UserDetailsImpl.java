package com.rnbmx.shop.security.services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.rnbmx.shop.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;

    private String firstName;

    private String lastName;

    private String email;

    private String phone;

    private String country;

    private String city;

    private String address;

    private String gender;

    private String profileImage;

    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String firstName, String lastName, String email, String phone,
            String password, String country, String city, String address, String gender,
            String profileImage, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.country = country;
        this.city = city;
        this.address = address;
        this.gender = gender;
        this.profileImage = profileImage;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toList());

        // Uso firstName e lastName come prioritari
        String usedFirstName = user.getFirstName();
        String usedLastName = user.getLastName();

        // Se firstName è vuoto, prova a utilizzare name
        if (usedFirstName == null || usedFirstName.trim().isEmpty()) {
            usedFirstName = user.getName();
        }

        // Se lastName è vuoto, prova a utilizzare surname
        if (usedLastName == null || usedLastName.trim().isEmpty()) {
            usedLastName = user.getSurname();
        }

        System.out.println("Build UserDetails: ID=" + user.getId() +
                ", Email=" + user.getEmail() +
                ", FirstName=" + usedFirstName +
                ", LastName=" + usedLastName);

        return new UserDetailsImpl(
                user.getId(),
                usedFirstName,
                usedLastName,
                user.getEmail(),
                user.getPhone(),
                user.getPassword(),
                user.getCountry(),
                user.getCity(),
                user.getAddress(),
                user.getGender(),
                user.getProfileImage(),
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public Long getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getCountry() {
        return country;
    }

    public String getCity() {
        return city;
    }

    public String getAddress() {
        return address;
    }

    public String getGender() {
        return gender;
    }

    public String getProfileImage() {
        return profileImage;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}