import React, {  useState } from 'react'
import './LoginForm.css'
import {useNavigate} from 'react-router-dom'
import { api } from '../../api/api'

import logo from '../assets/RRSU1 logo.png'

function LoginForm() {
  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")
  const navigate = useNavigate()


  async function handleLogin(e){
    e.preventDefault()
    try{
      const response = await api.post("users/login_user/",{
        username: username,
        password: password
      });

      const data = response.data;

      localStorage.setItem("token", data.token);
      alert("Login Successful");

      setUsername("");
      setPassword("");

      if (data.username === "admin") { 
        navigate("/Dashboard");
      }else if(data.username === "Personnel Recruiter"){
        navigate("/PersonnelDashboard")
      }

    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      alert(`Login failed: ${msg}`);
    }

  }

  return (
    <div className='LoginForm'>
        <form action="" onSubmit={handleLogin}>
          <div className="logo-container">
            <img src={logo} alt="logo RRSU1" height={'80px'} width={'120px'}/>
            <p className='logo-name'>PNP- AMORES</p>
            <hr />
            <div className='title'>
              <h3>Personnel  Login</h3>
              <p>Enter your credentials to access your dashboard.</p>
            </div>
          </div>

          <div className='credentials'>
            <div className='username-container'>
              <label htmlFor="">Username</label>
              <input type="text"
                value={username}
                onChange={(e)=> setUsername(e.target.value)}
              placeholder='Username'
              required
              />
            </div>

            <div className='password-container'>
              <label htmlFor="">Password</label>
              <input type="password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              placeholder='Password'
              required
              />
            </div>

            <button className='login-btn' type='submit'>Login</button>
          </div>
        </form>
    </div>
  )
}

export default LoginForm
