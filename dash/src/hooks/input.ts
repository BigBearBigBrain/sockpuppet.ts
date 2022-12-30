import { useState } from 'preact/hooks';

type useInput = [string, {
  value: string,
  onInput: (e: Event) => void
}]

export const useInput = (initial: string): useInput => {
  const [value, setValue] = useState(initial);

  const bind = {
    value,
    onInput: (e: Event) => setValue((e.target as HTMLInputElement)?.value)
  }
  
  return [value, bind]
}