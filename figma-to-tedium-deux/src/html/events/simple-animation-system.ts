/**
 * Simple Animation System
 * 
 * A very basic animation system that:
 * 1. Takes a source element and target element
 * 2. Animates the source element to match the target's position
 * 3. Shows the target element when done
 * 
 * No complex three-phase system, no copying, just simple CSS transitions.
 */

interface SimpleAnimationOptions {
  duration?: number; // in seconds
  easing?: string; // CSS easing function
  animateColor?: boolean; // whether to animate color changes
  animateShadow?: boolean; // whether to animate shadow changes
  animateSize?: boolean; // whether to animate size changes
  onComplete?: () => void;
}

/**
 * Interface for describing a single animation change on an element
 */
interface SimpleAnimationChange {
  sourceElement: HTMLElement;
  targetElement: HTMLElement;
  deltaX: number;
  deltaY: number;
  hasPositionChange: boolean;
  hasColorChange: boolean;
  hasBorderColorChange: boolean;
  hasOpacityChange: boolean;
  hasShadowChange: boolean;
  hasSizeChange: boolean;
  sourceColor: string;
  targetColor: string;
  sourceBorderColor: string;
  targetBorderColor: string;
  sourceOpacity: string;
  targetOpacity: string;
  sourceShadow: string;
  targetShadow: string;
  sourceWidth: string;
  targetWidth: string;
  sourceHeight: string;
  targetHeight: string;
  sourceMinWidth: string;
  targetMinWidth: string;
  sourceMinHeight: string;
  targetMinHeight: string;
  sourceMaxWidth: string;
  targetMaxWidth: string;
  sourceMaxHeight: string;
  targetMaxHeight: string;
}

/**
 * Helper function to find all elements within source and target variants that have animated property changes
 */
