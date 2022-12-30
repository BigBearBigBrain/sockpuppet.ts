import { useState } from 'preact/hooks'
import preactLogo from './assets/preact.svg'
import './app.css'
import { ChannelProvider } from './context/channel'
import { ChannelList } from './components/channelList'
import { Dashboard } from './components/dashboard'

export function App() {

  return (
    <div class="grid grid-cols-4 gap-8 p-8 w-[100vw] h-[100vh] grid-rows-layout">
      <header class="pane col-span-4 flex items-center">
        <img class="h-16 mx-4" src="/sockpuppet-solo.svg" alt="Sockpuppet logo" />
        <h1 class="text-5xl uppercase font-extrabold">Sockpuppet</h1>
      </header>
      <ChannelProvider>
        <aside class="pane">
          <ChannelList />
        </aside>
        <main class="pane col-span-3">
          <div class="w-full h-full rounded-md">
            <Dashboard />
          </div>
        </main>
      </ChannelProvider>
    </div>
  )
}
