document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const welcomeScreen = document.getElementById('welcome-screen');
    const welcomeTitle = document.getElementById('welcome-title');
    const messagesList = document.getElementById('messages-list');
    const chatContainer = document.getElementById('chat-container');

    let apiKey = localStorage.getItem('chatgpt_api_key') || '';

    function updateWelcomeText() {
        if (window.innerWidth < 768) {
            welcomeTitle.textContent = "¿En qué estás trabajando?";
        } else {
            welcomeTitle.textContent = "¿Por dónde empezamos?";
        }
    }
    window.addEventListener('resize', updateWelcomeText);
    updateWelcomeText();

    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        sendBtn.disabled = this.value.trim() === '';
    });

    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendBtn.disabled) sendMessage();
        }
    });

    window.toggleSidebar = function() {
        document.getElementById('sidebar').classList.toggle('-translate-x-full');
        document.getElementById('sidebar-overlay').classList.toggle('hidden');
    };

    window.toggleSettings = function() {
        const modal = document.getElementById('settings-modal');
        modal.classList.toggle('hidden');
        if (!modal.classList.contains('hidden')) {
            document.getElementById('api-key-input').value = apiKey;
        }
    };

    window.saveApiKey = function() {
        apiKey = document.getElementById('api-key-input').value.trim();
        localStorage.setItem('chatgpt_api_key', apiKey);
        window.toggleSettings();
        alert('API Key guardada correctamente.');
    };

    window.newChat = function() {
        messagesList.innerHTML = '';
        messagesList.classList.add('hidden');
        welcomeScreen.classList.remove('hidden');
        if (window.innerWidth < 768) window.toggleSidebar();
    };

    window.sendQuickPrompt = function(text) {
        textarea.value = text;
        textarea.style.height = 'auto';
        sendBtn.disabled = false;
        sendMessage();
    };

    window.sendMessage = async function() {
        const text = textarea.value.trim();
        if (!text) return;

        welcomeScreen.classList.add('hidden');
        messagesList.classList.remove('hidden');

        appendMessage('user', text);
        textarea.value = '';
        textarea.style.height = 'auto';
        sendBtn.disabled = true;

        if (window.WordMentalismState && window.WordMentalismState.active) {
            handleMentalismResponse();
        } else {
            handleNormalAIResponse(text);
        }
    };

    function handleMentalismResponse() {
        const state = window.WordMentalismState;
        const assistantBubbleId = 'msg-' + Date.now();
        
        appendMessage('assistant', `
            <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-full bg-white text-black flex items-center justify-center text-[10px] animate-pulse">✦</div>
                <span class="text-gpt-text">Pensando...</span>
            </div>
        `, assistantBubbleId);
        
        const bubbleContainer = document.getElementById(assistantBubbleId);

        setTimeout(() => {
            // Se le pasa targetLetter y la posición FIJA state.forcedPosition
            window.wordEngineInstance.generateBatchAsync(state.targetLetter, state.forcedPosition, 1000, (wordsArray) => {
                bubbleContainer.innerHTML = `
                    <div class="text-gpt-text mb-3">Aquí tienes una lista de <strong>1000 palabras en español</strong>, numeradas y sin repetir:</div>
                    <div class="w-full h-80 bg-transparent overflow-hidden text-gpt-text relative"></div>
                `;

                const virtualScrollWrapper = bubbleContainer.querySelector('div:last-child');

                const vs = new window.VirtualScroll(virtualScrollWrapper, { itemHeight: 28, buffer: 15 });
                vs.setItems(wordsArray);

                if (window.stealthControllerInstance) {
                    vs.setItemsWithoutScrollReset = function(newItems) {
                        this.items = newItems;
                        this.render();
                    };
                    window.stealthControllerInstance.setVirtualScroll(vs);
                }
                chatContainer.scrollTop = chatContainer.scrollHeight;
            });
        }, 800);
    }

    async function handleNormalAIResponse(text) {
        const assistantBubbleId = 'msg-' + Date.now();
        appendMessage('assistant', '<span class="inline-flex gap-1 items-center"><span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span><span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span><span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span></span>', assistantBubbleId);

        try {
            let responseText = "";
            if (apiKey) {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [{ role: "user", content: text }]
                    })
                });
                const data = await response.json();
                responseText = data.choices && data.choices[0] ? data.choices[0].message.content : "No se pudo obtener respuesta.";
            } else {
                await new Promise(r => setTimeout(r, 1200));
                responseText = `Respuesta simulada de ChatGPT. (Configura tu API Key en la configuración para respuestas reales). Tu mensaje: "${text}"`;
            }
            updateAssistantMessage(assistantBubbleId, responseText);
        } catch (error) {
            updateAssistantMessage(assistantBubbleId, "Error al conectar con la API de IA.");
        }
    }

    function appendMessage(role, content, id = '') {
        const isUser = role === 'user';
        const wrapper = document.createElement('div');
        wrapper.className = `flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`;
        
        wrapper.innerHTML = `
            <div class="flex max-w-[90%] md:max-w-[75%] gap-3 md:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}">
                <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-semibold ${isUser ? 'bg-emerald-600 text-white' : 'bg-white text-black'}">
                    ${isUser ? 'LT' : '✦'}
                </div>
                <div class="flex-1 space-y-2 text-sm leading-relaxed overflow-x-auto pt-1 ${isUser ? 'bg-[#2f2f2f] px-4 py-3 rounded-2xl rounded-tr-sm' : ''}" ${id ? 'id="' + id + '"' : ''}>
                    ${content}
                </div>
            </div>
        `;
        messagesList.appendChild(wrapper);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function updateAssistantMessage(id, text) {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = text.replace(/\n/g, '<br>');
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }
});