function findAnimatedElementsAndChanges(
  sourceVariant: HTMLElement,
  targetVariant: HTMLElement,
  options: SimpleAnimationOptions = {}
): SimpleAnimationChange[] {
  const changes: SimpleAnimationChange[] = [];
  const { animateColor = false, animateShadow = false, animateSize = false } = options;

  console.log('🔍 FINDING ANIMATED ELEMENTS AND CHANGES');
  console.log('📋 Source variant:', sourceVariant.getAttribute('data-figma-id'));
  console.log('📋 Target variant:', targetVariant.getAttribute('data-figma-id'));

  // Get all elements with data-figma-id in both variants
  const sourceElements = sourceVariant.querySelectorAll('[data-figma-id]');
  const targetElements = targetVariant.querySelectorAll('[data-figma-id]');

  console.log('🔍 Found', sourceElements.length, 'elements in source variant');
  console.log('🔍 Found', targetElements.length, 'elements in target variant');

  // Create maps of target elements by their figma ID and name for lookup
  const targetElementMapById = new Map<string, HTMLElement>();
  const targetElementMapByName = new Map<string, HTMLElement>();
  targetElements.forEach(element => {
    const figmaId = element.getAttribute('data-figma-id');
    const figmaName = element.getAttribute('data-figma-name');
    if (figmaId) {
      targetElementMapById.set(figmaId, element as HTMLElement);
    }
    if (figmaName) {
      targetElementMapByName.set(figmaName, element as HTMLElement);
    }
  });

  // Check each source element for changes
  sourceElements.forEach(sourceElement => {
    const figmaId = sourceElement.getAttribute('data-figma-id');
    const figmaName = sourceElement.getAttribute('data-figma-name');
    if (!figmaId && !figmaName) return;

    // Try to find target element by ID first, then by name as fallback
    let targetElement = figmaId ? targetElementMapById.get(figmaId) : null;
    if (!targetElement && figmaName) {
      targetElement = targetElementMapByName.get(figmaName);
      if (targetElement) {
        console.log('🔍 Found target element by name instead of ID:', figmaName);
      }
    }
    
    if (!targetElement) {
      console.log('🔍 No matching target element found for:', figmaId || figmaName);
      return;
    }

    // Get positions from Figma coordinates stored in data attributes
    const sourceFigmaX = parseFloat(sourceElement.getAttribute('data-figma-x') || '0') || 0;
    const sourceFigmaY = parseFloat(sourceElement.getAttribute('data-figma-y') || '0') || 0;
    const targetFigmaX = parseFloat(targetElement.getAttribute('data-figma-x') || '0') || 0;
    const targetFigmaY = parseFloat(targetElement.getAttribute('data-figma-y') || '0') || 0;
    
    // Calculate the difference using Figma coordinates
    const deltaX = targetFigmaX - sourceFigmaX;
    const deltaY = targetFigmaY - sourceFigmaY;
    const hasPositionChange = Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1;

    // Initialize change object
    const change: SimpleAnimationChange = {
      sourceElement: sourceElement as HTMLElement,
      targetElement,
      deltaX,
      deltaY,
      hasPositionChange,
      hasColorChange: false,
      hasBorderColorChange: false,
      hasOpacityChange: false,
      hasShadowChange: false,
      hasSizeChange: false,
      sourceColor: '',
      targetColor: '',
      sourceBorderColor: '',
      targetBorderColor: '',
      sourceOpacity: '',
      targetOpacity: '',
      sourceShadow: '',
      targetShadow: '',
      sourceWidth: '',
      targetWidth: '',
      sourceHeight: '',
      targetHeight: '',
      sourceMinWidth: '',
      targetMinWidth: '',
      sourceMinHeight: '',
      targetMinHeight: '',
      sourceMaxWidth: '',
      targetMaxWidth: '',
      sourceMaxHeight: '',
      targetMaxHeight: ''
    };

    // Check for color changes
    if (animateColor) {
      const sourceComputedStyle = window.getComputedStyle(sourceElement);
      const targetComputedStyle = window.getComputedStyle(targetElement);
      
      change.sourceColor = sourceComputedStyle.backgroundColor;
      change.targetColor = targetComputedStyle.backgroundColor;
      change.sourceBorderColor = sourceComputedStyle.borderColor;
      change.targetBorderColor = targetComputedStyle.borderColor;
      change.sourceOpacity = sourceComputedStyle.opacity;
      change.targetOpacity = targetComputedStyle.opacity;
      
      // Ensure we have valid color values
      if (!change.sourceColor || change.sourceColor === 'rgba(0, 0, 0, 0)' || change.sourceColor === 'transparent') {
        change.sourceColor = 'rgb(255, 107, 107)'; // Default red
      }
      if (!change.targetColor || change.targetColor === 'rgba(0, 0, 0, 0)' || change.targetColor === 'transparent') {
        change.targetColor = 'rgb(243, 156, 18)'; // Default orange
      }
      
      change.hasColorChange = change.sourceColor !== change.targetColor;
      change.hasBorderColorChange = change.sourceBorderColor !== change.targetBorderColor;
      change.hasOpacityChange = change.sourceOpacity !== change.targetOpacity;
    }

    // Check for shadow changes
    if (animateShadow) {
      const sourceComputedStyle = window.getComputedStyle(sourceElement);
      const targetComputedStyle = window.getComputedStyle(targetElement);
      
      change.sourceShadow = sourceComputedStyle.boxShadow;
      change.targetShadow = targetComputedStyle.boxShadow;
      
      // Ensure we have valid shadow values
      if (!change.sourceShadow || change.sourceShadow === 'none') {
        change.sourceShadow = '0px 0px 0px 0px rgba(0, 0, 0, 0)';
      }
      if (!change.targetShadow || change.targetShadow === 'none') {
        change.targetShadow = '0px 0px 0px 0px rgba(0, 0, 0, 0)';
      }
      
      change.hasShadowChange = change.sourceShadow !== change.targetShadow;
    }

    // Check for size changes
    if (animateSize) {
      const sourceComputedStyle = window.getComputedStyle(sourceElement);
      const targetComputedStyle = window.getComputedStyle(targetElement);
      
      change.sourceWidth = sourceComputedStyle.width;
      change.targetWidth = targetComputedStyle.width;
      change.sourceHeight = sourceComputedStyle.height;
      change.targetHeight = targetComputedStyle.height;
      change.sourceMinWidth = sourceComputedStyle.minWidth;
      change.targetMinWidth = targetComputedStyle.minWidth;
      change.sourceMinHeight = sourceComputedStyle.minHeight;
      change.targetMinHeight = targetComputedStyle.minHeight;
      change.sourceMaxWidth = sourceComputedStyle.maxWidth;
      change.targetMaxWidth = targetComputedStyle.maxWidth;
      change.sourceMaxHeight = sourceComputedStyle.maxHeight;
      change.targetMaxHeight = targetComputedStyle.maxHeight;
      
      change.hasSizeChange = (
        change.sourceWidth !== change.targetWidth ||
        change.sourceHeight !== change.targetHeight ||
        change.sourceMinWidth !== change.targetMinWidth ||
        change.sourceMinHeight !== change.targetMinHeight ||
        change.sourceMaxWidth !== change.targetMaxWidth ||
        change.sourceMaxHeight !== change.targetMaxHeight
      );
    }

    // Only add to changes if there's actually something to animate
    const hasAnyChange = hasPositionChange || 
                        (animateColor && (change.hasColorChange || change.hasBorderColorChange || change.hasOpacityChange)) ||
                        (animateShadow && change.hasShadowChange) ||
                        (animateSize && change.hasSizeChange);

    if (hasAnyChange) {
      console.log('🔍 Found changes for element:', figmaId, {
        hasPositionChange,
        hasColorChange: change.hasColorChange,
        hasShadowChange: change.hasShadowChange,
        hasSizeChange: change.hasSizeChange,
        deltaX,
        deltaY
      });
      changes.push(change);
    }
  });

  console.log('🔍 Total elements with changes:', changes.length);
  return changes;
}

/**
 * Simple animation function that animates a specific element based on detected changes
 */
