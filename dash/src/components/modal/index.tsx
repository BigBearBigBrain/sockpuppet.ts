import { FunctionComponent, RefObject } from 'preact'
import { useCallback, useEffect, useRef } from 'preact/hooks';

interface IProps {
  show: boolean;
  setShow: (arg: any) => void;
}

export const Modal: FunctionComponent<IProps> = ({ children, show, setShow }) => {
  const ref = useRef<HTMLDialogElement>(null);

  const closeDialog = useCallback((e: MouseEvent | Event) => {
    const rect = (e.target as HTMLDialogElement).getBoundingClientRect();
    

    const clickedInDialog = (
      rect.top <= (e as MouseEvent).clientY &&
      (e as MouseEvent).clientY <= rect.top + rect.height &&
      rect.left <= (e as MouseEvent).clientX &&
      (e as MouseEvent).clientX <= rect.left + rect.width
    );

    if (
      !ref.current?.classList.contains('shrink') &&
      (e.type === 'close' || !clickedInDialog)
    ) {
      e.stopImmediatePropagation();
      ref.current?.classList.add('shrink');
      setTimeout(() => {
        ref.current?.close()
        setShow(false);
      }, 300);
    }
  }, [ref])

  const cancelDialog = useCallback((e: Event) => {
    e.preventDefault();
    ref.current?.close();
}, [ref]);

  useEffect(() => {
    ref.current?.addEventListener('cancel', cancelDialog);
    ref.current?.addEventListener('mousedown', closeDialog);
    ref.current?.addEventListener('close', closeDialog);
    return () => {
      ref.current?.removeEventListener('cancel', cancelDialog);
      ref.current?.removeEventListener('mousedown', closeDialog);
      ref.current?.removeEventListener('close', closeDialog);
    }
  }, [ref])

  useEffect(() => {
    if (show) {
      ref.current?.classList.remove('shrink')
      ref.current?.showModal();
    }
    else ref.current?.close();
  }, [show])

  return (
    <dialog ref={ref}>
      {children}
    </dialog>
  )
}