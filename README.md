# 🖥️ Algoritmos de Planificación — Simulador Web

![Status](https://img.shields.io/badge/Status-Production-success)
![Frontend](https://img.shields.io/badge/Frontend-JavaScript-yellow)
![Style](https://img.shields.io/badge/Style-TailwindCSS-38B2AC)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)
![License](https://img.shields.io/badge/License-Academic-blue)

Simulador interactivo de algoritmos clásicos de planificación de CPU implementado completamente en frontend usando JavaScript Vanilla y Tailwind CSS.

🔗 Repositorio:
https://github.com/SebastianMoreno0911/AlgoritmosPlanificacion

🌐 Demo en producción (Render):
https://planificacion-app-rcl8.onrender.com

---

## 📚 Algoritmos implementados

- FIFO (First In, First Out)
- SJF (Shortest Job First)
- Round Robin
- Priority Scheduling
- MLFQ (Multi-Level Feedback Queue)

El sistema permite:

- Ingresar procesos dinámicamente
- Definir tiempos de llegada y CPU
- Configurar quantums (MLFQ / RR)
- Visualizar el orden de ejecución
- Analizar resultados en tiempo real

Todo se ejecuta directamente en el navegador, sin backend.

---

# 🏗️ Arquitectura del Proyecto

AlgoritmosPlanificacion/
├── FIFO/
│   ├── css/
│   │   └── styles.css
│   ├── JS/
│   │   ├── algoritmos.js
│   │   ├── ui.js
│   │   └── ...
│   └── index.html
├── Dockerfile
├── README.md
└── .gitignore

Diseño:
- Separación entre lógica de algoritmos y manejo de interfaz.
- Simulación orientada a eventos.
- Interfaz responsiva con Tailwind CSS.
- Proyecto 100% estático (sin servidor backend).

---

# ⚙️ Requisitos

No requiere instalación de Node ni base de datos.

Solo necesitas:
- Navegador moderno (Chrome, Edge, Firefox, Safari)
- Opcional: Docker Desktop

---

# 🚀 Ejecución del Proyecto

## ✅ Opción 1 — Ejecutar Localmente

1. Clona el repositorio:

git clone https://github.com/SebastianMoreno0911/AlgoritmosPlanificacion.git

2. Abre el archivo:

AlgoritmosPlanificacion/FIFO/index.html

Listo. La aplicación se ejecuta directamente en el navegador.

---

## 🐳 Opción 2 — Ejecutar con Docker (Recomendado para evaluación)

Dockerfile utilizado:

FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80

Construcción y ejecución:

docker build -t algoritmos-planificacion .
docker run -p 8080:80 algoritmos-planificacion

Luego abrir en el navegador:

http://localhost:8080

---

## 🌐 Opción 3 — Ver en la Nube (Sin instalar nada)

Aplicación desplegada en Render:

https://planificacion-app-rcl8.onrender.com

---

# 📘 ¿Cómo usar la aplicación?

1. Seleccionar algoritmo.
2. Ingresar número de procesos.
3. Definir:
   - Tiempo de llegada
   - Tiempo de CPU
   - Quantum (si aplica).
4. Presionar "Simular".
5. Analizar el orden de ejecución mostrado.

---

# 🧠 Fundamento Académico

Este proyecto simula el comportamiento de un planificador de CPU dentro de un sistema operativo.

Conceptos aplicados:
- Colas de planificación
- Tiempo de llegada
- Burst de CPU
- Preempción
- Gestión multinivel (MLFQ)
- Comparación de rendimiento entre algoritmos

El objetivo es visualizar y comparar el comportamiento de distintos algoritmos bajo las mismas condiciones de entrada.

---

# 🧪 Tecnologías Utilizadas

- HTML5
- JavaScript (Vanilla)
- Tailwind CSS
- Docker
- Nginx (servidor web estático)

---

# 🎓 Autor

Sebastián Moreno  
Estudiante de Ingeniería en Sistemas  

Proyecto académico — Simulación de Algoritmos de Planificación de CPU.

---

# 📝 Notas para el Docente

- Proyecto completamente frontend.
- No requiere backend.
- No requiere base de datos.
- Puede ejecutarse:
  - Directamente desde navegador
  - Mediante Docker
  - Desde despliegue en la nube
- Diseñado para facilitar pruebas y evaluación inmediata.
