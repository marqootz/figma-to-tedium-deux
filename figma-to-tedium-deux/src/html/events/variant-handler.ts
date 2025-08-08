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
              console.log('Variant switch clicked:', { variant, targetId, targetName: target.getAttribute('data-figma-name') });
              
              // Find the specific component set that contains this button
              // This ensures nested components switch their own variants, not the top-level
              let componentSet = target;
              let buttonElement = this;
              
              // Walk up the DOM tree to find the immediate component set parent
              while (buttonElement && buttonElement.parentElement) {
                buttonElement = buttonElement.parentElement;
                if (buttonElement.getAttribute('data-figma-type') === 'COMPONENT_SET') {
                  componentSet = buttonElement;
                  break;
                }
              }
              
              console.log('Found component set for switching:', componentSet.getAttribute('data-figma-id'));
              
              // CRITICAL FIX: Only affect variants within this specific component set instance
              // Use the componentSet's direct children to ensure we don't affect other instances
              const allVariants = Array.from(componentSet.children).filter(child => 
                child.getAttribute('data-figma-type') === 'COMPONENT' &&
                (child.getAttribute('data-variant') || child.getAttribute('data-variant-property-1'))
              );
              
              console.log('Found', allVariants.length, 'variants in this component set instance');
              
              // Reset opacity for all variants in this specific component set instance
              allVariants.forEach(el => {
                el.style.opacity = '1'; // Reset opacity to 1 for all variants
                el.classList.add('variant-hidden');
                el.classList.remove('variant-active');
                console.log('Hidden variant:', el.getAttribute('data-figma-id'));
              });
              
              // Show selected variant in this specific component set instance
              const selectedVariant = allVariants.find(el => 
                el.getAttribute('data-variant') === variant || 
                el.getAttribute('data-variant-property-1') === variant
              );
              
              if (selectedVariant) {
                selectedVariant.style.opacity = '1'; // Ensure selected variant has opacity 1
                selectedVariant.classList.add('variant-active');
                selectedVariant.classList.remove('variant-hidden');
                console.log('Switched to variant:', variant, 'in component set:', componentSet.getAttribute('data-figma-id'));
              } else {
                console.log('Selected variant not found:', variant, 'in component set:', componentSet.getAttribute('data-figma-id'));
              }
            }
          }
        });
      });
  `;
}
