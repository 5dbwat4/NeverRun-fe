<template>
  <div class="loader"></div>
  <p class="text-ns-muted text-sm font-dm-sans mt-2">It's always that...</p>
</template>
<script setup></script>
<style scoped>
.loader {
  width: 48px;
  height: 48px;
  border: 3px solid var(--ns-link);
  border-radius: 50%;
  display: inline-block;
  position: relative;
  animation: rotation 1s linear infinite;
}
.loader:after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid;
  border-color: var(--ns-text-strong) transparent;
}
@keyframes rotation {
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
}
</style>
