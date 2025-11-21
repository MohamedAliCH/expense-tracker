import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from 'lucide-react';

const DateRangePicker = ({ onDateChange }) => {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());

  const handleApply = () => {
    onDateChange({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    });
  };

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      background: 'rgba(255,255,255,0.1)',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      <Calendar size={20} color="#9ca3af" />
      
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          dateFormat="MMM d, yyyy"
          customInput={
            <input style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              padding: '8px 12px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }} />
          }
        />
        
        <span style={{ color: '#9ca3af' }}>to</span>
        
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          dateFormat="MMM d, yyyy"
          customInput={
            <input style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              padding: '8px 12px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px'
            }} />
          }
        />
        
        <button
          onClick={handleApply}
          style={{
            background: '#a855f7',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px'
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default DateRangePicker;