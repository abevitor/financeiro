package com.financeiro.financeiroWEB.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.financeiro.financeiroWEB.domain.model.Category;
import com.financeiro.financeiroWEB.domain.model.Transaction;
import com.financeiro.financeiroWEB.domain.model.User;
import com.financeiro.financeiroWEB.repository.CategoryRepository;
import com.financeiro.financeiroWEB.repository.TransactionRepository;
import com.financeiro.financeiroWEB.repository.UserRepository;

import lombok.RequiredArgsConstructor;


@Service@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public Transaction criar(
        Transaction transaction,
        Long userId,
        Long categoryId
    ) {
        User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario não encontrado"));

                    Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

                transaction.setUser(user);
                transaction.setCategory(category);

                return transactionRepository.save(transaction);    
    }

    public List<Transaction> listarPorUsuario(Long userId){
        return transactionRepository.findByUserId(userId);
    }

    public List<Transaction> listarPorPeriodo(
        Long userId,
        LocalDate inicio,
        LocalDate fim
    ) {
        return transactionRepository.findByUserIdAndDataBetween(
            userId, inicio, fim);
    
    }

    public void deletar(Long id){
        transactionRepository.deleteById(id);
    }
    
}
