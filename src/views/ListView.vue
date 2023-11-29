<script setup>
import TheSearch from '../components/TheSearch.vue'
</script>

<template>
  <main>
    <TheSearch class="search" update-route new-item routing />

    <div class="link-to-player">
      <RouterLink :to="{ name: 'play' }">→ Player</RouterLink>
    </div>
  </main>
</template>

<style lang="scss" scoped>
main {
  align-self: center;
  margin-top: var(--spacing-xl);
  // margin-left: 56px;
  width: 790px;
  max-width: 100%;
  padding: var(--spacing);
  // display: flex;
  // flex-direction: column;
  // gap: var(--spacing-s);

  .link-to-player {
    margin-top: var(--spacing-xl);
    font-size: var(--font-size-s);
  }
}
</style>
