document.addEventListener('DOMContentLoaded', () => {
    // --- Elementos del DOM ---
    const viewContainer = document.getElementById('view-container');
    const mainView = document.getElementById('main-view');
    const cartButton = document.getElementById('cart-button');
    const cartModal = document.getElementById('cart-modal');
    const closeCartButton = document.getElementById('close-cart-button');
    const cartCount = document.getElementById('cart-count');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmptyMessage = document.getElementById('cart-empty');
    const checkoutFormContainer = document.getElementById('checkout-form-container');
    const finalizePurchaseButton = document.getElementById('finalize-purchase-button');
    const fullNameInput = document.getElementById('fullName');
    const birthDateInput = document.getElementById('birthDate');
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('email-error');
    const paymentModal = document.getElementById('payment-modal');
    const paymentLoading = document.getElementById('payment-loading');
    const paymentSuccess = document.getElementById('payment-success');
    const purchaseSummaryContainer = document.getElementById('purchase-summary');
    const closePaymentSuccessButton = document.getElementById('close-payment-success');

    // --- IA ---
    const aiPopup = document.getElementById('ai-assistant-popup');
    const micButton = document.getElementById('ai-mic-button');
    const messageBubble = document.getElementById('ai-message-bubble');
    const messageText = document.getElementById('ai-message-text');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    let isListening = false;
    let conversationActive = false;
    let micTimeout; // NUEVO: Para manejar el apagado automático del micrófono

    // --- Inicialización de reconocimiento de voz ---
    if (SpeechRecognition) {
        // Si el navegador soporta SpeechRecognition, lo inicializamos
        recognition = new SpeechRecognition();
        recognition.lang = 'es-ES'; // Español de España
        recognition.continuous = false; // Solo una frase por activación
        recognition.interimResults = false; // No mostrar resultados intermedios
    } else {
        // Si no está disponible, ocultamos el botón de micrófono
        micButton.style.display = 'none';
    }

    // --- Base de Conocimiento y Estado ---
    const policies = [
        { id: 'policy-family', name: 'Póliza Familiar Integral', price: 45, keywords: ['familia', 'hijos', 'hogar', 'protegerlos', 'integral', 'familiar'], description: 'es nuestra protección más completa para ti y tus seres queridos', benefits: ['cubre gastos educativos', 'asegura la estabilidad de tu hogar', 'ofrece tranquilidad financiera'] },
        { id: 'policy-individual', name: 'Póliza Individual Futuro', price: 25, keywords: ['individual', 'joven', 'soltero', 'ahorro', 'futuro', 'personal', 'mis metas', 'para mi solo'], description: 'es una inversión inteligente que combina protección con ahorro', benefits: ['ideal para tus metas a largo plazo', 'flexible y asequible', 'acumula valor con el tiempo'] },
        { id: 'policy-senior', name: 'Póliza Legado Dorado', price: 60, keywords: ['legado', 'mayor', 'jubilación', 'retiro', 'herencia', 'senior', 'adulto mayor', 'tercera edad'], description: 'está diseñada para asegurar tu legado y proteger a tu familia de cargas financieras', benefits: ['cubre gastos finales', 'planificación de herencia sencilla', 'protección vitalicia'] },
        { id: 'policy-investment', name: 'Póliza Inversión Plus', price: 100, keywords: ['inversión', 'invertir', 'crecimiento', 'dinero', 'rendimiento', 'plus'], description: 'es un vehículo de inversión que busca un crecimiento de capital superior', benefits: ['alto potencial de crecimiento', 'beneficios fiscales', 'protección base de vida'] },
        { id: 'policy-critical', name: 'Póliza Cobertura Crítica', price: 35, keywords: ['enfermedad', 'crítica', 'cáncer', 'infarto', 'salud', 'apoyo', 'diagnóstico'], description: 'te entrega un pago único al ser diagnosticado con una enfermedad grave', benefits: ['pago único y rápido', 'libre disponibilidad del dinero', 'complemento a tu seguro de salud'] },
        { id: 'policy-auto-civil', name: 'Seguro RC Básico', price: 15, keywords: ['auto', 'coche', 'carro', 'vehículo', 'responsabilidad civil', 'básico', 'obligatorio', 'terceros', 'rc'], description: 'es la cobertura esencial para cumplir con la ley y proteger a terceros de daños que puedas ocasionar', benefits: ['cumplimiento legal', 'protección económica ante reclamos', 'asistencia legal básica'] },
        { id: 'policy-auto-limited', name: 'Cobertura Limitada', price: 28, keywords: ['auto', 'coche', 'carro', 'vehículo', 'limitada', 'robo'], description: 'te protege contra robo total del vehículo y cubre los daños a terceros', benefits: ['protección contra robo', 'cubre daños a otros vehículos', 'asistencia en carretera'] },
        { id: 'policy-auto-full', name: 'Cobertura Amplia', price: 50, keywords: ['auto', 'coche', 'carro', 'vehículo', 'amplia', 'todo riesgo', 'choque', 'full'], description: 'es la máxima tranquilidad al volante, cubriendo daños a tu propio auto, robo total y daños a terceros', benefits: ['cubre colisiones y volcaduras', 'protección total contra robo', 'gastos médicos a ocupantes'] },
    ];
    let cart = [];
    let conversationHistory = [];
    let conversationState = {
        isFillingForm: false,
        nextFieldToFill: null, // 'name', 'dob', 'email'
        purchaseAfterFormFill: false,
    };
    let finalTranscript = '';
    let initialGreetingSpoken = false;

    // --- Funciones ---
    const showView = (viewId) => {
        const currentActive = viewContainer.querySelector('.view.active');
        if (currentActive) currentActive.classList.remove('active');
        const nextView = document.getElementById(viewId);
        if (nextView) {
            setTimeout(() => {
                nextView.classList.add('active');
                window.scrollTo(0, 0);
            }, 50);
        } else {
            mainView.classList.add('active');
        }
    };

    const playSound = (note = "E5", duration = "16n") => {
        if (typeof Tone !== 'undefined' && Tone.context.state !== 'running') {
            Tone.start();
        }
        const synth = new Tone.Synth().toDestination();
        synth.triggerAttackRelease(note, duration, Tone.now());
    };

    const animateCart = () => {
        playSound("E5", "16n");
        cartButton.classList.add('cart-animating');
        setTimeout(() => cartButton.classList.remove('cart-animating'), 800);
    };

    const updateCartUI = () => {
        cartCount.textContent = cart.length;
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartEmptyMessage.classList.remove('hidden');
            checkoutFormContainer.classList.add('hidden');
            finalizePurchaseButton.classList.add('hidden');
        } else {
            cartEmptyMessage.classList.add('hidden');
            checkoutFormContainer.classList.remove('hidden');
            finalizePurchaseButton.classList.remove('hidden');
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'flex justify-between items-center';
                itemElement.innerHTML = `
                            <div>
                                <p class="font-semibold">${item.name}</p>
                                <p class="text-sm text-gray-500">$${item.price}/mes</p>
                            </div>
                            <button class="text-red-500 hover:text-red-700 text-sm font-semibold" data-id="${item.id}">Quitar</button>
                        `;
                cartItemsContainer.appendChild(itemElement);
            });
        }
    };

    const simulatePayment = async () => {
        cartModal.classList.add('hidden');
        paymentModal.classList.add('flex');
        paymentModal.classList.remove('hidden');
        paymentLoading.classList.remove('hidden');
        paymentSuccess.classList.add('hidden');

        const summaryPrompt = `Genera un breve y cálido resumen de despedida para ${fullNameInput.value} que acaba de comprar las siguientes pólizas: ${cart.map(p => p.name).join(', ')}. Menciona que su futuro y el de sus seres queridos ahora está más seguro y que los documentos serán enviados a ${emailInput.value}.`;
        const summaryResponse = await getSimpleApiResponse(summaryPrompt);

        purchaseSummaryContainer.innerHTML = `<p class="font-semibold">Resumen para ${fullNameInput.value}:</p><p>${summaryResponse}</p>`;

        setTimeout(() => {
            paymentLoading.classList.add('hidden');
            paymentSuccess.classList.remove('hidden');
            playSound("C6", "8n");
            cart = [];
            updateCartUI();
            fullNameInput.value = '';
            birthDateInput.value = '';
            emailInput.value = '';
            conversationState.purchaseAfterFormFill = false;
        }, 3000);
    };

    const resetPolicyEffects = () => {
        document.querySelectorAll('.policy-card').forEach(card => {
            card.classList.remove('zoomed-in', 'highlight-policy');
        });
    };

    const speak = (text, callback) => {
        if (isListening) recognition.stop();
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.1;

        utterance.onend = () => {
            resetPolicyEffects();
            if (callback) callback();
        };

        messageText.textContent = text;
        messageBubble.classList.remove('hidden');
        window.speechSynthesis.speak(utterance);
    };

    const getCurrentViewedPolicyId = () => {
        const activeDetailView = document.querySelector('.view.active[id^="details-"]');
        if (activeDetailView) {
            return activeDetailView.id.replace('details-', '');
        }
        return null;
    };

    const getSimpleApiResponse = async (prompt) => {
        const payload = { contents: [{ parts: [{ text: prompt }] }] };
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) return "Hemos enviado los detalles de tu compra a tu correo. ¡Gracias por confiar en nosotros!";
            const result = await response.json();
            return result.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Error en API simple:", error);
            return "Hemos enviado los detalles de tu compra a tu correo. ¡Gracias por confiar en nosotros!";
        }
    };

    const getApiResponse = async (userPrompt) => {

        messageText.textContent = "Pensando...";

        // Obtener el contexto actual de la vista de póliza activa
        const currentPolicyId = getCurrentViewedPolicyId();
        // Si el usuario está viendo una póliza específica, se le informa a la IA para que pueda responder con mayor precisión sobre "esta póliza"
        const contextMessage = currentPolicyId ? `El usuario está viendo la página de detalles de la póliza con ID: '${currentPolicyId}'. Si pregunta 'esta póliza' o algo similar, se refiere a ella.` : '';

        /*
         * systemPrompt: Instrucciones completas para el asistente IA
         * - Se le proporciona la base de conocimiento de todas las pólizas disponibles
         * - Se le envía el historial de la conversación para mantener contexto y coherencia
         * - Se le indica el contexto actual (póliza activa) para respuestas contextuales
         * - Se definen reglas de acción para que la IA identifique la intención del usuario
         *   y actúe en consecuencia (ej: compra, recomendación, explicación de términos, etc.)
         * - Se exige que la respuesta sea únicamente un objeto JSON para facilitar el procesamiento
         */
        const systemPrompt = `Eres 'Vida', un asistente de seguros amigable y experto para 'Vida Segura'. Tu objetivo es ayudar a los usuarios a encontrar la póliza perfecta y facilitar la compra. Eres cálido, empático y claro. Debes responder ÚNICAMENTE con un objeto JSON. No incluyas texto fuera del JSON.

                Base de conocimiento de las pólizas:
                ${JSON.stringify(policies, null, 2)}

                Historial de la conversación:
                ${JSON.stringify(conversationHistory)}
                
                Contexto Actual: ${contextMessage}

                Reglas de Acción:
                - Si el usuario quiere comprar o contratar una póliza (ej: "quiero comprar la póliza familiar"), la intención es DIRECT_PURCHASE. Identifica el policyId.
                - Si el usuario pide tu opinión o pregunta sobre "esta póliza" (y el contexto lo indica), la intención es GET_CURRENT_POLICY_OPINION.
                - Si el usuario quiere quitar o eliminar una póliza del carrito (ej: "quita la póliza de auto"), la intención es REMOVE_FROM_CART. Identifica el policyId.
                - Si el usuario quiere cambiar una póliza por otra (ej: "cambia la individual por la familiar"), la intención es CHANGE_POLICY. Identifica ambos policyIds en el array 'policyIds', primero la que se añade y segundo la que se quita.
                - Si pide detalles, la intención es GET_DETAILS.
                - Si pide una recomendación, la intención es RECOMMEND.
                - Si quiere agregar al carrito, la intención es ADD_TO_CART.
                - Si quiere llenar el formulario, la intención es START_FORM_FILLING.
                - Si está proveyendo datos para el formulario, la intención es FILL_FORM_DATA. Extrae la información.
                - Si quiere volver al inicio, la intención es NAVIGATE_HOME.
                - Si saluda, la intención es GREETING.
                - Si se despide, la intención es END_CONVERSATION.
                - Si hace preguntas sobre términos de seguros (ej: "¿qué es un deducible?", "¿qué significa prima?"), la intención es EXPLAIN_INSURANCE_TERM. Proporciona una explicación clara y sencilla del término.
                - Si no entiendes, la intención es UNKNOWN.
                `;

        const payload = {
            contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nNueva petición del usuario: "${userPrompt}"` }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        intent: { type: "STRING", enum: ["RECOMMEND", "GET_DETAILS", "ADD_TO_CART", "REMOVE_FROM_CART", "CHANGE_POLICY", "DIRECT_PURCHASE", "GET_CURRENT_POLICY_OPINION", "START_FORM_FILLING", "FILL_FORM_DATA", "NAVIGATE_HOME", "GREETING", "END_CONVERSATION", "UNKNOWN"] },
                        policyIds: { type: "ARRAY", items: { type: "STRING" } },
                        speechResponse: { type: "STRING" },
                        fullName: { type: "STRING" },
                        birthDate: { type: "STRING", description: "Formato YYYY-MM-DD" },
                        email: { type: "STRING" }
                    },
                    required: ["intent", "speechResponse"]
                }
            }
        };

        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(`Error de la API: ${response.statusText}`);

            const result = await response.json();
            if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0]) {
                const jsonText = result.candidates[0].content.parts[0].text;
                return JSON.parse(jsonText);
            } else {
                throw new Error("Respuesta inesperada de la API.");
            }
        } catch (error) {
            console.error("Error al llamar a la API de Gemini:", error);
            return { intent: "UNKNOWN", speechResponse: "Lo siento, estoy teniendo problemas para conectarme. Por favor, inténtalo más tarde." };
        }
    };

    const navigateToPolicy = (policyId) => {
        const cardId = `${policyId}-card`;
        const policyElement = document.getElementById(cardId);
        if (policyElement) {
            showView('main-view');
            setTimeout(() => {
                resetPolicyEffects();
                policyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                policyElement.classList.add('highlight-policy', 'zoomed-in');
            }, 200);
        }
    };

    const processSpeech = async (transcript) => {

        // --- FLUJO DE CAPTURA Y PROCESAMIENTO DE VOZ ---
        // Esta función se llama cuando el usuario termina de hablar por el micrófono
        // El parámetro 'transcript' contiene el texto reconocido por el sistema de voz
        if (!transcript) return;

        // Si el usuario está llenando el formulario por voz, se le indica a la IA el campo actual
        let userPrompt = transcript;
        if (conversationState.isFillingForm) {
            userPrompt = `El usuario está llenando el campo '${conversationState.nextFieldToFill}' y dice: "${transcript}"`;
        }

        // Se envía el texto reconocido a la IA para obtener la intención y respuesta
        const aiResponse = await getApiResponse(userPrompt);
        console.log("Respuesta de la IA:", aiResponse);
        // Se guarda el intercambio en el historial de conversación para mantener contexto
        conversationHistory.push({ user: transcript, assistant: aiResponse.speechResponse });

        // Se extraen los datos relevantes de la respuesta de la IA
        const { intent, policyIds, speechResponse, fullName, birthDate, email } = aiResponse;
        const policyId = policyIds && policyIds.length > 0 ? policyIds[0] : null;

        // --- FLUJO DE LLENADO DE FORMULARIO POR VOZ ---
        // Si la IA detecta que el usuario está proporcionando datos del formulario, se actualizan los campos
        if (conversationState.isFillingForm && intent === 'FILL_FORM_DATA') {
            if (fullName) fullNameInput.value = fullName;
            if (birthDate) birthDateInput.value = birthDate;
            if (email) emailInput.value = email;

            let nextPrompt = "";

            // Se determina el siguiente campo a solicitar según el estado actual
            switch (conversationState.nextFieldToFill) {
                case 'name':
                    if (fullNameInput.value) {
                        conversationState.nextFieldToFill = 'dob';
                        nextPrompt = "¿Cuál es tu fecha de nacimiento?";
                    } else {
                        nextPrompt = speechResponse || "No entendí el nombre, ¿puedes repetirlo por favor?";
                    }
                    break;
                case 'dob':
                    if (birthDateInput.value) {
                        conversationState.nextFieldToFill = 'email';
                        nextPrompt = "Gracias. Ahora, ¿cuál es tu correo electrónico?";
                    } else {
                        nextPrompt = speechResponse || "No pude registrar la fecha, ¿podrías decirla de nuevo?";
                    }
                    break;
                case 'email':
                    if (emailInput.value) {
                        conversationState.isFillingForm = false;
                        conversationState.nextFieldToFill = null;
                        nextPrompt = "¡Perfecto! Todos los datos están completos.";

                        if (conversationState.purchaseAfterFormFill) {
                            nextPrompt += " Procediendo con la compra.";
                            setTimeout(() => simulatePayment(), 1500);
                        }
                    } else {
                        nextPrompt = speechResponse || "No capté el correo electrónico. ¿Me lo repites?";
                    }
                    break;
            }

            // Se reproduce la respuesta y, si el formulario no está completo, se reactiva el micrófono
            speak(nextPrompt, () => {
                if (conversationState.isFillingForm) {
                    recognition.start();
                }
            });
            return;
        }


        switch (intent) {
            case 'DIRECT_PURCHASE':
                const policyToBuy = policies.find(p => p.id === policyId);
                if (policyToBuy) {
                    if (!cart.find(item => item.id === policyId)) {
                        cart.push(policyToBuy);
                        updateCartUI();
                        animateCart();
                    }
                    speak(speechResponse || `He añadido ${policyToBuy.name} al carrito. Ahora, procederé con la compra.`, () => {
                        if (fullNameInput.value && birthDateInput.value && emailInput.value) {
                            simulatePayment();
                        } else {
                            conversationState.purchaseAfterFormFill = true;
                            conversationState.isFillingForm = true;
                            conversationState.nextFieldToFill = 'name';
                            speak("Para continuar, necesito algunos datos. ¿Cuál es tu nombre completo?", () => recognition.start());
                        }
                    });
                } else {
                    speak("No encontré la póliza que quieres comprar. ¿Puedes repetirla?");
                }
                break;

            case 'GET_CURRENT_POLICY_OPINION':
                const currentPolicyId = getCurrentViewedPolicyId();
                if (currentPolicyId) {
                    navigateToPolicy(currentPolicyId);
                }
                speak(speechResponse, () => { if (conversationActive) recognition.start(); });
                break;

            case 'REMOVE_FROM_CART':
                const policyToRemove = policies.find(p => p.id === policyId);
                if (policyToRemove && cart.find(item => item.id === policyId)) {
                    cart = cart.filter(item => item.id !== policyId);
                    updateCartUI();
                    playSound("A4", "16n");
                    speak(speechResponse || `He quitado ${policyToRemove.name} de tu carrito.`, () => { if (conversationActive) recognition.start(); });
                } else {
                    speak(speechResponse || "No encontré esa póliza en tu carrito. ¿Hay algo más que pueda hacer?", () => { if (conversationActive) recognition.start(); });
                }
                break;

            case 'CHANGE_POLICY':
                const policyToAdd = policies.find(p => p.id === policyIds[0]);
                const policyToSwap = policies.find(p => p.id === policyIds[1]);
                if (policyToAdd && policyToSwap && cart.find(item => item.id === policyToSwap.id)) {
                    cart = cart.filter(item => item.id !== policyToSwap.id);
                    cart.push(policyToAdd);
                    updateCartUI();
                    animateCart();
                    speak(speechResponse || `Listo, he cambiado ${policyToSwap.name} por ${policyToAdd.name}.`, () => { if (conversationActive) recognition.start(); });
                } else {
                    speak(speechResponse || "No pude realizar el cambio. Asegúrate de que la póliza a quitar esté en el carrito.", () => { if (conversationActive) recognition.start(); });
                }
                break;

            case 'START_FORM_FILLING':
                conversationState.isFillingForm = true;
                conversationState.nextFieldToFill = 'name';
                speak(speechResponse || "Claro, te ayudaré. ¿Cuál es tu nombre completo?", () => recognition.start());
                break;

            case 'RECOMMEND':
            case 'SHOW_POLICY_SUMMARY':
                navigateToPolicy(policyId);
                speak(speechResponse, () => { if (conversationActive) recognition.start(); });
                break;

            case 'GET_DETAILS':
                showView(`details-${policyId}`);
                speak(speechResponse, () => { if (conversationActive) recognition.start(); });
                break;

            case 'NAVIGATE_HOME':
                showView('main-view');
                speak(speechResponse, () => { if (conversationActive) recognition.start(); });
                break;

            case 'ADD_TO_CART':
                const policy = policies.find(p => p.id === policyId);
                if (policy && !cart.find(item => item.id === policyId)) {
                    cart.push(policy);
                    updateCartUI();
                    animateCart();
                }
                speak(speechResponse, () => { if (conversationActive) recognition.start(); });
                break;

            case 'END_CONVERSATION':
                conversationActive = false;
                speak(speechResponse, () => {
                    setTimeout(() => messageBubble.classList.add('hidden'), 2000);
                });
                break;

            case 'GREETING':
            default:
                speak(speechResponse || "Lo siento, no he entendido bien. ¿Puedes repetirlo?", () => { if (conversationActive) recognition.start(); });
                break;
        }
    };

    emailInput.addEventListener('input', function () {
        if (emailInput.validity.valid || emailInput.value === '') {
            emailError.classList.add('hidden');
        } else {
            emailError.classList.remove('hidden');
        }
    });

    // --- Event Listeners ---
    // Navegación principal entre vistas
    document.getElementById('home-link').addEventListener('click', (e) => { e.preventDefault(); showView('main-view'); });
    document.getElementById('about-us-link').addEventListener('click', (e) => { e.preventDefault(); showView('about-us-view'); });

    document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = new URL(link.href).hash;
        if (targetId === '#policies') {
            showView('main-view');
            setTimeout(() => document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' }), 200);
        }
    }));
    document.querySelectorAll('.view-details-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showView(`details-${e.target.dataset.policyId}`);
        });
    });
    document.querySelectorAll('.back-to-main').forEach(button => {
        button.addEventListener('click', () => showView('main-view'));
    });

    // Abrir modal del carrito al hacer clic en el icono
    cartButton.addEventListener('click', () => {
        updateCartUI();
        cartModal.classList.remove('hidden');
        cartModal.classList.add('flex');
    });
    // Cerrar modal del carrito
    closeCartButton.addEventListener('click', () => {
        cartModal.classList.add('hidden');
        cartModal.classList.remove('flex');
    });
    // Permite cerrar el modal haciendo clic fuera del contenido
    cartModal.addEventListener('click', (e) => {
        if (e.target.id === 'cart-modal') {
            cartModal.classList.add('hidden');
            cartModal.classList.remove('flex');
        }
    });

    // Finalizar compra: valida datos y simula el pago
    finalizePurchaseButton.addEventListener('click', () => {
        if (cart.length === 0) {
            speak("Tu carrito está vacío.");
            return;
        }
        if (fullNameInput.value && birthDateInput.value && emailInput.value) {
            simulatePayment();
        } else {
            speak("Por favor, completa todos los datos del formulario para continuar.");
        }
    });

    // Cerrar modal de pago exitoso y despedida
    closePaymentSuccessButton.addEventListener('click', () => {
        paymentModal.classList.add('hidden');
        paymentModal.classList.remove('flex');
        conversationActive = false;
        speak("Ha sido un placer ayudarte. ¡Que tengas un buen día!");
    });

    // Quitar póliza del carrito desde el resumen
    cartItemsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            cart = cart.filter(item => item.id !== e.target.dataset.id);
            updateCartUI();
        }
    });

    // Agregar póliza al carrito desde botón en la UI
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const policyId = e.target.dataset.policyId;
            const policy = policies.find(p => p.id === policyId);
            if (policy && !cart.find(item => item.id === policyId)) {
                cart.push(policy);
                updateCartUI();
                animateCart();
                speak(`${policy.name} ha sido añadida a tu carrito.`);
            } else if (policy) {
                speak(`${policy.name} ya está en tu carrito.`);
            }
        });
    });

    // Activar/desactivar el reconocimiento de voz al presionar el micrófono
    micButton.addEventListener('click', () => {
        if (!recognition) return;

        if (isListening) {
            conversationActive = false;
            recognition.stop();
            messageText.textContent = "Micrófono apagado";
            messageBubble.classList.remove('hidden');
        } else {
            conversationActive = true;
            recognition.start();
        }
    });

    // --- Reconocimiento de voz: gestión de eventos y temporizador de inactividad ---
    if (recognition) {
        recognition.onstart = () => {
            isListening = true;
            micButton.classList.add('is-listening');
            messageBubble.classList.remove('hidden');
            messageText.textContent = "Escuchando...";
            finalTranscript = '';

            // Iniciar temporizador para apagar el micrófono si no hay habla
            clearTimeout(micTimeout);
            micTimeout = setTimeout(() => {
                if (isListening) {
                    console.log("No se detectó habla. Apagando micrófono.");
                    recognition.stop();
                    conversationActive = false;
                }
            }, 5000); // 5 segundos de inactividad
        };

        recognition.onresult = (event) => {
            clearTimeout(micTimeout); // Se detectó habla, cancelar el temporizador
            finalTranscript = event.results[0][0].transcript;
        };

        recognition.onend = () => {
            isListening = false;
            micButton.classList.remove('is-listening');
            clearTimeout(micTimeout); // Asegurarse de limpiar el temporizador

            if (finalTranscript) {
                processSpeech(finalTranscript);
            } else if (!conversationActive) {
                messageText.textContent = "Micrófono apagado";
                setTimeout(() => messageBubble.classList.add('hidden'), 2000);
            }
        };

        recognition.onerror = (event) => {
            isListening = false;
            micButton.classList.remove('is-listening');
            clearTimeout(micTimeout);

            // Solo manejar errores reales, no 'no-speech' que es manejado por nuestro temporizador
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
                console.error("Error de reconocimiento:", event.error);
                speak("Hubo un error con el micrófono. Por favor, intenta de nuevo.");
                conversationActive = false;
            }
        };
    }

    window.addEventListener('load', () => {
        updateCartUI();
        setTimeout(() => {
            aiPopup.classList.remove('opacity-0', 'translate-y-10');
            if (!initialGreetingSpoken) {
                setTimeout(() => {
                    speak("Hola, soy Vida. Si necesitas ayuda, presiona el botón del micrófono.", () => {
                        setTimeout(() => messageBubble.classList.add('hidden'), 2000);
                    });
                    initialGreetingSpoken = true;
                }, 500);
            }
        }, 1000);
    });
});