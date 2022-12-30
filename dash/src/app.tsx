
import './app.css'
import { ChannelProvider } from './context/channel'
import { ChannelList } from './components/channelList'
import { PuppetTheater } from './sockpuppet'
import { MainRegion } from './components/mainRegion'

export function App() {

  return (
    <div class="grid grid-cols-4 gap-8 p-8 w-[100vw] h-[100vh] grid-rows-layout">
      <header class="pane col-span-4 flex items-center">
        <img class="h-16 mx-4" src="/sockpuppet-solo.svg" alt="Sockpuppet logo" />
        <div >
          <h1 class="text-5xl uppercase font-extrabold font-permanent-marker">Puppetshow</h1>
          <p>Powered by <a href="https://deno.land/x/sockpuppet" target="_blank">Sockpuppet</a></p>
        </div>
      </header>
      <PuppetTheater
        allowRaw
        receivesChannelList
        receivesMetadata
        host="ws://localhost:5038"
      >
        <ChannelProvider>
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
