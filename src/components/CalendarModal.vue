<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useContactStore } from '@/stores/contact'
import { getStoredFbParams } from '@/utils/fbclid'
import brandLogo from '@/assets/logos/logo.png'

const contactStore = useContactStore()

const props = defineProps<{ open: boolean; nombre: string }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'done'): void }>()

const router = useRouter()
const submitting = ref(false)
const loadingText = ref('Analizando tus respuestas...')
const touched = ref(false)

const currentStep = ref(1)
const TOTAL_STEPS = 2

const showLeaveWarning = ref(false)

const form = ref({
  situacion: '',
  area: '',
  detalle: '',
  invertir: '',
  consent: false,
})

const attemptClose = () => {
  // Siempre mostrar alerta de abandono
  showLeaveWarning.value = true
}

const forceClose = () => {
  showLeaveWarning.value = false
  emit('close')
}

const wordCount = computed(() => {
  const t = form.value.detalle.trim()
  return t ? t.split(/\s+/).length : 0
})

const isValidStep = (step: number) => {
  if (step === 1) return !!form.value.situacion && !!form.value.area && wordCount.value >= 15
  if (step === 2) return !!form.value.invertir && form.value.consent
  return false
}

const nextStep = () => {
  touched.value = true
  if (isValidStep(currentStep.value) && currentStep.value < TOTAL_STEPS) {
    touched.value = false
    currentStep.value++
    // scroll al inicio modal preferiblemente
    const calModal = document.querySelector('.cal-modal')
    if (calModal) calModal.scrollTop = 0
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    touched.value = false
    currentStep.value--
  }
}

const selectOption = (field: keyof typeof form.value, val: string) => {
  form.value[field] = val as never
}

const isValid = () => isValidStep(1) && isValidStep(2)

const IS_DEV = window.location.hostname === 'localhost'

const qualifies = () => {
  if (form.value.invertir === 'nolisto') return false
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
    listo: 'Sí, listo para invertir mínimo $1,000',
    nolisto: 'No, presupuesto menor por ahora',
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
📝 Detalle:\n${form.value.detalle}
━━━━━━━━━━━━━━━━━━━━━━━━
💰 Inversión: ${invertirLabel[form.value.invertir] ?? form.value.invertir}
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
    detalle: form.value.detalle,
    invertir: form.value.invertir,
    califica,
    resultado: califica ? 'AGENDA' : 'RECHAZADO',
    etiquetas,
    nota,
    timestamp: new Date().toISOString(),
    ...getStoredFbParams(),
  }
  console.info('[Hellen Bermeo Agenda]', payload)

  // Mostrar loading state
  submitting.value = true
  loadingText.value = 'Procesando información...'

  // Cambiar texto de carga a los 1.5s para mayor interactividad
  const textInterval = setTimeout(() => {
    loadingText.value = califica ? 'Buscando espacio en la agenda...' : 'Finalizando evaluación...'
  }, 1200)

  const scheduleEventId = `schedule_${Date.now()}_${Math.random().toString(36).slice(2)}`

  // Reemplazar el event_id temporal de la nota con el real
  const finalPayload = { ...payload, nota: payload.nota.replace(/schedule_\d+_bk/, scheduleEventId), event_id: scheduleEventId }

  // Petición al webhook y timer mínimo de 2.5s para la "carga bonita"
  await Promise.all([
    fetch(import.meta.env.VITE_QUALIFICATION_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload),
    }).catch(() => {}),
    new Promise(resolve => setTimeout(resolve, 2500))
  ])
  
  clearTimeout(textInterval)

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

