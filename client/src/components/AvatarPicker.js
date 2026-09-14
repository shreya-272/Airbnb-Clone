import React, { useRef, useState } from 'react';
import { Camera, Upload, Check, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';

export const AVATAR_SUGGESTIONS = [
  {
    id: 'suggest-1',
    label: 'Coastal Traveler',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'suggest-2',
    label: 'Alpine Adventurer',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'suggest-3',
    label: 'Architecture Enthusiast',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'suggest-4',
    label: 'Tropical Explorer',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'suggest-5',
    label: 'Serenity Seeker',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
  },
  {
    id: 'suggest-6',
    label: 'Global Voyager',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
  },
];

export default function AvatarPicker({ value, onChange, label = 'Profile Picture' }) {
  const fileInputRef = useRef(null);
  const [uploadError, setUploadError] = useState('');
  const [isDeviceUpload, setIsDeviceUpload] = useState(false);

  const handleDeviceUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setUploadError('');

    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose a valid image file (PNG, JPG, WEBP).');
      return;
    }

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setIsDeviceUpload(true);
      onChange(dataUrl);
    };
    reader.onerror = () => {
      setUploadError('Failed to read image from your device. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSuggestion = (suggestUrl) => {
    setUploadError('');
    setIsDeviceUpload(false);
    onChange(suggestUrl);
  };

  const currentAvatar =
    value ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase text-airbnb-black">
          {label}
        </label>
        {isDeviceUpload && (
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Uploaded from Device
          </span>
        )}
      </div>

      {/* Main Avatar Preview & Upload Action */}
      <div className="flex items-center space-x-4 p-3.5 bg-airbnb-bgSubtle rounded-2xl border border-airbnb-border">
        {/* Large Preview Circle */}
        <div className="relative flex-shrink-0">
          <img
            src={currentAvatar}
            alt="Profile preview"
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
          />
          <button
            type="button"
            onClick={handleDeviceUploadClick}
            className="absolute -bottom-1 -right-1 bg-airbnb-black hover:bg-brand text-white p-1.5 rounded-full shadow transition cursor-pointer"
            title="Upload photo from device"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Upload from Device CTA */}
        <div className="flex-1 min-w-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={handleDeviceUploadClick}
            className="inline-flex items-center space-x-2 bg-white hover:bg-slate-50 text-airbnb-black font-semibold text-xs px-3.5 py-2 rounded-xl border border-airbnb-border shadow-xs transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-brand" />
            <span>Upload from device</span>
          </button>
          <p className="text-[11px] text-airbnb-gray mt-1 truncate">
            Supports PNG, JPG, or WEBP up to 5MB
          </p>
        </div>
      </div>

      {/* Error message */}
      {uploadError && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Suggested Profile Pictures Section */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-airbnb-gray">
          <Sparkles className="w-3.5 h-3.5 text-brand" />
          <span>Or choose from suggested avatars</span>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {AVATAR_SUGGESTIONS.map((item) => {
            const isSelected = value === item.url;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectSuggestion(item.url)}
                className={`group relative rounded-full p-0.5 transition cursor-pointer focus:outline-none ${
                  isSelected
                    ? 'ring-2 ring-brand ring-offset-2 scale-105'
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                title={item.label}
              >
                <img
                  src={item.url}
                  alt={item.label}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-200"
                />
                {isSelected && (
                  <span className="absolute bottom-0 right-0 bg-brand text-white p-0.5 rounded-full shadow">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
