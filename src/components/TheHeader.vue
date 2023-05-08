<script setup>
import IconV3 from "~icons/default/V3";
import IconCog from "~icons/default/Cog";
import InputButton from "@/components/InputButton.vue";

import { useAuthStore } from "@/stores/auth";
import { useRouter, RouterLink } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

function signout() {
  authStore.clearCredentials();
  router.push({ name: "signin" });
}
</script>

<template>
  <header>
    <RouterLink :to="{ name: 'canvases' }">
      <InputButton>
        <IconV3 />
      </InputButton>
    </RouterLink>
    <span />
    <slot name="left">
      <h1>Workbench</h1>
    </slot>
    <span />
    <slot name="right">
      <span />
    </slot>
    <InputButton>
      <IconCog @click="signout" />
    </InputButton>
  </header>
</template>

<style lang="scss" scoped>
header {
  display: grid;
  align-items: center;
  // gap: var(--spacing);
  grid-template-columns: auto var(--spacing) auto 1fr auto auto;
  position: relative;
  z-index: 2;

  h1 {
    // margin-left: var(--spacing);
  }
}
</style>
