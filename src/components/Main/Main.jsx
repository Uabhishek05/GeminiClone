import { useEffect, useRef, useState, useContext} from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { useTheme } from '../../context/ThemeContext'
import { Context } from '../../context/Context.jsx'

const Main = () => {
  // const contextRef = useContext(Context); // Removed unused variable
 
  const { onSent, recentPrompt, showResults, loading, resultData, setInput, input } = useContext(Context) // Destructure only the used values from Context
  const cardRefs = useRef([])
  const [prompt, setPrompt] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')
  const { isDarkMode, toggleTheme } = useTheme()
  // Removed unused destructured values from Context
  
  useEffect(() => {
    cardRefs.current.forEach((card, index) => {
      if (card) {
        const cardRect = card.getBoundingClientRect()
        const icon = card.querySelector('img')
        const text = card.querySelector('p')
        const iconRect = icon?.getBoundingClientRect()
        const textRect = text?.getBoundingClientRect()
      }
    })

    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        finalTranscriptRef.current = prompt
        setIsRecording(true)
      }

      recognition.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
            finalTranscriptRef.current += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }
        setPrompt(finalTranscriptRef.current + interimTranscript)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onSent(input)
      setInput('')
      setPrompt('')
    }
  }

  const toggleRecording = () => {
    
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
  }

  return (
    <div className={`main ${isDarkMode ? 'dark' : ''}`}>
         <div className='nav'>
            <p>Gemini</p>
            <div className='nav-right'>
              <button className='theme-toggle' onClick={toggleTheme} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <img src={assets.user_icon} alt=""/>
            </div>
         </div>
         <div className= "main-container">
            <div className='greet'>
                <p><span>Hello, Folks</span></p>
                <p>How can I help you today?</p>
            </div>
            <div className="cards">
                <div className="card" ref={el => cardRefs.current[0] = el}>
                    <p>Suggest beautiful places to see on an upcoming road trip</p>
                    <img src={assets.compass_icon} alt="" className="card-icon compass-icon" />
                </div>
                <div className="card" ref={el => cardRefs.current[1] = el}>
                    <p>Briefly summarize this concept: urban planning</p>
                    <img src={assets.bulb_icon} alt="" />
                </div>
                <div className="card" ref={el => cardRefs.current[2] = el}>
                    <p>Brainstorm team bonding activities for our work retreat</p>
                    <img src={assets.message_icon} alt="" />
                </div>
                <div className="card" ref={el => cardRefs.current[3] = el}>
                    <p>Improve the readability of this code</p>
                    <img src={assets.code_icon} alt="" className="card-icon code-icon" />
                </div>
            </div>
            <div className="search-box-container">
                <form className="search-box" onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        placeholder="Ask Gemini" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="search-input"
                    />
                    <div className="search-icons">
                        <img src={assets.gallery_icon} alt="Gallery" className="search-icon" />
                        <img 
                            src={assets.mic_icon} 
                            alt="Microphone" 
                            className={`search-icon mic-icon ${isRecording ? 'recording' : ''}`}
                            onClick={toggleRecording}
                        />
                        <img 
                            src={assets.send_icon} 
                            alt="Sent" 
                            className="search-icon send-icon"
                            onClick={() => onSent(input)}
                            style={{ opacity: input.trim() ? 1 : 0.5, cursor: input.trim() ? 'pointer' : 'default' }}
                        />
                    </div>
                </form>
            </div>
            <p className='bottom-info'>
                    Gemini may display inaccurate info, including about people, so double-check its responses. Your privacy and Gemini Apps
                </p>
         </div>
    </div>
  )
}

export default Main