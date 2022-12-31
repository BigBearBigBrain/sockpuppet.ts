
import './app.css'
import { ChannelProvider } from './context/channel'
import { ChannelList } from './components/channelList'
import { PuppetTheater } from './sockpuppet'
import { MainRegion } from './components/mainRegion'
import { useEffect } from 'preact/hooks'
import { Header } from './components/header/header'

export function App() {

  return (
    <div class="grid grid-cols-4 gap-8 p-8 w-[100vw] h-[100vh] grid-rows-layout">
      <PuppetTheater
        allowRaw
        receivesChannelList
        receivesMetadata
        host={import.meta.env.NODE_ENV === "development" ? "ws://localhost:5038" : undefined}
      >
        <ChannelProvider>
          <Header isInContainer={!!import.meta.env.IN_CONTAINER} />
          <aside class="pane">
            <ChannelList />
          </aside>
          <main class="pane col-span-3">
            <div class="w-full h-full rounded-md">
              <MainRegion />
            </div>
          </main>
        </ChannelProvider>
      </PuppetTheater>
      <p className="fixed text-white bottom-0 dark:invisible">You use light mode in your browser and I hate you. If you hate the way this looks, change your browser settings because I don't care enough to make it look good</p>
    </div>
  )
}
