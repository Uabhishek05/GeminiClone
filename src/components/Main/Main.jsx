import React, { useEffect, useRef, useState } from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { useTheme } from '../../context/ThemeContext'
const Main = () => {
  const cardRefs = useRef([])
  const [prompt, setPrompt] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')
  const { isDarkMode, toggleTheme } = useTheme()
  
  useEffect(() => {
    // #region agent log
    cardRefs.current.forEach((card, index) => {
      if (card) {
        const cardRect = card.getBoundingClientRect()
        const icon = card.querySelector('img')
        const text = card.querySelector('p')
        const iconRect = icon?.getBoundingClientRect()
        const textRect = text?.getBoundingClientRect()
        fetch('http://127.0.0.1:7242/ingest/bcd97780-f120-43fe-bcad-5deb90f59b98',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Main.jsx:useEffect',message:'Card dimensions',data:{cardIndex:index,cardHeight:cardRect.height,cardWidth:cardRect.width,iconBottom:iconRect?cardRect.bottom-iconRect.bottom:null,iconRight:iconRect?cardRect.right-iconRect.right:null,textHeight:textRect?.height,iconWidth:iconRect?.width,iconHeight:iconRect?.height},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{})
      }
    })
    // #endregion

    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bcd97780-f120-43fe-bcad-5deb90f59b98',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Main.jsx:useEffect',message:'Speech Recognition initialization',data:{speechRecognitionAvailable:!!SpeechRecognition,webkitAvailable:!!window.webkitSpeechRecognition},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{})
    // #endregion

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bcd97780-f120-43fe-bcad-5deb90f59b98',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Main.jsx:recognition.onstart',message:'Speech recognition started',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{})
        // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bcd97780-f120-43fe-bcad-5deb90f59b98',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Main.jsx:recognition.onresult',message:'Speech recognition result',data:{interimTranscript,finalTranscript,resultCount:event.results.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{})
        // #endregion
        setPrompt(finalTranscriptRef.current + interimTranscript)
      }

      recognition.onerror = (event) => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bcd97780-f120-43fe-bcad-5deb90f59b98',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Main.jsx:recognition.onerror',message:'Speech recognition error',data:{error:event.error,errorMessage:event.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{})
        // #endregion
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }

      recognition.onend = () => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bcd97780-f120-43fe-bcad-5deb90f59b98',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Main.jsx:recognition.onend',message:'Speech recognition ended',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{})
        // #endregion
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bcd97780-f120-43fe-bcad-5deb90f59b98',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Main.jsx:handleSubmit',message:'Prompt submitted',data:{prompt:prompt,promptLength:prompt.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{})
    // #endregion
    if (prompt.trim()) {
      console.log('Prompt:', prompt)
      // TODO: Handle prompt submission (API call, etc.)
      setPrompt('')
    }
  }

  const toggleRecording = () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bcd97780-f120-43fe-bcad-5deb90f59b98',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Main.jsx:toggleRecording',message:'Toggle recording clicked',data:{isRecording,recognitionAvailable:!!recognitionRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{})
    // #endregion
    
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
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
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
                            alt="Send" 
                            className="search-icon send-icon"
                            onClick={handleSubmit}
                            style={{ opacity: prompt.trim() ? 1 : 0.5, cursor: prompt.trim() ? 'pointer' : 'default' }}
                        />
                    </div>
                </form>
            </div>
         </div>
    </div>
  )
}

export default Main