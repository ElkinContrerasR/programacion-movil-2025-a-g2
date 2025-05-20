package com.econome.miapp.IRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.econome.miapp.Entity.Gasto;
import com.econome.miapp.Entity.Usuario;

public interface IGastoRepository extends IBaseRepository<Gasto, Long>{

    List<Gasto> findByUsuario(Usuario usuario);

    // Nuevo método para sumar los montos de gastos por usuario y status
    @Query("SELECT SUM(g.monto) FROM Gasto g WHERE g.usuario = :usuario AND g.status = :status")
    BigDecimal sumMontoByUsuarioAndStatus(@Param("usuario") Usuario usuario, @Param("status") Boolean status);

     // NUEVO MÉTODO: Para validar que un gasto pertenece a un usuario específico
    Optional<Gasto> findByIdAndUsuario(Long id, Usuario usuario);
    
}
