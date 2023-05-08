<script setup>
import { zoom, zoomIdentity } from "d3-zoom";
import { select } from "d3-selection";
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useTerminusStore } from "@/stores/terminus";
import CanvasDocumentCard from "./CanvasDocumentCard.vue";
import CanvasEdge from "./CanvasEdge.vue";

const containerRef = ref(null);
const container = ref(null);

const route = useRoute();
const terminusStore = useTerminusStore();

const transform = ref(zoomIdentity);
const zoomBehaviour = ref(null);

const connecting = ref(false);
const connectingLine = ref(null);
const connectable = ref(null);

const pattern = computed(() => {
  const scale = transform.value.k;
  return {
    width: 125 * scale,
    height: 125 * scale,
    x: transform.value.x,
    y: transform.value.y,
  };
});

const scaleExtent = ref([0.1, 2]);

const context = computed(() => route.path.replace(/^\//, ""));

onMounted(() => {
  container.value = select(containerRef.value);
  zoomBehaviour.value = zoom()
    .scaleExtent(scaleExtent.value)
    .on("zoom", (e) => {
      transform.value = e.transform;
    });
  // .filter((e) => {
  //   if (e.type === "touchstart" && e.touches?.length === 1) return false;
  //   if (e.type === "mousedown" && e.target.getAttribute("draggable"))
  //     return false;
  //   return !e.button && !(e.type === "wheel" && !e.ctrlKey && !e.shiftKey);
  // });
  container.value.call(zoomBehaviour.value); //.on("dblclick.zoom", null);
});

function onDrop(e) {
  e.preventDefault();
  // console.log(e.dataTransfer.getData("text/uri-list"));
  const uri = e.dataTransfer
    .getData("text/uri-list")
    .replace(location.origin, "workbench:/");
  const isWorkbenchItem = /workbench:\/\//.test(uri);
  if (!isWorkbenchItem) return; // todo: import and allocate external ressources
  const item = uri
    // .replace(new RegExp(`^${location.origin}/?`), "");
    .replace(new RegExp(`^workbench://`), "");

  terminusStore.addAllocation(item, context.value, {
    x: (e.x - transform.value.x) / transform.value.k,
    y: (e.y - transform.value.y) / transform.value.k,
  });
}

function onUpdatePosition(item, position) {
  terminusStore.addAllocation(item, context.value, position);
}

function onConnectStart(node) {
  connecting.value = true;
  terminusStore.pushBackNode(node);
}

function onConnect(node, position) {
  connectingLine.value = {
    active: true,
    source: { x: node.x, y: node.y },
    target: { x: node.x + position.x, y: node.y + position.y },
  };
}

function onConnectEnd(node) {
  connecting.value = false;
  connectingLine.value = null;
  if (connectable.value == null) return;
  terminusStore.addProperty(node.item["@id"], connectable.value.item["@id"]);
  // terminusStore.pushBackNode(node);
}

function onDragOver(e) {
  e.preventDefault();
}
</script>

<template>
  <div
    class="container"
    v-resize="(s) => (size = s)"
    ref="containerRef"
    @drop="onDrop"
    @dragover="onDragOver"
  >
    <svg width="100%" height="100%">
      <defs>
        <pattern id="bg" v-bind="pattern" patternUnits="userSpaceOnUse">
          <circle
            class="point"
            r="0.75"
            :transform="`translate(1 ${pattern.height / 2 + 1})`"
          />
          <circle
            class="point"
            r="0.75"
            :transform="`translate(${pattern.width / 2 + 1} 1)`"
          />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#bg)" />
      <g :transform="transform">
        <g class="edges">
          <CanvasEdge
            v-for="(edge, i) in terminusStore.edges"
            :key="edge.property?.['@id'] || i"
            :edge="edge"
          />
          <CanvasEdge v-if="connectingLine" :edge="connectingLine" />
        </g>
        <g class="nodes">
          <CanvasDocumentCard
            v-for="node in terminusStore.nodes"
            :key="node.item['@id']"
            :node="node"
            :transform="transform"
            @update-position="
              ($event) => onUpdatePosition(node.item['@id'], $event)
            "
            :connecting-to="connecting"
            @connect-start="onConnectStart(node)"
            @connect="onConnect(node, $event)"
            @connect-end="onConnectEnd(node)"
            @mouse-enter="connectable = node"
            @mouse-out="connectable = null"
          />
        </g>
      </g>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
.container {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;

  svg {
    display: block;

    foreignObject {
      overflow: visible;
    }
  }
}
</style>
