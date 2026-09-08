// Audio alert system voor kritieke temperatuur waarschuwingen

let audioContext: AudioContext | null = null;

// Initialize audio context (lazy initialization)
function getAudioContext(): AudioContext | null {
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }
    return audioContext;
  } catch (error) {
    console.warn("Web Audio API niet ondersteund:", error);
    return null;
  }
}

/**
 * Speel een alarm beep af (3x beep patroon)
 * Gebruikt Web Audio API voor cross-browser compatibiliteit
 */
export function playAlertBeep(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // 3 beeps met tussenpozen
    const beepTimes = [0, 0.3, 0.6]; // Seconden offset

    beepTimes.forEach((offset) => {
      // Oscillator voor de toon
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Configuratie
      oscillator.type = "square"; // Vierkante golf voor scherp alarm geluid
      oscillator.frequency.value = 880; // A5 note (880 Hz)

      // Volume envelope (fade out voor natuurlijker geluid)
      const startTime = ctx.currentTime + offset;
      gainNode.gain.setValueAtTime(0.15, startTime); // Start volume (15%)
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2); // Fade out

      // Start en stop
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.22); // 220ms beep duration
    });
  } catch (error) {
    // Fail silently - audio is niet kritisch voor functionaliteit
    console.warn("Kan alarm geluid niet afspelen:", error);
  }
}

/**
 * Speel een subtiele notification sound (voor bewegingsdetectie)
 */
export function playNotificationSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Hogere, kortere toon voor notification
    oscillator.type = "sine";
    oscillator.frequency.value = 1200; // Hogere frequentie

    const startTime = ctx.currentTime;
    gainNode.gain.setValueAtTime(0.1, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.12);
  } catch (error) {
    console.warn("Kan notification geluid niet afspelen:", error);
  }
}

/**
 * Cleanup audio context (optioneel, bij component unmount)
 */
export function cleanupAudio(): void {
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}
