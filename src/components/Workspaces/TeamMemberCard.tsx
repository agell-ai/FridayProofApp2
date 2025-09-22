import React from 'react';
import { Mail, Pencil } from 'lucide-react';
import { TeamMember } from '../../types';
import { Card } from '../Shared/Card';

interface TeamMemberCardProps {
  member: TeamMember;
  onOpen: (member: TeamMember) => void;
  onEdit: (member: TeamMember) => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onOpen, onEdit }) => (
  <Card
    glowOnHover
    onClick={() => onOpen(member)}
    className="p-5 h-full"
    aria-label={`Open team member ${member.name}`}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-[var(--fg)]">{member.name}</h3>
        <p className="text-sm text-[var(--fg-muted)]">{member.companyName}</p>
        <a
          href={`mailto:${member.email}`}
          onClick={(event) => event.stopPropagation()}
          className="flex items-center gap-2 text-sm text-[var(--accent-purple)] hover:underline"
        >
          <Mail className="w-4 h-4" />
          {member.email}
        </a>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onEdit(member);
        }}
        className="p-2 rounded-full text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)] transition"
        aria-label={`Edit ${member.name}`}
      >
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  </Card>
);

export default TeamMemberCard;
