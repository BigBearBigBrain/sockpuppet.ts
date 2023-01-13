import { FunctionComponent } from 'preact'

interface IProps {
  checked: boolean;
  toggle: () => void;
  label: string;
}

export const Checkbox: FunctionComponent<IProps> = ({ checked, toggle, label }) => {

  return (
    <label class="flex" for="toggle-button">
      <div class="w-6 h-6 mr-2 rounded-md bg-black/20 shadow-md">
        <button
          data-checked={checked}
          name="toggle-button"
          onClick={toggle}
          class="checkbox w-full h-full bg-gradient-to-br from-grizzly-30 to-grizzly-0 data-[checked=false]:bg-none data-[checked=false]:border-none rounded-md border-4 border-t-grizzly-0 border-l-grizzly-0 border-b-grizzly-20 border-r-grizzly-20"
        />
      </div>
      <span>{label}</span>
    </label>
  )
}