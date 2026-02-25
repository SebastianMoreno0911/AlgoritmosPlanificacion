let algoritmoActual = "";
let timelineGlobal = [];
let pasoActual = 0;
let intervaloSimulacion = null;

// Seleccion de algoritmo
function seleccionarAlgoritmo(tipo) {
  algoritmoActual = tipo;

  document.getElementById("pantallaInicio").classList.add("oculto");
  document.getElementById("pantallaFormulario").classList.remove("oculto");

  document.getElementById("tituloAlgoritmo").innerText =
    tipo === "fifo"
      ? "FIFO"
      : tipo === "sjf"
        ? "SJF"
        : tipo === "rr"
          ? "Round Robin"
          : tipo === "prioridad"
            ? "Prioridad"
            : tipo === "mlfq"
              ? "MLFQ"
              : "Desconocido";
}

// Generar inputs dinamicos
function generarInputs() {
  let n = parseInt(document.getElementById("numProcesos").value);
  if (isNaN(n) || n <= 0) {
    alert("Ingrese un numero valido de procesos");
    return;
  }
  let inputsDiv = document.getElementById("inputs");
  inputsDiv.innerHTML = "";

  if (algoritmoActual === "rr") {
    inputsDiv.innerHTML += `
      <h3>Quantum</h3>
      <input type="number" id="quantum" class="border p-2 rounded"><br><br>
    `;
  }

  if (algoritmoActual === "mlfq") {
    inputsDiv.innerHTML += `
      <h3>Quantums por nivel (ej: 3,5,7)</h3>
      <input type="text" id="quantumsMLFQ" class="border p-2 rounded"><br><br>
    `;
  }

  for (let i = 0; i < n; i++) {
    inputsDiv.innerHTML += `
      <h3>Proceso ${i + 1}</h3>
      Llegada: <input type="number" id="llegada${i}" class="border p-2 rounded"><br>
      CPU: <input type="number" id="cpu${i}" class="border p-2 rounded"><br><br>
    `;

    if (algoritmoActual === "prioridad") {
      inputsDiv.innerHTML += `
      Prioridad: <input type="number" id="prioridad${i}" class="border p-2 rounded"><br><br>
      `;
    } else {
      inputsDiv.innerHTML += `<br>`;
    }
  }

  inputsDiv.innerHTML += `
    <button onclick="simular(${n})" class="bg-indigo-600 px-4 py-2 rounded text-white">
      Simular
    </button>
  `;
}

// Ejecutar algoritmo
function simular(n) {
  // RECOLECCION DE DATOS

  let llegada = [];
  let cpu = [];
  let prioridades = [];

  for (let i = 0; i < n; i++) {
    llegada[i] = parseInt(document.getElementById(`llegada${i}`).value);
    cpu[i] = parseInt(document.getElementById(`cpu${i}`).value);
  }

  // Si el algoritmo usa prioridad, recolectamos ese dato adicional
  if (algoritmoActual === "prioridad") {
    for (let i = 0; i < n; i++) {
      prioridades[i] = parseInt(document.getElementById(`prioridad${i}`).value);
    }
  }

  let resultados;
  let qs; // ← Se usa solo para MLFQ (evita leer el DOM dos veces)

  // EJECUCION DEL ALGORITMO

  if (algoritmoActual === "fifo") {
    resultados = fifo(llegada, cpu);
  } else if (algoritmoActual === "sjf") {
    resultados = sjf(llegada, cpu);
  } else if (algoritmoActual === "rr") {
    let quantum = parseInt(document.getElementById("quantum").value);
    resultados = roundRobin(llegada, cpu, quantum);
  } else if (algoritmoActual === "prioridad") {
    resultados = prioridad(llegada, cpu, prioridades);
  } else if (algoritmoActual === "mlfq") {
    // Se obtiene el string tipo "3,5,7"
    const qStrn = document.getElementById("quantumsMLFQ").value;

    // Se convierte a arreglo de enteros
    qs = qStrn.split(",").map((q) => parseInt(q.trim()));

    resultados = mlfq(llegada, cpu, qs);
  }

  // Si algo fallo en el calculo, detenemos ejecucion
  if (!resultados) {
    alert("Error al calcular");
    return;
  }

  // MOSTRAR RESULTADOS

  document.getElementById("resultados").classList.remove("oculto");
  mostrarResultados(resultados, llegada, cpu);

  // GENERAR TIMELINE PARA ANIMACION

  // Importante:
  // El algoritmo calcula metricas.
  // El timeline genera la simulacion paso a paso.

  if (algoritmoActual === "rr") {
    let quantum = parseInt(document.getElementById("quantum").value);
    timelineGlobal = generarTimelineRR(llegada, cpu, quantum);
  } else if (algoritmoActual === "mlfq") {
    // Usamos el mismo qs ya calculado arriba
    timelineGlobal = generarTimelineMLFQ(llegada, cpu, qs);
  } else {
    // FIFO, SJF y Prioridad usan timeline basico
    timelineGlobal = generarTimelineBasico(resultados, llegada);
  }

  // REINICIAR SIMULACION VISUAL

  // Limpia gantt, cpu y cola antes de iniciar animacion

  reiniciarSimulacion();
}

