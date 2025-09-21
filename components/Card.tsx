
import React, { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

const Card: React.FC<CardProps> = ({ children, onClick, className = '', disabled = false }) => {
    const baseClasses = 'group bg-surface/70 backdrop-blur p-6 rounded-xl shadow-lg transition-all duration-300 relative border border-slate-700/50';
    const interactiveClasses = 'hover:shadow-primary/20 hover:border-primary hover:-translate-y-1 cursor-pointer';
    const disabledClasses = 'opacity-60 cursor-not-allowed';

    return (
        <div
            onClick={!disabled ? onClick : undefined}
            className={`${baseClasses} ${disabled ? disabledClasses : interactiveClasses} ${className}`}
        >
            {children}
        </div>
    );
};

export default Card;