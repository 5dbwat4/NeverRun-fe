<template>
  <div class="loader"></div>
  <p class="loading-tips">It's always that...</p>
</template>
<script setup></script>
<style scoped>

.loader {
  width: 48px;
  height: 48px;
  border: 3px solid #2818d5;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  -webkit-animation: rotation 1s linear infinite;
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
  border-color: #0c0542 transparent;
}
@-webkit-keyframes rotation {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
@keyframes rotation {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
#app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding-top: 2rem;
  padding-bottom: 2rem;
  box-sizing: border-box;
}
</style>
