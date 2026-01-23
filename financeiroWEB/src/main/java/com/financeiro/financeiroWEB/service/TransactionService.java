package com.financeiro.financeiroWEB.service;

import java.time.LocalDate;
import java.util.List;

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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public TransactionResponse criar(TransactionCreateRequest dto) {
        User user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Category category = categoryRepository.findById(dto.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        Transaction salvo = transactionRepository.save(TransactionMapper.toEntity(dto, user, category));
        return TransactionMapper.toResponse(salvo);
    }

    public List<TransactionResponse> listarPorUsuario(Long userId) {
        // opcional: validar user existe (fica mais “correto” pro frontend)
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }

        return transactionRepository.findByUserId(userId).stream()
                .map(TransactionMapper::toResponse)
                .toList();
    }

    public List<TransactionResponse> listarPorPeriodo(Long userId, LocalDate inicio, LocalDate fim) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }

        return transactionRepository.findByUserIdAndDataBetween(userId, inicio, fim).stream()
                .map(TransactionMapper::toResponse)
                .toList();
    }

    public void deletar(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Transação não encontrada");
        }
        transactionRepository.deleteById(id);
    }
}
