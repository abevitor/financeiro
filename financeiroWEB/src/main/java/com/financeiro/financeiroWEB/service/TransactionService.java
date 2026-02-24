package com.financeiro.financeiroWEB.service;

import java.time.LocalDate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.financeiro.financeiroWEB.domain.model.Category;
import com.financeiro.financeiroWEB.domain.model.Transaction;
import com.financeiro.financeiroWEB.domain.model.User;
import com.financeiro.financeiroWEB.dto.TransactionCreateRequest;
import com.financeiro.financeiroWEB.dto.TransactionResponse;
import com.financeiro.financeiroWEB.exception.ResourceNotFoundException;
import com.financeiro.financeiroWEB.mapper.TransactionMapper;
import com.financeiro.financeiroWEB.repository.CategoryRepository;
import com.financeiro.financeiroWEB.repository.TransactionRepository;
import com.financeiro.financeiroWEB.repository.UserRepository;
import com.financeiro.financeiroWEB.security.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    private User getAuthenticatedUser() {
        String email = SecurityUtils.getAuthenticatedEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
    }

    public TransactionResponse criar(TransactionCreateRequest dto) {
        User user = getAuthenticatedUser();

        Category category = categoryRepository.findById(dto.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        Transaction salvo = transactionRepository.save(TransactionMapper.toEntity(dto, user, category));
        return TransactionMapper.toResponse(salvo);
    }

   
    public Page<TransactionResponse> listarMinhas(Pageable pageable) {
        User user = getAuthenticatedUser();

        return transactionRepository.findByUser(user, pageable)
                .map(TransactionMapper::toResponse);
    }

    public Page<TransactionResponse> listarPorPeriodo(LocalDate inicio, LocalDate fim, Pageable pageable) {
        User user = getAuthenticatedUser();

        return transactionRepository.findByUserAndDataBetween(user, inicio, fim, pageable)
                .map(TransactionMapper::toResponse);
    }

    public void deletar(Long id) {
        User user = getAuthenticatedUser();

        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada"));

        if (tx.getUser() == null || tx.getUser().getId() == null || !tx.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Transação não encontrada");
        }

        transactionRepository.deleteById(id);
    }
}