export function simpleAnimate(
  change: SimpleAnimationChange,
  options: SimpleAnimationOptions = {}
): Promise<void> {
  return new Promise((resolve) => {
    const {
      duration = 0.5,
      easing = 'ease-in-out',
      onComplete
    } = options;

    const { sourceElement, targetElement } = change;

    console.log('🎬 SIMPLE ANIMATION: Starting animation for element:', sourceElement.getAttribute('data-figma-id'));
    console.log('📊 Position delta:', { deltaX: change.deltaX, deltaY: change.deltaY });
    console.log('📊 Has position change:', change.hasPositionChange);
    console.log('📊 Has color change:', change.hasColorChange);
    console.log('📊 Has shadow change:', change.hasShadowChange);
    console.log('📊 Has size change:', change.hasSizeChange);

    // Use CSS animations instead of transitions for better simultaneous control
    const animationName = `simple-animation-${Date.now()}-${Math.random()}`;
    
    // Create the keyframes for simultaneous animation
    const keyframes = `
      @keyframes ${animationName} {
        0% {
          transform: translate(0px, 0px);
          ${change.hasColorChange ? `background-color: ${change.sourceColor};` : ''}
          ${change.hasBorderColorChange ? `border-color: ${change.sourceBorderColor};` : ''}
          ${change.hasOpacityChange ? `opacity: ${change.sourceOpacity};` : ''}
          ${change.hasShadowChange ? `box-shadow: ${change.sourceShadow};` : ''}
          ${change.hasSizeChange ? `width: ${change.sourceWidth}; height: ${change.sourceHeight}; min-width: ${change.sourceMinWidth}; min-height: ${change.sourceMinHeight}; max-width: ${change.sourceMaxWidth}; max-height: ${change.sourceMaxHeight};` : ''}
        }
        100% {
          transform: translate(${change.deltaX}px, ${change.deltaY}px);
          ${change.hasColorChange ? `background-color: ${change.targetColor};` : ''}
          ${change.hasBorderColorChange ? `border-color: ${change.targetBorderColor};` : ''}
          ${change.hasOpacityChange ? `opacity: ${change.targetOpacity};` : ''}
          ${change.hasShadowChange ? `box-shadow: ${change.targetShadow};` : ''}
          ${change.hasSizeChange ? `width: ${change.targetWidth}; height: ${change.targetHeight}; min-width: ${change.targetMinWidth}; min-height: ${change.targetMinHeight}; max-width: ${change.targetMaxWidth}; max-height: ${change.targetMaxHeight};` : ''}
        }
      }
    `;
    
    console.log('🎬 Keyframes created:', keyframes);
    console.log('🎬 Expected final transform:', `translate(${change.deltaX}px, ${change.deltaY}px)`);
    
    // Add the keyframes to the document
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);
    
    // Disable any existing CSS transitions that might interfere
    sourceElement.style.transition = 'none';
    
    // Apply the animation
    sourceElement.style.animation = `${animationName} ${duration}s ${easing} forwards`;
    
    // Debug: Check if animation is actually running
    setTimeout(() => {
      const computedStyle = window.getComputedStyle(sourceElement);
      console.log('🎬 Animation debug for element:', sourceElement.getAttribute('data-figma-id'));
      console.log('🎬 Computed animation:', computedStyle.animation);
      console.log('🎬 Computed transform:', computedStyle.transform);
    }, 100);
    
    // Clean up the style element after animation
    setTimeout(() => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    }, duration * 1000 + 100);

    // Listen for animation completion
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.animationName === animationName) {
        console.log('✅ SIMPLE ANIMATION: Animation completed for element:', sourceElement.getAttribute('data-figma-id'));
        
        // Log the final computed values
        const finalComputedStyle = window.getComputedStyle(sourceElement);
        console.log('🎬 Final computed transform:', finalComputedStyle.transform);
        console.log('🎬 Final computed color:', finalComputedStyle.backgroundColor);
        console.log('🎬 Final computed shadow:', finalComputedStyle.boxShadow);
        console.log('🎬 Final computed width:', finalComputedStyle.width);
        console.log('🎬 Final computed height:', finalComputedStyle.height);
        
        // Clean up
        sourceElement.removeEventListener('animationend', onAnimationEnd);
        sourceElement.style.animation = '';
        
        // Call completion callback
        if (onComplete) {
          onComplete();
        }
        
        resolve();
      }
    };
    
    sourceElement.addEventListener('animationend', onAnimationEnd);
    
    // Fallback timeout
    setTimeout(() => {
      console.log('⏰ SIMPLE ANIMATION: Animation completed via timeout for element:', sourceElement.getAttribute('data-figma-id'));
      sourceElement.removeEventListener('animationend', onAnimationEnd);
      sourceElement.style.animation = '';
      
      if (onComplete) {
        onComplete();
      }
      
      resolve();
    }, duration * 1000 + 1000);
  });
}

/**
 * Simple variant switch function that handles nested element animations
 */
export function simpleVariantSwitch(
  sourceElement: HTMLElement,
  targetElement: HTMLElement,
  options: SimpleAnimationOptions = {}
): Promise<void> {
  console.log('🔄 SIMPLE VARIANT SWITCH: Starting variant switch');
  
  // Find all animated elements and their changes
  const changes = findAnimatedElementsAndChanges(sourceElement, targetElement, options);
  
  if (changes.length === 0) {
    console.log('🔄 No changes detected, performing instant switch');
    // If no changes detected, just do an instant switch
    sourceElement.style.display = 'none';
    targetElement.style.display = 'flex';
    return Promise.resolve();
  }
  
  console.log('🔄 Found', changes.length, 'elements with changes to animate');
  
  // Animate all changes simultaneously
  const animationPromises = changes.map(change => 
    simpleAnimate(change, options)
  );
  
  return Promise.all(animationPromises).then(() => {
    console.log('✅ All animations completed');
    // Hide source and show target after all animations complete
    sourceElement.style.display = 'none';
    targetElement.style.display = 'flex';
  });
}

/**
 * Instant variant switch (no animation)
 */
export function instantVariantSwitch(
  sourceElement: HTMLElement,
  targetElement: HTMLElement
): void {
  console.log('⚡ INSTANT VARIANT SWITCH: Switching without animation');
  
  sourceElement.style.display = 'none';
  targetElement.style.display = 'flex';
}

