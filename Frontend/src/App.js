import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';

const register = 'http://localhost:4000/register';
const login = 'http://localhost:4000/login';

function App() {
  return (
    <div className='container'>
      <Router>
        <div className='box'>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

function Login() {
  return (
    <div>
      <Main actionurl={login} usernameLabel='Enter your Username' passwordLabel='Enter your Password' />
      <p>New User?</p><br />
      <Link to="/register">Register</Link>
    </div>
  );
}

function Main({ actionurl, usernameLabel, passwordLabel }) {
  return (
    <div className="main">
      <form action={actionurl} method="POST">
        <label>{usernameLabel}</label><br />
        <input type="text" name='userid' required /> <br />
        <label>{passwordLabel}</label> <br />
        <input type="password" name='password' required /> <br />
        <input type="submit" value='Submit' />
      </form>
    </div>
  )
}

function Register() {
  return (
    <div>
      <h2>Register</h2>
      <Main actionurl={register} usernameLabel='Create Your Username' passwordLabel='Create Your Password' />
    </div>
  )
}

export default App;
