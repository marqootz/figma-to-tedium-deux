import { FigmaNode, Reaction, VariantProperties } from '../../types';
import { safeToString, escapeHtmlAttribute, safeHasProperty } from '../utils';

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
      
      // Check both action and actions fields
      let actionToUse: any = null;
      if (firstReaction.action) {
        actionToUse = firstReaction.action;
      } else if (firstReaction.actions && firstReaction.actions.length > 0) {
        actionToUse = firstReaction.actions[0];
      }
      
      if (actionToUse && actionToUse.type) {
        attributes['data-reaction-action-type'] = actionToUse.type;
        
        if (actionToUse.destinationId) {
          attributes['data-reaction-destination'] = actionToUse.destinationId;
        }
        
        // Extract transition data from the action
        if (actionToUse.transition && actionToUse.transition.type) {
          // Check if this is a bouncy animation based on easing type
          let transitionType = actionToUse.transition.type;
          if (actionToUse.transition.easing && actionToUse.transition.easing.type) {
            const easingType = actionToUse.transition.easing.type;
            
            // Map Figma easing types to our transition types
            if (easingType === 'EASE_IN_AND_OUT_BACK' || easingType === 'BOUNCY') {
              transitionType = 'BOUNCY';
            } else if (easingType === 'EASE_IN_AND_OUT') {
              transitionType = 'SMART_ANIMATE';
            } else if (easingType === 'EASE_IN') {
              transitionType = 'SMART_ANIMATE';
            } else if (easingType === 'EASE_OUT') {
              transitionType = 'SMART_ANIMATE';
            } else if (easingType === 'LINEAR') {
              transitionType = 'SMART_ANIMATE';
            }
          }
          
          attributes['data-reaction-transition-type'] = transitionType;
          if (actionToUse.transition.duration) {
            attributes['data-reaction-transition-duration'] = String(actionToUse.transition.duration);
          }
        }
      }
    }
  }
  
  return attributes;
}

export function generateVariantAttributes(node: FigmaNode, parentNode?: FigmaNode): Record<string, string> {
  const attributes: Record<string, string> = {};
  
  if (safeHasProperty(node, 'variantProperties') && (node as any).variantProperties) {
    const variantProps = (node as any).variantProperties as VariantProperties;
    
    Object.entries(variantProps).forEach(([key, value]) => {
      const cleanKey = key.toLowerCase().replace(/\s+/g, '-');
      attributes[`data-variant-${cleanKey}`] = escapeHtmlAttribute(safeToString(value));
    });
    
    // Add data-target attribute to point to the immediate parent component set
    // This allows variant buttons to know which component set to target for switching
    // For nested components, this will point to their immediate parent, not the top-level
    if (parentNode && (parentNode.type === 'COMPONENT_SET' || parentNode.type === 'COMPONENT')) {
      attributes['data-target'] = parentNode.id;
    }
  }
  
  return attributes;
}
