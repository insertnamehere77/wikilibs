
function getRandomElem(arr: any[]) {
    return arr[Math.floor(arr.length * Math.random())]
};

function speak(text: string) {
    const speechSynth = window.speechSynthesis;
    const utterThis = new SpeechSynthesisUtterance(text);
    const voices = speechSynth.getVoices();
    utterThis.voice = getRandomElem(voices);
    speechSynth.speak(utterThis);
}

export {
    speak
}