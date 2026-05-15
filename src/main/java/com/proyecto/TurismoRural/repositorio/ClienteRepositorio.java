package com.proyecto.TurismoRural.repositorio;

import com.proyecto.TurismoRural.modelo.Cliente;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

// ClienteRepositorio — almacena y gestiona los clientes en memoria
// Se usa un HashMap de Java.

@Component
public class ClienteRepositorio {

    // HashMap donde viven todos los clientes mientras el servidor está corriendo.
    private final Map<String, Cliente> datos = new HashMap<>();

    // Devuelve todos los clientes como una lista
    public List<Cliente> findAll() {
        return new ArrayList<>(datos.values());
    }

    // Busca un cliente por su documento
    // Devuelve Optional<Cliente> porque el cliente puede o no existir.
    public Optional<Cliente> findById(String documento) {
        return Optional.ofNullable(datos.get(documento));
    }

    // Verifica si existe un cliente con ese documento
    public boolean existsById(String documento) {
        return datos.containsKey(documento);
    }

    // Guarda o actualiza un cliente
    public Cliente save(Cliente cliente) {
        datos.put(cliente.getDocumento(), cliente);
        return cliente;
    }

    // Cuenta cuántos clientes hay en total
    public long count() {
        return datos.size();
    }

    // Busca clientes cuyo documento, nombre o apellido contengan el texto
    public List<Cliente> buscarPorTexto(String texto) {
        String textoBusqueda = texto.toLowerCase();

        return datos.values().stream()
                .filter(cliente ->
                        cliente.getDocumento().toLowerCase().contains(textoBusqueda) ||
                        cliente.getNombre().toLowerCase().contains(textoBusqueda)    ||
                        cliente.getApellido().toLowerCase().contains(textoBusqueda))
                .collect(Collectors.toList());
    }

    // Verifica si ya existe otro cliente con el mismo email (para evitar duplicados)
    public boolean existeEmail(String email) {
        return datos.values().stream()
                .anyMatch(cliente -> cliente.getEmail().equalsIgnoreCase(email));
    }
}
