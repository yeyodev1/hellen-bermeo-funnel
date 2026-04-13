<script setup lang="ts">
/**
 * BookedHeader.vue
 * Dedicated top bar for the confirmation page.
 */
const LOGO = 'https://assets.cdn.filesafe.space/fy1F7zMSleMO2xTmoE30/media/69b57a89cab7f76d86d38f87.png';
</script>

<template>
  <header class="booked-header">
    <img :src="LOGO" alt="Hellen Bermeo" class="booked-header__logo" />
  </header>
</template>

<style lang="scss" scoped>
@use '@/styles/colorVariables.module.scss' as colors;

.booked-header {
  width: 100%;
  padding: 1.25rem 1rem;
  display: flex;
  justify-content: center;
  background: rgba(#0a0712, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(colors.$BRAND-SECONDARY, 0.15);
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
