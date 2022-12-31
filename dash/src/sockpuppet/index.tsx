import { createContext, FunctionComponent } from 'preact';
import { useCallback, useContext, useEffect, useRef, useState } from 'preact/hooks';
import { channelCallback } from './callbackTypes';
import { Channel, useChannels } from './channel';
import { Message } from './message';

type puppetAction = (...args: any) => void;
interface channelListItem {
  id: string;
  listeners: number;
  createdAt: number;
  lastMessage?: number;
}
interface IMetadata {
  serverStart: number;
  listeners: number;
  totalMessages: number;
}

interface IContext {
  // getChannels: puppetAction;
  channelList: channelListItem[];
  socketReady: boolean;
  meta?: IMetadata;
  __sendRawMessage?: puppetAction;
  joinChannel: <T>(id: string, handler: channelCallback<T>) => void;
  leaveChannel: puppetAction;
  channels?: Record<string, Channel>;
  host: string;
  changeHost?: (host: string) => void;
}

const TheaterContext = createContext<IContext>({
  // getChannels: () => null,
  channelList: [],
  socketReady: false,
  joinChannel: () => null,
  leaveChannel: () => null,
  host: location.origin.replace(/http/, 'ws'),
});

interface IProps {
  keepAlive?: boolean;
  host?: string;
  onConnect?: () => void;
  receivesChannelList?: boolean;
  receivesMetadata?: boolean;
  allowRaw?: boolean;
}

export const PuppetTheater: FunctionComponent<IProps> = ({
  children,
  keepAlive = true,
  host: hostProp = location.origin.replace(/http/, 'ws'),
  onConnect,
  receivesChannelList,
  receivesMetadata,
  allowRaw
}) => {
  const [host, setHost] = useState(hostProp);
  const [channelList, setChannelList] = useState<channelListItem[]>([]);
  const [meta, setMeta] = useState<IMetadata>();

  const { channels, newChannel, removeChannel } = useChannels();

  const [socket, setSocket] = useState<WebSocket>();

  const getChannels = useCallback(() => {
    socket?.send('channels')
  }, [socket]);

  const getMeta = useCallback(() => {
    socket?.send('meta');
  }, [socket])

  const handleMessage = useCallback((message: MessageEvent<string>) => {
    switch (message.data) {
      case "open":
      case "connected":
        //I'm sure these may be useful
        break;
      case "disconnected":
        // callbacks.get('disconnect')?.forEach(cb => cb(message.data));
        // channels.forEach(channel => channel.execLeaveListeners());
        break;
      case "ping":
        if (keepAlive) {
          socket?.send('pong');
        }
        break;
      default:
        try {
          const json = JSON.parse(message.data)
          console.log(json);
          const msg = new Message(json);
          if (msg.event === 'channels') {
            return setChannelList(msg.message as unknown as channelListItem[]);
          }
          if (msg.event === 'meta') {
            return setMeta(msg.message as unknown as IMetadata);
          }
          // callbacks.get('message')?.forEach(cb => cb(msg));
          // if (msg.event === 'leave')
          //   deleteChannel(msg.to);
          // if (msg.event === 'join')
          //   channels.get(msg.to)?.execJoinListeners();
          // if (msg.event === 'create')
          //   onChannelCreate(msg)
          // callbacks.get(msg.event || msg.message)?.forEach(cb => cb(msg));
          if (!channels?.[msg.to]) {
            if (Array.isArray(json)) {
              setChannelList(json)
            } else
              throw "Cannot convert to message...";
          }
          channels?.[msg.to]?.execListeners(msg.message, msg);
        } catch (_e) {
          const msg = message.data;
          // callbacks.get(msg)?.forEach(cb => cb(msg));
          console.log('Server message:', msg);
        }

        break;
    }
  }, [socket, channels, keepAlive])

  // TODO - this is a nightmare, this should happen when the socket is openned, but it also needs to listen for handleMessage changes....
  useEffect(() => {
    if (socket) {
      const openListener = () => {
        receivesChannelList && getChannels();
        receivesMetadata && getMeta();
        onConnect && onConnect();
        (window as any).testsocket = (window as any).testsocket || [];
        (window as any).testsocket.push(socket)
      }
      socket.addEventListener('message', handleMessage);
      socket.addEventListener('open', openListener);

      // setSocket(socket);

      return () => {
        // socket.close();
        socket.removeEventListener('message', handleMessage);
        socket.removeEventListener('open', openListener);
      }
    }
  }, [receivesChannelList, getChannels, receivesMetadata, getMeta, onConnect, handleMessage]);

  const __sendRawMessage = useCallback((message: string) => {
    socket?.send(message);
  }, [socket])

  useEffect(() => {
    const socket = new WebSocket(host);
    setSocket(socket);
  }, [host, setSocket]);

  const joinChannel = useCallback(<T,>(id: string, handler: channelCallback<T>) => {
    if (socket) {
      socket.send(JSON.stringify({
        'connect_to': [id]
      }));
      newChannel(id, socket, handler);
    }
  }, [socket, newChannel]);

  const leaveChannel = useCallback((id: string) => {
    if (socket) {
      socket.send(JSON.stringify({
        'disconnect_from': [id]
      }));
      removeChannel(id);
    }
  }, [socket, removeChannel]);

  const changeHost = useCallback((host: string) => {
    setHost(host);
  }, [])

  return (
    <TheaterContext.Provider value={{
      // getChannels,
      channelList,
      socketReady: socket?.readyState === 1,
      meta,
      __sendRawMessage: allowRaw ? __sendRawMessage : undefined,
      joinChannel,
      leaveChannel,
      channels,
      host,
      changeHost
    }}>
      {children}
    </TheaterContext.Provider>
  )
}

export const SockpuppetProvider = PuppetTheater;

export const useSockpuppet = () => useContext(TheaterContext);
