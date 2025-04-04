import React, { useState, useEffect } from 'react';
import UserCreationForm from './user'; // Fixed import path
import { UserService, User } from '../services/user.service';

interface User {
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

const HomePage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Use UserService instead of direct fetch
        const data = await UserService.getAllUsers();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
        // Fallback to sample data in case of error
        setUsers(sampleUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const searchString = searchTerm.toLowerCase();
    return (
      user.uid.toLowerCase().includes(searchString) ||
      (user.name?.toLowerCase().includes(searchString) || false) ||
      (user.email?.toLowerCase().includes(searchString) || false)
    );
  });

  // Handle user creation success
  const handleUserCreated = (newUser: User) => {
    setUsers(prevUsers => [...prevUsers, newUser]);
    setShowCreateForm(false);
  };

  // Handle user deletion
  const handleDeleteUser = async (uid: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Use UserService delete method
        await UserService.deleteUser(uid);
        setUsers(prevUsers => prevUsers.filter(user => user.uid !== uid));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
      }
    }
  };

  // View user details
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
  };

  const closeDetailsModal = () => {
    setSelectedUser(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-black text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {showCreateForm ? 'Cancel' : 'Create User'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-white px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create User Form Modal - Updated for better UI */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-all duration-300">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-0 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn border border-gray-700">
            <div className="bg-gray-800 p-6 border-b border-gray-700 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Create New User</h2>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-full p-2 transition-colors"
                  aria-label="Close modal"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-400 mt-2">Fill in the details to create a new user</p>
            </div>
            
            <div className="p-6">
              <UserCreationForm onUserCreated={handleUserCreated} />
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-screen overflow-y-auto border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">User Details</h2>
              <button 
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold mb-2 text-gray-300">Basic Information</h3>
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <p className="text-white"><strong className="text-gray-300">User ID:</strong> {selectedUser.uid}</p>
                  <p className="text-white"><strong className="text-gray-300">Full Name:</strong> {selectedUser.name || 'N/A'}</p>
                  <p className="text-white"><strong className="text-gray-300">Given Name:</strong> {selectedUser.given_name || 'N/A'}</p>
                  <p className="text-white"><strong className="text-gray-300">Middle Name:</strong> {selectedUser.middle_name || 'N/A'}</p>
                  <p className="text-white"><strong className="text-gray-300">Family Name:</strong> {selectedUser.family_name || 'N/A'}</p>
                  <p className="text-white"><strong className="text-gray-300">Nickname:</strong> {selectedUser.nickname || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-2 text-gray-300">Contact Information</h3>
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <p className="text-white"><strong className="text-gray-300">Email:</strong> {selectedUser.email || 'N/A'}</p>
                  <p className="text-white"><strong className="text-gray-300">Phone:</strong> {selectedUser.phone_number || 'N/A'}</p>
                  <p className="text-white"><strong className="text-gray-300">Directory:</strong> {selectedUser.directory || 'N/A'}</p>
                  <p className="text-white"><strong className="text-gray-300">Comment:</strong> {selectedUser.comment || 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-bold mb-2 text-gray-300">Profile Picture</h3>
              {selectedUser.picture ? (
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <img 
                    src={selectedUser.picture} 
                    alt={`${selectedUser.name || selectedUser.uid}'s profile`}
                    className="h-20 w-20 object-cover rounded"
                  />
                </div>
              ) : (
                <div className="bg-gray-800 p-4 rounded border border-gray-700 text-white">No profile picture</div>
              )}
            </div>
            
            <div className="mt-4">
              <h3 className="font-bold mb-2 text-gray-300">Tags</h3>
              <div className="bg-gray-800 p-4 rounded border border-gray-700">
                {selectedUser.tags && selectedUser.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.tags.map(tag => (
                      <span key={tag} className="bg-blue-900 text-blue-300 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-white">No tags assigned</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="font-bold mb-2 text-gray-300">Metadata</h3>
              <div className="bg-gray-800 p-4 rounded border border-gray-700">
                {selectedUser.metadata && Object.keys(selectedUser.metadata).length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedUser.metadata).map(([key, value]) => (
                      <div key={key} className="bg-gray-700 p-2 rounded text-white">
                        <strong className="text-gray-300">{key}:</strong> {JSON.stringify(value)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white">No metadata available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search users by ID, name or email..."
          className="w-full md:w-1/3 px-4 py-2 border rounded bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{user.uid}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.picture ? (
                        <img
                          className="h-8 w-8 rounded-full mr-2 object-cover"
                          src={user.picture}
                          alt={`${user.name || user.uid}'s profile`}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-700 mr-2 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-300">
                            {(user.name || user.uid).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="text-sm font-medium text-white">
                        {user.name || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{user.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{user.phone_number || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(user.tags || []).slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-900 text-blue-300"
                        >
                          {tag}
                        </span>
                      ))}
                      {(user.tags || []).length > 2 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-700 text-gray-300">
                          +{user.tags!.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="text-blue-400 hover:text-blue-300 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.uid)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Sample data for demonstration
const sampleUsers: User[] = [
  {
    uid: "john_doe",
    name: "John Doe",
    given_name: "John",
    family_name: "Doe",
    email: "john.doe@example.com",
    phone_number: "+1 (555) 123-4567",
    picture: "https://i.pravatar.cc/150?img=1",
    tags: ["admin", "developer"],
    metadata: { department: "Engineering", level: "Senior" }
  },
  {
    uid: "jane_smith",
    name: "Jane Smith",
    given_name: "Jane",
    middle_name: "Elizabeth",
    family_name: "Smith",
    email: "jane.smith@example.com",
    phone_number: "+1 (555) 987-6543",
    picture: "https://i.pravatar.cc/150?img=5",
    tags: ["manager", "marketing"],
    metadata: { department: "Marketing", region: "West" }
  },
  {
    uid: "robert_johnson",
    name: "Robert Johnson",
    given_name: "Robert",
    family_name: "Johnson",
    nickname: "Rob",
    email: "rob.johnson@example.com",
    phone_number: "+1 (555) 456-7890",
    tags: ["support", "customer-success"],
    metadata: { department: "Customer Success", startDate: "2023-01-15" }
  },
  {
    uid: "sarah_williams",
    name: "Sarah Williams",
    given_name: "Sarah",
    family_name: "Williams",
    email: "sarah.williams@example.com",
    directory: "external",
    tags: ["contractor", "design"],
    metadata: { contract: "6 months", expertise: "UI/UX" }
  },
  {
    uid: "michael_brown",
    name: "Michael Brown",
    given_name: "Michael",
    family_name: "Brown",
    email: "michael.brown@example.com",
    phone_number: "+1 (555) 234-5678",
    comment: "Part-time employee",
    tags: ["finance", "part-time"],
    metadata: { hours: "20 per week", location: "Remote" }
  }
];
const styles = document.createElement('style');
styles.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.25s ease-out;
  }
`;
document.head.appendChild(styles);

export default HomePage;