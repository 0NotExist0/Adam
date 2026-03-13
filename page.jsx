'use client';
import { useState } from 'react';

export default function ChatVercel() {
  const [inputMessage, setInputMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Metodo completo per inviare il messaggio e ricevere la risposta
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Aggiungiamo il messaggio dell'utente alla chat
    const newHistory = [...chatHistory, { role: 'user', content: inputMessage }];
    setChatHistory(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Invia la richiesta al nostro server Vercel (che a sua volta chiamerà Phi-4)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage })
      });

      const data = await response.json();

      // Aggiungiamo la risposta dell'IA alla chat
      setChatHistory([...newHistory, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error("Errore durante la comunicazione:", error);
      setChatHistory([...newHistory, { role: 'assistant', content: "Scusa, c'è stato un errore di connessione." }]);
    } finally {
      setIsLoading(false);
    }
  };
 
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>🧠 Chat con Phi-4</h1>
      
      {/* Box della cronologia chat */}
      <div style={{ height: '60vh', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f9f9f9' }}>
        {chatHistory.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>Inizia la conversazione!</p>}
        {chatHistory.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', marginBottom: '10px' }}>
            <span style={{ 
              display: 'inline-block', 
              padding: '10px 15px', 
              borderRadius: '15px', 
              backgroundColor: msg.role === 'user' ? '#0070f3' : '#e0e0e0',
              color: msg.role === 'user' ? '#fff' : '#000'
            }}>
              {msg.content}
            </span>
          </div>
        ))}
        {isLoading && <div style={{ textAlign: 'left' }}><span style={{ display: 'inline-block', padding: '10px', backgroundColor: '#e0e0e0', borderRadius: '15px' }}>Scrivendo...</span></div>}
      </div>

      {/* Form di input */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          value={inputMessage} 
          onChange={(e) => setInputMessage(e.target.value)} 
          placeholder="Chiedi qualcosa a Phi-4..." 
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#0070f3', color: 'white', cursor: 'pointer' }}>
          Invia
        </button>
      </form>
    </div>
  );
}
