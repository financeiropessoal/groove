import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  children?: React.ReactNode; // For action buttons
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, children }) => {
  return (
    <div className="text-center py-12 px-6 bg-gray-800/50 rounded-lg">
      <div className="text-5xl text-gray-500 mb-4">
        <i className={`fas ${icon}`}></i>
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-400 mt-2 max-w-md mx-auto">{message}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
};

export default EmptyState;
