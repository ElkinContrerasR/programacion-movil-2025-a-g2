package com.econome.miapp.Controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping; // Importar DeleteMapping
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.econome.miapp.DTO.ApiResponseDto;
import com.econome.miapp.Entity.Gasto;
import com.econome.miapp.Entity.Usuario;
import com.econome.miapp.IService.IGastoService;
import com.econome.miapp.IService.IUsuarioService;

//@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api/gastos")
public class GastoController extends ABaseController<Gasto, IGastoService> {
    @Autowired
    private IGastoService gastoService;

    @Autowired
    private IUsuarioService usuarioService;

    public GastoController(IGastoService service) {
        super(service, "Gasto");
        this.gastoService = service;
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<ApiResponseDto<List<Gasto>>> getGastosByUsuario(@PathVariable Long usuarioId) {
        try {
            Usuario usuario = usuarioService.findById(usuarioId);
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseDto<>("Usuario no encontrado", null, false));
            }
            List<Gasto> gastos = gastoService.findByUsuario(usuario);
            return ResponseEntity.ok(new ApiResponseDto<>("Gastos del usuario obtenidos", gastos, true));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponseDto<>(e.getMessage(), null, false));
        }
    }

    @PostMapping("/usuario/{usuarioId}")
    public ResponseEntity<ApiResponseDto<Gasto>> saveGasto(@PathVariable Long usuarioId, @RequestBody Gasto gasto) {
        try {
            Usuario usuario = usuarioService.findById(usuarioId);
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseDto<>("Usuario no encontrado", null, false));
            }
            Gasto nuevoGasto = gastoService.save(gasto, usuario);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponseDto<>("Gasto guardado", nuevoGasto, true));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponseDto<>(e.getMessage(), null, false));
        }
    }

    // ACTUALIZADO: Endpoint para editar un gasto (monto, descripción, categoría)
    @PutMapping("/{id}/usuario/{usuarioId}")
    public ResponseEntity<ApiResponseDto<Gasto>> updateGasto(@PathVariable Long id, @PathVariable Long usuarioId, @RequestBody Gasto gasto) {
        try {
            Usuario usuario = usuarioService.findById(usuarioId);
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseDto<>("Usuario no encontrado", null, false));
            }

            // Antes de actualizar, obtener el gasto existente para validar y posiblemente el monto antiguo
            Gasto existingGasto = gastoService.findByIdAndUsuario(id, usuario); // Asegura que el gasto pertenece al usuario

            BigDecimal oldMonto = existingGasto.getMonto();
            Boolean oldStatus = existingGasto.getStatus(); // Captura el status original

            Gasto updatedGasto = gastoService.update(id, gasto, usuario);

            // Podrías devolver el monto antiguo y el nuevo status si el frontend lo necesita para cálculos más complejos
            // Para la solución actual del dashboard, simplemente cargaremos todo de nuevo, así que no es estrictamente necesario devolverlos.
            return ResponseEntity.ok(new ApiResponseDto<>("Gasto actualizado", updatedGasto, true));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponseDto<>(e.getMessage(), null, false));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponseDto<>(e.getMessage(), null, false));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponseDto<Gasto>> updateGastoStatus(@PathVariable Long id, @RequestBody Gasto statusUpdate) {
        try {
            if (statusUpdate.getStatus() == null) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponseDto<>("Se requiere el campo 'status'", null, false));
            }

            Gasto updatedGasto = gastoService.updateStatus(id, statusUpdate.getStatus());
            return ResponseEntity.ok(new ApiResponseDto<>("Estado del gasto actualizado", updatedGasto, true));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponseDto<>(e.getMessage(), null, false));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponseDto<>(e.getMessage(), null, false));
        }
    }

    @GetMapping("/usuario/{usuarioId}/totalConfirmados")
    public ResponseEntity<ApiResponseDto<BigDecimal>> getTotalConfirmedGastosByUsuario(@PathVariable Long usuarioId) {
        try {
            Usuario usuario = usuarioService.findById(usuarioId);
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseDto<>("Usuario no encontrado", null, false));
            }
            BigDecimal totalGastosConfirmados = gastoService.sumConfirmedGastosByUsuario(usuario);
            return ResponseEntity.ok(new ApiResponseDto<>("Total de gastos confirmados obtenido", totalGastosConfirmados, true));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponseDto<>(e.getMessage(), null, false));
        }
    }

    // NUEVO ENDPOINT: Eliminar un gasto
    @DeleteMapping("/{id}/usuario/{usuarioId}")
    public ResponseEntity<ApiResponseDto<String>> deleteGasto(@PathVariable Long id, @PathVariable Long usuarioId) {
        try {
            Usuario usuario = usuarioService.findById(usuarioId);
            if (usuario == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseDto<>("Usuario no encontrado", null, false));
            }
            gastoService.deleteGasto(id, usuario);
            return ResponseEntity.ok(new ApiResponseDto<>("Gasto eliminado exitosamente", null, true));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponseDto<>(e.getMessage(), null, false));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponseDto<>(e.getMessage(), null, false));
        }
    }
}