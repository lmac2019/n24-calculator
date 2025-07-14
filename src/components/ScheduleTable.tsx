import { useState, useImperativeHandle, forwardRef, useCallback } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Box,
  Paper,
} from "@mui/material";
import { format } from "date-fns";
import {
  getNoteKey,
  shiftNotesUp,
  shiftNotesDown,
  type ScheduleRow,
} from "../utils";
import { usePersistentState } from "../hooks/usePersistantState";
import {
  tableContainerStyles,
  tableStyles,
  tableHeaderCellStyles,
  getTableRowStyles,
  getTableCellStyles,
  notesTextFieldStyles,
} from "../styles";

interface ScheduleTableProps {
  schedule: ScheduleRow[];
}

export interface ScheduleTableRef {
  shiftNotesUp: () => void;
  shiftNotesDown: () => void;
}

const ScheduleTable = forwardRef<ScheduleTableRef, ScheduleTableProps>(
  ({ schedule }, ref) => {
    const [selectedRow, setSelectedRow] = useState<number | null>(null);
    const [notes, setNotes] = usePersistentState<Record<string, string>>({
      key: "scheduleNotes",
      defaultValue: {},
    });

    const handleNoteChange = useCallback(
      (day: number, date: Date, value: string) => {
        const key = getNoteKey(day, date);
        setNotes((prev) => ({ ...prev, [key]: value }));
      },
      [setNotes]
    );

    const shiftNotesUpHandler = useCallback(
      () => setNotes((prev) => shiftNotesUp(prev)),
      [setNotes]
    );
    const shiftNotesDownHandler = useCallback(
      () => setNotes((prev) => shiftNotesDown(prev)),
      [setNotes]
    );

    useImperativeHandle(ref, () => ({
      shiftNotesUp: shiftNotesUpHandler,
      shiftNotesDown: shiftNotesDownHandler,
    }));

    return (
      <Box component={Paper} sx={tableContainerStyles}>
        <Table stickyHeader size="small" sx={tableStyles}>
          <TableHead>
            <TableRow>
              {[
                "Day",
                "Date",
                "Sleep",
                "Wake",
                "Sleep (Beijing)",
                "Wake (Beijing)",
                "Notes",
              ].map((label) => (
                <TableCell key={label} sx={tableHeaderCellStyles}>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.map((row) => {
              const {
                day,
                date,
                sleepStart,
                sleepEnd,
                wakeStart,
                wakeEnd,
                sleepStartBJ,
                sleepEndBJ,
                wakeStartBJ,
                wakeEndBJ,
              } = row;

              const noteKey = getNoteKey(day, date);
              const note = notes[noteKey] || "";
              const isSelected = selectedRow === day;
              const rowStyles = getTableRowStyles(selectedRow, day);
              const cellStyles = getTableCellStyles(selectedRow, day);

              return (
                <TableRow
                  key={day}
                  hover
                  selected={isSelected}
                  onClick={() => setSelectedRow(isSelected ? null : day)}
                  sx={rowStyles}
                >
                  <TableCell sx={cellStyles}>{day}</TableCell>
                  <TableCell sx={cellStyles}>{`${format(
                    date,
                    "yyyy-MM-dd"
                  )} (${format(date, "EEE")})`}</TableCell>
                  <TableCell
                    sx={cellStyles}
                  >{`${sleepStart} - ${sleepEnd}`}</TableCell>
                  <TableCell
                    sx={cellStyles}
                  >{`${wakeStart} - ${wakeEnd}`}</TableCell>
                  <TableCell
                    sx={cellStyles}
                  >{`${sleepStartBJ} - ${sleepEndBJ}`}</TableCell>
                  <TableCell
                    sx={cellStyles}
                  >{`${wakeStartBJ} - ${wakeEndBJ}`}</TableCell>
                  <TableCell sx={cellStyles}>
                    <TextField
                      size="small"
                      placeholder="Add note..."
                      value={note}
                      onChange={(e) =>
                        handleNoteChange(day, date, e.target.value)
                      }
                      onClick={(e) => e.stopPropagation()}
                      sx={notesTextFieldStyles}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    );
  }
);

ScheduleTable.displayName = "ScheduleTable";

export default ScheduleTable;
