<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import CalendarModal from '@/components/CalendarModal.vue'
import { trackStage, generateEventId } from '@/utils/ghl'
import { useContactStore } from '@/stores/contact'

const contactStore = useContactStore()

// ── Calendar modal ────────────────────────────────────────────────────────────
const calendarOpen = ref(false)

// ── Contact capture guard ─────────────────────────────────────────────────────
const captureOpen = ref(false)
const captureForm = ref({ nombre: '', apellido: '', negocio: '', email: '', telefono: '' })
const captureErrors = ref<Record<string, string>>({})
const captureTouched = ref<Record<string, boolean>>({})
const captureSubmitting = ref(false)

const validateCapture = () => {
  const e: Record<string, string> = {}
  if (captureForm.value.nombre.trim().length < 2) e.nombre = 'Ingresa tu nombre'
  if (captureForm.value.apellido.trim().length < 2) e.apellido = 'Ingresa tu apellido'
  if (captureForm.value.negocio.trim().length < 2) e.negocio = 'Ingresa el nombre de tu negocio'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(captureForm.value.email.trim())) e.email = 'Email inválido'
  if (captureForm.value.telefono.trim().length < 7) e.telefono = 'Teléfono inválido'
  captureErrors.value = e
  return Object.keys(e).length === 0
}

const submitCapture = async () => {
  captureTouched.value = { nombre: true, apellido: true, negocio: true, email: true, telefono: true }
  if (!validateCapture()) return
  captureSubmitting.value = true

  contactStore.save({
    nombre: captureForm.value.nombre.trim(),
    apellido: captureForm.value.apellido.trim(),
    negocio: captureForm.value.negocio.trim(),
    email: captureForm.value.email.trim().toLowerCase(),
    telefono: captureForm.value.telefono.trim(),
  })

  const c = contactStore.get()
  const leadEventId = generateEventId('lead_video')
  trackStage('lead_capturado', {
    nombre: c.nombre,
    apellido: c.apellido,
    negocio: c.negocio,
    email: c.email,
    telefono: c.telefono,
    event_id: leadEventId,
  })
  ;(window as any).fbq?.('track', 'Lead', { content_name: 'video-gate' }, { eventID: leadEventId })
  await new Promise(r => setTimeout(r, 600))
  captureSubmitting.value = false
  captureOpen.value = false
  startTimer()
}

// ── 2-minute countdown (3 s en localhost para testing) ───────────────────────
const IS_DEV = window.location.hostname === 'localhost'
const COUNTDOWN_SECONDS = IS_DEV ? 3 : 120
const secondsLeft = ref(COUNTDOWN_SECONDS)
const ctaUnlocked = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

