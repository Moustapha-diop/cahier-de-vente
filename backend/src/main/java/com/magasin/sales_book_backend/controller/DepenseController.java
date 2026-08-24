package com.magasin.sales_book_backend.controller;

import com.magasin.sales_book_backend.dto.DepenseRequest;
import com.magasin.sales_book_backend.model.Depense;
import com.magasin.sales_book_backend.service.DepenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/depenses")
@RequiredArgsConstructor
public class DepenseController {

    private final DepenseService depenseService;

    @PostMapping
    public ResponseEntity<Depense> ajouterDepense(@Valid @RequestBody DepenseRequest request) {
        Depense created = depenseService.ajouterDepense(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Depense> modifierDepense(
            @PathVariable Long id,
            @Valid @RequestBody DepenseRequest request) {
        Depense updated = depenseService.modifierDepense(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerDepense(@PathVariable Long id) {
        depenseService.supprimerDepense(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/jour")
    public ResponseEntity<List<Depense>> getDepensesDuJour(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Depense> list = depenseService.getDepensesDuJour(date);
        return ResponseEntity.ok(list);
    }
}