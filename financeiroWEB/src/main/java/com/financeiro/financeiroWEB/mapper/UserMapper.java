package com.financeiro.financeiroWEB.mapper;

import com.financeiro.financeiroWEB.domain.model.User;
import com.financeiro.financeiroWEB.dto.UserCreateRequest;
import com.financeiro.financeiroWEB.dto.UserResponse;

public class UserMapper {
    
    private UserMapper(){}

    public static User toEntity(UserCreateRequest dto) {
        User u = new User();
        u.setNome(dto.nome());
        u.setEmail(dto.email());
        u.setSenha(dto.senha());
        return u;
    }


    public static UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getNome(), u.getEmail());
    }
    
}
