import React, { useRef } from "react";
import { Box } from "@mui/material";
import {
  ScheduleComponent,
  Day,
  Week,
  WorkWeek,
  Month,
  Agenda,
  Inject,
  ActionEventArgs,
} from "@syncfusion/ej2-react-schedule";

export interface CalendarEvent {
  Id: number;
  Subject: string;
  StartTime: Date;
  EndTime: Date;
  IsAllDay?: boolean;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventsChange?: (events: CalendarEvent[]) => void;
}

const LOCAL_STORAGE_KEY = "calendarEvents";

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  onEventsChange,
}) => {
  const scheduleRef = useRef<any>(null);
  const selectedDate =
    events && events.length > 0 && events[0].StartTime instanceof Date
      ? events[0].StartTime
      : new Date();

  // Handler for CRUD actions
  const handleActionBegin = (args: ActionEventArgs) => {
    let updatedEvents = events.slice();
    if (args.requestType === "eventCreate") {
      const newEvents = Array.isArray(args.data) ? args.data : [args.data];
      updatedEvents = [...updatedEvents, ...newEvents];
    } else if (args.requestType === "eventChange") {
      const changed = Array.isArray(args.data) ? args.data : [args.data];
      updatedEvents = updatedEvents.map((ev) => {
        const found = changed.find((c: any) => c.Id === ev.Id);
        return found ? { ...ev, ...found } : ev;
      });
    } else if (args.requestType === "eventRemove") {
      const removed = Array.isArray(args.data) ? args.data : [args.data];
      updatedEvents = updatedEvents.filter(
        (ev) => !removed.some((r: any) => r.Id === ev.Id)
      );
    }
    if (onEventsChange && updatedEvents !== events) {
      onEventsChange(updatedEvents);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedEvents));
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%", minHeight: "80vh", minWidth: 0 }}>
      <ScheduleComponent
        ref={scheduleRef}
        width="100%"
        height="100%"
        eventSettings={{ dataSource: events }}
        selectedDate={selectedDate}
        actionBegin={handleActionBegin}
        allowDragAndDrop={true}
        allowResizing={true}
      >
        <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
      </ScheduleComponent>
    </Box>
  );
};

export default CalendarView;