const formattedTime = () => {
  const m = Math.floor(secondsLeft.value / 60)
  const s = secondsLeft.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const startTimer = () => {
  timer = setInterval(() => {
    if (secondsLeft.value > 0) {
      secondsLeft.value--
    } else {
      ctaUnlocked.value = true
      if (timer) clearInterval(timer)
    }
  }, 1000)
}

onMounted(() => {
  const c = contactStore.get()
  const hasContact = !!c.email && !!c.nombre
  if (!IS_DEV && !hasContact) {
    captureOpen.value = true
  } else {
    ;(window as any).fbq?.('track', 'ViewContent', { content_name: 'video-vsl' })
    startTimer()
  }

  // Inject Wistia scripts
  const script1 = document.createElement('script')
  script1.src = 'https://fast.wistia.com/player.js'
  script1.async = true
  document.head.appendChild(script1)

  const script2 = document.createElement('script')
  script2.src = 'https://fast.wistia.com/embed/w5gwy44l50.js'
  script2.async = true
  script2.type = 'module'
  document.head.appendChild(script2)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div class="vv-page">

    <!-- ── Top bar ──────────────────────────────────────────────────────────── -->
    <header class="vv-topbar">
      <img
        src="@/assets/logos/logo.png"
        alt="Hellen Bermeo"
        class="vv-topbar__logo"
      />
    </header>

    <!-- ── Main content ─────────────────────────────────────────────────────── -->
    <main class="vv-main">

      <!-- Progress stepper -->
      <div class="vv-stepper" aria-label="Paso 1 de 2">
        <span class="vv-stepper__pill">
          <span class="vv-stepper__dot vv-stepper__dot--active" aria-current="step"></span>
          <span class="vv-stepper__dot"></span>
          <span class="vv-stepper__label">Paso 1 de 2</span>
        </span>
      </div>

      <!-- Headline -->
      <section class="vv-headline">
        <p class="vv-eyebrow">Antes de agendar</p>
        <h1 class="vv-h1">
          Escucha mi mensaje &mdash; puede
          <span class="vv-accent">salvar a tu negocio de multas</span>
        </h1>
        <p class="vv-subtitle">
          Ve el video completo. Los siguientes 2 minutos pueden cambiar la salud financiera de tu negocio, blindarte contra del SRI y asegurar que no pagues ni un dólar de más.
        </p>
      </section>

      <!-- Wistia video embed -->
      <div class="vv-video-wrapper">
        <component is="style">
          wistia-player[media-id='w5gwy44l50']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/w5gwy44l50/swatch'); display: block; filter: blur(5px); padding-top:56.25%; }
        </component>
        <wistia-player media-id="w5gwy44l50" aspect="1.7777777777777777"></wistia-player>
      </div>

      <!-- CTA section -->
      <div class="vv-cta-section">

        <!-- Lock notice (visible while countdown active) -->
        <Transition name="lock-fade">
          <div v-if="!ctaUnlocked" class="vv-lock-notice">
            <i class="fa-solid fa-lock vv-lock-notice__icon" aria-hidden="true"></i>
            <span class="vv-lock-notice__text">
              El botón se habilita en
              <strong class="vv-lock-notice__timer">{{ formattedTime() }}</strong>
              &mdash; el video tiene la clave para tu negocio
            </span>
          </div>
        </Transition>

        <!-- CTA button -->
        <button
          class="vv-cta-btn"
          :class="{ 'vv-cta-btn--active': ctaUnlocked, 'vv-cta-btn--locked': !ctaUnlocked }"
          :disabled="!ctaUnlocked"
          @click="ctaUnlocked && (calendarOpen = true)"
        >
          <i
            v-if="ctaUnlocked"
            class="fa-solid fa-calendar-check"
            aria-hidden="true"
          ></i>
          <i
            v-else
            class="fa-solid fa-lock"
            aria-hidden="true"
          ></i>
          <span v-if="ctaUnlocked">QUIERO AGENDAR MI CITA ESTRATÉGICA AHORA</span>
          <span v-else>QUIERO AGENDAR MI CITA</span>
        </button>

        <!-- Trust line -->
        <p class="vv-trust">
          <i class="fa-solid fa-lock" aria-hidden="true"></i>
          100% gratuito &middot; Sin compromiso &middot; Cupos limitados
        </p>

      </div>

    </main>

    <!-- ── Footer ────────────────────────────────────────────────────────────── -->
    <footer class="vv-footer">
      <p class="vv-footer__copy">&copy; {{ new Date().getFullYear() }} Hellen Bermeo. Todos los derechos reservados.</p>
      <div style="font-size: 0.7rem; color: rgba(0, 0, 0, 0.55); max-width: 600px; text-align: center; margin-bottom: 20px;">
        Esta página web es operada y mantenida por Hellen Bermeo. El uso del sitio web se rige por nuestros Términos de Servicio y Política de Privacidad. Hellen Bermeo es una firma dedicada a la asesoría contable, tributaria y financiera para emprendedores y empresas. No somos una entidad bancaria ni ofrecemos préstamos, inversiones financieras o sistemas de "enriquecimiento rápido". Nuestro objetivo es proporcionar herramientas y estrategias para el cumplimiento legal y la optimización de recursos; sin embargo, no garantizamos resultados económicos específicos, ya que estos dependen de la gestión administrativa, el mercado y las decisiones de cada cliente.
      </div>
      <nav class="vv-footer__links" aria-label="Legal">
        <RouterLink to="/politicas-privacidad" class="vv-footer__link">Políticas de Privacidad</RouterLink>
        <span class="vv-footer__sep" aria-hidden="true">&middot;</span>
        <RouterLink to="/aviso-legal" class="vv-footer__link">Aviso Legal</RouterLink>
      </nav>
    </footer>

  </div>

  <!-- Calendar modal -->
  <CalendarModal
    :open="calendarOpen"
    nombre=""
    @close="calendarOpen = false"
  />

  <!-- ── Contact capture overlay ─────────────────────────────────────────────── -->
  <Transition name="capture-fade">
    <div v-if="captureOpen" class="cap-overlay" role="dialog" aria-modal="true" aria-labelledby="cap-title">
      <div class="cap-card">

        <div class="cap-icon-wrap">
          <i class="fa-solid fa-user-lock cap-icon" aria-hidden="true"></i>
        </div>

        <h2 id="cap-title" class="cap-h2">Antes de ver el video, déjanos tus datos</h2>
        <p class="cap-sub">Lo guardamos para enviarte los recursos de la sesión</p>

        <form class="cap-form" @submit.prevent="submitCapture" novalidate>

          <div class="cap-row">
            <div class="cap-field" :class="{ 'cap-field--error': captureTouched.nombre && captureErrors.nombre }">
              <label class="cap-label" for="cap-nombre">Nombre</label>
              <input
                id="cap-nombre"
                v-model="captureForm.nombre"
                type="text"
                class="cap-input"
                placeholder="Tu nombre"
                autocomplete="given-name"
                @blur="captureTouched.nombre = true; validateCapture()"
              />
              <span v-if="captureTouched.nombre && captureErrors.nombre" class="cap-error">{{ captureErrors.nombre }}</span>
            </div>

            <div class="cap-field" :class="{ 'cap-field--error': captureTouched.apellido && captureErrors.apellido }">
              <label class="cap-label" for="cap-apellido">Apellido</label>
              <input
                id="cap-apellido"
                v-model="captureForm.apellido"
                type="text"
                class="cap-input"
                placeholder="Tu apellido"
                autocomplete="family-name"
                @blur="captureTouched.apellido = true; validateCapture()"
              />
              <span v-if="captureTouched.apellido && captureErrors.apellido" class="cap-error">{{ captureErrors.apellido }}</span>
            </div>
          </div>

          <div class="cap-field" :class="{ 'cap-field--error': captureTouched.negocio && captureErrors.negocio }">
            <label class="cap-label" for="cap-negocio">Nombre de tu negocio</label>
            <input
              id="cap-negocio"
              v-model="captureForm.negocio"
              type="text"
              class="cap-input"
              placeholder="Ej: Pastelería Nicole"
              autocomplete="organization"
              @blur="captureTouched.negocio = true; validateCapture()"
            />
            <span v-if="captureTouched.negocio && captureErrors.negocio" class="cap-error">{{ captureErrors.negocio }}</span>
          </div>

          <div class="cap-field" :class="{ 'cap-field--error': captureTouched.email && captureErrors.email }">
            <label class="cap-label" for="cap-email">Email</label>
            <input
              id="cap-email"
              v-model="captureForm.email"
              type="email"
              class="cap-input"
              placeholder="tu@email.com"
              autocomplete="email"
              @blur="captureTouched.email = true; validateCapture()"
            />
            <span v-if="captureTouched.email && captureErrors.email" class="cap-error">{{ captureErrors.email }}</span>
          </div>

          <div class="cap-field" :class="{ 'cap-field--error': captureTouched.telefono && captureErrors.telefono }">
            <label class="cap-label" for="cap-telefono">Teléfono / WhatsApp</label>
            <input
              id="cap-telefono"
              v-model="captureForm.telefono"
              type="tel"
              class="cap-input"
              placeholder="+593 99 999 9999"
              autocomplete="tel"
              @blur="captureTouched.telefono = true; validateCapture()"
            />
            <span v-if="captureTouched.telefono && captureErrors.telefono" class="cap-error">{{ captureErrors.telefono }}</span>
          </div>

          <button type="submit" class="cap-submit" :disabled="captureSubmitting">
            <i v-if="!captureSubmitting" class="fa-solid fa-play" aria-hidden="true"></i>
            <i v-else class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>
            <span>{{ captureSubmitting ? 'Un momento...' : 'CONTINUAR AL VIDEO' }}</span>
          </button>

        </form>

        <p class="cap-privacy">
          <i class="fa-solid fa-lock" aria-hidden="true"></i>
          Tus datos están seguros &middot; No spam
        </p>

      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@use '@/styles/colorVariables.module.scss' as colors;
@use '@/styles/fonts.modules.scss' as fonts;

$bg:          #ffffff;
$border:      rgba(0, 0, 0, 0.08);
$text-muted:  rgba(0, 0, 0, 0.55);
$text-body:   rgba(0, 0, 0, 0.72);
$text-dark:   #212529;

// ── Page shell ────────────────────────────────────────────────────────────────
.vv-page {
  min-height: 100vh;
  background: $bg;
  display: flex;
  flex-direction: column;
  color: $text-dark;
}

// ── Top bar ───────────────────────────────────────────────────────────────────
.vv-topbar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px 24px;
  background: rgba($bg, 0.88);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid $border;
}

.vv-topbar__logo {
  height: 28px;
  width: auto;
  display: block;
}

// ── Main ──────────────────────────────────────────────────────────────────────
.vv-main {
  flex: 1;
  width: 100%;
  max-width: 780px;
  margin: 0 auto;
  padding: 48px 24px 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;

  @media (max-width: 600px) {
    padding: 32px 16px 48px;
    gap: 28px;
  }
}

// ── Stepper ───────────────────────────────────────────────────────────────────
.vv-stepper {
  display: flex;
  justify-content: center;
}

.vv-stepper__pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px 6px 10px;
  background: rgba(colors.$BRAND-SECONDARY, 0.1);
  border: 1px solid rgba(colors.$BRAND-SECONDARY, 0.22);
  border-radius: 100px;
}

.vv-stepper__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.18);
  flex-shrink: 0;
  transition: background 0.2s;

  &--active {
    background: colors.$BRAND-SECONDARY;
    box-shadow: 0 0 8px rgba(colors.$BRAND-SECONDARY, 0.7);
  }
}

