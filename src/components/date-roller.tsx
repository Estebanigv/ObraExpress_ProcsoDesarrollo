"use client";

import React, { useState, useRef, useEffect } from 'react';
import { getNextDispatchDate, formatDispatchDate } from '@/utils/dispatch-dates';

interface DateRollerProps {
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export function DateRoller({ onDateSelect, selectedDate }: DateRollerProps) {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generar próximos 12 jueves disponibles
  useEffect(() => {
    const dates: Date[] = [];
    const today = new Date();
    
    // Comenzar desde el próximo jueves disponible
    let currentDate = getNextDispatchDate('policarbonato');
    
    for (let i = 0; i < 12; i++) {
      dates.push(new Date(currentDate));
      
      // Avanzar al siguiente jueves (7 días)
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    setAvailableDates(dates);
    
    // Si hay fecha seleccionada, encontrar su índice
    if (selectedDate) {
      const index = dates.findIndex(date => 
        date.toDateString() === selectedDate.toDateString()
      );
      if (index !== -1) {
        setCurrentIndex(index);
        setTranslateY(-index * 60);
      }
    }
  }, [selectedDate]);

  const itemHeight = 60;

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY - translateY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentY = e.touches[0].clientY - startY;
    const maxTranslate = 0;
    const minTranslate = -(availableDates.length - 1) * itemHeight;
    
    const boundedY = Math.max(minTranslate, Math.min(maxTranslate, currentY));
    setTranslateY(boundedY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Snap to nearest item
    const newIndex = Math.round(-translateY / itemHeight);
    const clampedIndex = Math.max(0, Math.min(availableDates.length - 1, newIndex));
    
    setCurrentIndex(clampedIndex);
    setTranslateY(-clampedIndex * itemHeight);
    
    // Notify parent of selection
    if (availableDates[clampedIndex]) {
      onDateSelect(availableDates[clampedIndex]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY - translateY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentY = e.clientY - startY;
    const maxTranslate = 0;
    const minTranslate = -(availableDates.length - 1) * itemHeight;
    
    const boundedY = Math.max(minTranslate, Math.min(maxTranslate, currentY));
    setTranslateY(boundedY);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Snap to nearest item
    const newIndex = Math.round(-translateY / itemHeight);
    const clampedIndex = Math.max(0, Math.min(availableDates.length - 1, newIndex));
    
    setCurrentIndex(clampedIndex);
    setTranslateY(-clampedIndex * itemHeight);
    
    // Notify parent of selection
    if (availableDates[clampedIndex]) {
      onDateSelect(availableDates[clampedIndex]);
    }
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e as any);
      const handleGlobalMouseUp = () => handleMouseUp();
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, startY, translateY]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-blue-500 text-white p-3 text-center">
        <h3 className="font-bold text-sm">📅 Desliza para elegir fecha</h3>
        <p className="text-xs opacity-90">Solo jueves disponibles</p>
      </div>
      
      <div 
        ref={containerRef}
        className="relative h-48 overflow-hidden bg-gradient-to-b from-blue-50 to-white"
        style={{ 
          background: `linear-gradient(to bottom, 
            rgba(59, 130, 246, 0.1) 0%, 
            rgba(59, 130, 246, 0.05) 20%, 
            transparent 40%, 
            transparent 60%, 
            rgba(59, 130, 246, 0.05) 80%, 
            rgba(59, 130, 246, 0.1) 100%)`
        }}
      >
        {/* Selection indicator */}
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-12 bg-blue-100 border-t-2 border-b-2 border-blue-300 pointer-events-none z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-50"></div>
        </div>
        
        <div
          className="relative transition-transform duration-200 ease-out"
          style={{
            transform: `translateY(${translateY + 96}px)`, // Center offset
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          {availableDates.map((date, index) => {
            const isSelected = index === currentIndex;
            const distance = Math.abs(index - currentIndex);
            const opacity = Math.max(0.3, 1 - distance * 0.3);
            const scale = Math.max(0.8, 1 - distance * 0.1);
            
            return (
              <div
                key={index}
                className={`h-15 flex items-center justify-center transition-all duration-200 ${
                  isSelected 
                    ? 'text-blue-900 font-bold text-lg' 
                    : 'text-gray-600 font-medium'
                }`}
                style={{
                  height: `${itemHeight}px`,
                  opacity,
                  transform: `scale(${scale})`,
                }}
              >
                <div className="text-center">
                  <div className={`${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                    {formatDispatchDate(date)}
                  </div>
                  {isSelected && (
                    <div className="text-blue-600 text-xs font-normal">
                      9:00 - 18:00 hrs
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 text-center">
        <p className="text-xs text-gray-600">
          💡 Arrastra hacia arriba/abajo para navegar
        </p>
      </div>
    </div>
  );
}