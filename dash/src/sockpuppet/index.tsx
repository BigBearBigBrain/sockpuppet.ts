import { createContext, FunctionComponent } from 'preact';
import { useCallback, useContext, useEffect, useRef, useState } from 'preact/hooks';
import { useChannels } from './channel';
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
  joinChannel: puppetAction;
}

const TheaterContext = createContext<IContext>({
  // getChannels: () => null,
  channelList: [],
  socketReady: false,
  joinChannel: () => null,
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
  host,
  onConnect,
  receivesChannelList,
  receivesMetadata,
  allowRaw
}) => {
  const [channelList, setChannelList] = useState<channelListItem[]>([]);
  const [meta, setMeta] = useState<IMetadata>();

  const { channels, newChannel } = useChannels();

  const [socket, setSocket] = useState<WebSocket>();

  const getChannels = useCallback(() => {
    socket?.send('channels')
  }, [socket]);

  const getMeta = useCallback(() => {
    socket?.send('meta');
  }, [socket])

  const handleMessage = useCallback((message: MessageEvent<string>) => {
    // console.log(message.data);
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
        // try {
        const msg = new Message(JSON.parse(message.data));
        if (msg.event === 'channels') {
          setChannelList(msg.message as unknown as channelListItem[]);
        }
        if (msg.event === 'meta') {
          setMeta(msg.message as unknown as IMetadata);
        }
        // callbacks.get('message')?.forEach(cb => cb(msg));
        // if (msg.event === 'leave')
        //   deleteChannel(msg.to);
        // if (msg.event === 'join')
        //   channels.get(msg.to)?.execJoinListeners();
        // if (msg.event === 'create')
        //   onChannelCreate(msg)
        // callbacks.get(msg.event || msg.message)?.forEach(cb => cb(msg));
        // channels.get(msg.to)?.execListeners(msg.message);
        // } catch (_e) {
        //   const msg = message.data;
        //   callbacks.get(msg)?.forEach(cb => cb(msg));
        // }
        break;
    }
  }, [socket])

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

      setSocket(socket);

      return () => {
        socket.close();
        socket.removeEventListener('message', handleMessage);
        socket.removeEventListener('open', openListener);
      }
    }
  }, [receivesChannelList, getChannels, receivesMetadata, getMeta, onConnect, handleMessage]);

  const __sendRawMessage = useCallback((message: string) => {
    socket?.send(message);
  }, [socket])

  useEffect(() => {
    const socket = new WebSocket(host || location.origin.replace(/http/, 'ws'));
    setSocket(socket);
  }, [host, setSocket]);

  const joinChannel = useCallback((id: string) => {
    if (socket)
      newChannel(id, socket);
  }, [socket, newChannel]);

  return (
    <TheaterContext.Provider value={{
      // getChannels,
      channelList,
      socketReady: socket?.readyState === 1,
      meta,
      __sendRawMessage: allowRaw ? __sendRawMessage : undefined,
      joinChannel
    }}>
      {children}
    </TheaterContext.Provider>
  )
}

export const SockpuppetProvider = PuppetTheater;

export const useSockpuppet = () => useContext(TheaterContext);
