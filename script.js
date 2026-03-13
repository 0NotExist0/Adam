const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const colabUrlInput = document.getElementById("colab-url");

function addMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
}

async function sendMessage() {
    const message = userInput.value.trim();
    let colabBaseUrl = colabUrlInput.value.trim();
    
    if (!message) return;
    
    // Controllo di sicurezza sull'URL
    if (!colabBaseUrl) {
        alert("2eMkg0CJkwISMyEsKWeK1rjMagN_82sNqwucA9GQGECM7Hwam");
        return;
    }
    
    // Rimuoviamo la barra finale dall'URL se l'utente l'ha messa per sbaglio
    if (colabBaseUrl.endsWith('/')) {
        colabBaseUrl = colabBaseUrl.slice(0, -1);
    }

    const API_URL = `${colabBaseUrl}/chat`;

    addMessage(message, "user");
    userInput.value = "";
    
    sendBtn.disabled = true;
    userInput.disabled = true;
    
    const loadingMsg = addMessage("La GPU sta calcolando...", "bot");
    loadingMsg.classList.add("loading");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaggio: message
            })
        });

        const result = await response.json();
        chatBox.removeChild(loadingMsg);

        if (!response.ok) {
            addMessage(`⚠️ Errore dal server Colab: ${response.status}`, "bot");
            return;
        }
        
        if (result.risposta) {
            addMessage(result.risposta, "bot");
        } else {
            addMessage("Errore: risposta vuota dal modello.", "bot");
        }

    } catch (error) {
        console.error("Errore di Rete:", error);
        if (chatBox.contains(loadingMsg)) {
            chatBox.removeChild(loadingMsg);
        }
        addMessage("🔌 Connessione fallita. Assicurati che lo script su Colab stia ancora girando e che l'URL sia corretto.", "bot");
    } finally {
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});
