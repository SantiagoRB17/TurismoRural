package com.proyecto.TurismoRural.repositorio;

import com.proyecto.TurismoRural.modelo.Reserva;
import com.proyecto.TurismoRural.modelo.enums.EstadoReserva;
import org.springframework.stereotype.Component;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

// ReservaRepositorio — almacena y gestiona las reservas en memoria

@Component
public class ReservaRepositorio {

    // HashMap donde viven todas las reservas.
    private final Map<Long, Reserva> datos = new HashMap<>();

    private long contadorId = 1;

    // Guarda una reserva
    public Reserva save(Reserva reserva) {
        if (reserva.getId() == null) {
            reserva.setId(contadorId);
            contadorId++;
        }
        datos.put(reserva.getId(), reserva);
        return reserva;
    }

    // Guarda una lista de reservas de una sola vez
    public List<Reserva> saveAll(List<Reserva> lista) {
        List<Reserva> guardadas = new ArrayList<>();
        for (Reserva reserva : lista) {
            guardadas.add(save(reserva));
        }
        return guardadas;
    }

    // Busca una reserva por su ID
    public Optional<Reserva> findById(Long id) {
        return Optional.ofNullable(datos.get(id));
    }

    // Cuenta cuántas reservas hay en total
    public long count() {
        return datos.size();
    }

    // Cuenta las reservas ACTIVAS de un cliente (para la regla RN-01)
    // Una reserva "activa" es aquella en estado PENDIENTE o CONFIRMADA.
    // Las CANCELADAS no cuentan porque ya no ocupan cupo.
    public long contarReservasActivas(String documentoCliente, List<EstadoReserva> estados) {
        return datos.values().stream()
                .filter(reserva ->
                        reserva.getCliente().getDocumento().equals(documentoCliente) &&
                                estados.contains(reserva.getEstado()))
                .count();
    }

    // Devuelve todas las reservas
    public List<Reserva> findAll() {
        return new ArrayList<>(datos.values());
    }

    // Devuelve todas las reservas de un cliente específico
    public List<Reserva> findByClienteDocumento(String documento) {
        return datos.values().stream()
                .filter(r -> r.getCliente().getDocumento().equals(documento))
                .collect(Collectors.toList());
    }

    // Verifica si ya existe una reserva duplicada
    public boolean existeDuplicado(String documentoCliente, Long experienciaId,
                                   LocalDate fechaExperiencia, List<EstadoReserva> estados) {
        return datos.values().stream()
                .anyMatch(reserva ->
                        reserva.getCliente().getDocumento().equals(documentoCliente) &&
                                reserva.getExperiencia().getId().equals(experienciaId)       &&
                                reserva.getFechaExperiencia().equals(fechaExperiencia)        &&
                                estados.contains(reserva.getEstado()));
    }
}
