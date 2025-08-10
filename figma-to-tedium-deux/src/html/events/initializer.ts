// Component set initialization logic
export function createComponentSetInitializer(): string {
  return `
      // Initialize component set variants - handle both single and multiple variants
      // Handle both COMPONENT_SET and COMPONENT elements that contain variants
      // With the new 1:1 structure, this will handle nested component sets correctly
      const componentSets = document.querySelectorAll('[data-figma-type="COMPONENT_SET"], [data-figma-type="COMPONENT"]');
      componentSets.forEach(componentSet => {
        // Find all COMPONENT children - these are the variants
        // Some may have explicit variant attributes, others are variants by hierarchy
        const variants = componentSet.querySelectorAll('[data-figma-type="COMPONENT"]');
        
        // Handle both single and multiple variants
        if (variants.length >= 1) {
          console.log('Initializing component set/instance with', variants.length, 'variants:', {
            componentSetId: componentSet.getAttribute('data-figma-id'),
            componentSetName: componentSet.getAttribute('data-figma-name'),
            componentSetType: componentSet.getAttribute('data-figma-type'),
            parentType: componentSet.parentElement?.getAttribute('data-figma-type'),
            parentId: componentSet.parentElement?.getAttribute('data-figma-id'),
            variantIds: Array.from(variants).map(v => v.getAttribute('data-figma-id'))
          });
          
          // Reset opacity for all variants to ensure clean initial state
          variants.forEach(variant => {
            variant.style.opacity = '1'; // Ensure all variants start with opacity 1
          });
          
          // For single components, just make them visible
          if (variants.length === 1) {
            const singleVariant = variants[0];
            singleVariant.classList.add('variant-active');
            singleVariant.classList.remove('variant-hidden');
            console.log('Set single variant as active:', singleVariant.getAttribute('data-figma-id'), 'in component set:', componentSet.getAttribute('data-figma-id'));
          } else {
            // For multiple variants, the FIRST variant should be active initially (where reactions are)
            // This ensures the animation starts from the variant with reactions
            variants.forEach((variant, index) => {
              if (index === 0) {
                variant.classList.add('variant-active');
                variant.classList.remove('variant-hidden');
                console.log('Set first variant as active (with reactions):', variant.getAttribute('data-figma-id'), 'in component set:', componentSet.getAttribute('data-figma-id'));
              } else {
                variant.classList.add('variant-hidden');
                variant.classList.remove('variant-active');
                console.log('Set variant as hidden:', variant.getAttribute('data-figma-id'), 'in component set:', componentSet.getAttribute('data-figma-id'));
              }
            });
          }
        }
      });
  `;
}
