package com.econome.miapp.Config; // Ajusta el paquete según tu estructura

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Aplica a todas las rutas de tu API
                .allowedOrigins(
                    "http://localhost:8100",          // Para Ionic en tu PC con ionic serve
                    "http://192.168.1.6:8100",        // Para Ionic en tu móvil con ionic serve --external
                    "http://localhost",               // Para Capacitor en Android/iOS (emuladores)
                    "capacitor://localhost",          // Para Capacitor en Android/iOS (dispositivos físicos)
                    "ionic://localhost"               // Para Ionic DevApp (si la usas)
                    // Añade cualquier otro origen que necesites, por ejemplo, si pruebas con un host diferente
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Métodos HTTP permitidos
                .allowedHeaders("*") // Permite todos los encabezados
                .allowCredentials(true); // Permite credenciales (cookies, auth headers)
    }
}