import React from 'react';
import { Baby, User, Users } from "lucide-react";
import { DailyActivity } from './DailyActivity';

interface AgeGroupProps {
  type: 'maternelle' | 'primaire' | 'adolescents';
  activities: {
    morning?: string;
    afternoon?: string;
    fullDay?: string;
  };
}

export const AgeGroup: React.FC<AgeGroupProps> = ({ type, activities }) => {
  const getIcon = () => {
    switch (type) {
      case 'maternelle':
        return <Baby className="h-5 w-5 text-blue-500" />;
      case 'primaire':
        return <User className="h-5 w-5 text-green-500" />;
      case 'adolescents':
        return <Users className="h-5 w-5 text-purple-500" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'maternelle':
        return 'Maternelle';
      case 'primaire':
        return 'Primaire';
      case 'adolescents':
        return 'Adolescents';
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {getIcon()}
        <h3 className="font-semibold">{getTitle()}</h3>
      </div>
      <div className="space-y-2">
        {activities.fullDay ? (
          <DailyActivity time="Journée complète" activity={activities.fullDay} />
        ) : (
          <>
            {activities.morning && (
              <DailyActivity time="Matin" activity={activities.morning} />
            )}
            {activities.afternoon && (
              <DailyActivity time="Après-midi" activity={activities.afternoon} />
            )}
          </>
        )}
      </div>
    </div>
  );
};