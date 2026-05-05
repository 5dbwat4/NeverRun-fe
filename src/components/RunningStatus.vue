<template>
  <UCard>
    <template #header>
      <h3 class="running-title">Running</h3>
    </template>

    <div class="running-info">
      <div class="info-row">
        <span class="info-label">sportId</span>
        <span class="info-value font-mono">{{ sportId }}</span>
      </div>
      <div class="info-row">
        <span class="info-label">time</span>
        <span class="info-value">{{ timestamp }}</span>
      </div>
    </div>

    <UTimeline :items="timelineItems" :model-value="String(activeIndex)" size="sm" class="mt-3" >
      <template #description="{ item }">
        <pre v-if="item.description" class="description text-xs text-muted mt-1" >{{ item.description }}</pre>
        </template>
      </UTimeline>

    <UAlert
      v-if="runError"
      icon="i-lucide-circle-alert"
      variant="subtle"
      color="error"
      :title="runError"
      class="mt-3"
    />

    <UButton
      v-if="isDone"
      icon="i-lucide-check"
      color="primary"
      block
      class="mt-3"
      @click="emit('done')"
    >
      Finish
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TimelineItem } from '@nuxt/ui'

const props = defineProps<{
  sportId: string
  timestamp: string
}>()

const emit = defineEmits<{
  (e: 'done'): void
}>()

const timelineItems = ref<TimelineItem[]>([
  { title: 'Authenticating', icon: 'i-lucide-loader-circle', value: '0' },
  { title: 'Fetching route info', icon: 'i-lucide-map-pin', value: '1' },
  { title: 'Getting term', icon: 'i-lucide-calendar', value: '2' },
  { title: 'Generating trajectory', icon: 'i-lucide-route', value: '3' },
  { title: 'Computing metrics', icon: 'i-lucide-calculator', value: '4' },
  { title: 'Prejudgment [1/3]', icon: 'i-lucide-check-circle', value: '5' },
  { title: 'Submitting [2/3]', icon: 'i-lucide-send', value: '6' },
  { title: 'Uploading sensor [3/3]', icon: 'i-lucide-upload', value: '7' },
])

const activeIndex = ref(-1)
const runError = ref('')
const isDone = ref(false)

const stepMap: Record<string, number> = {
  auth: 0,
  route: 1,
  term: 2,
  generate: 3,
  compute: 4,
  prejudgment: 5,
  savesports: 6,
  sensor: 7,
}

function setStep(step: string, success: boolean, inProgress: boolean, description: string = '') {
  console.log(`Step update: ${step}, success=${success}, inProgress=${inProgress}, description=${description}`)
  const idx = stepMap[step]
  if (idx === undefined) return
  if (success) {
    timelineItems.value[idx].icon = 'i-lucide-check-circle'
    if (description) timelineItems.value[idx].description = description
  } else if (inProgress) {
    timelineItems.value[idx].icon = 'i-lucide-loader-circle'
  } else {
    timelineItems.value[idx].icon = 'i-lucide-x-circle'
    if (description) timelineItems.value[idx].description = description
  }
  activeIndex.value = idx
}

function onSSEEvent(event: { type: string; step: string; message: string }) {
  if (event.type === 'info') {
    setStep(event.step, false, true)
  }
  if (event.type === 'success') {
    setStep(event.step, true, false, event.message)
  }
  if (event.type === 'error') {
    setStep(event.step, false, false, event.message)
    runError.value = event.message
  }
  if (event.type === 'done') {
    isDone.value = true
  }
}

defineExpose({ onSSEEvent })
</script>

<style scoped>
.running-title {
  margin: 0;
  font-size: 1rem;
  font-family: 'Monomakh', system-ui;
}

.running-info {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  align-items: flex-start;
  padding: 0.3rem 0;
}

.info-label {
  width: 80px;
  flex-shrink: 0;
  color: var(--ns-muted);
  font-size: 0.9rem;
  font-family: 'DM Sans', system-ui;
}

.info-value {
  color: var(--ns-text);
  font-size: 0.9rem;
  font-family: 'DM Sans', system-ui;
  word-break: break-all;
}

.font-mono {
  font-family: 'Roboto Mono', monospace;
}

:deep(.description) {
  white-space: pre-line;
}
</style>