// Mostrar resultados en tabla simple
function mostrarResultados(resultados, llegada, cpu) {
  let salida = document.getElementById("salida");
  salida.innerHTML = `<h2 class="text-xl font-bold mb-4">
    Resultados ${algoritmoActual.toUpperCase()}
  </h2>`;

  let { inicio, finalizacion, espera, retorno, tiempoTotal } = resultados;

  for (let i = 0; i < llegada.length; i++) {
    salida.innerHTML += `
      <p>
        P${i + 1} |
        Llegada: ${llegada[i]} |
        Inicio: ${inicio[i]} |
        Fin: ${finalizacion[i]} |
        Espera: ${espera[i]} |
        Retorno: ${retorno[i]}
      </p>
    `;
  }

  salida.innerHTML += `<h3 class="mt-4">Tiempo total: ${tiempoTotal}</h3>`;
}

// Timeline basico (FIFO y SJF)
function generarTimelineBasico(resultados) {
  let timeline = [];
  let { inicio, finalizacion } = resultados;

  // Encontrar el tiempo total de simulacion
  let tiempoMax = Math.max(...finalizacion);

  //  Recorrer el tiempo cronologicamente
  for (let t = 0; t < tiempoMax; t++) {
    let ejecutando = null;

    // Buscar que proceso esta activo en este instante
    for (let i = 0; i < inicio.length; i++) {
      if (t >= inicio[i] && t < finalizacion[i]) {
        ejecutando = i;
        break;
      }
    }

    timeline.push({
      tiempo: t,
      ejecutando: ejecutando,
      cola: [],
    });
  }

  return timeline;
}

// Timeline Round Robin
function generarTimelineRR(llegada, cpu, quantum) {
  let tiempo = 0;
  let timeline = [];
  let completados = 0;

  let procesos = llegada.map((l, i) => ({
    id: i,
    llegada: l,
    restante: cpu[i],
  }));

  let cola = [];

  while (completados < procesos.length) {
    procesos.forEach((p) => {
      if (p.llegada <= tiempo && p.restante > 0 && !cola.includes(p)) {
        cola.push(p);
      }
    });

    if (cola.length === 0) {
      tiempo++;
      continue;
    }

    let proceso = cola.shift();
    let ejecucion = Math.min(quantum, proceso.restante);

    for (let i = 0; i < ejecucion; i++) {
      timeline.push({
        tiempo,
        ejecutando: proceso.id,
        cola: cola.map((p) => p.id),
      });

      tiempo++;
      proceso.restante--;

      procesos.forEach((p) => {
        if (
          p.llegada === tiempo &&
          p.restante > 0 &&
          !cola.includes(p) &&
          p !== proceso
        ) {
          cola.push(p);
        }
      });
    }

    if (proceso.restante > 0) {
      cola.push(proceso);
    } else {
      completados++;
    }
  }

  return timeline;
}

