package com.econome.miapp.IRepository;

import java.util.Optional;

import com.econome.miapp.Entity.Entrada;

public interface IEntradaRepository extends IBaseRepository<Entrada, Long>{
    Optional<Entrada> findByUsuarioId(Long usuarioId);
}
