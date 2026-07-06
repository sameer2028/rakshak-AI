import { useState, useRef } from 'react';
import { UploadCloud, FileAudio, X, Send, Loader2, AlertCircle, FileWarning } from 'lucide-react';

export default function AudioUploader({ onUploadSubmit, isLoading }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile) => {
    setError(null);
    if (!selectedFile) return false;
    
    // Only accept .wav
    if (!selectedFile.name.toLowerCase().endsWith('.wav') && selectedFile.type !== 'audio/wav') {
      setError('Only .wav files are supported by this demo extractor.');
      return false;
    }
    
    // Max 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      return false;
    }
    
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    onUploadSubmit(formData);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="pb-4 border-b border-gray-700/50">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <FileAudio className="w-5 h-5 text-purple-400" />
          Audio File Extraction
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          Upload a .wav call recording. Our backend will convert the exact audio to text and analyze it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm flex gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex gap-3 items-start">
          <FileWarning className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <strong className="text-yellow-500 block mb-1">.WAV Format Required</strong>
            To extract exact audio directly in Python without heavy ML dependencies, you must upload a valid <b>.wav</b> file.
          </div>
        </div>

        <div 
          className={`flex-1 relative border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all ${
            dragActive ? 'border-purple-500 bg-purple-500/10' : 
            file ? 'border-gray-600 bg-gray-800/30' : 
            'border-gray-700 bg-gray-900/30 hover:border-gray-500 hover:bg-gray-800/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".wav,audio/wav"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-default"
            disabled={isLoading || !!file}
          />
          
          {file ? (
            <div className="flex flex-col items-center text-center z-10">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                <FileAudio className="w-8 h-8" />
              </div>
              <p className="text-gray-200 font-medium">{file.name}</p>
              <p className="text-gray-500 text-sm mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              
              {!isLoading && (
                <button 
                  type="button" 
                  onClick={handleRemove}
                  className="mt-6 flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                >
                  <X className="w-4 h-4" /> Remove File
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center pointer-events-none">
              <UploadCloud className="w-12 h-12 text-gray-500 mb-4" />
              <p className="text-gray-300 font-medium mb-1">Drag & drop your .wav file here</p>
              <p className="text-gray-500 text-sm">or click to browse</p>
            </div>
          )}

          {isLoading && (
             <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-20">
               <div className="w-full h-full absolute overflow-hidden rounded-2xl">
                 <div className="w-full h-[2px] bg-purple-500/50 shadow-glow-purple animate-scan-line absolute" />
               </div>
             </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !file}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-glow-blue text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Extracting Audio to Text...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Upload & Analyze
            </>
          )}
        </button>
      </form>
    </div>
  );
}
