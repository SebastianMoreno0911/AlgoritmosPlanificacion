function fifo(llegada, cpu) {
  //para crear este algoritmo: creo que es para 32 bits, pero el algoritmo se trata de que es como una cola, tiene tiempo de llagada y tiempo de cpu, llega el primer proceso y se ejecuta el tiempo de cpu, mientras termina este primer proceso, los demas se colocan en cola a la espera de que termine el primer proceso y ahi contiua el 2 proceso y asi hasta que se completen los tiempos de cpu de todos los procesos.

  // para el crear arreglo de objetos proceso
  let procesos = [];

  for (let i = 0; i < llegada.length; i++) {
    procesos.push({
      id: i,
      llegada: llegada[i],
      cpu: cpu[i],
    });
  }

  // Ordenarlo por tiempo de llegada
  procesos.sort((a, b) => a.llegada - b.llegada);

  let inicio = [];
  let finalizacion = [];
  let espera = [];
  let retorno = []; //tiempo total que tarda el proceso desde que llega hasta que termina

  let tiempo_actual = 0;

  // Calcular en orden fifo real
  for (let i = 0; i < procesos.length; i++) {
    if (tiempo_actual < procesos[i].llegada) {
      tiempo_actual = procesos[i].llegada;
    }

    let start = tiempo_actual;
    let end = start + procesos[i].cpu;

    inicio[procesos[i].id] = start;
    finalizacion[procesos[i].id] = end;
    espera[procesos[i].id] = start - procesos[i].llegada;
    retorno[procesos[i].id] = end - procesos[i].llegada;

    tiempo_actual = end;
  }

  let tiempoTotal = Math.max(...finalizacion);

  return {
    inicio,
    finalizacion,
    espera,
    retorno,
    tiempoTotal,
  };
}

function sjf(llegada, cpu) {
  //para crear este algoritmo: es como el fifo pero se ordena por tiempo de cpu, el proceso con menor tiempo de cpu se ejecuta primero, si hay dos procesos con el mismo tiempo de cpu, se ordena por tiempo de llegada, si hay dos procesos con el mismo tiempo de cpu y el mismo tiempo de llegada, se ordena por id o llegada, pero esto no se da en la vida real, es solo para el algoritmo.

  let procesos = [];

  for (let i = 0; i < llegada.length; i++) {
    procesos.push({
      id: i,
      llegada: llegada[i],
      cpu: cpu[i],
      terminado: false,
    });
  }

  let inicio = [];
  let finalizacion = [];
  let espera = [];
  let retorno = [];

  let tiempo_actual = 0;
  let completados = 0;
  let n = procesos.length;

  while (completados < n) {
    let disponibles = procesos.filter(
      (p) => p.llegada <= tiempo_actual && !p.terminado,
    );

    if (disponibles.length === 0) {
      tiempo_actual++;
      continue;
    }

    // Ordenar por tiempo de CPU
    disponibles.sort((a, b) => a.cpu - b.cpu);

    let proceso = disponibles[0];

    let start = tiempo_actual;
    let end = start + proceso.cpu;

    inicio[proceso.id] = start;
    finalizacion[proceso.id] = end;
    espera[proceso.id] = start - proceso.llegada;
    retorno[proceso.id] = end - proceso.llegada;

    tiempo_actual = end;
    proceso.terminado = true;
    completados++;
  }

  let tiempoTotal = Math.max(...finalizacion);

  return {
    inicio,
    finalizacion,
    espera,
    retorno,
    tiempoTotal,
  };
}

