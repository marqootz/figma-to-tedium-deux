// Component set initialization logic
export function createComponentSetInitializer(): string {
  return `
      // Initialize component set variants - handle both single and multiple variants
      // Handle both COMPONENT_SET and COMPONENT elements that contain variants
      // With the new 1:1 structure, this will handle nested component sets correctly
      const componentSets = document.querySelectorAll('[data-figma-type="COMPONENT_SET"], [data-figma-type="COMPONENT"]');
      componentSets.forEach(componentSet => {
        // CRITICAL: Position the component set container at 0px top/left
        // This ensures all variants within it are positioned relative to 0px, not the original Figma position
        componentSet.style.position = 'relative';
        componentSet.style.top = '0px';
        componentSet.style.left = '0px';
        componentSet.style.transform = 'none';
        componentSet.style.transition = '';
        
        console.log('DEBUG: Positioned component set at 0px top/left:', componentSet.getAttribute('data-figma-id'));
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
          
          // CRITICAL: Position all variants at 0px top/left and reset any residual styling
          variants.forEach(variant => {
            // Reset any residual styling from previous animations
            variant.style.position = 'relative';
            variant.style.top = '0px';
            variant.style.left = '0px';
            variant.style.transform = 'none';
            variant.style.transition = '';
            variant.style.opacity = '1'; // Ensure all variants start with opacity 1
            
            // Also reset all nested elements within each variant
            const nestedElements = variant.querySelectorAll('[data-figma-id]');
            nestedElements.forEach(nestedElement => {
              (nestedElement as HTMLElement).style.position = 'relative';
              (nestedElement as HTMLElement).style.top = '0px';
              (nestedElement as HTMLElement).style.left = '0px';
              (nestedElement as HTMLElement).style.transform = 'none';
              (nestedElement as HTMLElement).style.transition = '';
            });
            
            console.log('DEBUG: Positioned variant at 0px top/left:', variant.getAttribute('data-figma-id'));
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
