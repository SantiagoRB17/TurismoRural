package com.proyecto.TurismoRural.servicio;

import com.proyecto.TurismoRural.modelo.Cliente;
import com.proyecto.TurismoRural.modelo.enums.EstadoCliente;
import com.proyecto.TurismoRural.repositorio.ClienteRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

// ClienteServicio — lógica de negocio para clientes

@Service
@RequiredArgsConstructor
public class ClienteServicio {

    private final ClienteRepositorio clienteRepositorio;

    // Devuelve todos los clientes almacenados en memoria
    public List<Cliente> listarTodos() {
        return clienteRepositorio.findAll();
    }

    // Busca clientes cuyo documento, nombre o apellido contengan el texto
    public List<Cliente> buscar(String query) {
        return clienteRepositorio.buscarPorTexto(query);
    }

    // Busca un cliente específico por su documento
    public Cliente buscarPorDocumento(String documento) {
        return clienteRepositorio.findById(documento)
                .orElseThrow(() -> new RuntimeException(
                        "No se encontró un cliente con el documento: " + documento));
    }

    // Crea un nuevo cliente en memoria
    public Cliente crear(Cliente cliente) {
        if (clienteRepositorio.existsById(cliente.getDocumento())) {
            throw new RuntimeException(
                    "Ya existe un cliente registrado con el documento: " + cliente.getDocumento());
        }
        if (clienteRepositorio.existeEmail(cliente.getEmail())) {
            throw new RuntimeException(
                    "Ya existe un cliente registrado con el email: " + cliente.getEmail());
        }
        cliente.setEstado(EstadoCliente.ACTIVO);
        return clienteRepositorio.save(cliente);
    }

    // Actualiza los datos de un cliente existente
    public Cliente actualizar(String documento, Cliente datos) {
        Cliente clienteExistente = clienteRepositorio.findById(documento)
                .orElseThrow(() -> new RuntimeException(
                        "No se encontró un cliente con el documento: " + documento));

        clienteExistente.setNombre(datos.getNombre());
        clienteExistente.setApellido(datos.getApellido());
        clienteExistente.setEmail(datos.getEmail());
        clienteExistente.setTelefono(datos.getTelefono());

        return clienteRepositorio.save(clienteExistente);
    }

    // Reactiva un cliente desactivado
    public void activar(String documento) {
        Cliente cliente = clienteRepositorio.findById(documento)
                .orElseThrow(() -> new RuntimeException(
                        "No se encontró un cliente con el documento: " + documento));
        cliente.setEstado(EstadoCliente.ACTIVO);
        clienteRepositorio.save(cliente);
    }

    // Desactiva un cliente — NUNCA lo borra de la memoria
    // ¿Por qué no borramos? Porque sus reservas anteriores necesitan referenciar al cliente.
    // Si lo borramos, perderíamos el historial de quién hizo cada reserva.
    public void desactivar(String documento) {
        Cliente cliente = clienteRepositorio.findById(documento)
                .orElseThrow(() -> new RuntimeException(
                        "No se encontró un cliente con el documento: " + documento));

        cliente.setEstado(EstadoCliente.INACTIVO);
        clienteRepositorio.save(cliente);
    }
}
