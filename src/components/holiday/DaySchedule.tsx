import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgeGroup } from './AgeGroup';

interface DayScheduleProps {
  day: string;
  activities: {
    maternelle: {
      morning?: string;
      afternoon?: string;
      fullDay?: string;
    };
    primaire: {
      morning?: string;
      afternoon?: string;
      fullDay?: string;
    };
    adolescents: {
      morning?: string;
      afternoon?: string;
      fullDay?: string;
    };
  };
}

export const DaySchedule: React.FC<DayScheduleProps> = ({ day, activities }) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{day}</CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-6">
        <AgeGroup type="maternelle" activities={activities.maternelle} />
        <AgeGroup type="primaire" activities={activities.primaire} />
        <AgeGroup type="adolescents" activities={activities.adolescents} />
      </CardContent>
    </Card>
  );
};