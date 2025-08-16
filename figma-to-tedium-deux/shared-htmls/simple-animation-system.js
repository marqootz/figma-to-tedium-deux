"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleAnimate = simpleAnimate;
exports.simpleVariantSwitch = simpleVariantSwitch;
exports.instantVariantSwitch = instantVariantSwitch;
exports.resetAnimationState = resetAnimationState;
exports.officialStyleAnimate = officialStyleAnimate;
exports.generateSimpleTransitionHandler = generateSimpleTransitionHandler;
/**
 * Simple animation function that moves an element from source to target position
 */
function simpleAnimate(sourceElement, targetElement, options = {}) {
    return new Promise((resolve) => {
        const { duration = 0.5, easing = 'ease-in-out', animateColor = false, animateShadow = false, animateSize = false, onComplete } = options;
        console.log('🎬 SIMPLE ANIMATION: Starting animation');
        console.log('📋 Source:', sourceElement.getAttribute('data-figma-id'));
        console.log('📋 Target:', targetElement.getAttribute('data-figma-id'));
        // Get positions from CSS styles instead of getBoundingClientRect
        const sourceLeft = parseFloat(sourceElement.style.left) || 0;
        const sourceTop = parseFloat(sourceElement.style.top) || 0;
        const targetLeft = parseFloat(targetElement.style.left) || 0;
        const targetTop = parseFloat(targetElement.style.top) || 0;
        // Calculate the difference
        const deltaX = targetLeft - sourceLeft;
        const deltaY = targetTop - sourceTop;
        console.log('📊 Source position:', { left: sourceLeft, top: sourceTop });
        console.log('📊 Target position:', { left: targetLeft, top: targetTop });
        console.log('📊 Position delta:', { deltaX, deltaY });
        // Get color and opacity information if color animation is enabled
        let sourceColor = '';
        let targetColor = '';
        let sourceBorderColor = '';
        let targetBorderColor = '';
        let sourceOpacity = '';
        let targetOpacity = '';
        let hasColorChange = false;
        let hasBorderColorChange = false;
        let hasOpacityChange = false;
        // Shadow animation variables
        let sourceShadow = '';
        let targetShadow = '';
        let hasShadowChange = false;
        // Size animation variables
        let sourceWidth = '';
        let targetWidth = '';
        let sourceHeight = '';
        let targetHeight = '';
        let sourceMinWidth = '';
        let targetMinWidth = '';
        let sourceMinHeight = '';
        let targetMinHeight = '';
        let sourceMaxWidth = '';
        let targetMaxWidth = '';
        let sourceMaxHeight = '';
        let targetMaxHeight = '';
        let hasSizeChange = false;
        console.log('🎨 Color animation enabled:', animateColor);
        console.log('🌑 Shadow animation enabled:', animateShadow);
        console.log('📏 Size animation enabled:', animateSize);
        if (animateColor) {
            const sourceComputedStyle = window.getComputedStyle(sourceElement);
            const targetComputedStyle = window.getComputedStyle(targetElement);
            sourceColor = sourceComputedStyle.backgroundColor;
            targetColor = targetComputedStyle.backgroundColor;
            sourceBorderColor = sourceComputedStyle.borderColor;
            targetBorderColor = targetComputedStyle.borderColor;
            sourceOpacity = sourceComputedStyle.opacity;
            targetOpacity = targetComputedStyle.opacity;
            console.log('🎨 Raw source color:', sourceColor);
            console.log('🎨 Raw target color:', targetColor);
            console.log('🎨 Raw source border color:', sourceBorderColor);
            console.log('🎨 Raw target border color:', targetBorderColor);
            console.log('🎨 Raw source opacity:', sourceOpacity);
            console.log('🎨 Raw target opacity:', targetOpacity);
            // Ensure we have valid color values
            if (!sourceColor || sourceColor === 'rgba(0, 0, 0, 0)' || sourceColor === 'transparent') {
                sourceColor = 'rgb(255, 107, 107)'; // Default red
                console.log('🎨 Using default source color:', sourceColor);
            }
            if (!targetColor || targetColor === 'rgba(0, 0, 0, 0)' || targetColor === 'transparent') {
                targetColor = 'rgb(243, 156, 18)'; // Default orange
                console.log('🎨 Using default target color:', targetColor);
            }
            hasColorChange = sourceColor !== targetColor;
            hasBorderColorChange = sourceBorderColor !== targetBorderColor;
            hasOpacityChange = sourceOpacity !== targetOpacity;
            console.log('🎨 Final source color:', sourceColor);
            console.log('🎨 Final target color:', targetColor);
            console.log('🎨 Final source border color:', sourceBorderColor);
            console.log('🎨 Final target border color:', targetBorderColor);
            console.log('🎨 Final source opacity:', sourceOpacity);
            console.log('🎨 Final target opacity:', targetOpacity);
            console.log('🎨 Color change detected:', hasColorChange);
            console.log('🎨 Border color change detected:', hasBorderColorChange);
            console.log('🎨 Opacity change detected:', hasOpacityChange);
        }
        // Shadow detection
        if (animateShadow) {
            const sourceComputedStyle = window.getComputedStyle(sourceElement);
            const targetComputedStyle = window.getComputedStyle(targetElement);
            sourceShadow = sourceComputedStyle.boxShadow;
            targetShadow = targetComputedStyle.boxShadow;
            console.log('🌑 Raw source shadow:', sourceShadow);
            console.log('🌑 Raw target shadow:', targetShadow);
            // Ensure we have valid shadow values
            if (!sourceShadow || sourceShadow === 'none') {
                sourceShadow = '0px 0px 0px 0px rgba(0, 0, 0, 0)'; // Default no shadow
                console.log('🌑 Using default source shadow:', sourceShadow);
            }
            if (!targetShadow || targetShadow === 'none') {
                targetShadow = '0px 0px 0px 0px rgba(0, 0, 0, 0)'; // Default no shadow
                console.log('🌑 Using default target shadow:', targetShadow);
            }
            hasShadowChange = sourceShadow !== targetShadow;
            console.log('🌑 Final source shadow:', sourceShadow);
            console.log('🌑 Final target shadow:', targetShadow);
            console.log('🌑 Shadow change detected:', hasShadowChange);
        }
        // Size detection
        if (animateSize) {
            const sourceComputedStyle = window.getComputedStyle(sourceElement);
            const targetComputedStyle = window.getComputedStyle(targetElement);
            // Extract size properties
            sourceWidth = sourceComputedStyle.width;
            targetWidth = targetComputedStyle.width;
            sourceHeight = sourceComputedStyle.height;
            targetHeight = targetComputedStyle.height;
            sourceMinWidth = sourceComputedStyle.minWidth;
            targetMinWidth = targetComputedStyle.minWidth;
            sourceMinHeight = sourceComputedStyle.minHeight;
            targetMinHeight = targetComputedStyle.minHeight;
            sourceMaxWidth = sourceComputedStyle.maxWidth;
            targetMaxWidth = targetComputedStyle.maxWidth;
            sourceMaxHeight = sourceComputedStyle.maxHeight;
            targetMaxHeight = targetComputedStyle.maxHeight;
            console.log('📏 Raw source width:', sourceWidth);
            console.log('📏 Raw target width:', targetWidth);
            console.log('📏 Raw source height:', sourceHeight);
            console.log('📏 Raw target height:', targetHeight);
            console.log('📏 Raw source min-width:', sourceMinWidth);
            console.log('📏 Raw target min-width:', targetMinWidth);
            console.log('📏 Raw source min-height:', sourceMinHeight);
            console.log('📏 Raw target min-height:', targetMinHeight);
            console.log('📏 Raw source max-width:', sourceMaxWidth);
            console.log('📏 Raw target max-width:', targetMaxWidth);
            console.log('📏 Raw source max-height:', sourceMaxHeight);
            console.log('📏 Raw target max-height:', targetMaxHeight);
            // Check for size changes
            hasSizeChange = (sourceWidth !== targetWidth ||
                sourceHeight !== targetHeight ||
                sourceMinWidth !== targetMinWidth ||
                sourceMinHeight !== targetMinHeight ||
                sourceMaxWidth !== targetMaxWidth ||
                sourceMaxHeight !== targetMaxHeight);
            console.log('📏 Final source width:', sourceWidth);
            console.log('📏 Final target width:', targetWidth);
            console.log('📏 Final source height:', sourceHeight);
            console.log('📏 Final target height:', targetHeight);
            console.log('📏 Final source min-width:', sourceMinWidth);
            console.log('📏 Final target min-width:', targetMinWidth);
            console.log('📏 Final source min-height:', sourceMinHeight);
            console.log('📏 Final target min-height:', targetMinHeight);
            console.log('📏 Final source max-width:', sourceMaxWidth);
            console.log('📏 Final target max-width:', targetMaxWidth);
            console.log('📏 Final source max-height:', sourceMaxHeight);
            console.log('📏 Final target max-height:', targetMaxHeight);
            console.log('📏 Size change detected:', hasSizeChange);
        }
        // Hide the target element initially
        targetElement.style.display = 'none';
        // Use CSS animations instead of transitions for better simultaneous control
        const animationName = `simple-animation-${Date.now()}`;
        // Create the keyframes for simultaneous animation
        const keyframes = `
      @keyframes ${animationName} {
        0% {
          transform: translate(0px, 0px);
          ${animateColor && hasColorChange ? `background-color: ${sourceColor};` : ''}
          ${animateColor && hasBorderColorChange ? `border-color: ${sourceBorderColor};` : ''}
          ${animateColor && hasOpacityChange ? `opacity: ${sourceOpacity};` : ''}
          ${animateShadow && hasShadowChange ? `box-shadow: ${sourceShadow};` : ''}
          ${animateSize && hasSizeChange ? `width: ${sourceWidth}; height: ${sourceHeight}; min-width: ${sourceMinWidth}; min-height: ${sourceMinHeight}; max-width: ${sourceMaxWidth}; max-height: ${sourceMaxHeight};` : ''}
        }
        100% {
          transform: translate(${deltaX}px, ${deltaY}px);
          ${animateColor && hasColorChange ? `background-color: ${targetColor};` : ''}
          ${animateColor && hasBorderColorChange ? `border-color: ${targetBorderColor};` : ''}
          ${animateColor && hasOpacityChange ? `opacity: ${targetOpacity};` : ''}
          ${animateShadow && hasShadowChange ? `box-shadow: ${targetShadow};` : ''}
          ${animateSize && hasSizeChange ? `width: ${targetWidth}; height: ${targetHeight}; min-width: ${targetMinWidth}; min-height: ${targetMinHeight}; max-width: ${targetMaxWidth}; max-height: ${targetMaxHeight};` : ''}
        }
      }
    `;
        console.log('🎬 Keyframes created:', keyframes);
        console.log('🎬 Expected final transform:', `translate(${deltaX}px, ${deltaY}px)`);
        console.log('🎬 Expected final color:', targetColor);
        console.log('🎬 Expected final border color:', targetBorderColor);
        console.log('🎬 Expected final opacity:', targetOpacity);
        console.log('🎬 Expected final shadow:', targetShadow);
        console.log('🎬 Expected final width:', targetWidth);
        console.log('🎬 Expected final height:', targetHeight);
        // Add the keyframes to the document
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
        // Apply the animation
        sourceElement.style.animation = `${animationName} ${duration}s ${easing} forwards`;
        // Clean up the style element after animation
        setTimeout(() => {
            document.head.removeChild(style);
        }, duration * 1000 + 100);
        // Listen for animation completion
        const onAnimationEnd = (event) => {
            if (event.animationName === animationName) {
                console.log('✅ SIMPLE ANIMATION: Animation completed');
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
                // Hide source and show target
                sourceElement.style.display = 'none';
                targetElement.style.display = 'flex';
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
            console.log('⏰ SIMPLE ANIMATION: Animation completed via timeout');
            sourceElement.removeEventListener('animationend', onAnimationEnd);
            sourceElement.style.animation = '';
            sourceElement.style.display = 'none';
            targetElement.style.display = 'flex';
            if (onComplete) {
                onComplete();
            }
            resolve();
        }, duration * 1000 + 1000);
        // Note: We're using a single timeout for completion, so no fallback needed
    });
}
/**
 * Simple variant switch function
 */
