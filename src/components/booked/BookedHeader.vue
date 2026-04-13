<script setup lang="ts">
/**
 * BookedHeader.vue
 * Dedicated top bar for the confirmation page.
 */
import brandLogo from '@/assets/logos/logo.png';
</script>

<template>
  <header class="booked-header">
    <img :src="brandLogo" alt="Hellen Bermeo" class="booked-header__logo" />
  </header>
</template>

<style lang="scss" scoped>
@use '@/styles/colorVariables.module.scss' as colors;

.booked-header {
  width: 100%;
  padding: 1.25rem 1rem;
  display: flex;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;

  &__logo {
    height: 26px;
    width: auto;
    filter: drop-shadow(0 0 12px rgba(colors.$BRAND-PRIMARY, 0.2));
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.05);
    }

    @media (min-width: 768px) {
      height: 32px;
    }
  }
}
</style>
