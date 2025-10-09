import { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseVideoManager = ({ videos = [], onVideosChange }) => {
  const [editingIndex, setEditingIndex] = useState(-1);
  const [newVideo, setNewVideo] = useState({
    title: '',
    videoLink: '',
    duration: '0:00',
    isPreview: false
  });

  const addVideo = () => {
    if (!newVideo.title || !newVideo.videoLink) {
      toast.error('Please fill in video title and link');
      return;
    }

    const video = {
      id: `video-${Date.now()}`,
      title: newVideo.title,
      videoLink: newVideo.videoLink,
      duration: newVideo.duration,
      isPreview: newVideo.isPreview,
      order: videos.length
    };

    console.log('Adding video:', video);
    console.log('Current videos:', videos);
    const updatedVideos = [...videos, video];
    console.log('Updated videos:', updatedVideos);
    
    onVideosChange(updatedVideos);
    setNewVideo({
      title: '',
      videoLink: '',
      duration: '0:00',
      isPreview: false
    });
    toast.success('Video added successfully');
  };

  const updateVideo = (index, updatedVideo) => {
    const updatedVideos = [...videos];
    updatedVideos[index] = { ...updatedVideos[index], ...updatedVideo };
    onVideosChange(updatedVideos);
    setEditingIndex(-1);
    toast.success('Video updated successfully');
  };

  const deleteVideo = (index) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    onVideosChange(updatedVideos);
    toast.success('Video deleted successfully');
  };

  const startEditing = (index) => {
    setEditingIndex(index);
  };

  const cancelEditing = () => {
    setEditingIndex(-1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Course Videos</h3>
        <span className="text-sm text-gray-500">{videos.length} videos</span>
      </div>

      {/* Add New Video Form */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Add New Video</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video Title *
            </label>
            <input
              type="text"
              value={newVideo.title}
              onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
              placeholder="e.g., Introduction to React"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Video Link *
            </label>
            <input
              type="url"
              value={newVideo.videoLink}
              onChange={(e) => setNewVideo({ ...newVideo, videoLink: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports YouTube URLs (watch or youtu.be format) and Vimeo URLs
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration
            </label>
            <input
              type="text"
              value={newVideo.duration}
              onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
              placeholder="e.g., 15:30"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newVideo.isPreview}
                onChange={(e) => setNewVideo({ ...newVideo, isPreview: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Preview (Free)</span>
            </label>
          </div>
        </div>
        <button
          onClick={addVideo}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Video
        </button>
      </div>

      {/* Videos List */}
      {videos.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Videos List</h4>
          {videos.map((video, index) => (
            <div key={video.id} className="bg-white border border-gray-200 rounded-lg p-4">
              {editingIndex === index ? (
                <EditVideoForm
                  video={video}
                  onSave={(updatedVideo) => updateVideo(index, updatedVideo)}
                  onCancel={cancelEditing}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">
                        {index + 1}.
                      </span>
                      <div>
                        <h5 className="font-medium text-gray-900">{video.title}</h5>
                        <p className="text-sm text-gray-500">{video.videoLink}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500">{video.duration}</span>
                          {video.isPreview && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Preview
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(index)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteVideo(index)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {videos.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No videos added yet. Add your first video above.</p>
        </div>
      )}
    </div>
  );
};

const EditVideoForm = ({ video, onSave, onCancel }) => {
  const [editedVideo, setEditedVideo] = useState(video);

  const handleSave = () => {
    if (!editedVideo.title || !editedVideo.videoLink) {
      toast.error('Please fill in video title and link');
      return;
    }
    onSave(editedVideo);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video Title
          </label>
          <input
            type="text"
            value={editedVideo.title}
            onChange={(e) => setEditedVideo({ ...editedVideo, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video Link
          </label>
          <input
            type="url"
            value={editedVideo.videoLink}
            onChange={(e) => setEditedVideo({ ...editedVideo, videoLink: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supports YouTube URLs (watch or youtu.be format) and Vimeo URLs
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration
          </label>
          <input
            type="text"
            value={editedVideo.duration}
            onChange={(e) => setEditedVideo({ ...editedVideo, duration: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editedVideo.isPreview}
              onChange={(e) => setEditedVideo({ ...editedVideo, isPreview: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Preview (Free)</span>
          </label>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CourseVideoManager;