.vv-stepper__label {
  font-family: fonts.$font-accent;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(colors.$BRAND-SECONDARY, 0.85);
  padding-left: 4px;
}

// ── Headline ──────────────────────────────────────────────────────────────────
.vv-headline {
  text-align: center;
  max-width: 680px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vv-eyebrow {
  font-family: fonts.$font-accent;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: colors.$BRAND-SECONDARY;
  margin: 0;
}

.vv-h1 {
  font-family: fonts.$font-principal;
  font-size: clamp(1.7rem, 4.5vw, 2.6rem);
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.18;
  color: $text-dark;
  margin: 0;
}

.vv-accent {
  background: linear-gradient(110deg, colors.$BRAND-PRIMARY, colors.$BRAND-SECONDARY);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.vv-subtitle {
  font-family: fonts.$font-secondary;
  font-size: clamp(0.92rem, 2vw, 1.05rem);
  color: $text-body;
  line-height: 1.6;
  margin: 0;
}

// ── Video ─────────────────────────────────────────────────────────────────────
.vv-video-wrapper {
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(colors.$BRAND-SECONDARY, 0.3);
  box-shadow:
    0 0 0 1px rgba(colors.$BRAND-SECONDARY, 0.08) inset,
    0 0 60px rgba(colors.$BRAND-SECONDARY, 0.18),
    0 32px 80px rgba(0, 0, 0, 0.7);
}

// ── CTA section ───────────────────────────────────────────────────────────────
.vv-cta-section {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

// Lock notice
.vv-lock-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid $border;
  border-radius: 10px;
  width: 100%;
}

.vv-lock-notice__icon {
  font-size: 0.82rem;
  color: $text-muted;
  flex-shrink: 0;
}

.vv-lock-notice__text {
  font-family: fonts.$font-interface;
  font-size: 0.82rem;
  color: $text-body;
  line-height: 1.45;
}

.vv-lock-notice__timer {
  font-family: fonts.$font-accent;
  font-weight: 700;
  color: colors.$BRAND-SECONDARY;
}

// CTA button
.vv-cta-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px 28px;
  font-family: fonts.$font-accent;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: colors.$white;
  border: none;
  border-radius: 12px;
  cursor: not-allowed;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.3s ease, opacity 0.25s;

  i { font-size: 1rem; }

  // Locked state
  &--locked {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.09);
    color: rgba(0, 0, 0, 0.4);
    cursor: not-allowed;

    i { color: rgba(0, 0, 0, 0.3); }
  }

  // Active / unlocked state
  &--active {
    background: colors.$BRAND-PRIMARY;
    box-shadow:
      0 8px 32px rgba(colors.$BRAND-PRIMARY, 0.35),
      0 2px 8px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    animation: cta-pulse 2.8s ease-in-out infinite;

    &:hover {
      transform: translateY(-3px);
      box-shadow:
        0 14px 44px rgba(colors.$BRAND-PRIMARY, 0.5),
        0 4px 12px rgba(0, 0, 0, 0.5);
      animation: none;
    }

    &:active {
      transform: translateY(0);
    }
  }
}

