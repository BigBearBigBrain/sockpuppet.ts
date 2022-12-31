import { format } from 'date-fns';
import { FunctionComponent } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { useChannelContext } from '../context/channel';
import { useInput } from '../hooks/input';
import { useSockpuppet } from '../sockpuppet';
import { Message } from '../sockpuppet/message';
import { Dashboard } from './dashboard';

export const MainRegion: FunctionComponent = () => {
  const { joinChannel, leaveChannel, socketReady, channels } = useSockpuppet();
  const [channelId] = useChannelContext();
  const [message, bindMessage, resetMessage] = useInput('');

  const [showFullMessage, setShowFullMessage] = useState(true);

  const [messages, setMessages] = useState<[string, Message][]>([]);
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (channelId) {
      joinChannel<string>(channelId, (msg, packet) => {
        setMessages(old => [...old, [msg, packet]])
      });

      return () => {
        // leaveChannel(channelId)
      }
    }
  }, [channelId]);

  const sendMessage = useCallback((e: Event) => {
    e.preventDefault();
    if (channels && message) {
      const channel = channels[channelId];
      channel?.send(message);
      resetMessage()
    }
  }, [channelId, message])

  useEffect(() => {
    if (ref.current)
      ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages, ref])

  return channelId ? (
    <div class="grid grid-cols-2 grid-rows-2 w-full h-full gap-4">
      <div class="etched p-4">
        <h2 class="text-2xl font-extrabold">Connection Packets</h2>
        <p class="text-sm">If you are not using the an official Sockpuppet client library, you can send the following JSON string directly to your Sockpuppet server.</p>
        <hr class="border-purple-50 my-4" />
        <div class="grid grid-cols-2 grid-rows-2 gap-4">
          <div>
            <h3 className="font-bold">Connect to this channel</h3>
            <pre class="w-full whitespace-pre-wrap etched p-2 mt-2">{JSON.stringify({
              'connect_to': [channelId],
            }, null, 2)}</pre>
          </div>
          <div>
            <h3 className="font-bold">Disconnect from this channel</h3>
            <pre class="w-full whitespace-pre-wrap etched p-2 mt-2">{JSON.stringify({
              'disconnect_from': [channelId],
            }, null, 2)}</pre>
          </div>
          <div>
            <h3 className="font-bold">Create this channel</h3>
            <p className="text-sm">Channels created from the client automatically close after all clients leave the channel unless the <var>keep</var> property is set to true</p>
            <pre class="w-full whitespace-pre-wrap etched p-2 mt-2">{JSON.stringify({
              'create_channel': channelId,
              // keep: false
            }, null, 2)}</pre>
          </div>
        </div>
      </div>
      <div class="etched row-span-2 p-4 flex flex-col h-full justify-between">
        <div class="h-full overflow-y-scroll max-h-[calc(100vh-410px)]" ref={ref}>
          <ul class="flex justify-end w-full flex-col h-full">
            {messages.map(m => (
              <li key={m[1].receivedAt + m[0]} class="p-4 border-b border-purple-50 last:border-none w-full flex gap-4">
                <span>{format(m[1].receivedAt, 'HH:mm')}</span>
                {showFullMessage ? <pre>{JSON.stringify(m[1], null, 2)}</pre> : <span>{m[0]}</span>}
              </li>
            ))}
          </ul>
        </div>
        <form class="flex w-full gap-4" onSubmit={sendMessage}>
          <input {...bindMessage} type="text" class="w-full p-4 text-lg rounded-lg dark:bg-black/20 bg-white/70 dark:text-white" />
        </form>
      </div>
      <div class="etched p-4">
        <h2 class="text-2xl font-extrabold">Packet Composition</h2>
        {/* <p class="text-sm">If you are not using the an official Sockpuppet client library, you can send the following JSON string directly to your Sockpuppet server.</p> */}
        <hr class="border-purple-50 my-4" />
        <pre class="w-full whitespace-pre-wrap etched p-2 mt-2">{JSON.stringify({
          'send_packet': {
            to: channelId,
            message
          }
        }, null, 2)}</pre>
      </div>
    </div>
  ) : <Dashboard />
}