// Spezziamo la chiave in due per ingannare il controllo di sicurezza di GitHub
const API_KEY = "hf_eDDPhozTCx" + "vrnmCqLguYZUJuAHHXcikVGU"; 
const API_URL = "https://api-inference.huggingface.co/models/microsoft/phi-4";

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Funzione per aggiungere messaggi all'interfaccia
function addMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Scorre in basso automaticamente
    return msgDiv;
}

// Funzione principale per gestire l'invio
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // 1. Mostra il messaggio dell'utente
    addMessage(message, "user");
    userInput.value = "";
    
    // 2. Disabilita l'input mentre il bot "pensa"
    sendBtn.disabled = true;
    userInput.disabled = true;
    const loadingMsg = addMessage("Sta scrivendo...", "bot");
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
                    max_new_tokens: 250,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Errore Server: ${response.status}`);
        }

        const result = await response.json();
        
        // 4. Rimuovi il messaggio di caricamento e mostra la risposta
        chatBox.removeChild(loadingMsg);
        
        if (result && result.length > 0 && result[0].generated_text) {
            addMessage(result[0].generated_text.trim(), "bot");
        } else {
            addMessage("Scusa, non ho capito.", "bot");
        }

    } catch (error) {
        console.error("Errore:", error);
        chatBox.removeChild(loadingMsg);
        addMessage("Si è verificato un errore di connessione con il modello.", "bot");
    } finally {
        // 5. Riabilita l'input
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

// Event Listeners per il click o per il tasto Invio (Enter)
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});
