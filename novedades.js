// =====================================
// CALENDARIO
// =====================================

const nombreMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
];


// Fecha que se muestra inicialmente

let fechaCalendario = new Date(2026, 9, 1);


// =====================================
// FECHAS IMPORTANTES
// =====================================

const fechasImportantes = {
    "2026-10-15": "Feria de Ciencias",
    "2026-10-20": "Día de la Familia",
    "2026-11-02": "Inscripciones Abiertas"
};


// =====================================
// ELEMENTOS HTML
// =====================================

const mesActual = document.getElementById("mesActual");

const diasCalendario =
    document.getElementById("diasCalendario");

const botonAnterior =
    document.getElementById("mesAnterior");

const botonSiguiente =
    document.getElementById("mesSiguiente");


// =====================================
// CREAR CALENDARIO
// =====================================

function crearCalendario() {

    const año = fechaCalendario.getFullYear();

    const mes = fechaCalendario.getMonth();


    // Mostrar nombre del mes

    mesActual.textContent =
        nombreMeses[mes] + " " + año;


    // Limpiar calendario anterior

    diasCalendario.innerHTML = "";


    // Primer día del mes

    const primerDia =
        new Date(año, mes, 1).getDay();


    // Cantidad de días del mes

    const cantidadDias =
        new Date(año, mes + 1, 0).getDate();


    // =====================================
    // ESPACIOS VACÍOS
    // =====================================

    for (let i = 0; i < primerDia; i++) {

        const espacio = document.createElement("div");

        espacio.classList.add("dia", "vacio");

        diasCalendario.appendChild(espacio);
    }


    // =====================================
    // CREAR DÍAS
    // =====================================

    for (let dia = 1; dia <= cantidadDias; dia++) {

        const elementoDia =
            document.createElement("div");

        elementoDia.classList.add("dia");


        // Número del día

        const numero =
            document.createElement("span");

        numero.textContent = dia;

        elementoDia.appendChild(numero);


        // Crear fecha YYYY-MM-DD

        const mesNumero =
            String(mes + 1).padStart(2, "0");

        const diaNumero =
            String(dia).padStart(2, "0");

        const fecha =
            `${año}-${mesNumero}-${diaNumero}`;


        // =====================================
        // VERIFICAR SI ES FECHA IMPORTANTE
        // =====================================

        if (fechasImportantes[fecha]) {

            elementoDia.classList.add("importante");

            elementoDia.title =
                fechasImportantes[fecha];
        }


        // =====================================
        // AGREGAR AL CALENDARIO
        // =====================================

        diasCalendario.appendChild(elementoDia);
    }
}


// =====================================
// BOTÓN MES ANTERIOR
// =====================================

botonAnterior.addEventListener("click", function () {

    fechaCalendario.setMonth(
        fechaCalendario.getMonth() - 1
    );

    crearCalendario();
});


// =====================================
// BOTÓN MES SIGUIENTE
// =====================================

botonSiguiente.addEventListener("click", function () {

    fechaCalendario.setMonth(
        fechaCalendario.getMonth() + 1
    );

    crearCalendario();
});


// =====================================
// INICIAR CALENDARIO
// =====================================

crearCalendario();