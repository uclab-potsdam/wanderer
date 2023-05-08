<script setup>
import { ref, watch } from "vue";
import { useTerminusStore } from "@/stores/terminus";
import debounce from "lodash.debounce";

const terminusStore = useTerminusStore();

const props = defineProps({
  placeholder: {
    type: String,
    default: "Search",
  },
  type: {
    type: String,
    default: "Entity",
  },
});

const emit = defineEmits(["updateResults"]);

const searchTerm = ref("");

watch(() => props.type, search);
watch(searchTerm, debounce(search, 300));

async function search() {
  if (searchTerm.value === "") {
    emit("updateResults", null);
    return;
  }
  const results = await terminusStore.search(searchTerm.value, props.type);
  emit("updateResults", results);
}

// const authStore = useAuthStore();
// const router = useRouter();
</script>

<template>
  <div class="the-search">
    <input :placeholder="placeholder" v-model="searchTerm" />
  </div>
</template>

<style lang="scss" scoped>
.the-search {
  input {
    all: unset;
    // border-bottom: 1px solid currentColor;
    padding: var(--spacing-s) 0;

    &::placeholder {
      color: inherit;
    }

    &:focus {
      color: var(--accent);

      &::placeholder {
        color: var(--muted);
      }
    }
  }
}
</style>
