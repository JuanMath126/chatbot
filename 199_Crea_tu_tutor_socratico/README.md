# Chatbot PDF Interactivo — Tutor Socrático con IA

Aplicación web que convierte **cualquier PDF** en un **tutor educativo socrático** capaz de guiar al estudiante para que descubra la respuesta por sí mismo, en lugar de dársela de inmediato.

---

## ¿Qué hace?

- Carga uno o dos documentos PDF como base de conocimiento.
- Actúa como **tutor socrático** (matemáticas, ciencias y cualquier tema del documento).
- Explica, divide el razonamiento en pasos y hace preguntas guiadas.
- Respeta reglas estrictas: **máximo 5 interacciones pedagógicas**, rigor en la verificación de respuestas y cierre con la respuesta final.
- Permite **descargar un chatbot autónomo** (un único archivo HTML) que funciona por sí solo, con el mismo comportamiento del tutor.

---

## Requisitos

- Un navegador moderno (Chrome, Edge, Firefox, Safari).
- Conexión a internet (la IA se consulta vía `https://node.proyectodescartes.org/api/ia`; **la clave de API vive en ese servidor**, no necesitas configurar nada localmente).
- Uno o dos archivos **PDF** con el contenido que quieras usar como base.

---

## Cómo usar la aplicación principal (`index.html`)

1. **Abrir** `index.html` en el navegador.
2. **Cargar el documento (obligatorio):**
   - Pulsa **“Seleccionar PDF”** y elige tu archivo.
   - Opcional: añade un **segundo PDF** con “+ Segundo PDF (opcional)”.
   - El estado cambiará a “`<nombre>.pdf` está listo” cuando termine de procesarse.
3. **Personalizar avatares (opcional):**
   - Sube una imagen para el **avatar del Bot** y/o del **Usuario**.
4. **Elegir el modelo** en el selector (“openai”, “mistral”, “gemini-fast”, etc.).
5. **Chatear:**
   - Escribe tu pregunta o pide al tutor que te ayude con un tema del documento.
   - El tutor responderá con preguntas guiadas, no con la solución directa.
6. **Controles de la barra de herramientas:**
   - 🔄 **Nuevo Chat**: borra la conversación y empieza de cero (reinicia también el contador de interacciones).
   - 👁 **Ver PDF**: muestra/oculta el visor del documento cargado.
   - 📥 **HTML** / 📥 **PDF**: descargan la conversación actual.
   - 🤖 **Descargar Chatbot**: genera un chatbot autónomo (ver abajo).
   - 🌓 **Tema**: alterna claro/oscuro.

---

## El tutor socrático (reglas que se aplican)

Estas reglas están escritas en el *system prompt* del tutor y **también se refuerzan en el código** para mayor control:

- **Objetivo:** que el estudiante comprenda y formule la respuesta correcta por sí mismo.
- **Máximo 5 interacciones pedagógicas** para resolver una consulta. Una interacción = una pregunta del tutor + una respuesta del estudiante.
  - Si el estudiante acierta antes, el tutor termina de inmediato.
  - Si llega a la 5.ª sin acertar, el tutor entrega la respuesta final explicada.
  - *Control en código:* al contar 5 turnos del estudiante, la app obliga al modelo a dar la respuesta final sin hacer más preguntas.
- **Rigor:** en matemáticas el tutor verifica cálculos y fórmulas antes de validar; **no felicita respuestas incorrectas**.
- **Sin bucles:** está prohibido preguntar “una verificación más”, “para confirmar” o “pregunta final” una vez alcanzada la respuesta o el límite.
- **Cierre:** el método socrático es un medio, no el fin; si el estudiante ya tiene los elementos, el tutor sintetiza y finaliza.

> Si el tutor se alarga demasiado, usa **Nuevo Chat** para reiniciar la conversación manualmente en cualquier momento.

---

## Descargar tu propio chatbot (`Descargar Chatbot`)

El botón **🤖 Descargar Chatbot** genera un archivo HTML independiente (por ejemplo `Chatbot_<tu_pdf>.html`) que **contiene el documento, el tema, los avatares y el tutor socrático embebidos**.

Para usarlo:
1. Abre el archivo HTML descargado en cualquier navegador.
2. Chatea normalmente; el comportamiento es idéntico al de la app principal.
3. Controles disponibles en el chatbot descargado:
   - 🔄 **Nuevo chat**: reinicia la conversación manualmente.
   - 📥 **Descargar HTML** / 📥 **Descargar Word**: guardan la sesión.
   - 🌓 **Tema**: claro/oscuro.
   - **Preguntas sugeridas**: desplegable con preguntas iniciales propuestas.
4. El límite de 5 interacciones y el rigor del tutor también se aplican en este chatbot.

> El chatbot descargado necesita conexión a internet para consultar la IA (mismo servidor backend).

---

## Solución de problemas

- **“Por favor, carga un PDF primero”**: selecciona un PDF antes de enviar mensajes.
- **El tutor no responde**: revisa tu conexión; el error se muestra en el chat.
- **Respuestas fuera de tema**: el tutor solo responde sobre el contenido del/los PDF o el tema del chatbot; si preguntas algo ajeno, responderá `[FUERA_DE_ALCANCE]`.
- **El tutor se repite o no cierra**: usa **Nuevo Chat**; además, el límite de 5 interacciones se fuerza automáticamente.

---

## Créditos

Diseñado por Juan Guillermo Rivera Berrío con tecnología Gemini y la IA agéntica Antigravity.
