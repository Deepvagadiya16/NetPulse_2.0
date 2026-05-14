import React from 'react';
import './Card.css';

const Card = ({ title, value, icon: Icon, trend, children, className = '' }) => {
  return (
    <div className={`glass-card card-wrapper animate-fade-in ${className}`}>
      {(title || value) && (
        <div className="card-header flex justify-between items-center mb-4">
          <div>
            {title && <h3 className="card-title text-muted">{title}</h3>}
            {value && <div className="card-value mt-4">{value}</div>}
            {trend && (
              <div className={`card-trend mt-2 ${trend > 0 ? 'text-success' : 'text-danger'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
              </div>
            )}
          </div>
          {Icon && (
            <div className="card-icon-wrapper">
              <Icon size={24} className="text-primary" />
            </div>
          )}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;
