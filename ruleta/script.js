// =================================================================
// 0. CONTROL DE VISTAS Y NAVEGACIÓN
// =================================================================
const navRuleta = document.getElementById("navRuleta");
const navSorteo = document.getElementById("navSorteo");
const seccionRuleta = document.getElementById("seccionRuleta");
const seccionSorteo = document.getElementById("seccionSorteo");

navRuleta.addEventListener("click", () => {
  navRuleta.classList.add("activo");
  navSorteo.classList.remove("activo");
  seccionRuleta.classList.add("activa");
  seccionSorteo.classList.remove("activa");
});

navSorteo.addEventListener("click", () => {
  navSorteo.classList.add("activo");
  navRuleta.classList.remove("activo");
  seccionSorteo.classList.add("activa");
  seccionRuleta.classList.remove("activa");
});

// =================================================================
// 1. PREGUNTA 1: RULETA
// =================================================================
const lienzo = document.getElementById("lienzoRuleta");
const contexto = lienzo.getContext("2d");
const areaElementos = document.getElementById("areaElementos");
const cajaRespuesta = document.getElementById("respuesta");

const coloresBasicos = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6"]; // F2: 5 colores
const radio = lienzo.width / 2;

let listaElementos = [];
let elementosOcultos = [];
let anguloActual = 0;
let estaGirando = false;
let ultimoSeleccionado = "";

function recuperarDatosRuleta() {
  const guardado = localStorage.getItem("elementosRuleta");
  areaElementos.value =
    guardado !== null ? guardado : "1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12";
  actualizarListaDesdeTexto();
}

function guardarDatosRuleta() {
  localStorage.setItem("elementosRuleta", areaElementos.value);
}

function actualizarListaDesdeTexto() {
  listaElementos = areaElementos.value
    .split("\n")
    .map((linea) => linea.trim())
    .filter((linea) => linea.length > 0);
  dibujarRuleta();
}

function obtenerElementosActivos() {
  return listaElementos.filter((el) => !elementosOcultos.includes(el));
}

function dibujarRuleta() {
  const activos = obtenerElementosActivos();
  contexto.clearRect(0, 0, lienzo.width, lienzo.height);

  if (activos.length === 0) {
    contexto.beginPath();
    contexto.arc(radio, radio, radio - 2, 0, 2 * Math.PI);
    contexto.fillStyle = "#ddd";
    contexto.fill();
    return;
  }

  const anguloPorSector = (2 * Math.PI) / activos.length;

  activos.forEach((elemento, indice) => {
    const anguloInicio = anguloActual + indice * anguloPorSector;
    const anguloFin = anguloInicio + anguloPorSector;

    contexto.beginPath();
    contexto.moveTo(radio, radio);
    contexto.arc(radio, radio, radio - 2, anguloInicio, anguloFin);
    contexto.closePath();
    contexto.fillStyle = coloresBasicos[indice % coloresBasicos.length];
    contexto.fill();
    contexto.strokeStyle = "#fff";
    contexto.lineWidth = 2;
    contexto.stroke();

    contexto.save();
    contexto.translate(radio, radio);
    contexto.rotate(anguloInicio + anguloPorSector / 2);
    contexto.textAlign = "right";
    contexto.fillStyle = "#222";
    contexto.font = "bold 20px Arial";
    contexto.fillText(elemento, radio - 20, 8);
    contexto.restore();
  });
}

function calcularSeleccionado() {
  const activos = obtenerElementosActivos();
  if (activos.length === 0) return "";
  const anguloPorSector = (2 * Math.PI) / activos.length;
  let anguloNormalizado = anguloActual % (2 * Math.PI);
  if (anguloNormalizado < 0) anguloNormalizado += 2 * Math.PI;
  const indice = Math.floor(
    ((2 * Math.PI - anguloNormalizado) % (2 * Math.PI)) / anguloPorSector,
  );
  return activos[indice];
}

function girarRuleta() {
  if (estaGirando) return;
  const activos = obtenerElementosActivos();
  if (activos.length === 0) return;

  estaGirando = true;
  const vueltasExtra = 5 + Math.random() * 5;
  const anguloFinal = anguloActual + vueltasExtra * 2 * Math.PI;
  const anguloInicial = anguloActual;
  const duracion = 4000;
  const tiempoInicio = performance.now();

  function animar(tiempoActual) {
    const transcurrido = tiempoActual - tiempoInicio;
    const progreso = Math.min(transcurrido / duracion, 1);
    const suavizado = 1 - Math.pow(1 - progreso, 3);
    anguloActual = anguloInicial + (anguloFinal - anguloInicial) * suavizado;
    dibujarRuleta();

    if (progreso < 1) {
      requestAnimationFrame(animar);
    } else {
      estaGirando = false;
      ultimoSeleccionado = calcularSeleccionado();
      cajaRespuesta.textContent = ultimoSeleccionado;
    }
  }
  requestAnimationFrame(animar);
}

