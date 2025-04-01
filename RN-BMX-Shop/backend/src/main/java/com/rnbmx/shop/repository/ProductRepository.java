package com.rnbmx.shop.repository;

import com.rnbmx.shop.model.Category;
import com.rnbmx.shop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategoryEntity(Category category);

    List<Product> findByNameContainingIgnoreCase(String name);
}