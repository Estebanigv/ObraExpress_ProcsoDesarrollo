import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, X, Sparkles, Plus, MessageCircle, Minimize2 } from 'lucide-react';
import { logger } from '@/lib/logger';

interface AIInputFieldProps {
  isFloating?: boolean;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const AIInputField: React.FC<AIInputFieldProps> = ({ 
  isFloating = false, 
  isMinimized = false,
  onToggleMinimize 
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: number) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i)) + sizes[i];
  };

  const handleSubmit = () => {
    if (message.trim() || uploadedFiles.length > 0) {
      logger.log('Submitting:', { message, files: uploadedFiles });
      setMessage('');
      setUploadedFiles([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Minimized floating ball version
  if (isFloating && isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onToggleMinimize}
          className="group relative w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white shadow-2xl hover:shadow-black/50 transition-all duration-300 hover:scale-110 border border-gray-600"
          title="Abrir chat"
        >
          <MessageCircle className="w-8 h-8 mx-auto text-white" />
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-600/20 to-black/20 blur-lg scale-110 group-hover:scale-125 transition-transform duration-300"></div>
          
          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full border-2 border-gray-400/30 animate-ping"></div>
        </button>
      </div>
    );
  }

  // Floating chat version
  if (isFloating) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-96">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-black rounded-t-2xl p-4 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6 text-white" />
              <div>
                <h3 className="text-white font-semibold">Asistente ObraExpress</h3>
                <p className="text-gray-300 text-sm">¿En qué te puedo ayudar?</p>
              </div>
            </div>
            <button
              onClick={onToggleMinimize}
              className="text-gray-300 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div className={`relative transition-all duration-500 ease-out ${
          isFocused || message || uploadedFiles.length > 0 
            ? 'transform scale-[1.02]' 
            : ''
        }`}>
          
          {/* Glow Effect */}
          <div className={`absolute inset-0 transition-all duration-500 ${
            isFocused 
              ? 'bg-gradient-to-r from-gray-600/20 via-gray-500/20 to-black/20 blur-xl scale-110' 
              : 'bg-gradient-to-r from-gray-700/50 via-gray-800/50 to-black/50 blur-lg'
          }`}></div>

          {/* Input Container */}
          <div className={`relative backdrop-blur-xl bg-gradient-to-br from-gray-800/95 to-black/95 border-2 rounded-b-2xl transition-all duration-300 ${
            isFocused 
              ? 'border-gray-500/70 shadow-2xl shadow-gray-900/50' 
              : 'border-gray-600/60 shadow-xl shadow-black/40'
          } hover:shadow-2xl hover:shadow-gray-800/60`}>
            
            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="p-4 border-b border-gray-600/30">
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="group flex items-center gap-2 bg-gradient-to-r from-gray-700/80 to-gray-800/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="w-2 h-2 bg-gradient-to-r from-gray-400 to-white rounded-full"></div>
                      <span className="text-gray-200 font-medium text-sm truncate max-w-32">{file.name}</span>
                      <span className="text-gray-400 text-xs">({formatFileSize(file.size)})</span>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all duration-200 hover:scale-110"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Input Area */}
            <div className="flex items-end p-6 gap-4">
              
              {/* Left Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative p-3 rounded-2xl bg-gradient-to-br from-gray-700/80 to-gray-800/80 hover:from-gray-600/80 hover:to-gray-700/80 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  title="Subir archivos"
                >
                  <Paperclip className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-500/0 to-gray-600/0 group-hover:from-gray-500/20 group-hover:to-gray-600/20 transition-all duration-300"></div>
                </button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                  accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.csv,.json"
                />
                
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`group relative p-3 rounded-2xl transition-all duration-300 hover:scale-110 ${
                    isRecording 
                      ? 'bg-gradient-to-br from-red-600/80 to-red-700/80 animate-pulse shadow-lg shadow-red-900/50' 
                      : 'bg-gradient-to-br from-gray-700/80 to-gray-800/80 hover:from-green-600/80 hover:to-green-700/80 hover:shadow-lg'
                  }`}
                  title={isRecording ? "Detener grabación" : "Entrada de voz"}
                >
                  <Mic className={`w-5 h-5 transition-colors duration-300 ${
                    isRecording 
                      ? 'text-white' 
                      : 'text-gray-300 group-hover:text-white'
                  }`} />
                  <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                    isRecording 
                      ? 'bg-gradient-to-br from-red-500/20 to-red-600/20' 
                      : 'bg-gradient-to-br from-green-500/0 to-green-600/0 group-hover:from-green-500/20 group-hover:to-green-600/20'
                  }`}></div>
                </button>
              </div>

              {/* Text Input */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Pregúntame cualquier cosa... ✨"
                  className="w-full resize-none border-none outline-none text-white placeholder-gray-400 text-lg leading-relaxed min-h-[32px] max-h-32 bg-transparent font-medium selection:bg-gray-600/50"
                  rows={1}
                  style={{ background: 'transparent' }}
                />
                
                {/* Cursor Animation */}
                {isFocused && !message && (
                  <div className="absolute top-1 left-0 w-0.5 h-8 bg-gradient-to-b from-gray-400 to-white animate-pulse rounded-full"></div>
                )}
              </div>

              {/* Send Button */}
              <button
                onClick={handleSubmit}
                disabled={!message.trim() && uploadedFiles.length === 0}
                className={`group relative p-4 rounded-2xl font-medium transition-all duration-300 ${
                  message.trim() || uploadedFiles.length > 0
                    ? 'bg-gradient-to-br from-gray-600 to-black hover:from-gray-500 hover:to-gray-800 text-white shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-gray-900/50 hover:scale-110 transform-gpu'
                    : 'bg-gradient-to-br from-gray-700/50 to-gray-800/50 text-gray-500 cursor-not-allowed'
                }`}
                title="Enviar mensaje"
              >
                <Send className="w-6 h-6" />
                {(message.trim() || uploadedFiles.length > 0) && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
            </div>

            {/* Magic Sparkles */}
            {isFocused && (
              <>
                <div className="absolute -top-2 -left-2 w-6 h-6">
                  <Sparkles className="w-4 h-4 text-gray-400 animate-bounce" />
                </div>
                <div className="absolute -top-1 -right-3 w-6 h-6">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-ping"></div>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6">
                  <Plus className="w-3 h-3 text-gray-300 animate-pulse" />
                </div>
              </>
            )}
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-3 bg-gradient-to-r from-red-600/90 to-red-700/90 backdrop-blur-xl text-white px-6 py-3 rounded-2xl shadow-2xl shadow-red-900/50">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="font-medium">Escuchando...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Original full-page version with black theme
  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      {/* Main Input Container */}
      <div className={`relative transition-all duration-500 ease-out ${
        isFocused || message || uploadedFiles.length > 0 
          ? 'transform scale-105' 
          : ''
      }`}>
        
        {/* Glow Effect */}
        <div className={`absolute inset-0 rounded-3xl transition-all duration-500 ${
          isFocused 
            ? 'bg-gradient-to-r from-gray-600/20 via-gray-500/20 to-black/20 blur-xl scale-110' 
            : 'bg-gradient-to-r from-gray-700/50 via-gray-800/50 to-black/50 blur-lg'
        }`}></div>

        {/* Input Container */}
        <div className={`relative backdrop-blur-xl bg-gradient-to-br from-gray-800/95 to-black/95 border-2 rounded-3xl transition-all duration-300 ${
          isFocused 
            ? 'border-gray-500/70 shadow-2xl shadow-gray-900/50' 
            : 'border-gray-600/60 shadow-xl shadow-black/40'
        } hover:shadow-2xl hover:shadow-gray-800/60`}>
          
          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="p-4 border-b border-gray-600/30">
              <div className="flex flex-wrap gap-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="group flex items-center gap-2 bg-gradient-to-r from-gray-700/80 to-gray-800/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="w-2 h-2 bg-gradient-to-r from-gray-400 to-white rounded-full"></div>
                    <span className="text-gray-200 font-medium text-sm truncate max-w-32">{file.name}</span>
                    <span className="text-gray-400 text-xs">({formatFileSize(file.size)})</span>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all duration-200 hover:scale-110"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Input Area */}
          <div className="flex items-end p-6 gap-4">
            
            {/* Left Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="group relative p-3 rounded-2xl bg-gradient-to-br from-gray-700/80 to-gray-800/80 hover:from-gray-600/80 hover:to-gray-700/80 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                title="Subir archivos"
              >
                <Paperclip className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-500/0 to-gray-600/0 group-hover:from-gray-500/20 group-hover:to-gray-600/20 transition-all duration-300"></div>
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
                accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.csv,.json"
              />
              
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`group relative p-3 rounded-2xl transition-all duration-300 hover:scale-110 ${
                  isRecording 
                    ? 'bg-gradient-to-br from-red-600/80 to-red-700/80 animate-pulse shadow-lg shadow-red-900/50' 
                    : 'bg-gradient-to-br from-gray-700/80 to-gray-800/80 hover:from-green-600/80 hover:to-green-700/80 hover:shadow-lg'
                }`}
                title={isRecording ? "Detener grabación" : "Entrada de voz"}
              >
                <Mic className={`w-5 h-5 transition-colors duration-300 ${
                  isRecording 
                    ? 'text-white' 
                    : 'text-gray-300 group-hover:text-white'
                }`} />
                <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                  isRecording 
                    ? 'bg-gradient-to-br from-red-500/20 to-red-600/20' 
                    : 'bg-gradient-to-br from-green-500/0 to-green-600/0 group-hover:from-green-500/20 group-hover:to-green-600/20'
                }`}></div>
              </button>
            </div>

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Pregúntame cualquier cosa... ✨"
                className="w-full resize-none border-none outline-none text-white placeholder-gray-400 text-lg leading-relaxed min-h-[32px] max-h-32 bg-transparent font-medium selection:bg-gray-600/50"
                rows={1}
                style={{ background: 'transparent' }}
              />
              
              {/* Cursor Animation */}
              {isFocused && !message && (
                <div className="absolute top-1 left-0 w-0.5 h-8 bg-gradient-to-b from-gray-400 to-white animate-pulse rounded-full"></div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSubmit}
              disabled={!message.trim() && uploadedFiles.length === 0}
              className={`group relative p-4 rounded-2xl font-medium transition-all duration-300 ${
                message.trim() || uploadedFiles.length > 0
                  ? 'bg-gradient-to-br from-gray-600 to-black hover:from-gray-500 hover:to-gray-800 text-white shadow-xl shadow-black/40 hover:shadow-2xl hover:shadow-gray-900/50 hover:scale-110 transform-gpu'
                  : 'bg-gradient-to-br from-gray-700/50 to-gray-800/50 text-gray-500 cursor-not-allowed'
              }`}
              title="Enviar mensaje"
            >
              <Send className="w-6 h-6" />
              {(message.trim() || uploadedFiles.length > 0) && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>
          </div>

          {/* Magic Sparkles */}
          {isFocused && (
            <>
              <div className="absolute -top-2 -left-2 w-6 h-6">
                <Sparkles className="w-4 h-4 text-gray-400 animate-bounce" />
              </div>
              <div className="absolute -top-1 -right-3 w-6 h-6">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-ping"></div>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6">
                <Plus className="w-3 h-3 text-gray-300 animate-pulse" />
              </div>
            </>
          )}
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center gap-3 bg-gradient-to-r from-red-600/90 to-red-700/90 backdrop-blur-xl text-white px-6 py-3 rounded-2xl shadow-2xl shadow-red-900/50">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
              <span className="font-medium">Escuchando...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { AIInputField };
export default AIInputField;