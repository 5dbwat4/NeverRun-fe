<template>
  <div class="pagination-wrap">
    <UPagination
      :page="page"
      :total="total"
      :items-per-page="pageSize"
      show-controls
      show-edges
      active-variant="soft"
      variant="outline"
      @update:page="onChange"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  page: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{
  (event: 'update:page', value: number): void
}>()

function onChange(nextPage: number) {
  if (nextPage !== props.page) {
    emit('update:page', nextPage)
  }
}
</script>

<style scoped>
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}
</style>
