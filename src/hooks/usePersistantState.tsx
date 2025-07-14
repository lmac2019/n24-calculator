import { useEffect, useState } from "react";

type LocalStorageStateItem<T> = {
    key: string;
    defaultValue: T;
    parser?: (value: string) => T;
    serializer?: (value: T) => string;
  };
  
  export function usePersistentState<T>(
    { key, defaultValue, parser = JSON.parse, serializer = JSON.stringify }: LocalStorageStateItem<T>
  ): [T, React.Dispatch<React.SetStateAction<T>>] {
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
    }, [key, state]);
  
    return [state, setState];
  }
  