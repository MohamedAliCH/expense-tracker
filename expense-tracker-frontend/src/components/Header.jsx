import React, { useState } from 'react';
import { DollarSign, RefreshCw, PlusCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ onRefresh, onAddTransaction }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '32px', 
      flexWrap: 'wrap', 
      gap: '16px' 
    }}>
      <div>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '8px' 
        }}>
          <DollarSign size={40} />
          Expense Tracker Pro
        </h1>
        <p style={{ color: '#9ca3af' }}>
          Welcome back, {user?.name}!
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button
          onClick={onRefresh}
          style={{ 
            background: 'rgba(255,255,255,0.1)', 
            color: 'white', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            border: 'none', 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Refresh data"
        >
          <RefreshCw size={20} />
        </button>
        
        <button
          onClick={onAddTransaction}
          style={{ 
            background: 'linear-gradient(to right, #a855f7, #ec4899)', 
            color: 'white', 
            padding: '12px 24px', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            border: 'none', 
            cursor: 'pointer', 
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
            fontWeight: '500'
          }}
        >
          <PlusCircle size={20} />
          Add Transaction
        </button>

        {/* User Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              padding: '12px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <User size={20} />
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '60px',
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              padding: '8px',
              minWidth: '200px',
              zIndex: 1000
            }}>
              <div style={{
                padding: '12px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                marginBottom: '8px'
              }}>
                <p style={{ color: 'white', fontWeight: '500', marginBottom: '4px' }}>
                  {user?.name}
                </p>
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>
                  {user?.email}
                </p>
              </div>

              <button
                onClick={logout}
                style={{
                  width: '100%',
                  background: 'rgba(239,68,68,0.2)',
                  color: '#f87171',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '500'
                }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;