import React from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
const Main = () => {
  return (
    <div className='main'>
         <div className='nav'>
            <p>Gemini</p>
            <img src={assets.user_icon} alt=""/>
         </div>
    </div>
  )
}

export default Main