const onKeydown = (e: KeyboardEvent) => { 
  if (e.key === 'Escape' && !submitting.value) {
    if (showLeaveWarning.value) forceClose()
    else attemptClose()
  } 
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

watch(() => props.open, (v) => { 
  if (v) { 
    touched.value = false; 
    currentStep.value = 1; 
    showLeaveWarning.value = false;
    form.value = { situacion: '', area: '', detalle: '', invertir: '', consent: false } 
  } 
})
</script>

<template>
  <Teleport to="body">
    <Transition name="cal-fade">
      <div v-if="props.open" class="cal-overlay" @click.self="attemptClose" role="dialog" aria-modal="true" aria-labelledby="cal-title">
        <div class="cal-modal">

          <button v-if="!submitting" class="cal-close" @click="attemptClose" aria-label="Cerrar">
            <i class="fa-solid fa-xmark"></i>
          </button>

          <!-- ── ALERTA DE ABANDONO ────────────────────────────────────────── -->
          <div v-if="showLeaveWarning" class="cal-warning-state">
            <div class="cal-warning-icon">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h2 class="cal-warning-title">¿Seguro que quieres irte?</h2>
            <p class="cal-warning-text">Estás a un paso de <strong>resolver tu problema contable</strong> y asegurar la salud financiera de tu negocio. Los turnos para la Sesión Gratuita son muy limitados y podrías perder esta oportunidad.</p>
            <button class="cal-btn cal-btn--warning" @click="showLeaveWarning = false">
              <i class="fa-solid fa-shield-halved"></i>
              QUIERO RESOLVER ESTO Y CONTINUAR
            </button>
            <button class="cal-warning-link" @click="forceClose"><i class="fa-solid fa-arrow-right-from-bracket"></i> Sí, salir y rendirme</button>
          </div>

          <!-- ── PANTALLA DE CARGA (Loading Interactivo) ────────────────── -->
          <div v-else-if="submitting" class="cal-loading-state">
            <div class="cal-loading-ring">
              <img :src="brandLogo" alt="Hellen Bermeo" class="cal-loading-logo" />
              <svg class="cal-spinner-lg" viewBox="0 0 50 50">
                <circle class="path" cx="25" cy="25" r="22" fill="none" stroke-width="2.5"></circle>
              </svg>
            </div>
            <h3 class="cal-loading-title">{{ loadingText }}</h3>
            <p class="cal-loading-subtitle">Estamos preparando la información para ti.</p>
          </div>

          <!-- ── FORMULARIO (Se oculta mientras carga o alerta) ───────────── -->
          <div v-else>
            <div class="cal-header cal-wizard-header">
              <button v-if="currentStep > 1" type="button" class="cal-back" @click="prevStep" aria-label="Atrás">
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              <img :src="brandLogo" alt="Hellen Bermeo" class="cal-logo" />
              

              <h2 id="cal-title" class="cal-title">
                Cuéntanos sobre<br>
                <span class="cal-accent">tu negocio</span>
              </h2>

              <div class="cal-progress">
                <div class="cal-progress-bar" :style="{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }"></div>
              </div>
              <p class="cal-eyebrow">Paso {{ currentStep }} de {{ TOTAL_STEPS }}</p>
            </div>

            <form class="cal-form" @submit.prevent="handleSubmit" novalidate>
              <Transition name="slide-fade" mode="out-in">

                <!-- STEP 1 — Situación + Área + Problema -->
                <div v-if="currentStep === 1" key="step1" class="cal-step" style="display:flex; flex-direction:column; gap:24px;">
                  <fieldset class="cal-fieldset" :class="{ 'has-error': touched && !form.situacion }">
                    <legend class="cal-legend">
                      <span class="cal-q-num">01</span>
                      <span><i class="fa-solid fa-store cal-legend-icon"></i> ¿Cuál es tu situación actual como contribuyente? *</span>
                    </legend>
                    <div class="cal-options">
                      <label v-for="opt in [
                        { value: 'emprendedor', label: 'Emprendedor (Persona Natural)' },
                        { value: 'pyme', label: 'Dueño de Negocio / Pyme (Sociedad)' },
                        { value: 'profesional', label: 'Profesional Independiente' },
                        { value: 'empezar', label: 'Aún no tengo RUC, quiero empezar.' }
                      ]" :key="opt.value" class="cal-option" :class="{ selected: form.situacion === opt.value }" :style="{ '--opt-delay': '0ms' }">
                        <input type="radio" name="situacion" v-model="form.situacion" :value="opt.value" hidden />
                        <span class="cal-option__radio" aria-hidden="true" />
                        <span class="cal-option__label">{{ opt.label }}</span>
                      </label>
                    </div>
                    <span v-if="touched && !form.situacion" class="cal-error">Selecciona una opción</span>
                  </fieldset>

                  <fieldset class="cal-fieldset" :class="{ 'has-error': touched && !form.area }">
                    <legend class="cal-legend">
                      <span class="cal-q-num">02</span>
                      <span><i class="fa-solid fa-bullseye cal-legend-icon"></i> ¿En qué área necesitas apoyo inmediato? *</span>
                    </legend>
                    <div class="cal-options">
                      <label v-for="opt in [
                        { value: 'tributario', label: 'Cumplimiento Tributario (Declaraciones, SRI)' },
                        { value: 'gestion', label: 'Gestión y Formalización (RUC, Firma)' },
                        { value: 'estrategia', label: 'Estrategia y Ahorro (Optimizar impuestos)' },
                        { value: 'seguro', label: 'No estoy seguro (Necesito diagnóstico)' }
                      ]" :key="opt.value" class="cal-option" :class="{ selected: form.area === opt.value }">
                        <input type="radio" name="area" v-model="form.area" :value="opt.value" hidden />
                        <span class="cal-option__radio" aria-hidden="true" />
                        <span class="cal-option__label">{{ opt.label }}</span>
                      </label>
                    </div>
                    <span v-if="touched && !form.area" class="cal-error">Selecciona una opción</span>
                  </fieldset>

                  <!-- ── PROBLEMA TEXTAREA (KEY) ──────────────────────────── -->
                  <div class="cal-problema-card">
                    <div class="cal-problema-header">
                      <span class="cal-q-num">03</span>
                      <span class="cal-problema-title">
                        <i class="fa-solid fa-pen cal-legend-icon"></i>
                        Cuéntanos tu problema en detalle *
                      </span>
                    </div>
                    <p class="cal-problema-hint">
                      Describe tu situación actual — entre más detalles, mejor podremos ayudarte
                    </p>
                    <div class="cal-textarea-wrap" :class="{ 'has-count': form.detalle.length > 0 }">
                      <textarea
                        v-model="form.detalle"
                        class="cal-textarea cal-textarea--problema"
                        placeholder="Ej. Tengo facturas atrasadas del SRI, no he declarado los últimos meses y necesito regularizar mi situación antes de que me multen..."
                        :class="{ 'error': touched && wordCount > 0 && wordCount < 15 }"
                        rows="5"
                      ></textarea>
                      <div class="cal-textarea-footer">
                        <span v-if="wordCount === 0" class="cal-word-neutral">
                          <i class="fa-regular fa-pen-to-square"></i> Escribe al menos 15 palabras
                        </span>
                        <span v-else-if="wordCount < 15" class="cal-word-hint">
                          <i class="fa-solid fa-circle-exclamation"></i>
                          Te faltan {{ 15 - wordCount }} palabras
                        </span>
                        <span v-else class="cal-word-ok">
                          <i class="fa-solid fa-circle-check"></i>
                          {{ wordCount }} palabras — ¡gracias por el detalle!
                        </span>
                      </div>
                    </div>
                    <span v-if="touched && wordCount === 0" class="cal-error">Por favor descríbenos tu caso para poder ayudarte.</span>
                  </div>

                  <div style="margin-top: 6px;">
                    <button class="cal-btn" type="button" @click="nextStep" :disabled="!isValidStep(1)">
                      <i class="fa-solid fa-arrow-right"></i>
                      AVANZAR AL ÚLTIMO PASO
                    </button>
                  </div>
                </div>

                <!-- STEP 2 — Inversión $1,000 + Consent -->
                <div v-else-if="currentStep === 2" key="step2" class="cal-step" style="display:flex; flex-direction:column; gap:24px;">

                  <!-- Investment hero card -->
                  <div class="cal-invest-hero">
                    <div class="cal-invest-hero__icon">
                      <i class="fa-solid fa-hand-holding-dollar"></i>
                    </div>
                    <h3 class="cal-invest-hero__title">¿Estás listo para invertir en tu negocio?</h3>
                    <p class="cal-invest-hero__text">
                      Nuestros servicios profesionales requieren una inversión <strong>mínima de $1,000</strong>.
                      Queremos asegurarnos de que sea el momento adecuado para ti.
                    </p>
                  </div>

                  <fieldset class="cal-fieldset" :class="{ 'has-error': touched && !form.invertir }">
                    <legend class="cal-legend">
                      <span class="cal-q-num">04</span>
                      <span><i class="fa-solid fa-coins cal-legend-icon"></i> ¿Cuentas con mínimo $1,000 para invertir en tu estabilidad financiera? *</span>
                    </legend>
                    <div class="cal-options">
                      <label v-for="opt in [
                        { value: 'listo', label: 'Sí, tengo el presupuesto y quiero agendar mi asesoría', sub: 'Inversión desde $1,000' },
                        { value: 'nolisto', label: 'No, mi presupuesto es menor por ahora', sub: 'Te orientamos con recursos gratuitos' }
                      ]" :key="opt.value" class="cal-option cal-option--invest" :class="{ selected: form.invertir === opt.value }">
                        <input type="radio" name="invertir" v-model="form.invertir" :value="opt.value" hidden />
                        <span class="cal-option__radio" aria-hidden="true" />
                        <span class="cal-option__content">
                          <span class="cal-option__label">{{ opt.label }}</span>
                          <span class="cal-option__sub">{{ opt.sub }}</span>
                        </span>
                      </label>
                    </div>
                    <span v-if="touched && !form.invertir" class="cal-error">Selecciona una opción</span>
                  </fieldset>

                  <!-- Consent -->
                  <fieldset class="cal-fieldset">
                    <label class="cal-consent" :class="{ 'has-error': touched && !form.consent }">
                      <input type="checkbox" v-model="form.consent" hidden />
                      <span class="cal-consent__box" :class="{ checked: form.consent }" aria-hidden="true">
                        <i v-if="form.consent" class="fa-solid fa-check"></i>
                      </span>
                      <span class="cal-consent__text">
                        Consiento que Hellen Bermeo me contacte para ofrecerme sus servicios. Además acepto sus
                        <RouterLink to="/politicas-privacidad" target="_blank" class="cal-link">políticas</RouterLink>.
                      </span>
                    </label>
                  </fieldset>

                  <button class="cal-btn" type="submit" :disabled="!isValidStep(2)">
                    <i class="fa-solid fa-calendar-check"></i>
                    CONFIRMAR Y VER DISPONIBILIDAD
                  </button>
                </div>

              </Transition>
            </form>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
