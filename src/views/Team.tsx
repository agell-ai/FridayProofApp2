import React, { useState } from 'react';
import { Plus, Users, Mail, Phone, MapPin, BarChart3, User } from 'lucide-react';
import { useTeam } from '../hooks/useTeam';
import TeamMemberModal from '../components/Clients/TeamMemberModal';
import { Card } from '../components/Shared/Card';
import { Button } from '../components/Shared/Button';

const Team: React.FC = () => {
  const { teamMembers, isLoading } = useTeam();
  const [selectedTeamMember, setSelectedTeamMember] = useState(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sunset-purple"></div>
      </div>
    );
  }

  // Calculate team statistics
  const activeMembers = teamMembers.filter(member => member.status === 'active').length;
  const avgProductivity = teamMembers.length > 0
    ? Math.round(teamMembers.reduce((sum, member) => sum + member.analytics.monthlyProductivity, 0) / teamMembers.length)
    : 0;
  const totalHours = teamMembers.reduce((sum, member) => sum + member.analytics.hoursWorked, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Team</h1>
          <p className="text-[var(--fg-muted)]">Manage your team members and track their performance</p>
        </div>
        <Button glowOnHover className="font-semibold text-white group-hover:text-white group-focus-within:text-white">
          <Plus className="w-5 h-5" />
          <span>Add Team Member</span>
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)]">Total Members</p>
              <p className="text-3xl font-bold text-[var(--fg)] mt-2">{teamMembers.length}</p>
            </div>
            <div className="p-3 bg-[var(--surface)] rounded-lg">
              <Users className="w-6 h-6 text-[var(--fg-muted)]" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)]">Active Members</p>
              <p className="text-3xl font-bold text-[var(--fg)] mt-2">{activeMembers}</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {Math.round((activeMembers / teamMembers.length) * 100)}% active
              </p>
            </div>
            <div className="p-3 bg-[var(--surface)] rounded-lg">
              <User className="w-6 h-6 text-[var(--fg-muted)]" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)]">Avg Productivity</p>
              <p className="text-3xl font-bold text-[var(--fg)] mt-2">{avgProductivity}%</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">This month</p>
            </div>
            <div className="p-3 bg-[var(--surface)] rounded-lg">
              <BarChart3 className="w-6 h-6 text-[var(--fg-muted)]" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)]">Total Hours</p>
              <p className="text-3xl font-bold text-[var(--fg)] mt-2">{totalHours.toLocaleString()}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">All time</p>
            </div>
            <div className="p-3 bg-[var(--surface)] rounded-lg">
              <BarChart3 className="w-6 h-6 text-[var(--fg-muted)]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <Card
            key={member.id}
            glowOnHover={true}
            onClick={() => setSelectedTeamMember(member)}
            className="p-6 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-gradient-orange transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-sm text-[var(--fg-muted)] capitalize">{member.role}</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                member.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
              }`} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-[var(--fg-muted)]">
                <Mail className="w-4 h-4" />
                <span className="text-[var(--fg)] truncate">{member.email}</span>
              </div>

              {member.phone && (
                <div className="flex items-center space-x-2 text-sm text-[var(--fg-muted)]">
                  <Phone className="w-4 h-4" />
                  <span className="text-[var(--fg)]">{member.phone}</span>
                </div>
              )}

              {member.city && member.state && (
                <div className="flex items-center space-x-2 text-sm text-[var(--fg-muted)]">
                  <MapPin className="w-4 h-4" />
                  <span className="text-[var(--fg)]">{member.city}, {member.state}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--fg)]">{member.projectIds.length}</div>
                  <div className="text-xs text-[var(--fg-muted)]">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[var(--fg)]">{member.analytics.monthlyProductivity}%</div>
                  <div className="text-xs text-[var(--fg-muted)]">Productivity</div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap gap-1">
                {member.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-[var(--surface)] text-[var(--fg-muted)] text-xs rounded-md">
                    {skill}
                  </span>
                ))}
                {member.skills.length > 3 && (
                  <span className="px-2 py-1 bg-[var(--surface)] text-[var(--fg-muted)] text-xs rounded-md">
                    +{member.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-[var(--fg-muted)] mb-4">No team members found</div>
          <Button
            glowOnHover
            wrapperClassName="mx-auto w-full max-w-xs"
            className="w-full justify-center font-semibold"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Team Member</span>
          </Button>
        </div>
      )}

      {/* Team Member Modal */}
      {selectedTeamMember && (
        <TeamMemberModal
          member={selectedTeamMember}
          onClose={() => setSelectedTeamMember(null)}
        />
      )}
    </div>
  );
};

export default Team;