function simpleVariantSwitch(sourceElement, targetElement, options = {}) {
    console.log('🔄 SIMPLE VARIANT SWITCH: Starting variant switch');
    return simpleAnimate(sourceElement, targetElement, options);
}
/**
 * Instant variant switch (no animation)
 */
function instantVariantSwitch(sourceElement, targetElement) {
    console.log('⚡ INSTANT VARIANT SWITCH: Switching without animation');
    sourceElement.style.display = 'none';
    targetElement.style.display = 'flex';
}
/**
 * Reset animation state
 */
function resetAnimationState(sourceElement, targetElement) {
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
function officialStyleAnimate(sourceElement, targetElement, allVariants, transitionType, transitionDuration) {
    return new Promise((resolve) => {
        console.log('🎬 OFFICIAL-STYLE ANIMATION: Starting with simple approach');
        // Hide all variants except source
        allVariants.forEach(variant => {
            if (variant === sourceElement) {
                variant.style.display = 'flex';
                variant.classList.add('variant-active');
                variant.classList.remove('variant-hidden');
            }
            else {
                variant.style.display = 'none';
                variant.classList.add('variant-hidden');
                variant.classList.remove('variant-active');
            }
        });
        // Use the simple animation approach
        const duration = parseFloat(transitionDuration.toString()) || 0.5;
        const easing = getEasingFromTransitionType(transitionType);
        simpleAnimate(sourceElement, targetElement, {
            duration,
            easing,
            animateColor: true,
            animateShadow: true,
            animateSize: true,
            onComplete: () => {
                // Show target and hide source
                sourceElement.style.display = 'none';
                sourceElement.classList.add('variant-hidden');
                sourceElement.classList.remove('variant-active');
                targetElement.style.display = 'flex';
                targetElement.classList.add('variant-active');
                targetElement.classList.remove('variant-hidden');
                console.log('✅ OFFICIAL-STYLE ANIMATION: Completed');
                resolve();
            }
        });
    });
}
/**
 * Helper function to convert transition types to easing functions
 */
function getEasingFromTransitionType(transitionType) {
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
function generateSimpleTransitionHandler() {
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
     * Simple animation function using CSS keyframes
     */
    function simpleAnimate(sourceElement, targetElement, options = {}) {
      return new Promise((resolve) => {
        const {
          duration = 0.5,
          easing = 'ease-in-out',
          animateColor = false,
          animateShadow = false,
          animateSize = false,
          onComplete
        } = options;

        console.log('🎬 SIMPLE ANIMATION: Starting animation');
        console.log('📋 Source:', sourceElement.getAttribute('data-figma-id'));
        console.log('📋 Target:', targetElement.getAttribute('data-figma-id'));

        // Get positions from CSS styles
        const sourceLeft = parseFloat(sourceElement.style.left) || 0;
        const sourceTop = parseFloat(sourceElement.style.top) || 0;
        const targetLeft = parseFloat(targetElement.style.left) || 0;
        const targetTop = parseFloat(targetElement.style.top) || 0;

        // Calculate the difference
        const deltaX = targetLeft - sourceLeft;
        const deltaY = targetTop - sourceTop;

        console.log('📊 Source position:', { left: sourceLeft, top: sourceTop });
        console.log('📊 Target position:', { left: targetLeft, top: targetTop });
        console.log('📊 Position delta:', { deltaX, deltaY });

        // Get style information for animations
        let sourceColor = '';
        let targetColor = '';
        let sourceBorderColor = '';
        let targetBorderColor = '';
        let sourceOpacity = '';
        let targetOpacity = '';
        let hasColorChange = false;
        let hasBorderColorChange = false;
        let hasOpacityChange = false;
        
        let sourceShadow = '';
        let targetShadow = '';
        let hasShadowChange = false;
        
        let sourceWidth = '';
        let targetWidth = '';
        let sourceHeight = '';
        let targetHeight = '';
        let sourceMinWidth = '';
        let targetMinWidth = '';
        let sourceMinHeight = '';
        let targetMinHeight = '';
        let sourceMaxWidth = '';
        let targetMaxWidth = '';
        let sourceMaxHeight = '';
        let targetMaxHeight = '';
        let hasSizeChange = false;
        
        console.log('🎨 Color animation enabled:', animateColor);
        console.log('🌑 Shadow animation enabled:', animateShadow);
        console.log('📏 Size animation enabled:', animateSize);
        
        if (animateColor) {
          const sourceComputedStyle = window.getComputedStyle(sourceElement);
          const targetComputedStyle = window.getComputedStyle(targetElement);
          
          sourceColor = sourceComputedStyle.backgroundColor;
          targetColor = targetComputedStyle.backgroundColor;
          sourceBorderColor = sourceComputedStyle.borderColor;
          targetBorderColor = targetComputedStyle.borderColor;
          sourceOpacity = sourceComputedStyle.opacity;
          targetOpacity = targetComputedStyle.opacity;
          
          // Ensure we have valid color values
          if (!sourceColor || sourceColor === 'rgba(0, 0, 0, 0)' || sourceColor === 'transparent') {
            sourceColor = 'rgb(255, 107, 107)';
          }
          if (!targetColor || targetColor === 'rgba(0, 0, 0, 0)' || targetColor === 'transparent') {
            targetColor = 'rgb(243, 156, 18)';
          }
          
          hasColorChange = sourceColor !== targetColor;
          hasBorderColorChange = sourceBorderColor !== targetBorderColor;
          hasOpacityChange = sourceOpacity !== targetOpacity;
        }
        
        if (animateShadow) {
          const sourceComputedStyle = window.getComputedStyle(sourceElement);
          const targetComputedStyle = window.getComputedStyle(targetElement);
          
          sourceShadow = sourceComputedStyle.boxShadow;
          targetShadow = targetComputedStyle.boxShadow;
          
          if (!sourceShadow || sourceShadow === 'none') {
            sourceShadow = '0px 0px 0px 0px rgba(0, 0, 0, 0)';
          }
          if (!targetShadow || targetShadow === 'none') {
            targetShadow = '0px 0px 0px 0px rgba(0, 0, 0, 0)';
          }
          
          hasShadowChange = sourceShadow !== targetShadow;
        }
        
        if (animateSize) {
          const sourceComputedStyle = window.getComputedStyle(sourceElement);
          const targetComputedStyle = window.getComputedStyle(targetElement);
          
          sourceWidth = sourceComputedStyle.width;
          targetWidth = targetComputedStyle.width;
          sourceHeight = sourceComputedStyle.height;
          targetHeight = targetComputedStyle.height;
          sourceMinWidth = sourceComputedStyle.minWidth;
          targetMinWidth = targetComputedStyle.minWidth;
          sourceMinHeight = sourceComputedStyle.minHeight;
          targetMinHeight = targetComputedStyle.minHeight;
          sourceMaxWidth = sourceComputedStyle.maxWidth;
          targetMaxWidth = targetComputedStyle.maxWidth;
          sourceMaxHeight = sourceComputedStyle.maxHeight;
          targetMaxHeight = targetComputedStyle.maxHeight;
          
          hasSizeChange = (
            sourceWidth !== targetWidth ||
            sourceHeight !== targetHeight ||
            sourceMinWidth !== targetMinWidth ||
            sourceMinHeight !== targetMinHeight ||
            sourceMaxWidth !== targetMaxWidth ||
            sourceMaxHeight !== targetMaxHeight
          );
        }

        // Hide the target element initially
        targetElement.style.display = 'none';

        // Use CSS animations instead of transitions
        const animationName = 'simple-animation-' + Date.now();
        
        // Create the keyframes for simultaneous animation
        const keyframes = \`
          @keyframes \${animationName} {
            0% {
              transform: translate(0px, 0px);
              \${animateColor && hasColorChange ? \`background-color: \${sourceColor};\` : ''}
              \${animateColor && hasBorderColorChange ? \`border-color: \${sourceBorderColor};\` : ''}
              \${animateColor && hasOpacityChange ? \`opacity: \${sourceOpacity};\` : ''}
              \${animateShadow && hasShadowChange ? \`box-shadow: \${sourceShadow};\` : ''}
              \${animateSize && hasSizeChange ? \`width: \${sourceWidth}; height: \${sourceHeight}; min-width: \${sourceMinWidth}; min-height: \${sourceMinHeight}; max-width: \${sourceMaxWidth}; max-height: \${sourceMaxHeight};\` : ''}
            }
            100% {
              transform: translate(\${deltaX}px, \${deltaY}px);
              \${animateColor && hasColorChange ? \`background-color: \${targetColor};\` : ''}
              \${animateColor && hasBorderColorChange ? \`border-color: \${targetBorderColor};\` : ''}
              \${animateColor && hasOpacityChange ? \`opacity: \${targetOpacity};\` : ''}
              \${animateShadow && hasShadowChange ? \`box-shadow: \${targetShadow};\` : ''}
              \${animateSize && hasSizeChange ? \`width: \${targetWidth}; height: \${targetHeight}; min-width: \${targetMinWidth}; min-height: \${targetMinHeight}; max-width: \${targetMaxWidth}; max-height: \${targetMaxHeight};\` : ''}
            }
          }
        \`;
        
        console.log('🎬 Keyframes created:', keyframes);
        
        // Add the keyframes to the document
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
        
        // Apply the animation
        sourceElement.style.animation = \`\${animationName} \${duration}s \${easing} forwards\`;
        
        // Clean up the style element after animation
        setTimeout(() => {
          document.head.removeChild(style);
        }, duration * 1000 + 100);

        // Listen for animation completion
        const onAnimationEnd = (event) => {
          if (event.animationName === animationName) {
            console.log('✅ SIMPLE ANIMATION: Animation completed');
            
            // Clean up
            sourceElement.removeEventListener('animationend', onAnimationEnd);
            sourceElement.style.animation = '';
            
            // Hide source and show target
            sourceElement.style.display = 'none';
            targetElement.style.display = 'flex';
            
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
          console.log('⏰ SIMPLE ANIMATION: Animation completed via timeout');
          sourceElement.removeEventListener('animationend', onAnimationEnd);
          sourceElement.style.animation = '';
          sourceElement.style.display = 'none';
          targetElement.style.display = 'flex';
          
          if (onComplete) {
            onComplete();
          }
          
          resolve();
        }, duration * 1000 + 1000);
      });
    }
    
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
      
      try {
        // Hide all variants except source
        allVariants.forEach(variant => {
          if (variant === sourceElement) {
            variant.style.display = 'flex';
            variant.classList.add('variant-active');
            variant.classList.remove('variant-hidden');
          } else {
            variant.style.display = 'none';
            variant.classList.add('variant-hidden');
            variant.classList.remove('variant-active');
          }
        });
        
        // Use the simple animation approach
        const duration = parseFloat(transitionDuration.toString()) || 0.5;
        const easing = getEasingFunction(transitionType);
        
        await simpleAnimate(sourceElement, destination, {
          duration,
          easing,
          animateColor: true,
          animateShadow: true,
          animateSize: true,
          onComplete: () => {
            // Show target and hide source
            sourceElement.style.display = 'none';
            sourceElement.classList.add('variant-hidden');
            sourceElement.classList.remove('variant-active');
            
            destination.style.display = 'flex';
            destination.classList.add('variant-active');
            destination.classList.remove('variant-hidden');
          }
        });
        
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
