/**
 * Calculates the step value for a number input based on its decimal places
 * 
 * This function is used for determining appropriate step increments in number inputs.
 * It analyzes the decimal precision of the input value and returns a step value
 * that provides reasonable granularity for user input.
 * 
 * @param value - The numeric value to calculate the step for
 * @returns The appropriate step value for the input
 * 
 * @example
 * ```typescript
 * getStepValue(1)      // Returns: 1
 * getStepValue(1.5)    // Returns: 0.1
 * getStepValue(1.25)   // Returns: 0.01
 * getStepValue(1.125)  // Returns: 0.001
 * ```
 */
export function getStepValue(value: number): number {
  const str = value.toString();
  const decimal = str.split(".")[1];
  if (!decimal) return 1;
  return 1 / Math.pow(10, decimal.length);
} 