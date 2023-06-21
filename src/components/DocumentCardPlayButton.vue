<script setup>
defineProps({ countdown: Boolean })
</script>

<template>
  <div class="play">
    <svg width="100" height="100">
      <circle cx="50" cy="50" r="48"></circle>
      <circle v-if="countdown" cx="50" cy="50" r="48" :class="{ countdown }"></circle>
      <polygon id="Path" points="36 28 36 72 70 50"></polygon>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.play {
  // background-color: var(--secondary);
  height: 100px;
  width: 100px;
  border-radius: 50%;
  box-sizing: content-box;

  svg {
    display: block;
    polygon {
      fill: currentColor;
    }

    circle {
      stroke: currentColor;
      stroke-width: 4;
      fill: none;
      opacity: 0.2;
    }
    .countdown {
      opacity: 1;
      // stroke-dasharray: 10 400;
      stroke-linecap: round;
      animation: countdown 10s linear;
      transform: rotate(-90deg);
      transform-origin: center;
    }
  }
}

@keyframes countdown {
  0% {
    stroke-dasharray: 0 300;
  }

  100% {
    stroke-dasharray: 300 300;
  }
}
</style>
