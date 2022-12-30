import { FunctionComponent } from 'preact';
import { useSockpuppet } from '../../sockpuppet';
import {formatDistanceToNow, differenceInHours} from 'date-fns';
import { useEffect, useState } from 'preact/hooks';

interface IProps {
  pollingRate?: number;
}

export const Dashboard: FunctionComponent<IProps> = ({pollingRate = 1000}) => {
  const {meta, channelList, __sendRawMessage, socketReady} = useSockpuppet();

  useEffect(() => {
    if (socketReady && __sendRawMessage) {
      const timer = setInterval(() => {__sendRawMessage('meta')}, pollingRate);
      return () => clearInterval(timer);
    }
  }, [socketReady, __sendRawMessage, pollingRate]);

  return (
    <div class="w-full h-full grid grid-cols-4 grid-rows-4 gap-4">
      <div class="dash-card row-span-2 col-span-2">
        <span class="text-9xl font-extrabold">{channelList.filter(c => !(!c.lastMessage || differenceInHours(c.lastMessage, Date.now()) > 0 || c.listeners === 0)).length}</span>
        <p class="text-3xl font-bold">Active Channels</p>
      </div>
      <div class="dash-card row-span-2 col-span-2">
        <span class="text-9xl font-extrabold">{channelList.filter(c => !c.lastMessage || differenceInHours(c.lastMessage, Date.now()) > 0 || c.listeners === 0).length}</span>
        <p class="text-3xl font-bold">Stale Channels</p>
      </div>
      <div class="dash-card col-span-2">
        <span class="text-5xl font-extrabold">0</span>
        <p class="text-2xl font-bold">Name Rules</p>
      </div>
      <div class="dash-card col-span-2">
        <span class="text-5xl font-extrabold">{meta?.listeners || 0}</span>
        <p class="text-2xl font-bold">Listeners</p>
      </div>
      <div class="dash-card flex-col">
        <p class="text-2xl"><span class="font-extrabold">356</span> messages in the last hour</p>
        <p>Avg. 347.7/hr</p>
      </div>
      <div class="dash-card flex-col">
        <p className="text-xl">Oldest channel age:</p>
        <span class="text-2xl font-extrabold">{formatDistanceToNow(channelList.sort((a,b) => a.createdAt - b.createdAt)[0]?.createdAt || 0)}</span>
      </div>
      <div class="dash-card flex-col">
        <p className="text-xl">Uptime:</p>
        <span class="text-2xl font-extrabold">{formatDistanceToNow(meta?.serverStart || Date.now())}</span>
      </div>
      <div class="dash-card">
        <p class="text-2xl"><span class="font-extrabold">{meta?.totalMessages || 0}</span> messages since start</p>
      </div>
    </div>
  )
}