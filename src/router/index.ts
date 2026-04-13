import { createRouter, createWebHistory, type RouteMeta } from 'vue-router'
import FunnelView from '../views/FunnelView.vue'
import VideoView from '../views/VideoView.vue'
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue'
import LegalNoticeView from '../views/LegalNoticeView.vue'
import BookingView from '../views/BookingView.vue'
import BookedView from '../views/BookedView.vue'
import NoSpaceView from '../views/NoSpaceView.vue'

import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    description: string
    canonical: string
    ogTitle: string
    ogDescription: string
    ogUrl: string
    jsonLd?: object[]
  }
}

// ── Router ─────────────────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0, behavior: 'instant' }),
  routes: [
    {
      path: '/',
      alias: '/registro-vsl-tr',
      name: 'funnel',
      component: FunnelView,
      meta: {
        title: 'Hellen Bermeo | Asesoría Contable Especializada',
        description:
          'Tu tranquilidad financiera, en manos expertas. Gestión contable estratégica respaldada por especialistas en crecimiento empresarial.',
        canonical: 'https://mkt.hellenbermeo.ec/registro-vsl-tr',
        ogTitle: 'Hellen Bermeo | Asesoría Contable Especializada',
        ogDescription:
          'Tu tranquilidad financiera en manos expertas. Únete a Hellen Bermeo.',
        ogUrl: 'https://mkt.hellenbermeo.ec/registro-vsl-tr',
      } satisfies RouteMeta,
    },
    {
      path: '/ver-video',
      name: 'video',
      component: VideoView,
      meta: {
        title: 'Mira el video | Hellen Bermeo — Paso 1 de 2',
        description: 'Ve el video completo y descubre cómo podemos ayudarte.',
        canonical: 'https://mkt.hellenbermeo.ec/ver-video',
        ogTitle: 'Mira el video | Hellen Bermeo',
        ogDescription: 'Ve el video y agenda tu Cita Estratégica gratuita con el equipo de Hellen Bermeo.',
        ogUrl: 'https://mkt.hellenbermeo.ec/ver-video',
      } satisfies RouteMeta,
    },
    {
      path: '/agendar',
      name: 'booking',
      component: BookingView,
      meta: {
        title: 'Agenda tu Cita | Hellen Bermeo — Paso 2 de 2',
        description: 'Selecciona el día y hora para tu Cita Estratégica.',
        canonical: 'https://mkt.hellenbermeo.ec/agendar',
        ogTitle: 'Agenda tu Cita | Hellen Bermeo',
        ogDescription: 'Elige tu horario y reserva tu Cita Estratégica gratuita.',
        ogUrl: 'https://mkt.hellenbermeo.ec/agendar',
      } satisfies RouteMeta,
    },
    {
      path: '/cita-confirmada',
      name: 'booked',
      component: BookedView,
      meta: {
        title: 'Cita Confirmada | Hellen Bermeo',
        description: 'Tu cita está confirmada. Revisa tu correo y prepárate.',
        canonical: 'https://mkt.hellenbermeo.ec/cita-confirmada',
        ogTitle: 'Cita Confirmada | Hellen Bermeo',
        ogDescription: 'Tu cita con el equipo de Hellen Bermeo está reservada. Te contactaremos pronto.',
        ogUrl: 'https://mkt.hellenbermeo.ec/cita-confirmada',
      } satisfies RouteMeta,
    },
    {
      path: '/sin-espacio',
      name: 'no-space',
      component: NoSpaceView,
      meta: {
        title: 'Sin Espacio Disponible | Hellen Bermeo',
        description: 'En este momento los cupos de asesoría de Hellen Bermeo están completos. Te notificaremos cuando se libere un espacio.',
        canonical: 'https://mkt.hellenbermeo.ec/sin-espacio',
        ogTitle: 'Sin Espacio Disponible | Hellen Bermeo',
        ogDescription: 'Los cupos de asesoría están completos. Te avisaremos cuando haya disponibilidad.',
        ogUrl: 'https://mkt.hellenbermeo.ec/sin-espacio',
      } satisfies RouteMeta,
    },
    {
      path: '/politicas-privacidad',
      name: 'privacy-policy',
      component: PrivacyPolicyView,
      meta: {
        title: 'Política de Privacidad | Hellen Bermeo',
        description: 'Política de privacidad de Hellen Bermeo.',
        canonical: 'https://mkt.hellenbermeo.ec/politicas-privacidad',
        ogTitle: 'Política de Privacidad | Hellen Bermeo',
        ogDescription: 'Política de privacidad de Hellen Bermeo.',
        ogUrl: 'https://mkt.hellenbermeo.ec/politicas-privacidad',
      } satisfies RouteMeta,
    },
    {
      path: '/aviso-legal',
      name: 'legal-notice',
      component: LegalNoticeView,
      meta: {
        title: 'Aviso Legal | Hellen Bermeo',
        description: 'Aviso legal de Hellen Bermeo.',
        canonical: 'https://mkt.hellenbermeo.ec/aviso-legal',
        ogTitle: 'Aviso Legal | Hellen Bermeo',
        ogDescription: 'Aviso legal de Hellen Bermeo.',
        ogUrl: 'https://mkt.hellenbermeo.ec/aviso-legal',
      } satisfies RouteMeta,
    },
  ],
})

// ── SEO dinámico por ruta ──────────────────────────────────────────────────────
const setMeta = (name: string, content: string) => {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el) }
  el.content = content
}

const setOgMeta = (property: string, content: string) => {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el) }
  el.content = content
}

const setCanonical = (href: string) => {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) { el = document.createElement('link'); el.rel = 'canonical'; document.head.appendChild(el) }
  el.href = href
}

router.afterEach((to) => {
  const meta = to.meta
  document.title = meta.title ?? 'Hellen Bermeo'
  setMeta('description', meta.description ?? '')
  setOgMeta('og:title', meta.ogTitle ?? meta.title ?? '')
  setOgMeta('og:description', meta.ogDescription ?? meta.description ?? '')
  setOgMeta('og:url', meta.ogUrl ?? '')
  setOgMeta('twitter:title', meta.ogTitle ?? meta.title ?? '')
  setOgMeta('twitter:description', meta.ogDescription ?? meta.description ?? '')
  setCanonical(meta.canonical ?? '')
})

export default router
