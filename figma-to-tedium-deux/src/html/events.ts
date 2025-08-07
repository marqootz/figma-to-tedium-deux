import { FigmaNode, Reaction, VariantProperties } from '../types';

// Utility functions
function safeHasProperty(obj: any, prop: string): boolean {
  return obj && typeof obj === 'object' && prop in obj;
}

function safeToString(value: any): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Event attribute generation
export function generateReactionAttributes(node: FigmaNode): Record<string, string> {
  const attributes: Record<string, string> = {};
  
  if (safeHasProperty(node, 'reactions') && (node as any).reactions && (node as any).reactions.length > 0) {
    const reactions = (node as any).reactions as Reaction[];
    const firstReaction = reactions[0];
    
    if (firstReaction) {
      attributes['data-has-reactions'] = 'true';
      attributes['data-reaction-count'] = String(reactions.length);
      
      if (firstReaction.trigger) {
        attributes['data-reaction-trigger'] = escapeHtmlAttribute(JSON.stringify(firstReaction.trigger));
      }
      
      if (firstReaction.action && firstReaction.action.type) {
        attributes['data-reaction-action-type'] = firstReaction.action.type;
        
        if (firstReaction.action.destinationId) {
          attributes['data-reaction-destination'] = firstReaction.action.destinationId;
        }
      }
      
      if (firstReaction.transition && firstReaction.transition.type) {
        attributes['data-reaction-transition-type'] = firstReaction.transition.type;
        if (firstReaction.transition.duration) {
          attributes['data-reaction-transition-duration'] = String(firstReaction.transition.duration);
        }
      }
    }
  }
  
  return attributes;
}

export function generateVariantAttributes(node: FigmaNode): Record<string, string> {
  const attributes: Record<string, string> = {};
  
  if (safeHasProperty(node, 'variantProperties') && (node as any).variantProperties) {
    const variantProps = (node as any).variantProperties as VariantProperties;
    
    Object.entries(variantProps).forEach(([key, value]) => {
      const cleanKey = key.toLowerCase().replace(/\s+/g, '-');
      attributes[`data-variant-${cleanKey}`] = escapeHtmlAttribute(safeToString(value));
    });
  }
  
  return attributes;
}

// Event JavaScript generation
export function generateEventHandlingJavaScript(): string {
  return `
    // Event handling for interactive elements
    document.addEventListener('DOMContentLoaded', function() {
      // Handle variant switching - support both data-variant and data-variant-property-* attributes
      const variantButtons = document.querySelectorAll('[data-variant], [data-variant-property-1]');
      variantButtons.forEach(button => {
        button.addEventListener('click', function() {
          const variant = this.getAttribute('data-variant') || this.getAttribute('data-variant-property-1');
          const targetId = this.getAttribute('data-target');
          
          if (targetId) {
            const target = document.querySelector(\`[data-figma-id="\${targetId}"]\`);
            if (target) {
              // Hide all variants
              target.querySelectorAll('[data-variant], [data-variant-property-1]').forEach(el => {
                el.classList.add('variant-hidden');
                el.classList.remove('variant-active');
              });
              
              // Show selected variant
              const selectedVariant = target.querySelector(\`[data-variant="\${variant}"], [data-variant-property-1="\${variant}"]\`);
              if (selectedVariant) {
                selectedVariant.classList.add('variant-active');
                selectedVariant.classList.remove('variant-hidden');
              }
            }
          }
        });
      });
      
      // Handle reactions - both click and timeout
      const reactionElements = document.querySelectorAll('[data-has-reactions="true"]');
      reactionElements.forEach(element => {
        const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');
        const actionType = element.getAttribute('data-reaction-action-type');
        const destinationId = element.getAttribute('data-reaction-destination');
        const transitionType = element.getAttribute('data-reaction-transition-type');
        const transitionDuration = element.getAttribute('data-reaction-transition-duration');
        
        // Handle timeout reactions
        if (trigger.type === 'AFTER_TIMEOUT') {
          setTimeout(() => {
            handleReaction(element, destinationId, transitionType, transitionDuration);
          }, (trigger.timeout || 0) * 1000);
        }
        
        // Handle click reactions
        element.addEventListener('click', function() {
          if (trigger.type === 'ON_CLICK') {
            handleReaction(this, destinationId, transitionType, transitionDuration);
          }
        });
      });
      
      // Helper function to handle reaction transitions
      function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {
        if (destinationId) {
          const destination = document.querySelector(\`[data-figma-id="\${destinationId}"]\`);
          if (destination) {
            // Handle different transition types
            if (transitionType === 'DISSOLVE') {
              // Dissolve transition
              sourceElement.style.opacity = '0';
              setTimeout(() => {
                sourceElement.classList.add('variant-hidden');
                sourceElement.classList.remove('variant-active');
                destination.classList.add('variant-active');
                destination.classList.remove('variant-hidden');
                destination.style.opacity = '1';
              }, parseFloat(transitionDuration || '300'));
            } else if (transitionType === 'SMART_ANIMATE') {
              // Smart animate transition
              sourceElement.style.opacity = '0';
              destination.style.opacity = '1';
              setTimeout(() => {
                sourceElement.classList.add('variant-hidden');
                sourceElement.classList.remove('variant-active');
                destination.classList.add('variant-active');
                destination.classList.remove('variant-hidden');
              }, parseFloat(transitionDuration || '300'));
            } else {
              // Default transition - simple show/hide using CSS classes
              sourceElement.classList.add('variant-hidden');
              sourceElement.classList.remove('variant-active');
              destination.classList.add('variant-active');
              destination.classList.remove('variant-hidden');
            }
          }
        }
      }
      
      // Initialize component set variants - hide all but the first one
      const componentSets = document.querySelectorAll('[data-figma-type="COMPONENT_SET"]');
      componentSets.forEach(componentSet => {
        const variants = componentSet.querySelectorAll('[data-variant-property-1]');
        if (variants.length > 1) {
          console.log('Initializing component set with', variants.length, 'variants');
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
    });
  `;
} 