@use '@/styles/colorVariables.module.scss' as colors;
@use '@/styles/fonts.modules.scss' as fonts;

$light: #ffffff;
$border: rgba(0, 0, 0, 0.1);
$input-bg: rgba(0, 0, 0, 0.03);
$text-muted: rgba(0, 0, 0, 0.6);
$text-body: rgba(0, 0, 0, 0.8);
$text-dark: #1e293b;

// ── Overlay ──────────────────────────────────────────────────────────────────
.cal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
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
  max-width: 540px;
  background: $light;
  border-radius: 20px;
  padding: 48px 36px 40px;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.15),
    0 4px 20px rgba(0, 0, 0, 0.05);
  max-height: 92vh;
  overflow-y: auto;

  @media (max-width: 540px) {
    padding: 40px 20px 32px;
    border-radius: 16px;
  }
}

.cal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
}

// ── Header ────────────────────────────────────────────────────────────────────
.cal-header {
  text-align: center;
  margin-bottom: 32px;
}

.cal-logo {
  height: 32px;
  width: auto;
  margin: 0 auto 24px;
  display: block;
}

.cal-eyebrow {
  font-family: fonts.$font-accent;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 3px;
  color: rgba(colors.$BRAND-PRIMARY, 0.8);
  margin: 0 0 12px;
}

