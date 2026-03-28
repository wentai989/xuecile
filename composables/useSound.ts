let sharedAudioCtx: any = null

const getAudioContext = () => {
  if (typeof window === 'undefined') return null
  try {
    if (!sharedAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        sharedAudioCtx = new AudioContextClass()
      }
    }
    // 处理浏览器自动播放策略导致的 suspended 状态
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume()
    }
    return sharedAudioCtx
  } catch (e) {
    return null
  }
}

export const useSound = () => {
  // We use simple short beep/boop/click synthesized sounds via Web Audio API to avoid needing external audio assets
  
  const playTypingSound = () => {
    try {
      const audioCtx = getAudioContext()
      if (!audioCtx) return
      
      // To simulate a mechanical keyboard click:
      // We use a short burst of noise passed through a bandpass filter
      const bufferSize = audioCtx.sampleRate * 0.02 // 20ms of noise
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
      
      const noise = audioCtx.createBufferSource()
      noise.buffer = buffer
      
      // Filter to make it sound "clicky" rather than just static hiss
      const filter = audioCtx.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = 4000 + Math.random() * 1000 // slightly randomize frequency
      filter.Q.value = 1.0

      const gainNode = audioCtx.createGain()
      // Sharp decay
      gainNode.gain.setValueAtTime(1, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.02)
      
      noise.connect(filter)
      filter.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      
      noise.start()
    } catch (e) {
      // Ignore if AudioContext is blocked by browser auto-play policy initially
    }
  }

  const playSuccessSound = () => {
    try {
      const audioCtx = getAudioContext()
      if (!audioCtx) return
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      
      oscillator.type = 'triangle'
      // Play a cheerful "ding-ding" major third interval
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1) // E5
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4)
      
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      
      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 0.4)
    } catch (e) {}
  }

  const playErrorSound = () => {
    try {
      const audioCtx = getAudioContext()
      if (!audioCtx) return
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      
      oscillator.type = 'sawtooth'
      // Play a low "buzz" error sound
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2)
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2)
      
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      
      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 0.2)
    } catch (e) {}
  }

  return {
    playTypingSound,
    playSuccessSound,
    playErrorSound
  }
}
