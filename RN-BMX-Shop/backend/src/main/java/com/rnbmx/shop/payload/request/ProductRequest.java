package com.rnbmx.shop.payload.request;

import java.math.BigDecimal;
import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import lombok.Data;

@Data
public class ProductRequest {

    private Long id;

    @NotBlank(message = "Il nome del prodotto è obbligatorio")
    private String name;

    @NotBlank(message = "La descrizione del prodotto è obbligatoria")
    private String description;

    @NotNull(message = "Il prezzo del prodotto è obbligatorio")
    @Positive(message = "Il prezzo deve essere maggiore di zero")
    private BigDecimal price;

    private BigDecimal salePrice;

    @NotNull(message = "La categoria del prodotto è obbligatoria")
    private String category;

    private List<String> images;

    private String brand;

    private Integer stock;

    private Boolean featured = false;

    private String color;

    private String size;

    private Integer stockQuantity;

    private String imageUrl;

    private Long categoryId;
}