.cal-title {
  font-family: fonts.$font-principal;
  font-size: clamp(1.6rem, 3.5vw, 2.1rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: $text-dark;
  margin: 0 0 12px;
}

.cal-accent {
  color: colors.$BRAND-PRIMARY;
}

.cal-subtitle {
  font-family: fonts.$font-secondary;
  font-size: 0.95rem;
  color: $text-muted;
  margin: 0 auto;
  line-height: 1.5;
  max-width: 90%;
}

// ── Form ──────────────────────────────────────────────────────────────────────
.cal-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.cal-fieldset {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cal-legend {
  font-family: fonts.$font-interface;
  font-size: 0.88rem;
  font-weight: 700;
  color: $text-dark;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 2px;
}

.cal-q-num {
  font-family: fonts.$font-accent;
  font-size: 0.7rem;
  font-weight: 800;
  color: colors.$white;
  background: colors.$BRAND-PRIMARY;
  border-radius: 6px;
  padding: 3px 8px;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  min-width: 32px;
  text-align: center;
}

.cal-options {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  margin-top: 10px;
}

.cal-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 12px;
  border: 2px solid rgba(0,0,0,0.06);
  background: white;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  height: 100%;
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);

  &:hover {
    border-color: rgba(colors.$BRAND-PRIMARY, 0.4);
    background: #f0f7ff; // azul light extra sutil
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.05);
  }

  &.selected {
    border-color: colors.$BRAND-PRIMARY;
    background: #eef5ff;
    box-shadow: 0 8px 24px rgba(colors.$BRAND-PRIMARY, 0.15);

    .cal-option__radio {
      border-color: colors.$BRAND-PRIMARY;
      background: white;

      &::after {
        opacity: 1;
        transform: scale(1);
      }
    }

    .cal-option__label {
      color: colors.$BRAND-PRIMARY;
      font-weight: 700;
    }
  }
}

