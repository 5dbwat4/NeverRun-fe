<template>
  <section class="index-page">
    <header class="heading-row">
      <h2>Now let's run</h2>
    </header>

    <UCard>
      <div v-if="runsCount > 0" class="runs-summary">
        <UIcon name="i-lucide-footprints" class="runs-icon" />
        You have run <strong>{{ runsCount }}</strong> times this term.
      </div>

     <!-- <p class="desc">
        The procedure contains 2 steps: get a sportId &amp; submit the sport. You can submit the sport any time you want, the only requirement is it should be 30min after you get the sportId.
      </p>-->

      <UTabs :items="tabs" class="w-full">
        <template #sport-id>
          <UCard>
            <UAlert
              v-if="!inSportTime"
              icon="i-lucide-triangle-alert"
              variant="subtle"
              color="warning"
              title="Not in sport time"
              description="Now it's not the sport time. Despite you can still request a sportId, it may not count as a valid run."
              class="mb-3"
            />

            <UAlert
              v-if="idError"
              icon="i-lucide-circle-alert"
              variant="subtle"
              color="error"
              :title="idError"
              class="mb-3"
            />

            <div v-if="sportResult" class="sport-result">
              <div class="result-row">
                <span class="result-label">sportId</span>
                <span class="result-value result-sport-id">{{ sportResult.sport_id }}</span>
              </div>
              <div class="result-row">
                <span class="result-label">timestamp</span>
                <span class="result-value">{{ sportResult.timestamp }}</span>
              </div>
              <div class="action-row">
              <UButton icon="i-lucide-copy" variant="outline" size="sm" @click="copyPayload">
                Copy
              </UButton>
              <UButton icon="i-lucide-rotate-cw" variant="outline" size="sm" @click="sportResult = null">
                Again
              </UButton>
            </div>
              <p class="mt-3 text-[0.9rem] text-[--ns-muted] font-['DM_Sans',system-ui]">
                Take a break and get a coffee. None of your personal info is stored in remote server, so it will not auto submit for you. But you can submit the sport any time you want.
              </p>
            </div>

            <UButton v-if="!sportResult" color="primary" :loading="gettingId" block @click="getSportId">
              Get sportId
            </UButton>
          </UCard>
        </template>

        <template #submit>
          <RunningStatus
            v-if="isRunning"
            ref="runningStatusRef"
            :sport-id="runningSportId"
            :timestamp="runningTimestamp"
            @done="onRunDone"
          />

          <UCard v-else>
            <p class="tab-desc">Select an existing sport ID, or input your payload.</p>

            <div v-if="unusedIds.length > 0" class="mb-3">
              <URadioGroup
                v-model="selectedSportId"
                :items="visibleIds"
                variant="table"
                class="w-full sport-id-group"
              />
              <UButton
                v-if="unusedIds.length > 3 && !showAllIds"
                variant="link"
                size="sm"
                class="mt-1"
                @click="showAllIds = true"
              >
                Show more
              </UButton>
            </div>

            <UTextarea
              v-if="selectedSportId === '__custom__'"
              v-model="payload"
              placeholder="Or paste your base64-encoded payload here..."
              :rows="4"
              :disabled="submitting"
              class="w-full"
            />

            <UAlert
              v-if="tooEarly"
              icon="i-lucide-clock"
              variant="subtle"
              color="warning"
              title="Too early"
              description="It's been less than 30 minutes since this ID was requested. You can still submit, but it may not count as a valid run."
              class="mb-3"
            />

            <UCheckbox v-model="customizedRun" label="Customized run" class="mb-3" />

            <UForm v-if="customizedRun" class="mb-3 space-y-4" >
              <UFormField label="Distance (km)">
                <UInput v-model.number="distanceKm" type="number" step="0.1" min="0.1" class="w-full" :disabled="submitting" />
              </UFormField>
              <UFormField label="Pace (min/km)">
                <UInput v-model.number="paceMinPerKm" type="number" step="0.1" min="1" class="w-full" :disabled="submitting" />
              </UFormField>
              <UCheckbox v-model="ignorePrejudgement" variant="card" label="Ignore prejudgement fail" description="If checked, the sport will still be submitted even if the prejudgement step fails, which may result in an invalid run." />
            </UForm>

            <UButton
              color="primary"
              :loading="submitting"
              :disabled="submitting || !canSubmit"
              block
              class="mt-3"
              @click="submitSport"
            >
              Submit
            </UButton>
            <p v-if="submitError" class="mt-2 text-[0.9rem] text-[--ns-danger]">{{ submitError }}</p>
          </UCard>
        </template>
      </UTabs>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { TabsItem } from '@nuxt/ui'