function roundRobin(llegada, cpu, quantum) {
  //para crear este algoritmo: es como el fifo pero se ejecuta por quantum (quantum es la cantidad de pasos de ejecucion por proceso), el proceso se ejecuta por quantum, si el proceso no termina en ese quantum, se coloca al final de la cola, si el proceso termina en ese quantum, se elimina de la cola, y asi hasta que se completen todos los procesos, si el quantum es de 1, solo se ejecuta una vez o un paso y sigue el que llego despues, y ese que llego de segundo tambien se ejecuta 1 sola vez por que el quantum es de 1 y asi sucesivamente.
  //variables que creoq eu son colas de listos, procesos, tiempo de inicio o de creacion, tiempo de cpu,
  // me toca agragar otro grafico para este algoritmo por que tengo que mostrar aparte del resultado del tiempo de inicio, finalizacion, espera y retorno, tambien tengo que mostrar el orden de ejecucion de los procesos, por que en este algoritmo no se ejecutan en orden de llegada ni en orden de cpu, se ejecutan por quantum, entonces tengo que mostrar el orden de ejecucion de los procesos para que se entienda mejor el algoritmo,
  // la otra vista se debe de llamar cola de listas, ya tengo donde se colocan los datos que para este tambien tengo que cambiarlo

  let procesos = [];

  for (let i = 0; i < llegada.length; i++) {
    procesos.push({
      // aqui se crea el proceso con su id, tiempo de llegada, tiempo de cpu, tiempo restante y si esta terminado o no
      id: i,
      llegada: llegada[i],
      cpu: cpu[i],
      restante: cpu[i],
      inicio: null,
      finalizacion: null,
      terminado: false,
      enCola: false,
    });
  }

  let cola = [];
  let tiempoActual = 0;
  let completados = 0;

  while (completados < procesos.length) {
    //agregar los que ya llegaron
    for (let i = 0; i < procesos.length; i++) {
      if (
        procesos[i].llegada <= tiempoActual &&
        !procesos[i].terminado &&
        !procesos[i].enCola
      ) {
        cola.push(procesos[i]);
        procesos[i].enCola = true;
      }
    }

    if (cola.length === 0) {
      tiempoActual++;
      continue;
    }

    let proceso = cola.shift();
    proceso.enCola = false;

    if (proceso.inicio === null) {
      proceso.inicio = tiempoActual;
    }

    let tiempoEjecucion = Math.min(quantum, proceso.restante);

    for (let q = 0; q < tiempoEjecucion; q++) {
      proceso.restante--;
      tiempoActual++;

      // revisar nuevas llegadas en cada unidad
      for (let i = 0; i < procesos.length; i++) {
        if (
          procesos[i].llegada <= tiempoActual &&
          !procesos[i].terminado &&
          !procesos[i].enCola &&
          procesos[i] !== proceso
        ) {
          cola.push(procesos[i]);
          procesos[i].enCola = true;
        }
      }
    }

    if (proceso.restante === 0) {
      proceso.terminado = true;
      proceso.finalizacion = tiempoActual;
      completados++;
    } else {
      cola.push(proceso);
      proceso.enCola = true;
    }
  }

  let inicio = [];
  let finalizacion = [];
  let espera = [];
  let retorno = [];

  for (let proceso of procesos) {
    inicio[proceso.id] = proceso.inicio;
    finalizacion[proceso.id] = proceso.finalizacion;
    retorno[proceso.id] = proceso.finalizacion - proceso.llegada;
    espera[proceso.id] = retorno[proceso.id] - proceso.cpu;
  }

  let tiempoTotal = Math.max(...finalizacion);

  console.log("Procesos:", procesos);
  return {
    inicio,
    finalizacion,
    espera,
    retorno,
    tiempoTotal,
  };
}

function prioridad(llegada, cpu, prioridad) {
  // no expropiativo -> cuando el proceso empieza y termina por completo (este es el que estoy haciendo)
  // expropiativo -> si llega un proceso con mayor prioridad mientras otro corre lo interrumpe
  //para crear este algoritmo: es como el fifo pero se ordena por prioridad, el proceso con mayor prioridad se ejecuta primero, si hay dos procesos con la misma prioridad, se ordena por tiempo de llegada, si hay dos procesos con la misma prioridad y el mismo tiempo de llegada, se ordena por id o llegada, pero esto no se da en la vida real, es solo para el algoritmo.

  let procesos = [];

  for (let i = 0; i < llegada.length; i++) {
    procesos.push({
      id: i,
      llegada: llegada[i],
      cpu: cpu[i],
      prioridad: prioridad[i],
      terminado: false,
      inicio: null,
      finalizacion: null,
    });
  }

  let tiempoActual = 0;
  let completados = 0;
  let n = procesos.length;

  while (completados < n) {
    let disponibles = [];
    for (let proceso of procesos) {
      //busqueda disponibles
      if (proceso.llegada <= tiempoActual && !proceso.terminado) {
        disponibles.push(proceso);
      }
    }

    if (disponibles.length === 0) {
      tiempoActual++;
      continue;
    }

    //debemos ordenar por prioridad y comparo si la prioridad es igual, entonces ordeno por tiempo de llegada, y si la prioridad y el tiempo de llegada son iguales, ordeno por id
    disponibles.sort((a, b) => {
      if (a.prioridad !== b.prioridad) {
        return a.prioridad - b.prioridad;
      }
      if (a.llegada !== b.llegada) {
        return a.llegada - b.llegada;
      }
      return a.id - b.id;
    }); //aqui se ordena por prioridad, luego por tiempo de llegada y luego por id

    let procesoActual = disponibles[0];
    //ejecucion no expropiativa, el proceso se ejecuta por completo
    procesoActual.inicio = tiempoActual;
    procesoActual.finalizacion = tiempoActual + procesoActual.cpu;
    tiempoActual = procesoActual.finalizacion;
    procesoActual.terminado = true;
    completados++;
  }

  //recorrer y calcular retorno y espera (metricas)
  for (let proceso of procesos) {
    proceso.retorno = proceso.finalizacion - proceso.llegada; // tiempo total que tarda el proceso desde que llega hasta que termina
    proceso.espera = proceso.retorno - proceso.cpu; // tiempo total que tarda el proceso desde que llega hasta que termina menos el tiempo de cpu, es decir, el tiempo que el proceso estuvo esperando a ser ejecutado
    proceso.respuesta = proceso.inicio - proceso.llegada; // tiempo desde que llega el proceso hasta que empieza a ejecutarse por primera vez
  }

  let inicio = [];
  let finalizacion = [];
  let espera = [];
  let retorno = [];

  //retono el resultado en el mismo formato que los otros algoritmos para que sea mas facil de mostrar en la interfaz
  for (let proceso of procesos) {
    inicio[proceso.id] = proceso.inicio;
    finalizacion[proceso.id] = proceso.finalizacion;
    retorno[proceso.id] = proceso.retorno;
    espera[proceso.id] = proceso.espera;
  }

  let tiempoTotal = Math.max(...finalizacion);
  return {
    inicio,
    finalizacion,
    espera,
    retorno,
    tiempoTotal,
  };
}

