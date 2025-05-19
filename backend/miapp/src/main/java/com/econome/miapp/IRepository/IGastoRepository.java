package com.econome.miapp.IRepository;

import java.util.List;

import com.econome.miapp.Entity.Gasto;
import com.econome.miapp.Entity.Usuario;

public interface IGastoRepository extends IBaseRepository<Gasto, Long>{

    List<Gasto> findByUsuario(Usuario usuario);

    
}
