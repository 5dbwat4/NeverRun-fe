<template>
  <UCard class="hover-motion" @click="open(item.url, '_blank')">
    <template #header>
      <div class="result-head">
        <UBadge color="neutral" variant="soft">{{ item.siteName }}</UBadge>
      </div>
    </template>

    <h3 class="result-title">
      <a :href="item.url" target="_blank" rel="noopener noreferrer" v-html="sanitizeHtml(item.titleHighlighted || item.title)" />
    </h3>

    <p class="snippet" v-html="sanitizeHtml(item.snippetHighlighted || item.snippet)" />
    <!-- <p class="snippet" v-html="item.snippetHighlighted || item.snippet" /> -->

    <p class="url">{{ prettyUrl }}</p>
  </UCard>
</template>

<script setup lang="ts">
import type { SearchItem } from '@/utils/search'
import { computed } from 'vue'
import sanitizeHtml from 'sanitize-html';

const props = defineProps<{
  item: SearchItem
}>()
const prettyUrl = computed(() => {
  return decodeURIComponent(props.item.url)
})
const open = (url: string, target: string) => {
  window.open(url, target)
}
</script>

<style scoped>
.result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.open-link {
  font-size: 0.85rem;
  color: var(--ns-link);
}

.result-title {
  margin: 0 0 0.4rem 0;
  font-size: 1.15rem;
  line-height: 1.4;
  font-family: "LXGW WenKai Mono", system-ui;
}

.result-title a {
  color: var(--ns-text-strong);
  text-decoration: none;
}

.result-title a:hover,
.open-link:hover {
  text-decoration: underline;
}

.snippet {
  margin: 0;
  line-height: 1.65;
  font-size: 0.9rem;
  color: var(--ns-text);
  font-family: "LXGW WenKai Mono", system-ui;
}

.url {
  margin: 0;
  font-size: 0.83rem;
  color: var(--ns-muted);
  word-break: break-all;
}



.hover-motion{
  background-color: var(--ns-surface);
    cursor: pointer;
  transition: background-color 0.2s ease, transform 0.2s ease;
}
.hover-motion:hover {
  background-color: var(--ns-surface-hover);
  transform: translateY(-1px);
}
</style>
