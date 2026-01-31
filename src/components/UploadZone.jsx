import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUploadCloud, FiFile } from 'react-icons/fi';

const UploadZone = ({ onFilesSelected, uploading }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading
  });

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${
        uploading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center">
        {isDragActive ? (
          <>
            <FiFile className="w-12 h-12 text-primary-500 mb-3 animate-bounce" />
            <p className="text-lg font-semibold text-primary-600">Drop files here...</p>
          </>
        ) : (
          <>
            <FiUploadCloud className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-lg font-semibold text-gray-700 mb-1">
              {uploading ? 'Uploading...' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-500">or click to browse</p>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadZone;
