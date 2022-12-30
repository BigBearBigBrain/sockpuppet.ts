import { createContext, FunctionComponent } from 'preact';
import { StateUpdater, useContext, useState } from 'preact/hooks';

export const ChannelContext = createContext<[string, StateUpdater<string>]>([
  '',
  () => null
])

export const ChannelProvider: FunctionComponent = ({children}) => {
  const [channelId, setChannelId] = useState<string>('');

  
  
  return (
    <ChannelContext.Provider value={[channelId, setChannelId]}>
      {children}
    </ChannelContext.Provider>
  )
}

export const useChannelContext = () => useContext(ChannelContext);
