<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isLoaded = ref(true)

// ── Toast (Social Proof) Global ───────────────────────────────────────────────────────
const toastNames = ['Juan P.', 'María G.', 'Carlos R.', 'Ana B.', 'Luis F.', 'Sofía T.', 'Pedro M.', 'Elena C.', 'Diego V.', 'Valentina M.', 'Andrés L.', 'Camila R.', 'Mateo S.', 'Laura V.']
const currentToast = ref('')
const showToast = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

const triggerRandomToast = () => {
  currentToast.value = `${toastNames[Math.floor(Math.random() * toastNames.length)]} acaba de reservar su asesoría.`
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
    toastTimer = setTimeout(triggerRandomToast, 15000) // exactamente cada 15 segundos como pidió
  }, 4500)
}

onMounted(() => {
  toastTimer = setTimeout(triggerRandomToast, 5000)
})

onUnmounted(() => {
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<template>
  <!-- Toast Notification Global (Social Proof) -->
  <Transition name="toast-slide">
    <div v-if="showToast" class="vv-toast">
      <div class="vv-toast__icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <p class="vv-toast__text">{{ currentToast }}</p>
    </div>
  </Transition>

  <div class="app-wrapper" :class="{ 'app-wrapper--loaded': isLoaded }">
    <RouterView />
  </div>
</template>

<style lang="scss">
@use '@/styles/colorVariables.module.scss' as colors;

body {
  margin: 0;
  padding: 0;
  background-color: #0a0712;
}

.app-wrapper {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s ease;

  &--loaded {
    opacity: 1;
    pointer-events: auto;
  }
}

// ── Transición de página ──────────────────────────────────────────────────────
.page-enter-active {
  transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.55, 0, 1, 0.45);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.99);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(1.01);
}

@media (prefers-reduced-motion: reduce) {
  .page-enter-active,
  .page-leave-active {
    transition: opacity 0.2s ease;
  }
  .page-enter-from,
  .page-leave-to {
    transform: none;
  }
}

// ── TOAST NOTIFICATIONS GLOBAL ───────────────────────────────────────────────────
.vv-toast {
  position: fixed;
  bottom: 24px;
  left: 24px;
  background: white;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 10px 40px rgba(0,0,0,0.18);
  border-radius: 10px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 999999; /* Sobre todo el sitio */
  max-width: 320px;

  @media (max-width: 600px) {
    bottom: auto;
    top: 24px;
    left: 16px;
    right: 16px;
    max-width: none;
  }
}

.vv-toast__icon {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.vv-toast__text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  color: #212529;
  font-weight: 500;
  line-height: 1.3;
  margin: 0;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
