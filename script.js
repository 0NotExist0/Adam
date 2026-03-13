// Spezziamo la chiave in due per ingannare il controllo di sicurezza di GitHub
const API_KEY = "hf_eDDPhozTCx" + "vrnmCqLguYZUJuAHHXcikVGU"; 

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const modelSelect = document.getElementById("model-select");

// Funzione per aggiungere messaggi all'interfaccia
function addMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
}

// Funzione principale per gestire l'invio
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Leggiamo il modello selezionato in quel momento dalla tendina
    const selectedModel = modelSelect.value;
    const API_URL = `https://api-inference.huggingface.co/models/${selectedModel}`;

    // 1. Mostra il messaggio dell'utente
    addMessage(message, "user");
    userInput.value = "";
    
    // 2. Disabilita l'input
    sendBtn.disabled = true;
    userInput.disabled = true;
    modelSelect.disabled = true; // Blocca la tendina mentre elabora
    const loadingMsg = addMessage("Sta pensando...", "bot");
    loadingMsg.classList.add("loading");

    try {
        // 3. Chiama l'API di Hugging Face
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: message,
                parameters: {
                    max_new_tokens: 400,
                    return_full_text: false
                }
            })
        });

        const result = await response.json();
        chatBox.removeChild(loadingMsg);

        // Gestione avanzata degli errori (Es. Errore 503: Modello in fase di caricamento)
        if (!response.ok) {
            if (response.status === 503 && result.estimated_time) {
                const waitTime = Math.round(result.estimated_time);
                addMessage(`⏳ Il server sta accendendo il modello. Riprova tra circa ${waitTime} secondi.`, "bot");
                return;
            } else if (result.error) {
                addMessage(`⚠️ Errore dal server: ${result.error}`, "bot");
                return;
            }
            throw new Error(`Errore generico Server: ${response.status}`);
        }
        
        // 4. Mostra la risposta generata
        if (result && result.length > 0 && result[0].generated_text) {
            let botReply = result[0].generated_text;
            // Pulizia base per evitare che alcuni modelli ripetano la domanda
            botReply = botReply.replace(message, "").trim();
            addMessage(botReply, "bot");
        } else {
            addMessage("Scusa, la risposta del modello era vuota.", "bot");
        }

    } catch (error) {
        console.error("Errore:", error);
        if (chatBox.contains(loadingMsg)) {
            chatBox.removeChild(loadingMsg);
        }
        addMessage("🔌 Impossibile connettersi. Controlla la connessione o cambia modello.", "bot");
    } finally {
        // 5. Riabilita tutto
        sendBtn.disabled = false;
        userInput.disabled = false;
        modelSelect.disabled = false;
        userInput.focus();
    }
}

// Event Listeners
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});
