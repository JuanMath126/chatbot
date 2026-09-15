document.addEventListener('DOMContentLoaded', () => {
    const pdfUploadInput = document.getElementById('pdf-upload');
    const pdfNameDisplay = document.getElementById('pdf-name');
    const pdfStatusDisplay = document.getElementById('pdf-status');
    const questionInput = document.getElementById('question-input');
    const sendButton = document.getElementById('send-button');
    const sendButtonText = document.getElementById('send-button-text');
    const chatDisplay = document.getElementById('chat-display');
    const loadingSpinner = document.getElementById('loading-spinner');
    const newChatButton = document.getElementById('new-chat-button');
    const togglePdfViewerButton = document.getElementById('toggle-pdf-viewer-button');
    const toggleThemeButton = document.getElementById('toggle-theme-button');
    const pdfViewerContainer = document.getElementById('pdf-viewer-container');
    const pdfIframe = document.getElementById('pdf-iframe');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const downloadHtmlBtn = document.getElementById('download-html-btn');
    const downloadChatbotBtn = document.getElementById('download-chatbot-btn');
    const modelSelector = document.getElementById('model-selector');
    const pdf2UploadInput = document.getElementById('pdf2-upload');
    const pdf2NameDisplay = document.getElementById('pdf2-name');
    const pdf2StatusDisplay = document.getElementById('pdf2-status');
    const pdf2Section = document.getElementById('pdf2-section');
    const botAvatarUpload = document.getElementById('bot-avatar-upload');
    const userAvatarUpload = document.getElementById('user-avatar-upload');
    const botAvatarImg = document.getElementById('bot-avatar-img');
    const userAvatarImg = document.getElementById('user-avatar-img');
    const botAvatarName = document.getElementById('bot-avatar-name');
    const userAvatarName = document.getElementById('user-avatar-name');
    const botAvatarPreview = document.getElementById('bot-avatar-preview');
    const userAvatarPreview = document.getElementById('user-avatar-preview');

    let pdfTextContent = "";
    let currentPdfName = "";
    let currentPdfTitle = "";
    let currentPdfFileUrl = null;
    let isProcessing = false;
    let pdfViewerVisible = false;
    let pdf2TextContent = "";
    let currentPdf2Name = "";
    let chatHistory = [];

    // ----- Avatares (se convierten a base64 al descargar el chatbot) -----
    let botAvatarBase64 = "";
    let userAvatarBase64 = "";

    // ----- Backend (la API key vive solo en el servidor) -----
    const API_BASE = 'https://node.proyectodescartes.org/api/ia';
    const TEXT_MODELS = ["openai", "mistral", "gemini-fast", "openai-fast", "gemini-search", "nova-fast", "perplexity-fast", "deepseek"];

    // ----- Tutor System Prompt -----
    const SYS_TUTOR = `Eres un tutor educativo especializado en matemáticas y ciencias. Tu misión principal no es resolver los problemas por el estudiante, sino ayudarle a desarrollar su razonamiento, comprensión y capacidad de resolverlos por sí mismo.

Debes utilizar prioritariamente la información contenida en los documentos PDF proporcionados como base de conocimiento. Si la información necesaria no aparece en dichos documentos, indícalo claramente antes de recurrir a conocimientos generales.

## Principios pedagógicos

1. Nunca proporciones inmediatamente la respuesta completa de un ejercicio, problema o examen cuando el estudiante simplemente la solicite.

2. En su lugar:
- Analiza el problema.
- Divide el razonamiento en pasos pequeños.
- Formula preguntas que permitan al estudiante descubrir cada paso.
- Proporciona pistas progresivas.
- Solicita que el estudiante responda antes de continuar.

3. Utiliza el método socrático:
- ¿Qué datos conoces?
- ¿Qué te pide el problema?
- ¿Qué concepto del PDF podría aplicarse?
- ¿Qué fórmula sería adecuada?
- ¿Qué sucede si...?
- ¿Por qué elegiste ese procedimiento?

4. Solo entrega la solución completa cuando ocurra alguna de estas situaciones:
- El estudiante lo ha intentado varias veces.
- El estudiante solicita explícitamente una explicación completa.
- El objetivo de la conversación sea revisar o verificar una solución.

Incluso en esos casos, explica detalladamente cada paso y el razonamiento involucrado.

## Nivel de ayuda

Ajusta la cantidad de ayuda según el progreso del estudiante:

Nivel 1: Solo una pequeña pista.
Nivel 2: Orientación sobre el procedimiento.
Nivel 3: Resolver parcialmente el ejercicio.
Nivel 4: Resolver completamente explicando cada paso.

Nunca saltes directamente al Nivel 4.

## Durante la resolución

No des únicamente resultados. Explica:
- por qué se hace cada paso;
- qué concepto se está utilizando;
- errores frecuentes;
- cómo verificar el resultado.

## Si el estudiante comete errores

No digas simplemente "está mal". Haz preguntas como:
- ¿Revisaste el signo?
- ¿Qué propiedad aplicaste?
- ¿La unidad es correcta?
- ¿Puedes comprobar el resultado sustituyendo el valor?

## Si el estudiante está aprendiendo un concepto

Antes de resolver ejercicios:
- explica la idea intuitiva;
- usa ejemplos sencillos;
- conecta el concepto con situaciones reales;
- verifica la comprensión mediante preguntas.

## Si el estudiante solo quiere practicar

Genera ejercicios similares usando el contenido del PDF.
Aumenta gradualmente la dificultad.
No repitas exactamente los ejemplos del documento.

## Si el usuario pide únicamente la respuesta

Responde con una orientación, por ejemplo: "Prefiero ayudarte a descubrir la respuesta paso a paso para fortalecer tu aprendizaje. Comencemos identificando los datos del problema."

## Si el usuario insiste varias veces

Después de haber guiado suficientemente el proceso, puedes mostrar la solución completa, explicando cuidadosamente cada paso.

## Estilo

Sé amable, paciente y motivador. Evita respuestas largas cuando no sean necesarias. Haz una sola pregunta importante en cada interacción para mantener el diálogo activo. No reveles todos los pasos de una vez. Espera la respuesta del estudiante antes de continuar.

    ## Objetivo final

    El éxito de la conversación no es que el estudiante obtenga la respuesta correcta, sino que comprenda el procedimiento y sea capaz de resolver problemas similares de forma autónoma.

    ## REGLAS ESTRICTAS DEL TUTOR SOCRÁTICO

    ### Objetivo final obligatorio
    Tu objetivo no es mantener indefinidamente el diálogo. Tu objetivo es que el estudiante comprenda y pueda formular la respuesta correcta por sí mismo. Toda interacción debe contribuir directamente a alcanzar ese objetivo.

    ### Máximo 5 interacciones (CONTEO ESTRICTO)
    Cuenta de forma explícita cada interacción: UNA interacción = UNA pregunta tuya + UNA respuesta del estudiante. Lleva la cuenta en tu propio razonamiento y, al acercarte al límite, prioriza cerrar. Nunca realices más de 5 interacciones pedagógicas para resolver una consulta. Si el estudiante alcanza la respuesta correcta antes de la quinta interacción, termina inmediatamente el proceso. Si se llega a la quinta interacción sin que el estudiante haya formulado correctamente la respuesta, proporciona una explicación guiada y la respuesta final, sin iniciar una nueva ronda de preguntas. El límite de 5 es INFLEXIBLE: una vez alcanzado, no hay "una pregunta más", ni "verificación final", ni "para confirmar", ni "para consolidar", ni "pregunta final". La propia aplicación cuenta los turnos del estudiante y, al llegar a 5, te obligará a entregar la respuesta final; no intentes sortear este límite abriendo nuevos ejemplos o nuevas líneas de preguntas.

    ### Progresión obligatoria
    Cada nueva pregunta debe ser más específica que la anterior. No repitas preguntas con otras palabras. No formules preguntas que exploren aspectos secundarios que no sean necesarios para resolver el problema. No preguntes simplemente "¿qué más?", "¿por qué?" o "¿qué piensas?" si esa pregunta no aporta un avance concreto. No pidas información innecesaria: antes de formular una pregunta, determina si la información solicitada es realmente necesaria para llegar a la respuesta; si puedes avanzar con la información disponible, no hagas otra pregunta.

    ### Detectar rápidamente el nivel del estudiante
    Si el estudiante demuestra que comprende un concepto, no vuelvas a evaluarlo. Si comete un error, identifica específicamente el concepto que necesita corregir y formula una pregunta dirigida a ese punto.

    ### Preguntas con propósito
    Cada pregunta debe cumplir una de estas funciones:
    - Identificar el concepto relevante.
    - Recuperar un conocimiento necesario.
    - Detectar un error conceptual.
    - Relacionar datos con el concepto.
    - Guiar hacia la conclusión.
    Si una pregunta no cumple ninguna de estas funciones, no la hagas.

    ### Escalamiento de ayuda
    Utiliza progresivamente:
    - Nivel 1: pregunta abierta y orientadora.
    - Nivel 2: pista conceptual.
    - Nivel 3: pista más específica.
    - Nivel 4: planteamiento casi resuelto para que el estudiante complete la conclusión.
    - Nivel 5: explicación breve + respuesta final.

    ### No bloquear al estudiante
    Si el estudiante dice "no sé", no vuelvas a preguntar lo mismo: proporciona una pista concreta y continúa. Si el estudiante manifiesta confusión después de dos intentos, reduce la dificultad y proporciona parte del razonamiento. En cualquier caso, NO entres en un ciclo de repetir la misma pregunta con distintas palabras; aplica el escalamiento de ayuda y, si es necesario, entrega la respuesta final según la REGLA DE CIERRE.

    ### Respuesta final obligatoria
    El tutor siempre debe llegar a una conclusión. Nunca terminar una conversación con frases como "¿Qué crees que sigue?", "¿Quieres intentarlo de nuevo?", "¿Qué opinas?" o "¿Puedes explicarlo con tus palabras?" a menos que todavía exista margen dentro de las 5 interacciones y sean necesarias para alcanzar la respuesta.

    ### Cuando la respuesta ya está clara
    "Esencialmente correcta" significa que la afirmación del estudiante es MATEMÁTICA O FÁCTICAMENTE VERDADERA, no solo plausible o bien redactada. Antes de validar, comprueba explícitamente la exactitud del contenido: en matemáticas, verifica los cálculos, las operaciones, las fórmulas y la lógica (por ejemplo, confirma que 2 × 3³ = 54, no 18). Si la respuesta es incorrecta, aunque se vea segura o esté bien escrita, NUNCA digas "¡Excelente!", "¡Perfecto!" ni la valides: señala concreta y cortésmente el error, indícale por qué está mal y aplícale el escalamiento de ayuda o la REGLA DE CIERRE según corresponda. Solo valida y felicita cuando la respuesta sea efectivamente correcta.

    ### Rigor en la verificación de respuestas
    En preguntas de matemáticas y ciencias, nunca elogies una respuesta sin haber verificado su exactitud. Evalúa de forma independiente cada afirmación numérica o procedimental del estudiante antes de responder. Si detectas un error, no lo ignores ni lo minimices; identifica el concepto o el paso equivocado y, en lugar de felicitar, formula una pregunta dirigida a corregirlo o proporciona la aclaración necesaria. La cortesía nunca debe sustituir la corrección académica.

    ### Evita el bucle de "verificación final"
    Es MUY frecuente y ERRÓNEO caer en un bucle en el que, tras el estudiante haber respondido correctamente, sigues preguntando "una verificación más", "para confirmar", "para cerrar", "para dejarlo perfectamente claro" o "solo una última cosa". PROHIBIDO. Cuando el estudiante ya ha formulado correctamente la idea central (por ejemplo, dio la fórmula correcta, identificó el concepto clave o eligió la opción correcta), NO abras nuevas líneas de preguntas sobre el mismo punto. Valida, sintetiza brevemente lo aprendido y TERMINA la interacción. Repreguntar lo ya demostrado viola la Progresión obligatoria (no repitas preguntas con otras palabras) y la REGLA DE CIERRE.

    ### REGLA DE CIERRE
    Nunca prolongues una conversación únicamente para mantener el método socrático. El método socrático es un medio, no el objetivo. Si el estudiante ya tiene los elementos suficientes para construir la respuesta, ayúdalo a sintetizarla y finaliza de inmediato; no inventes "comprobaciones extra". Como máximo, realiza 5 interacciones pedagógicas. En la quinta interacción debes proporcionar la respuesta final si el estudiante aún no la ha construido.`;

    // ----- Theme -----
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            toggleThemeButton.textContent = '☀️ Tema';
        } else {
            document.body.classList.remove('dark-mode');
            toggleThemeButton.textContent = '🌙 Tema';
        }
    }
    toggleThemeButton.addEventListener('click', () => {
        const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
    applyTheme(localStorage.getItem('theme') || 'light');

    // ----- Fetch Models (lista autorizada, la API key está en el backend) -----
    function populateModels() {
        modelSelector.innerHTML = '';
        TEXT_MODELS.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            modelSelector.appendChild(option);
        });
        modelSelector.value = TEXT_MODELS[0];
    }
    populateModels();

    // ----- Event Listeners -----
    pdfUploadInput.addEventListener('change', handlePdfUpload);
    pdf2UploadInput.addEventListener('change', handlePdf2Upload);
    sendButton.addEventListener('click', handleSendQuestion);
    questionInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (!sendButton.disabled) handleSendQuestion();
        }
    });
    newChatButton.addEventListener('click', resetChat);
    togglePdfViewerButton.addEventListener('click', togglePdfViewer);
    downloadHtmlBtn.addEventListener('click', downloadSessionHtml);
    downloadPdfBtn.addEventListener('click', downloadSessionPdf);
    downloadChatbotBtn.addEventListener('click', () => {
        downloadChatbot().catch(err => {
            console.error(err);
            addMessageToChat('No se pudo generar el chatbot descargable: ' + err.message, 'system error');
        });
    });

    // ----- Reset -----
    function resetChat() {
        pdfTextContent = ""; currentPdfName = ""; currentPdfTitle = "";
        if (currentPdfFileUrl) { URL.revokeObjectURL(currentPdfFileUrl); currentPdfFileUrl = null; }
        pdfNameDisplay.textContent = "Ningún archivo seleccionado";
        pdfStatusDisplay.textContent = "";
        pdfUploadInput.value = null;
        pdf2TextContent = ""; currentPdf2Name = "";
        pdf2NameDisplay.textContent = "Ningún archivo seleccionado";
        pdf2StatusDisplay.textContent = "";
        pdf2UploadInput.value = null;
        pdf2Section.style.display = 'none';
        chatHistory = [];
        chatDisplay.innerHTML = '<div class="system-message">Por favor, carga un PDF para comenzar.</div>';
        questionInput.value = "";
        questionInput.disabled = true;
        sendButton.disabled = true;
        downloadPdfBtn.disabled = true;
        downloadHtmlBtn.disabled = true;
        downloadChatbotBtn.disabled = true;
        togglePdfViewerButton.disabled = true;
        togglePdfViewerButton.textContent = "Ver PDF";
        if (pdfViewerContainer.classList.contains('visible')) pdfViewerContainer.classList.remove('visible');
        pdfIframe.src = 'about:blank';
        pdfViewerVisible = false;
    }

    function togglePdfViewer() {
        if (!currentPdfFileUrl) return;
        pdfViewerVisible = !pdfViewerVisible;
        if (pdfViewerVisible) {
            pdfViewerContainer.classList.add('visible');
            pdfIframe.src = currentPdfFileUrl;
            togglePdfViewerButton.textContent = "Ocultar PDF";
        } else {
            pdfViewerContainer.classList.remove('visible');
            togglePdfViewerButton.textContent = "Ver PDF";
        }
    }

    // ----- PDF 1 Upload -----
    function handlePdfUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        resetChat();
        pdfNameDisplay.textContent = file.name;
        const isValid = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        if (!isValid) {
            pdfStatusDisplay.textContent = `"${file.name}" no es un PDF válido.`;
            pdfStatusDisplay.style.color = "var(--danger-color)";
            return;
        }
        currentPdfName = file.name;
        pdfStatusDisplay.textContent = "Procesando PDF...";
        pdfStatusDisplay.style.color = "var(--warning-color)";
        addMessageToChat("Cargando " + currentPdfName + "...", "system");
        if (currentPdfFileUrl) URL.revokeObjectURL(currentPdfFileUrl);
        currentPdfFileUrl = URL.createObjectURL(file);
        togglePdfViewerButton.disabled = false;
        const reader = new FileReader();
        reader.onload = async (e) => {
            const typedarray = new Uint8Array(e.target.result);
            try {
                const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                let text = "";
                try { const meta = await pdf.getMetadata(); currentPdfTitle = meta?.info?.Title?.trim() || ""; } catch(_) { currentPdfTitle = ""; }
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const tc = await page.getTextContent();
                    tc.items.forEach(item => text += item.str + " ");
                    text += "\n";
                }
                pdfTextContent = text;
                pdfStatusDisplay.textContent = `"${currentPdfName}" cargado. ¡Listo para preguntar!`;
                pdfStatusDisplay.style.color = "var(--success-color)";
                questionInput.disabled = false;
                sendButton.disabled = false;
                addMessageToChat(`"${currentPdfName}" está listo.`, "system");
                questionInput.focus();
                downloadChatbotBtn.disabled = false;
                pdf2Section.style.display = 'block';
            } catch (error) {
                pdfStatusDisplay.textContent = "Error al procesar el PDF.";
                pdfStatusDisplay.style.color = "var(--danger-color)";
                pdfTextContent = "";
                addMessageToChat("Error procesando PDF: " + error.message, "system error");
                if (currentPdfFileUrl) { URL.revokeObjectURL(currentPdfFileUrl); currentPdfFileUrl = null; }
                togglePdfViewerButton.disabled = true;
                pdfUploadInput.value = null;
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // ----- Avatar Upload -----
    function handleAvatarUpload(event, previewImg, nameDisplay, setBase64) {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            nameDisplay.textContent = "El archivo no es una imagen.";
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            setBase64(dataUrl);
            previewImg.src = dataUrl;
            previewImg.style.display = 'block';
            previewImg.title = file.name;
            nameDisplay.textContent = file.name;
        };
        reader.readAsDataURL(file);
    }
    botAvatarUpload.addEventListener('change', (e) => handleAvatarUpload(e, botAvatarImg, botAvatarName, (d) => { botAvatarBase64 = d; }));
    userAvatarUpload.addEventListener('change', (e) => handleAvatarUpload(e, userAvatarImg, userAvatarName, (d) => { userAvatarBase64 = d; }));

    // ----- PDF 2 Upload -----
    function handlePdf2Upload(event) {
        const file = event.target.files[0];
        if (!file) return;
        const isValid = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        if (!isValid) {
            pdf2StatusDisplay.textContent = `"${file.name}" no es un PDF válido.`;
            pdf2StatusDisplay.style.color = "var(--danger-color)";
            return;
        }
        currentPdf2Name = file.name;
        pdf2NameDisplay.textContent = file.name;
        pdf2StatusDisplay.textContent = "Procesando segundo PDF...";
        pdf2StatusDisplay.style.color = "var(--warning-color)";
        const reader = new FileReader();
        reader.onload = async (e) => {
            const typedarray = new Uint8Array(e.target.result);
            try {
                const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                let text = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const tc = await page.getTextContent();
                    tc.items.forEach(item => text += item.str + " ");
                    text += "\n";
                }
                pdf2TextContent = text;
                pdf2StatusDisplay.textContent = `"${currentPdf2Name}" cargado.`;
                pdf2StatusDisplay.style.color = "var(--success-color)";
                addMessageToChat(`Segundo documento "${currentPdf2Name}" también está listo.`, "system");
            } catch (error) {
                pdf2StatusDisplay.textContent = "Error al procesar el segundo PDF.";
                pdf2StatusDisplay.style.color = "var(--danger-color)";
                pdf2TextContent = "";
                pdf2UploadInput.value = null;
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // ----- Send Question -----
    async function handleSendQuestion() {
        const question = questionInput.value.trim();
        if (!question || !pdfTextContent || isProcessing) {
            if (!pdfTextContent) addMessageToChat("Por favor, carga un PDF primero.", "system error");
            return;
        }
        addMessageToChat(question, 'user');
        questionInput.value = '';
        isProcessing = true;
        sendButton.disabled = true;
        questionInput.disabled = true;
        loadingSpinner.style.display = 'inline-block';
        sendButtonText.textContent = 'Enviando';
        addMessageToChat("Pensando...", "bot", true);

const maxLen = 800000;
        const t1 = pdfTextContent.length > maxLen ? pdfTextContent.substring(0, maxLen) + "... (truncado)" : pdfTextContent;
        let documentsPart = `Documento 1 ("${currentPdfName}"): "${t1}"\n\n`;
        if (pdf2TextContent) {
            const t2 = pdf2TextContent.length > maxLen ? pdf2TextContent.substring(0, maxLen) + "... (truncado)" : pdf2TextContent;
            documentsPart += `Documento 2 ("${currentPdf2Name}"): "${t2}"\n\n`;
        }

        const systemPrompt = 'Eres un tutor educativo para el tema «' + (currentPdfTitle || currentPdfName.replace(/\.pdf$/i, '')) + '» y SOLO debes ayudar con preguntas relacionadas con el contenido del/los documento(s) PDF incrustados en esta conversación o con ese tema. No respondas temas claramente ajenos. Si la pregunta NO tiene relación con el documento ni con ese tema, responde únicamente una línea que empiece exactamente con [FUERA_DE_ALCANCE] seguida de una frase breve en español. Para preguntas válidas, fundamenta la respuesta en los textos del documento, pero actúa siempre como tutor educativo.\n\n' +
            SYS_TUTOR +
            '\n\n(Instrucción: Para expresiones matemáticas, utiliza SÓLO el formato $$...$$ para bloque y $...$ para texto en línea.)\n\n' +
            'A continuación se incluye el/los documento(s) que sirven de base de conocimiento. Estos documentos NO forman parte del diálogo previo; son contexto que debes consultar cuando sea necesario:\n\n' +
            documentsPart;

        let conversationText = '';
        chatHistory.forEach(m => {
            if (m.role === 'user') conversationText += `Usuario: ${m.content}\n`;
            else if (m.role === 'assistant') conversationText += `Chatbot: ${m.content}\n`;
        });
        conversationText += `Usuario: ${question}`;
        chatHistory.push({ role: 'user', content: question });

        const userTurns = chatHistory.filter(m => m.role === 'user').length;
        let capInstruction = '';
        if (userTurns >= 5) {
            capInstruction = '\n\n[CONTROL DE LA APLICACIÓN] Se alcanzó el LÍMITE MÁXIMO de 5 interacciones pedagógicas. NO formules ninguna pregunta más. Entrega AHORA MISMO la respuesta final completa y razonada, sintetizando lo aprendido. Esta es tu última intervención.';
        }

        const fullPrompt = systemPrompt + '\n\n=== DIALOGO CON EL ESTUDIANTE ===\n' + conversationText +
            capInstruction +
            '\n\nInstrucción final: NO resuelvas el ejercicio directamente ni entregues la solución completa en tu primera respuesta. Aplica el método socrático descrito arriba: analiza, divide el razonamiento en pasos pequeños y haz preguntas guiadas una por una. Espera la respuesta del estudiante antes de avanzar.';

        try {
            const response = await fetch(`${API_BASE}/text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    model: modelSelector.value || TEXT_MODELS[0],
                    system: systemPrompt
                })
            });
            if (!response.ok) {
                let errorBody = "";
                try { errorBody = await response.text(); } catch (e) {}
                throw new Error(`Error de API: ${response.status} ${response.statusText}. ${errorBody.substring(0, 200)}`);
            }
            const raw = await response.text();
            let botResponse = raw.trim();
            try {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    botResponse = String(parsed.text ?? parsed.output ?? parsed.response ?? parsed.content ?? raw).trim();
                }
            } catch (_) { /* la respuesta ya es texto plano */ }
            updateLastBotMessage(botResponse);
            chatHistory.push({ role: 'assistant', content: botResponse });
        } catch (error) {
            updateLastBotMessage(`Lo siento, ocurrió un error: ${error.message}. Intenta de nuevo.`);
        } finally {
            isProcessing = false;
            sendButton.disabled = false;
            questionInput.disabled = false;
            loadingSpinner.style.display = 'none';
            sendButtonText.textContent = 'Enviar';
            questionInput.focus();
            downloadPdfBtn.disabled = false;
            downloadHtmlBtn.disabled = false;
        }
    }

    // ----- Chat UI -----
    function renderBotMarkdown(text) {
        const processedMessage = text.replace(/\\\[/g, '\\\\[').replace(/\\\]/g, '\\\\]').replace(/\\\(/g, '\\\\(').replace(/\\\)/g, '\\\\)');
        return marked.parse ? marked.parse(processedMessage) : processedMessage;
    }

    function chatNearBottom() {
        return chatDisplay.scrollHeight - chatDisplay.scrollTop - chatDisplay.clientHeight < 90;
    }

    function autoScrollChat() {
        if (chatNearBottom()) chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    function typeIntoText(el, fullText) {
        return new Promise((resolve) => {
            el.textContent = '';
            let i = 0;
            const step = 2;
            const delay = 8;
            const tick = () => {
                i += step;
                if (i >= fullText.length) {
                    el.textContent = fullText;
                    resolve();
                    return;
                }
                el.textContent = fullText.substring(0, i);
                autoScrollChat();
                setTimeout(tick, delay);
            };
            setTimeout(tick, 0);
        });
    }

    function addMessageToChat(message, sender, isThinking = false) {
        const el = document.createElement('div');
        el.classList.add(sender === 'user' ? 'user-message' : sender.includes('system') ? 'system-message' : 'bot-message');
        if (sender.includes('error')) el.classList.add('error');
        if (sender === 'bot' && !isThinking) {
            const processedMessage = message.replace(/\\\[/g, '\\\\[').replace(/\\\]/g, '\\\\]').replace(/\\\(/g, '\\\\(').replace(/\\\)/g, '\\\\)');
            const html = marked.parse ? marked.parse(processedMessage) : processedMessage;
            el.innerHTML = `<strong>Chatbot:</strong> <div class="tex2jax_process" style="margin-top:5px;">${html}</div>`;
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([el]).catch(err => console.error(err));
            }
        } else if (sender === 'bot') {
            el.innerHTML = `<strong>Chatbot:</strong> <span class="thinking-animation">${message}</span>`;
            el.id = "thinking-message";
        } else {
            el.textContent = message;
        }
        chatDisplay.appendChild(el);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }

    function updateLastBotMessage(message) {
        const el = document.getElementById('thinking-message');
        if (el) {
            el.removeAttribute('id');
            el.innerHTML = `<strong>Chatbot:</strong> <div class="tex2jax_process" style="margin-top:5px;"></div>`;
            const contentDiv = el.querySelector('.tex2jax_process');
            typeIntoText(contentDiv, message).then(() => {
                contentDiv.innerHTML = renderBotMarkdown(message);
                autoScrollChat();
                if (window.MathJax && window.MathJax.typesetPromise) {
                    window.MathJax.typesetPromise([el]).catch(err => console.error(err));
                }
            });
        } else {
            addMessageToChat(message, 'bot');
        }
        autoScrollChat();
    }

    resetChat();

    // ----- Session Download -----
    function getSessionHTML() {
        const clone = chatDisplay.cloneNode(true);
        return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Sesión de Chat</title>
            <style>
                body { font-family: sans-serif; line-height: 1.6; padding: 20px; color: #333; }
                .user-message { background-color: #007bff; color: white; padding: 10px; border-radius: 8px; margin-bottom: 10px; max-width: 80%; margin-left: auto; text-align: right; }
                .bot-message { background-color: #e9ecef; color: #343a40; padding: 10px; border-radius: 8px; margin-bottom: 10px; max-width: 80%; }
                .system-message { text-align: center; color: #666; font-style: italic; margin-bottom: 10px; }
                pre { background: #333; color: #fff; padding: 10px; border-radius: 5px; overflow-x: auto; }
                code { background: #eee; padding: 2px 4px; border-radius: 3px; }
            </style></head><body>
            <h2>Sesión de Chat con PDF</h2><p>Archivo: ${currentPdfName}</p><hr>
            <div>${clone.innerHTML}</div></body></html>`;
    }

    function downloadSessionHtml() {
        const blob = new Blob([getSessionHTML()], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `Sesion_Chat_${Date.now()}.html`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    }

    function downloadSessionPdf() {
        if (typeof html2pdf === 'undefined') { alert('Librería de PDF no cargada.'); return; }
        const element = document.createElement('div');
        element.innerHTML = `<div style="font-family:Arial,sans-serif;padding:20px;">
            <h2>Sesión de Chat con ${currentPdfName}</h2><hr style="margin-bottom:20px;">${chatDisplay.innerHTML}</div>`;
        element.querySelectorAll('.user-message, .bot-message').forEach(msg => {
            msg.style.cssText = `margin-bottom:15px;padding:10px;border-radius:5px;max-width:100%;border:1px solid #ccc;color:#333;
                background-color:${msg.classList.contains('user-message') ? '#f0f8ff' : '#f9f9f9'};
                text-align:${msg.classList.contains('user-message') ? 'right' : 'left'};`;
        });
        html2pdf().set({ margin: 10, filename: `Sesion_Chat_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(element).save();
    }

    function buildFallbackSuggestedQuestions(pdfName, subtitle) {
        const t = String(subtitle || pdfName || 'el documento').replace(/</g, '');
        const fn = String(pdfName || 'el PDF').replace(/</g, '');
        return [
            `¿Cuál es el tema central o el propósito principal de «${t}» según el documento?`,
            `Resume los puntos clave de «${fn}» en un breve párrafo.`,
            `¿Qué conceptos o términos importantes se definen o explican en el texto?`,
            `¿Qué conclusiones o recomendaciones principales presenta el autor?`,
            `¿Hay datos, cifras o ejemplos destacados? Resume los más relevantes.`,
            `¿Qué problemas o preguntas de investigación plantea el documento?`,
            `Explica con tus palabras la estructura del documento (secciones o partes).`,
            `¿Qué relación existe entre las ideas del inicio y las del final del texto?`,
            `Identifica ideas que podrían generar debate u otras interpretaciones.`,
            `¿Qué limitaciones o advertencias menciona el texto respecto a sus afirmaciones?`,
            `Propón un mapa mental o esquema basado solo en el contenido del PDF.`,
            `¿Cómo se podría aplicar en la práctica lo explicado en el documento?`
        ];
    }

    function parseSuggestedQuestionsFromApi(raw) {
        if (!raw || typeof raw !== 'string') return null;
        const arrMatch = raw.match(/\[[\s\S]*\]/);
        const block = raw.match(/\{[\s\S]*\}/);
        const cleanStrings = arr => arr
            .map(s => String(s).replace(/^[\d.\-\)\s]+/gm, '').trim())
            .filter(s => s.length > 4);
        try {
            if (arrMatch) {
                const a = JSON.parse(arrMatch[0]);
                if (Array.isArray(a) && a.length >= 10) return cleanStrings(a);
            }
            if (block) {
                const o = JSON.parse(block[0]);
                const vals = Object.values(o).filter(v => typeof v === 'string');
                if (vals.length >= 10) return cleanStrings(vals);
            }
        } catch (_) { /* ignore */ }
        return null;
    }

    function buildStratifiedPdfExcerptForQuestions(pdfText, maxTotalChars) {
        const len = pdfText.length;
        if (len <= maxTotalChars) return pdfText;
        const n = 5;
        const per = Math.floor(maxTotalChars / n);
        const labels = [
            'INICIO DEL DOCUMENTO (aprox. primeras páginas)',
            'ZONA INTERMEDIA TEMPRANA (aprox. 20–30% del texto)',
            'PARTE CENTRAL (aprox. mitad del documento)',
            'ZONA INTERMEDIA TARDÍA (aprox. 70–80% del texto)',
            'FINAL DEL DOCUMENTO (aprox. últimas páginas)'
        ];
        const starts = [
            0,
            Math.floor(len * 0.22),
            Math.floor(len * 0.48),
            Math.floor(len * 0.72),
            Math.max(0, len - per)
        ];
        const parts = [];
        for (let i = 0; i < n; i++) {
            const slice = pdfText.substring(starts[i], starts[i] + per).trim();
            if (slice.length < 80) continue;
            parts.push('=== ' + labels[i] + ' ===\n' + slice);
        }
        return parts.join('\n\n');
    }

    async function fetchSuggestedQuestionsForDownload(model, pdfText, pdfName, subtitle) {
        const excerpt = buildStratifiedPdfExcerptForQuestions(pdfText, 22000);
        const prompt =
            `Eres un asistente educativo. Dispones de VARIOS extractos del MISMO documento "${pdfName}" (tema del chatbot: "${subtitle}"), tomados del inicio, zonas intermedias y el final, para que veas capítulos o secciones distintas.\n\n` +
            'Redacta exactamente 12 preguntas breves en español que un estudiante podría hacer para aprender con este material.\n\n' +
            'Directrices obligatorias sobre el reparto de las preguntas:\n' +
            '- Reparte las preguntas para que abarquen la mayor parte del contenido útil del documento: distintos capítulos, unidades, temas o apartados, según lo que permitan los extractos.\n' +
            '- No centres casi todas las preguntas solo en el primer capítulo o las primeras páginas: incluye obligatoriamente preguntas que reflejen ideas, secciones o bloques que aparezcan en la parte media y en la parte final del libro o manual (cuando los extractos lo permitan).\n' +
            '- Si en los extractos se distinguen títulos de unidades o capítulos, al menos la mitad de las preguntas debe poder asociarse claramente a más de una zona del documento (inicio, medio o cierre), no solo al inicio.\n' +
            '- Varía la formulación para cubrir distintos tipos de aprendizaje (conceptos, aplicación, síntesis, relación entre secciones).\n\n' +
            'Responde ÚNICAMENTE con un array JSON válido (sin markdown ni texto adicional), por ejemplo:\n["pregunta 1","pregunta 2"]\n\nTexto de referencia (extractos estratificados):\n' +
            excerpt;
        const res = await fetch(`${API_BASE}/text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                model: model || TEXT_MODELS[0],
                json: true
            })
        });
        if (!res.ok) throw new Error(String(res.status));
        const raw = await res.text();
        let content = raw.trim();
        try {
            const parsedJson = JSON.parse(raw);
            if (parsedJson && typeof parsedJson === 'object') {
                content = String(parsedJson.text ?? parsedJson.output ?? parsedJson.response ?? raw).trim();
            }
        } catch (_) { /* respuesta en texto plano */ }
        const parsed = parseSuggestedQuestionsFromApi(content);
        if (!parsed || parsed.length < 10) throw new Error('parse');
        return parsed;
    }

    // ----- Download Chatbot Clone -----
    async function downloadChatbot() {
        const defaultSubtitle = currentPdfTitle || currentPdfName.replace(/\.pdf$/i, '');
        const userSubtitle = prompt("Ingresa el subtítulo que deseas para el clon:", defaultSubtitle);
        if (userSubtitle === null) return;

        const selectedModel = modelSelector.value || TEXT_MODELS[0];
        let suggestedQuestions = buildFallbackSuggestedQuestions(currentPdfName, userSubtitle);
        if (pdfTextContent.length > 200) {
            try {
                const gen = await fetchSuggestedQuestionsForDownload(
                    selectedModel, pdfTextContent, currentPdfName, userSubtitle
                );
                if (gen && gen.length >= 10) suggestedQuestions = gen;
            } catch (_) { /* mantener fallback */ }
        }
        const eSuggestedQuestionsJson = JSON.stringify(suggestedQuestions);
        const embedForScript = function(s) {
            return JSON.stringify(s).replace(/</g, '\\u003c');
        };
        const ePdfText = embedForScript(pdfTextContent);
        const ePdfName = embedForScript(currentPdfName);
        const ePdfSubtitle = embedForScript(userSubtitle);
        const ePdf2Text = embedForScript(pdf2TextContent);
        const ePdf2Name = embedForScript(currentPdf2Name);
        const eModel = JSON.stringify(selectedModel);
        const eSysTutor = embedForScript(SYS_TUTOR);
        const eBotAvatar = embedForScript(botAvatarBase64);
        const eUserAvatar = embedForScript(userAvatarBase64);

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chatbot: ${userSubtitle}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js"><\/script>
    <script>pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';<\/script>
    <script>
        window.MathJax = {
            tex: { inlineMath: [['$', '$'], ['\\\\(', '\\\\)']], displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']] },
            options: { processHtmlClass: "tex2jax_process", ignoreHtmlClass: "tex2jax_ignore" }
        };
    </script>
    <script id="MathJax-script" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.0/es5/tex-mml-chtml.min.js"><\/script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><\/script>
    <script src="https://unpkg.com/docx@7.3.0/build/index.js"><\/script>
    <script src="https://unpkg.com/file-saver@2.0.5/dist/FileSaver.min.js"><\/script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root{--primary:#007bff;--secondary:#6c757d;--light:#f8f9fa;--dark:#343a40;--success:#28a745;--danger:#dc3545;--warning:orange;--radius:8px;--font:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;--bg:var(--light);--text:var(--dark);--card:#fff;--border:#ddd;--input:#fff;--iborder:#ccc;--bot-bg:#e9ecef;--bot-text:var(--dark);--user-bg:var(--primary);--user-text:#fff;--sys-bg:#fff3cd;--sys-text:#856404;}
        body.dark-mode{--bg:#212529;--text:#f8f9fa;--card:#343a40;--border:#495057;--input:#495057;--iborder:#6c757d;--bot-bg:#495057;--bot-text:#f8f9fa;--sys-bg:#332701;--sys-text:#ffeb8f;}
        body{font-family:var(--font);margin:0;background:var(--bg);color:var(--text);display:flex;flex-direction:column;min-height:100vh;transition:background .3s,color .3s;}
        .container{width:90%;max-width:800px;margin:20px auto;padding:20px;background:var(--card);border-radius:var(--radius);box-shadow:0 4px 12px rgba(0,0,0,.1);flex-grow:1;display:flex;flex-direction:column;gap:15px;}
        header{text-align:center;border-bottom:1px solid var(--border);padding-bottom:15px;}
        header h1{color:var(--primary);margin:0;font-size:1.6em;}
        header p{margin:5px 0 0;font-size:.9em;color:var(--secondary);}
        .toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;}
        .api-key-container{display:flex;gap:8px;align-items:center;flex-grow:1;}
        .api-key-container input{padding:7px;border:1px solid var(--iborder);border-radius:var(--radius);background:var(--input);color:var(--text);flex-grow:1;}
        button{background:var(--primary);color:#fff;border:none;padding:8px 15px;border-radius:var(--radius);cursor:pointer;font-size:.9em;transition:background .2s;}
        button:hover{background:#0056b3;}
        button:disabled{background:var(--secondary)!important;opacity:.65;cursor:not-allowed;}
        #theme-btn{background:var(--secondary);}
        .toolbar-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}
        .btn-export{background:var(--primary);color:#fff;border:none;padding:8px 14px;border-radius:var(--radius);cursor:pointer;font-size:.85em;transition:background .2s;}
        .btn-export:hover{background:#0056b3;}
        .pdf2-section{padding:10px;border:1px dashed var(--border);border-radius:var(--radius);}
        .pdf2-section label.title{font-size:.85em;font-weight:bold;display:block;margin-bottom:6px;color:var(--secondary);}
        .file-row{display:flex;align-items:center;gap:10px;}
        .file-row input[type=file]{display:none;}
        .file-label{background:var(--secondary);color:#fff;padding:6px 12px;border-radius:var(--radius);cursor:pointer;font-size:.85em;}
        .file-label:hover{background:#545b62;}
        #pdf2-name{font-style:italic;color:var(--secondary);font-size:.85em;}
        #pdf2-status{font-size:.85em;margin-top:4px;font-weight:bold;}
        .suggested-questions-row{display:flex;flex-direction:column;gap:6px;}
        .sq-label{font-size:.85em;font-weight:600;color:var(--secondary);}
        .questions-select{width:100%;padding:8px;border:1px solid var(--iborder);border-radius:var(--radius);background:var(--input);color:var(--text);font-size:.9em;}
        .chat-display{height:360px;overflow-y:auto;border:1px solid var(--iborder);border-radius:var(--radius);padding:10px;background:var(--bg);line-height:1.6;}
        .chat-display .user-message,.chat-display .bot-message,.chat-display .system-message{margin-bottom:10px;word-wrap:break-word;}
        .chat-display .user-message,.chat-display .bot-message{background:transparent;color:inherit;padding:0;border-radius:0;max-width:100%;text-align:inherit;margin-left:0;}
        .message{display:flex;align-items:flex-end;gap:10px;margin-bottom:4px;max-width:100%;}
        .message.user-message{flex-direction:row-reverse;justify-content:flex-start;}
        .avatar-img{width:40px;height:40px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1px solid #eee;background-color:#f0f0f0;}
        body.dark-mode .avatar-img{border-color:#444;background-color:#555;}
        .message-bubble{padding:10px 15px;border-radius:18px;max-width:85%;word-wrap:break-word;line-height:1.5;display:flex;flex-direction:column;}
        .user-message .message-bubble.user-bubble{background:var(--user-bg);color:var(--user-text);border-bottom-right-radius:5px;margin-left:auto;}
        .bot-message .message-bubble.bot-bubble{background:var(--bot-bg);color:var(--bot-text);border-bottom-left-radius:5px;margin-right:auto;}
        .chat-display .message-bubble strong{color:var(--primary);font-size:.9em;}
        .chat-display .bot-message .message-bubble p{margin:0 0 8px;}.chat-display .bot-message .message-bubble p:last-child{margin:0;}
        .chat-display .bot-message .message-bubble pre{background:var(--dark);color:var(--light);padding:10px;border-radius:5px;overflow-x:auto;}
        .chat-display .bot-message .message-bubble code{background:rgba(0,0,0,.1);padding:2px 4px;border-radius:3px;}
        body.dark-mode .chat-display .bot-message .message-bubble code{background:rgba(255,255,255,.1);}
        .chat-display .system-message{background:var(--sys-bg);color:var(--sys-text);text-align:center;font-style:italic;font-size:.9em;padding:8px 12px;border-radius:var(--radius);}
        .chat-display .system-message.error{background:#f8d7da;color:#721c24;}
        .thinking-animation{opacity:.75;animation:pulseThink 1s ease-in-out infinite;}
        @keyframes pulseThink{50%{opacity:1}}
        .input-area{display:flex;gap:10px;}
        #question-input{flex-grow:1;padding:10px;border:1px solid var(--iborder);border-radius:var(--radius);font-size:1em;resize:none;background:var(--input);color:var(--text);}
        #send-button{background:var(--success);padding:0 20px;display:flex;align-items:center;justify-content:center;gap:8px;}
        #send-button:hover{background:#1e7e34;}
        .loader{border:3px solid #f3f3f3;border-top:3px solid var(--primary);border-radius:50%;width:16px;height:16px;animation:spin 1s linear infinite;display:none;}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        footer{text-align:center;padding:12px;background:var(--dark);color:var(--light);font-size:.8em;margin-top:20px;}
        @media(max-width:600px){.input-area{flex-direction:column;}#send-button{width:100%;padding:12px;}}
    </style>
</head>
<body>
<div class="container">
    <header>
        <h1>Chatbot tutor socrático</h1>
        <p>${userSubtitle}</p>
    </header>
    <div class="toolbar">
        <div class="toolbar-actions">
            <button type="button" id="new-chat-session-btn" class="btn-export">🔄 Nuevo chat</button>
            <button type="button" id="download-html-session-btn" class="btn-export">📥 Descargar HTML</button>
            <button type="button" id="download-word-session-btn" class="btn-export">📥 Descargar Word</button>
            <button type="button" id="theme-btn">🌓 Tema</button>
        </div>
    </div>
    <div class="pdf2-section">
        <label class="title">📎 Segundo PDF (opcional)</label>
        <div class="file-row">
            <label for="pdf2-upload" class="file-label">+ Seleccionar PDF</label>
            <input type="file" id="pdf2-upload" accept=".pdf">
            <span id="pdf2-name">Ningún archivo seleccionado</span>
        </div>
        <div id="pdf2-status"></div>
    </div>
    <div class="suggested-questions-row">
        <label for="questions-selector" class="sq-label">Preguntas sugeridas</label>
        <select id="questions-selector" class="questions-select" title="Elegir una pregunta propuesta">
            <option value="">— Elige una pregunta —</option>
        </select>
    </div>
    <div id="chat-display" class="chat-display"></div>
    <div class="input-area">
        <textarea id="question-input" rows="2" placeholder="Escribe tu pregunta aquí..."></textarea>
        <button id="send-button">
            <span id="send-button-text">Enviar</span>
            <div class="loader" id="loading-spinner"></div>
        </button>
    </div>
</div>
<footer><p>Diseñado por Juan Guillermo Rivera Berrío con tecnología Gemini 3.1 Pro y la IA agéntica Antigravity</p></footer>
<script>
    const PDF_TEXT = ${ePdfText};
    const PDF_NAME = ${ePdfName};
    const CHATBOT_THEME = ${ePdfSubtitle};
    const PDF2_TEXT_EMBEDDED = ${ePdf2Text};
    const PDF2_NAME_EMBEDDED = ${ePdf2Name};
    const MODEL = ${eModel};
    const SYS_TUTOR_EMBEDDED = ${eSysTutor};
    const PROPOSED_QUESTIONS = ${eSuggestedQuestionsJson};
    const BOT_AVATAR = ${eBotAvatar};
    const USER_AVATAR = ${eUserAvatar};

    let pdf2Text = PDF2_TEXT_EMBEDDED;
    let pdf2Name = PDF2_NAME_EMBEDDED;
    let isProcessing = false;
    let chatHistory = [];

    const chatDisplay = document.getElementById('chat-display');
    const questionInput = document.getElementById('question-input');
    const sendButton = document.getElementById('send-button');
    const sendButtonText = document.getElementById('send-button-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    const themeBtn = document.getElementById('theme-btn');
    const pdf2Upload = document.getElementById('pdf2-upload');
    const pdf2NameDisplay = document.getElementById('pdf2-name');
    const pdf2StatusDisplay = document.getElementById('pdf2-status');
    const questionsSelector = document.getElementById('questions-selector');

    const API_BASE = 'https://node.proyectodescartes.org/api/ia';
    function getAvatarUrl(type) {
        if (type === 'bot' && BOT_AVATAR) return BOT_AVATAR;
        if (type === 'user' && USER_AVATAR) return USER_AVATAR;
        const fallbackSvg = function(letter) {
            return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#6c757d"/><text x="50" y="68" text-anchor="middle" fill="#fff" font-size="44" font-family="system-ui,sans-serif">' + letter + '</text></svg>');
        };
        return type === 'bot' ? fallbackSvg('B') : fallbackSvg('U');
    }

    PROPOSED_QUESTIONS.forEach(function(q, i) {
        const opt = document.createElement('option');
        opt.value = String(i);
        const label = q.length > 72 ? q.substring(0, 69) + '...' : q;
        opt.textContent = label;
        opt.title = q;
        questionsSelector.appendChild(opt);
    });
    questionsSelector.addEventListener('change', function(e) {
        const v = e.target.value;
        if (v !== '') {
            questionInput.value = PROPOSED_QUESTIONS[Number(v)];
            questionInput.focus();
            questionsSelector.value = '';
        }
    });

    // Theme
    function applyTheme(t) { document.body.classList.toggle('dark-mode', t==='dark'); themeBtn.textContent = t==='dark' ? '☀️ Tema' : '🌙 Tema'; }
    themeBtn.addEventListener('click', () => { const n = document.body.classList.contains('dark-mode') ? 'light' : 'dark'; applyTheme(n); localStorage.setItem('theme',n); });
    applyTheme(localStorage.getItem('theme') || 'light');

    // Second PDF (embedded or user-loaded)
    if (pdf2Text) { pdf2NameDisplay.textContent = pdf2Name + ' (incluido)'; pdf2StatusDisplay.textContent = '"' + pdf2Name + '" ya incluido.'; pdf2StatusDisplay.style.color = 'var(--success)'; }
    pdf2Upload.addEventListener('change', async (ev) => {
        const file = ev.target.files[0]; if (!file) return;
        if (!(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
            pdf2StatusDisplay.textContent = 'No es un PDF válido.'; pdf2StatusDisplay.style.color = 'var(--danger)'; return;
        }
        pdf2Name = file.name; pdf2NameDisplay.textContent = file.name;
        pdf2StatusDisplay.textContent = 'Procesando...'; pdf2StatusDisplay.style.color = 'var(--warning)';
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(e.target.result) }).promise;
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const tc = await page.getTextContent();
                    tc.items.forEach(item => text += item.str + ' ');
                    text += '\\n';
                }
                pdf2Text = text;
                pdf2StatusDisplay.textContent = '"' + pdf2Name + '" cargado.'; pdf2StatusDisplay.style.color = 'var(--success)';
                addMsg('Segundo documento "' + pdf2Name + '" listo.', 'system');
            } catch(err) { pdf2StatusDisplay.textContent = 'Error al procesar.'; pdf2StatusDisplay.style.color = 'var(--danger)'; pdf2Text = ''; }
        };
        reader.readAsArrayBuffer(file);
    });

    function dismissThinkingAsSystem(text, asError) {
        const el = document.getElementById('thinking-msg');
        if (!el) return;
        el.className = 'system-message' + (asError ? ' error' : '');
        el.textContent = text;
        el.removeAttribute('id');
    }

    function cloneNearBottom() {
        return chatDisplay.scrollHeight - chatDisplay.scrollTop - chatDisplay.clientHeight < 90;
    }
    function cloneAutoScroll() {
        if (cloneNearBottom()) chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
    function cloneTypeInto(el, fullText) {
        return new Promise(function(resolve) {
            el.textContent = '';
            let i = 0;
            const step = 2;
            const delay = 8;
            const tick = function() {
                i += step;
                if (i >= fullText.length) { el.textContent = fullText; resolve(); return; }
                el.textContent = fullText.substring(0, i);
                cloneAutoScroll();
                setTimeout(tick, delay);
            };
            setTimeout(tick, 0);
        });
    }

    function addMsg(message, sender, isThinking = false) {
        const el = document.createElement('div');
        el.classList.add(sender === 'user' ? 'user-message' : sender.includes('system') ? 'system-message' : 'bot-message');
        if (sender.includes('error')) el.classList.add('error');
        if (sender === 'bot' && !isThinking) {
            const processedMessage = message.replace(/\\\[/g, '\\\\[').replace(/\\\]/g, '\\\\]').replace(/\\\(/g, '\\\\(').replace(/\\\)/g, '\\\\)');
            const html = marked.parse ? marked.parse(processedMessage) : processedMessage;
            const botAvatarUrl = getAvatarUrl('bot');
            el.innerHTML = '<div class="message"><img class="avatar-img" src="' + botAvatarUrl + '" alt=""><div class="message-bubble bot-bubble"><strong>Chatbot:</strong><div class="tex2jax_process" style="margin-top:5px;">' + html + '</div><div style="margin-top:10px;font-size:.8em;color:var(--secondary);font-style:italic;">Modelo: ' + MODEL + '</div></div></div>';
            if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise([el]).catch(err => console.error(err));
        } else if (sender === 'bot') {
            const botAvatarUrl = getAvatarUrl('bot');
            el.innerHTML = '<div class="message"><img class="avatar-img" src="' + botAvatarUrl + '" alt=""><div class="message-bubble bot-bubble"><strong>Chatbot:</strong> <span class="thinking-animation">' + message + '</span></div></div>';
            el.id = 'thinking-msg';
        } else if (sender === 'user') {
            const userAvatarUrl = getAvatarUrl('user');
            el.innerHTML = '<div class="message user-message"><div class="message-bubble user-bubble"></div><img class="avatar-img" src="' + userAvatarUrl + '" alt=""></div>';
            el.querySelector('.user-bubble').textContent = message;
        } else {
            el.textContent = message;
        }
        chatDisplay.appendChild(el); chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
    function updateLastMsg(message) {
        const el = document.getElementById('thinking-msg');
        const botAvatarUrl = getAvatarUrl('bot');
        if (el) {
            el.removeAttribute('id');
            el.className = 'bot-message';
            el.innerHTML = '<div class="message"><img class="avatar-img" src="' + botAvatarUrl + '" alt=""><div class="message-bubble bot-bubble"><strong>Chatbot:</strong><div class="tex2jax_process" style="margin-top:5px;"></div><div style="margin-top:10px;font-size:.8em;color:var(--secondary);font-style:italic;">Modelo: ' + MODEL + '</div></div></div>';
            const contentDiv = el.querySelector('.tex2jax_process');
            cloneTypeInto(contentDiv, message).then(function() {
                const processedMessage = message.replace(/\\\[/g, '\\\\[').replace(/\\\]/g, '\\\\]').replace(/\\\(/g, '\\\\(').replace(/\\\)/g, '\\\\)');
                const html = marked.parse ? marked.parse(processedMessage) : processedMessage;
                contentDiv.innerHTML = html;
                cloneAutoScroll();
                if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise([el]).catch(err => console.error(err));
            });
        } else {
            addMsg(message, 'bot');
        }
        cloneAutoScroll();
    }

    async function sendQuestion() {
        const question = questionInput.value.trim();
        if (!question || isProcessing) return;
        addMsg(question, 'user'); questionInput.value = '';
        isProcessing = true; sendButton.disabled = true; questionInput.disabled = true;
        loadingSpinner.style.display = 'inline-block'; sendButtonText.textContent = 'Enviando';
        addMsg('Pensando...', 'bot', true);
const maxLen = 800000;
        const t1 = PDF_TEXT.length > maxLen ? PDF_TEXT.substring(0, maxLen) + '... (truncado)' : PDF_TEXT;
        let documentsPart = 'Documento 1 ("' + PDF_NAME + '"): "' + t1 + '"\\n\\n';
        if (pdf2Text) {
            const t2 = pdf2Text.length > maxLen ? pdf2Text.substring(0, maxLen) + '... (truncado)' : pdf2Text;
            documentsPart += 'Documento 2 ("' + pdf2Name + '"): "' + t2 + '"\\n\\n';
        }
const systemInstructions = 'Eres un tutor educativo que SOLO debe ayudar con preguntas relacionadas con el contenido del/los documento(s) PDF incrustados en esta conversación y con el tema del chatbot: «' + CHATBOT_THEME + '». ' +
            'No respondas temas claramente ajenos (vida personal sin relación, otros materiales, programación arbitraria sin vinculación al documento, etc.). ' +
            'Si la pregunta NO tiene relación con el documento ni con ese tema, responde ÚNICAMENTE una línea que empiece exactamente con [FUERA_DE_ALCANCE] seguida de una frase breve en español. ' +
            'Para preguntas válidas, fundamenta la respuesta en los textos del documento, pero actúa siempre como tutor educativo.' +
            '\\n\\n' + SYS_TUTOR_EMBEDDED +
            '\\n\\n(Instrucción: Para expresiones matemáticas, utiliza SÓLO el formato $$...$$ para bloque y $...$ para texto en línea.)\\n\\n' +
            'A continuación se incluye el/los documento(s) que sirven de base de conocimiento. Estos documentos NO forman parte del diálogo previo; son contexto que debes consultar cuando sea necesario:\\n\\n' +
            documentsPart;
        let conversationText = '';
        chatHistory.forEach(function(m) {
            if (m.role === 'user') conversationText += 'Usuario: ' + m.content + '\\n';
            else if (m.role === 'assistant') conversationText += 'Chatbot: ' + m.content + '\\n';
        });
        conversationText += 'Usuario: ' + question;
        chatHistory.push({ role: 'user', content: question });
        var userTurns = chatHistory.filter(function(m){ return m.role === 'user'; }).length;
        var capInstruction = '';
        if (userTurns >= 5) {
            capInstruction = '\\n\\n[CONTROL DE LA APLICACIÓN] Se alcanzó el LÍMITE MÁXIMO de 5 interacciones pedagógicas. NO formules ninguna pregunta más. Entrega AHORA MISMO la respuesta final completa y razonada, sintetizando lo aprendido. Esta es tu última intervención.';
        }
        const fullPrompt = systemInstructions + '\\n\\n=== DIALOGO CON EL ESTUDIANTE ===\\n' + conversationText +
            capInstruction +
            '\\n\\nInstrucción final: NO resuelvas el ejercicio directamente ni entregues la solución completa en tu primera respuesta. Aplica el método socrático descrito arriba: analiza, divide el razonamiento en pasos pequeños y haz preguntas guiadas una por una. Espera la respuesta del estudiante antes de avanzar.';
        try {
            const res = await fetch(API_BASE + '/text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: fullPrompt,
                    model: MODEL,
                    system: systemInstructions
                })
            });
            if (!res.ok) { let e=''; try{e=await res.text();}catch(_){} throw new Error('Error de API: ' + res.status + ' ' + res.statusText + '. ' + e.substring(0,200)); }
            let raw = (await res.text()).trim();
            try {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') raw = String(parsed.text || parsed.output || parsed.response || parsed.content || raw).trim();
            } catch(_) {}
            if (/^\\[FUERA_DE_ALCANCE\\]/.test(raw)) {
                chatHistory.push({ role: 'assistant', content: raw });
                dismissThinkingAsSystem(raw.replace(/^\\[FUERA_DE_ALCANCE\\]\\s*/, ''), true);
            } else {
                updateLastMsg(raw || 'La IA no proporcionó una respuesta.');
                chatHistory.push({ role: 'assistant', content: raw || 'La IA no proporcionó una respuesta.' });
            }
        } catch(err) { updateLastMsg('Lo siento, ocurrió un error: ' + err.message); }
        finally {
            isProcessing = false; sendButton.disabled = false; questionInput.disabled = false;
            loadingSpinner.style.display = 'none'; sendButtonText.textContent = 'Enviar'; questionInput.focus();
        }
    }
    function escapeHtml(s) {
        if (s === undefined || s === null) return '';
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function getSessionHTML() {
        const clone = chatDisplay.cloneNode(true);
        const exportStyles =
            'body{font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;line-height:1.65;padding:28px;color:#333;max-width:880px;margin:0 auto;background:#fafafa;}' +
            'h1{color:#007bff;font-size:1.45em;margin-bottom:6px;}' +
            '.meta{color:#444;margin:6px 0;font-size:.95em;}' +
            'hr{border:none;border-top:1px solid #dee2e6;margin:22px 0;}' +
            '.chat-export{padding:4px 0;}' +
            '.chat-export .user-message,.chat-export .bot-message,.chat-export .system-message{margin-bottom:18px;}' +
            '.chat-export .system-message{text-align:center;color:#555;font-style:italic;padding:10px 14px;background:#fff3cd;border-radius:10px;border:1px solid #ffeaa7;}' +
            '.chat-export .system-message.error{background:#f8d7da;color:#721c24;border-color:#f5c6cb;}' +
            '.chat-export .message{display:flex;align-items:flex-end;gap:12px;}' +
            '.chat-export .message.user-message{flex-direction:row-reverse;}' +
            '.chat-export .avatar-img{width:42px;height:42px;border-radius:50%;object-fit:cover;border:1px solid #e0e0e0;}' +
            '.chat-export .message-bubble{padding:12px 16px;border-radius:18px;max-width:78%;box-shadow:0 1px 2px rgba(0,0,0,.06);}' +
            '.chat-export .user-bubble{background:#007bff;color:#fff;}' +
            '.chat-export .bot-bubble{background:#e9ecef;color:#212529;}' +
            '.chat-export .bot-bubble strong{color:#007bff;}' +
            '.chat-export .bot-bubble p{margin:0 0 10px;}.chat-export .bot-bubble p:last-child{margin:0;}' +
            '.chat-export pre{background:#2d2d2d;color:#f8f8f2;padding:12px;border-radius:8px;overflow-x:auto;font-size:.9em;}' +
            '.chat-export code{background:#eee;padding:2px 6px;border-radius:4px;font-size:.9em;}' +
            '.chat-export ul,.chat-export ol{margin:8px 0;padding-left:22px;}';
        return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Sesión de chat</title><style>' + exportStyles + '</style></head><body>' +
            '<h1>Sesión de chat</h1>' +
            '<p class="meta"><strong>Documento:</strong> ' + escapeHtml(PDF_NAME) + '</p>' +
            '<p class="meta"><strong>Tema del chatbot:</strong> ' + escapeHtml(CHATBOT_THEME) + '</p>' +
            '<p class="meta"><strong>Modelo:</strong> ' + escapeHtml(MODEL) + '</p>' +
            '<hr><div class="chat-export">' + clone.innerHTML + '</div></body></html>';
    }

    function downloadSessionHtml() {
        const blob = new Blob([getSessionHTML()], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Sesion_Chat_' + Date.now() + '.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function processHtmlToDocx(htmlContent) {
        const paragraphs = [];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const elements = tempDiv.children;
        if (elements.length === 0 && htmlContent.replace(/\\s/g, '').length > 0) {
            return [new docx.Paragraph({ text: tempDiv.textContent || htmlContent, spacing: { after: 200 } })];
        }
        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            const tagName = element.tagName.toLowerCase();
            const text = element.textContent || element.innerText || '';
            if (tagName === 'h1' || tagName === 'h2') {
                paragraphs.push(new docx.Paragraph({
                    text: text,
                    heading: tagName === 'h1' ? docx.HeadingLevel.HEADING_1 : docx.HeadingLevel.HEADING_2,
                    spacing: { before: 400, after: 200 }
                }));
            } else if (tagName === 'h3') {
                paragraphs.push(new docx.Paragraph({
                    text: text,
                    heading: docx.HeadingLevel.HEADING_3,
                    spacing: { before: 300, after: 200 }
                }));
            } else if (tagName === 'ul' || tagName === 'ol') {
                const listItems = element.querySelectorAll('li');
                listItems.forEach(function(li) {
                    paragraphs.push(new docx.Paragraph({
                        text: li.textContent,
                        bullet: { level: 0 },
                        spacing: { after: 100 }
                    }));
                });
            } else if (tagName === 'p') {
                const textRuns = [];
                if (element.children.length === 0) {
                    textRuns.push(new docx.TextRun({ text: text }));
                } else {
                    processInlineElements(element, textRuns);
                }
                paragraphs.push(new docx.Paragraph({
                    children: textRuns.length > 0 ? textRuns : [new docx.TextRun({ text: text })],
                    spacing: { after: 200 }
                }));
            } else if (tagName === 'blockquote') {
                paragraphs.push(new docx.Paragraph({
                    text: text,
                    italics: true,
                    indent: { left: 720 },
                    spacing: { after: 200 },
                    border: { left: { color: 'CCCCCC', size: 6, style: docx.BorderStyle.SINGLE } }
                }));
            } else if (tagName === 'code') {
                paragraphs.push(new docx.Paragraph({
                    text: text,
                    font: 'Courier New',
                    shading: { type: docx.ShadingType.SOLID, color: 'F5F5F5' },
                    spacing: { after: 100 }
                }));
            } else if (tagName === 'pre') {
                paragraphs.push(new docx.Paragraph({
                    text: text,
                    font: 'Courier New',
                    shading: { type: docx.ShadingType.SOLID, color: '2D2D2D' },
                    color: 'FFFFFF',
                    spacing: { after: 200 }
                }));
            } else {
                paragraphs.push(new docx.Paragraph({ text: text, spacing: { after: 200 } }));
            }
        }
        return paragraphs;
    }

    function processInlineElements(element, textRuns) {
        for (let j = 0; j < element.childNodes.length; j++) {
            const node = element.childNodes[j];
            if (node.nodeType === Node.TEXT_NODE) {
                textRuns.push(new docx.TextRun({ text: node.textContent }));
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                const nodeText = node.textContent || '';
                if (tagName === 'strong' || tagName === 'b') {
                    textRuns.push(new docx.TextRun({ text: nodeText, bold: true }));
                } else if (tagName === 'em' || tagName === 'i') {
                    textRuns.push(new docx.TextRun({ text: nodeText, italics: true }));
                } else if (tagName === 'u') {
                    textRuns.push(new docx.TextRun({ text: nodeText, underline: {} }));
                } else if (tagName === 'code') {
                    textRuns.push(new docx.TextRun({
                        text: nodeText,
                        font: 'Courier New',
                        shading: { type: docx.ShadingType.SOLID, color: 'F0F0F0' }
                    }));
                } else if (tagName === 'a') {
                    textRuns.push(new docx.TextRun({ text: nodeText, color: '0066CC', underline: {} }));
                } else {
                    processInlineElements(node, textRuns);
                }
            }
        }
    }

    function downloadSessionWord() {
        if (typeof docx === 'undefined' || typeof saveAs === 'undefined') {
            alert('Las librerías para exportar Word aún se están cargando. Espera unos segundos e inténtalo de nuevo.');
            return;
        }
        const chatMessages = chatDisplay.querySelectorAll('.user-message, .bot-message, .system-message');
        const children = [];
        children.push(new docx.Paragraph({
            text: 'Sesión de Chat (documento PDF)',
            heading: docx.HeadingLevel.HEADING_1,
            alignment: docx.AlignmentType.CENTER,
            spacing: { after: 400 }
        }));
        children.push(new docx.Paragraph({
            children: [
                new docx.TextRun({ text: 'Documento: ', bold: true }),
                new docx.TextRun({ text: PDF_NAME })
            ],
            spacing: { after: 100 }
        }));
        children.push(new docx.Paragraph({
            children: [
                new docx.TextRun({ text: 'Tema del chatbot: ', bold: true }),
                new docx.TextRun({ text: CHATBOT_THEME })
            ],
            spacing: { after: 100 }
        }));
        children.push(new docx.Paragraph({
            children: [
                new docx.TextRun({ text: 'Modelo: ', bold: true }),
                new docx.TextRun({ text: MODEL })
            ],
            spacing: { after: 200 }
        }));
        children.push(new docx.Paragraph({
            text: '________________________________________________________________________________________________',
            spacing: { after: 400 }
        }));

        chatMessages.forEach(function(msg) {
            if (msg.classList.contains('system-message')) {
                children.push(new docx.Paragraph({
                    text: msg.textContent,
                    italics: true,
                    alignment: docx.AlignmentType.CENTER,
                    spacing: { after: 200 },
                    color: '666666'
                }));
            } else if (msg.classList.contains('user-message')) {
                const ub = msg.querySelector('.user-bubble');
                const userText = ub ? ub.textContent.trim() : msg.textContent.replace(/^Usuario:\\s*/i, '').trim();
                children.push(new docx.Paragraph({
                    children: [
                        new docx.TextRun({ text: 'Usuario: ', bold: true, color: '0066CC' }),
                        new docx.TextRun({ text: userText })
                    ],
                    spacing: { after: 200 },
                    alignment: docx.AlignmentType.RIGHT,
                    shading: { type: docx.ShadingType.SOLID, color: 'E3F2FD' }
                }));
            } else if (msg.classList.contains('bot-message')) {
                const botBubble = msg.querySelector('.message-bubble');
                if (botBubble) {
                    const contentDiv = botBubble.querySelector('.tex2jax_process') || botBubble.querySelector('div[style*=\"margin-top:5px\"]');
                    const modelInfoEl = botBubble.querySelector('div[style*=\"font-size:0.8em\"]');
                    const modelInfo = modelInfoEl ? modelInfoEl.textContent : '';
                    if (contentDiv) {
                        const formatted = processHtmlToDocx(contentDiv.innerHTML);
                        formatted.forEach(function(paragraph) { children.push(paragraph); });
                        if (modelInfo) {
                            children.push(new docx.Paragraph({
                                children: [new docx.TextRun({ text: modelInfo, italics: true, size: 20, color: '666666' })],
                                spacing: { after: 200 }
                            }));
                        }
                    } else {
                        let plain = botBubble.textContent || '';
                        if (modelInfo) plain = plain.split(modelInfo).join('').trim();
                        plain = plain.replace(/^Chatbot:\\s*/i, '').trim();
                        children.push(new docx.Paragraph({ text: plain, spacing: { after: 200 } }));
                    }
                }
            }
        });

        const doc = new docx.Document({
            sections: [{ properties: {}, children: children }]
        });
        docx.Packer.toBlob(doc).then(function(blob) {
            saveAs(blob, 'Sesion_Chat_' + Date.now() + '.docx');
        });
    }

    sendButton.addEventListener('click', sendQuestion);
    questionInput.addEventListener('keypress', e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendQuestion(); } });
    document.getElementById('download-html-session-btn').addEventListener('click', downloadSessionHtml);
    document.getElementById('download-word-session-btn').addEventListener('click', downloadSessionWord);
    function resetEmbeddedChat() {
        chatHistory = [];
        chatDisplay.innerHTML = '';
        questionInput.value = '';
        addMsg('Documento "' + PDF_NAME + '" listo. Solo respondo preguntas sobre este contenido o el tema «' + CHATBOT_THEME + '». ¡Puedes empezar!', 'system');
        questionInput.focus();
    }
    document.getElementById('new-chat-session-btn').addEventListener('click', resetEmbeddedChat);
    addMsg('Documento "' + PDF_NAME + '" listo. Solo respondo preguntas sobre este contenido o el tema «' + CHATBOT_THEME + '». ¡Puedes empezar!', 'system');
    questionInput.focus();
<\/script>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Chatbot_${currentPdfName.replace(/\.pdf$/i, '')}.html`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    }

});
