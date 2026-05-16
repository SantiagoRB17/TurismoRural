package com.proyecto.TurismoRural.config;

import com.proyecto.TurismoRural.modelo.Cliente;
import com.proyecto.TurismoRural.modelo.Experiencia;
import com.proyecto.TurismoRural.modelo.Reserva;
import com.proyecto.TurismoRural.modelo.enums.EstadoCliente;
import com.proyecto.TurismoRural.modelo.enums.EstadoExperiencia;
import com.proyecto.TurismoRural.modelo.enums.EstadoReserva;
import com.proyecto.TurismoRural.repositorio.ClienteRepositorio;
import com.proyecto.TurismoRural.repositorio.ExperienciaRepositorio;
import com.proyecto.TurismoRural.repositorio.ReservaRepositorio;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// DataSeeder — carga datos de prueba automáticamente al arrancar
// Implementa CommandLineRunner: Spring Boot ejecuta el método run()
// automáticamente justo después de que termina de arrancar.
// Así tenemos datos listos para probar sin ingresarlos a mano.
// Los datos van al HashMap de cada repositorio (en la memoria RAM).

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final ClienteRepositorio clienteRepositorio;
    private final ExperienciaRepositorio experienciaRepositorio;
    private final ReservaRepositorio reservaRepositorio;

    @Override
    public void run(String... args) {
        // Solo cargamos datos si los HashMaps están vacíos
        if (clienteRepositorio.count() == 0) {

            System.out.println("=================================================");
            System.out.println("  Cargando datos de prueba en memoria...");
            System.out.println("=================================================");

            cargarClientes();
            List<Experiencia> experiencias = cargarExperiencias();
            cargarReservas(experiencias);

            System.out.println("  Clientes cargados:     " + clienteRepositorio.count());
            System.out.println("  Experiencias cargadas: " + experienciaRepositorio.count());
            System.out.println("  Reservas cargadas:     " + reservaRepositorio.count());
            System.out.println("=================================================");
            System.out.println("  Backend listo en: http://localhost:8080");
            System.out.println("  Clientes:         http://localhost:8080/api/clientes");
            System.out.println("  Experiencias:     http://localhost:8080/api/experiencias");
            System.out.println("=================================================");
        }
    }

    // -----------------------------------------------------------------------
    // 10 clientes con nombres colombianos (8 ACTIVOS, 2 INACTIVOS)
    // -----------------------------------------------------------------------
    private void cargarClientes() {
        List<Cliente> clientes = List.of(
                new Cliente("1094567890", "Carlos",    "Martínez", "carlos.martinez@email.com",    "3101234567", EstadoCliente.ACTIVO),
                new Cliente("1094567891", "María",     "González", "maria.gonzalez@email.com",     "3112345678", EstadoCliente.ACTIVO),
                new Cliente("1094567892", "Andrés",    "López",    "andres.lopez@email.com",       "3123456789", EstadoCliente.ACTIVO),
                new Cliente("1094567893", "Paola",     "Ramírez",  "paola.ramirez@email.com",      "3134567890", EstadoCliente.ACTIVO),
                new Cliente("1094567894", "Juan",      "Pérez",    "juan.perez@email.com",         "3145678901", EstadoCliente.ACTIVO),
                new Cliente("1094567895", "Valentina", "Torres",   "valentina.torres@email.com",   "3156789012", EstadoCliente.ACTIVO),
                new Cliente("1094567896", "Sebastián", "Vargas",   "sebastian.vargas@email.com",   "3167890123", EstadoCliente.ACTIVO),
                new Cliente("1094567897", "Daniela",   "Moreno",   "daniela.moreno@email.com",     "3178901234", EstadoCliente.ACTIVO),
                // Clientes INACTIVOS — para probar que no pueden hacer reservas
                new Cliente("1094567898", "Felipe",    "Castro",   "felipe.castro@email.com",      "3189012345", EstadoCliente.INACTIVO),
                new Cliente("1094567899", "Laura",     "Jiménez",  "laura.jimenez@email.com",      "3190123456", EstadoCliente.INACTIVO)
        );
        for (Cliente c : clientes) {
            clienteRepositorio.save(c);
        }
    }

    // -----------------------------------------------------------------------
    // 20 experiencias del Eje Cafetero / Quindío
    //   15 DISPONIBLES · 3 AGOTADAS · 2 SUSPENDIDAS
    // -----------------------------------------------------------------------
    private List<Experiencia> cargarExperiencias() {
        List<Experiencia> experiencias = List.of(

                // --- DISPONIBLES ---
                new Experiencia(null, "Tour Cafetero en Salento",
                        "Recorrido por fincas cafeteras tradicionales. Aprende todo el proceso del café desde la mata hasta la taza. Degustación incluida.",
                        "Salento, Quindío", new BigDecimal("85000"), 10, 4, EstadoExperiencia.DISPONIBLE),

                new Experiencia(null, "Valle del Cocora — Senderismo",
                        "Caminata de 12 km entre palmas de cera, el árbol nacional de Colombia. Guía experto incluido. Nivel moderado.",
                        "Salento, Quindío", new BigDecimal("65000"), 15, 5, EstadoExperiencia.DISPONIBLE),

                new Experiencia(null, "Avistamiento de Aves Exóticas",
                        "Observación de más de 40 especies de aves únicas del Eje Cafetero con binoculares y guía ornitólogo.",
                        "Filandia, Quindío", new BigDecimal("75000"), 8, 3, EstadoExperiencia.DISPONIBLE),

                new Experiencia(null, "Finca Cafetera Los Naranjos",
                        "Visita completa a finca caficultora: recolección, procesado húmedo, secado y tostado artesanal. Almuerzo campesino incluido.",
                        "Montenegro, Quindío", new BigDecimal("90000"), 12, 6, EstadoExperiencia.DISPONIBLE),

                new Experiencia(null, "Rafting en el Río La Vieja",
                        "Aventura en aguas bravas nivel 3-4 con equipo certificado e instructor. No se requiere experiencia previa.",
                        "Cartago, Valle del Cauca", new BigDecimal("120000"), 10, 3, EstadoExperiencia.DISPONIBLE),

                new Experiencia(null, "Parapente sobre el Paisaje Cafetero",
                        "Vuelo biplaza con instructor certificado sobre el Paisaje Cultural Cafetero, Patrimonio de la Humanidad.",
                        "Armenia, Quindío", new BigDecimal("180000"), 6, 2, EstadoExperiencia.DISPONIBLE),

                new Experiencia(null, "Canopy Bosque Encantado",
                        "Recorrido en 8 cables de acero sobre bosque nublado. El más largo: 450 metros. Arnés y casco incluidos.",
                        "Pijao, Quindío", new BigDecimal("95000"), 20, 3, EstadoExperiencia.DISPONIBLE),

                new Experiencia(null, "Caminata al Nevado del Ruiz",
                        "Expedición al volcán activo más alto de Colombia (5.321 msnm). Guía de montaña, equipo de frío y transporte incluidos.",
                        "Manizales, Caldas", new BigDecimal("200000"), 8, 8, EstadoExperiencia.DISPONIBLE),

                new Experiencia(null, "Termales Santa Rosa de Cabal",
                        "Tarde de relax en aguas termales naturales (36°C–42°C) rodeadas de montañas. Transporte desde Armenia incluido.",
                        "Santa Rosa de Cabal, Risaralda", new BigDecimal("110000"), 25, 4, EstadoExperiencia.DISPONIBLE),

                new Experiencia(null, "Recorrido Cultural en Manizales",
                        "Tour por el Palacio de Bellas Artes, la Catedral Basílica, el Cable Aéreo y el barrio histórico con guía bilingüe.",
                        "Manizales, Caldas", new BigDecimal("55000"), 20, 4, EstadoExperiencia.DISPONIBLE),

                new Experiencia(null, "Taller de Chocolate Artesanal",
                        "Elabora chocolate artesanal desde cacao fresco de la finca. Te llevas tu propia tableta de chocolate.",
                        "Quimbaya, Quindío", new BigDecimal("70000"), 15, 3, EstadoExperiencia.DISPONIBLE),

                new Experiencia(null, "Cabalgata por Senderos Cafeteros",
                        "Recorrido de 3 horas a caballo por caminos veredales con vista panorámica al Valle del Quindío. Caballos mansos.",
                        "Génova, Quindío", new BigDecimal("80000"), 10, 3, EstadoExperiencia.DISPONIBLE),

                new Experiencia(null, "Clase de Cocina Campesina Colombiana",
                        "Aprende a preparar bandeja paisa, sancocho de gallina criolla y arepas de chócolo con familia campesina.",
                        "Circasia, Quindío", new BigDecimal("60000"), 12, 3, EstadoExperiencia.DISPONIBLE),

                new Experiencia(null, "Zipline Cañón del Quindío",
                        "Vuelo en cable de acero de 800 metros sobre el cañón del río Quindío. Vista panorámica de 360 grados.",
                        "La Tebaida, Quindío", new BigDecimal("95000"), 16, 2, EstadoExperiencia.DISPONIBLE),

                new Experiencia(null, "Observación de Estrellas en el Páramo",
                        "Noche de astronomía con telescopios profesionales y guía astrónomo. Incluye cena y bebida caliente.",
                        "Salento, Quindío", new BigDecimal("130000"), 12, 4, EstadoExperiencia.DISPONIBLE),

                // --- AGOTADAS ---
                new Experiencia(null, "Camping Bajo las Estrellas en el Cocora",
                        "Noche de camping con fogata, astronomía y amanecer entre palmas de cera. Equipo incluido.",
                        "Salento, Quindío", new BigDecimal("150000"), 20, 14, EstadoExperiencia.AGOTADA),

                new Experiencia(null, "Tour de Mariposas Exóticas",
                        "Visita al mariposario natural más grande del departamento con más de 80 especies colombianas.",
                        "Calarcá, Quindío", new BigDecimal("40000"), 30, 2, EstadoExperiencia.AGOTADA),

                new Experiencia(null, "Festival del Café — Edición Especial",
                        "Experiencia inmersiva en la cosecha del café durante la temporada alta. Festival, música y gastronomía local.",
                        "Montenegro, Quindío", new BigDecimal("160000"), 20, 6, EstadoExperiencia.AGOTADA),

                // --- SUSPENDIDAS ---
                new Experiencia(null, "Expedición en Canoa Río Magdalena",
                        "Navegación de un día en canoa tradicional por el río más importante de Colombia. Suspendida por mantenimiento.",
                        "Honda, Tolima", new BigDecimal("175000"), 10, 5, EstadoExperiencia.SUSPENDIDA),

                new Experiencia(null, "Trekking Páramo de Frontino",
                        "Caminata por ecosistema de páramo. Suspendida temporalmente por condiciones climáticas adversas.",
                        "Urrao, Antioquia", new BigDecimal("190000"), 8, 7, EstadoExperiencia.SUSPENDIDA)
        );

        // saveAll() guarda todas y asigna IDs automáticos (1, 2, 3...)
        // Devolvemos la lista con los IDs ya asignados para usarlos en las reservas
        return experienciaRepositorio.saveAll(experiencias);
    }

    // -----------------------------------------------------------------------
    // 5 reservas de ejemplo en diferentes estados
    // -----------------------------------------------------------------------
    private void cargarReservas(List<Experiencia> experiencias) {
        // Tomamos clientes directamente del HashMap por su documento
        Cliente carlos = clienteRepositorio.findById("1094567890").get();
        Cliente maria  = clienteRepositorio.findById("1094567891").get();
        Cliente andres = clienteRepositorio.findById("1094567892").get();
        Cliente paola  = clienteRepositorio.findById("1094567893").get();
        Cliente juan   = clienteRepositorio.findById("1094567894").get();

        // Tomamos experiencias de la lista devuelta por saveAll()
        // (en el orden en que las creamos arriba: índice 0 = Tour Cafetero, etc.)
        Experiencia tourCafe  = experiencias.get(0); // Tour Cafetero en Salento
        Experiencia cocora    = experiencias.get(1); // Valle del Cocora
        Experiencia rafting   = experiencias.get(4); // Rafting en el Río La Vieja
        Experiencia parapente = experiencias.get(5); // Parapente sobre el Paisaje Cafetero
        Experiencia termales  = experiencias.get(8); // Termales Santa Rosa de Cabal

        List<Reserva> reservas = List.of(
                crearReserva(carlos, tourCafe,  LocalDate.now().plusDays(5),   2, EstadoReserva.CONFIRMADA),
                crearReserva(maria,  cocora,    LocalDate.now().plusDays(3),   3, EstadoReserva.PENDIENTE),
                crearReserva(andres, rafting,   LocalDate.now().plusDays(7),   1, EstadoReserva.CONFIRMADA),
                crearReserva(paola,  parapente, LocalDate.now().plusDays(10),  2, EstadoReserva.PENDIENTE),
                crearReserva(juan,   termales,  LocalDate.now().minusDays(15), 4, EstadoReserva.CANCELADA)
        );
        reservaRepositorio.saveAll(reservas);
    }

    // Método auxiliar para construir un objeto Reserva sin repetir código
    private Reserva crearReserva(Cliente cliente, Experiencia experiencia,
                                  LocalDate fechaExperiencia, int cantidadPersonas,
                                  EstadoReserva estado) {
        Reserva reserva = new Reserva();
        reserva.setCliente(cliente);
        reserva.setExperiencia(experiencia);
        reserva.setFechaReserva(LocalDate.now());
        reserva.setFechaExperiencia(fechaExperiencia);
        reserva.setCantidadPersonas(cantidadPersonas);
        reserva.setTotal(experiencia.getPrecio().multiply(BigDecimal.valueOf(cantidadPersonas)));
        reserva.setEstado(estado);
        reserva.setCreadoEn(LocalDateTime.now());
        return reserva;
    }
}
