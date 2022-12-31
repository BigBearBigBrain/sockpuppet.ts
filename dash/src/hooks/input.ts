import { StateUpdater, useCallback, useState } from 'preact/hooks';

type useInput = [
  string,
  {
    value: string,
    onInput: (e: Event) => void,
  },
  () => void,
  StateUpdater<string>,
]

export const useInput = (initial: string): useInput => {
  const [value, setValue] = useState(initial);

  const bind = {
    value,
    onInput: (e: Event) => setValue((e.target as HTMLInputElement)?.value)
  }

  const reset = useCallback(() => {
    setValue(initial)
  }, [setValue, initial])

  return [value, bind, reset, setValue];
}