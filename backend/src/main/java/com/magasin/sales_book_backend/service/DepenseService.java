package com.magasin.sales_book_backend.service;

import com.magasin.sales_book_backend.dto.DepenseRequest;
import com.magasin.sales_book_backend.model.Depense;
import com.magasin.sales_book_backend.repository.DepenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class DepenseService {

    private final DepenseRepository depenseRepository;

    public Depense ajouterDepense(DepenseRequest req) {
        LocalDate date = (req.getDateDepense() != null) ? req.getDateDepense() : LocalDate.now();
        Depense depense = Depense.builder()
                .dateDepense(date)
                .motif(req.getMotif().trim())
                .montant(req.getMontant())
                .categorie(req.getCategorie() != null ? req.getCategorie().trim() : "AUTRE")
                .note(req.getNote())
                .cloturee(false)
                .build();
        return depenseRepository.save(depense);
    }

    public Depense modifierDepense(Long id, DepenseRequest req) {
        Depense depense = depenseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("DÃ©pense non trouvÃ©e : " + id));

        if (Boolean.TRUE.equals(depense.getCloturee())) {
            throw new IllegalStateException("Impossible de modifier une dÃ©pense clÃ´turÃ©e.");
        }

        if (req.getDateDepense() != null) {
            depense.setDateDepense(req.getDateDepense());
        }
        if (req.getMotif() != null) {
            depense.setMotif(req.getMotif().trim());
        }
        if (req.getMontant() != null) {
            depense.setMontant(req.getMontant());
        }
        if (req.getCategorie() != null) {
            depense.setCategorie(req.getCategorie().trim());
        }
        if (req.getNote() != null) {
            depense.setNote(req.getNote());
        }

        return depenseRepository.save(depense);
    }

    public void supprimerDepense(Long id) {
        Depense depense = depenseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("DÃ©pense non trouvÃ©e : " + id));

        if (Boolean.TRUE.equals(depense.getCloturee())) {
            throw new IllegalStateException("Impossible de supprimer une dÃ©pense clÃ´turÃ©e.");
        }
        depenseRepository.delete(depense);
    }

    public List<Depense> getDepensesDuJour(LocalDate date) {
        LocalDate target = (date != null) ? date : LocalDate.now();
        return depenseRepository.findByDateDepenseOrderByIdAsc(target);
    }
}