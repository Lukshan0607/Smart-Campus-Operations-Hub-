import React, { useState } from 'react';
import { useTickets } from '../../hooks/useTickets';

const AttachmentUpload = ({ ticketId, attachments = [] }) => {
  const { uploadAttachments, loading, error } = useTickets();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadError, setUploadError] = useState('');

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setUploadError('');

    if (files.length + attachments.length > 3) {
      setUploadError('Maximum 3 attachments allowed per ticket');
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`${file.name} exceeds 5MB size limit`);
        return false;
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setUploadError(`${file.name} is not a valid image type (jpeg/png/webp)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      await uploadAttachments(ticketId, selectedFiles);
      setSelectedFiles([]);
      setUploadError('');
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Failed to upload files');
    }
  };

  return (
    <div className="mt-8 pb-6 border-b">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Attachments</h2>

      {/* File Upload */}
      <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={loading || attachments.length >= 3}
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-2">
          Max 3 files, 5MB each. Allowed: JPEG, PNG, WebP
        </p>
      </div>

      {(uploadError || error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-800">
          {uploadError || error}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Selected Files ({selectedFiles.length})</h3>
          <ul className="space-y-2 mb-4">
            {selectedFiles.map((file, idx) => (
              <li key={idx} className="text-sm text-gray-700">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      )}

      {/* Attachments List */}
      {attachments && attachments.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Current Attachments</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <p className="text-sm font-semibold text-blue-600 truncate">{attachment.filename}</p>
                <p className="text-xs text-gray-500 mt-1">{attachment.uploadedByName}</p>
                <p className="text-xs text-gray-400">{new Date(attachment.uploadedAt).toLocaleDateString()}</p>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentUpload;
