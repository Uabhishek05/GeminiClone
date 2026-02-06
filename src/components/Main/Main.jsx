import { useEffect, useRef, useState, useContext } from 'react'
import './Main.css'
import {
  Compass,
  Lightbulb,
  MessageCircle,
  Code,
  Image,
  FileText,
  Mic,
  Send
} from 'lucide-react'
import geminiIcon from '../../assets/gemini_icon.png'
import userIcon from '../../assets/user_icon.png'
import { useTheme } from '../../context/ThemeContext'
import { Context } from '../../context/Context.jsx'

const Main = () => {
  const {
    onSent,
    recentPrompt,
    showResults,
    loading,
    resultData,
    setInput,
    input,
    chats,
    currentChatId
  } = useContext(Context)

  const cardRefs = useRef([])
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')
  const fileInputRef = useRef(null)
  const [typedResult, setTypedResult] = useState('')
  const typingTimerRef = useRef(null)
  const resultRef = useRef(null)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
  const inputRef = useRef('')
  const [attachments, setAttachments] = useState([])
  const [attachmentError, setAttachmentError] = useState('')
  const [isDragActive, setIsDragActive] = useState(false)
  const { isDarkMode, toggleTheme } = useTheme()

  const MAX_FILE_SIZE = 10 * 1024 * 1024

  useEffect(() => {
    inputRef.current = input
  }, [input])

  useEffect(() => {
    cardRefs.current.forEach((card) => {
      if (card) {
        card.getBoundingClientRect()
      }
    })

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        finalTranscriptRef.current = inputRef.current
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
        setInput(finalTranscriptRef.current + interimTranscript)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
        finalTranscriptRef.current = ''
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [setInput])

  const buildHtmlChunks = (html) => {
    const chunks = []
    let i = 0
    while (i < html.length) {
      if (html[i] === '<') {
        const closeIndex = html.indexOf('>', i)
        if (closeIndex === -1) {
          chunks.push(html.slice(i))
          break
        }
        chunks.push(html.slice(i, closeIndex + 1))
        i = closeIndex + 1
      } else {
        chunks.push(html[i])
        i += 1
      }
    }
    return chunks
  }

  useEffect(() => {
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current)
      typingTimerRef.current = null
    }

    if (loading || !resultData) {
      setTypedResult(resultData || '')
      return
    }

    const chunks = buildHtmlChunks(resultData)
    let index = 0
    setTypedResult('')

    typingTimerRef.current = setInterval(() => {
      index += 1
      setTypedResult(chunks.slice(0, index).join(''))
      if (index >= chunks.length) {
        clearInterval(typingTimerRef.current)
        typingTimerRef.current = null
      }
    }, 10)

    return () => {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current)
        typingTimerRef.current = null
      }
    }
  }, [resultData, loading])

  useEffect(() => {
    if (!resultRef.current) return
    if (!autoScrollEnabled) return
    resultRef.current.scrollTo({
      top: resultRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }, [typedResult, loading, autoScrollEnabled])

  const handleResultScroll = () => {
    const el = resultRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distanceFromBottom <= 40) {
      if (!autoScrollEnabled) setAutoScrollEnabled(true)
    } else if (autoScrollEnabled) {
      setAutoScrollEnabled(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() || attachments.length > 0) {
      onSent(input, attachments)
      setInput('')
      setAttachments([])
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

  const handleGalleryClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const fileToAttachment = (file) =>
    new Promise((resolve, reject) => {
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error(`File too large: ${file.name}`))
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const result = String(reader.result || '')
        const base64 = result.includes(',') ? result.split(',')[1] : ''
        resolve({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          data: base64,
          previewUrl: file.type.startsWith('image/') ? result : null
        })
      }
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
      reader.readAsDataURL(file)
    })

  const handleFiles = async (files) => {
    setAttachmentError('')
    const list = Array.from(files || [])
    if (list.length === 0) return

    try {
      const processed = await Promise.all(list.map(fileToAttachment))
      setAttachments((prev) => [...prev, ...processed])
    } catch (error) {
      setAttachmentError(error.message || 'Failed to add attachment')
    }
  }

  const handleFileChange = (e) => {
    handleFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = () => {
    setIsDragActive(false)
  }

  const removeAttachment = (id) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id))
  }

  const handleSuggestionClick = (text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setInput(trimmed)
    onSent(trimmed)
  }

  const renderAttachments = (files) => {
    if (!files || files.length === 0) return null
    return (
      <div className="attachment-list in-chat">
        {files.map((file) => (
          <div key={file.id} className="attachment-item">
            {file.previewUrl ? (
              <img src={file.previewUrl} alt={file.name} className="attachment-thumb" />
            ) : (
              <FileText className="attachment-icon" aria-hidden="true" />
            )}
            <div className="attachment-meta">
              <span className="attachment-name">{file.name}</span>
              <span className="attachment-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const currentChat = chats.find((chat) => chat.id === currentChatId) || null
  const messages = currentChat?.messages || []
  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'assistant') return i
    }
    return -1
  })()
  const displayResults = showResults || messages.length > 0
  const sendEnabled = input.trim() || attachments.length > 0

  return (
    <div className={`main ${isDarkMode ? 'dark' : ''}`}>
      <div className='nav'>
        <p>Gemini</p>
        <div className='nav-right'>
          <button
            className={`theme-toggle ${isDarkMode ? 'is-dark' : 'is-light'}`}
            onClick={toggleTheme}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-pressed={isDarkMode}
          >
            <span className="theme-toggle__track">
              <span className="theme-toggle__thumb">
                <span className="theme-toggle__icon">{isDarkMode ? '☾' : '☀︎'}</span>
              </span>
            </span>
          </button>
          <img src={userIcon} alt="User" className="avatar-icon" />
        </div>
      </div>
      <div className='main-container'>
        {!displayResults ? (
          <>
            <div className='greet'>
              <p><span>Hello, Folks</span></p>
              <p>How can I help you today?</p>
            </div>
            <div className="cards">
              <div
                className="card"
                ref={el => cardRefs.current[0] = el}
                onClick={() => handleSuggestionClick('Suggest beautiful places to see on an upcoming road trip')}
                onKeyDown={(e) => e.key === 'Enter' && handleSuggestionClick('Suggest beautiful places to see on an upcoming road trip')}
                role="button"
                tabIndex={0}
              >
                <p>Suggest beautiful places to see on an upcoming road trip</p>
                <Compass className="card-icon compass-icon" aria-hidden="true" />
              </div>
              <div
                className="card"
                ref={el => cardRefs.current[1] = el}
                onClick={() => handleSuggestionClick('Briefly summarize this concept: urban planning')}
                onKeyDown={(e) => e.key === 'Enter' && handleSuggestionClick('Briefly summarize this concept: urban planning')}
                role="button"
                tabIndex={0}
              >
                <p>Briefly summarize this concept: urban planning</p>
                <Lightbulb className="card-icon" aria-hidden="true" />
              </div>
              <div
                className="card"
                ref={el => cardRefs.current[2] = el}
                onClick={() => handleSuggestionClick('Brainstorm team bonding activities for our work retreat')}
                onKeyDown={(e) => e.key === 'Enter' && handleSuggestionClick('Brainstorm team bonding activities for our work retreat')}
                role="button"
                tabIndex={0}
              >
                <p>Brainstorm team bonding activities for our work retreat</p>
                <MessageCircle className="card-icon" aria-hidden="true" />
              </div>
              <div
                className="card"
                ref={el => cardRefs.current[3] = el}
                onClick={() => handleSuggestionClick('Improve the readability of this code')}
                onKeyDown={(e) => e.key === 'Enter' && handleSuggestionClick('Improve the readability of this code')}
                role="button"
                tabIndex={0}
              >
                <p>Improve the readability of this code</p>
                <Code className="card-icon code-icon" aria-hidden="true" />
              </div>
            </div>
          </>
        ) : (
          <div className="result" ref={resultRef} onScroll={handleResultScroll}>
            {displayResults && (
              <>
                <div className="result-title">
                  <img src={userIcon} alt="User" className="result-icon" />
                  <p>{recentPrompt || currentChat?.title || 'Chat'}</p>
                </div>
                <div className="result-data">
                  <img src={geminiIcon} alt="Gemini" className="result-icon" />
                  <div className="result-content">
                    {messages.length === 0 && resultData && (
                      <div dangerouslySetInnerHTML={{ __html: typedResult || resultData }} />
                    )}
                    {messages.map((msg, index) => {
                      if (msg.role === 'assistant') {
                        const isLastAssistant = index === lastAssistantIndex
                        const shouldType = isLastAssistant && resultData && msg.content === resultData && typedResult
                        return (
                          <div
                            key={msg.id}
                            dangerouslySetInnerHTML={{ __html: shouldType ? typedResult : msg.content }}
                          />
                        )
                      }
                      return (
                        <div key={msg.id} className="user-message">
                          {msg.content && <p>{msg.content}</p>}
                          {renderAttachments(msg.attachments)}
                        </div>
                      )
                    })}
                    {loading && (
                      <div className="loader">
                        <hr />
                        <hr />
                        <hr />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        <div className={`search-box-container ${isDragActive ? 'drag-active' : ''}`}>
          <form
            className="search-box"
            onSubmit={handleSubmit}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="text"
              placeholder="Ask Gemini 3"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="search-input"
            />
            <div className="search-icons">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <Image className="search-icon" aria-label="Gallery" onClick={handleGalleryClick} />
              <Mic
                className={`search-icon mic-icon ${isRecording ? 'recording' : ''}`}
                aria-label="Microphone"
                onClick={toggleRecording}
              />
              <button
                type="submit"
                className="send-button"
                aria-label="Send"
                disabled={!sendEnabled}
                style={{ opacity: sendEnabled ? 1 : 0.5, cursor: sendEnabled ? 'pointer' : 'default' }}
              >
                <Send className="search-icon send-icon" aria-hidden="true" />
              </button>
            </div>
          </form>
          {(attachments.length > 0 || attachmentError) && (
            <div className="attachment-bar">
              {attachmentError && <p className="attachment-error">{attachmentError}</p>}
              <div className="attachment-list">
                {attachments.map((file) => (
                  <div key={file.id} className="attachment-item">
                    {file.previewUrl ? (
                      <img src={file.previewUrl} alt={file.name} className="attachment-thumb" />
                    ) : (
                      <FileText className="attachment-icon" aria-hidden="true" />
                    )}
                    <div className="attachment-meta">
                      <span className="attachment-name">{file.name}</span>
                      <span className="attachment-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <button className="attachment-remove" onClick={() => removeAttachment(file.id)} type="button">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <p className='bottom-info'>
          Gemini may display inaccurate info, including about people, so double-check its responses. Your privacy and Gemini Apps
        </p>
      </div>
    </div>
  )
}

export default Main
