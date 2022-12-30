import { FunctionComponent } from 'preact';
import { useChannelContext } from '../context/channel';
import { useInput } from '../hooks/input';
import { useSockpuppet } from '../sockpuppet';
import { Dashboard } from './dashboard';

export const MainRegion: FunctionComponent = () => {
  const {} = useSockpuppet();
  const [channelId] = useChannelContext();
  const [message, bindMessage] = useInput('');
  
  return channelId ? (
    <div class="grid grid-cols-2 grid-rows-2 w-full h-full gap-4">
      <div class="etched"></div>
      <div class="etched row-span-2 flex items-end p-4">
        <input {...bindMessage} type="text" class="w-full p-4 text-lg rounded-lg bg-black/20 text-white" />
      </div>
      <div class="etched p-4">
        <h2 class="text-2xl font-extrabold">Packet Composition</h2>
        <hr class="border-purple-50 my-4" />
        <pre class="w-full whitespace-pre-wrap">{JSON.stringify({
          'send_packet': {
            to: channelId,
            message
          }
        }, null, 2)}</pre>
      </div>
    </div>
  ) : <Dashboard />
}