function mlfq(llegada, cpu, quantum) {
  //para crear este algoritmo: es como el round robin pero con varias colas, cada cola tiene una prioridad diferente, el proceso se ejecuta en la cola de mayor prioridad, si el proceso no termina en ese quantum, se coloca al final de la cola de menor prioridad (como si fuera de menos prioridad), si el proceso termina en ese quantum, se elimina de la cola, y asi hasta que se completen todos los procesos.

  //processos
  let procesos = [];
  for (let i = 0; i < llegada.length; i++) {
    procesos.push({
      //creacion de procesos
      id: i,
      llegada: llegada[i],
      cpu: cpu[i],
      restante: cpu[i],
      inicio: null,
      finalizacion: null,
      terminado: false,
      enCola: false,
      nivel: 0, //nivel de prioridad, 0 es el nivel mas alto
    });
  }

  //colas dinamicas
  let colas = [];

  for (let i = 0; i < quantum.length; i++) {
    //se va iterando en la cantidad de cuantums
    colas.push([]);
  }

  let tiempoActual = 0;
  let completados = 0;

  //como en rr pero aqui siempre entra en cola 0
  while (completados < procesos.length) {
    for (let proceso of procesos) {
      if (
        proceso.llegada <= tiempoActual &&
        !proceso.terminado &&
        !proceso.enCola
      ) {
        colas[0].push(proceso);
        proceso.enCola = true;
      }
    }

    //cola mas alta no vacia
    let nivelActual = -1;

    for (let i = 0; i < colas.length; i++) {
      if (colas[i].length > 0) {
        nivelActual = i;
        break;
      }
    }

    if (nivelActual === -1) {
      tiempoActual++;
      continue;
    }

    // ejecutarlo
    let proceso = colas[nivelActual].shift();
    proceso.enCola = false;
    //si es la primera vez que se ejecuta el proceso, se guarda el tiempo de inicio
    if (proceso.inicio === null) {
      proceso.inicio = tiempoActual;
    }

    //cuanto ejecutar el proceso, se ejecuta por el quantum del nivel actual o por el tiempo restante del proceso, lo que sea menor
    let quantumActual = quantum[nivelActual];

    let tiempoEjecucion = Math.min(quantumActual, proceso.restante);

    tiempoActual += tiempoEjecucion;
    proceso.restante -= tiempoEjecucion;

    //ver si termino el proceso
    if (proceso.restante === 0) {
      proceso.terminado = true;
      proceso.finalizacion = tiempoActual;
      completados++;
    }

    //si no termino el proceso, se baja de nivel, colas
    if (!proceso.terminado) {
      proceso.nivel =
        nivelActual < colas.length - 1 ? nivelActual + 1 : nivelActual; // si el proceso no termino, se baja de nivel, pero si ya esta en el ultimo nivel, se queda en ese nivel
      colas[proceso.nivel].push(proceso);
      proceso.enCola = true;
    }
  }

  //calcular retorno y espera
  //recorrer y calcular retorno y espera (metricas)
  for (let proceso of procesos) {
    proceso.retorno = proceso.finalizacion - proceso.llegada; // tiempo total que tarda el proceso desde que llega hasta que termina
    proceso.espera = proceso.retorno - proceso.cpu; // tiempo total que tarda el proceso desde que llega hasta que termina menos el tiempo de cpu, es decir, el tiempo que el proceso estuvo esperando a ser ejecutado
    proceso.respuesta = proceso.inicio - proceso.llegada; // tiempo desde que llega el proceso hasta que empieza a ejecutarse por primera vez
  }

  let inicio = [];
  let finalizacion = [];
  let espera = [];
  let retorno = [];

  //retono el resultado en el mismo formato que los otros algoritmos para que sea mas facil de mostrar en la interfaz
  for (let proceso of procesos) {
    inicio[proceso.id] = proceso.inicio;
    finalizacion[proceso.id] = proceso.finalizacion;
    retorno[proceso.id] = proceso.retorno;
    espera[proceso.id] = proceso.espera;
  }

  let tiempoTotal = Math.max(...finalizacion);
  return {
    inicio,
    finalizacion,
    espera,
    retorno,
    tiempoTotal,
  };
}
