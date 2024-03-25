<script setup>
defineEmits(['zoom-in', 'zoom-out'])
</script>
<template>
  <div class="input-segment">
    <div role="button" @click="$emit('zoom-in')" class="zoom-in">+</div>
    <div role="button" @click="$emit('zoom-out')" class="zoom-out">–</div>
  </div>
</template>

<style scoped>
.input-segment {
  z-index: 100;
  position: absolute;
  top: 0px;
  right: 0px;
  --accent: color-mix(in lab, var(--graph-accent), var(--color-text) 30%);
  display: grid;
  grid-auto-rows: 1fr;
  grid-auto-flow: row;
  text-align: center;
  align-self: center;

  background: color-mix(in lab, var(--accent), transparent 90%);
  backdrop-filter: blur(7px);
  border-radius: 5px;
  margin: calc(var(--spacing) / 4);
  /* height: var(--spacing); */
  /* font-size: 14px; */
  text-transform: uppercase;
  padding: calc(var(--spacing) / 8);
  gap: calc(var(--spacing) / 8);
  color: color-mix(in lab, var(--accent), var(--color-text) 30%);
  font-weight: bold;

  > div {
    transition: all var(--ui-transition);
    padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
    border-radius: 3px;
    outline: 1px solid transparent;
    outline-offset: -1px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    /* height: var(--spacing * 2); */

    &:hover {
      outline: 1px solid var(--accent);
      color: var(--accent);
    }
    &:has(input:checked) {
      background: color-mix(in lab, var(--accent), transparent 70%);
      color: var(--ui-accent-deep);
      font-weight: var(--bold);
    }
    &:has(input:focus-visible) {
      outline: 1px solid var(--ui-accent-dark);
    }

    input {
      appearance: none;
    }
  }
}
</style>
