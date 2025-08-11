// Variant switching handler - instant switching only, no animation
export function createVariantSwitchingHandler(): string {
  return `
      // Handle variant switching - instant switching only, no animation
      // This is a simple slideshow-like system that switches between variants instantly
      const variantButtons = document.querySelectorAll('[data-variant], [data-variant-property-1]');
      variantButtons.forEach(button => {
        button.addEventListener('click', function() {
          console.log('DEBUG: Variant switch clicked');
          
          const variant = this.getAttribute('data-variant') || this.getAttribute('data-variant-property-1');
          const targetId = this.getAttribute('data-target');
          
          if (targetId) {
            const target = document.querySelector(\`[data-figma-id="\${targetId}"]\`);
            if (target) {
              console.log('Variant switch:', { variant, targetId, targetName: target.getAttribute('data-figma-name') });
              
              // Find the specific component set that contains this button
              let componentSet = target;
              let buttonElement = this;
              
              // Walk up the DOM tree to find the immediate component set parent
              while (buttonElement && buttonElement.parentElement) {
                buttonElement = buttonElement.parentElement;
                if (buttonElement.getAttribute('data-figma-type') === 'COMPONENT_SET') {
                  componentSet = buttonElement;
                  console.log('Found component set for switching:', {
                    id: componentSet.getAttribute('data-figma-id'),
                    name: componentSet.getAttribute('data-figma-name')
                  });
                  break;
                }
              }
              
              // Get all variants within this specific component set instance
              const allVariants = Array.from(componentSet.children).filter(child => 
                child.getAttribute('data-figma-type') === 'COMPONENT' &&
                (child.getAttribute('data-variant') || child.getAttribute('data-variant-property-1'))
              );
              
              console.log('Found', allVariants.length, 'variants in component set:', componentSet.getAttribute('data-figma-id'));
              
              // INSTANT VARIANT SWITCHING - Hide all variants
              allVariants.forEach(variant => {
                variant.classList.add('variant-hidden');
                variant.classList.remove('variant-active');
                // Ensure all variants maintain their original positioning (relative with 0px)
                variant.style.position = 'relative';
                variant.style.top = '0px';
                variant.style.left = '0px';
                console.log('Hidden variant:', variant.getAttribute('data-figma-id'));
              });
              
              // Show selected variant instantly
              const selectedVariant = allVariants.find(v => 
                v.getAttribute('data-variant') === variant || 
                v.getAttribute('data-variant-property-1') === variant
              );
              
              if (selectedVariant) {
                selectedVariant.classList.add('variant-active');
                selectedVariant.classList.remove('variant-hidden');
                // Ensure selected variant maintains its original positioning
                selectedVariant.style.position = 'relative';
                selectedVariant.style.top = '0px';
                selectedVariant.style.left = '0px';
                console.log('Switched to variant:', variant, 'in component set:', componentSet.getAttribute('data-figma-id'));
                
                // Start timeout reactions for the newly active variant
                startTimeoutReactionsForNewlyActiveVariant(selectedVariant);
                startTimeoutReactionsForNestedComponents(selectedVariant);
              } else {
                console.log('Selected variant not found:', variant, 'in component set:', componentSet.getAttribute('data-figma-id'));
              }
            }
          }
        });
      });
  `;
}
