import React from 'react';

interface PetSummary {
  id: string;
  name: string;
  breed: string;
  avatar: string;
  weight: number;
  lastActivityTime: string | null;
  activityCount: number;
}

interface PetCardProps {
  pet: PetSummary;
  timeAgo: string;
  emoji: string;
  onClick: (pet: PetSummary) => void;
}

export default function PetCard({ pet, timeAgo, emoji, onClick }: PetCardProps) {
  return (
    <div className="pet-card" onClick={() => onClick(pet)}>
      <div className="pet-avatar">{emoji}</div>
      <div className="pet-info">
        <h3 className="pet-name">{pet.name}</h3>
        <span className="breed-tag">{pet.breed}</span>
        <p className="pet-last-activity">
          ⏱ 最后活动：{timeAgo}
        </p>
        <p className="pet-weight">⚖️ {pet.weight} kg</p>
      </div>
      <div className="pet-card-arrow">→</div>
    </div>
  );
}
