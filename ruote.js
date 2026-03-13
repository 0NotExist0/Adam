import { NextResponse } from 'next/server';

// Metodo completo per gestire la richiesta POST su Vercel e interrogare l'API esterna
export async function POST(req) {
  try {
    const { message } = await req.json();

    // Chiamata all'API Serverless di Hugging Face per Phi-4
    const hfResponse = await fetch("https://api-inference.huggingface.co/models/microsoft/phi-4", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`, 
        "Content-Type": "application/json" 
      },
      // Formattiamo il prompt in modo molto semplice
      body: JSON.stringify({ 
        inputs: `User: ${message}\nAssistant:`,
        parameters: { max_new_tokens: 250, return_full_text: false }
      }),
    });

    if (!hfResponse.ok) {
      throw new Error(`Errore API: ${hfResponse.status}`);
    }

    const result = await hfResponse.json();
    
    // Estraiamo il testo generato
    let replyText = "Non ho saputo generare una risposta.";
    if (result && result.length > 0 && result[0].generated_text) {
        replyText = result[0].generated_text.trim();
    }

    return NextResponse.json({ reply: replyText });
    
  } catch (error) {
    console.error("Errore Backend Vercel:", error);
    return NextResponse.json({ reply: "Si è verificato un errore nel server." }, { status: 500 });
  }
}
