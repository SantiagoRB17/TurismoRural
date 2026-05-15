package com.proyecto.TurismoRural.repositorio;

import com.proyecto.TurismoRural.modelo.Experiencia;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

// ExperienciaRepositorio — almacena y gestiona las experiencias en memoria

@Component
public class ExperienciaRepositorio {

    // HashMap donde viven todas las experiencias.
    // Clave: ID numérico (Long) — Valor: objeto Experiencia completo
    private final Map<Long, Experiencia> datos = new HashMap<>();

    // Contador para asignar IDs automáticamente.
    private long contadorId = 1;

    // Guarda una experiencia
    public Experiencia save(Experiencia experiencia) {
        if (experiencia.getId() == null) {
            experiencia.setId(contadorId);
            contadorId++;
        }
        datos.put(experiencia.getId(), experiencia);
        return experiencia;
    }

    // Guarda una lista de experiencias de una sola vez
    public List<Experiencia> saveAll(List<Experiencia> lista) {
        List<Experiencia> guardadas = new ArrayList<>();
        for (Experiencia experiencia : lista) {
            guardadas.add(save(experiencia));
        }
        return guardadas;
    }

    // Devuelve todas las experiencias como lista
    public List<Experiencia> findAll() {
        return new ArrayList<>(datos.values());
    }

    // Busca una experiencia por su ID
    public Optional<Experiencia> findById(Long id) {
        return Optional.ofNullable(datos.get(id));
    }

    // Cuenta cuántas experiencias hay en total
    public long count() {
        return datos.size();
    }

    // Busca experiencias cuyo nombre o ubicación contengan el texto
    public List<Experiencia> buscarPorTexto(String texto) {
        String textoBusqueda = texto.toLowerCase();

        return datos.values().stream()
                .filter(exp ->
                        exp.getNombre().toLowerCase().contains(textoBusqueda) ||
                        exp.getUbicacion().toLowerCase().contains(textoBusqueda))
                .collect(Collectors.toList());
    }
}
