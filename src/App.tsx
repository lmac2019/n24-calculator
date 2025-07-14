import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  TextField,
  Typography,
  Stack,
  Box,
  ThemeProvider,
  Button,
  ButtonGroup,
} from "@mui/material";
import { 
  DEFAULT_SLEEP_START,
  DEFAULT_SLEEP_END,
  DEFAULT_CURRENT_DATE,
  DEFAULT_START_DATE,
  DEFAULT_END_DATE,
  DEFAULT_DAILY_SHIFT_MINUTES
} from "./constants";
import {
  darkTheme,
  mainContainerStyles,
  headerContainerStyles,
  formControlsStackStyles,
  formInputsContainerStyles,
  textFieldStyles,
  buttonGroupContainerStyles,
  buttonGroupStyles,
  buttonStyles
} from "./styles";
import {
  generateSchedule,
  getStepValue,
} from "./utils";
import ScheduleTable, { ScheduleTableRef } from "./components/ScheduleTable";
import { usePersistentState } from "./hooks/usePersistantState";

export default function App() {
  const scheduleTableRef = useRef<ScheduleTableRef>(null);

  const [currentSleepStart, setCurrentSleepStart] = usePersistentState({
    key: "currentSleepStart",
    defaultValue: DEFAULT_SLEEP_START,
  });
  
  const [currentSleepEnd, setCurrentSleepEnd] = usePersistentState({
    key: "currentSleepEnd",
    defaultValue: DEFAULT_SLEEP_END,
  });
  
  const [currentDate, setCurrentDate] = usePersistentState({
    key: "currentDate",
    defaultValue: DEFAULT_CURRENT_DATE,
  });
  
  const [startDate, setStartDate] = usePersistentState({
    key: "startDate",
    defaultValue: DEFAULT_START_DATE,
  });
  
  const [endDate, setEndDate] = usePersistentState({
    key: "endDate",
    defaultValue: DEFAULT_END_DATE,
  });
  
  const [dailyShiftMinutes, setDailyShiftMinutes] = usePersistentState({
    key: "dailyShiftMinutes",
    defaultValue: DEFAULT_DAILY_SHIFT_MINUTES,
    parser: parseFloat,
    serializer: String,
  });

  const schedule = generateSchedule(
    currentSleepStart,
    currentSleepEnd,
    currentDate,
    startDate,
    endDate,
    dailyShiftMinutes
  );

  const handleShiftNotesUp = () => {
    scheduleTableRef.current?.shiftNotesUp();
  };

  const handleShiftNotesDown = () => {
    scheduleTableRef.current?.shiftNotesDown();
  };

  const step = getStepValue(dailyShiftMinutes);
  return (
    <ThemeProvider theme={darkTheme}>
      <Box sx={mainContainerStyles}>
        <Container maxWidth="lg" sx={headerContainerStyles}>
          <Typography variant="h5" gutterBottom>
            Sleep Cycle Schedule (Vancouver ➜ Beijing)
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
            sx={formControlsStackStyles}
          >
            <Box sx={formInputsContainerStyles}>
              <TextField
                label="Sleep Start"
                type="time"
                value={currentSleepStart}
                onChange={(e) => setCurrentSleepStart(e.target.value)}
                sx={textFieldStyles}
              />
              <TextField
                label="Sleep End"
                type="time"
                value={currentSleepEnd}
                onChange={(e) => setCurrentSleepEnd(e.target.value)}
                sx={textFieldStyles}
              />
              <TextField
                label="Current Date"
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                sx={textFieldStyles}
              />
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                sx={textFieldStyles}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                sx={textFieldStyles}
              />
              <TextField
                label="Daily Shift (min)"
                type="number"
                value={dailyShiftMinutes}
                onChange={(e) => setDailyShiftMinutes(Number(e.target.value))}
                slotProps={{
                  input: {
                    inputProps: { step }, 
                  },
                }}
                sx={textFieldStyles}
              />
            </Box>
            <Box sx={buttonGroupContainerStyles}>
              <ButtonGroup variant="outlined" size="large" sx={buttonGroupStyles}>
                <Button onClick={handleShiftNotesUp} sx={buttonStyles}>
                  SHIFT NOTES ↑
                </Button>
                <Button onClick={handleShiftNotesDown} sx={buttonStyles}>
                  SHIFT NOTES ↓
                </Button>
              </ButtonGroup>
            </Box>
          </Stack>
        </Container>

        <ScheduleTable 
          ref={scheduleTableRef}
          schedule={schedule} 
        />
      </Box>
    </ThemeProvider>
  );
}
