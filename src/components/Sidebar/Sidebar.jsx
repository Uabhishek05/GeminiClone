import React, { useState } from 'react'
import './Sidebar.css'
import {assets} from '../../assets/assets'
import { useTheme } from '../../context/ThemeContext'

const Sidebar = () => {
const [extended, setExtended] = useState(false)
const { isDarkMode } = useTheme()


  return (
    <div className={`sidebar ${isDarkMode ? 'dark' : ''}`}>
        <div className='top'>
            <img onClick={()=>setExtended(prev=>!prev)} className='menu sidebar-icon' src={assets.menu_icon} alt=""/>
            <div className='new-chat'>
                <img src={assets.plus_icon} alt="" className="sidebar-icon"/>
                {extended?<p>New Chat</p>:null}
            </div>
            {extended?
                <div className='recent'>
                    <p className='recent-title'>Recent</p>
                    <div className='recent-entry'>
                        <img src={assets.message_icon} alt="" className="sidebar-icon"/>
                        <p>What is react...</p>
                    </div>
                </div>
                :null
                }
            </div>
            <div className='bottom'>
                <div className='bottom-item recent-entry'>
                <img src={assets.question_icon} alt="" className="sidebar-icon"/>
                {extended?<p>Help</p>:null}
                </div>
                <div className='bottom-item recent-entry'>
                <img src={assets.history_icon} alt="" className="sidebar-icon"/>
                {extended?<p>Activity</p>:null}
                </div>
                <div className='bottom-item recent-entry'>
                <img src={assets.setting_icon} alt="" className="sidebar-icon"/>
                {extended?<p>Settings</p>:null}
                </div>
            </div>
    </div>
  )
}

export default Sidebar