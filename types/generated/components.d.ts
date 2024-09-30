import type { Schema, Attribute } from '@strapi/strapi';

export interface ScheduleSchedule extends Schema.Component {
  collectionName: 'components_schedule_schedules';
  info: {
    displayName: 'schedule';
    icon: 'calendar';
    description: '';
  };
  attributes: {
    day: Attribute.String;
    room: Attribute.String;
    startTime: Attribute.Time;
    endTime: Attribute.Time;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'schedule.schedule': ScheduleSchedule;
    }
  }
}
