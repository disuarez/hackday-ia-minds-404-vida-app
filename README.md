# Seguros Vida Segura

Aplicación web para la venta y recomendación de pólizas de vida, con asistente inteligente por voz.

## Descripción

Este proyecto permite a los usuarios explorar diferentes pólizas de seguro de vida, agregar opciones a un carrito, simular el proceso de compra y recibir asistencia personalizada mediante un asistente IA integrado que responde por voz.

## Características principales

- **Visualización de pólizas**: Muestra tarjetas con detalles y beneficios de cada póliza.
- **Carrito de compras**: Permite agregar, quitar y comprar pólizas.
- **Simulación de pago**: Modal interactivo para finalizar la compra.
- **Asistente IA por voz avanzado**:
  - Recomienda pólizas, responde preguntas y guía al usuario usando reconocimiento y síntesis de voz.
  - Detecta el contexto de la póliza activa (la que el usuario está viendo) para respuestas más precisas.
  - Permite llenar el formulario de compra por voz, extrayendo nombre, fecha de nacimiento y correo electrónico directamente de la conversación.
  - Genera un resumen personalizado y cálido tras la compra, usando IA.
  - Mejora la interacción con historial de conversación y acciones inteligentes (agregar/quitar/cambiar pólizas, navegación, etc).
- **Interfaz moderna**: Utiliza TailwindCSS y diseño responsivo.

## Uso y despliegue local

1. Clona el repositorio.
2. Instala el CLI de Vercel si no lo tienes:  
    ```bash
    npm i -g vercel
    ```
3. Ejecuta el proyecto en modo desarrollo:  
    ```bash
    vercel dev
    ```
4. Abre la URL local que muestra Vercel en tu navegador.
5. Explora las pólizas de vida y auto disponibles.
6. Usa el asistente de voz (botón de micrófono) para recibir recomendaciones, información y ayuda personalizada.
7. Agrega pólizas al carrito y simula el proceso de compra desde la interfaz.

El código JavaScript principal está en `public/js/main.js` para facilitar el mantenimiento y la organización.

## Requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Acceso a internet para cargar TailwindCSS y fuentes Google

## Estructura

```
public/
  index.html        # Página principal con la UI del frontend
  js/
    main.js         # Lógica principal del frontend (JavaScript separado)
  css/
    styles.css      # Estilos personalizados
api/
  gemini.js         # Función serverless para conectar con la API de Gemini
.gitignore          # Excluye archivos innecesarios del repositorio
README.md           # Documentación del proyecto
```

## Créditos

- Hackday IA Minds - Equipo "Los 404"
