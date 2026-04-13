<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContactStore } from '@/stores/contact'
import { getStoredFbParams } from '@/utils/fbclid'

const contactStore = useContactStore()

const props = defineProps<{ open: boolean; nombre: string }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'done'): void }>()

const router = useRouter()
const submitting = ref(false)
const touched = ref(false)

const form = ref({
  situacion: '',
  area: '',
  invertir: '',
  presupuesto: '',
  consent: false,
})

const isValid = () =>
  !!form.value.situacion &&
  !!form.value.area &&
  !!form.value.invertir &&
  !!form.value.presupuesto &&
  form.value.consent

const IS_DEV = window.location.hostname === 'localhost'

const qualifies = () => {
  if (form.value.invertir === 'costos') return false
  if (form.value.presupuesto === 'menor_500') return false
  return true
}

const handleSubmit = async () => {
  touched.value = true
  if (!isValid()) return
  submitting.value = true

  const contact = contactStore.get()
  const califica = qualifies()

  const etiquetas = [
    'funnel-hellenbermeo',
    'step-2-cualificacion',
    califica ? 'califica' : 'no-califica',
    `situacion-${form.value.situacion}`,
    `area-${form.value.area}`,
    `invertir-${form.value.invertir}`,
    `presupuesto-${form.value.presupuesto}`,
  ]

  const situacionLabel: Record<string, string> = {
    emprendedor: 'Emprendedor (Persona Natural)',
    pyme: 'Dueño de Negocio / Pyme (Sociedad)',
    profesional: 'Profesional Independiente',
    empezar: 'Aún no tengo RUC, quiero empezar',
  }
  const areaLabel: Record<string, string> = {
    tributario: 'Cumplimiento Tributario',
    gestion: 'Gestión y Formalización',
    estrategia: 'Estrategia y Ahorro',
    seguro: 'No estoy seguro',
  }
  const invertirLabel: Record<string, string> = {
    mensual: 'Servicio profesional mensual',
    puntual: 'Trámite puntual',
    costos: 'Buscando información de costos',
  }
  const presupuestoLabel: Record<string, string> = {
    mayor_500: 'Más de $500 USD',
    menor_500: 'Menos de $500 USD',
  }

  const nota = `${califica ? '✅ LEAD CALIFICADO' : '❌ NO CALIFICA'} — Hellen Bermeo Funnel
━━━━━━━━━━━━━━━━━━━━━━━━
👤 ${contact.nombre} ${contact.apellido}
🏢 Negocio: ${contact.negocio}
📧 ${contact.email}
📱 ${contact.telefono}
━━━━━━━━━━━━━━━━━━━━━━━━
🧑‍💼 Situación: ${situacionLabel[form.value.situacion] ?? form.value.situacion}
🎯 Área: ${areaLabel[form.value.area] ?? form.value.area}
💸 Para Invertir: ${invertirLabel[form.value.invertir] ?? form.value.invertir}
💰 Presupuesto: ${presupuestoLabel[form.value.presupuesto] ?? form.value.presupuesto}
━━━━━━━━━━━━━━━━━━━━━━━━
📊 Resultado: ${califica ? '🟢 AGENDA CITA' : '🔴 RECHAZADO'}
🕐 ${new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}
🔑 event_id: ${`schedule_${Date.now()}_bk`}`

  const payload = {
    nombre: contact.nombre || props.nombre,
    apellido: contact.apellido,
    negocio: contact.negocio,
    email: contact.email,
    telefono: contact.telefono,
    situacion: form.value.situacion,
    area: form.value.area,
    invertir: form.value.invertir,
    presupuesto: form.value.presupuesto,
    califica,
    resultado: califica ? 'AGENDA' : 'RECHAZADO',
    etiquetas,
    nota,
    timestamp: new Date().toISOString(),
    ...getStoredFbParams(),
  }
  console.info('[Hellen Bermeo Agenda]', payload)

  const scheduleEventId = `schedule_${Date.now()}_${Math.random().toString(36).slice(2)}`

  // Reemplazar el event_id temporal de la nota con el real
  const finalPayload = { ...payload, nota: payload.nota.replace(/schedule_\d+_bk/, scheduleEventId), event_id: scheduleEventId }

  await fetch('https://services.leadconnectorhq.com/hooks/pEFChujwCCaMWBNbZYD1/webhook-trigger/69dc0e5f-e2c0-4e9f-9625-10a708787d59', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(finalPayload),
  }).catch(() => {})

  // Meta Pixel — step 2 completado (todos los envíos)
  ;(window as any).fbq?.('track', 'CompleteRegistration',
    { content_name: 'cualificacion-step2', status: califica ? 'califica' : 'no-califica' },
    { eventID: scheduleEventId }
  )

  if (califica) {
    // Meta Pixel — evento Schedule (deduplicado con CAPI via event_id)
    ;(window as any).fbq?.('track', 'Schedule',
      { content_name: 'cita-estrategica' },
      { eventID: scheduleEventId }
    )
  }

  submitting.value = false
  emit('close')
  if (califica) {
    router.push('/agendar')
  } else {
    if (!IS_DEV) localStorage.setItem('bk_disq_at', String(Date.now()))
    router.push('/sin-espacio')
  }
}

