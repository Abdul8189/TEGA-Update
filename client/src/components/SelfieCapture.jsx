import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Check } from 'lucide-react';

const videoConstraints = {
  width: 540,
  height: 380,
  facingMode: 'user',
};

const SelfieCapture = ({ onCapture, onClose }) => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const handleRetake = () => {
    setImgSrc(null);
  };

  const handleSave = () => {
    if (imgSrc) {
      onCapture(imgSrc);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-xl w-full relative">
        <h2 className="text-2xl font-bold mb-4 text-center">Take a Selfie</h2>
        <div className="relative flex justify-center items-center">
          {imgSrc ? (
            <img src={imgSrc} alt="Captured selfie" className="rounded-lg" />
          ) : (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="rounded-lg"
            />
          )}
        </div>
        <div className="flex justify-center gap-4 mt-6">
          {imgSrc ? (
            <>
              <button onClick={handleRetake} className="btn-secondary flex items-center gap-2">
                <RefreshCw size={18} /> Retake
              </button>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Check size={18} /> Save Photo
              </button>
            </>
          ) : (
            <button onClick={capture} className="btn-primary flex items-center gap-2">
              <Camera size={18} /> Capture
            </button>
          )}
        </div>
        <button onClick={onClose} className="absolute top-2 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold">
          &times;
        </button>
      </div>
    </div>
  );
};

export default SelfieCapture;
