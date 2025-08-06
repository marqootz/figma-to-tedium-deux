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
      // Handle variant switching
      const variantButtons = document.querySelectorAll('[data-variant]');
      variantButtons.forEach(button => {
        button.addEventListener('click', function() {
          const variant = this.getAttribute('data-variant');
          const targetId = this.getAttribute('data-target');
          
          if (targetId) {
            const target = document.querySelector(\`[data-figma-id="\${targetId}"]\`);
            if (target) {
              // Hide all variants
              target.querySelectorAll('[data-variant]').forEach(el => {
                el.classList.add('variant-hidden');
                el.classList.remove('variant-active');
              });
              
              // Show selected variant
              const selectedVariant = target.querySelector(\`[data-variant="\${variant}"]\`);
              if (selectedVariant) {
                selectedVariant.classList.add('variant-active');
                selectedVariant.classList.remove('variant-hidden');
              }
            }
          }
        });
      });
      
      // Handle reactions
      const reactionElements = document.querySelectorAll('[data-has-reactions="true"]');
      reactionElements.forEach(element => {
        element.addEventListener('click', function() {
          const trigger = JSON.parse(this.getAttribute('data-reaction-trigger') || '{}');
          const actionType = this.getAttribute('data-reaction-action-type');
          const destinationId = this.getAttribute('data-reaction-destination');
          const transitionType = this.getAttribute('data-reaction-transition-type');
          const transitionDuration = this.getAttribute('data-reaction-transition-duration');
          
          if (destinationId) {
            const destination = document.querySelector(\`[data-figma-id="\${destinationId}"]\`);
            if (destination) {
              // Handle transition
              if (transitionType === 'DISSOLVE') {
                this.style.opacity = '0';
                setTimeout(() => {
                  destination.style.opacity = '1';
                }, parseFloat(transitionDuration || '300'));
              }
            }
          }
        });
      });
    });
  `;
} 