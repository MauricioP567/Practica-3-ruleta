// ====== VARIABLES GLOBALES ======
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
const pantallaConfig = document.getElementById("pantallaConfig");
const pantallaResultados = document.getElementById("pantallaResultados");
const gridEquipos = document.getElementById("gridEquipos");

const MAXIMO_PARTICIPANTES = 100;
const MAXIMO_CARACTERES = 50;
let equiposGenerados = [];

// ====== F1: RECUPERAR / GUARDAR EN LOCAL STORAGE ======
function recuperarParticipantes() {
  const guardado = localStorage.getItem("participantesSorteo");
  if (guardado !== null) areaParticipantes.value = guardado;
  actualizarContador();
}
function guardarParticipantes() {
  localStorage.setItem("participantesSorteo", areaParticipantes.value);
}

// Obtener lista limpia de participantes (respeta límites)
function obtenerParticipantes() {
  return areaParticipantes.value
    .split("\n")
    .map((linea) => linea.trim().substring(0, MAXIMO_CARACTERES))
    .filter((linea) => linea.length > 0)
    .slice(0, MAXIMO_PARTICIPANTES);
}

function actualizarContador() {
  contadorParticipantes.textContent = obtenerParticipantes().length;
}

// ====== F2: LLENAR LISTA DESPLEGABLE SEGÚN EL MODO ======
function llenarSelector() {
  const modo = document.querySelector('input[name="modo"]:checked').value;
  selectorCantidad.innerHTML = "";
  if (modo === "equipos") {
    for (let i = 2; i <= 20; i++) {
      const opcion = document.createElement("option");
      opcion.value = i;
      opcion.textContent = i + " equipos";
      selectorCantidad.appendChild(opcion);
    }
  } else {
    for (let i = 2; i <= 20; i++) {
      const opcion = document.createElement("option");
      opcion.value = i;
      opcion.textContent = i + " participantes por equipo";
      selectorCantidad.appendChild(opcion);
    }
  }
}

// ====== MEZCLAR ALEATORIAMENTE (algoritmo Fisher-Yates) ======
function mezclar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// ====== F3: GENERAR EQUIPOS ALEATORIAMENTE ======
function generarEquipos() {
  const participantes = mezclar(obtenerParticipantes());
  if (participantes.length < 2) {
    alert("Ingresa al menos 2 participantes.");
    return;
  }

  const modo = document.querySelector('input[name="modo"]:checked').value;
  const valor = parseInt(selectorCantidad.value, 10);

  let cantidadEquipos;
  if (modo === "equipos") {
    cantidadEquipos = valor;
  } else {
    cantidadEquipos = Math.ceil(participantes.length / valor);
  }

  // crear los equipos vacíos
  equiposGenerados = [];
  for (let i = 0; i < cantidadEquipos; i++) equiposGenerados.push([]);

  // repartir uno a uno (distribución equilibrada)
  participantes.forEach((persona, indice) => {
    equiposGenerados[indice % cantidadEquipos].push(persona);
  });

  mostrarResultados();
}

// ====== MOSTRAR PANTALLA 2 CON LOS EQUIPOS ======
function mostrarResultados() {
  const titulo = campoTitulo.value.trim() || "Equipos";
  document.getElementById("tituloResultados").textContent = titulo;

  gridEquipos.innerHTML = "";
  equiposGenerados.forEach((integrantes, indice) => {
    const divEquipo = document.createElement("div");
    divEquipo.className = "equipo";

    const subtitulo = document.createElement("h3");
    subtitulo.textContent = "Equipo " + (indice + 1);
    divEquipo.appendChild(subtitulo);

    const lista = document.createElement("ul");
    integrantes.forEach((persona) => {
      const item = document.createElement("li");
      item.textContent = persona;
      lista.appendChild(item);
    });
    divEquipo.appendChild(lista);
    gridEquipos.appendChild(divEquipo);
  });

  pantallaConfig.style.display = "none";
  pantallaResultados.style.display = "block";
}

// ====== F4: DESCARGAR COMO JPG (canvas puro, sin librerías) ======
function descargarJPG() {
  const anchoCol = 220,
    alto =
      60 +
      equiposGenerados.reduce((max, e) => Math.max(max, e.length), 0) * 26 +
      40;
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.max(equiposGenerados.length * anchoCol + 40, 400);
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, lienzo.width, lienzo.height);
  ctx.fillStyle = "#c0286b";
  ctx.font = "bold 18px Arial";
  ctx.fillText(document.getElementById("tituloResultados").textContent, 20, 30);

  equiposGenerados.forEach((integrantes, i) => {
    const x = 20 + i * anchoCol;
    ctx.fillStyle = "#c0286b";
    ctx.font = "bold 15px Arial";
    ctx.fillText("Equipo " + (i + 1), x, 60);
    ctx.fillStyle = "#222";
    ctx.font = "14px Arial";
    integrantes.forEach((persona, j) => {
      ctx.fillText(persona, x, 85 + j * 24);
    });
  });

  const enlace = document.createElement("a");
  enlace.download = "equipos.jpg";
  enlace.href = lienzo.toDataURL("image/jpeg", 0.95);
  enlace.click();
}

// ====== F4: COPIAR AL PORTAPAPELES (texto plano) ======
function copiarTexto() {
  let texto = document.getElementById("tituloResultados").textContent + "\n\n";
  equiposGenerados.forEach((integrantes, i) => {
    texto += "Equipo " + (i + 1) + ":\n";
    integrantes.forEach((p) => (texto += "  - " + p + "\n"));
    texto += "\n";
  });
  navigator.clipboard.writeText(texto).then(() => alert("¡Equipos copiados!"));
}

// ====== F4: COPIAR POR COLUMNAS (separado por tabulaciones) ======
function copiarPorColumnas() {
  const maxFilas = equiposGenerados.reduce(
    (max, e) => Math.max(max, e.length),
    0,
  );
  let texto =
    equiposGenerados.map((_, i) => "Equipo " + (i + 1)).join("\t") + "\n";
  for (let fila = 0; fila < maxFilas; fila++) {
    texto += equiposGenerados.map((e) => e[fila] || "").join("\t") + "\n";
  }
  navigator.clipboard
    .writeText(texto)
    .then(() => alert("¡Copiado por columnas!"));
}

// ====== EVENTOS ======
areaParticipantes.addEventListener("input", function () {
  guardarParticipantes();
  actualizarContador();
});
document
  .querySelectorAll('input[name="modo"]')
  .forEach((radio) => radio.addEventListener("change", llenarSelector));
document
  .getElementById("botonGenerar")
  .addEventListener("click", generarEquipos);
document.getElementById("botonLimpiar").addEventListener("click", function () {
  areaParticipantes.value = "";
  campoTitulo.value = "";
  guardarParticipantes();
  actualizarContador();
});
document.getElementById("botonVolver").addEventListener("click", function () {
  pantallaResultados.style.display = "none";
  pantallaConfig.style.display = "block";
});
document
  .getElementById("botonDescargar")
  .addEventListener("click", descargarJPG);
document.getElementById("botonCopiar").addEventListener("click", copiarTexto);
document
  .getElementById("botonCopiarColumnas")
  .addEventListener("click", copiarPorColumnas);

// ====== INICIO ======
llenarSelector();
recuperarParticipantes();
