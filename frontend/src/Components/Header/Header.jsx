import React from 'react'
import './Header.css'
import logoAcc from '../../assets/RRSU1 logo.png'

function Header() {
  // Function to decode JWT token
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid token:", e);
    return null;
  }
};

  // Get user info from token
const token = localStorage.getItem('token');

let username = 'Guest';

if (token) {
  const payload = parseJwt(token);

  if (payload) {
    username = payload.username || 'User';
  }
}

const isAdmin = username === "admin";

  return (
    <header className='Header'>
      <div className='label-dashboard'>
        <h4>Dashboard</h4>
        <p>Home / Dashboard</p>
      </div>

      <div className='greetings-account'>
        <h4>Welcome, {isAdmin ? "Administrator" : `Personnel ${username}`}</h4>
        <img src={logoAcc} alt="acc logo" className="h-8 w-auto object-contain" />
      </div>

    </header>
  )
}

export default Header
