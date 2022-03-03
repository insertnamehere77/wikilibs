
function getRandomElem(arr: any[]) {
    return arr[Math.floor(arr.length * Math.random())]
};

function speak(text: string): SpeechSynthesisUtterance {
    const utterThis = new SpeechSynthesisUtterance(text);
    const speechSynth = window.speechSynthesis;
    const voices = speechSynth.getVoices()
        .filter(voice => voice.lang === 'en');
    utterThis.voice = getRandomElem(voices);
    speechSynth.speak(utterThis);

    return utterThis;
}

function pause() {
    window.speechSynthesis.pause();
}

function resume() {
    window.speechSynthesis.resume();
}

function clearQueue() {
    window.speechSynthesis.cancel();
}


export {
    speak,
    pause,
    resume,
    clearQueue
}