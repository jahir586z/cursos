const form = document.getElementById("formCurso"); // referencia al formulario principal
const idInput = document.getElementById("id"); // input oculto que contiene el id en modo edición

// Configuración Toastr
toastr.options = { // opciones de comportamiento de las notificaciones
    "closeButton": true, // muestra botón de cerrar
    "progressBar": true, // muestra barra de progreso
    "positionClass": "toast-top-right", // posición de la notificación
    "timeOut": "2000" // tiempo en ms antes de desaparecer
};

document.addEventListener("DOMContentLoaded", cargarCursos); // al cargar la página ejecuta cargarCursos

// 🔹 Cargar cursos
function cargarCursos() { // obtiene la lista de cursos desde el backend
    fetch("/cursos", { cache: "no-store" }) // petición GET a /cursos evitando caché
        .then(res => res.json()) // parsea la respuesta como JSON
        .then(data => {
            const tabla = document.getElementById("tablaCursos"); // tbody donde se mostrarán filas
            tabla.innerHTML = ""; // limpia contenido previo

            data.forEach(curso => { // itera cada curso recibido
                const fila = document.createElement("tr"); // crea una fila de tabla

                    const safeDate = (() => { // calcula una fecha segura para mostrar
                        if (!curso.fecha_inicio) return ''; // si no hay fecha, devuelve cadena vacía
                        try {
                            const d = new Date(curso.fecha_inicio); // intenta parsear la fecha
                            if (isNaN(d)) return String(curso.fecha_inicio).split('T')[0] || ''; // si inválida, intenta truncar T
                            return d.toISOString().slice(0,10); // devuelve YYYY-MM-DD
                        } catch(e){ return String(curso.fecha_inicio).split('T')[0] || '' } // en cualquier error, intenta truncar
                    })();

                    /*
                      Se usa un template literal para construir las celdas HTML.
                      Las líneas internas representan las columnas: nombre, instructor,
                      horas, nivel, fecha formateada, costo y acciones (editar/eliminar).
                    */
                    fila.innerHTML = `
                        <td>${curso.nombre_curso}</td>
                        <td>${curso.nombre_instructor}</td>
                        <td>${curso.numero_horas}</td>
                        <td>${curso.nivel}</td>
                        <td>${safeDate}</td>
                        <td>$${Number(curso.costo).toFixed(2)}</td>
                        <td>
                            <button class="btn btn-warning btn-sm editar-btn">
                                Editar
                            </button>
                            <button class="btn btn-danger btn-sm eliminar-btn">
                                Eliminar
                            </button>
                        </td>
                    `; // asigna el HTML de la fila (columnas)

                // Botón editar
                fila.querySelector(".editar-btn").addEventListener("click", () => editar(curso)); // asigna evento para editar

                // Botón eliminar
                fila.querySelector(".eliminar-btn").addEventListener("click", () => eliminarCurso(curso.id)); // asigna evento para eliminar

                tabla.appendChild(fila); // agrega la fila al tbody
            });
        })
        .catch(error => {
            console.error(error); // log de error si falla la petición
            toastr.error("Error al cargar cursos"); // notifica al usuario
        });
}

// 🔹 Guardar o actualizar
form.addEventListener("submit", function (e) { // escucha el submit del formulario
    e.preventDefault(); // evita el comportamiento por defecto (recarga)

    const curso = { // construye el objeto curso a enviar
        nombre_curso: document.getElementById("nombre_curso").value,
        nombre_instructor: document.getElementById("nombre_instructor").value,
        numero_horas: document.getElementById("numero_horas").value,
        nivel: document.getElementById("nivel").value,
        fecha_inicio: document.getElementById("fecha_inicio").value,
        costo: document.getElementById("costo").value
    };

    const id = idInput.value; // lee el id (si está en modo edición)

    if (id) {
        // ACTUALIZAR
        fetch(`/actualizar/${id}`, { // solicita PUT al endpoint de actualización
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(curso)
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al actualizar'); // lanza error si estatus no OK
            return res.json(); // parsea respuesta
        })
        .then(() => {
            toastr.success("Curso actualizado correctamente"); // notif. éxito
            limpiarFormulario(); // limpia el formulario
            cargarCursos(); // recarga la tabla
        })
        .catch(err => {
            console.error(err); // log de error
            toastr.error('Error al actualizar curso'); // notif. error
        });

    } else {
        // GUARDAR
        fetch("/guardar", { // solicita POST para crear un nuevo curso
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(curso)
        })
        .then(res => {
            if (!res.ok) throw new Error('Error al guardar'); // valida respuesta
            return res.json(); // parsea JSON
        })
        .then(() => {
            toastr.success("Curso registrado correctamente"); // notif. éxito
            limpiarFormulario(); // limpia campos
            cargarCursos(); // recarga tabla
        })
        .catch(err => {
            console.error(err); // log de error
            toastr.error('Error al guardar curso'); // notif. error
        });
    }
});

// 🔹 Editar
function editar(curso) { // pone el formulario en modo edición con los valores del curso
    idInput.value = curso.id; // guarda id en input oculto
    document.getElementById("nombre_curso").value = curso.nombre_curso; // llena campo nombre
    document.getElementById("nombre_instructor").value = curso.nombre_instructor; // llena instructor
    document.getElementById("numero_horas").value = curso.numero_horas; // llena horas
    document.getElementById("nivel").value = curso.nivel; // selecciona nivel
    document.getElementById("fecha_inicio").value = curso.fecha_inicio.split("T")[0]; // setea fecha (YYYY-MM-DD)
    document.getElementById("costo").value = curso.costo; // setea costo

    toastr.info("Modo edición activado"); // notifica modo edición
}

// 🔹 Eliminar
function eliminarCurso(id) { // elimina curso por id

    if (!confirm('¿Eliminar este curso?')) return; // confirma acción con el usuario

    fetch(`/eliminar/${id}`, {
        method: "DELETE"
    })
    .then(res => {
        if (!res.ok) throw new Error('Error al eliminar'); // valida respuesta
        return res.json(); // parsea
    })
    .then(() => {
        toastr.error("Curso eliminado correctamente"); // notifica eliminación
        cargarCursos(); // recarga tabla
    })
    .catch(err => {
        console.error(err); // log de error
        toastr.error('Error al eliminar curso'); // notifica error
    });
}

// 🔹 Limpiar formulario
function limpiarFormulario() { // resetea formulario y quita id oculto
    form.reset(); // limpia campos
    idInput.value = ""; // borra id
}
