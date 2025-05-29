// com.econome.miapp.Service.ABaseService.java

package com.econome.miapp.Service;

import java.time.LocalDateTime;
import java.util.*;

import org.springframework.beans.BeanUtils;
import org.springframework.data.jpa.repository.JpaRepository;

import com.econome.miapp.Entity.ABaseEntity;
import com.econome.miapp.IService.IBaseService;
import com.econome.miapp.Entity.Usuario; // ¡Importa Usuario si tu entidad Usuario tiene la relación 'entrada'!
import com.econome.miapp.Entity.Entrada; // ¡Importa Entrada para claridad!

public abstract class ABaseService<T extends ABaseEntity> implements IBaseService<T>{

    protected abstract JpaRepository<T, Long> getRepository();

    @Override
    public List<T> all() {
        return getRepository().findAll();
    }

    @Override
    public List<T> findByStateTrue() {
        return getRepository().findAll();
    }

    @Override
    public T findById(Long id) throws Exception {
        Optional<T> op = getRepository().findById(id);
        if (op.isEmpty()) {
            throw new Exception("Registro no encontrado");
        }
        return op.get();
    }

    @Override
    public T save(T entity) throws Exception {
        try {
            entity.setCreatedBy(1L); // O el ID del usuario actual si lo gestionas
            entity.setCreatedAt(LocalDateTime.now());
            return getRepository().save(entity);
        } catch (Exception e) {
            throw new Exception("Error al guardar la entidad: " + e.getMessage());
        }
    }

    @Override
    public void update(Long id, T entity) throws Exception {
        Optional<T> op = getRepository().findById(id);

        if (op.isEmpty()) {
            throw new Exception("Registro no encontrado");
        } else if (op.get().getDeletedAt() != null) {
            throw new Exception("Registro inhabilitado");
        }

        T entityUpdate = op.get();

        // Define las propiedades a ignorar durante la copia.
        // Ahora incluimos "password" y "entrada".
        // "password" se ignora para que si el frontend no la envía, la contraseña existente no se sobrescriba.
        // "entrada" se ignora para mantener la relación de la entrada existente.
        String[] ignoreProperties = {"id", "createdAt", "deletedAt", "createdBy", "deletedBy", "entrada", "password"}; // ¡Añadido "password"!
        
        BeanUtils.copyProperties(entity, entityUpdate, ignoreProperties);
        
        // Manejo específico de la contraseña:
        // Si la entidad 'entity' (que viene del request) es un Usuario,
        // y tiene una contraseña no nula y no vacía, entonces actualizamos la contraseña.
        // Si no, la propiedad 'password' ya fue ignorada por BeanUtils.copyProperties,
        // manteniendo la contraseña existente.
        if (entity instanceof Usuario) { // Asegúrate de que es una instancia de Usuario
            Usuario usuarioPayload = (Usuario) entity;
            Usuario usuarioExistente = (Usuario) entityUpdate;

            if (usuarioPayload.getPassword() != null && !usuarioPayload.getPassword().isEmpty()) {
                // Si la nueva contraseña se proporciona, la actualizamos.
                // IMPORTANTE: Aquí deberías hashear la contraseña si no lo estás haciendo.
                // Ejemplo: usuarioExistente.setPassword(passwordEncoder.encode(usuarioPayload.getPassword()));
                usuarioExistente.setPassword(usuarioPayload.getPassword()); // Asumiendo que tu frontend envía la contraseña en texto plano y no la estás hasheando aquí.
            }
            // Si usuarioPayload.getPassword() es null o vacío, no hacemos nada, y la contraseña existente
            // de usuarioExistente se mantiene porque fue ignorada por BeanUtils.copyProperties.
        }

        entityUpdate.setUpdatedBy(2L); // Puedes ajustar el ID del usuario que actualiza
        entityUpdate.setUpdatedAt(LocalDateTime.now());
        
        getRepository().save(entityUpdate);
    }

    @Override
    public void delete(Long id) throws Exception {
        Optional<T> op = getRepository().findById(id);

        if (op.isEmpty()) {
            throw new Exception("Registro no encontrado");
        }

        T entityUpdate = op.get();
        entityUpdate.setDeletedBy(3L); // Puedes ajustar el ID del usuario que elimina
        entityUpdate.setDeletedAt(LocalDateTime.now());
        
        getRepository().save(entityUpdate);
    }
}