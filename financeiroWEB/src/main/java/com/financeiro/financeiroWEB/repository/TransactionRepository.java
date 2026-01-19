package com.financeiro.financeiroWEB.repository;

import java.time.LocalDate;
import java.util.List;
import com.financeiro.financeiroWEB.domain.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserId(Long userId);

    List<Transaction> findByUserIdAndDataBetween(
            Long userId,
            LocalDate inicio,
            LocalDate fim
    );
}


