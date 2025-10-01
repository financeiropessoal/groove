import React, { useState, useEffect, useRef } from 'react';

interface SlidingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const SlidingPanel: React.FC<SlidingPanelProps> = ({ isOpen, onClose, children }) => {
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsAnimatingOut(false);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimatingOut(true);
    }
  }, [isOpen]);

  const onAnimationEnd = () => {
    if (isAnimatingOut) {
      setIsRendered(false);
      document.body.style.overflow = 'auto';
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isRendered) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRendered, onClose]);


  if (!isRendered) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm ${isAnimatingOut ? 'fade-out-overlay' : 'fade-in-overlay'}`}
        onClick={onClose}
        onAnimationEnd={onAnimationEnd}
      ></div>

      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative w-full md:w-3/5 lg:w-3/4 xl:w-3/5 h-full bg-gray-800 shadow-2xl ${isAnimatingOut ? 'slide-out-right' : 'slide-in-right'}`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={onAnimationEnd}
      >
        {children}
      </div>
    </div>
  );
};

export default SlidingPanel;