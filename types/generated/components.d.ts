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

export interface RelativeRelative extends Schema.Component {
  collectionName: 'components_relative_relatives';
  info: {
    displayName: 'Relative';
    icon: 'manyToOne';
  };
  attributes: {
    fullName: Attribute.String;
    job: Attribute.String;
    phoneNumber: Attribute.String;
    address: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'schedule.schedule': ScheduleSchedule;
      'relative.relative': RelativeRelative;
    }
  }
}