.cal-option__radio {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid rgba(0,0,0,0.25);
  background: #f8fafc;
  flex-shrink: 0;
  position: relative;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-top: -1px;

  &::after {
    content: '';
    position: absolute;
    inset: 4px;
    border-radius: 50%;
    background: colors.$BRAND-PRIMARY;
    opacity: 0;
    transform: scale(0.4);
    transition: opacity 0.2s, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.cal-option__label {
  font-family: fonts.$font-secondary;
  font-size: 0.88rem;
  color: $text-dark;
  line-height: 1.4;
  font-weight: 500;
  transition: color 0.2s;
  flex: 1;
}

// ── Option with subtitle (invest step) ─────────────────────────────────────
.cal-option--invest {
  padding: 16px 18px;
  flex-direction: row;
}

.cal-option__content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.cal-option__sub {
  font-family: fonts.$font-interface;
  font-size: 0.75rem;
  color: rgba(0,0,0,0.45);
  font-weight: 400;
  transition: color 0.2s;
}

.cal-option.selected .cal-option__sub {
  color: rgba(colors.$BRAND-PRIMARY, 0.7);
}

// ── Legend icons ────────────────────────────────────────────────────────────
.cal-legend-icon {
  margin-right: 4px;
  font-size: 0.82rem;
  color: colors.$BRAND-PRIMARY;
}

.cal-error {
  font-family: fonts.$font-interface;
  font-size: 0.75rem;
  color: #dc2626; // red-600
  padding-left: 4px;
  font-weight: 500;
}

.has-error .cal-option {
  border-color: rgba(220, 38, 38, 0.4);
  background: rgba(220, 38, 38, 0.02);
}

// ── PROBLEMA CARD (STEP 1) ───────────────────────────────────────────────────
.cal-problema-card {
  background: linear-gradient(135deg, #f8faff 0%, #f0f5ff 100%);
  border: 2px solid rgba(colors.$BRAND-PRIMARY, 0.15);
  border-radius: 16px;
  padding: 24px 20px 20px;
  position: relative;
  transition: border-color 0.3s;

  &:focus-within {
    border-color: colors.$BRAND-PRIMARY;
    box-shadow: 0 0 0 4px rgba(colors.$BRAND-PRIMARY, 0.08);
  }
}

.cal-problema-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.cal-problema-title {
  font-family: fonts.$font-interface;
  font-size: 0.88rem;
  font-weight: 700;
  color: $text-dark;
  display: flex;
  align-items: center;
  gap: 6px;

  .cal-legend-icon {
    font-size: 0.85rem;
  }
}

.cal-problema-hint {
  font-family: fonts.$font-secondary;
  font-size: 0.8rem;
  color: rgba(0,0,0,0.5);
  margin: 0 0 8px;
  line-height: 1.4;
}

// ── TEXTAREA ─────────────────────────────────────────────────────────────────
.cal-textarea-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.has-count {
    .cal-textarea {
      min-height: 110px;
    }
  }
}

.cal-textarea {
  width: 100%;
  min-height: 120px;
  resize: vertical;
  padding: 14px 16px;
  border-radius: 12px;
  border: 2px solid rgba(0,0,0,0.08);
  background: white;
  font-family: fonts.$font-secondary;
  font-size: 0.92rem;
  color: $text-dark;
  line-height: 1.6;
  transition: all 0.25s;

  &:focus {
    outline: none;
    border-color: colors.$BRAND-PRIMARY;
    box-shadow: 0 0 0 4px rgba(colors.$BRAND-PRIMARY, 0.1);
  }

  &::placeholder {
    color: rgba(0,0,0,0.3);
  }

  &.error {
    border-color: #ef4444;
    background: #fef2f2;
    &:focus { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
  }
}

.cal-textarea--problema {
  min-height: 100px;

  &:focus {
    border-color: colors.$BRAND-PRIMARY;
    box-shadow: 0 0 0 4px rgba(colors.$BRAND-PRIMARY, 0.1), 0 4px 20px rgba(colors.$BRAND-PRIMARY, 0.06);
  }
}

.cal-textarea-footer {
  display: flex;
  justify-content: flex-end;
  font-family: fonts.$font-secondary;
  font-size: 0.78rem;
  font-weight: 500;
  gap: 6px;
  align-items: center;
}

.cal-word-hint {
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 4px;
}

.cal-word-ok {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 4px;
}

.cal-word-neutral {
  color: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  gap: 4px;
}

// ── INVEST HERO (STEP 2) ─────────────────────────────────────────────────────
.cal-invest-hero {
  text-align: center;
  padding: 28px 20px 22px;
  background: linear-gradient(135deg, #fefce8 0%, #fffbeb 50%, #fef3c7 100%);
  border: 1px solid #fde68a;
  border-radius: 16px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(colors.$BRAND-PRIMARY, 0.04);
    pointer-events: none;
  }
}

.cal-invest-hero__icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, colors.$BRAND-PRIMARY, darken(colors.$BRAND-PRIMARY, 10%));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  margin: 0 auto 16px;
  box-shadow: 0 6px 20px rgba(colors.$BRAND-PRIMARY, 0.25);
}

.cal-invest-hero__title {
  font-family: fonts.$font-principal;
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px;
  line-height: 1.3;
}

.cal-invest-hero__text {
  font-family: fonts.$font-secondary;
  font-size: 0.88rem;
  color: rgba(0,0,0,0.55);
  margin: 0;
  line-height: 1.55;
  max-width: 90%;
  margin: 0 auto;

  strong {
    color: #92400e;
    font-weight: 700;
  }
}

// ── Consent ───────────────────────────────────────────────────────────────────
.cal-consent {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.06);

  &.has-error {
    border-color: rgba(220, 38, 38, 0.4);
    background: rgba(220, 38, 38, 0.03);

    .cal-consent__box {
      border-color: rgba(220, 38, 38, 0.6);
    }
  }
}

.cal-consent__box {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid rgba(0,0,0,0.25);
  flex-shrink: 0;
  margin-top: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: colors.$white;
  background: white;

  &.checked {
    background: colors.$BRAND-PRIMARY;
    border-color: colors.$BRAND-PRIMARY;
  }
}

.cal-consent__text {
  font-family: fonts.$font-interface;
  font-size: 0.78rem;
  color: $text-muted;
  line-height: 1.55;
}

.cal-link {
  color: colors.$BRAND-PRIMARY;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 600;
  transition: color 0.2s;

  &:hover { color: darken(colors.$BRAND-PRIMARY, 10%); }
}

// ── Button ────────────────────────────────────────────────────────────────────
.cal-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px 24px;
  font-family: fonts.$font-interface;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: colors.$white;
  background: colors.$BRAND-PRIMARY;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(colors.$BRAND-PRIMARY, 0.25);
  transition: transform 0.2s ease, box-shadow 0.25s ease, background 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(colors.$BRAND-PRIMARY, 0.35);
    background: lighten(colors.$BRAND-PRIMARY, 5%);
  }

  &:active:not(:disabled) { transform: translateY(0); }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: #94a3b8;
    box-shadow: none;
  }
}

@keyframes spin { to { transform: rotate(360deg); } }
.cal-spinner { animation: spin 0.8s linear infinite; }

// ── LOADING STATE DE INTERFAZ BONITA ─────────────────────────────────────────

.cal-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 380px;
  animation: fadeIn 0.4s ease-out;
}

.cal-loading-ring {
  position: relative;
  width: 100px;
  height: 100px;
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cal-loading-logo {
  position: absolute;
  height: 24px;
  width: auto;
  z-index: 2;
  animation: pulseLogo 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.cal-spinner-lg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: rotate 2s linear infinite;
  z-index: 1;

  .path {
    stroke: colors.$BRAND-PRIMARY;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }
}

.cal-loading-title {
  font-family: fonts.$font-principal;
  font-weight: 800;
  font-size: 1.35rem;
  color: $text-dark;
  margin: 0 0 10px;
  text-align: center;
}

.cal-loading-subtitle {
  font-family: fonts.$font-secondary;
  font-size: 0.95rem;
  color: $text-muted;
  margin: 0;
  text-align: center;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulseLogo {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.95); }
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}

// ── CUSTOM WARNING STATE ──────────────────────────────────────────────────────
.cal-warning-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
  min-height: 380px;
  animation: fadeIn 0.4s ease-out;

  .cal-warning-icon {
    width: 80px;
    height: 80px;
    background: #fffbeb; // yellow-50
    color: #d97706; // amber-600
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    border: 4px solid #fef3c7; // yellow-100
  }

  .cal-warning-title {
    font-family: fonts.$font-principal;
    font-size: 1.8rem;
    font-weight: 800;
    color: $text-dark;
    margin: 0 0 12px;
  }

  .cal-warning-text {
    font-family: fonts.$font-secondary;
    font-size: 1.05rem;
    color: $text-muted;
    line-height: 1.6;
    margin: 0 0 32px;
    max-width: 400px;
  }

  .cal-btn--warning {
    background: colors.$BRAND-PRIMARY;
    margin-bottom: 16px;
    animation: cta-pulse 2s infinite;
  }

  .cal-warning-link {
    background: none;
    border: none;
    font-family: fonts.$font-secondary;
    font-weight: 600;
    font-size: 0.9rem;
    color: #94a3b8;
    text-decoration: underline;
    cursor: pointer;
    transition: color 0.2s;
    padding: 8px;

    &:hover {
      color: #64748b;
    }
  }
}

// ── HEADER DEL WIZARD ────────────────────────────────────────────────────────
.cal-wizard-header {
  position: relative;

  .cal-logo {
    height: 28px;
    margin-bottom: 24px;
    margin-top: 12px;
  }
}

.cal-back {
  position: absolute;
  top: 12px;
  left: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:hover {
    background: #e2e8f0;
    color: #0f172a;
  }
}

.cal-progress {
  width: 100%;
  height: 4px;
  background: rgba(0,0,0,0.05);
  border-radius: 4px;
  margin-bottom: 12px;
  overflow: hidden;
}

.cal-progress-bar {
  height: 100%;
  background: colors.$BRAND-PRIMARY;
  transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border-radius: 4px;
}

// ── SLIDE WIZARD ───────────────────────────────────────────────────────────────
.cal-step {
  display: flex;
  flex-direction: column;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

// ── Transición Global Modal ──────────────────────────────────────────────────
.cal-fade-enter-active {
  transition: opacity 0.3s ease;

  .cal-modal {
    transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.34, 1.4, 0.64, 1);
  }
}

.cal-fade-leave-active {
  transition: opacity 0.25s ease;

  .cal-modal {
    transition: opacity 0.2s ease, transform 0.25s ease;
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
