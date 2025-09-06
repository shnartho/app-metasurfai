import React, { useRef, useState } from "react";



const ComingSoonBox = ({ explanation, link }) => {
  const boxRef = useRef(null);
  // Default to bottom right on first render
  const [position, setPosition] = useState(() => {
    if (typeof window !== 'undefined') {
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

  // Mouse event handlers
  const onMouseDown = (e) => {
    setDragging(true);
    const rect = boxRef.current.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    document.body.style.userSelect = 'none';
  };
  const onMouseMove = (e) => {
    if (!dragging) return;
    setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const onMouseUp = () => {
    setDragging(false);
    document.body.style.userSelect = '';
  };

  React.useEffect(() => {
    if (dragging) {
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
  }, [dragging, offset]);

  return (
    <div
      ref={boxRef}
      onMouseDown={onMouseDown}
      className="fixed z-50 max-w-xs w-full bg-white dark:bg-slate-800 border border-pink-400 dark:border-blue-500 shadow-lg rounded-xl p-3 flex flex-col items-start animate-fade-in cursor-move"
      style={{
        left: position.x,
        top: position.y,
        minWidth: 0,
      }}
    >
      <div className="text-lg font-semibold mb-1 text-pink-600 dark:text-blue-400 flex items-center">
        <span className="mr-1">🚀</span> Coming Soon
      </div>
      <div className="mb-2 text-gray-700 dark:text-gray-200 text-sm">{explanation}</div>
      <div className="bg-pink-50 dark:bg-blue-900 border-l-4 border-pink-400 dark:border-blue-500 text-pink-700 dark:text-blue-200 p-2 rounded mb-2 w-full text-xs">
        <strong>You’re experiencing our MVP version.</strong><br />
        This feature isn’t available yet, but hold tight—it’s coming soon.
      </div>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-pink-600 dark:text-blue-400 hover:underline font-semibold mt-1 text-xs"
      >
        👉 Check out our roadmap here
      </a>
    </div>
  );
};

export default ComingSoonBox;