const onKeydown = (e: KeyboardEvent) => { if (e.key === 'Escape') emit('close') }

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

watch(() => props.open, (v) => { if (v) { touched.value = false; form.value = { situacion: '', area: '', invertir: '', presupuesto: '', consent: false } } })
</script>

<template>
  <Teleport to="body">
    <Transition name="cal-fade">
      <div v-if="props.open" class="cal-overlay" @click.self="$emit('close')" role="dialog" aria-modal="true" aria-labelledby="cal-title">
        <div class="cal-modal">

          <button class="cal-close" @click="$emit('close')" aria-label="Cerrar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <!-- ── CALIFICACIÓN ──────────────────────────────── -->
          <p class="cal-eyebrow">Paso final</p>
            <h2 id="cal-title" class="cal-title">
              Cuéntanos sobre<br>
              <span class="cal-accent">tu negocio</span>
            </h2>
            <p class="cal-subtitle">4 preguntas rápidas para asignarte al miembro del equipo ideal — 60 segundos.</p>

            <form class="cal-form" @submit.prevent="handleSubmit" novalidate>

              <!-- Q1 -->
              <fieldset class="cal-fieldset" :class="{ 'has-error': touched && !form.situacion }">
                <legend class="cal-legend">
                  <span class="cal-q-num">01</span>
                  ¿Cuál es tu situación actual como contribuyente? *
                </legend>
                <div class="cal-options">
                  <label v-for="opt in [
                    { value: 'emprendedor', label: 'Emprendedor (Persona Natural)' },
                    { value: 'pyme', label: 'Dueño de Negocio / Pyme (Sociedad)' },
                    { value: 'profesional', label: 'Profesional Independiente' },
                    { value: 'empezar', label: 'Aún no tengo RUC, quiero empezar.' }
                  ]" :key="opt.value" class="cal-option" :class="{ selected: form.situacion === opt.value }">
                    <input type="radio" :value="opt.value" v-model="form.situacion" hidden />
                    <span class="cal-option__radio" aria-hidden="true" />
                    <span class="cal-option__label">{{ opt.label }}</span>
                  </label>
                </div>
                <span v-if="touched && !form.situacion" class="cal-error">Selecciona una opción</span>
              </fieldset>

              <!-- Q2 -->
              <fieldset class="cal-fieldset" :class="{ 'has-error': touched && !form.area }">
                <legend class="cal-legend">
                  <span class="cal-q-num">02</span>
                  ¿En qué área necesitas apoyo inmediato? *
                </legend>
                <div class="cal-options">
                  <label v-for="opt in [
                    { value: 'tributario', label: 'Cumplimiento Tributario: (Declaraciones, SRI)' },
                    { value: 'gestion', label: 'Gestión y Formalización: (RUC, Firma Electrónica)' },
                    { value: 'estrategia', label: 'Estrategia y Ahorro: (Optimizar finanzas e impuestos)' },
                    { value: 'seguro', label: 'No estoy seguro: (Necesito asesoría para evitar multas)' }
                  ]" :key="opt.value" class="cal-option" :class="{ selected: form.area === opt.value }">
                    <input type="radio" :value="opt.value" v-model="form.area" hidden />
                    <span class="cal-option__radio" aria-hidden="true" />
                    <span class="cal-option__label">{{ opt.label }}</span>
                  </label>
                </div>
                <span v-if="touched && !form.area" class="cal-error">Selecciona una opción</span>
              </fieldset>

              <!-- Q3 -->
              <fieldset class="cal-fieldset" :class="{ 'has-error': touched && !form.invertir }">
                <legend class="cal-legend">
                  <span class="cal-q-num">03</span>
                  ¿Estás listo para invertir en la salud financiera de tu negocio? *
                </legend>
                <div class="cal-options">
                  <label v-for="opt in [
                    { value: 'mensual', label: 'Sí, busco un servicio profesional mensual.' },
                    { value: 'puntual', label: 'Sí, necesito solucionar un trámite puntual ahora mismo.' },
                    { value: 'costos', label: 'Estoy buscando información de costos por el momento.' },
                  ]" :key="opt.value" class="cal-option" :class="{ selected: form.invertir === opt.value }">
                    <input type="radio" :value="opt.value" v-model="form.invertir" hidden />
                    <span class="cal-option__radio" aria-hidden="true" />
                    <span class="cal-option__label">{{ opt.label }}</span>
                  </label>
                </div>
                <span v-if="touched && !form.invertir" class="cal-error">Selecciona una opción</span>
              </fieldset>

              <!-- Q4 -->
              <fieldset class="cal-fieldset" :class="{ 'has-error': touched && !form.presupuesto }">
                <legend class="cal-legend">
                  <span class="cal-q-num">04</span>
                  ¿Cuentas con un presupuesto de inversión para la solución a tu problema? *
                </legend>
                <div class="cal-options">
                  <label v-for="opt in [
                    { value: 'mayor_500', label: 'Cuento con más de $500 dólares para solucionar mi problema de raíz.' },
                    { value: 'menor_500', label: 'Mi presupuesto es menor a $500 dólares en este momento.' }
                  ]" :key="opt.value" class="cal-option" :class="{ selected: form.presupuesto === opt.value }">
                    <input type="radio" :value="opt.value" v-model="form.presupuesto" hidden />
                    <span class="cal-option__radio" aria-hidden="true" />
                    <span class="cal-option__label">{{ opt.label }}</span>
                  </label>
                </div>
                <span v-if="touched && !form.presupuesto" class="cal-error">Selecciona una opción</span>
              </fieldset>

              <!-- Consent -->
              <label class="cal-consent" :class="{ 'has-error': touched && !form.consent }">
                <input type="checkbox" v-model="form.consent" hidden />
                <span class="cal-consent__box" :class="{ checked: form.consent }" aria-hidden="true">
                  <svg v-if="form.consent" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                <span class="cal-consent__text">
                  Consiento que Hellen Bermeo me contacte para ofrecerme sus servicios y enviarme información sobre sus planes y beneficios. Además acepto sus
                  <RouterLink to="/politicas-privacidad" target="_blank" class="cal-link">políticas y condiciones de uso</RouterLink>.
                </span>
              </label>

              <button class="cal-btn" type="submit" :disabled="submitting">
                <svg v-if="submitting" class="cal-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <template v-else>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </template>
                {{ submitting ? 'Verificando...' : 'CONFIRMAR Y VER DISPONIBILIDAD' }}
              </button>

            </form>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '@/styles/colorVariables.module.scss' as colors;
