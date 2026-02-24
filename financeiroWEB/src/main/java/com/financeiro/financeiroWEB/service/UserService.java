package com.financeiro.financeiroWEB.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.financeiro.financeiroWEB.domain.model.User;
import com.financeiro.financeiroWEB.dto.UserCreateRequest;
import com.financeiro.financeiroWEB.dto.UserResponse;
import com.financeiro.financeiroWEB.exception.EmailAlreadyExistsException;
import com.financeiro.financeiroWEB.exception.ResourceNotFoundException;
import com.financeiro.financeiroWEB.mapper.UserMapper;
import com.financeiro.financeiroWEB.repository.UserRepository;
import com.financeiro.financeiroWEB.security.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse criar(UserCreateRequest dto) {
        if (userRepository.existsByEmail(dto.email())) {
            throw new EmailAlreadyExistsException("Email já cadastrado");
        }

        User user = UserMapper.toEntity(dto);

       
        user.setSenha(passwordEncoder.encode(dto.senha()));

        User salvo = userRepository.save(user);
        return UserMapper.toResponse(salvo);
    }

    public UserResponse buscarPorId(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        return UserMapper.toResponse(user);
    }

    public List<UserResponse> listarTodos() {
        return userRepository.findAll().stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    public void deletar(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuário não encontrado");
        }
        userRepository.deleteById(id);
    }

    public UserResponse buscarMe(){
        String email = SecurityUtils.getAuthenticatedEmail();

        User user = userRepository.findByEmail(email)
             .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

             return UserMapper.toResponse(user);
    }
}
