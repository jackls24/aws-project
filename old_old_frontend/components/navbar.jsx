"use client"

import { useState } from "react"
import "./navbar.css"

const Navbar = ({ onSearch, onLogin, onLogout, onUpload, isLoggedIn, searchTerm }) => {
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [loginData, setLoginData] = useState({ username: "", password: "" })

  const handleSearchChange = (e) => {
    onSearch(e.target.value)
  }

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    if (loginData.username && loginData.password) {
      onLogin()
      setShowLoginForm(false)
      setLoginData({ username: "", password: "" })
    }
  }

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>📸 Gallery Dashboard</h2>
        </div>

        <div className="navbar-search">
          <div className="search-container">
            <input
              type="text"
              placeholder="Cerca foto o tag..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
              <button className="btn btn-primary" onClick={onUpload}>
                📤 Carica Foto
              </button>
              <button className="btn btn-secondary" onClick={onLogout}>
                👤 Logout
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowLoginForm(true)}>
              🔐 Login
            </button>
          )}
        </div>
      </div>

      {showLoginForm && (
        <div className="login-overlay">
          <div className="login-modal">
            <div className="login-header">
              <h3>Accedi</h3>
              <button className="close-btn" onClick={() => setShowLoginForm(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleLoginSubmit} className="login-form">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={loginData.username}
                onChange={handleLoginChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
              <button type="submit" className="btn btn-primary">
                Accedi
              </button>
            </form>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
