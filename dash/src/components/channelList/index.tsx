import { FunctionComponent } from 'preact'
import { useCallback, useState } from 'preact/hooks'
import { useChannelContext } from '../../context/channel';
import { useInput } from '../../hooks/input';
import { useSockpuppet } from '../../sockpuppet';
import { Modal } from '../modal';

export const ChannelList: FunctionComponent = () => {
  const { channelList: channels, createChannel } = useSockpuppet();
  const [channel, setChannelId] = useChannelContext();
  const [showModal, setShowModal] = useState(false);

  const [channelName, bindChannelName] = useInput('');

  const handleCreate = useCallback(() => {
    if (channelName)
      createChannel(channelName)
  }, [channelName, createChannel]);

  const disconnect = useCallback(() => {
    setChannelId('')
  }, [])

  return (
    <>
      <div class="h-full p-2">
        <div class="flex justify-between">
          <h3 class="uppercase font-bold mt-2">channels</h3>
          <button class="bg-green" onClick={() => setShowModal(true)}>Create Channel</button>
        </div>
        {channels.length > 1 && !channels[0].id && <p className="text-sm">This is a legacy puppet that does not support the dashboard, functionality is limited</p>}
        <hr class="border-purple-50 my-4" />
        <ul class="flex flex-col gap-2">
          {channels.map(c => (
            <li key={c.id || c} class="w-full flex gap-4 items-center rounded-lg">
              <div data-current={channel === (c.id || c)} class="data-[current=true]:border-2 border-purple-50 w-full h-full rounded-lg">
                <button onClick={() => setChannelId(c.id || c as unknown as string)} class="w-full etched shadow-none flex justify-between p-4 hover:bg-white/20 bg-black/10 rounded-md cursor-pointer transition-bg duration-300">
                  <span>{c.id || c}</span>
                  <span>{c.listeners}</span>
                </button>
              </div>
              {channel === (c.id || c) && (
                <button class="bg-red-100 h-full" onClick={disconnect}>
                  Leave Channel
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <Modal show={showModal} setShow={setShowModal}>
        <p class="text-xl font-bold">Create a new channel</p>
        <input type="text" {...bindChannelName} placeholder="Channel name..." />
        <br />
        <button onClick={handleCreate} class="mt-4 bg-purple-50" disabled={!channelName}>Create Channel</button>
      </Modal>
    </>
  )
}