@use '@/styles/fonts.modules.scss' as fonts;

$dark: #0d0a18;
$dark2: #130f1e;
$border: rgba(255, 255, 255, 0.08);
$text-muted: rgba(255, 255, 255, 0.4);
$text-body: rgba(255, 255, 255, 0.7);

// ── Overlay ──────────────────────────────────────────────────────────────────
.cal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

// ── Modal ─────────────────────────────────────────────────────────────────────
.cal-modal {
  position: relative;
  width: 100%;
  max-width: 500px;
  background: $dark;
  border: 1px solid rgba(colors.$BRAND-SECONDARY, 0.2);
  border-radius: 24px;
  padding: 48px 36px 40px;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.03) inset,
    0 40px 100px rgba(0,0,0,0.8),
    0 0 80px rgba(colors.$BRAND-SECONDARY, 0.08);
  max-height: 92vh;
  overflow-y: auto;

  @media (max-width: 540px) {
    padding: 44px 20px 36px;
    border-radius: 20px;
  }
}

.cal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid $border;
  background: rgba(255,255,255,0.03);
  color: $text-muted;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, color 0.2s;

  &:hover {
    border-color: rgba(colors.$BRAND-SECONDARY, 0.4);
    color: colors.$BRAND-SECONDARY;
  }
}

