<script setup lang="ts">
import { ref } from 'vue'
import CalendarModal from '@/components/CalendarModal.vue'

import brandLogo from '@/assets/logos/logo.png'

const calendarOpen = ref(false)
</script>

<template>
  <div class="ty">

    <!-- Top bar -->
    <header class="ty__topbar">
      <img :src="brandLogo" alt="Hellen Bermeo" class="ty__logo" />
    </header>

    <!-- Confirmation badge -->
    <section class="ty__hero" aria-labelledby="ty-heading">
      <div class="ty__container">

        <div class="ty__badge">
          <i class="fa-solid fa-circle-check" aria-hidden="true"></i>
          Registro confirmado
        </div>

        <h1 id="ty-heading" class="ty__title">
          ¡Un paso más hacia<br>
          <span class="ty__accent">tu crecimiento!</span>
        </h1>

        <p class="ty__subtitle">
          Antes de agendar, mira el video y descubre cómo el servicio de
          <strong>Hellen Bermeo</strong> ha transformado y protegido negocios como el tuyo.
        </p>

        <!-- VSL — Wistia embed (media-id: u9yljeo589) -->
        <div class="ty__vsl-wrap">
          <div class="ty__vsl-glow" aria-hidden="true" />
          <div class="ty__vsl">
            <iframe
              src="https://fast.wistia.net/embed/iframe/u9yljeo589?videoFoam=true&autoPlay=false"
              title="Video — Método Hellen Bermeo"
              allow="autoplay; fullscreen"
              allowfullscreen
              frameborder="0"
              scrolling="no"
              class="ty__vsl-iframe"
            ></iframe>
          </div>
        </div>

        <!-- CTA -->
        <div class="ty__cta-wrap">
          <button class="ty__cta-btn" @click="calendarOpen = true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            AGENDAR MI CITA ESTRATÉGICA GRATUITA
          </button>
          <p class="ty__cta-sub">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
            Sin costo · Solo 20 min · Cupos limitados
          </p>
        </div>

        <!-- Team -->
        <div class="ty__team" aria-label="Hellen Bermeo">
          <div class="ty__team-card">
            <div class="ty__team-info">
              <strong>Hellen Bermeo</strong>
              <span>CEO & Fundadora</span>
            </div>
          </div>
        </div>

        <p class="ty__disclaimer">
          Los resultados no son típicos ni garantizados. Los resultados económicos específicos dependen de la gestión administrativa, el mercado y las decisiones de cada cliente.
        </p>

      </div>
    </section>

    <!-- Footer -->
    <footer class="ty__footer" aria-label="Pie de página">
      <div class="ty__container">
        <nav class="ty__footer-links" aria-label="Legal">
          <RouterLink to="/politicas-privacidad">Política de Privacidad</RouterLink>
          <span aria-hidden="true">·</span>
          <RouterLink to="/aviso-legal">Aviso Legal</RouterLink>
        </nav>
        <p class="ty__footer-copyright">
          &copy; {{ new Date().getFullYear() }} Hellen Bermeo — Todos los derechos reservados
        </p>
      </div>
    </footer>

    <CalendarModal :open="calendarOpen" nombre="" @close="calendarOpen = false" @done="calendarOpen = false" />

  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/colorVariables.module.scss' as colors;
@use '@/styles/fonts.modules.scss' as fonts;

$dark: #0a0712;
$border: rgba(255, 255, 255, 0.07);
$text-muted: rgba(255, 255, 255, 0.45);
$text-body: rgba(255, 255, 255, 0.72);

