<script setup lang="ts">
import { computed } from "vue"
import { useColorMode } from "@vueuse/core"

const colorMode = useColorMode()

const isDark = computed({
  get: () => colorMode.value === "dark",
  set: (v: boolean) => {
    colorMode.value = v ? "dark" : "light"
  },
})
</script>

<template>
  <USwitch
    v-model="isDark"
    checked-icon="i-lucide-moon"
    unchecked-icon="i-lucide-sun"
    color="neutral"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  />
</template>
