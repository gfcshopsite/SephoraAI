const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const toggleSpeechButton = document.getElementById('toggleSpeechButton');
let qaPairs = [];
let isSpeechEnabled = true;

// Carica il file CSV
fetch('domande-risposte.csv')
    .then(response => response.text())
    .then(data => {
        const rows = data.split('\n').slice(1); // Ignora l'intestazione
        qaPairs = rows.map(row => {
            const [domanda, risposta] = row.split(',').map(str => str.replace(/^"|"$/g, ''));
            return { domanda, risposta };
        });
    });

function findAnswer(question) {
    const match = qaPairs.find(pair => pair.domanda.toLowerCase() === question.toLowerCase());
    if (match) {
        let risposta = match.risposta;
        
        // Sostituisci i placeholder con l'ora e la data attuali
        if (risposta.includes('[ORA_ATTUALE]')) {
            const now = new Date();
            risposta = risposta.replace('[ORA_ATTUALE]', now.toLocaleTimeString('it-IT'));
        }
        if (risposta.includes('[GIORNO_ATTUALE]')) {
            const options = { weekday: 'long' };
            const now = new Date();
            risposta = risposta.replace('[GIORNO_ATTUALE]', now.toLocaleDateString('it-IT', options));
        }
        if (risposta.includes('[DATA_ATTUALE]')) {
            const now = new Date();
            risposta = risposta.replace('[DATA_ATTUALE]', now.toLocaleDateString('it-IT'));
        }
        
        return risposta;
    }
    return "Mi dispiace, non ho una risposta per questa domanda. Puoi provare a riformularla?";
}

function addMessage(sender, message) {
    const messageElement = document.createElement('p');
    messageElement.textContent = `${sender}: ${message}`;
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function speak(text) {
    if ('speechSynthesis' in window && isSpeechEnabled) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'it-IT';
        speechSynthesis.speak(utterance);
    }
}

function handleUserInput() {
    const userQuestion = userInput.value.trim();
    if (userQuestion) {
        addMessage('Tu', userQuestion);
        const answer = findAnswer(userQuestion);
        addMessage('Sephora', answer);
        speak(answer);
        userInput.value = '';
    }
}

sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserInput();
    }
});

toggleSpeechButton.addEventListener('click', () => {
    isSpeechEnabled = !isSpeechEnabled;
    toggleSpeechButton.textContent = isSpeechEnabled ? 'Disattiva Voce' : 'Attiva Voce';
    addMessage('Sistema', isSpeechEnabled ? 'Sintesi vocale attivata.' : 'Sintesi vocale disattivata.');
});

// Messaggio di benvenuto
addMessage('Sephora', 'Ciao! Sono Sephora, il tuo assistente virtuale. Come posso aiutarti oggi?');