/**
 * Reset animation state
 */
export function resetAnimationState(
  sourceElement: HTMLElement,
  targetElement: HTMLElement
): void {
  console.log('🔄 RESET: Resetting animation state');
  
  // Reset source element
  sourceElement.style.display = 'flex';
  sourceElement.style.transition = '';
  sourceElement.style.transform = '';
  
  // Reset target element
  targetElement.style.display = 'none';
  targetElement.style.transition = '';
  targetElement.style.transform = '';
}

/**
 * Drop-in replacement for the official animation system
 * Uses the simple animation approach but provides the same interface
 */
export function officialStyleAnimate(
  sourceElement: HTMLElement,
  targetElement: HTMLElement,
  allVariants: HTMLElement[],
  transitionType: string,
  transitionDuration: string | number
): Promise<void> {
  return new Promise((resolve) => {
    console.log('🎬 OFFICIAL-STYLE ANIMATION: Starting with simple approach');
    
    // Keep source visible for animation, but hide target initially
    allVariants.forEach(variant => {
      if (variant === sourceElement) {
        variant.style.display = 'flex';
        variant.classList.add('variant-active');
        variant.classList.remove('variant-hidden');
      } else if (variant === targetElement) {
        // Keep target hidden but prepare it
        variant.style.display = 'none';
        variant.classList.add('variant-hidden');
        variant.classList.remove('variant-active');
      } else {
        variant.style.display = 'none';
        variant.classList.add('variant-hidden');
        variant.classList.remove('variant-active');
      }
    });
    
    // Use the simple animation approach with the new system
    const duration = parseFloat(transitionDuration.toString()) || 0.5;
    const easing = getEasingFromTransitionType(transitionType);
    
    // Find all animated elements and their changes
    const changes = findAnimatedElementsAndChanges(sourceElement, targetElement, {
      animateColor: true,
      animateShadow: true,
      animateSize: true
    });
    
    if (changes.length === 0) {
      console.log('🔄 No changes detected, performing instant switch');
      // If no changes detected, just do an instant switch
      sourceElement.style.display = 'none';
      sourceElement.classList.add('variant-hidden');
      sourceElement.classList.remove('variant-active');
      
      targetElement.style.display = 'flex';
      targetElement.classList.add('variant-active');
      targetElement.classList.remove('variant-hidden');
      
      console.log('✅ OFFICIAL-STYLE ANIMATION: Completed');
      resolve();
    } else {
      console.log('🔄 Found', changes.length, 'elements with changes to animate');
      
      // Animate all changes simultaneously
      const animationPromises = changes.map(change => 
        simpleAnimate(change, {
          duration,
          easing
        })
      );
      
      Promise.all(animationPromises).then(() => {
        console.log('✅ All animations completed');
        
        // Show target and hide source after all animations complete
        sourceElement.style.display = 'none';
        sourceElement.classList.add('variant-hidden');
        sourceElement.classList.remove('variant-active');
        
        targetElement.style.display = 'flex';
        targetElement.classList.add('variant-active');
        targetElement.classList.remove('variant-hidden');
        
        console.log('✅ OFFICIAL-STYLE ANIMATION: Completed');
        resolve();
      });
    }
  });
}

/**
 * Helper function to convert transition types to easing functions
 */
function getEasingFromTransitionType(transitionType: string): string {
  switch (transitionType) {
    case 'EASE_IN_AND_OUT_BACK':
      return 'cubic-bezier(0.68, -0.6, 0.32, 1.6)';
    case 'EASE_IN_AND_OUT':
      return 'ease-in-out';
    case 'EASE_IN':
      return 'ease-in';
    case 'EASE_OUT':
      return 'ease-out';
    case 'LINEAR':
      return 'linear';
    case 'BOUNCY':
      return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    case 'GENTLE':
      return 'ease-in-out';
    case 'SMART_ANIMATE':
      return 'ease-in-out';
    default:
      return 'ease-out';
  }
}

/**
 * Generate JavaScript code for the official system's transition handler
 * but using the simple animation approach internally
 */
