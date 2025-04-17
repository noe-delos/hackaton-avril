// types/index.ts

export interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isFlexible: boolean;
  participants: string[]; // Array of user IDs
  objective: string;
  location: string;
}

export interface User {
  id: string;
  name: string;
  job: string;
  meetings: string[]; // Array of meeting IDs
}

export interface MockContext {
  companyType: string;
  companyName: string;
  colleagues: User[];
  currentUser: {
    id: string;
    name: string;
    job: string;
    meetings: string[]; // Array of meeting IDs
    objectives: string[]; // 3 objectives
  };
  meetings: Meeting[];
}

export interface CalendarConstraint {
  id: string;
  description: string;
}

export interface CalendarRequest {
  userRole: string;
  startDate: string;
  endDate: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  meetingPreferences: string[];
  existingCommitments: Meeting[];
  meetingDensity: "light" | "medium" | "heavy";
  objectives: string[];
}

export interface CalendarResponse {
  events: CalendarEvent[];
}

export interface CalendarEvent {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  participants: { name: string; role: string }[];
  location: string;
}
