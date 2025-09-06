import React, { useRef, useState } from "react";



const ComingSoonBox = ({ explanation, link, centered = false, floating = false, closable = false }) => {
  const boxRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  
  // Default to bottom right on first render (only for non-centered, non-floating boxes)
  const [position, setPosition] = useState(() => {
    if (!centered && !floating && typeof window !== 'undefined') {
      const padding = 24;
      const moveUp = 120; // move up by 120px (about 7.5rem)
      const width = 320; // max-w-xs
      const height = 160; // estimated height
      const x = window.innerWidth - width - padding;
      const y = window.innerHeight - height - padding - moveUp;
      return { x, y };
    }
    return { x: 0, y: 0 };
  });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Mouse event handlers (only for non-centered, non-floating boxes)
  const onMouseDown = (e) => {
    if (centered || floating) return; // Don't allow dragging for centered or floating boxes
    setDragging(true);
    const rect = boxRef.current.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    document.body.style.userSelect = 'none';
  };
  const onMouseMove = (e) => {
    if (!dragging || centered || floating) return;
    setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const onMouseUp = () => {
    setDragging(false);
    document.body.style.userSelect = '';
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  React.useEffect(() => {
    if (dragging && !centered && !floating) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    } else {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, offset, centered, floating]);

  if (floating) {
    if (!isVisible) return null;
    
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
        <div className="relative bg-white dark:bg-slate-800 border border-pink-400 dark:border-blue-500 shadow-2xl rounded-2xl p-8 flex flex-col items-center animate-fade-in max-w-2xl mx-4">
          {closable && (
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          )}
          <div className="text-4xl font-bold mb-4 text-pink-600 dark:text-blue-400 flex items-center">
            <span className="mr-3 text-5xl">🚀</span> Coming Soon
          </div>
          <div className="mb-6 text-gray-700 dark:text-gray-200 text-lg text-center leading-relaxed">{explanation}</div>
          <div className="bg-pink-50 dark:bg-blue-900 border-l-4 border-pink-400 dark:border-blue-500 text-pink-700 dark:text-blue-200 p-4 rounded-lg mb-6 w-full text-base text-center">
            <strong>You're experiencing our MVP version.</strong><br />
            This feature isn't available yet, but hold tight—it's coming soon.
          </div>
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-600 dark:text-blue-400 hover:underline font-semibold text-lg hover:text-pink-700 dark:hover:text-blue-300 transition-colors"
          >
            👉 Check out our roadmap here
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={boxRef}
      onMouseDown={onMouseDown}
      className={`${
        centered 
          ? 'relative mx-auto max-w-2xl w-full bg-white dark:bg-slate-800 border border-pink-400 dark:border-blue-500 shadow-xl rounded-2xl p-8 flex flex-col items-center animate-fade-in' 
          : 'fixed z-50 max-w-xs w-full bg-white dark:bg-slate-800 border border-pink-400 dark:border-blue-500 shadow-lg rounded-xl p-3 flex flex-col items-start animate-fade-in cursor-move'
      }`}
      style={centered ? {} : {
        left: position.x,
        top: position.y,
        minWidth: 0,
      }}
    >
      <div className={`${
        centered ? 'text-4xl font-bold mb-4 text-pink-600 dark:text-blue-400 flex items-center' 
                 : 'text-lg font-semibold mb-1 text-pink-600 dark:text-blue-400 flex items-center'
      }`}>
        <span className={`${centered ? 'mr-3 text-5xl' : 'mr-1'}`}>🚀</span> Coming Soon
      </div>
      <div className={`${
        centered ? 'mb-6 text-gray-700 dark:text-gray-200 text-lg text-center leading-relaxed' 
                 : 'mb-2 text-gray-700 dark:text-gray-200 text-sm'
      }`}>{explanation}</div>
      <div className={`${
        centered ? 'bg-pink-50 dark:bg-blue-900 border-l-4 border-pink-400 dark:border-blue-500 text-pink-700 dark:text-blue-200 p-4 rounded-lg mb-6 w-full text-base text-center' 
                 : 'bg-pink-50 dark:bg-blue-900 border-l-4 border-pink-400 dark:border-blue-500 text-pink-700 dark:text-blue-200 p-2 rounded mb-2 w-full text-xs'
      }`}>
        <strong>You’re experiencing our MVP version.</strong><br />
        This feature isn’t available yet, but hold tight—it’s coming soon.
      </div>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={`${
          centered ? 'text-pink-600 dark:text-blue-400 hover:underline font-semibold text-lg hover:text-pink-700 dark:hover:text-blue-300 transition-colors' 
                   : 'text-pink-600 dark:text-blue-400 hover:underline font-semibold mt-1 text-xs'
        }`}
      >
        👉 Check out our roadmap here
      </a>
    </div>
  );
};

export default ComingSoonBox;
