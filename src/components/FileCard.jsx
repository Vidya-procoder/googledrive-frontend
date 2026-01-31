import { FiFolder, FiFile, FiImage, FiVideo, FiMusic, FiFileText, FiArchive } from 'react-icons/fi';
import { SiMicrosoftword, SiMicrosoftexcel, SiMicrosoftpowerpoint, SiAdobeacrobatreader } from 'react-icons/si';
import { getFileIcon, getFileColor, formatFileSize, formatDate } from '../utils/fileHelpers';
import { FiDownload, FiTrash2, FiStar, FiRefreshCw, FiShare2 } from 'react-icons/fi';

const FileCard = ({ file, onDownload, onDelete, onStar, onRestore, onShare, isTrashView, onClick }) => {
  const iconType = getFileIcon(file.mimeType, file.isFolder);
  const colorClass = getFileColor(iconType);

  const getIcon = () => {
    const iconProps = { className: `w-10 h-10 ${colorClass}` };
    
    switch (iconType) {
      case 'folder':
        return <FiFolder {...iconProps} />;
      case 'image':
        return <FiImage {...iconProps} />;
      case 'video':
        return <FiVideo {...iconProps} />;
      case 'audio':
        return <FiMusic {...iconProps} />;
      case 'pdf':
        return <SiAdobeacrobatreader {...iconProps} />;
      case 'document':
        return <SiMicrosoftword {...iconProps} />;
      case 'spreadsheet':
        return <SiMicrosoftexcel {...iconProps} />;
      case 'presentation':
        return <SiMicrosoftpowerpoint {...iconProps} />;
      case 'archive':
        return <FiArchive {...iconProps} />;
      case 'text':
        return <FiFileText {...iconProps} />;
      default:
        return <FiFile {...iconProps} />;
    }
  };

  return (
    <div 
      className={`card card-hover p-4 group cursor-pointer relative ${file.isFolder ? 'bg-yellow-50/50 hover:bg-yellow-50' : ''}`}
      onClick={onClick}
    >
      <div className="absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100 z-10 px-1">
          {!isTrashView && (
            <button
              onClick={(e) => { e.stopPropagation(); onStar(file); }}
              className={`p-2 rounded-lg transition-colors ${file.isStarred ? 'text-yellow-400 hover:bg-yellow-50' : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-50'}`}
              title={file.isStarred ? "Unstar" : "Star"}
            >
              <FiStar className={`w-4 h-4 ${file.isStarred ? 'fill-current' : ''}`} />
            </button>
          )}

          {!isTrashView && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(file); }}
              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Download"
            >
              <FiDownload className="w-4 h-4" />
            </button>
          )}

          {isTrashView && (
            <button
              onClick={(e) => { e.stopPropagation(); onRestore(file); }}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Restore"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onDelete(file); }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title={isTrashView ? "Delete Forever" : "Move to Trash"}
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
      </div>

      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
            {file.name}
          </h3>
          <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
            {!file.isFolder && (
              <>
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
              </>
            )}
            <span>{formatDate(file.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
