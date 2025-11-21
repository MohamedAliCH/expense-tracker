/**
 * LOGIN COMPONENT
 * 
 * Login form with:
 * - Email input
 * - Password input
 * - Remember me checkbox
 * - Link to register
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn } from 'lucide-react';

const Login = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: '#1e293b',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '400px',
        width: '100%',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <LogIn size={48} color="#a855f7" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            Welcome Back
          </h2>
          <p style={{ color: '#9ca3af' }}>Login to your expense tracker</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.2)',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            color: '#f87171'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#d1d5db', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#d1d5db', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(to right, #a855f7, #ec4899)',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '16px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              style={{
                background: 'none',
                border: 'none',
                color: '#a855f7',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Register
            </button>
          </p>

          <div style={{
            background: 'rgba(168,85,247,0.1)',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '8px'
          }}>
            <p style={{ color: '#d1d5db', fontSize: '14px', marginBottom: '4px', fontWeight: '500' }}>
              Demo Account:
            </p>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>
              Email: john@example.com<br />
              Password: password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;