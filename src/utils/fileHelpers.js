// Format file size to human readable format
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Format date to relative time
export const formatDate = (date) => {
  const now = new Date();
  const fileDate = new Date(date);
  const diffTime = Math.abs(now - fileDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      if (diffMinutes === 0) {
        return 'Just now';
      }
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    }
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return fileDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

// Get file icon based on mime type
export const getFileIcon = (mimeType, isFolder) => {
  if (isFolder) return 'folder';
  
  if (!mimeType) return 'file';
  
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
  if (mimeType.includes('text/')) return 'text';
  
  return 'file';
};

// Get file color based on type
export const getFileColor = (type) => {
  const colors = {
    folder: 'text-yellow-500',
    image: 'text-purple-500',
    video: 'text-red-500',
    audio: 'text-green-500',
    pdf: 'text-red-600',
    document: 'text-blue-500',
    spreadsheet: 'text-green-600',
    presentation: 'text-orange-500',
    archive: 'text-gray-600',
    text: 'text-gray-500',
    file: 'text-gray-400'
  };
  
  return colors[type] || colors.file;
};
