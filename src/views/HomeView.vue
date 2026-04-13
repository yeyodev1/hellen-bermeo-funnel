<script setup lang="ts">
import TheHero from '@/components/TheHero.vue'
import TheStrategies from '@/components/TheStrategies.vue'
import TheTestimonials from '@/components/TheTestimonials.vue'
import TheTeam from '@/components/TheTeam.vue'
import TheContact from '@/components/TheContact.vue'
</script>

<template>
  <main class="home" itemscope itemtype="https://schema.org/WebPage">
    <section id="inicio" aria-label="Hellen Bermeo - Agencia de Marketing Digital en Ecuador">
      <TheHero />
    </section>
    <section id="servicios" aria-label="Servicios de marketing digital y metodología de crecimiento">
      <TheStrategies />
    </section>
    <section id="testimonios" aria-label="Testimonios de clientes de Hellen Bermeo Ecuador">
      <TheTestimonials />
    </section>
    <section id="nosotros" aria-label="Equipo fundador de Hellen Bermeo">
      <TheTeam />
    </section>
    <TheContact />
  </main>
</template>

<style lang="scss" scoped>
@use '@/styles/colorVariables.module.scss' as colors;

.home {
  margin-top: -56px;
  /* Para compensar el margin-top del header en App.vue */
  background-color: colors.$BRAND-DARK;
  /* Continuar con el tema oscuro del final del Hero */
}
</style>
