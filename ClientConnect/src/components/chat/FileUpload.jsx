import React, { useState, useRef } from 'react';

const FileUpload = ({ onFileSelect, onClose, isOpen }) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'screenshot'
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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

  const handleFile = (file) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'audio/mpeg', 'video/mp4'];
    if (!allowedTypes.includes(file.type)) {
      alert('File type not supported');
      return;
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    onFileSelect(file);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const startScreenshotCapture = async () => {
    try {
      setIsCapturing(true);
      
      // Request screen capture permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Auto-capture after 2 seconds
      setTimeout(() => {
        captureScreenshot();
      }, 2000);

    } catch (error) {
      console.error('Error accessing screen:', error);
      alert('Unable to access screen. Please try again or use file upload instead.');
      setIsCapturing(false);
    }
  };

  const captureScreenshot = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a file from the blob
          const file = new File([blob], `screenshot-${Date.now()}.png`, {
            type: 'image/png'
          });
          
          // Create preview
          const reader = new FileReader();
          reader.onload = (e) => {
            setPreview(e.target.result);
          };
          reader.readAsDataURL(blob);
          
          // Stop the stream
          if (video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
          }
          
          setIsCapturing(false);
          onFileSelect(file);
        }
      }, 'image/png');
    }
  };

  const stopScreenshotCapture = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upload File</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Mode Toggle */}
          <div className="mt-4 flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setUploadMode('file')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                uploadMode === 'file' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📁 File Upload
            </button>
            <button
              onClick={() => setUploadMode('screenshot')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                uploadMode === 'screenshot' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📸 Screenshot
            </button>
          </div>
        </div>

        <div className="p-4">
          {uploadMode === 'file' ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-w-full max-h-48 mx-auto rounded"
                  />
                  <p className="text-sm text-gray-600">File ready to upload</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-600">
                      Drag and drop a file here, or{' '}
                      <button
                        onClick={openFileDialog}
                        className="text-indigo-600 hover:text-indigo-500 font-medium"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports: Images, PDF, Text, Audio, Video (Max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {isCapturing ? (
                <div className="border-2 border-dashed border-indigo-300 rounded-lg p-8 text-center bg-indigo-50">
                  <div className="space-y-4">
                    <div className="animate-spin mx-auto h-12 w-12 text-indigo-600">
                      <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-indigo-600 font-medium">Capturing screenshot...</p>
                      <p className="text-xs text-gray-500 mt-1">Select the window or screen to capture</p>
                    </div>
                    <button
                      onClick={stopScreenshotCapture}
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      Cancel Capture
                    </button>
                  </div>
                </div>
              ) : preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="Screenshot Preview"
                    className="max-w-full max-h-48 mx-auto rounded border"
                  />
                  <p className="text-sm text-gray-600">Screenshot ready to upload</p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="space-y-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Capture a screenshot of any window or screen</p>
                      <button
                        onClick={startScreenshotCapture}
                        className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                      >
                        📸 Take Screenshot
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hidden video and canvas elements for screenshot capture */}
          <video ref={videoRef} className="hidden" />
          <canvas ref={canvasRef} className="hidden" />

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInput}
            className="hidden"
            accept="image/*,application/pdf,text/plain,audio/*,video/*"
          />

          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (fileInputRef.current?.files?.[0]) {
                  handleFile(fileInputRef.current.files[0]);
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
