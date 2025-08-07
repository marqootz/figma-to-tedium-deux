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
          attributes['data-reaction-transition-type'] = actionToUse.transition.type;
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
    
    // Add data-target attribute to point to the parent component set
    // This allows variant buttons to know which component set to target for switching
    if (parentNode && (parentNode.type === 'COMPONENT_SET' || parentNode.type === 'COMPONENT')) {
      attributes['data-target'] = parentNode.id;
    }
  }
  
  return attributes;
}
