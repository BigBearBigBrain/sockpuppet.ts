import { FunctionalComponent } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { useInput } from '../../hooks/input';
import { useSockpuppet } from '../../sockpuppet';

interface IProps {
  isInContainer?: boolean;
}

export const Header: FunctionalComponent<IProps> = ({ isInContainer }) => {
  const { host, socketReady, changeHost, resetSocket } = useSockpuppet();
  const [currentHost, bindCurrentHost, _, setCurrentHost] = useInput(host);
  console.log(isInContainer);
  // useEffect(() => {
  //   setCurrentHost(host)
  // }, [host])
  const buttonText = host !== currentHost ? "connect" : socketReady ? "refresh connection" : "retry connection"

  const connect = useCallback(() => {
    if (currentHost === host) {
      resetSocket();
      return
    }
    changeHost && changeHost(currentHost);
  }, [changeHost, currentHost, host, resetSocket]);

  return (
    <header class="pane col-span-4 flex items-center justify-between">
      <div class="flex items-center">
        <img class="h-16 mx-4" src="/sockpuppet-solo.svg" alt="Sockpuppet logo" />
        <div >
          <h1 class="text-5xl uppercase font-extrabold font-permanent-marker">Puppetshow</h1>
          <p>Powered by <a href="https://deno.land/x/sockpuppet" target="_blank" rel="noreferrer">Sockpuppet</a></p>
        </div>
      </div>
      <div class="flex gap-4 items-center">
        <p class="font-bold text-lg">
          {socketReady ? 'Connected to' : 'Unable to establish connection'}
        </p>
        {isInContainer ? (
          <p>{host}</p>
        ) : (
          <input class="p-4 rounded-lg etched dark:text-white" type="text" {...bindCurrentHost} />
        )}
        <button onClick={connect} class="p-4 bg-purple-50 font-permanent-marker">{buttonText}</button>
      </div>
    </header>
  );
}