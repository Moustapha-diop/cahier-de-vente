package com.magasin.sales_book_backend.repository;

import com.magasin.sales_book_backend.model.Depense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DepenseRepository extends JpaRepository<Depense, Long> {

    List<Depense> findByDateDepenseOrderByIdAsc(LocalDate dateDepense);

    List<Depense> findByDateDepenseBetweenOrderByDateDepenseAscIdAsc(LocalDate start, LocalDate end);

    @Query("SELECT DISTINCT d.dateDepense FROM Depense d ORDER BY d.dateDepense DESC")
    List<LocalDate> findDistinctDates();
}