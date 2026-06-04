<template>
  <section class="w-[min(980px,100%)] mx-auto">
    <header class="flex items-center justify-between mb-4">
      <h2 class="m-0 text-[1.3rem] font-monomakh">Manage stored info</h2>
    </header>

    <UCard>
      <template #header>
        <h3 class="m-0 text-base font-monomakh">Auth</h3>
      </template>

      <div class="flex flex-col">
        <div class="flex items-start py-2.5 border-b border-ns-border">
          <span class="w-[120px] shrink-0 text-ns-muted text-[0.9rem] font-dm-sans">Username</span>
          <span class="text-ns-text text-[0.9rem] font-dm-sans break-all">{{ store.username || '(not set)' }}</span>
        </div>
        <div class="flex items-start py-2.5 border-b border-ns-border">
          <span class="w-[120px] shrink-0 text-ns-muted text-[0.9rem] font-dm-sans">Password</span>
          <span class="text-ns-text text-[0.9rem] font-dm-sans break-all">{{ store.hasPassword ? '*****' : '(not offered)' }}</span>
        </div>
        <div class="flex items-start py-2.5">
          <span class="w-[120px] shrink-0 text-ns-muted text-[0.9rem] font-dm-sans">JWT Token</span>
          <span class="text-ns-text text-[0.9rem] font-dm-sans break-all cursor-pointer select-none transition-colors duration-200 hover:text-ns-link" @click="toggleToken">
            <template v-if="tokenRevealed">{{ store.token || '(not set)' }}</template>
            <template v-else>{{ maskedToken }}</template>
          </span>
        </div>
      </div>

      <div class="flex gap-2.5 mt-4">
        <UButton v-if="store.hasPassword" icon="i-lucide-refresh-cw" variant="outline" :loading="refetching" @click="refetchToken">
          Refetch token
        </UButton>
        <UButton icon="i-lucide-trash-2" color="error" variant="outline" :loading="clearing" @click="removeAll">
          Remove all my information
        </UButton>
      </div>

      <p v-if="error" class="mt-2 text-[0.9rem] text-ns-danger">{{ error }}</p>
    </UCard>

    <UCard class="mt-4">
      <template #header>
        <h3 class="m-0 text-base font-monomakh">Stored sports</h3>
      </template>

      <p class="text-ns-text text-[0.9rem] font-dm-sans">You have <strong>{{ store.sportIdsCount }}</strong> stored sport record{{ store.sportIdsCount === 1 ? '' : 's' }}.</p>

      <div class="flex gap-2.5 mt-4">
        <UButton icon="i-lucide-trash-2" color="error" variant="outline" :loading="clearingSports" :disabled="store.sportIdsCount === 0" @click="removeAllSports">
          Remove all
        </UButton>
        <UButton icon="i-lucide-trash-2" color="error" variant="outline" :loading="clearingUsed" :disabled="store.sportIdsCount - store.unusedSportIdsCount === 0" @click="removeUsed">
          Remove all used
        </UButton>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { encode } from '@/utils/codec'

const router = useRouter()
const store = useUserStore()

const tokenRevealed = ref(false)
const refetching = ref(false)
const clearing = ref(false)
const clearingSports = ref(false)
const clearingUsed = ref(false)
const error = ref('')

const maskedToken = computed(() => {
  const t = store.token
  if (!t) return '(not set)'
  if (t.length <= 20) return t
  return t.slice(0, 10) + '[...]' + t.slice(-10)
})

function toggleToken() {
  tokenRevealed.value = !tokenRevealed.value
}

function removeAll() {
  clearing.value = true
  store.clear()
  router.push('/first-time')
  clearing.value = false
}

async function refetchToken() {
  refetching.value = true
  error.value = ''
  try {
    const password = await store.loadPassword()
    if (!password) {
      throw new Error('No stored password')
    }
    const encodedPassword = await encode(password)
    const response = await fetch('./api/getToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: store.username,
        password: encodedPassword
      })
    })
    if (!response.ok) {
      const detail = await response.text()
      throw new Error(detail || `获取失败 (${response.status})`)
    }
    const data = await response.json()
    await fetch('./api/verifyToken?t=' + Date.now(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: data.username, token: data.token })
    }).then(async (verifyResp) => {
      if (!verifyResp.ok) {
        const detail = await verifyResp.text()
        throw new Error(detail || `验证失败 (${verifyResp.status})`)
      }
      const verifyData = await verifyResp.json()
      store.setCredentials(verifyData.xh, verifyData.token)
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Refetch failed'
  } finally {
    refetching.value = false
  }
}

function removeAllSports() {
  clearingSports.value = true
  store.clearAllSportIds()
  clearingSports.value = false
}

function removeUsed() {
  clearingUsed.value = true
  store.clearUsedSportIds()
  clearingUsed.value = false
}
</script>
