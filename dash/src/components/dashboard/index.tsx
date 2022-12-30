import { FunctionComponent } from 'preact';

export const Dashboard: FunctionComponent = () => {
  return (
    <div class="w-full h-full grid grid-cols-4 grid-rows-4 gap-4">
      <div class="dash-card row-span-2 col-span-2">
        <span class="text-9xl font-extrabold">2</span>
        <p class="text-3xl font-bold">Active Channels</p>
      </div>
      <div class="dash-card row-span-2 col-span-2">
        <span class="text-9xl font-extrabold">0</span>
        <p class="text-3xl font-bold">Stale Channels</p>
      </div>
      <div class="dash-card col-span-2">
        <span class="text-5xl font-extrabold">0</span>
        <p class="text-2xl font-bold">Namespaces</p>
      </div>
      <div class="dash-card col-span-2">
        <span class="text-5xl font-extrabold">31</span>
        <p class="text-2xl font-bold">Listeners</p>
      </div>
      <div class="dash-card flex-col">
        <p class="text-2xl"><span class="font-extrabold">356</span> messages in the last hour</p>
        <p>Avg. 347.7/hr</p>
      </div>
      <div class="dash-card flex-col">
        <p className="text-xl">Oldest channel age:</p>
        <span class="text-2xl font-extrabold">37 days, 13 hours, 17 minutes</span>
      </div>
      <div class="dash-card flex-col">
        <p className="text-xl">Uptime:</p>
        <span class="text-2xl font-extrabold">37 days, 13 hours, 17 minutes</span>
      </div>
      <div class="dash-card">
        <p class="text-2xl"><span class="font-extrabold">313,382</span> messages since start</p>
      </div>
    </div>
  )
}