package com.magasin.sales_book_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthCheckController {

    @GetMapping({"/", "/health", "/api/health"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> res = new HashMap<>();
        res.put("status", "UP");
        res.put("service", "Boutique YA FALY KA Backend API");
        res.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(res);
    }
}