@keyframes cta-pulse {
  0%, 100% { box-shadow: 0 8px 32px rgba(colors.$BRAND-PRIMARY, 0.35), 0 2px 8px rgba(0,0,0,0.05); }
  50%       { box-shadow: 0 10px 44px rgba(colors.$BRAND-PRIMARY, 0.55), 0 2px 8px rgba(0,0,0,0.08); }
}

// Trust line
.vv-trust {
  font-family: fonts.$font-interface;
  font-size: 0.74rem;
  color: $text-muted;
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;

  i { font-size: 0.65rem; }
}

// Lock notice transition
.lock-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.lock-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

// ── Footer ────────────────────────────────────────────────────────────────────
.vv-footer {
  padding: 24px 24px 32px;
  border-top: 1px solid $border;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.vv-footer__copy {
  font-family: fonts.$font-interface;
  font-size: 0.7rem;
  color: $text-muted;
  margin: 0;
  text-align: center;
}

.vv-footer__links {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vv-footer__link {
  font-family: fonts.$font-interface;
  font-size: 0.7rem;
  color: rgba(0, 0, 0, 0.5);
  text-decoration: none;
  transition: color 0.2s;

  &:hover { color: rgba(0, 0, 0, 0.8); }
}

.vv-footer__sep {
  color: $text-muted;
  font-size: 0.7rem;
}

// ── Contact capture overlay ───────────────────────────────────────────────────
.cap-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  overflow-y: auto;
}

.cap-card {
  width: 100%;
  max-width: 460px;
  background: $bg;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 20px;
  padding: 40px 36px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.03) inset,
    0 32px 80px rgba(0, 0, 0, 0.15),
    0 0 60px rgba(colors.$BRAND-PRIMARY, 0.05);

  @media (max-width: 480px) {
    padding: 32px 22px 28px;
  }
}

