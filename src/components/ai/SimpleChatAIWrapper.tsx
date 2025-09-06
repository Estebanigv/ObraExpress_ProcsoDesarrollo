"use client";

import dynamic from 'next/dynamic';

// Client-side dynamic import with SSR disabled
const SimpleChatAI = dynamic(() => import('./SimpleChatAI'), { 
  ssr: false 
});

export default function SimpleChatAIWrapper() {
  return <SimpleChatAI />;
}