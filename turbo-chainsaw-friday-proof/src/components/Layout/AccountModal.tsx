import React, { useState } from 'react';
import { X, User, Building2, Mail, Phone, MapPin, Save, Edit3 } from 'lucide-react';
import { User as UserType, Account } from '../../types';

interface AccountModalProps {
  user: UserType | null;
  account: Account | null;
  onClose: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ user, account, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    accountName: account?.name || '',
    // Add more fields as needed
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving account data:', formData);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user || !account) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-glass-gradient-light dark:bg-glass-gradient-dark border border-glass-border-light dark:border-glass-border-dark rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-md shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-white/10 p-6 flex items-center justify-between backdrop-blur-md z-10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[var(--accent-orange)] rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
              <p className="text-gray-700 dark:text-gray-300">Manage your profile and account information</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
              aria-label={isEditing ? "Cancel editing" : "Edit profile"}
            >
              <Edit3 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-white/20 dark:hover:bg-white/10"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Personal Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 bg-white/30 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-lg text-gray-900 dark:text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-sunset-purple focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">{user.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 bg-white/30 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-lg text-gray-900 dark:text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-sunset-purple focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">{user.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <p className="text-gray-900 dark:text-white py-2 capitalize">{user.role}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Type
                </label>
                <p className="text-gray-900 dark:text-white py-2 capitalize">{user.accountType}</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white/20 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
              <Building2 className="w-5 h-5" />
              <span>Account Information</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) => handleInputChange('accountName', e.target.value)}
                    className="w-full px-3 py-2 bg-white/30 dark:bg-white/10 border border-white/20 dark:border-white/10 rounded-lg text-gray-900 dark:text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-sunset-purple focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white py-2">{account.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account Type
                </label>
                <p className="text-gray-900 dark:text-white py-2 capitalize">{account.type}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Account ID
                </label>
                <p className="text-gray-600 dark:text-gray-400 py-2 font-mono text-sm">{account.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Created
                </label>
                <p className="text-gray-900 dark:text-white py-2">{new Date(account.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isEditing && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountModal;