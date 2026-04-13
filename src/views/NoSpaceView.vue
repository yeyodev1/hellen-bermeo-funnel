<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import brandLogo from '@/assets/logos/logo.png'

const timeLeft = ref('')
let timerId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  const bkDisqAt = localStorage.getItem('bk_disq_at')
  if (bkDisqAt) {
    const updateCountdown = () => {
      const elapsed = Date.now() - Number(bkDisqAt)
      const remaining = 24 * 60 * 60 * 1000 - elapsed
      
      if (remaining > 0) {
        const h = Math.floor(remaining / 3600000)
        const m = Math.floor((remaining % 3600000) / 60000)
        const s = Math.floor((remaining % 60000) / 1000)
        timeLeft.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      } else {
        timeLeft.value = ''
        if (timerId) clearInterval(timerId)
      }
    }
    
    updateCountdown()
    timerId = setInterval(updateCountdown, 1000)
  }
})

onUnmounted(() => {
  if (timerId) clearInterval(timerId)
})
</script>

<template>
  <div class="nospace">

    <!-- TOP BAR -->
    <header class="nospace__topbar">
      <img :src="brandLogo" alt="Hellen Bermeo" class="nospace__logo" />
    </header>

    <!-- MAIN CONTENT -->
    <main class="nospace__main">

      <!-- COOLDOWN BANNER -->
      <div v-if="timeLeft !== ''" class="nospace__cooldown-banner">
        <i class="fa-solid fa-clock"></i>
        Solo puedes enviar una solicitud por día. Intenta de nuevo en <span class="timer-monospaced">{{ timeLeft }}</span>
      </div>

      <!-- ICON -->
      <div class="nospace__icon-wrap">
        <i class="fa-solid fa-circle-xmark nospace__x-icon"></i>
      </div>

      <!-- HEADING -->
      <h1 class="nospace__title">En este momento no tenemos espacio disponible</h1>

      <p class="nospace__subtitle">
        Pronto lo sabrás. Trabajamos con un número limitado de negocios para garantizar resultados reales.
      </p>

      <!-- BACK LINK -->
      <RouterLink to="/" class="btn btn--ghost">
        <i class="fa-solid fa-arrow-left"></i>
        Volver al inicio
      </RouterLink>

    </main>

    <!-- FOOTER -->
    <footer class="nospace__footer">
      <div class="footer__links">
        <RouterLink to="/politicas-privacidad">Política de Privacidad</RouterLink>
        <span class="footer__sep">·</span>
        <RouterLink to="/aviso-legal">Aviso Legal</RouterLink>
      </div>
      <p class="footer__copy">© {{ new Date().getFullYear() }} Hellen Bermeo. Todos los derechos reservados.</p>
      <div class="footer__disclaimer">
        Esta página web es operada y mantenida por Hellen Bermeo. El uso del sitio web se rige por nuestros Términos de Servicio y Política de Privacidad. Hellen Bermeo es una firma dedicada a la asesoría contable, tributaria y financiera para emprendedores y empresas. No somos una entidad bancaria ni ofrecemos préstamos, inversiones financieras o sistemas de "enriquecimiento rápido". Nuestro objetivo es proporcionar herramientas y estrategias para el cumplimiento legal y la optimización de recursos; sin embargo, no garantizamos resultados económicos específicos, ya que estos dependen de la gestión administrativa, el mercado y las decisiones de cada cliente.
      </div>
    </footer>

  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/colorVariables.module.scss' as colors;
@use '@/styles/fonts.modules.scss' as fonts;

.nospace {
  min-height: 100vh;
  background-color: #f8fafc;
  color: #1e293b;
  display: flex;
  flex-direction: column;
  align-items: center;

  // ── TOP BAR ──────────────────────────────────────────
  &__topbar {
    width: 100%;
    padding: 1.25rem 2rem;
    display: flex;
    justify-content: center;
    background: rgba(255, 255, 255, 0.95);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  &__logo {
    height: 36px;
    width: auto;
  }

  // ── MAIN ─────────────────────────────────────────────
  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 4rem 1.5rem 3rem;
    max-width: 600px;
    width: 100%;
    gap: 1.25rem;
  }

  // ── COOLDOWN BANNER ───────────────────────────────────
  &__cooldown-banner {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    background: #ffffff;
    border: 1px solid rgba(239, 68, 68, 0.4);
    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.05);
    font-family: fonts.$font-interface;
    font-size: 0.9rem;
    font-weight: 600;
    color: #ef4444; // Red color for cooldown/rejection
    letter-spacing: 0.01em;

    i {
      font-size: 1rem;
    }

    .timer-monospaced {
      font-family: monospace;
      font-weight: 800;
      font-size: 1.05rem;
      background: rgba(239, 68, 68, 0.1);
      padding: 0.15rem 0.4rem;
      border-radius: 6px;
      margin-left: 0.25rem;
    }
  }

  // ── ICON ─────────────────────────────────────────────
  &__icon-wrap {
    width: 88px;
    height: 88px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid rgba(239, 68, 68, 0.25);
    margin-bottom: 0.5rem;
  }

  &__x-icon {
    font-size: 3rem;
    color: #ef4444;
    line-height: 1;
  }

  // ── HEADING ──────────────────────────────────────────
  &__title {
    font-family: fonts.$font-principal;
    font-weight: 800;
    font-size: clamp(1.6rem, 4vw, 2.25rem);
    line-height: 1.2;
    margin: 0;
    color: #0f172a;
  }

  &__subtitle {
    font-family: fonts.$font-secondary;
    font-size: 1.05rem;
    color: #475569;
    margin: 0;
    line-height: 1.7;
  }

  // ── COURSE CARD ──────────────────────────────────────
  &__course-card {
    width: 100%;
    background: #ffffff;
    border: 1px solid rgba(0,0,0, 0.08);
    border-radius: 16px;
    padding: 1.75rem 1.75rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.03);
    text-align: center;
  }

  &__course-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.35rem 0.9rem;
    border-radius: 999px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    font-family: fonts.$font-interface;
    font-size: 0.75rem;
    font-weight: 700;
    color: #16a34a;
    letter-spacing: 0.04em;
    text-transform: uppercase;

    i {
      font-size: 0.75rem;
    }
  }

  &__course-title {
    font-family: fonts.$font-principal;
    font-weight: 800;
    font-size: clamp(1.2rem, 3vw, 1.5rem);
    color: #1e293b;
    margin: 0;
    line-height: 1.25;
  }

  &__course-body {
    font-family: fonts.$font-secondary;
    font-size: 0.95rem;
    color: #475569;
    margin: 0;
    line-height: 1.75;
  }

  &__course-checks {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    text-align: left;
    width: 100%;

      li {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      font-family: fonts.$font-secondary;
      font-size: 0.9rem;
      color: #334155;
      line-height: 1.5;

      i {
        margin-top: 0.2rem;
        font-size: 0.8rem;
        color: #10b981;
        flex-shrink: 0;
      }
    }
  }

  // ── FOOTER ───────────────────────────────────────────
  &__footer {
    width: 100%;
    padding: 2rem 1.5rem;
    text-align: center;
    border-top: 1px solid rgba(0, 0, 0, 0.08);
  }
}

// ── BUTTONS ──────────────────────────────────────────
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  font-family: fonts.$font-accent;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.25s ease;
  text-decoration: none;

  &--ghost {
    background: transparent;
    border: 1.5px solid rgba(0,0,0, 0.15);
    color: #64748b;
    margin-top: 0.25rem;

    &:hover {
      border-color: colors.$BRAND-PRIMARY;
      color: colors.$BRAND-PRIMARY;
      background: rgba(colors.$BRAND-PRIMARY, 0.05);
    }
  }

  &--ghost-purple {
    background: transparent;
    border: 1.5px solid rgba(colors.$BRAND-PRIMARY, 0.5);
    color: colors.$BRAND-PRIMARY;

    &:hover {
      border-color: colors.$BRAND-PRIMARY;
      color: #ffffff;
      background: colors.$BRAND-PRIMARY;
    }
  }
}

// ── FOOTER INTERNALS ──────────────────────────────────
.footer {
  &__links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;

    a {
      font-family: fonts.$font-interface;
      font-size: 0.8rem;
      color: #64748b;
      text-decoration: none;
      transition: color 0.2s;

      &:hover { color: colors.$BRAND-PRIMARY; }
    }
  }

  &__sep {
    color: rgba(0,0,0, 0.15);
  }

  &__copy {
    font-family: fonts.$font-interface;
    font-size: 0.75rem;
    color: #94a3b8;
    margin: 0;
    margin-bottom: 1rem;
  }

  &__disclaimer {
    font-family: fonts.$font-interface;
    font-size: 0.65rem;
    color: #94a3b8;
    line-height: 1.5;
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>
