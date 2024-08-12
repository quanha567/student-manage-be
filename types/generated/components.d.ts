import type { Schema, Attribute } from '@strapi/strapi';

export interface ScheduleSchedule extends Schema.Component {
  collectionName: 'components_schedule_schedules';
  info: {
    displayName: 'schedule';
    icon: 'calendar';
  };
  attributes: {
    day: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'schedule.schedule': ScheduleSchedule;
    }
  }
}
