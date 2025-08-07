// Variant switching handler
export function createVariantSwitchingHandler(): string {
  return `
      // Handle variant switching - support both data-variant and data-variant-property-* attributes
      const variantButtons = document.querySelectorAll('[data-variant], [data-variant-property-1]');
      variantButtons.forEach(button => {
        button.addEventListener('click', function() {
          const variant = this.getAttribute('data-variant') || this.getAttribute('data-variant-property-1');
          const targetId = this.getAttribute('data-target');
          
          if (targetId) {
            const target = document.querySelector(\`[data-figma-id="\${targetId}"]\`);
            if (target) {
              // Reset opacity for all variants to ensure clean state
              target.querySelectorAll('[data-variant], [data-variant-property-1]').forEach(el => {
                el.style.opacity = '1'; // Reset opacity to 1 for all variants
                el.classList.add('variant-hidden');
                el.classList.remove('variant-active');
              });
              
              // Show selected variant
              const selectedVariant = target.querySelector(\`[data-variant="\${variant}"], [data-variant-property-1="\${variant}"]\`);
              if (selectedVariant) {
                selectedVariant.style.opacity = '1'; // Ensure selected variant has opacity 1
                selectedVariant.classList.add('variant-active');
                selectedVariant.classList.remove('variant-hidden');
              }
            }
          }
        });
      });
  `;
}
