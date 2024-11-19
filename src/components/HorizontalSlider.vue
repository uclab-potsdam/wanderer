<script setup>
import { onMounted, ref, onBeforeUnmount, computed, nextTick, watch } from 'vue'

const props = defineProps({
  itemWidth: {
    type: Number,
    default: 250
  },
  gap: {
    type: Number,
    default: 10
  },
  position: {
    type: Number,
    default: null
  },
  noArrows: Boolean
})

const emit = defineEmits(['select-item', 'update:modelValue'])

const offset = 30
const wrapper = ref(null)

const wrapperScrollWidth = ref(0)
const wrapperVisibleWidth = ref(0)

const scrollLeft = ref(0)
const bufferWidth = ref(null)
const scrollPaddingInlineStart = ref(null)

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    if (entry.contentRect) {
      bufferWidth.value = `${(window.innerWidth - 800) / 2 - 30}px`
      scrollPaddingInlineStart.value = `${Math.max((window.innerWidth - 800) / 2 - 10, 30)}px`
      nextTick(() => {
        wrapperScrollWidth.value = wrapper.value.scrollWidth
        wrapperVisibleWidth.value = wrapper.value.offsetWidth
      })
    }
  }
})

const enableArrowLeft = computed(() => scrollLeft.value > 35 && !props.noArrows)
const enableArrowRight = computed(
  () =>
    scrollLeft.value < wrapperScrollWidth.value - wrapperVisibleWidth.value - 35 && !props.noArrows
)

function onScroll() {
  scrollLeft.value = wrapper.value?.scrollLeft ?? 0
  emit('select-item', Math.round((scrollLeft.value - offset) / (props.itemWidth + props.gap)))
}

const slide = (dir) => {
  wrapper.value.scrollBy({ left: (props.itemWidth + props.gap) * dir, behavior: 'smooth' })
}

watch(
  () => props.position,
  (pos) => {
    if (pos == null) return
    wrapper.value.scrollTo({
      left: (props.itemWidth + props.gap) * pos,
      behavior: 'smooth'
    })
  }
)

onMounted(() => {
  if (props.position) {
    wrapper.value.scrollTo({
      left: (props.itemWidth + props.gap) * props.position,
      behavior: 'instant'
    })
  }

  resizeObserver.observe(wrapper.value)
})
onBeforeUnmount(() => {
  resizeObserver.unobserve(wrapper.value)
})
</script>

<template>
  <div class="horizontal-slider">
    <button :disabled="!enableArrowLeft" tabindex="-1" class="arrow left" @click="slide(-1)">
      ←
    </button>
    <button :disabled="!enableArrowRight" tabindex="-1" class="arrow right" @click="slide(1)">
      →
    </button>
    <div
      ref="wrapper"
      class="wrapper"
      @scroll="onScroll"
      :style="{ scrollPaddingInlineStart: '0px' }"
    >
      <slot />
    </div>
  </div>
</template>
<style scoped>
.horizontal-slider {
  position: relative;
  margin-left: -var(--spacing-half);

  .wrapper {
    display: grid;
    overflow-x: scroll;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    -ms-overflow-style: none;

    gap: var(--spacing-half);
    /* margin: 0 0 var(--spacing); */
    padding: 0 calc(var(--spacing) * 1.5);

    &::-webkit-scrollbar {
      display: none;
    }

    &:deep(> *) {
      grid-row: 1;
      scroll-snap-align: start;
    }
  }

  .arrow {
    position: absolute;
    z-index: 1;
    height: 100%;
    width: 30px;
    padding: 0;
    cursor: pointer;
    font: var(--font-ui);
    font-size: 0.8em;
    border: none;
    /* background: none; */
    color: var(--color-user);
    transition:
      color 0.2s,
      font-size 0.2s,
      font-weight 0.2s,
      transform 0.2s;
    /* transform-origin: center; */

    &:not(:disabled) {
      &:hover {
        font-size: 1em;
        font-weight: 310;
        transform: translateY(-50%) scale(1.2);
      }
    }

    &:disabled {
      /* color: color-mix(in lab, var(--color-user), transparent 70%); */
      transform: translateY(-50%) scale(0.1);
      color: var(--color-background);
      cursor: default;
    }

    --button-size: 30px;

    background: var(--color-detail-background);
    height: var(--button-size);
    width: var(--button-size);
    top: 50%;
    transform: translateY(-50%);
    transition: all var(--ui-transition);
    border-radius: 50%;
    &.left {
      left: calc(var(--button-size) * -0.5 - var(--spacing-quart));
      /* background: linear-gradient(to right, var(--color-background), transparent); */
    }

    &.right {
      right: calc(var(--button-size) * -0.5 - var(--spacing-quart));
      /* background: linear-gradient(to left, var(--color-background), transparent); */
    }
  }
}
</style>
