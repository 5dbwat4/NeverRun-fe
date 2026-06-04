<template>
  <section :class="$style['config-page']">
    <header :class="$style['heading-row']">
      <h2 :class="$style.heading">Config</h2>
      <UButton icon="i-lucide-refresh-cw" :loading="loading" variant="outline" @click="loadStatus">
        Refresh
      </UButton>
    </header>
    <p v-if="error" class="text-ns-error mb-3">{{ error }}</p>

    <UTable v-if="status" :data="tableData" :columns="tableColumns" :class="$style['config-table']" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, h, resolveComponent } from 'vue'
import type { ConfigSiteItem, ConfigStatusResponse } from '@/utils/config'

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
  {
    accessorKey: 'statusLabel',
    header: 'Status',
    cell: ({ row }) => {
      const color = {
        "OK": 'success' as const,
        "Failed": 'error' as const,
        "Waiting": 'neutral' as const
      }[row.getValue('statusLabel') as string]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        row.getValue('statusLabel')
      )
    }
  },
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

<style scoped module>
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

.heading {
  margin: 0;
  font-size: 1.3rem;
  font-family: "Monomakh", system-ui;
}

.config-table {
  border-radius: 0.8rem;
  overflow: hidden;
}
</style>
