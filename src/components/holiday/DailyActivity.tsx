import React from 'react';
import { getActivityIcon } from '@/utils/activityIcons';

interface ActivityProps {
  time: string;
  activity: string;
}

export const DailyActivity: React.FC<ActivityProps> = ({ time, activity }) => (
  <p>
    {getActivityIcon(activity)}
    <span className="font-medium">{time} :</span> {activity}
  </p>
);