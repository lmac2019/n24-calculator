import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
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
  type ScheduleRow
} from "../utils";
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

const ScheduleTable = forwardRef<ScheduleTableRef, ScheduleTableProps>(({ schedule }, ref) => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const stored = localStorage.getItem("scheduleNotes");
    return stored ? JSON.parse(stored) : {};
  });

  // Save notes to localStorage when they change
  useEffect(() => {
    localStorage.setItem("scheduleNotes", JSON.stringify(notes));
  }, [notes]);

  const handleNoteChange = (day: number, date: Date, value: string) => {
    const key = getNoteKey(day, date);
    setNotes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleShiftNotesUp = () => {
    setNotes(prev => shiftNotesUp(prev));
  };
  
  const handleShiftNotesDown = () => {
    setNotes(prev => shiftNotesDown(prev));
  };

  // Expose shift methods to parent component
  useImperativeHandle(ref, () => ({
    shiftNotesUp: handleShiftNotesUp,
    shiftNotesDown: handleShiftNotesDown,
  }));

  return (
    <Box component={Paper} sx={tableContainerStyles}>
      <Table stickyHeader size="small" sx={tableStyles}>
        <TableHead>
          <TableRow>
            <TableCell sx={tableHeaderCellStyles}>Day</TableCell>
            <TableCell sx={tableHeaderCellStyles}>Date</TableCell>
            <TableCell sx={tableHeaderCellStyles}>Sleep</TableCell>
            <TableCell sx={tableHeaderCellStyles}>Wake</TableCell>
            <TableCell sx={tableHeaderCellStyles}>Sleep (Beijing)</TableCell>
            <TableCell sx={tableHeaderCellStyles}>Wake (Beijing)</TableCell>
            <TableCell sx={tableHeaderCellStyles}>Notes</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedule.map(
            ({
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
            }) => {
              const noteKey = getNoteKey(day, date);
              const note = notes[noteKey] || "";
              
              return (
                <TableRow
                  key={day}
                  hover
                  selected={selectedRow === day}
                  onClick={() => setSelectedRow(selectedRow === day ? null : day)}
                  sx={getTableRowStyles(selectedRow, day)}
                >
                  <TableCell sx={getTableCellStyles(selectedRow, day)}>{day}</TableCell>
                  <TableCell sx={getTableCellStyles(selectedRow, day)}>{format(date, "yyyy-MM-dd")} ({format(date, "EEE")})</TableCell>
                  <TableCell sx={getTableCellStyles(selectedRow, day)}>{`${sleepStart} - ${sleepEnd}`}</TableCell>
                  <TableCell sx={getTableCellStyles(selectedRow, day)}>{`${wakeStart} - ${wakeEnd}`}</TableCell>
                  <TableCell sx={getTableCellStyles(selectedRow, day)}>{`${sleepStartBJ} - ${sleepEndBJ}`}</TableCell>
                  <TableCell sx={getTableCellStyles(selectedRow, day)}>{`${wakeStartBJ} - ${wakeEndBJ}`}</TableCell>
                  <TableCell sx={getTableCellStyles(selectedRow, day)}>
                    <TextField
                      size="small"
                      placeholder="Add note..."
                      value={note}
                      onChange={(e) => handleNoteChange(day, date, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      sx={notesTextFieldStyles}
                    />
                  </TableCell>
                </TableRow>
              );
            }
          )}
        </TableBody>
      </Table>
    </Box>
  );
});

ScheduleTable.displayName = "ScheduleTable";

export default ScheduleTable; 