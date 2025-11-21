/**
 * REGISTER COMPONENT
 * 
 * Registration form with:
 * - Name input
 * - Email input
 * - Password input
 * - Confirm password input
 * - Link to login
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.password_confirmation
    );

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
          <UserPlus size={48} color="#a855f7" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            Create Account
          </h2>
          <p style={{ color: '#9ca3af' }}>Sign up to start tracking expenses</p>
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
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: 'white',
                fontSize: '16px'
              }}
              placeholder="John Doe"
            />
          </div>

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

          <div>
            <label style={{ display: 'block', color: '#d1d5db', marginBottom: '8px' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={formData.password_confirmation}
              onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>

          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#a855f7',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;