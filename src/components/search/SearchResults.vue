<template>
  <section class="results-grid">
    <SearchResultCard v-for="item in items" :key="item.url" :item="item" />
  </section>
</template>

<script setup lang="ts">
import type { SearchItem } from '@/utils/search'
import SearchResultCard from './SearchResultCard.vue'

defineProps<{
  items: SearchItem[]
}>()
</script>

<style scoped>
.results-grid {
  display: grid;
  gap: 0.9rem;
}
</style>
