package com.econome.miapp.IService;

import java.math.BigDecimal;
import java.util.List;

import com.econome.miapp.Entity.Gasto;
import com.econome.miapp.Entity.Usuario;

public interface IGastoService extends IBaseService<Gasto>{
    //Buscar gasto por usuario
    List<Gasto> findByUsuario(Usuario usuario);

    //Guardar gasto asociado a un usuario
    Gasto save(Gasto gasto, Usuario usuario);

    // Cambiamos el update para que devuelva el gasto actualizado con el valor anterior
    Gasto update(Long id, Gasto gasto, Usuario usuario);

    //Actualizar el estado de un gasto
    Gasto updateStatus(Long id, Boolean status);

    BigDecimal sumConfirmedGastosByUsuario(Usuario usuario);
    
     // NUEVO MÉTODO: Eliminar un gasto
    void deleteGasto(Long id, Usuario usuario);

    // Método para obtener un gasto por ID y usuario para validación
    Gasto findByIdAndUsuario(Long id, Usuario usuario);
}
