<script setup lang="ts">
import Loading from "./components/loading.vue";
</script>

<template>
  <UApp>
    <main class="min-h-screen px-5 pt-12 pb-16 bg-ns-bg text-ns-text transition-colors duration-300">
      <section class="w-[min(980px,100%)] mx-auto mb-[1.3rem] flex justify-between gap-4 items-start max-[860px]:flex-col">
        <div>
          <h1 class="text-4xl m-0 font-monomakh">NeverRun</h1>
          <p class="font-dm-sans my-[0.2rem]">Tired of the iOS lock-in of RealRun? Then switch to NeverRun.</p>
          <p class="flex gap-2 items-center flex-wrap">
            <router-link to="/" class="text-ns-link no-underline hover:text-ns-text-strong hover:underline transition-colors duration-200">Run</router-link>
            <span>|</span>
            <router-link to="/manage" class="text-ns-link no-underline hover:text-ns-text-strong hover:underline transition-colors duration-200">Manage</router-link>
            <span>|</span>
            <router-link to="/about" class="text-ns-link no-underline hover:text-ns-text-strong hover:underline transition-colors duration-200">About</router-link>
          </p>
        </div>

        <div class="flex gap-2.5 items-center">
          <UColorModeButton color="neutral" />
        </div>
      </section>

      <div class="w-[min(980px,100%)] mx-auto">
        <RouterView v-slot="{ Component }">
          <template v-if="Component">
            <Transition name="fade" mode="out-in">
              <KeepAlive>
                <Suspense>
                  <component :is="Component"></component>
                  <template #fallback>
                    <Loading />
                  </template>
                </Suspense>
              </KeepAlive>
            </Transition>
          </template>
        </RouterView>
      </div>
    </main>
  </UApp>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