// ── Header ────────────────────────────────────────────────────────────────────
.cal-eyebrow {
  font-family: fonts.$font-accent;
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: colors.$BRAND-SECONDARY;
  margin: 0 0 10px;
}

.cal-title {
  font-family: fonts.$font-principal;
  font-size: clamp(1.5rem, 3.5vw, 1.9rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: colors.$white;
  margin: 0 0 8px;
}

.cal-accent {
  background: linear-gradient(110deg, colors.$BRAND-PRIMARY, colors.$BRAND-SECONDARY);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.cal-subtitle {
  font-family: fonts.$font-secondary;
  font-size: 0.86rem;
  color: $text-muted;
  margin: 0 0 28px;
}

// ── Form ──────────────────────────────────────────────────────────────────────
.cal-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cal-fieldset {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.cal-legend {
  font-family: fonts.$font-interface;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

.cal-q-num {
  font-family: fonts.$font-accent;
  font-size: 0.65rem;
  font-weight: 700;
  color: colors.$BRAND-SECONDARY;
  background: rgba(colors.$BRAND-SECONDARY, 0.12);
  border: 1px solid rgba(colors.$BRAND-SECONDARY, 0.2);
  border-radius: 4px;
  padding: 1px 6px;
  letter-spacing: 1px;
  flex-shrink: 0;
}

.cal-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cal-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid $border;
  background: rgba(255,255,255,0.02);
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s;

  &:hover {
    border-color: rgba(colors.$BRAND-SECONDARY, 0.3);
    background: rgba(colors.$BRAND-SECONDARY, 0.04);
  }

  &.selected {
    border-color: rgba(colors.$BRAND-SECONDARY, 0.5);
    background: rgba(colors.$BRAND-SECONDARY, 0.08);

    .cal-option__radio {
      border-color: colors.$BRAND-SECONDARY;

      &::after {
        opacity: 1;
        transform: scale(1);
      }
    }
  }
}

.cal-option__radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.2);
  flex-shrink: 0;
  position: relative;
  transition: border-color 0.18s;

  &::after {
    content: '';
    position: absolute;
    inset: 3px;
    border-radius: 50%;
    background: linear-gradient(135deg, colors.$BRAND-PRIMARY, colors.$BRAND-SECONDARY);
    opacity: 0;
    transform: scale(0.4);
    transition: opacity 0.18s, transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.cal-option__label {
  font-family: fonts.$font-secondary;
  font-size: 0.86rem;
  color: $text-body;
  line-height: 1.4;
}

.cal-error {
  font-family: fonts.$font-interface;
  font-size: 0.7rem;
  color: #ff6680;
  padding-left: 2px;
}

.has-error .cal-option {
  border-color: rgba(255, 80, 100, 0.15);
}

// ── Consent ───────────────────────────────────────────────────────────────────
.cal-consent {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;

  &.has-error .cal-consent__box {
    border-color: rgba(255, 80, 100, 0.5);
  }
}

.cal-consent__box {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid rgba(255,255,255,0.2);
  flex-shrink: 0;
  margin-top: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.18s, background 0.18s;
  color: colors.$white;

  &.checked {
    background: linear-gradient(135deg, colors.$BRAND-PRIMARY, colors.$BRAND-SECONDARY);
    border-color: transparent;
  }
}

.cal-consent__text {
  font-family: fonts.$font-interface;
  font-size: 0.72rem;
  color: $text-muted;
  line-height: 1.55;
}

.cal-link {
  color: rgba(colors.$BRAND-SECONDARY, 0.8);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.2s;

  &:hover { color: colors.$BRAND-SECONDARY; }
}

// ── Button ────────────────────────────────────────────────────────────────────
.cal-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 24px;
  font-family: fonts.$font-interface;
  font-size: 0.88rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: colors.$white;
  background: linear-gradient(135deg, colors.$BRAND-SECONDARY, colors.$BRAND-PRIMARY);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 8px 28px rgba(colors.$BRAND-SECONDARY, 0.4);
  transition: transform 0.2s ease, box-shadow 0.25s ease, opacity 0.2s;
  text-decoration: none;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 14px 40px rgba(colors.$BRAND-SECONDARY, 0.55);
  }

  &:active:not(:disabled) { transform: translateY(0); }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &--ghost {
    background: transparent;
    border: 1px solid $border;
    color: $text-muted;
    box-shadow: none;

    &:hover:not(:disabled) {
      border-color: rgba(255,255,255,0.2);
      color: colors.$white;
      box-shadow: none;
    }
  }
}

// ── Textarea Q4 ───────────────────────────────────────────────────────────────
.cal-textarea-wrap {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cal-textarea {
  width: 100%;
  resize: vertical;
  min-height: 100px;
  padding: 12px 14px;
  font-family: fonts.$font-secondary;
  font-size: 0.86rem;
  color: rgba(255,255,255,0.85);
  background: rgba(255,255,255,0.03);
  border: 1px solid $border;
  border-radius: 12px;
  outline: none;
  transition: border-color 0.18s, background 0.18s;
  line-height: 1.55;
  box-sizing: border-box;

  &::placeholder {
    color: rgba(255,255,255,0.22);
  }

  &:focus {
    border-color: rgba(colors.$BRAND-SECONDARY, 0.45);
    background: rgba(colors.$BRAND-SECONDARY, 0.04);
  }

  &.error {
    border-color: rgba(255, 80, 100, 0.3);
  }
}

.cal-textarea-footer {
  display: flex;
  justify-content: flex-end;
  min-height: 16px;
}

.cal-word-hint {
  font-family: fonts.$font-interface;
  font-size: 0.7rem;
  color: $text-muted;
  display: flex;
  align-items: center;
  gap: 5px;
}

.cal-word-ok {
  color: colors.$BRAND-ACCENT;
  font-size: 0.75rem;
}

@keyframes spin { to { transform: rotate(360deg); } }
.cal-spinner { animation: spin 0.8s linear infinite; }

// ── Transición ────────────────────────────────────────────────────────────────
.cal-fade-enter-active {
  transition: opacity 0.28s ease;

  .cal-modal {
    transition: opacity 0.28s ease, transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1);
  }
}

.cal-fade-leave-active {
  transition: opacity 0.2s ease;

  .cal-modal {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
}

.cal-fade-enter-from {
  opacity: 0;

  .cal-modal {
    opacity: 0;
    transform: scale(0.92) translateY(20px);
  }
}

.cal-fade-leave-to {
  opacity: 0;

  .cal-modal {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
}
</style>
