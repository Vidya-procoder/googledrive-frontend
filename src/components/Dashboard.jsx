import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { filesAPI } from '../services/api';
import { getCurrentUser, logout } from '../utils/auth';
import toast from 'react-hot-toast';
import FileCard from './FileCard';
import CreateFolderModal from './CreateFolderModal';
import UploadZone from './UploadZone';
import { FiPlus, FiLogOut, FiUser, FiRefreshCw, FiFolder, FiFile, FiStar, FiTrash2, FiHardDrive, FiSearch, FiFilter, FiList, FiShare2, FiArrowLeft } from 'react-icons/fi';
import FilePreviewModal from './FilePreviewModal';
import ShareModal from './ShareModal';


const Dashboard = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [currentView, setCurrentView] = useState('my-drive'); // 'my-drive', 'starred', 'trash'
  const [currentFolder, setCurrentFolder] = useState(null); // Current folder ID
  const [folderHistory, setFolderHistory] = useState([]); // For breadcrumbs/navigation
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState(''); // 'image', 'video', 'pdf', 'folder'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'date', 'size'
  
  // Preview State
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Share State
  const [shareFile, setShareFile] = useState(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [currentView, currentFolder, searchQuery, filterType, sortBy]); // Reload when any filter changes

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await filesAPI.getFiles(currentFolder?._id || null, currentView, searchQuery, filterType, sortBy);
      setFiles(response.data.data);
    } catch (error) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (folderName) => {
    try {
      setCreatingFolder(true);
      const response = await filesAPI.createFolder({ name: folderName, parentFolder: currentFolder?._id || null });
      toast.success('Folder created successfully');
      setFiles([...files, response.data.data]);
      setShowCreateFolder(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create folder');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleFilesSelected = async (selectedFiles) => {
    setUploading(true);
    
    for (const file of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        if (currentFolder) {
          formData.append('parentFolder', currentFolder._id);
        }

        const response = await filesAPI.uploadFile(formData, (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        });

        toast.success(`${file.name} uploaded successfully`);
        setFiles([response.data.data, ...files]);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    setUploading(false);
    loadFiles(); // Refresh the list
  };

  const handleDownload = async (file) => {
    try {
      if (file.isFolder) {
        toast.loading('Preparing zip file...', { id: 'zip-download' });
        const response = await filesAPI.downloadFolder(file._id);
        
        // Create blob link to download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${file.name}.zip`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        
        toast.success('Download started', { id: 'zip-download' });
      } else {
        const response = await filesAPI.getDownloadUrl(file._id);
        const { downloadUrl, fileName } = response.data.data;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        
        toast.success('Download started');
      }
    } catch (error) {
      toast.error('Failed to download');
      console.error(error);
    }
  };

  const handleStar = async (file) => {
    try {
      await filesAPI.toggleStar(file._id);
      // Toggle locally to feel instant
      setFiles(files.map(f => f._id === file._id ? { ...f, isStarred: !f.isStarred } : f));
      
      // If we are in 'starred' view and just unstarred, remove it
      if (currentView === 'starred' && file.isStarred) {
        setFiles(prev => prev.filter(f => f._id !== file._id));
      }
    } catch (error) {
      toast.error('Failed to update star status');
    }
  };

  const handleRestore = async (file) => {
    try {
      await filesAPI.restoreFile(file._id);
      toast.success('File restored');
      setFiles(files.filter(f => f._id !== file._id)); // Remove from trash view
    } catch (error) {
      toast.error('Failed to restore file');
    }
  };

  const handleShare = (file) => {
    setShareFile(file);
    setShowShare(true);
  };

  const handleDelete = async (file) => {
    const isPermanent = currentView === 'trash';
    const message = isPermanent 
      ? `Are you sure you want to permanently delete "${file.name}"? This cannot be undone.`
      : `Are you sure you want to move "${file.name}" to trash?`;

    if (!window.confirm(message)) {
      return;
    }

    try {
      if (isPermanent) {
        await filesAPI.permanentDelete(file._id);
        toast.success('File deleted permanently');
      } else {
        await filesAPI.deleteFile(file._id);
        toast.success('File moved to trash');
      }
      setFiles(files.filter(f => f._id !== file._id));
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleLogout = () => {
    logout();
  };

  const folders = files.filter(f => f.isFolder);
  const regularFiles = files.filter(f => !f.isFolder);

  const handleFolderClick = (folder) => {
    setFolderHistory([...folderHistory, currentFolder]);
    setCurrentFolder(folder);
    setSearchQuery(''); // Clear search on navigation
  };

  const handleNavigateUp = () => {
    const newHistory = [...folderHistory];
    const prevFolder = newHistory.pop();
    setFolderHistory(newHistory);
    setCurrentFolder(prevFolder || null);
  };
  
   const handleSidebarClick = (view) => {
    setCurrentView(view);
    setCurrentFolder(null); // Reset folder when changing views
    setFolderHistory([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <FiFolder className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">My Drive</h1>
                <p className="text-sm text-gray-600">
                  {files.length} {files.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                  placeholder="Search files and folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={loadFiles}
                className="btn btn-secondary flex items-center space-x-2"
                disabled={loading}
              >
                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
                <FiUser className="w-5 h-5 text-gray-600" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-secondary flex items-center space-x-2 text-red-600 hover:bg-red-50"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-custom py-8 flex items-start space-x-8">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
           <button
            onClick={() => setShowCreateFolder(true)}
            className="w-full btn btn-primary flex items-center justify-center space-x-2 mb-6 shadow-md hover:shadow-lg transition-all"
          >
            <FiPlus className="w-5 h-5" />
            <span>New Folder</span>
          </button>

          <nav className="space-y-1">
            <button
              onClick={() => handleSidebarClick('my-drive')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === 'my-drive' 
                  ? 'bg-blue-50 text-primary-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiHardDrive className="w-5 h-5" />
              <span>My Drive</span>
            </button>
            <button
              onClick={() => handleSidebarClick('starred')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === 'starred' 
                  ? 'bg-blue-50 text-primary-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiStar className="w-5 h-5" />
              <span>Starred</span>
            </button>
            <button
              onClick={() => handleSidebarClick('trash')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === 'trash' 
                  ? 'bg-blue-50 text-primary-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiTrash2 className="w-5 h-5" />
              <span>Trash</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Action Bar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xl font-semibold text-gray-800">
              {currentFolder && (
                <button onClick={handleNavigateUp} className="hover:bg-gray-100 p-2 rounded-full mr-3 transition-colors">
                   <FiArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
              )}
              <h2>
                {currentView === 'my-drive' && (currentFolder ? currentFolder.name : 'My Drive')}
                {currentView === 'starred' && 'Starred'}
                {currentView === 'trash' && 'Trash'}
              </h2>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
               <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="form-select text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                <option value="folder">Folders</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="pdf">PDFs</option>
              </select>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select text-sm border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="name">Name</option>
                <option value="date">Date Modified</option>
                <option value="size">Size</option>
              </select>

              <div className="text-sm text-gray-500 border-l pl-3 ml-2">
                <span className="font-medium text-gray-900">{files.length}</span> items
              </div>
            </div>
          </div>

          {/* Upload Zone (Only in My Drive) */}
          {currentView === 'my-drive' && (
            <div className="mb-8">
              <UploadZone onFilesSelected={handleFilesSelected} uploading={uploading} />
            </div>
          )}

        {/* Files Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="spinner w-12 h-12 border-4 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your files...</p>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-20">
            <FiFile className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No files yet</h3>
            <p className="text-gray-500">Upload files or create folders to get started</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Folders Section */}
            {folders.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FiFolder className="w-5 h-5 mr-2 text-yellow-500" />
                  Folders
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folders.map((file) => (
                    <FileCard
                      key={file._id}
                      file={file}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                      onStar={handleStar}
                      onRestore={handleRestore}
                      isTrashView={currentView === 'trash'}
                      onClick={(e) => {
                        // If folder, navigate into it
                        if (file.isFolder) {
                           handleFolderClick(file);
                        } else if (!['trash'].includes(currentView)) {
                          e.stopPropagation();
                          setPreviewFile(file);
                          setShowPreview(true);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Files Section */}
            {regularFiles.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FiFile className="w-5 h-5 mr-2 text-primary-500" />
                  Files
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regularFiles.map((file) => (
                    <FileCard
                      key={file._id}
                      file={file}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                      onStar={handleStar}
                      onRestore={handleRestore}
                      isTrashView={currentView === 'trash'}
                      onClick={(e) => {
                        // If it's not a folder, open preview
                        if (!file.isFolder && !['trash'].includes(currentView)) {
                          e.stopPropagation();
                          setPreviewFile(file);
                          setShowPreview(true);
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </main>
      </div>

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreateFolder={handleCreateFolder}
        loading={creatingFolder}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={showPreview}
        file={previewFile}
        onClose={() => {
          setShowPreview(false);
          setPreviewFile(null);
        }}
      />
      
      {/* Share Modal */}
      <ShareModal
        isOpen={showShare}
        file={shareFile}
        onClose={() => {
          setShowShare(false);
          setShareFile(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
