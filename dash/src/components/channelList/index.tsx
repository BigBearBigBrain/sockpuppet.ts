import { FunctionComponent } from 'preact'
import { useState } from 'preact/hooks'
import { useChannelContext } from '../../context/channel';
import { useSockpuppet } from '../../sockpuppet';
import { Modal } from '../modal';

export const ChannelList: FunctionComponent = () => {
  const { channelList: channels } = useSockpuppet();
  const [channel, setChannelId] = useChannelContext();
  const [showModal, setShowModal] = useState(false);

  console.log(channels);

  return (
    <>
      <div class="h-full p-2">
        <div class="flex justify-between">
          <h3 class="uppercase font-bold mt-2">channels</h3>
          <button class="bg-green" onClick={() => setShowModal(true)}>Create Channel</button>
        </div>
        {channels.length > 1 && !channels[0].id && <p className="text-sm">This is a legacy server that does not support the dashboard, functionality is limited</p>}
        <hr class="border-purple-50 my-4" />
        <ul class="flex flex-col gap-2">
          {channels.map(c => (
            <li key={c.id || c} onClick={() => setChannelId(c.id || c as unknown as string)} class="etched flex justify-between p-4 hover:bg-white/20 bg-black/10 rounded-md cursor-pointer transition-bg duration-300">
              <span>{c.id || c}</span>
              <span>{c.listeners}</span>
            </li>
          ))}
        </ul>
      </div>
      <Modal show={showModal} setShow={setShowModal}>
        Hello yes I am dialog
      </Modal>
    </>
  )
}
