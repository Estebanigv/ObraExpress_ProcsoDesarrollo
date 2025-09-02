"use client";

import React, { useState } from 'react';
import { EmailModalPortal } from './email-modal-portal';

interface EmailModalWrapperProps {
  email: string;
  subject?: string;
  body?: string;
  children?: React.ReactNode;
  className?: string;
  buttonText?: string;
}

export function EmailModalWrapper({ 
  email, 
  subject = "", 
  body = "", 
  children, 
  className = "",
  buttonText = "Enviar Email"
}: EmailModalWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('📧 Email modal opening');
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      {children ? (
        <div onClick={handleOpenModal} className={`cursor-pointer ${className}`}>
          {children}
        </div>
      ) : (
        <button onClick={handleOpenModal} className={className}>
          {buttonText}
        </button>
      )}

      <EmailModalPortal
        isOpen={isOpen}
        onClose={handleCloseModal}
        email={email}
        subject={subject}
        body={body}
      />
    </>
  );
}