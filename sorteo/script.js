// ====== ELEMENTOS DEL DOM ======
const areaParticipantes = document.getElementById("areaParticipantes");
const contadorParticipantes = document.getElementById("contadorParticipantes");
const selectorCantidad = document.getElementById("selectorCantidad");
const campoTitulo = document.getElementById("campoTitulo");
const botonLimpiar = document.getElementById("botonLimpiar");
const botonGenerar = document.getElementById("botonGenerar");

const pantallaConfig = document.getElementById("pantallaConfig");
const pantallaResultados = document.getElementById("pantallaResultados");
const gridEquipos = document.getElementById("gridEquipos");
const tituloResultados = document.getElementById("tituloResultados");
const botonVolver = document.getElementById("botonVolver");
const radiosModo = document.getElementsByName("modo");

let equiposGeneradosGlobal = [];

// ====== LOCAL STORAGE ======
function cargarDatosSorteo() {
  const guardado = localStorage.getItem("participantesSorteo");
  if (guardado !== null) {
    areaParticipantes.value = guardado;
  }
  actualizarContadorSorteo();
  actualizarOpcionesSelector();
}

function guardarDatosSorteo() {
  localStorage.setItem("participantesSorteo", areaParticipantes.value);
}

// ====== LÓGICA DE LISTA DE PARTICIPANTES ======
function obtenerListaParticipantes() {
  return areaParticipantes.value
    .split("\n")
    .map((linea) => linea.substring(0, 50).trim())
    .filter((linea) => linea.length > 0)
    .slice(0, 100);
}

function actualizarContadorSorteo() {
  const lista = obtenerListaParticipantes();
  contadorParticipantes.textContent = lista.length;
}

function actualizarOpcionesSelector() {
  const lista = obtenerListaParticipantes();
  const total = lista.length;
  selectorCantidad.innerHTML = "";

  if (total === 0) return;

  for (let i = 1; i <= total; i++) {
    const opcion = document.createElement("option");
    opcion.value = i;
    opcion.textContent = `${i} ${i === 1 ? "equipo" : "equipos"}`;
    selectorCantidad.appendChild(opcion);
  }
}

// ====== EVENTOS ======
areaParticipantes.addEventListener("input", () => {
  guardarDatosSorteo();
  actualizarContadorSorteo();
  actualizarOpcionesSelector();
});

radiosModo.forEach((radio) => {
  radio.addEventListener("change", actualizarOpcionesSelector);
});

botonLimpiar.addEventListener("click", () => {
  areaParticipantes.value = "";
  campoTitulo.value = "";
  guardarDatosSorteo();
  actualizarContadorSorteo();
  actualizarOpcionesSelector();
});

// ====== GENERAR EQUIPOS ======
botonGenerar.addEventListener("click", () => {
  const lista = obtenerListaParticipantes();
  if (lista.length === 0) {
    alert("Por favor, ingresa al menos un participante.");
    return;
  }

  // Mezclar lista de forma aleatoria
  const copia = [...lista].sort(() => Math.random() - 0.5);
  const numSeleccionado = parseInt(selectorCantidad.value) || 1;
  const modo = Array.from(radiosModo).find((r) => r.checked).value;

  let equipos = [];
  if (modo === "equipos") {
    for (let i = 0; i < numSeleccionado; i++) equipos.push([]);
    copia.forEach((p, index) => {
      equipos[index % numSeleccionado].push(p);
    });
  } else {
    for (let i = 0; i < copia.length; i += numSeleccionado) {
      equipos.push(copia.slice(i, i + numSeleccionado));
    }
  }

  equiposGeneradosGlobal = equipos;
  renderizarResultados(equipos);
});

// ====== RENDERIZAR RESULTADOS ======
function renderizarResultados(equipos) {
  pantallaConfig.style.display = "none";
  pantallaResultados.style.display = "block";
  gridEquipos.innerHTML = "";

  tituloResultados.textContent = campoTitulo.value.trim() || "Equipos";

  equipos.forEach((eq, index) => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-equipo";

    const titulo = document.createElement("h3");
    titulo.textContent = `Equipo ${index + 1}`;
    tarjeta.appendChild(titulo);

    const lista = document.createElement("ul");
    eq.forEach((integrante, idx) => {
      setTimeout(
        () => {
          const item = document.createElement("li");
          item.textContent = integrante;
          lista.appendChild(item);
        },
        (index * eq.length + idx) * 80,
      );
    });

    tarjeta.appendChild(lista);
    gridEquipos.appendChild(tarjeta);
  });
}

// ====== ACCIONES DE BOTONES ======
botonVolver.addEventListener("click", () => {
  pantallaResultados.style.display = "none";
  pantallaConfig.style.display = "block";
});

document.getElementById("botonCopiar").addEventListener("click", () => {
  let texto = `${tituloResultados.textContent}\n\n`;
  equiposGeneradosGlobal.forEach((eq, i) => {
    texto += `Equipo ${i + 1}:\n` + eq.join("\n") + "\n\n";
  });
  navigator.clipboard.writeText(texto);
  alert("¡Copiado al portapapeles!");
});

document.getElementById("botonCopiarColumnas").addEventListener("click", () => {
  let texto = "";
  const maxFilas = Math.max(...equiposGeneradosGlobal.map((e) => e.length));
  for (let f = 0; f < maxFilas; f++) {
    const fila = equiposGeneradosGlobal.map((e) => e[f] || "");
    texto += fila.join("\t") + "\n";
  }
  navigator.clipboard.writeText(texto);
  alert("¡Copiado por columnas!");
});

document.getElementById("botonDescargar").addEventListener("click", () => {
  alert("Puedes realizar una captura de pantalla para guardar la vista.");
});

// Inicializar
cargarDatosSorteo();
