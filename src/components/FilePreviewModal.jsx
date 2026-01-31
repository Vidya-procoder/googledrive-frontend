import { FiX, FiDownload, FiExternalLink } from 'react-icons/fi';
import { filesAPI } from '../services/api';
import { useState, useEffect } from 'react';

const FilePreviewModal = ({ file, isOpen, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && file && !file.isFolder) {
      loadPreviewUrl();
    }
  }, [isOpen, file]);

  const loadPreviewUrl = async () => {
    try {
      setLoading(true);
      const response = await filesAPI.getDownloadUrl(file._id);
      setPreviewUrl(response.data.data.downloadUrl);
    } catch (error) {
      console.error('Failed to load preview url', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !file) return null;

  const isImage = file.mimeType?.startsWith('image/');
  const isVideo = file.mimeType?.startsWith('video/');
  const isAudio = file.mimeType?.startsWith('audio/');
  const isPDF = file.mimeType === 'application/pdf';

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-white">
          <div className="spinner w-8 h-8 border-white border-b-transparent mb-4"></div>
          <p>Loading preview...</p>
        </div>
      );
    }

    if (!previewUrl) {
      return (
        <div className="text-center text-white p-8">
          <p>Preview not available</p>
          <button 
            onClick={() => window.open(previewUrl, '_blank')}
            className="mt-4 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
          >
            Download File
          </button>
        </div>
      );
    }

    if (isImage) {
      return <img src={previewUrl} alt={file.name} className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl" />;
    }

    if (isVideo) {
      return (
        <video controls autoPlay className="max-h-[80vh] max-w-full rounded-lg shadow-2xl">
          <source src={previewUrl} type={file.mimeType} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (isAudio) {
      return (
        <div className="bg-white p-8 rounded-lg shadow-2xl min-w-[300px]">
          <div className="mb-4 text-center">
            <h3 className="font-semibold text-gray-800">{file.name}</h3>
          </div>
          <audio controls className="w-full">
            <source src={previewUrl} type={file.mimeType} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    if (isPDF) {
      return (
        <iframe 
          src={`${previewUrl}#toolbar=0`} 
          className="w-full h-[80vh] bg-white rounded-lg shadow-2xl"
          title={file.name}
        />
      );
    }

    // Default fallback
    return (
      <div className="text-center text-white p-12 bg-gray-800 rounded-lg">
        <div className="mb-4 text-6xl">📄</div>
        <h3 className="text-xl font-semibold mb-2">{file.name}</h3>
        <p className="text-gray-400 mb-6">This file type cannot be previewed.</p>
        <a 
          href={previewUrl} 
          download 
          className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors text-white"
        >
          <FiDownload /> <span>Download</span>
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 transition-all duration-200">
      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50"
      >
        <FiX className="w-8 h-8" />
      </button>

      {/* Header Info */}
      <div className="absolute top-4 left-4 text-white z-50 flex items-center space-x-4">
        <h2 className="text-lg font-medium truncate max-w-md">{file.name}</h2>
        {previewUrl && (
          <a 
            href={previewUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Open in new tab"
          >
            <FiExternalLink className="w-5 h-5" />
          </a>
        )}
      </div>

      {/* Content */}
      <div className="relative w-full max-w-6xl flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default FilePreviewModal;
