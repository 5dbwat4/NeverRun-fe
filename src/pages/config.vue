<template>
  <section class="config-page">
    <header class="heading-row">
      <h2>Config</h2>
      <UButton icon="i-lucide-refresh-cw" :loading="loading" variant="outline" @click="loadStatus">
        Refresh
      </UButton>
    </header>
    <p v-if="error" class="error-msg">{{ error }}</p>

    <UTable v-if="status" :data="tableData" :columns="tableColumns" class="config-table" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref,h,resolveComponent } from 'vue'
import type { ConfigSiteItem, ConfigStatusResponse } from '@/utils/config'
// import type {TableColumn } from '@nuxt/ui';
const UBadge = resolveComponent('UBadge')

interface ConfigTableRow {
  siteName: string
  searchIndexUrl: string
  statusLabel: string
  documentCount: number
  inProgressLabel: string
  lastCrawledAtLabel: string
  errorMessage: string
}

const status = ref<ConfigStatusResponse | null>(null)
const loading = ref(false)
const error = ref('')
let timer: number | null = null

const tableColumns = [
  { accessorKey: 'siteName', header: 'Site' },
  { accessorKey: 'searchIndexUrl', header: 'URL' },
  { accessorKey: 'statusLabel', header: 'Status' , 
  cell: ({ row }) => {
      const color = {
        "OK": 'success' as const,
        "Failed": 'error' as const,
        "Waiting": 'neutral' as const
      }[row.getValue('statusLabel') as string]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        row.getValue('statusLabel')
      )
    }},
  { accessorKey: 'documentCount', header: 'Entries Count' },
]

const tableData = computed<ConfigTableRow[]>(() => {
  if (!status.value) {
    return []
  }

  return status.value.sites.map((site) => ({
    siteName: site.name || '-',
    searchIndexUrl: site.searchIndexUrl,
    statusLabel: badgeLabel(site),
    documentCount: site.documentCount,
    inProgressLabel: site.inProgress ? '是' : '否',
    lastCrawledAtLabel: formatDate(site.lastCrawledAt),
    errorMessage: site.errorMessage || '-'
  }))
})

function badgeLabel(site: ConfigSiteItem) {
  if (site.inProgress) {
    return 'Waiting'
  }
  if (site.status === 'ok') {
    return 'OK'
  }
  if (site.status === 'error') {
    return 'Failed'
  }
  return 'Waiting'
}

function formatDate(raw: string | null) {
  if (!raw) {
    return '-'
  }

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) {
    return raw
  }

  return date.toLocaleString()
}

async function loadStatus() {
  loading.value = true
  error.value = ''
  try {
    const response = await fetch('./api/config')
    if (!response.ok) {
      throw new Error(`加载失败 (${response.status})`)
    }

    status.value = (await response.json()) as ConfigStatusResponse
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadStatus()
  timer = window.setInterval(() => {
    void loadStatus()
  }, 8000)
})

onUnmounted(() => {
  if (timer) {
    window.clearInterval(timer)
  }
})
</script>

<style scoped>
.config-page {
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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
  margin-bottom: 0.9rem;
}

.summary-label {
  margin: 0;
  opacity: 0.75;
  font-size: 0.86rem;
}

.summary-value {
  margin: 0.25rem 0 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.success {
  color: #198754;
}

.error {
  color: #cc334d;
}

.pending {
  color: #8d7a33;
}

.crawl-state {
  margin-bottom: 1rem;
}

.crawl-state-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.error-msg {
  color: #c93d57;
  margin-bottom: 0.8rem;
}

.config-table {
  border-radius: 0.8rem;
  overflow: hidden;
}

@media (max-width: 840px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
