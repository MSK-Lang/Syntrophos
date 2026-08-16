import type { AuditInfo, ID, PageResult, QueryParams, Timestamp } from './types.js';

export type CalendarEventType = 'event' | 'meeting' | 'focus' | 'out-of-office' | 'reminder';

export type AttendeeStatus = 'accepted' | 'declined' | 'tentative' | 'needs-action';

export type CalendarEventAttendee = {
  readonly id: ID;
  readonly email: string;
  readonly name?: string;
  readonly status: AttendeeStatus;
  readonly isOrganizer: boolean;
};

export type CalendarEvent = {
  readonly id: ID;
  readonly calendarId: string;
  readonly integrationId?: ID;
  readonly title: string;
  readonly description?: string;
  readonly location?: string;
  readonly allDay: boolean;
  readonly startAt: Timestamp;
  readonly endAt: Timestamp;
  readonly timezone?: string;
  readonly type: CalendarEventType;
  readonly isRecurring: boolean;
  readonly recurrenceRule?: unknown;
  readonly attendees?: readonly CalendarEventAttendee[];
  readonly meetingUrl?: string;
  readonly projectId?: ID;
  readonly taskId?: ID;
  readonly audit: AuditInfo;
  readonly source: 'syntrophos' | 'integration';
};

export type Calendar = {
  readonly id: string;
  readonly name: string;
  readonly color?: string;
  readonly source: 'local' | { readonly integrationId: ID };
  readonly readOnly: boolean;
  readonly primary: boolean;
};

export interface CalendarService {
  readonly listCalendars: () => Promise<readonly Calendar[]>;
  readonly listEvents: (params: {
    readonly startAt: Timestamp;
    readonly endAt: Timestamp;
    readonly calendarIds?: readonly string[];
    readonly includeRecurringExpanded?: boolean;
  }) => Promise<PageResult<CalendarEvent>>;
  readonly getEvent: (id: ID) => Promise<CalendarEvent>;
  readonly createEvent: (
    data: Readonly<
      Omit<CalendarEvent, 'id' | 'audit' | 'source' | 'isRecurring'> & {
        readonly recurrenceRule?: unknown;
      }
    >,
  ) => Promise<CalendarEvent>;
  readonly updateEvent: (id: ID, patch: Readonly<Partial<CalendarEvent>>) => Promise<CalendarEvent>;
  readonly deleteEvent: (id: ID) => Promise<void>;
  readonly getFreeBusy: (params: {
    readonly startAt: Timestamp;
    readonly endAt: Timestamp;
    readonly attendeeEmails: readonly string[];
  }) => Promise<
    readonly {
      readonly email: string;
      readonly busy: readonly { readonly startAt: Timestamp; readonly endAt: Timestamp }[];
    }[]
  >;
  readonly scheduleMeeting: (params: {
    readonly title: string;
    readonly durationMinutes: number;
    readonly attendeeEmails: readonly string[];
    readonly preferredDates?: readonly Timestamp[];
    readonly timezone?: string;
  }) => Promise<CalendarEvent>;
}
