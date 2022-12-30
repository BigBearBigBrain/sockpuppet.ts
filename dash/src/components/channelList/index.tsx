import { FunctionComponent } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'

interface IChannelData {
  id: string;
  listeners: number;
}

export const ChannelList: FunctionComponent = () => {
  const [channels, setChannels] = useState<IChannelData[]>([]);

  const fetchChannelList = useCallback(() => {
    setChannels([
      {
        id: 'bananas',
        listeners: 2
      },
      {
        id: 'the_channel_of_life',
        listeners: 30
      },
    ])
  }, [setChannels])

  useEffect(() => {
    fetchChannelList()
  }, [fetchChannelList])

  return (
    <div class="dark:bg-grizzly-100/70 bg-grizzly-100/10 h-full rounded-lg p-2">
      <div class="flex justify-between">
        <h3 class="uppercase font-bold mt-2">channels</h3>
        <button class="bg-green">Create Channel</button>
      </div>
      <hr class="border-purple-50 my-4" />
      <ul class="flex flex-col gap-2">
        {channels.map(c => (
          <li class="flex justify-between p-4 hover:bg-white/20 bg-black/10 rounded-md cursor-pointer transition-bg duration-300">
            <span>{c.id}</span>
            <span>{c.listeners}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}