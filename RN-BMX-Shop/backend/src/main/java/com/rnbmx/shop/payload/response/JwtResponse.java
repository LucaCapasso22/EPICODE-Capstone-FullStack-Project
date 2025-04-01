package com.rnbmx.shop.payload.response;

import lombok.Data;

import java.util.List;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
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
    private List<String> roles;

    public JwtResponse(String token, Long id, String firstName, String lastName, String email,
            String phone, String country, String city, String address, String gender,
            String profileImage, List<String> roles) {
        this.token = token;
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.country = country;
        this.city = city;
        this.address = address;
        this.gender = gender;
        this.profileImage = profileImage;
        this.roles = roles;
    }
}