.cap-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(colors.$BRAND-SECONDARY, 0.12);
  border: 1px solid rgba(colors.$BRAND-SECONDARY, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.cap-icon {
  font-size: 1.8rem;
  color: colors.$BRAND-SECONDARY;
}

.cap-h2 {
  font-family: fonts.$font-principal;
  font-size: clamp(1.2rem, 4vw, 1.45rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: $text-dark;
  text-align: center;
  margin: 0 0 10px;
}

.cap-sub {
  font-family: fonts.$font-secondary;
  font-size: 0.88rem;
  color: $text-body;
  text-align: center;
  line-height: 1.5;
  margin: 0 0 28px;
}

.cap-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cap-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
}

.cap-field {
  display: flex;
  flex-direction: column;
  gap: 5px;

  &--error .cap-input {
    border-color: rgba(colors.$BRAND-PRIMARY, 0.6);
    background: rgba(colors.$BRAND-PRIMARY, 0.04);
  }
}

.cap-label {
  font-family: fonts.$font-interface;
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.55);
}

.cap-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  color: $text-dark;
  font-family: fonts.$font-secondary;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s, background 0.2s;
  box-sizing: border-box;

  &::placeholder { color: rgba(0, 0, 0, 0.25); }

  &:focus {
    border-color: rgba(colors.$BRAND-SECONDARY, 0.55);
    background: rgba(colors.$BRAND-SECONDARY, 0.06);
  }
}

.cap-error {
  font-family: fonts.$font-interface;
  font-size: 0.74rem;
  color: colors.$BRAND-PRIMARY;
}

.cap-submit {
  margin-top: 6px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 24px;
  background: colors.$BRAND-PRIMARY;
  border: none;
  border-radius: 12px;
  color: colors.$white;
  font-family: fonts.$font-accent;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s;
  box-shadow: 0 8px 28px rgba(colors.$BRAND-PRIMARY, 0.35);

  i { font-size: 0.95rem; }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 36px rgba(colors.$BRAND-PRIMARY, 0.5);
  }

  &:active:not(:disabled) { transform: translateY(0); }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.cap-privacy {
  margin-top: 18px;
  font-family: fonts.$font-interface;
  font-size: 0.72rem;
  color: $text-muted;
  display: flex;
  align-items: center;
  gap: 6px;

  i { font-size: 0.62rem; }
}

// Overlay transition
.capture-fade-enter-active,
.capture-fade-leave-active {
  transition: opacity 0.3s ease;
}
.capture-fade-enter-from,
.capture-fade-leave-to {
  opacity: 0;
}
</style>
