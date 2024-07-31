<script setup>
import LocalizeText from '@/components/LocalizeText.vue'
defineProps({
  tag: {
    type: String,
    default: 'li'
  },
  label: {
    type: [String, Object],
    default: 'Untitled'
  },
  meta: {
    type: [String, Object, Array],
    default: null
  }
})
</script>

<template>
  <component :is="tag" class="list-item">
    <div class="left">
      <h3 class="label"><LocalizeText :text="label" /></h3>
      <span class="meta"><LocalizeText :text="meta" /></span>
    </div>
    <div class="right">
      <slot />
    </div>
  </component>
</template>

<style scoped>
.list-item {
  display: flex;
  justify-content: space-between;

  text-decoration: none;
  color: inherit;

  padding: var(--spacing-half);
  border-radius: var(--border-radius);

  .left {
    .label {
      font: var(--serif);
      font-weight: 600;
    }
    .meta {
      font-size: var(--font-size-small);
      font-weight: 350;
      /* color: color-mix(in lab, currentColor, transparent 20%); */
    }
  }

  .right {
    display: flex;
  }

  &:hover {
    background: color-mix(in lab, var(--ui-accent), transparent 90%);
    color: color-mix(in lab, var(--ui-accent), var(--color-text) 50%);
  }
}
</style>
