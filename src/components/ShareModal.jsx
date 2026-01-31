import { useState, useEffect } from 'react';
import { FiX, FiLink, FiCopy, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { filesAPI } from '../services/api';

const ShareModal = ({ isOpen, onClose, file }) => {
  const [loading, setLoading] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (file) {
      setIsShared(file.isShared);
      if (file.shareToken) {
        setShareLink(`${window.location.origin}/shared/${file.shareToken}`);
      } else {
        setShareLink('');
      }
    }
  }, [file]);

  const handleToggleShare = async () => {
    try {
      setLoading(true);
      const response = await filesAPI.toggleShare(file._id);
      setIsShared(response.data.data.isShared);
      
      if (response.data.shareLink) {
        // Construct link client-side to ensure correct domain
        setShareLink(`${window.location.origin}/shared/${response.data.data.shareToken}`);
      } else {
        setShareLink('');
      }
      
      toast.success(response.data.data.isShared ? 'Link sharing turned on' : 'Link sharing turned off');
    } catch (error) {
      toast.error('Failed to update share settings');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Share "{file.name}"</h3>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isShared ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                <FiLink className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">General Access</h4>
                <p className="text-sm text-gray-500">
                  {isShared ? 'Anyone with the link can view' : 'Restricted to you'}
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={isShared}
                onChange={handleToggleShare}
                disabled={loading}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {isShared && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                <input 
                  type="text" 
                  readOnly 
                  value={shareLink}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-600"
                />
                <button 
                  onClick={copyToClipboard}
                  className="p-2 text-primary-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
                  title="Copy Link"
                >
                  {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
