package com.econome.miapp.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import com.econome.miapp.Entity.Gasto;
import com.econome.miapp.Entity.Usuario;
import com.econome.miapp.IRepository.IGastoRepository;
import com.econome.miapp.IService.IGastoService;

@Service
public class GastoService extends ABaseService<Gasto> implements IGastoService {

    @Autowired
    private IGastoRepository gastoRepository;

    @Override
    protected JpaRepository<Gasto, Long> getRepository() {
        return gastoRepository;
    }

    @Override
    public List<Gasto> findByUsuario(Usuario usuario) {
        return gastoRepository.findByUsuario(usuario);
    }

    @Override
    public Gasto save(Gasto gasto, Usuario usuario) {
        gasto.setUsuario(usuario);
        if (gasto.getStatus() == null) {
            gasto.setStatus(true); // Por defecto, un gasto nuevo está "pendiente" (true)
        }
        return gastoRepository.save(gasto);
    }

    @Override
    public Gasto update(Long id, Gasto gasto, Usuario usuario) {
        Gasto existingGasto = gastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto no encontrado con ID: " + id));

        // Validación de que el gasto pertenece al usuario
        if (!existingGasto.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para actualizar este gasto.");
        }

        // Guardar el monto anterior si el gasto estaba confirmado para poder recalcular en el frontend si es necesario
        // Aunque el frontend recalculará el total de confirmados, es buena práctica saberlo aquí si la lógica fuera más compleja.
        BigDecimal oldMonto = existingGasto.getMonto();
        Boolean oldStatus = existingGasto.getStatus();

        // Actualizar campos
        existingGasto.setMonto(gasto.getMonto());
        existingGasto.setDescripcion(gasto.getDescripcion());
        existingGasto.setCategoria(gasto.getCategoria());
        // El status no se debería cambiar directamente por este update si es para edición de monto/desc/cat.
        // Se mantiene la lógica de updateStatus separada para eso.
        // Si quieres permitir cambiar el status en esta llamada, descomenta la siguiente línea:
        // existingGasto.setStatus(gasto.getStatus() != null ? gasto.getStatus() : existingGasto.getStatus());
        existingGasto.setUpdatedAt(LocalDateTime.now());

        return gastoRepository.save(existingGasto);
    }

    @Override
    public Gasto updateStatus(Long id, Boolean status) {
        Gasto existingGasto = gastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto no encontrado con ID: " + id));

        existingGasto.setStatus(status);
        existingGasto.setUpdatedAt(LocalDateTime.now());
        // Si el status cambia a false (confirmado), establecemos deletedAt a null
        // Si el status cambia a true (desconfirmado/pendiente), establecemos deletedAt a null
        // Si queremos simular una eliminación lógica para gastos, aquí manejaríamos deletedAt
        // Por ahora, asumimos que 'status: false' es confirmado y 'status: true' es pendiente
        if (status) { // Si el status se vuelve true (pendiente), se "deselimina" lógicamente si estuviera "eliminado"
             existingGasto.setDeletedAt(null);
        }

        return gastoRepository.save(existingGasto);
    }

    @Override
    public BigDecimal sumConfirmedGastosByUsuario(Usuario usuario) {
        // 'false' significa confirmado/aplicado
        BigDecimal total = gastoRepository.sumMontoByUsuarioAndStatus(usuario, false);
        return (total != null) ? total : BigDecimal.ZERO;
    }

    // NUEVO MÉTODO: Eliminar un gasto
    @Override
    public void deleteGasto(Long id, Usuario usuario) {
        Gasto existingGasto = gastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto no encontrado con ID: " + id));

        // Validación de que el gasto pertenece al usuario
        if (!existingGasto.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para eliminar este gasto.");
        }

        // Eliminación física
        gastoRepository.delete(existingGasto);
    }

    // NUEVO MÉTODO: Encontrar por ID y Usuario para validación
    @Override
    public Gasto findByIdAndUsuario(Long id, Usuario usuario) {
        return gastoRepository.findByIdAndUsuario(id, usuario)
                .orElseThrow(() -> new RuntimeException("Gasto no encontrado o no pertenece al usuario."));
    }
}