//timeline MLFQ
function generarTimelineMLFQ(llegada, cpu, quantums) {
  let tiempoActual = 0;
  let timeline = [];
  let completados = 0;

  // Crear procesos
  let procesos = llegada.map((l, i) => ({
    id: i,
    llegada: l,
    restante: cpu[i],
    nivel: 0,
    terminado: false,
    enCola: false,
  }));

  // Crear colas dinamicas segun cantidad de quantums
  let colas = quantums.map(() => []);

  while (completados < procesos.length) {
    // Agregar procesos que ya llegaron a la cola 0
    procesos.forEach((p) => {
      if (p.llegada <= tiempoActual && !p.terminado && !p.enCola) {
        colas[0].push(p);
        p.enCola = true;
        p.nivel = 0;
      }
    });

    // Buscar la cola de mayor prioridad no vacia
    let nivelActual = colas.findIndex((cola) => cola.length > 0);

    // Si todas estan vacias, el CPU esta idle
    if (nivelActual === -1) {
      timeline.push({
        tiempo: tiempoActual,
        ejecutando: null,
        cola: colas.map((nivel) => nivel.map((p) => p.id)),
      });
      tiempoActual++;
      continue;
    }

    // Sacar proceso de la cola correspondiente
    let proceso = colas[nivelActual].shift();
    proceso.enCola = false;

    let quantumActual = quantums[nivelActual];
    let tiempoEjecucion = Math.min(quantumActual, proceso.restante);

    // Ejecutar unidad por unidad
    for (let i = 0; i < tiempoEjecucion; i++) {
      timeline.push({
        tiempo: tiempoActual,
        ejecutando: proceso.id,
        cola: colas.map((nivel) => nivel.map((p) => p.id)),
      });

      tiempoActual++;
      proceso.restante--;

      // Revisar nuevas llegadas en cada unidad de tiempo
      procesos.forEach((p) => {
        if (
          p.llegada === tiempoActual &&
          !p.terminado &&
          !p.enCola &&
          p.restante > 0
        ) {
          colas[0].push(p);
          p.enCola = true;
          p.nivel = 0;
        }
      });

      if (proceso.restante === 0) break;
    }

    // Si termino
    if (proceso.restante === 0) {
      proceso.terminado = true;
      completados++;
    } else {
      // Si no termino, baja de nivel
      proceso.nivel =
        nivelActual < colas.length - 1 ? nivelActual + 1 : nivelActual;

      colas[proceso.nivel].push(proceso);
      proceso.enCola = true;
    }
  }

  return timeline;
}

// Controles de simulacion
function iniciarSimulacion() {
  if (!timelineGlobal.length) return;

  intervaloSimulacion = setInterval(() => {
    if (pasoActual >= timelineGlobal.length) {
      clearInterval(intervaloSimulacion);
      return;
    }

    renderPaso(timelineGlobal[pasoActual]);
    pasoActual++;
  }, 500);
}

function pausarSimulacion() {
  clearInterval(intervaloSimulacion);
}

function reiniciarSimulacion() {
  clearInterval(intervaloSimulacion);
  pasoActual = 0;

  document.getElementById("ganttLive").innerHTML = "";
  document.getElementById("colaBox").innerHTML = "";
  document.getElementById("cpuBox").innerText = "-";
}

// Render visual moderno
function renderPaso(paso) {
  let cpuBox = document.getElementById("cpuBox");

  if (paso.ejecutando === null) {
    cpuBox.innerText = "Idle"; // mostrar "Idle" cuando no hay proceso ejecutandose
  } else {
    cpuBox.innerText = "P" + (paso.ejecutando + 1); // mostrar el proceso actual (sumamos 1 para que sea P1, P2, etc. en lugar de P0, P1)
  }

  // Cola
  let colaBox = document.getElementById("colaBox");
  colaBox.innerHTML = "";

  paso.cola.forEach((id) => {
    let box = document.createElement("div");
    box.className = "bg-gray-700 px-3 py-1 rounded-lg shadow animate-pulse";
    box.innerText = "P" + (id + 1);
    colaBox.appendChild(box);
  });

  // Gantt
  let gantt = document.getElementById("ganttLive");

  let bloque = document.createElement("div");
  bloque.className =
    "w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-xs font-bold transform transition-all duration-300 hover:scale-110";

  bloque.innerText =
    paso.ejecutando === null ? "-" : "P" + (paso.ejecutando + 1);

  gantt.appendChild(bloque);
  gantt.scrollLeft = gantt.scrollWidth;
}

function volverInicio() {
  // Detener simulacion si esta corriendo
  clearInterval(intervaloSimulacion);

  // Resetear variables
  pasoActual = 0;
  timelineGlobal = [];

  // Limpiar visuales
  document.getElementById("ganttLive").innerHTML = "";
  document.getElementById("colaBox").innerHTML = "";
  document.getElementById("cpuBox").innerText = "-";
  document.getElementById("salida").innerHTML = "";
  document.getElementById("inputs").innerHTML = "";
  document.getElementById("numProcesos").value = "";

  // Ocultar pantallas
  document.getElementById("resultados").classList.add("oculto");
  document.getElementById("pantallaFormulario").classList.add("oculto");

  // Mostrar inicio
  document.getElementById("pantallaInicio").classList.remove("oculto");
}

//falta hacer validacion de cuando no tenga un numero de procesos muestre una alerta e inpidiendo seguir hasta tener un valor en ese y en los input de los procesos, hacerlo con sileo de react para las notificaciones que van a ser las alertas de los errores de validacion
