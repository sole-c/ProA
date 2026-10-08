document.addEventListener('DOMContentLoaded', () => {
    // Acción del botón "Ver todas" (Desplaza al calendario y resalta fechas)
document.getElementById('btnVerTodas').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('seccionCalendario').scrollIntoView({ behavior: 'smooth' });
    
    const diasImportantes = document.querySelectorAll('.dia.importante');
    diasImportantes.forEach(dia => dia.classList.add('destacado-animado'));
    setTimeout(() => {
        diasImportantes.forEach(dia => dia.classList.remove('destacado-animado'));
    }, 3000);
});

// Acción de los botones "Ver más" (Abre la ventana modal)
const modal = document.getElementById('modalNovedad');
const modalCuerpo = document.getElementById('modalCuerpo');

document.querySelectorAll('.boton-ver').forEach(boton => {
    boton.addEventListener('click', () => {
        const eventoKey = boton.getAttribute('data-evento');
        const info = informacionEventos[eventoKey];
        if (info) {
            modalCuerpo.innerHTML = `
                <span style="background:#dff5ff; color:#0785c2; padding:4px 10px; border-radius:12px; font-size:12px; font-weight:bold;">${info.tipo}</span>
                <h2 style="color:#07517e; font-size:22px; margin:10px 0;">${info.titulo}</h2>
                <p style="color:#43657f; margin-bottom:10px;"><strong>Fecha:</strong> ${info.fecha} | <strong>Horario:</strong> ${info.horario}</p>
                <p style="color:#43657f; margin-bottom:10px;"><strong>Lugar:</strong> ${info.lugar}</p>
                <p style="color:#5c7990; font-size:14px; margin-bottom:15px;">${info.descripcion}</p>
                <ul style="padding-left:20px; color:#2a5370; font-size:13px;">
                    ${info.detalles.map(d => `<li>${d}</li>`).join('')}
                </ul>
            `;
            modal.classList.remove('hidden');
        }
    });
});

// Cerrar Modal
document.getElementById('cerrarModal').addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
    const informacionEventos = {
    ciencia: {
        titulo: "Feria de Ciencias e Innovación",
        tipo: "Evento",
        fecha: "15 de Octubre",
        horario: "08:30 a 16:00 hs",
        lugar: "Gimnasio Principal y Talleres ProA",
        descripcion: "Muestra anual donde los alumnos presentan proyectos tecnológicos, software y robótica.",
        detalles: ["Proyectos de automatización", "Videojuegos desarrollados por alumnos", "Entrada libre desde las 10:00 hs"]
    },
    familia: {
        titulo: "Día de la Familia",
        tipo: "Efeméride",
        fecha: "20 de Octubre",
        horario: "14:00 a 18:00 hs",
        lugar: "Predio al Aire Libre",
        descripcion: "Jornada de integración, juegos y recreación para toda la comunidad educativa.",
        detalles: ["Juegos en equipo", "Mateada comunitaria", "Muestra artística estudiantil"]
    },
    inscripciones: {
        titulo: "Inscripciones Abiertas 2027",
        tipo: "Información",
        fecha: "Desde el 02 de Noviembre",
        horario: "08:00 a 13:00 hs",
        lugar: "Secretaría / Web Oficial",
        descripcion: "Apertura del proceso de pre-inscripción para ingresantes a 1° Año.",
        detalles: ["Requisitos: DNI y ficha de pre-inscripción", "Constancia de 6° grado", "Formulario digital habilitado desde el 02/11"]
    }
};
    // 1. Referencias a los elementos del HTML
    const elMesActual = document.getElementById('mesActual');
    const elDiasCalendario = document.getElementById('diasCalendario');
    const btnMesAnterior = document.getElementById('mesAnterior');
    const btnMesSiguiente = document.getElementById('mesSiguiente');
    const btnHoy = document.getElementById('botonHoy');

    // 2. Estado inicial: fecha actual del sistema
    let fechaNavegacion = new Date();

    // Nombres de meses en español
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Fechas destacadas / importantes (Formato: "AAAA-MM-DD")
    // Podés modificar estas fechas o agregar las que necesites
    const fechasImportantes = [
        "2026-10-15", // Feria de Ciencias
        "2026-10-20", // Día de la Familia
        "2026-11-02"  // Inscripciones Abiertas
    ];

    // 3. Función principal que renderiza y calcula los días automáticamente
    function renderizarCalendario() {
        const anio = fechaNavegacion.getFullYear();
        const mes = fechaNavegacion.getMonth();

        // Muestra el nombre del mes y año en el encabezado
        elMesActual.textContent = `${meses[mes]} ${anio}`;

        // Limpia los días generados anteriormente
        elDiasCalendario.innerHTML = '';

        // Obtiene en qué día de la semana cae el día 1 del mes (0 = Dom, 1 = Lun, etc.)
        const primerDiaSemana = new Date(anio, mes, 1).getDay();

        // Obtiene la cantidad total de días del mes
        const totalDiasMes = new Date(anio, mes + 1, 0).getDate();

        // Fecha de hoy real para marcar el día actual si coincide
        const hoy = new Date();

        // Genera los casilleros vacíos de alineación previa al día 1
        for (let i = 0; i < primerDiaSemana; i++) {
            const diaVacio = document.createElement('div');
            diaVacio.classList.add('dia', 'vacio');
            elDiasCalendario.appendChild(diaVacio);
        }

        // Genera los días del mes actual
        for (let dia = 1; dia <= totalDiasMes; dia++) {
            const divDia = document.createElement('div');
            divDia.classList.add('dia');

            // Formato 'AAAA-MM-DD' para verificar fechas importantes
            const mesFormateado = String(mes + 1).padStart(2, '0');
            const diaFormateado = String(dia).padStart(2, '0');
            const fechaString = `${anio}-${mesFormateado}-${diaFormateado}`;

            // Determina si este día es HOY
            const esHoy = hoy.getFullYear() === anio &&
                          hoy.getMonth() === mes &&
                          hoy.getDate() === dia;

            // Determina si es una FECHA IMPORTANTE
            const esImportante = fechasImportantes.includes(fechaString);

            if (esImportante) {
                divDia.classList.add('importante');
            }

            if (esHoy) {
                divDia.classList.add('hoy');
            }

            divDia.innerHTML = `<span>${dia}</span>`;
            elDiasCalendario.appendChild(divDia);
        }
    }

    // 4. Eventos para cambiar de mes
    btnMesAnterior.addEventListener('click', () => {
        fechaNavegacion.setMonth(fechaNavegacion.getMonth() - 1);
        renderizarCalendario();
    });

    btnMesSiguiente.addEventListener('click', () => {
        fechaNavegacion.setMonth(fechaNavegacion.getMonth() + 1);
        renderizarCalendario();
    });

    // Evento para regresar al mes y día actual
    if (btnHoy) {
        btnHoy.addEventListener('click', () => {
            fechaNavegacion = new Date();
            renderizarCalendario();
        });
    }

    // 5. Carga inicial del calendario al abrir la página
    renderizarCalendario();
});