import { useUserStore } from '@/stores/user'
import type { SportIdEntry } from '@/stores/user'
import copy from 'copy-to-clipboard'
import RunningStatus from '@/components/RunningStatus.vue'
import { createSSEStream } from '@/utils/sse'

const router = useRouter()
const store = useUserStore()

const tabs = ref<TabsItem[]>([
  { label: 'Get sportId', icon: 'i-lucide-ticket', slot: 'sport-id' },
  { label: 'Submit sport', icon: 'i-lucide-send', slot: 'submit' }
])

const gettingId = ref(false)
const idError = ref('')
const submitting = ref(false)
const submitError = ref('')
const selectedSportId = ref('')
const payload = ref('')
const showAllIds = ref(false)
const isRunning = ref(false)
const customizedRun = ref(false)
const distanceKm = ref(3.1)
const paceMinPerKm = ref(8.0)
const ignorePrejudgement = ref(false)
const runningSportId = ref('')
const runningTimestamp = ref('')
const runningStatusRef = ref<InstanceType<typeof RunningStatus> | null>(null)
let sseController: AbortController | null = null

interface SportIdResponse {
  message: string
  sport_id: string
  timestamp: string
}

const sportResult = ref<SportIdResponse | null>(null)

const runsCount = ref(0)
const inSportTime = ref(true)

const unusedIds = computed<SportIdEntry[]>(() =>
  store.sportIds.filter(e => !e.used).reverse()
)

const visibleIds = computed(() => {
  const items = unusedIds.value.map(e => ({
    label: e.sport_id,
    description: formatTimestamp(e.timestamp),
    value: e.sport_id
  }))
  if (showAllIds.value || unusedIds.value.length <= 3) {
    items.push({ label: 'Input your payload', value: '__custom__' })
    return items
  }
  const sliced = items.slice(0, 3)
  sliced.push({ label: 'Input your payload', value: '__custom__' })
  return sliced
})

const canSubmit = computed(() => {
  if (!selectedSportId.value) return false
  if (selectedSportId.value === '__custom__') return payload.value.trim() !== ''
  return true
})

const tooEarly = computed(() => {
  let ts: string | undefined
  if (selectedSportId.value === '__custom__') {
    try {
      const decoded = JSON.parse(atob(payload.value.trim()))
      ts = decoded.timestamp
    } catch { return false }
  } else {
    const entry = store.sportIds.find(e => e.sport_id === selectedSportId.value)
    ts = entry?.timestamp
  }
  if (!ts) return false
  const elapsed = Date.now() - new Date(ts).getTime()
  return elapsed < 30 * 60 * 1000
})

function formatTimestamp(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

async function getSportId() {
  gettingId.value = true
  idError.value = ''
  try {
    const response = await fetch('./api/requestSportId', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: store.username,
        token: store.token
      })
    })
    if (!response.ok) {
      const detail = await response.text()
      throw new Error(detail || `请求失败 (${response.status})`)
    }
    const data = (await response.json()) as SportIdResponse
    sportResult.value = {
      ...data,
      timestamp: formatTimestamp(data.timestamp)
    }
    store.addSportId(data.sport_id, data.timestamp)
  } catch (err) {
    idError.value = err instanceof Error ? err.message : '请求失败'
  } finally {
    gettingId.value = false
  }
}

function copyPayload() {
  if (!sportResult.value) return
  const raw = JSON.stringify({
    sport_id: sportResult.value.sport_id,
    timestamp: sportResult.value.timestamp
  })
  copy(btoa(unescape(encodeURIComponent(raw))))
}

