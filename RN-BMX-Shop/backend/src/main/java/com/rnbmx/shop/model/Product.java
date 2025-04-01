package com.rnbmx.shop.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "products")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Size(max = 2000)
    private String description;

    @NotNull
    private BigDecimal price;

    @NotNull
    @Column(name = "stock")
    private Integer stockQuantity = 0;

    @JsonProperty("stock_quantity")
    public Integer getStock_quantity() {
        return stockQuantity;
    }

    @Size(max = 255)
    private String imageUrl;

    @JsonProperty("image_url")
    public String getImage_url() {
        return imageUrl;
    }

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category categoryEntity;

    @NotBlank
    @Size(max = 100)
    @Column(name = "category")
    private String category = "";

    @NotBlank
    @Size(max = 100)
    private String brand = "RN BMX Shop";

    @NotNull
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    private boolean featured = false;

    public Product(String name, String description, BigDecimal price, Integer stockQuantity, String imageUrl,
            Category categoryEntity) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.categoryEntity = categoryEntity;
        this.category = categoryEntity.getName();
        this.brand = "RN BMX Shop";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Product(String name, String description, BigDecimal price, Integer stockQuantity, String imageUrl,
            Category categoryEntity, String brand) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.categoryEntity = categoryEntity;
        this.category = categoryEntity.getName();
        this.brand = brand;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    private void updateCategoryName() {
        if (this.categoryEntity != null) {
            this.category = this.categoryEntity.getName();
        } else {
            this.category = "Categoria non specificata";
        }

        if (this.brand == null || this.brand.trim().isEmpty()) {
            this.brand = "RN BMX Shop";
        }

        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }
}