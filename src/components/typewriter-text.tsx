"use client";

import React, { useEffect, useState } from 'react';

interface TypewriterTextProps {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

export function TypewriterText({ 
  words, 
  className = "",
  typingSpeed = 150,
  deletingSpeed = 100,
  pauseTime = 2000
}: TypewriterTextProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    
    const handleTyping = () => {
      if (isPaused) {
        // Esperar antes de empezar a borrar
        setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseTime);
        return;
      }

      if (!isDeleting) {
        // Escribiendo
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.slice(0, currentText.length + 1));
          setOpacity(1);
        } else {
          // Palabra completa, hacer pausa
          setIsPaused(true);
        }
      } else {
        // Borrando
        if (currentText.length > 0) {
          // Mantener opacidad completa mientras borra
          setOpacity(1);
          setCurrentText(currentText.slice(0, -1));
        } else {
          // Palabra borrada completamente, cambiar a la siguiente
          setIsDeleting(false);
          setOpacity(1);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
          // Asegurar que empezamos con texto vacío
          setCurrentText('');
        }
      }
    };

    // Agregar variación aleatoria para hacerlo más humano
    const getTypingDelay = () => {
      if (isPaused) return 0;
      if (isDeleting) return deletingSpeed;
      // Variación aleatoria del 20% para simular escritura humana
      const variation = typingSpeed * 0.2;
      return typingSpeed + (Math.random() * variation - variation/2);
    };

    const timeout = setTimeout(handleTyping, getTypingDelay());

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, isPaused, currentWordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className={`${className} inline-block`}>
      <span className="typewriter-container" style={{
        display: 'inline-block',
        minWidth: '320px',
        textAlign: 'left',
        position: 'relative'
      }}>
        {currentText}
        <span className="cursor-blink" style={{
          display: 'inline-block',
          marginLeft: currentText ? '2px' : '0',
          color: 'currentColor',
          fontWeight: 'normal'
        }}>|</span>
      </span>
      <style jsx>{`
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 99% { opacity: 0.2; }
          100% { opacity: 1; }
        }
        .cursor-blink {
          animation: blink 1s infinite;
          font-weight: 300;
        }
        .typewriter-text {
          letter-spacing: 0.02em;
          font-kerning: normal;
        }
      `}</style>
    </span>
  );
}