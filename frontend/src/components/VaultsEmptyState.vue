<template>
  <div
    class="active-vaults-empty-state"
    role="status"
    aria-label="No vaults found"
  >
    <div class="tech-cube-container">
      <div class="glow-line" style="left: 20%; animation-delay: 0s;" aria-hidden="true" />
      <div class="glow-line" style="left: 80%; animation-delay: 1.5s;" aria-hidden="true" />
      <div class="tech-cube" aria-hidden="true">
        <div class="cube-face face-front" />
        <div class="cube-face face-back" />
        <div class="cube-face face-right" />
        <div class="cube-face face-left" />
        <div class="cube-face face-top" />
        <div class="cube-face face-bottom" />
      </div>
    </div>
    <h2 class="active-vaults-empty-state__title">No Vaults Found</h2>
    <p class="active-vaults-empty-state__text">
      You haven't created any vaults yet. Start by creating your first HODL vault.
    </p>
    <button
      type="button"
      class="btn btn--primary active-vaults-empty-state__cta"
      @click="$emit('action')"
    >
      Create your first vault
    </button>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'VaultsEmptyState',
  emits: ['action'],
})
</script>
