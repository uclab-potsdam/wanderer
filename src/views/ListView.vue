<script setup>
import TheList from '@/components/TheList.vue'
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'
import TheControls from '@/components/TheControls.vue'
</script>

<template>
  <div class="list-view">
    <TheHeader />
    <TheList />
    <TheFooter />
    <TheControls />
  </div>
</template>

<style scoped>
.list-view {
  display: grid;
  grid-template-columns:
    [header-start] 1fr
    [main-start] min(100vw - var(--spacing) * 2, 800px)
    [main-end] 1fr
    [header-end];

  grid-template-rows:
    [header-start] 45px
    [header-end main-start]
    1fr
    [main-end];
}
</style>