function ocultarSeleccionado() {
  if (!ultimoSeleccionado) return;
  if (!elementosOcultos.includes(ultimoSeleccionado)) {
    elementosOcultos.push(ultimoSeleccionado);
  }
  resaltarEnTextarea(ultimoSeleccionado);
  dibujarRuleta();
}

function resaltarEnTextarea(texto) {
  const contenido = areaElementos.value;
  const inicio = contenido.indexOf(texto);
  if (inicio >= 0) {
    areaElementos.focus();
    areaElementos.setSelectionRange(inicio, inicio + texto.length);
  }
}

function reiniciar() {
  elementosOcultos = [];
  ultimoSeleccionado = "";
  cajaRespuesta.textContent = "RESPUESTA";
  dibujarRuleta();
}

function alternarPantallaCompleta() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

lienzo.addEventListener("click", girarRuleta);
document.getElementById("botonIniciar").addEventListener("click", girarRuleta);
document.getElementById("botonReiniciar").addEventListener("click", reiniciar);

areaElementos.addEventListener("input", function () {
  guardarDatosRuleta();
  actualizarListaDesdeTexto();
});

document
  .getElementById("botonEditar")
  .addEventListener("click", () => areaElementos.focus());
document
  .getElementById("botonEsconder")
  .addEventListener("click", ocultarSeleccionado);
document.getElementById("botonTitulo").addEventListener("click", function () {
  const titulo = prompt("Título de la ruleta:");
  if (titulo) cajaRespuesta.textContent = titulo;
});

document.addEventListener("keydown", function (evento) {
  if (!seccionRuleta.classList.contains("activa")) return;
  const escribiendo = document.activeElement === areaElementos;

  if (evento.code === "Space" && !escribiendo) {
    evento.preventDefault();
    girarRuleta();
  } else if ((evento.key === "s" || evento.key === "S") && !escribiendo) {
    ocultarSeleccionado();
  } else if ((evento.key === "r" || evento.key === "R") && !escribiendo) {
    reiniciar();
  } else if (evento.key === "e" || evento.key === "E") {
    if (!escribiendo) {
      evento.preventDefault();
      areaElementos.focus();
    }
  } else if ((evento.key === "f" || evento.key === "F") && !escribiendo) {
    alternarPantallaCompleta();
  }
});

recuperarDatosRuleta();

// =================================================================
// 2. PREGUNTA 2: SORTEO DE EQUIPOS
// =================================================================
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

function cargarDatosSorteo() {
  const guardado = localStorage.getItem("participantesSorteo");
  if (guardado) {
    areaParticipantes.value = guardado;
  }
  actualizarContadorSorteo();
  actualizarOpcionesSelector();
}

function guardarDatosSorteo() {
  localStorage.setItem("participantesSorteo", areaParticipantes.value);
}

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

botonGenerar.addEventListener("click", () => {
  const lista = obtenerListaParticipantes();
  if (lista.length === 0) {
    alert("Por favor, ingresa al menos un participante.");
    return;
  }

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

function renderizarResultados(equipos) {
  pantallaConfig.style.display = "none";
  pantallaResultados.style.display = "block";
  gridEquipos.innerHTML = "";

  tituloResultados.textContent =
    campoTitulo.value.trim() || "Equipos Generados";

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
        (index * eq.length + idx) * 150,
      );
    });

    tarjeta.appendChild(lista);
    gridEquipos.appendChild(tarjeta);
  });
}

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
  alert("Copiado al portapapeles!");
});

document.getElementById("botonCopiarColumnas").addEventListener("click", () => {
  let texto = "";
  const maxFilas = Math.max(...equiposGeneradosGlobal.map((e) => e.length));
  for (let f = 0; f < maxFilas; f++) {
    const fila = equiposGeneradosGlobal.map((e) => e[f] || "");
    texto += fila.join("\t") + "\n";
  }
  navigator.clipboard.writeText(texto);
  alert("Copiado por columnas!");
});

document.getElementById("botonDescargar").addEventListener("click", () => {
  alert("Para descargar en JPG haz una captura de pantalla (Win + Shift + S).");
});

cargarDatosSorteo();
