package com.magasin.sales_book_backend.controller;

import com.magasin.sales_book_backend.dto.*;
import com.magasin.sales_book_backend.model.LigneVente;
import com.magasin.sales_book_backend.service.VenteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ventes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class VenteController {

    private final VenteService venteService;

    @PostMapping
    public ResponseEntity<LigneVente> ajouterLigne(@Valid @RequestBody LigneVenteRequest request) {
        LigneVente created = venteService.ajouterLigne(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LigneVente> modifierLigne(@PathVariable Long id, @Valid @RequestBody LigneVenteRequest request) {
        LigneVente updated = venteService.modifierLigne(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> supprimerLigne(@PathVariable Long id) {
        venteService.supprimerLigne(id);
        return ResponseEntity.ok(Map.of("message", "Ligne supprimÃ©e avec succÃ¨s"));
    }

    @GetMapping("/jour")
    public ResponseEntity<JourneeSummary> getJournee(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        JourneeSummary summary = venteService.getJourneeSummary(date);
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/cloturer")
    public ResponseEntity<JourneeSummary> cloturerJournee(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false, defaultValue = "false") boolean forcerReouverture) {
        JourneeSummary summary = venteService.cloturerJournee(date, forcerReouverture);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/rapport")
    public ResponseEntity<RapportResponse> getRapport(
            @RequestParam(defaultValue = "JOUR") String type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateRef,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateDebut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFin) {
        RapportResponse rapport = venteService.genererRapport(type, dateRef, dateDebut, dateFin);
        return ResponseEntity.ok(rapport);
    }

    @GetMapping("/dates")
    public ResponseEntity<List<LocalDate>> getDatesHistorique() {
        return ResponseEntity.ok(venteService.getHistoriqueDates());
    }
}