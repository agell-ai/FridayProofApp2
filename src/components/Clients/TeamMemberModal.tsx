import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, User, Briefcase, Award } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  skills: string[];
  projects: string[];
  completedProjects: number;
  joinDate: string;
  location?: string;
}

interface TeamMemberModalProps {
  member: TeamMember;
  onClose: () => void;
}

export const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ member, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Team Member Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {member.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{member.role}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                member.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : member.status === 'inactive'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Contact Information
              </h4>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <a 
                  href={`mailto:${member.email}`}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {member.email}
                </a>
              </div>

              {member.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{member.phone}</span>
                </div>
              )}

              {member.location && (
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{member.location}</span>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Joined {new Date(member.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Company & Role
              </h4>
              
              <div className="flex items-center space-x-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">{member.company}</span>
              </div>

              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {member.completedProjects} projects completed
                </span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {member.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Current Projects */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Current Projects ({member.projects.length})
            </h4>
            <div className="space-y-2">
              {member.projects.map((project, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-gray-700 dark:text-gray-300">{project}</span>
                </div>
              ))}
              {member.projects.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No current projects assigned
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};