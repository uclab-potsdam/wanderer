<script setup>
import { useViewStore } from "@/stores/view";
import { computed } from "vue";

const viewStore = useViewStore();

const props = defineProps({ document: Object, draggable: String });

const label = computed(() => {
  return viewStore.localize(props.document.label);
});

const description = computed(() => {
  return viewStore.localize(props.document.description);
});

function onDragStart(e) {
  // console.log("ds");
  e.dataTransfer.setData(
    "text/uri-list",
    `workbench://${props.document["@id"]}`
  );
}

// let dragStartX = null;
// let dragStartY = null;

// const dragX = ref(0);
// const dragY = ref(0);

// function onMouseDown(e) {
//   if (props.draggable !== "custom") return;
//   e.stopPropagation();
//   // e.preventDefault();
//   dragStartX = e.x;
//   dragStartY = e.y;

//   console.log("mousedown", e.x, e.y);

//   const controller = new AbortController();

//   window.addEventListener(
//     "mouseup",
//     (e) => {
//       console.log("mouse up", e.x - dragStartX, e.y - dragStartY);
//       controller.abort();
//     },
//     { once: true }
//   );

//   window.addEventListener(
//     "mousemove",
//     (e) => {
//       dragX.value = e.x - dragStartX;
//       dragY.value = e.y - dragStartY;
//     },
//     { signal: controller.signal }
//   );
// }
</script>

<template>
  <section
    class="document"
    :draggable="draggable === 'native'"
    @dragstart="onDragStart"
    :class="[document['@type']?.toLowerCase()]"
  >
    <span class="label" :lang="label?.lang"> {{ label?.text }} </span>
    <br />
    <span class="description" :lang="description?.lang">
      {{ description?.text }}
    </span>
    <div class="buttons">
      <div class="center"><slot name="center" /></div>
      <div class="right"><slot name="right" /></div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
section.document {
  padding: var(--spacing);
  position: relative;
  background: var(--secondary);

  border: 1px solid currentColor;
  width: 250px;
  min-height: 75px;

  .label {
    font-weight: var(--bold);
  }

  span {
    hyphens: auto;
  }

  &.canvas,
  &.dictionary {
    border: none;
    background-color: currentColor;
    span,
    .buttons {
      color: var(--secondary);
    }
  }

  &.entityclass,
  &.propertyclass {
    border-image: url("@/assets/img/border.svg") 1 round;
  }

  .buttons {
    display: none;
    .center {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);

      display: flex;
      flex-direction: column;
      gap: var(--spacing-s);
    }

    .right {
      position: absolute;
      right: var(--spacing);
      top: 50%;
      transform: translate(0, -50%);

      display: flex;
      flex-direction: column;
      gap: var(--spacing-s);
    }
    :deep(svg.icon) {
      border: 1px solid;
      border-radius: 50%;
      background-color: var(--secondary);

      &:hover {
        color: var(--secondary);
        background-color: var(--accent);
      }
    }
  }

  &.canvas,
  &.dictionary {
    .buttons {
      :deep(svg.icon) {
        background-color: var(--accent);
        &:hover {
          color: var(--accent);
          background-color: var(--secondary);
        }
      }
    }
  }

  &:hover {
    color: var(--accent);

    &.entityclass,
    &.propertyclass {
      border-image: url("@/assets/img/border-accent.svg") 1 round;
    }
    .buttons {
      display: block;
    }
  }
}
</style>