.ty {
  background: $dark;
  color: colors.$white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.ty__container {
  max-width: 760px;
  margin-inline: auto;
  padding-inline: 24px;

  @media (max-width: 600px) { padding-inline: 16px; }
}

// ── Top bar ───────────────────────────────────────────────────────────────────
.ty__topbar {
  display: flex;
  justify-content: center;
  padding: 20px 24px;
  border-bottom: 1px solid $border;
}

.ty__logo {
  height: 28px;
  width: auto;
}

// ── Hero ──────────────────────────────────────────────────────────────────────
.ty__hero {
  flex: 1;
  padding: 60px 0 80px;
  text-align: center;
}

.ty__badge {
  display: inline-block;
  font-family: fonts.$font-interface;
  font-size: 0.8rem;
  font-weight: 600;
  color: colors.$BRAND-ACCENT;
  background: rgba(colors.$BRAND-ACCENT, 0.1);
  border: 1px solid rgba(colors.$BRAND-ACCENT, 0.25);
  border-radius: 100px;
  padding: 6px 16px;
  margin-bottom: 24px;
  letter-spacing: 0.5px;
}

.ty__title {
  font-family: fonts.$font-principal;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin: 0 0 16px;
  color: colors.$white;
}

.ty__accent {
  background: linear-gradient(110deg, colors.$BRAND-PRIMARY, colors.$BRAND-SECONDARY);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ty__subtitle {
  font-family: fonts.$font-secondary;
  font-size: clamp(0.95rem, 2vw, 1.05rem);
  color: $text-body;
  line-height: 1.65;
  margin: 0 auto 40px;
  max-width: 560px;
}

// ── VSL ───────────────────────────────────────────────────────────────────────
.ty__vsl-wrap {
  position: relative;
  margin: 0 auto 40px;
  max-width: 640px;
}

.ty__vsl-glow {
  position: absolute;
  inset: -30px;
  background: radial-gradient(ellipse at center,
    rgba(colors.$BRAND-SECONDARY, 0.2) 0%,
    transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.ty__vsl {
  position: relative;
  z-index: 1;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(colors.$BRAND-SECONDARY, 0.25);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
  // padding trick para 16:9 responsive
  padding-top: 56.25%;
  height: 0;
}

.ty__vsl-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

// ── CTA ───────────────────────────────────────────────────────────────────────
.ty__cta-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
}

.ty__cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px 36px;
  font-family: fonts.$font-interface;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: colors.$white;
  background: linear-gradient(135deg, colors.$BRAND-SECONDARY, colors.$BRAND-PRIMARY);
  border: none;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(colors.$BRAND-SECONDARY, 0.45);
  transition: transform 0.2s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 48px rgba(colors.$BRAND-SECONDARY, 0.6);
  }

  &:active { transform: translateY(0); }

  @media (max-width: 500px) {
    font-size: 0.85rem;
    padding: 16px 24px;
  }
}

.ty__cta-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: fonts.$font-interface;
  font-size: 0.78rem;
  color: $text-muted;
  margin: 0;
}

// ── Team ──────────────────────────────────────────────────────────────────────
.ty__team {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.ty__team-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid $border;
  border-radius: 14px;
}

.ty__team-photo {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(colors.$BRAND-SECONDARY, 0.3);
}

.ty__team-info {
  display: flex;
  flex-direction: column;
  text-align: left;

  strong {
    font-family: fonts.$font-interface;
    font-size: 0.88rem;
    font-weight: 700;
    color: colors.$white;
  }

  span {
    font-family: fonts.$font-secondary;
    font-size: 0.75rem;
    color: $text-muted;
  }
}

// ── Disclaimer ────────────────────────────────────────────────────────────────
.ty__disclaimer {
  font-family: fonts.$font-secondary;
  font-size: 0.72rem;
  color: $text-muted;
  line-height: 1.6;
  max-width: 520px;
  margin: 0 auto;
}

// ── Footer ────────────────────────────────────────────────────────────────────
.ty__footer {
  padding: 24px 0;
  border-top: 1px solid $border;
  text-align: center;
}

.ty__footer-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;

  a {
    font-family: fonts.$font-interface;
    font-size: 0.75rem;
    color: $text-muted;
    text-decoration: none;
    transition: color 0.2s;

    &:hover { color: colors.$white; }
  }

  span { color: $text-muted; font-size: 0.7rem; }
}

.ty__footer-copyright {
  font-family: fonts.$font-interface;
  font-size: 0.72rem;
  color: $text-muted;
  margin: 0;
}
</style>
