import { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2 } from 'lucide-react';

export default function ImageUpload({ onUpload, isLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG).');
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const submitUpload = () => {
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl transition-all ${
            dragActive ? 'border-cyan-400 bg-cyan-400/10' : 'border-gray-700 hover:border-gray-500 bg-gray-900/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-16 h-16 mb-4 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
            <UploadCloud className="w-8 h-8" />
          </div>
          <p className="text-gray-300 font-medium mb-1">Drag and drop currency image here</p>
          <p className="text-gray-500 text-sm">or click to browse (JPG, PNG)</p>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-gray-700 bg-black group">
          <img src={preview} alt="Currency Preview" className="w-full h-auto object-contain max-h-[400px]" />
          
          {isLoading ? (
            <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="relative w-full h-full overflow-hidden">
                <div className="w-full h-[4px] bg-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-scan-line absolute" />
              </div>
              <div className="absolute flex flex-col items-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
                <p className="text-cyan-300 font-medium font-mono text-sm uppercase tracking-widest">Running ML Analysis</p>
              </div>
            </div>
          ) : (
            <button
              onClick={removeFile}
              className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {preview && !isLoading && (
        <button
          onClick={submitUpload}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold shadow-glow-cyan transition-all flex items-center justify-center gap-2"
        >
          <ImageIcon className="w-5 h-5" />
          Run Counterfeit Detection
        </button>
      )}
    </div>
  );
}
