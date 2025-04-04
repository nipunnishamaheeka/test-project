import React, { useState } from 'react';
import { UserService } from '../services/user.service';

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

// Define props for the component
interface UserCreationFormProps {
  onUserCreated?: (user: UserFormData) => void;
}

// Initial form state
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

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add metadata key-value pair
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
    // UID is required and must contain at least one non-digit
    if (!formData.uid) {
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
    
    // Email validation (basic)
    if (formData.email && !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Use the UserService instead of direct fetch
      const response = await UserService.createUser(formData);
      
      setSuccess(true);
      
      // Call the callback if provided
      if (onUserCreated) {
        onUserCreated(response);
      }
      
      // Reset form after successful submission
      setFormData(initialFormState);
      
    } catch (err) {
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
              <input
                className="bg-gray-800 border border-gray-700 rounded-lg w-full py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="text"
                id="picture"
                name="picture"
                value={formData.picture}
                onChange={handleInputChange}
                placeholder="URL, data URI, or blob ID"
              />
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