package com.econome.miapp.IService;

import java.util.Optional;

import com.econome.miapp.Entity.Entrada;

public interface IEntradaService extends IBaseService<Entrada>{
    Optional<Entrada> findByUsuarioId(Long usuarioId);
}
