/**
 * TOP CATEGORIES COMPONENT
 * 
 * Displays the top 5 spending categories with:
 * - Colored dot indicator
 * - Category name
 * - Progress bar showing percentage of total spending
 * - Dollar amount spent
 * 
 * Props:
 * - categories: array - Sorted array of expense categories with totals
 * - totalExpense: number - Total expenses for calculating percentages
 */

import React from 'react';

const TopCategories = ({ categories, totalExpense }) => {
  return (
    <div style={{ 
      background: 'rgba(255,255,255,0.1)', 
      backdropFilter: 'blur(10px)', 
      borderRadius: '16px', 
      padding: '24px', 
      border: '1px solid rgba(255,255,255,0.2)' 
    }}>
      <h3 style={{ 
        fontSize: '20px', 
        fontWeight: 'bold', 
        color: 'white', 
        marginBottom: '16px' 
      }}>
        Top Spending Categories
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Show only top 5 categories */}
        {categories.slice(0, 5).map(cat => {
          // Calculate percentage of total spending
          const percentage = (cat.total / totalExpense) * 100;
          
          return (
            <div key={cat.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between' 
            }}>
              {/* Left side: Color dot and name */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                flex: 1 
              }}>
                {/* Colored circle indicator */}
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: cat.color 
                }} />
                
                <span style={{ color: 'white', fontWeight: '500' }}>
                  {cat.name}
                </span>
              </div>
              
              {/* Right side: Progress bar and amount */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                flex: 1 
              }}>
                {/* Progress bar background */}
                <div style={{ 
                  flex: 1, 
                  background: 'rgba(255,255,255,0.1)', 
                  borderRadius: '9999px', 
                  height: '8px',
                  overflow: 'hidden'
                }}>
                  {/* Progress bar fill - width based on percentage */}
                  <div style={{ 
                    height: '8px', 
                    borderRadius: '9999px', 
                    width: `${percentage}%`, 
                    backgroundColor: cat.color, 
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                
                {/* Dollar amount */}
                <span style={{ 
                  color: '#f87171', 
                  fontWeight: 'bold', 
                  minWidth: '96px', 
                  textAlign: 'right' 
                }}>
                  ${cat.total.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopCategories;