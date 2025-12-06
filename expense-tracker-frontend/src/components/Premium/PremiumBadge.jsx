import React from 'react';
import { Crown } from 'lucide-react';
import './PremiumBadge.css';

// Small badge component to show premium status in the Header
const PremiumBadge = () => {
  return (
    <div className="premium-badge">
      <Crown size={14} />
      <span>PRO</span>
    </div>
  );
};

export default PremiumBadge;