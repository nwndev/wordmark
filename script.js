let copiedWordsHistory = []; // Array to store copied words

async function fetchRandomWord() {
    const response = await fetch('https://random-word-api.herokuapp.com/word');
    if (!response.ok) {
        throw new Error("Failed to fetch a random word");
    }
    const data = await response.json();
    return data[0]; 
}

async function fetchDefinition(word) {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!response.ok) {
        throw new Error("No Definitions Found");
    }
    const data = await response.json();
    return data[0].meanings[0];
}

function pop(){
    var sound = new Audio('./sounds/pop.mp3');
    sound.play();
}

function shuffle(){
    var sound = new Audio('./sounds/shuffle.mp3')
    sound.play();
}

function truncatePartOfSpeech(partOfSpeech) {
    const abbreviations = {
        "noun": "n.",
        "verb": "v.",
        "adjective": "adj.",
        "adverb": "adv.",
        "pronoun": "pron.",
        "preposition": "prep.",
        "conjunction": "conj.",
        "interjection": "interj."
    };
    return abbreviations[partOfSpeech] || partOfSpeech; 
}


function formatDefinition(definition) {
    const sentences = definition.split(/(?<=[.!?])\s+/); 
    let formattedDefinition = '';
    
    for (let i = 0; i < sentences.length; i++) {
        formattedDefinition += sentences[i].trim() + ' ';
        
        if ((i + 1) % 4 === 0) {
            formattedDefinition += '<br>'; 
        }
    }
    
    return formattedDefinition.trim(); 
}

async function displayWordAndDefinition() {
    let validWordFound = false;
    let word, meaning;

    while (!validWordFound) {
        try {
            word = await fetchRandomWord();
            meaning = await fetchDefinition(word);
            validWordFound = true; 
        } catch (error) {
            console.error(error); 
            
        }
    }

    
    const truncatedPartOfSpeech = truncatePartOfSpeech(meaning.partOfSpeech);
    const formattedDefinition = formatDefinition(meaning.definitions[0].definition);
    document.getElementById("word").innerText = `“ ${word} ”`;
    document.getElementById("definition").innerHTML = `(${truncatedPartOfSpeech}) ${formattedDefinition}`;
}


function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message; 
    toast.classList.add("show"); 

    
    setTimeout(() => {
        toast.classList.remove("show"); 
    }, 3000);
}

// Function to show the modal
function showModal() {
    const modal = document.getElementById("historyModal");
    modal.style.display = "block"; // Show the modal
    const modalHistoryList = document.getElementById("modalHistoryList");
    modalHistoryList.innerHTML = copiedWordsHistory.map(word => `<li>${word}</li>`).join(''); // Populate the modal with copied words

    // Trigger reflow to restart animation
    modal.querySelector('.modal-content').style.animation = 'none'; // Reset animation
    modal.querySelector('.modal-content').offsetHeight; // Trigger reflow
    modal.querySelector('.modal-content').style.animation = ''; // Reapply animation
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById("historyModal");
    modal.style.display = "none"; // Hide the modal
}

// Event listener for the History button
document.getElementById("historyButton").addEventListener("click", showModal);

// Event listener for the close button in the modal
document.querySelector(".close-button").addEventListener("click", closeModal);

// Event listener for clicking outside the modal to close it
window.addEventListener("click", (event) => {
    const modal = document.getElementById("historyModal");
    if (event.target === modal) {
        closeModal();
    }
});

// Update the copyWordToClipboard function to store copied words in history
function copyWordToClipboard() {
    const wordWithQuotes = document.getElementById("word").innerText;
    const word = wordWithQuotes.replace(/“|”/g, '').trim();
    
    navigator.clipboard.writeText(word).then(() => {
        showToast(`Copied "${word}" to clipboard!`);
        copiedWordsHistory.push(word); // Add the copied word to history
        // Limit the history to the most recent 4 words
        if (copiedWordsHistory.length > 4) {
            copiedWordsHistory.shift(); // Remove the oldest word
        }
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showToast('Failed to copy the word.');
    });
}

document.getElementById("randomButton").addEventListener("click", displayWordAndDefinition);
document.getElementById("saveButton").addEventListener("click", copyWordToClipboard); 


window.onload = displayWordAndDefinition; 