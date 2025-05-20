package com.econome.miapp.Service;

import java.math.BigDecimal; // Importar BigDecimal
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

        if (!existingGasto.getUsuario().getId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para actualizar este gasto.");
        }

        gasto.setId(id);
        gasto.setUsuario(usuario);
        if (gasto.getStatus() == null) {
            gasto.setStatus(existingGasto.getStatus());
        }

        return gastoRepository.save(gasto);
    }

    @Override
    public Gasto updateStatus(Long id, Boolean status) {
        Gasto existingGasto = gastoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Gasto no encontrado con ID: " + id));

        existingGasto.setStatus(status);
        existingGasto.setUpdatedAt(LocalDateTime.now());
        return gastoRepository.save(existingGasto);
    }

    @Override
    public BigDecimal sumConfirmedGastosByUsuario(Usuario usuario) {
        // 'false' significa confirmado/aplicado
        BigDecimal total = gastoRepository.sumMontoByUsuarioAndStatus(usuario, false);
        return (total != null) ? total : BigDecimal.ZERO;
    }
}