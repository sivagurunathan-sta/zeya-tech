import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = true, 
  shadow = 'lg',
  padding = 'p-6',
  rounded = 'rounded-xl',
  background = 'bg-white',
  ...props 
}) => {
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    none: 'shadow-none'
  };

  const cardClasses = `
    ${background} 
    ${rounded} 
    ${shadowClasses[shadow]} 
    ${padding} 
    ${hover ? 'hover:shadow-xl transition-shadow duration-300' : ''} 
    ${className}
  `.trim();

  if (hover) {
    return (
      <motion.div
        className={cardClasses}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;