import React, { useState } from 'react';
import { UserService, User, UserDirectory, UserPicture } from '../services/user.service';

interface UserFormData {
  uid: string;
  name?: string;
  given_name?: string;
  middle_name?: string;
  family_name?: string;
  nickname?: string;
  email?: string;
  phone_number?: string;
  comment?: string;
  picture?: string; 
  directory?: string; 
  metadata?: Record<string, any>;
  tags?: string[];
}

interface UserCreationFormProps {
  onUserCreated?: (user: User) => void;
}
const initialFormState: UserFormData = {
  uid: '',
  name: '',
  given_name: '',
  middle_name: '',
  family_name: '',
  nickname: '',
  email: '',
  phone_number: '',
  comment: '',
  picture: '',
  directory: '',
  metadata: {},
  tags: [],
};

const UserCreationForm: React.FC<UserCreationFormProps> = ({ onUserCreated }) => {
  const [formData, setFormData] = useState<UserFormData>(initialFormState);
  const [metadataKey, setMetadataKey] = useState<string>('');
  const [metadataValue, setMetadataValue] = useState<string>('');
  const [tag, setTag] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMetadata = () => {
    if (!metadataKey.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [metadataKey]: metadataValue,
      },
    }));
    
    setMetadataKey('');
    setMetadataValue('');
  };

  // Remove metadata item
  const handleRemoveMetadata = (key: string) => {
    const newMetadata = { ...formData.metadata };
    delete newMetadata[key];
    
    setFormData(prev => ({
      ...prev,
      metadata: newMetadata,
    }));
  };

  // Add tag
  const handleAddTag = () => {
    if (!tag.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tag],
    }));
    
    setTag('');
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tagToRemove) || [],
    }));
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    if (!formData.uid || formData.uid.trim() === '') {
      setError('User ID is required');
      return false;
    }
    
    if (!formData.uid.match(/[^0-9]/)) {
      setError('User ID must contain at least one non-digit character');
      return false;
    }
    
    if (formData.uid.includes(' ')) {
      setError('User ID cannot contain whitespace');
      return false;
    }
    
    if (formData.email && !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.match('image.*')) {
      setError('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }
    
    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setFormData(prev => ({ ...prev, picture: base64String }));
    };
    reader.onerror = () => {
      setError('Failed to read the image file');
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const cleanedData: Partial<User> = {};
      
      cleanedData.uid = formData.uid.trim();
      
      if (formData.name && formData.name.trim()) cleanedData.name = formData.name.trim();
      if (formData.given_name && formData.given_name.trim()) cleanedData.given_name = formData.given_name.trim();
      if (formData.middle_name && formData.middle_name.trim()) cleanedData.middle_name = formData.middle_name.trim();
      if (formData.family_name && formData.family_name.trim()) cleanedData.family_name = formData.family_name.trim();
      if (formData.nickname && formData.nickname.trim()) cleanedData.nickname = formData.nickname.trim();
      if (formData.email && formData.email.trim()) cleanedData.email = formData.email.trim();
      if (formData.phone_number && formData.phone_number.trim()) cleanedData.phone_number = formData.phone_number.trim();
      if (formData.comment && formData.comment.trim()) cleanedData.comment = formData.comment.trim();
      
      if (formData.directory && formData.directory.trim()) {
        cleanedData.directory = formData.directory.trim();
      }
      
      // Handle picture field
      if (formData.picture && formData.picture.trim()) {
        cleanedData.picture = formData.picture.trim();
      }
      
      // Add non-empty arrays
      if (formData.tags && formData.tags.length > 0) {
        cleanedData.tags = formData.tags;
      }
      
      // Add non-empty objects
      if (formData.metadata && Object.keys(formData.metadata).length > 0) {
        cleanedData.metadata = formData.metadata;
      }
      
      console.log('Submitting user data:', cleanedData);
      
      // Use the UserService to create the user
      const response = await UserService.createUser(cleanedData);
      
      console.log('User creation successful:', response);
      
      setSuccess(true);
      
      // Call the callback if provided
      if (onUserCreated) {
        onUserCreated(response);
      }
      
      setFormData(initialFormState);
      setImagePreview(null);
      
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black py-8">
      <div className="max-w-3xl w-full mx-auto bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-700 my-10 transform transition-all hover:shadow-xl">
        <h2 className="text-3xl font-bold mb-8 text-white text-center border-b border-gray-700 pb-4">Create User Account</h2>
        
        {error && (
          <div className="bg-red-900 border-l-4 border-red-500 text-white px-4 py-3 rounded-md mb-6 animate-pulse">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-900 border-l-4 border-green-500 text-white px-4 py-3 rounded-md mb-6 animate-pulse">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <p>User created successfully!</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required field */}
          <div className="mb-6">
            <label className="block text-gray-300 font-bold mb-2" htmlFor="uid">
              User ID <span className="text-red-500">*</span>
            </label>
            <input
              className="bg-gray-800 border border-gray-700 rounded-lg w-full py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              type="text"
              id="uid"
              name="uid"
              value={formData.uid}
              onChange={handleInputChange}
              placeholder="Unique user identifier (no spaces, at least one non-digit)"
              required
            />
            <p className="text-sm text-gray-400 mt-1">Cannot contain whitespace and must have at least one non-digit character</p>
          </div>
          
          {/* Basic information */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-700 pb-2">Basic Information</h3>
            <div className="mb-4">
              <label className="block text-gray-300 font-bold mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                className="bg-gray-800 border border-gray-700 rounded-lg w-full py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full displayable name"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-gray-300 font-bold mb-2" htmlFor="given_name">
                  Given/First Name
                </label>
                <input
                  className="bg-gray-800 border border-gray-700 rounded-lg w-full py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type="text"
                  id="given_name"
                  name="given_name"
                  value={formData.given_name}
                  onChange={handleInputChange}
                  placeholder="First name"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 font-bold mb-2" htmlFor="middle_name">
                  Middle Name
                </label>
                <input
                  className="bg-gray-800 border border-gray-700 rounded-lg w-full py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type="text"
                  id="middle_name"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleInputChange}
                  placeholder="Middle name"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 font-bold mb-2" htmlFor="family_name">
                  Family/Last Name
                </label>
                <input
                  className="bg-gray-800 border border-gray-700 rounded-lg w-full py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type="text"
                  id="family_name"
                  name="family_name"
                  value={formData.family_name}
                  onChange={handleInputChange}
                  placeholder="Last name"
                />
              </div>
            </div>
            
            {/* Contact information */}
            <div className="mb-4">
              <label className="block text-gray-300 font-bold mb-2" htmlFor="nickname">
                Nickname
              </label>
              <input
                className="bg-gray-800 border border-gray-700 rounded-lg w-full py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="text"
                id="nickname"
                name="nickname"
                value={formData.nickname}
                onChange={handleInputChange}
                placeholder="Casual name or alias"
              />
            </div>
          </div>
          
          {/* Contact information section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-700 pb-2">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-300 font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="bg-gray-800 border border-gray-700 rounded-lg w-full py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email address"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 font-bold mb-2" htmlFor="phone_number">
                  Phone Number
                </label>
                <input
                  className="bg-gray-800 border border-gray-700 rounded-lg w-full py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="Preferred phone number"
                />
              </div>
            </div>
          </div>
          
          {/* Additional information */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-200 border-b border-gray-700 pb-2">Additional Information</h3>
            <div className="mb-4">
              <label className="block text-gray-300 font-bold mb-2" htmlFor="comment">
                Comment
              </label>
              <textarea
                className="bg-gray-800 border border-gray-700 rounded-lg w-full py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleInputChange}
                placeholder="Additional information about the user"
                rows={3}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 font-bold mb-2" htmlFor="picture">
                Profile Picture
              </label>
              <div className="flex flex-col space-y-4">
                {/* Image preview area */}
                {imagePreview && (
                  <div className="relative w-32 h-32 overflow-hidden rounded-lg border-2 border-blue-500 mb-2">
                    <img 
                      src={imagePreview} 
                      alt="Profile preview" 
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, picture: '' }));
                      }}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {/* File upload input */}
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center">
                    <label className="flex flex-col items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                      </svg>
                      <span className="mt-2 text-base leading-normal">Upload Image</span>
                      <input type='file' className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                    <span className="ml-3 text-sm text-gray-400">or</span>
                  </div>
                  
                  {/* URL input field */}
                  <input
                    className="bg-gray-800 border border-gray-700 rounded-lg w-full py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    type="text"
                    id="picture"
                    name="picture"
                    value={(formData.picture ?? "").startsWith("data:image") ? "" : formData.picture ?? ""}
                    onChange={handleInputChange}
                    placeholder="Enter image URL"
                  />
                </div>
                <p className="text-sm text-gray-400">Upload an image or provide a URL. Max size: 5MB.</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 font-bold mb-2" htmlFor="directory">
                Directory
              </label>
              <input
                className="bg-gray-800 border border-gray-700 rounded-lg w-full py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="text"
                id="directory"
                name="directory"
                value={formData.directory}
                onChange={handleInputChange}
                placeholder="ID or name of user directory"
              />
            </div>
          </div>
          
          {/* Metadata section */}
          <div className="mb-6 p-6 border-2 border-blue-900 rounded-lg bg-gray-800 shadow-sm">
            <h3 className="font-bold mb-4 text-blue-400 flex items-center text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Metadata
            </h3>
            
            <div className="flex flex-col md:flex-row gap-2 mb-2">
              <input
                className="bg-gray-700 border border-gray-600 rounded-lg flex-1 py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="text"
                value={metadataKey}
                onChange={(e) => setMetadataKey(e.target.value)}
                placeholder="Key"
              />
              <input
                className="bg-gray-700 border border-gray-600 rounded-lg flex-1 py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="text"
                value={metadataValue}
                onChange={(e) => setMetadataValue(e.target.value)}
                placeholder="Value"
              />
              <button
                type="button"
                onClick={handleAddMetadata}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 ease-in-out shadow-md"
              >
                Add
              </button>
            </div>
            
            {Object.keys(formData.metadata || {}).length > 0 && (
              <div className="mt-4 space-y-2">
                {Object.entries(formData.metadata || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg border border-gray-600 shadow-sm hover:shadow-md transition-all">
                    <span className="text-white">
                      <strong className="text-blue-400">{key}:</strong> {String(value)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMetadata(key)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900 p-2 rounded-full transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Tags section */}
          <div className="mb-6 p-6 border-2 border-green-900 rounded-lg bg-gray-800 shadow-sm">
            <h3 className="font-bold mb-4 text-green-400 flex items-center text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Tags
            </h3>
            
            <div className="flex flex-col md:flex-row gap-2 mb-2">
              <input
                className="bg-gray-700 border border-gray-600 rounded-lg flex-1 py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 ease-in-out shadow-md"
              >
                Add
              </button>
            </div>
            
            {(formData.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {formData.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="bg-green-900 text-green-300 px-3 py-2 rounded-full flex items-center shadow-sm transition-all hover:shadow animate-fadeIn"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-green-400 hover:bg-green-800 rounded-full p-1 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Submit button */}
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-4 rounded-lg font-bold shadow-lg hover:shadow-xl transform transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserCreationForm;