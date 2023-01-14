import { FunctionComponent } from 'preact'
import { StateUpdater, useCallback, useRef, useState } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx';
import { IInputBinder } from '../hooks/input';

interface IProps {
  bind: IInputBinder
  onSubmit: (e: Event) => void;
  setValidJson?: StateUpdater<boolean>;
}

export const JSONComposer: FunctionComponent<IProps> = ({ bind, onSubmit, setValidJson }) => {
  const [invalid, setInvalid] = useState(false);

  const onInput = useCallback((e: Event) => {
    try {
      JSON.parse((e.target as HTMLTextAreaElement).value)
      setInvalid(false);
      setValidJson && setValidJson(true);
    } catch {
      setValidJson && setValidJson(false);
      setInvalid(true);
    }
    bind.onInput(e)
  }, [bind, setValidJson])

  return (
    <form
      onSubmit={onSubmit}
      onKeyDown={(e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault()
          onSubmit(e)
        }
      }}
    >
      {invalid && <p class="text-red-0">Error parsing JSON</p>}
      <textarea
        class="w-full p-4 text-lg rounded-lg dark:bg-black/20 bg-white/70 dark:text-white font-mono"
        cols={30}
        rows={10}
        onInput={onInput}
        value={bind.value}
      >
        {/* {bind.value} */}
      </textarea>
      <button class="bg-green" role="submit">Send</button>
      <span class="text-gray-5/30 italic ml-2">Ctrl + Enter to send</span>
    </form>
  )
}