function submitSport() {
  const entry = store.sportIds.find(e => e.sport_id === selectedSportId.value)
  const rawTs = entry?.timestamp || (() => {
    try { return JSON.parse(atob(payload.value.trim())).timestamp } catch { return '' }
  })()
  const d = new Date(rawTs)
  const ts = d instanceof Date && !isNaN(d.getTime())
    ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
    : rawTs

  runningSportId.value = selectedSportId.value === '__custom__'
    ? (() => { try { return JSON.parse(atob(payload.value.trim())).sport_id } catch { return '' } })()
    : selectedSportId.value
  runningTimestamp.value = ts
  isRunning.value = true

  sseController = createSSEStream('./api/submitSport', {
    sport_id: runningSportId.value,
    username: store.username,
    token: store.token,
    timestamp: ts,
    ...(customizedRun.value ? { distance_km: distanceKm.value, pace_min_per_km: paceMinPerKm.value, ignore_prejudgement: ignorePrejudgement.value } : {}),
  }, (event) => {
    runningStatusRef.value?.onSSEEvent(event)
  })
}

function onRunDone() {
  isRunning.value = false
  sseController = null
  if (selectedSportId.value !== '__custom__') {
    store.markSportIdUsed(selectedSportId.value)
  }
  selectedSportId.value = ''
  payload.value = ''
}

async function fetchRunsSummary() {
  try {
    const response = await fetch('./api/alreadyRuns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: store.username, token: store.token })
    })
    if (response.ok) {
      const data = await response.json()
      runsCount.value = data.count
    }
  } catch {
    // ignore
  }
}

async function fetchInSportTime() {
  try {
    const response = await fetch('./api/inSportTime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: store.username, token: store.token })
    })
    if (response.ok) {
      const data = await response.json()
      inSportTime.value = data.data
    }
  } catch {
    // ignore
  }
}

onMounted(() => {
  if (store.isFirstTime) {
    router.push('/first-time')
  }
  fetchRunsSummary()
  fetchInSportTime()
})
</script>

<style scoped>
.index-page {
  width: min(980px, 100%);
  margin: 0 auto;
}

.heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.heading-row h2 {
  margin: 0;
  font-size: 1.3rem;
  font-family: 'Monomakh', system-ui;
}

.desc {
  margin-bottom: 1rem;
  color: var(--ns-muted);
  line-height: 1.625;
  font-family: 'DM Sans', system-ui;
}

.runs-summary {
  display: flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.6rem 0.8rem;
  margin-bottom: 0.8rem;
  border-radius: 0.6rem;
  background: var(--ns-surface-soft);
  color: var(--ns-text);
  font-size: 0.9rem;
  font-family: 'DM Sans', system-ui;
}

.runs-icon {
  flex-shrink: 0;
  font-size: 1.1em;
  color: var(--ns-text-strong);
}

.runs-summary strong {
  color: var(--ns-text-strong);
  font-weight: 700;
}

.runs-unit {
  font-size: 0.8rem;
  color: var(--ns-muted);
}

.runs-des {
  font-size: 0.82rem;
  color: var(--ns-muted);
}

.runs-tips {
  font-size: 0.8rem;
  color: var(--ns-muted);
  opacity: 0.7;
}

.tab-desc {
  margin-bottom: 0.8rem;
  color: var(--ns-muted);
  line-height: 1.625;
  font-family: 'DM Sans', system-ui;
}

.sport-result {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.action-row {
  display: flex;
  gap: 0.5rem;
}

.result-row {
  display: flex;
  align-items: flex-start;
  padding: 0.4rem 0;
}

.result-label {
  width: 100px;
  flex-shrink: 0;
  color: var(--ns-muted);
  font-size: 0.9rem;
  font-family: 'DM Sans', system-ui;
}

.result-value {
  color: var(--ns-text);
  font-size: 0.9rem;
  font-family: 'DM Sans', system-ui;
  word-break: break-all;
}

.sport-id-group :deep(label) {
  font-family: 'Roboto Mono', monospace;
}

.result-sport-id {
  font-family: 'Roboto Mono', monospace;
}
</style>
