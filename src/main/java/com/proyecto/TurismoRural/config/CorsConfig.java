package com.proyecto.TurismoRural.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// =============================================================
// CorsConfig — Configuración para permitir que el frontend hable con el backend
// =============================================================
//
// PROBLEMA QUE RESUELVE:
// Cuando el frontend (React en http://localhost:5173) intenta llamar al backend
// (Spring en http://localhost:8080), el NAVEGADOR bloquea la petición.
//
// Esto se llama "Same-Origin Policy" (política del mismo origen).
// El navegador dice: "estas dos URLs tienen puertos diferentes (5173 ≠ 8080),
// entonces son 'orígenes distintos' y por seguridad bloqueo la comunicación".
//
// Si no tuviéramos esta configuración, verías este error en la consola del navegador:
// "Access to fetch at 'http://localhost:8080/api/clientes'
//  from origin 'http://localhost:5173' has been blocked by CORS policy"
//
// SOLUCIÓN — CORS (Cross-Origin Resource Sharing):
// Le decimos al servidor que incluya en sus respuestas un encabezado HTTP especial:
// "Access-Control-Allow-Origin: http://localhost:5173"
// Con eso el navegador entiende que está permitido y deja pasar la petición.

// @Configuration indica que esta clase tiene configuraciones de Spring.
// Spring la lee al arrancar y aplica todo lo que configuramos aquí.
@Configuration
public class
CorsConfig {

    // @Bean registra el método como un componente que Spring administra.
    // Spring llama a este método al arrancar y usa el resultado internamente.
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                // Aplicamos la configuración CORS a todas las URLs que empiecen con /api/
                registry.addMapping("/api/**")
                        // Solo permitimos peticiones desde el frontend de React (puerto 5173)
                        // En producción cambiaríamos esto por la URL real del frontend
                        .allowedOrigins("http://localhost:5173")
                        // Métodos HTTP que el frontend puede usar:
                        // GET = leer datos, POST = crear, PUT = actualizar, DELETE = eliminar
                        // OPTIONS = petición previa que el navegador hace automáticamente para verificar CORS
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH")
                        // Permitimos cualquier encabezado HTTP (Content-Type, Authorization, etc.)
                        .allowedHeaders("*");
            }
        };
    }
}
