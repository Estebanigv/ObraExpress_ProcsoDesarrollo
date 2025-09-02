"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div 
      onMouseEnter={() => setActive(item)} 
      className="relative group"
    >
      <motion.p
        transition={{ duration: 0.3 }}
        className={`cursor-pointer font-medium transition-colors py-1 flex items-center px-3 rounded-full ${
          active === item 
            ? 'text-yellow-600 bg-yellow-50/50' 
            : 'text-gray-700 hover:text-yellow-600 hover:bg-yellow-50/30'
        }`}
      >
        {item}
        {children && (
          <motion.svg 
            className="w-4 h-4 ml-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ rotate: active === item ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        )}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
          onMouseEnter={() => setActive(item)}
          onMouseLeave={(e) => {
            // Check if mouse is leaving to go to a sibling element
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseY = e.clientY;
            // If mouse is moving significantly down from the dropdown, close it
            if (mouseY > rect.bottom + 50) {
              setActive(null);
            }
          }}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_0.5rem)] left-1/2 transform -translate-x-1/2 z-[60]">
              {/* Invisible bridge to prevent gap issues */}
              <div className="absolute -top-2 left-0 right-0 h-4 bg-transparent"></div>
              <motion.div
                transition={transition}
                layoutId="active" // layoutId ensures smooth animation
                className="bg-white/95 backdrop-blur-md rounded-lg overflow-hidden border border-gray-200/50 shadow-2xl"
                onMouseEnter={() => setActive(item)}
              >
                <motion.div
                  layout // layout ensures smooth animation
                  className="w-max h-full p-3"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)} // resets the state
      className="relative rounded-full border border-transparent dark:bg-black dark:border-white/[0.2] bg-white shadow-input flex justify-center space-x-4 px-8 py-6 "
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link href={href} className="flex space-x-2">
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </Link>
  );
};

export const HoveredLink = ({ children, className, ...rest }: any) => {
  const defaultClasses = "text-gray-700 hover:text-yellow-600 transition-colors duration-200";
  const combinedClasses = className ? `${defaultClasses} ${className}` : `${defaultClasses} py-2 px-3 rounded hover:bg-yellow-50/30 block`;
  
  return (
    <Link
      {...rest}
      className={combinedClasses}
    >
      {children}
    </Link>
  );
};
