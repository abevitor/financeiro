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
import com.financeiro.financeiroWEB.security.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    /**
     * Obtém o usuário autenticado (a partir do email armazenado no JWT).
     */
    private User getAuthenticatedUser() {
        String email = SecurityUtils.getAuthenticatedEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
    }

    /**
     * Cria uma transação para o usuário logado.
     * OBS: o DTO ainda pode conter userId no seu projeto atual, mas ele será ignorado aqui.
     * O ideal é remover userId do DTO no próximo passo.
     */
    public TransactionResponse criar(TransactionCreateRequest dto) {
        User user = getAuthenticatedUser();

        Category category = categoryRepository.findById(dto.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada"));

        Transaction salvo = transactionRepository.save(
                TransactionMapper.toEntity(dto, user, category)
        );

        return TransactionMapper.toResponse(salvo);
    }

    /**
     * Lista as transações do usuário logado.
     * Substitui listarPorUsuario(userId).
     */
    public List<TransactionResponse> listarMinhas() {
        User user = getAuthenticatedUser();

        return transactionRepository.findByUser(user).stream()
                .map(TransactionMapper::toResponse)
                .toList();
    }

    /**
     * Lista as transações do usuário logado por período.
     * Substitui listarPorPeriodo(userId, inicio, fim).
     */
    public List<TransactionResponse> listarPorPeriodo(LocalDate inicio, LocalDate fim) {
        User user = getAuthenticatedUser();

        return transactionRepository.findByUserAndDataBetween(user, inicio, fim).stream()
                .map(TransactionMapper::toResponse)
                .toList();
    }

    /**
     * Deleta uma transação, mas só se ela pertencer ao usuário logado.
     * (Isso fecha uma brecha importante.)
     */
    public void deletar(Long id) {
        User user = getAuthenticatedUser();

        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação não encontrada"));

        // Garante que a transação é do usuário autenticado
        if (tx.getUser() == null || tx.getUser().getId() == null || !tx.getUser().getId().equals(user.getId())) {
            // você pode trocar por AccessDeniedException se quiser retornar 403
            throw new ResourceNotFoundException("Transação não encontrada");
        }

        transactionRepository.deleteById(id);
    }
}
