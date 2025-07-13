import { SxProps, Theme, createTheme } from "@mui/material";

// Theme configuration
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
});

// Main container styles
export const mainContainerStyles: SxProps<Theme> = {
  height: "100vh",
  width: "100vw",
  display: "flex",
  flexDirection: "column",
  fontFamily: "monospace",
  backgroundColor: 'background.paper',
  color: 'text.primary',
};

// Header container styles
export const headerContainerStyles: SxProps<Theme> = {
  mt: 4,
  flexShrink: 0
};

// Form controls stack styles
export const formControlsStackStyles: SxProps<Theme> = {
  mb: 3
};

// Form inputs container styles
export const formInputsContainerStyles: SxProps<Theme> = {
  display: 'flex',
  gap: 2,
  flex: 1
};

// Text field styles
export const textFieldStyles: SxProps<Theme> = {
  minWidth: 150
};

// Button group container styles
export const buttonGroupContainerStyles: SxProps<Theme> = {
  minWidth: 350
};

// Button group styles
export const buttonGroupStyles: SxProps<Theme> = {
  width: '100%'
};

// Button styles
export const buttonStyles: SxProps<Theme> = {
  flex: 1
};

// Table container styles
export const tableContainerStyles: SxProps<Theme> = {
  flexGrow: 1,
  maxWidth: "100vw",
  overflow: "auto",
  px: 2,
  pb: 2,
  backgroundColor: 'background.paper',
};

// Table styles
export const tableStyles: SxProps<Theme> = {
  minWidth: 1200
};

// Table header cell styles
export const tableHeaderCellStyles: SxProps<Theme> = {
  backgroundColor: '#232323'
};

// Table row styles
export const getTableRowStyles = (selectedRow: number | null, day: number): SxProps<Theme> => ({
  ...(selectedRow === day ? { backgroundColor: 'rgba(25, 118, 210, 0.15)' } : { cursor: 'pointer' })
});

// Table cell styles
export const getTableCellStyles = (selectedRow: number | null, day: number): SxProps<Theme> => ({
  backgroundColor: selectedRow === day ? 'rgba(25, 118, 210, 0.15)' : '#232323'
});

// Notes text field styles
export const notesTextFieldStyles: SxProps<Theme> = {
  minWidth: 200
}; 