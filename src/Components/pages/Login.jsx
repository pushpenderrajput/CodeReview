import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [step, setStep] = useState(1);
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const requestOtp = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5001/api/auth/request-otp', {
        email: emailOrMobile
      });
      setMsg('OTP sent to your email or mobile');
      setStep(2);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMsg('Failed to send OTP');
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5001/api/auth/verify-otp', {
        email: emailOrMobile,
        otp,
      });

      const { user } = res.data;
      onLogin({
        name: user.name,
        userId: user.id,
        emailOrMobile
      });
      
      navigate('/');
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMsg('Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>CodeReview</h1>
        <p style={styles.subtitle}>Sign in to collaborate on code in real-time</p>
        {msg && <p style={styles.message}>{msg}</p>}

        {step === 1 ? (
          <>
            <input
              type="email"
              value={emailOrMobile}
              onChange={(e) => setEmailOrMobile(e.target.value)}
              placeholder="Enter your email"
              style={styles.input}
            />
            <button onClick={requestOtp} style={styles.button} disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              style={styles.input}
            />
            <button onClick={verifyOtp} style={styles.button} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </>
        )}

        <p style={styles.footer}>
          {step === 2 && (
            <span
              onClick={() => {
                setStep(1);
                setOtp('');
              }}
              style={styles.backLink}
            >
              ← Back
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;

// Styles (inline to keep it self-contained)
const styles = {
  container: {
    height: '100vh',
    background: '#0e1117',
    color: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    background: '#161b22',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 0 0 1px #30363d',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 10px',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#58a6ff',
  },
  subtitle: {
    margin: '0 0 20px',
    fontSize: '14px',
    color: '#8b949e',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '16px',
    borderRadius: '6px',
    border: '1px solid #30363d',
    backgroundColor: '#0d1117',
    color: '#c9d1d9',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#238636',
    color: '#ffffff',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
  },
  message: {
    marginBottom: '16px',
    fontSize: '13px',
    color: '#ffa657',
  },
  footer: {
    marginTop: '10px',
    fontSize: '12px',
    color: '#8b949e',
  },
  backLink: {
    cursor: 'pointer',
    color: '#58a6ff',
    textDecoration: 'underline',
  },
};
