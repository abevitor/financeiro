package com.financeiro.financeiroWEB.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.financeiro.financeiroWEB.dto.UserCreateRequest;
import com.financeiro.financeiroWEB.dto.UserResponse;
import com.financeiro.financeiroWEB.mapper.UserMapper;
import com.financeiro.financeiroWEB.domain.model.User;
import com.financeiro.financeiroWEB.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponse criar(UserCreateRequest dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new RuntimeException("Email já cadastrado");
        }
        User salvo = userRepository.save(UserMapper.toEntity(dto));
        return UserMapper.toResponse(salvo);
    }

    public UserResponse buscarPorId(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return UserMapper.toResponse(user);
    }

    public List<UserResponse> listarTodos() {
        return userRepository.findAll().stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    public void deletar(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado");
        }
        userRepository.deleteById(id);
    }
}
