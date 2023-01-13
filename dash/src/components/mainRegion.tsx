import { format } from 'date-fns';
import { FunctionComponent } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { useChannelContext } from '../context/channel';
import { useInput } from '../hooks/input';
import { useSockpuppet } from '../sockpuppet';
import { Message } from '../sockpuppet/message';
import { Checkbox } from './checkbox';
import { Dashboard } from './dashboard';
import { JSONComposer } from './jsonComposer';

export const MainRegion: FunctionComponent = () => {
  const { joinChannel, leaveChannel, socketReady, channels, host } = useSockpuppet();
  const [prevHost, setPrevHost] = useState(host);
  const [channelId, setChannelId] = useChannelContext();
  const [message, bindMessage, resetMessage] = useInput('');

  const [showFullMessage, setShowFullMessage] = useState(false);
  const [showJsonComposer, setShowJsonComposer] = useState(false);

  const [messages, setMessages] = useState<[string, Message][]>([]);
  const [isValidJson, setIsValidJson] = useState(false);
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (channelId) {
      joinChannel<string>(channelId, (msg, packet) => {
        setMessages(old => [...old, [msg, packet]])
      });

      return () => {
        leaveChannel(channelId)
        setMessages([]);
      }
    }
  }, [channelId, joinChannel, leaveChannel]);


  useEffect(() => {
    setChannelId((channelId) => {
      if (host !== prevHost && channelId) {
        setMessages([]);
        setPrevHost(host);
        return '';
      }
      return channelId;
    });
  }, [host, prevHost, setChannelId])

  const sendMessage = useCallback((e: Event) => {
    e.preventDefault();
    if (channels && message) {
      const channel = channels[channelId];
      channel?.send(message);
      resetMessage()
    }
  }, [channelId, channels, message, resetMessage])

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
        {showJsonComposer ? (<JSONComposer bind={bindMessage} onSubmit={sendMessage} setValidJson={setIsValidJson} />) : (
          <form class="flex w-full gap-4" onSubmit={sendMessage}>
            <input {...bindMessage} type="text" class="w-full p-4 text-lg rounded-lg dark:bg-black/20 bg-white/70 dark:text-white" />
          </form>
        )}
        <div class="flex mt-2 gap-6">
          <Checkbox checked={showFullMessage} toggle={() => setShowFullMessage(old => !old)} label="Show raw packet" />
          <Checkbox checked={showJsonComposer} toggle={() => setShowJsonComposer(old => !old)} label="Compose message as JSON" />

        </div>
      </div>
      <div class="etched p-4">
        <h2 class="text-2xl font-extrabold">Packet Composition</h2>
        {/* <p class="text-sm">If you are not using the an official Sockpuppet client library, you can send the following JSON string directly to your Sockpuppet server.</p> */}
        <hr class="border-purple-50 my-4" />
        <pre class="w-full whitespace-pre-wrap etched p-2 mt-2">{JSON.stringify({
          'send_packet': {
            to: channelId,
            message: showJsonComposer && message && isValidJson ? JSON.parse(message) : message
          }
        }, null, 2)}</pre>
      </div>
    </div>
  ) : <Dashboard />
}