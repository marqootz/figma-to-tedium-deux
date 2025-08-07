// Component set initialization logic
export function createComponentSetInitializer(): string {
  return `
      // Initialize component set variants - hide all but the first one
      const componentSets = document.querySelectorAll('[data-figma-type="COMPONENT_SET"]');
      componentSets.forEach(componentSet => {
        const variants = componentSet.querySelectorAll('[data-variant-property-1]');
        if (variants.length > 1) {
          console.log('Initializing component set with', variants.length, 'variants');
          // Reset opacity for all variants to ensure clean initial state
          variants.forEach(variant => {
            variant.style.opacity = '1'; // Ensure all variants start with opacity 1
          });
          // The first variant should already have variant-active class
          // All others should have variant-hidden class
          variants.forEach((variant, index) => {
            if (index === 0) {
              variant.classList.add('variant-active');
              variant.classList.remove('variant-hidden');
            } else {
              variant.classList.add('variant-hidden');
              variant.classList.remove('variant-active');
            }
          });
        }
      });
  `;
}
