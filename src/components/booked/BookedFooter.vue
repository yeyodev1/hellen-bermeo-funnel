<script setup lang="ts">
/**
 * BookedFooter.vue
 * Final section with legal links and copyright.
 */
</script>

<template>
  <footer class="booked-footer">
    <!-- Navegación Legal -->
    <nav class="booked-footer__links" aria-label="Legal">
      <router-link to="/politicas-privacidad" class="booked-footer__link">
        Política de Privacidad
      </router-link>
      <span class="booked-footer__separator" aria-hidden="true">·</span>
      <router-link to="/aviso-legal" class="booked-footer__link">
        Aviso Legal
      </router-link>
    </nav>

    <!-- Información de Copyright -->
    <p class="booked-footer__copy">
      © {{ new Date().getFullYear() }} Hellen Bermeo. 
      <br class="mobile-break" />
      Todos los derechos reservados.
    </p>

    <!-- Aviso Legal Completo -->
    <div class="booked-footer__disclaimer">
      Esta página web es operada y mantenida por Hellen Bermeo. El uso del sitio web se rige por nuestros Términos de Servicio y Política de Privacidad. Hellen Bermeo es una firma dedicada a la asesoría contable, tributaria y financiera para emprendedores y empresas. No somos una entidad bancaria ni ofrecemos préstamos, inversiones financieras o sistemas de "enriquecimiento rápido". Nuestro objetivo es proporcionar herramientas y estrategias para el cumplimiento legal y la optimización de recursos; sin embargo, no garantizamos resultados económicos específicos, ya que estos dependen de la gestión administrativa, el mercado y las decisiones de cada cliente.
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use '@/styles/colorVariables.module.scss' as colors;
@use '@/styles/fonts.modules.scss' as fonts;

.booked-footer {
  width: 100%;
  padding: 2.5rem 1.5rem 3.5rem;
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: transparent;
  margin-top: auto;

  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }

  &__links {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.85rem;
    margin-bottom: 1.25rem;

    @media (min-width: 768px) {
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
  }

  &__link {
    @include fonts.interface-font(500);
    font-size: 0.72rem;
    color: #64748b;
    text-decoration: none;
    transition: all 0.3s ease;
    letter-spacing: 0.4px;

    &:hover {
      color: colors.$BRAND-PRIMARY;
      text-shadow: none;
    }

    @media (min-width: 768px) {
      font-size: 0.85rem;
    }
  }

  &__separator {
    color: rgba(0, 0, 0, 0.1);
    font-size: 1rem;
    line-height: 1;
  }

  &__copy {
    @include fonts.interface-font(500);
    font-size: 0.65rem;
    color: #94a3b8;
    margin: 0;
    line-height: 1.8;
    text-transform: uppercase;
    letter-spacing: 1.2px;

    @media (min-width: 768px) {
      font-size: 0.72rem;
      letter-spacing: 1.5px;
    }
  }

  &__disclaimer {
    @include fonts.interface-font(400);
    font-size: 0.65rem;
    color: #94a3b8;
    line-height: 1.6;
    max-width: 600px;
    margin: 1.5rem auto 0;
    text-align: center;
    text-transform: none;
    letter-spacing: normal;
  }
}

.mobile-break {
  @media (min-width: 640px) {
    display: none;
  }
}
</style>
