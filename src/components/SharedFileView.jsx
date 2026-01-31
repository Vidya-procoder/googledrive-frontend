import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiDownload, FiAlertCircle, FiFile, FiFolder } from 'react-icons/fi';

const SharedFileView = () => {
  const { token } = useParams();
  const [file, setFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSharedFile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/files/shared/${token}`);
        setFile(response.data.data);
        setDownloadUrl(response.data.downloadUrl);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load shared file.');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedFile();
  }, [token]);

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner w-12 h-12 border-4 text-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const isImage = file.mimeType?.startsWith('image/') && downloadUrl;
  const isVideo = file.mimeType?.startsWith('video/') && downloadUrl;
  const isPDF = file.mimeType === 'application/pdf' && downloadUrl;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
             {file.isFolder ? <FiFolder className="w-6 h-6 text-white" /> : <FiFile className="w-6 h-6 text-white" />}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{file.name}</h1>
            <p className="text-xs text-gray-500">Shared with you</p>
          </div>
        </div>
        
        {!file.isFolder && (
          <button 
            onClick={handleDownload}
            className="btn btn-primary flex items-center space-x-2"
          >
            <FiDownload className="w-5 h-5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden min-h-[60vh] flex items-center justify-center relative">
          
          {isImage ? (
            <img src={downloadUrl} alt={file.name} className="max-h-[80vh] max-w-full object-contain" />
          ) : isVideo ? (
            <video controls className="max-h-[80vh] max-w-full">
              <source src={downloadUrl} type={file.mimeType} />
            </video>
          ) : isPDF ? (
            <iframe src={downloadUrl} className="w-full h-[80vh]" title="PDF Preview" />
          ) : (
            <div className="text-center p-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiFile className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {file.isFolder ? 'Folder Preview Not Supported' : 'Preview Not Available'}
              </h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                {file.isFolder 
                  ? 'We cannot preview folders yet. Please ask the owner to share individual files.' 
                  : 'This file type cannot be previewed directly in the browser. Please download it to view.'}
              </p>
              {!file.isFolder && (
                <button 
                  onClick={handleDownload}
                  className="btn btn-secondary"
                >
                  Download File
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SharedFileView;
