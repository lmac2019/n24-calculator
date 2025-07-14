import { useEffect, useState } from "react";

/**
 * Configuration object for persistent state management
 *
 * @template T - The type of the state value
 */
type LocalStorageStateItem<T> = {
  /** The localStorage key to use for storing the state */
  key: string;
  /** The default value to use if no stored value exists */
  defaultValue: T;
  /** Optional function to parse the stored string value back to type T */
  parser?: (value: string) => T;
  /** Optional function to serialize the state value to a string for storage */
  serializer?: (value: T) => string;
};

/**
 * A React hook that provides persistent state management using localStorage
 *
 * This hook combines React's useState with localStorage persistence, automatically
 * saving state changes to localStorage and restoring the state on component mount.
 * It includes error handling for parsing and serialization failures.
 *
 * @template T - The type of the state value
 * @param config - Configuration object for the persistent state
 * @param config.key - The localStorage key to use for storing the state
 * @param config.defaultValue - The default value to use if no stored value exists
 * @param config.parser - Optional function to parse stored string back to type T (defaults to JSON.parse)
 * @param config.serializer - Optional function to serialize state to string for storage (defaults to JSON.stringify)
 * @returns A tuple containing the current state value and a setter function
 *
 * @example
 * ```typescript
 * // Basic usage with string
 * const [name, setName] = usePersistentState({
 *   key: "userName",
 *   defaultValue: "John Doe"
 * });
 *
 * // Usage with number and custom parser/serializer
 * const [age, setAge] = usePersistentState({
 *   key: "userAge",
 *   defaultValue: 25,
 *   parser: Number,
 *   serializer: String
 * });
 *
 * // Usage with complex object
 * const [settings, setSettings] = usePersistentState({
 *   key: "appSettings",
 *   defaultValue: { theme: "dark", notifications: true }
 * });
 *
 * // Usage with custom parsing for dates
 * const [lastVisit, setLastVisit] = usePersistentState({
 *   key: "lastVisit",
 *   defaultValue: new Date(),
 *   parser: (value) => new Date(value),
 *   serializer: (date) => date.toISOString()
 * });
 * ```
 *
 * @throws {Error} May throw errors during parsing/serialization, which are caught and logged as warnings
 */
export function usePersistentState<T>({
  key,
  defaultValue,
  parser = JSON.parse,
  serializer = JSON.stringify,
}: LocalStorageStateItem<T>): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try {
        return parser(stored);
      } catch (e) {
        console.warn(`Failed to parse localStorage[${key}]:`, stored);
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, serializer(state));
    } catch (e) {
      console.warn(`Failed to serialize localStorage[${key}]`, state);
    }
  }, [key, serializer, state]);

  return [state, setState];
}