export function generateSimpleTransitionHandler(): string {
  return `
    // Global transition lock to prevent multiple simultaneous transitions
    let isTransitionInProgress = false;
    
    // Animation types
    const AnimationType = {
      SIMPLE: 'SIMPLE',
      SIZE: 'SIZE', 
      TRANSFORM: 'TRANSFORM'
    };
    
    // Translation conditions
    const TranslationCondition = {
      ABSOLUTE: 'ABSOLUTE',
      RELATIVE_PADDING: 'RELATIVE_PADDING',
      RELATIVE_ALIGNMENT: 'RELATIVE_ALIGNMENT'
    };
    

    
    /**
     * Helper function to get easing function
     */
    function getEasingFunction(animationType) {
      switch (animationType) {
        case 'EASE_IN_AND_OUT_BACK':
          return 'cubic-bezier(0.68, -0.6, 0.32, 1.6)';
        case 'EASE_IN_AND_OUT':
          return 'ease-in-out';
        case 'EASE_IN':
          return 'ease-in';
        case 'EASE_OUT':
          return 'ease-out';
        case 'LINEAR':
          return 'linear';
        case 'BOUNCY':
          return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        case 'GENTLE':
          return 'ease-in-out';
        case 'SMART_ANIMATE':
          return 'ease-in-out';
        default:
          return 'ease-out';
      }
    }
    
    /**
     * Main reaction handler function - entry point for all reactions
     */
    function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {
      console.log('🎯 REACTION TRIGGERED:', {
        sourceId: sourceElement.getAttribute('data-figma-id'),
        sourceName: sourceElement.getAttribute('data-figma-name'),
        destinationId: destinationId,
        transitionType: transitionType,
        transitionDuration: transitionDuration
      });
      
      // Check if transition is already in progress
      if (isTransitionInProgress) {
        console.log('❌ Transition already in progress, skipping reaction');
        return;
      }
      
      // Find the destination element
      const destination = document.querySelector('[data-figma-id="' + destinationId + '"]');
      if (!destination) {
        console.error('❌ Destination element not found:', destinationId);
        return;
      }
      
      // Find all variants in the same component set
      const componentSet = sourceElement.closest('[data-figma-type="COMPONENT_SET"]');
      if (!componentSet) {
        console.error('❌ Component set not found for source element');
        return;
      }
      
      const allVariants = Array.from(componentSet.children).filter(child => 
        child.getAttribute('data-figma-type') === 'COMPONENT'
      );
      
      console.log('🎯 Found', allVariants.length, 'variants in component set');
      
      // Determine if we should animate or perform instant switch
      if (transitionType && transitionType !== 'INSTANT' && transitionDuration && parseFloat(transitionDuration) > 0) {
        // Use simple animated variant switch
        console.log('🎭 Using simple animated variant switch');
        handleSimpleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration);
      } else {
        // Use instant variant switch
        console.log('⚡ Using instant variant switch');
        performInstantVariantSwitch(allVariants, destination);
      }
    }
    
    /**
     * Helper function to find all elements within source and target variants that have animated property changes
     */
    function findAnimatedElementsAndChanges(sourceVariant, targetVariant, options = {}) {
      const changes = [];
      const { animateColor = false, animateShadow = false, animateSize = false } = options;

      console.log('🔍 FINDING ANIMATED ELEMENTS AND CHANGES');
      console.log('📋 Source variant:', sourceVariant.getAttribute('data-figma-id'));
      console.log('📋 Target variant:', targetVariant.getAttribute('data-figma-id'));

      // Get all elements with data-figma-id in both variants
      const sourceElements = sourceVariant.querySelectorAll('[data-figma-id]');
      const targetElements = targetVariant.querySelectorAll('[data-figma-id]');

      console.log('🔍 Found', sourceElements.length, 'elements in source variant');
      console.log('🔍 Found', targetElements.length, 'elements in target variant');

      // Create maps of target elements by their figma ID and name for lookup
      const targetElementMapById = new Map();
      const targetElementMapByName = new Map();
      targetElements.forEach(element => {
        const figmaId = element.getAttribute('data-figma-id');
        const figmaName = element.getAttribute('data-figma-name');
        if (figmaId) {
          targetElementMapById.set(figmaId, element);
        }
        if (figmaName) {
          targetElementMapByName.set(figmaName, element);
        }
      });

      // Check each source element for changes
      sourceElements.forEach(sourceElement => {
        const figmaId = sourceElement.getAttribute('data-figma-id');
        const figmaName = sourceElement.getAttribute('data-figma-name');
        if (!figmaId && !figmaName) return;

        // Try to find target element by ID first, then by name as fallback
        let targetElement = figmaId ? targetElementMapById.get(figmaId) : null;
        if (!targetElement && figmaName) {
          targetElement = targetElementMapByName.get(figmaName);
          if (targetElement) {
            console.log('🔍 Found target element by name instead of ID:', figmaName);
          }
        }
        
        if (!targetElement) {
          console.log('🔍 No matching target element found for:', figmaId || figmaName);
          return;
        }

        // Get positions from Figma coordinates stored in data attributes
        const sourceFigmaX = parseFloat(sourceElement.getAttribute('data-figma-x') || '0') || 0;
        const sourceFigmaY = parseFloat(sourceElement.getAttribute('data-figma-y') || '0') || 0;
        const targetFigmaX = parseFloat(targetElement.getAttribute('data-figma-x') || '0') || 0;
        const targetFigmaY = parseFloat(targetElement.getAttribute('data-figma-y') || '0') || 0;
        
        // Calculate the difference using Figma coordinates
        const deltaX = targetFigmaX - sourceFigmaX;
        const deltaY = targetFigmaY - sourceFigmaY;
        const hasPositionChange = Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1;

        // Initialize change object
        const change = {
          sourceElement: sourceElement,
          targetElement: targetElement,
          deltaX: deltaX,
          deltaY: deltaY,
          hasPositionChange: hasPositionChange,
          hasColorChange: false,
          hasBorderColorChange: false,
          hasOpacityChange: false,
          hasShadowChange: false,
          hasSizeChange: false,
          sourceColor: '',
          targetColor: '',
          sourceBorderColor: '',
          targetBorderColor: '',
          sourceOpacity: '',
          targetOpacity: '',
          sourceShadow: '',
          targetShadow: '',
          sourceWidth: '',
          targetWidth: '',
          sourceHeight: '',
          targetHeight: '',
          sourceMinWidth: '',
          targetMinWidth: '',
          sourceMinHeight: '',
          targetMinHeight: '',
          sourceMaxWidth: '',
          targetMaxWidth: '',
          sourceMaxHeight: '',
          targetMaxHeight: ''
        };

        // Check for color changes
        if (animateColor) {
          const sourceComputedStyle = window.getComputedStyle(sourceElement);
          const targetComputedStyle = window.getComputedStyle(targetElement);
          
          change.sourceColor = sourceComputedStyle.backgroundColor;
          change.targetColor = targetComputedStyle.backgroundColor;
          change.sourceBorderColor = sourceComputedStyle.borderColor;
          change.targetBorderColor = targetComputedStyle.borderColor;
          change.sourceOpacity = sourceComputedStyle.opacity;
          change.targetOpacity = targetComputedStyle.opacity;
          
          // Ensure we have valid color values
          if (!change.sourceColor || change.sourceColor === 'rgba(0, 0, 0, 0)' || change.sourceColor === 'transparent') {
            change.sourceColor = 'rgb(255, 107, 107)';
          }
          if (!change.targetColor || change.targetColor === 'rgba(0, 0, 0, 0)' || change.targetColor === 'transparent') {
            change.targetColor = 'rgb(243, 156, 18)';
          }
          
          change.hasColorChange = change.sourceColor !== change.targetColor;
          change.hasBorderColorChange = change.sourceBorderColor !== change.targetBorderColor;
          change.hasOpacityChange = change.sourceOpacity !== change.targetOpacity;
        }

        // Check for shadow changes
        if (animateShadow) {
          const sourceComputedStyle = window.getComputedStyle(sourceElement);
          const targetComputedStyle = window.getComputedStyle(targetElement);
          
          change.sourceShadow = sourceComputedStyle.boxShadow;
          change.targetShadow = targetComputedStyle.boxShadow;
          
          // Ensure we have valid shadow values
          if (!change.sourceShadow || change.sourceShadow === 'none') {
            change.sourceShadow = '0px 0px 0px 0px rgba(0, 0, 0, 0)';
          }
          if (!change.targetShadow || change.targetShadow === 'none') {
            change.targetShadow = '0px 0px 0px 0px rgba(0, 0, 0, 0)';
          }
          
          change.hasShadowChange = change.sourceShadow !== change.targetShadow;
        }

        // Check for size changes
        if (animateSize) {
          const sourceComputedStyle = window.getComputedStyle(sourceElement);
          const targetComputedStyle = window.getComputedStyle(targetElement);
          
          change.sourceWidth = sourceComputedStyle.width;
          change.targetWidth = targetComputedStyle.width;
          change.sourceHeight = sourceComputedStyle.height;
          change.targetHeight = targetComputedStyle.height;
          change.sourceMinWidth = sourceComputedStyle.minWidth;
          change.targetMinWidth = targetComputedStyle.minWidth;
          change.sourceMinHeight = sourceComputedStyle.minHeight;
          change.targetMinHeight = targetComputedStyle.minHeight;
          change.sourceMaxWidth = sourceComputedStyle.maxWidth;
          change.targetMaxWidth = targetComputedStyle.maxWidth;
          change.sourceMaxHeight = sourceComputedStyle.maxHeight;
          change.targetMaxHeight = targetComputedStyle.maxHeight;
          
          change.hasSizeChange = (
            change.sourceWidth !== change.targetWidth ||
            change.sourceHeight !== change.targetHeight ||
            change.sourceMinWidth !== change.targetMinWidth ||
            change.sourceMinHeight !== change.targetMinHeight ||
            change.sourceMaxWidth !== change.targetMaxWidth ||
            change.sourceMaxHeight !== change.targetMaxHeight
          );
        }

        // Only add to changes if there's actually something to animate
        const hasAnyChange = hasPositionChange || 
                            (animateColor && (change.hasColorChange || change.hasBorderColorChange || change.hasOpacityChange)) ||
                            (animateShadow && change.hasShadowChange) ||
                            (animateSize && change.hasSizeChange);

        if (hasAnyChange) {
          console.log('🔍 Found changes for element:', figmaId, {
            hasPositionChange: hasPositionChange,
            hasColorChange: change.hasColorChange,
            hasShadowChange: change.hasShadowChange,
            hasSizeChange: change.hasSizeChange,
            deltaX: deltaX,
            deltaY: deltaY
          });
          changes.push(change);
        }
      });

      console.log('🔍 Total elements with changes:', changes.length);
      return changes;
    }

    /**
     * Simple animation function that animates a specific element based on detected changes
     */
    function simpleAnimate(change, options = {}) {
      return new Promise((resolve) => {
        const {
          duration = 0.5,
          easing = 'ease-in-out',
          onComplete
        } = options;

        const { sourceElement, targetElement } = change;

        console.log('🎬 SIMPLE ANIMATION: Starting animation for element:', sourceElement.getAttribute('data-figma-id'));
        console.log('📊 Position delta:', { deltaX: change.deltaX, deltaY: change.deltaY });
        console.log('📊 Has position change:', change.hasPositionChange);
        console.log('📊 Has color change:', change.hasColorChange);
        console.log('📊 Has shadow change:', change.hasShadowChange);
        console.log('📊 Has size change:', change.hasSizeChange);

        // Use CSS animations instead of transitions
        const animationName = 'simple-animation-' + Date.now() + '-' + Math.random();
        
        // Create the keyframes for simultaneous animation
        const keyframes = \`
          @keyframes \${animationName} {
            0% {
              transform: translate(0px, 0px);
              \${change.hasColorChange ? \`background-color: \${change.sourceColor};\` : ''}
              \${change.hasBorderColorChange ? \`border-color: \${change.sourceBorderColor};\` : ''}
              \${change.hasOpacityChange ? \`opacity: \${change.sourceOpacity};\` : ''}
              \${change.hasShadowChange ? \`box-shadow: \${change.sourceShadow};\` : ''}
              \${change.hasSizeChange ? \`width: \${change.sourceWidth}; height: \${change.sourceHeight}; min-width: \${change.sourceMinWidth}; min-height: \${change.sourceMinHeight}; max-width: \${change.sourceMaxWidth}; max-height: \${change.sourceMaxHeight};\` : ''}
            }
            100% {
              transform: translate(\${change.deltaX}px, \${change.deltaY}px);
              \${change.hasColorChange ? \`background-color: \${change.targetColor};\` : ''}
              \${change.hasBorderColorChange ? \`border-color: \${change.targetBorderColor};\` : ''}
              \${change.hasOpacityChange ? \`opacity: \${change.targetOpacity};\` : ''}
              \${change.hasShadowChange ? \`box-shadow: \${change.targetShadow};\` : ''}
              \${change.hasSizeChange ? \`width: \${change.targetWidth}; height: \${change.targetHeight}; min-width: \${change.targetMinWidth}; min-height: \${change.targetMinHeight}; max-width: \${change.targetMaxWidth}; max-height: \${change.targetMaxHeight};\` : ''}
            }
          }
        \`;
        
        console.log('🎬 Keyframes created:', keyframes);
        
        // Add the keyframes to the document
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
        
        // Disable any existing CSS transitions that might interfere
        sourceElement.style.transition = 'none';
        
        // Apply the animation
        sourceElement.style.animation = \`\${animationName} \${duration}s \${easing} forwards\`;
        
        // Debug: Check if animation is actually running
        setTimeout(() => {
          const computedStyle = window.getComputedStyle(sourceElement);
          console.log('🎬 Animation debug for element:', sourceElement.getAttribute('data-figma-id'));
          console.log('🎬 Computed animation:', computedStyle.animation);
          console.log('🎬 Computed transform:', computedStyle.transform);
        }, 100);
        
        // Clean up the style element after animation
        setTimeout(() => {
          if (document.head.contains(style)) {
            document.head.removeChild(style);
          }
        }, duration * 1000 + 100);

        // Listen for animation completion
        const onAnimationEnd = (event) => {
          if (event.animationName === animationName) {
            console.log('✅ SIMPLE ANIMATION: Animation completed for element:', sourceElement.getAttribute('data-figma-id'));
            
            // Log the final computed values
            const finalComputedStyle = window.getComputedStyle(sourceElement);
            console.log('🎬 Final computed transform:', finalComputedStyle.transform);
            console.log('🎬 Final computed color:', finalComputedStyle.backgroundColor);
            console.log('🎬 Final computed shadow:', finalComputedStyle.boxShadow);
            console.log('🎬 Final computed width:', finalComputedStyle.width);
            console.log('🎬 Final computed height:', finalComputedStyle.height);
            
            // Clean up
            sourceElement.removeEventListener('animationend', onAnimationEnd);
            sourceElement.style.animation = '';
            
            // Call completion callback
            if (onComplete) {
              onComplete();
            }
            
            resolve();
          }
        };
        
        sourceElement.addEventListener('animationend', onAnimationEnd);
        
        // Fallback timeout
        setTimeout(() => {
          console.log('⏰ SIMPLE ANIMATION: Animation completed via timeout for element:', sourceElement.getAttribute('data-figma-id'));
          sourceElement.removeEventListener('animationend', onAnimationEnd);
          sourceElement.style.animation = '';
          
          if (onComplete) {
            onComplete();
          }
          
          resolve();
        }, duration * 1000 + 1000);
      });
    }

    /**
     * Main function to handle animated variant switching using simple approach
     */
    async function handleSimpleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration) {
      console.log('🔄 SIMPLE ANIMATED VARIANT SWITCH START:', {
        sourceId: sourceElement.getAttribute('data-figma-id'),
        sourceName: sourceElement.getAttribute('data-figma-name'),
        destinationId: destination.getAttribute('data-figma-id'),
        destinationName: destination.getAttribute('data-figma-name'),
        transitionType: transitionType,
        transitionDuration: transitionDuration,
        totalVariants: allVariants.length
      });
      
      // Check if transition is already in progress
      if (isTransitionInProgress) {
        console.log('❌ Transition already in progress, skipping');
        return;
      }
      
      isTransitionInProgress = true;
      
      // Clear any pending timeout reactions to prevent conflicts
      if (window.clearAllTimeoutReactions) {
        window.clearAllTimeoutReactions();
      }
      
      try {
        // ✅ POSITION MEASUREMENT FIX: Measure positions BEFORE hiding anything
        console.log('📏 PRE-MEASUREMENT: Measuring source and target positions while visible');
        
        // Temporarily ensure both variants are visible for measurement
        sourceElement.style.display = 'flex';
        sourceElement.style.visibility = 'visible';
        sourceElement.style.opacity = '1';
        
        destination.style.display = 'flex';
        destination.style.visibility = 'visible';
        destination.style.opacity = '1';
        
        // Force reflow
        sourceElement.offsetHeight;
        destination.offsetHeight;
        
        // Measure positions while both are visible
        // Note: measureElementPositions function needs to be available in generated string
        const sourcePositions = new Map();
        const targetPositions = new Map();
        
        // Simplified position measurement for string generation
        const measurePositions = (variant, positions) => {
          const variantRect = variant.getBoundingClientRect();
          positions.set(variant.getAttribute('data-figma-id'), {
            rect: variantRect,
            element: variant
          });
          
          const childElements = variant.querySelectorAll('[data-figma-id]');
          childElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            positions.set(element.getAttribute('data-figma-id'), {
              rect: rect,
              element: element
            });
            
            console.log(\`📏 Measured \${element.getAttribute('data-figma-name')}:\`, {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height
            });
          });
        };
        
        measurePositions(sourceElement, sourcePositions);
        measurePositions(destination, targetPositions);
        
        console.log('📏 Source positions measured:', sourcePositions.size, 'elements');
        console.log('📏 Target positions measured:', targetPositions.size, 'elements');
        
        // Now hide target and others, keep only source visible initially
        allVariants.forEach(variant => {
          if (variant === sourceElement) {
            variant.style.display = 'flex';
            variant.classList.add('variant-active');
            variant.classList.remove('variant-hidden');
          } else {
            // Hide target and others during animation
            variant.style.display = 'none';
            variant.classList.add('variant-hidden');
            variant.classList.remove('variant-active');
          }
        });
        
        // Use pre-measured positions to determine if animation is needed
        let hasPositionChanges = false;
        sourcePositions.forEach((sourceData, elementId) => {
          const targetData = targetPositions.get(elementId);
          if (targetData) {
            const xDiff = targetData.rect.left - sourceData.rect.left;
            const yDiff = targetData.rect.top - sourceData.rect.top;
            if (Math.abs(xDiff) > 1 || Math.abs(yDiff) > 1) {
              hasPositionChanges = true;
            }
          }
        });
        
        console.log('🔍 POSITION ANALYSIS: Has position changes:', hasPositionChanges);
        
        if (changes.length === 0) {
          console.log('🔄 No changes detected, performing instant switch');
          // If no changes detected, just do an instant switch
          sourceElement.style.display = 'none';
          sourceElement.classList.add('variant-hidden');
          sourceElement.classList.remove('variant-active');
          
          destination.style.display = 'flex';
          destination.classList.add('variant-active');
          destination.classList.remove('variant-hidden');
        } else {
          console.log('🔄 Found', changes.length, 'elements with changes to animate');
          
          // Use the simple animation approach
          const duration = parseFloat(transitionDuration.toString()) || 0.5;
          const easing = getEasingFunction(transitionType);
          
          // Animate all changes simultaneously
          const animationPromises = changes.map(change => 
            simpleAnimate(change, {
              duration,
              easing
            })
          );
          
          await Promise.all(animationPromises);
          
          console.log('✅ All animations completed');
          
          // Show target and hide source after all animations complete
          sourceElement.style.display = 'none';
          sourceElement.classList.add('variant-hidden');
          sourceElement.classList.remove('variant-active');
          
          // Reset target positioning and make it active
          destination.style.position = '';
          destination.style.top = '';
          destination.style.left = '';
          destination.style.zIndex = '';
          destination.style.display = 'flex';
          destination.classList.add('variant-active');
          destination.classList.remove('variant-hidden');
        }
        
        // Start timeout reactions for the new active variant
        if (window.startTimeoutReactionsForNewlyActiveVariant) {
          window.startTimeoutReactionsForNewlyActiveVariant(destination);
        }
        if (window.startTimeoutReactionsForNestedComponents) {
          window.startTimeoutReactionsForNestedComponents(destination);
        }
        
        console.log('✅ SIMPLE ANIMATED VARIANT SWITCH COMPLETED');
        
      } catch (error) {
        console.error('❌ Error during simple animated variant switch:', error);
      } finally {
        isTransitionInProgress = false;
      }
    }
    
    /**
     * Function to perform instant variant switch (no animation)
     */
    function performInstantVariantSwitch(allVariants, destination) {
      console.log('⚡ PERFORMING INSTANT VARIANT SWITCH');
      
      // Hide all variants - only use display
      allVariants.forEach(variant => {
        variant.classList.add('variant-hidden');
        variant.classList.remove('variant-active');
        variant.style.display = 'none';
        if (!variant.style.position || variant.style.position === 'static') {
          variant.style.position = 'relative';
        }
      });
      
      // Show destination variant - only use display
      destination.classList.add('variant-active');
      destination.classList.remove('variant-hidden');
      destination.style.display = 'flex';
      if (!destination.style.position || destination.style.position === 'static') {
        destination.style.position = 'relative';
      }
      
      console.log('✅ INSTANT VARIANT SWITCH COMPLETED');
      
      // Start timeout reactions
      if (window.startTimeoutReactionsForNewlyActiveVariant) {
        window.startTimeoutReactionsForNewlyActiveVariant(destination);
      }
      if (window.startTimeoutReactionsForNestedComponents) {
        window.startTimeoutReactionsForNestedComponents(destination);
      }
    }
    
    // Export the main functions for external use
    window.handleReaction = handleReaction;
    window.handleSimpleAnimatedVariantSwitch = handleSimpleAnimatedVariantSwitch;
    window.performInstantVariantSwitch = performInstantVariantSwitch;
    
    console.log('✅ Simple transition handler loaded');
  `;
}
