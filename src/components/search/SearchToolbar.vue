<template>
  <form class="search-toolbar" @submit.prevent="emitSearch">
    <UInput
      :model-value="query"
      class="query-input"
      placeholder="输入关键词"
      icon="i-lucide-search"
      autocomplete="off"
      @update:model-value="onQueryUpdate"
    />

    <USelect
      :model-value="field"
      class="field-select"
      :items="fieldItems"
      value-key="value"
      @update:model-value="onFieldUpdate"
    />

    <UButton
      type="submit"
      color="primary"
      :loading="loading"
      :disabled="loading || !query.trim()"
    >
      搜索
    </UButton>
  </form>
</template>

<script setup lang="ts">
import type { SearchField } from '@/utils/search'

interface FieldOption {
  label: string
  value: SearchField
}

const props = defineProps<{
  query: string
  field: SearchField
  loading: boolean
}>()

const emit = defineEmits<{
  (event: 'update:query', value: string): void
  (event: 'update:field', value: SearchField): void
  (event: 'search'): void
}>()

const fieldItems: FieldOption[] = [
    { label: '标题', value: 'title' },
  { label: '全文', value: 'content' },
]

function onQueryUpdate(value: string | number) {
  emit('update:query', String(value ?? ''))
}

function onFieldUpdate(value: SearchField | { value?: SearchField } | undefined) {
  if (!value) {
    return
  }

  const nextValue = typeof value === 'object' ? value.value : value
  if (nextValue === 'title' || nextValue === 'content') {
    emit('update:field', nextValue)
  }
}

function emitSearch() {
  emit('search')
}
</script>

<style scoped>
.search-toolbar {
  display: grid;
  gap: 0.7rem;
  grid-template-columns: minmax(0, 1fr) 180px auto;
  align-items: center;
}

.query-input,
.field-select {
  width: 100%;
}

@media (max-width: 860px) {
  .search-toolbar {
    grid-template-columns: 1fr;
  }
}
</style>
