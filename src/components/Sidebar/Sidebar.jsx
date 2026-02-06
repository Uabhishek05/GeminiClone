import React, { useState, useContext, useRef } from 'react'
import './Sidebar.css'
import {
  Menu,
  Plus,
  MessageSquare,
  HelpCircle,
  History,
  Settings
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { Context } from '../../context/Context.jsx'

const Sidebar = () => {
  const [extended, setExtended] = useState(false)
  const [highlightRecent, setHighlightRecent] = useState(false)
  const recentRef = useRef(null)
  const { isDarkMode } = useTheme()
  const { chats, currentChatId, newChat, selectChat } = useContext(Context)

  return (
    <div className={`sidebar ${isDarkMode ? 'dark' : ''} ${extended ? 'extended' : ''}`}>
      <div className='top'>
        <Menu onClick={() => setExtended(prev => !prev)} className='menu sidebar-icon' aria-label="Menu" />
        <div className='new-chat' onClick={newChat} role="button" tabIndex={0}>
          <Plus className="sidebar-icon" aria-hidden="true" />
          {extended ? <p>New Chat</p> : null}
        </div>
        {extended ? (
          <div className='recent' ref={recentRef}>
            <p className={`recent-title ${highlightRecent ? 'highlight' : ''}`}>Recent</p>
            {chats.length === 0 ? (
              <div className='recent-entry'>
                <MessageSquare className="sidebar-icon" aria-hidden="true" />
                <p>No chats yet</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`recent-entry ${currentChatId === chat.id ? 'active' : ''}`}
                  onClick={() => selectChat(chat.id)}
                  role="button"
                  tabIndex={0}
                >
                  <MessageSquare className="sidebar-icon" aria-hidden="true" />
                  <p>{chat.title || 'New chat'}</p>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
      <div className='bottom'>
        <div className='bottom-item recent-entry'>
          <HelpCircle className="sidebar-icon" aria-hidden="true" />
          {extended ? <p>Help</p> : null}
        </div>
        <div
          className='bottom-item recent-entry'
          onClick={() => {
            if (!extended) setExtended(true)
            setTimeout(() => {
              recentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              setHighlightRecent(true)
              setTimeout(() => setHighlightRecent(false), 1200)
            }, 0)
          }}
          role="button"
          tabIndex={0}
        >
          <History className="sidebar-icon" aria-hidden="true" />
          {extended ? <p>History</p> : null}
        </div>
        <div className='bottom-item recent-entry'>
          <Settings className="sidebar-icon" aria-hidden="true" />
          {extended ? <p>Settings</p> : null}
        </div>
      </div>
    </div>
  )
}

export default Sidebar
