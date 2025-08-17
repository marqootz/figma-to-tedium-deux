(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["FigmaRefactoredSystem"] = factory();
	else
		root["FigmaRefactoredSystem"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 44:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createComponentSetInitializer = createComponentSetInitializer;
// Component set initialization logic
function createComponentSetInitializer() {
    return "\n      // Initialize component set variants - handle both single and multiple variants\n      // Handle both COMPONENT_SET and COMPONENT elements that contain variants\n      // With the new 1:1 structure, this will handle nested component sets correctly\n      const componentSets = document.querySelectorAll('[data-figma-type=\"COMPONENT_SET\"], [data-figma-type=\"COMPONENT\"]');\n      componentSets.forEach(componentSet => {\n        // CRITICAL: Position the component set container at 0px top/left\n        // This ensures all variants within it are positioned relative to 0px, not the original Figma position\n        componentSet.style.position = 'relative';\n        componentSet.style.top = '0px';\n        componentSet.style.left = '0px';\n        componentSet.style.transform = 'none';\n        componentSet.style.transition = '';\n        \n        console.log('DEBUG: Positioned component set at 0px top/left:', componentSet.getAttribute('data-figma-id'));\n        // Find all COMPONENT children - these are the variants\n        // Some may have explicit variant attributes, others are variants by hierarchy\n        const variants = componentSet.querySelectorAll('[data-figma-type=\"COMPONENT\"]');\n        \n        // Handle both single and multiple variants\n        if (variants.length >= 1) {\n          console.log('Initializing component set/instance with', variants.length, 'variants:', {\n            componentSetId: componentSet.getAttribute('data-figma-id'),\n            componentSetName: componentSet.getAttribute('data-figma-name'),\n            componentSetType: componentSet.getAttribute('data-figma-type'),\n            parentType: componentSet.parentElement?.getAttribute('data-figma-type'),\n            parentId: componentSet.parentElement?.getAttribute('data-figma-id'),\n            variantIds: Array.from(variants).map(v => v.getAttribute('data-figma-id'))\n          });\n          \n          // CRITICAL: Position all variants at 0px top/left and reset any residual styling\n          variants.forEach(variant => {\n            // Reset any residual styling from previous animations\n            variant.style.position = 'relative';\n            variant.style.top = '0px';\n            variant.style.left = '0px';\n            variant.style.transform = 'none';\n            variant.style.transition = '';\n            variant.style.opacity = '1'; // Ensure all variants start with opacity 1\n            \n            // Also reset all nested elements within each variant\n            const nestedElements = variant.querySelectorAll('[data-figma-id]');\n            nestedElements.forEach(nestedElement => {\n              (nestedElement as HTMLElement).style.position = 'relative';\n              (nestedElement as HTMLElement).style.top = '0px';\n              (nestedElement as HTMLElement).style.left = '0px';\n              (nestedElement as HTMLElement).style.transform = 'none';\n              (nestedElement as HTMLElement).style.transition = '';\n            });\n            \n            console.log('DEBUG: Positioned variant at 0px top/left:', variant.getAttribute('data-figma-id'));\n          });\n          \n          // For single components, just make them visible\n          if (variants.length === 1) {\n            const singleVariant = variants[0];\n            singleVariant.classList.add('variant-active');\n            singleVariant.classList.remove('variant-hidden');\n            console.log('Set single variant as active:', singleVariant.getAttribute('data-figma-id'), 'in component set:', componentSet.getAttribute('data-figma-id'));\n          } else {\n            // For multiple variants, the FIRST variant should be active initially (where reactions are)\n            // This ensures the animation starts from the variant with reactions\n            variants.forEach((variant, index) => {\n              if (index === 0) {\n                variant.classList.add('variant-active');\n                variant.classList.remove('variant-hidden');\n                console.log('Set first variant as active (with reactions):', variant.getAttribute('data-figma-id'), 'in component set:', componentSet.getAttribute('data-figma-id'));\n              } else {\n                variant.classList.add('variant-hidden');\n                variant.classList.remove('variant-active');\n                console.log('Set variant as hidden:', variant.getAttribute('data-figma-id'), 'in component set:', componentSet.getAttribute('data-figma-id'));\n              }\n            });\n          }\n        }\n      });\n  ";
}


/***/ }),

/***/ 120:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createVariantSwitchingHandler = createVariantSwitchingHandler;
// Variant switching handler - instant switching only, no animation
function createVariantSwitchingHandler() {
    return "\n      // Handle variant switching - instant switching only, no animation\n      // This is a simple slideshow-like system that switches between variants instantly\n      const variantButtons = document.querySelectorAll('[data-variant], [data-variant-property-1]');\n      variantButtons.forEach(button => {\n        button.addEventListener('click', function() {\n          console.log('DEBUG: Variant switch clicked');\n          \n          const variant = this.getAttribute('data-variant') || this.getAttribute('data-variant-property-1');\n          const targetId = this.getAttribute('data-target');\n          \n          if (targetId) {\n            const target = document.querySelector(`[data-figma-id=\"${targetId}\"]`);\n            if (target) {\n              console.log('Variant switch:', { variant, targetId, targetName: target.getAttribute('data-figma-name') });\n              \n              // Find the specific component set that contains this button\n              let componentSet = target;\n              let buttonElement = this;\n              \n              // Walk up the DOM tree to find the immediate component set parent\n              while (buttonElement && buttonElement.parentElement) {\n                buttonElement = buttonElement.parentElement;\n                if (buttonElement.getAttribute('data-figma-type') === 'COMPONENT_SET') {\n                  componentSet = buttonElement;\n                  console.log('Found component set for switching:', {\n                    id: componentSet.getAttribute('data-figma-id'),\n                    name: componentSet.getAttribute('data-figma-name')\n                  });\n                  break;\n                }\n              }\n              \n              // Get all variants within this specific component set instance\n              const allVariants = Array.from(componentSet.children).filter(child => \n                child.getAttribute('data-figma-type') === 'COMPONENT' &&\n                (child.getAttribute('data-variant') || child.getAttribute('data-variant-property-1'))\n              );\n              \n              console.log('Found', allVariants.length, 'variants in component set:', componentSet.getAttribute('data-figma-id'));\n              \n              // INSTANT VARIANT SWITCHING - Hide all variants\n              allVariants.forEach(variant => {\n                variant.classList.add('variant-hidden');\n                variant.classList.remove('variant-active');\n                // Ensure all variants maintain their original positioning (relative with 0px)\n                variant.style.position = 'relative';\n                variant.style.top = '0px';\n                variant.style.left = '0px';\n                console.log('Hidden variant:', variant.getAttribute('data-figma-id'));\n              });\n              \n              // Show selected variant instantly\n              const selectedVariant = allVariants.find(v => \n                v.getAttribute('data-variant') === variant || \n                v.getAttribute('data-variant-property-1') === variant\n              );\n              \n              if (selectedVariant) {\n                selectedVariant.classList.add('variant-active');\n                selectedVariant.classList.remove('variant-hidden');\n                // Ensure selected variant maintains its original positioning\n                selectedVariant.style.position = 'relative';\n                selectedVariant.style.top = '0px';\n                selectedVariant.style.left = '0px';\n                console.log('Switched to variant:', variant, 'in component set:', componentSet.getAttribute('data-figma-id'));\n                \n                // Start timeout reactions for the newly active variant\n                startTimeoutReactionsForNewlyActiveVariant(selectedVariant);\n                startTimeoutReactionsForNestedComponents(selectedVariant);\n              } else {\n                console.log('Selected variant not found:', variant, 'in component set:', componentSet.getAttribute('data-figma-id'));\n              }\n            }\n          }\n        });\n      });\n  ";
}


/***/ }),

/***/ 172:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.officialStyleAnimate = exports.generateSimpleTransitionHandler = exports.createComponentSetInitializer = exports.createThreePhaseTransitionHandler = exports.createTimeoutHandler = exports.createReactionHandler = exports.createVariantSwitchingHandler = exports.generateVariantAttributes = exports.generateReactionAttributes = void 0;
exports.generateEventHandlingJavaScript = generateEventHandlingJavaScript;
exports.generateExternalScriptReference = generateExternalScriptReference;
// Re-export all event functions
var attributes_1 = __webpack_require__(275);
Object.defineProperty(exports, "generateReactionAttributes", ({ enumerable: true, get: function () { return attributes_1.generateReactionAttributes; } }));
Object.defineProperty(exports, "generateVariantAttributes", ({ enumerable: true, get: function () { return attributes_1.generateVariantAttributes; } }));
var variant_handler_1 = __webpack_require__(120);
Object.defineProperty(exports, "createVariantSwitchingHandler", ({ enumerable: true, get: function () { return variant_handler_1.createVariantSwitchingHandler; } }));
var reaction_handler_1 = __webpack_require__(332);
Object.defineProperty(exports, "createReactionHandler", ({ enumerable: true, get: function () { return reaction_handler_1.createReactionHandler; } }));
Object.defineProperty(exports, "createTimeoutHandler", ({ enumerable: true, get: function () { return reaction_handler_1.createTimeoutHandler; } }));
var three_phase_transition_handler_1 = __webpack_require__(261);
Object.defineProperty(exports, "createThreePhaseTransitionHandler", ({ enumerable: true, get: function () { return three_phase_transition_handler_1.createThreePhaseTransitionHandler; } }));
var initializer_1 = __webpack_require__(44);
Object.defineProperty(exports, "createComponentSetInitializer", ({ enumerable: true, get: function () { return initializer_1.createComponentSetInitializer; } }));
var simple_animation_system_1 = __webpack_require__(825);
Object.defineProperty(exports, "generateSimpleTransitionHandler", ({ enumerable: true, get: function () { return simple_animation_system_1.generateSimpleTransitionHandler; } }));
Object.defineProperty(exports, "officialStyleAnimate", ({ enumerable: true, get: function () { return simple_animation_system_1.officialStyleAnimate; } }));
var reaction_handler_2 = __webpack_require__(332);
// Main event handling JavaScript generator
function generateEventHandlingJavaScript() {
    return "\n    // Reference the external refactored-system.js file\n    // This file contains all the animation and event handling logic\n    console.log('DEBUG: Event handling JavaScript loaded');\n    \n    // Global function for testing event handlers\n    window.handleFigmaEvent = function(eventType, elementId) {\n      console.log('DEBUG: Manual event trigger:', eventType, elementId);\n      const element = document.querySelector(`[data-figma-id=\"${elementId}\"]`);\n      if (element) {\n        if (eventType === 'click') {\n          element.click();\n        } else if (eventType === 'variant-switch') {\n          const variantButton = element.querySelector('[data-variant], [data-variant-property-1]');\n          if (variantButton) {\n            variantButton.click();\n          }\n        }\n      }\n    };\n    \n    // Global timer tracking\n    const activeTimers = new Map();\n    \n    // CRITICAL FIX: Add click event handlers for reaction elements\n    ".concat((0, reaction_handler_2.createReactionHandler)(), "\n    \n    // Function to start timeout reactions for nested components within a parent element\n    function startTimeoutReactionsForNestedComponents(parentElement) {\n      if (!parentElement) return;\n      \n      // Find all nested components with timeout reactions within the parent\n      const nestedComponents = parentElement.querySelectorAll('[data-has-reactions=\"true\"]');\n      \n      nestedComponents.forEach(element => {\n        const elementId = element.getAttribute('data-figma-id');\n        const elementName = element.getAttribute('data-figma-name');\n        const computedStyle = window.getComputedStyle(element);\n        \n        // Only start timers for elements that are actually visible\n        if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {\n          const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');\n          \n          if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {\n            console.log('DEBUG: Starting timeout reaction for nested component:', elementId, 'name:', elementName);\n            const timeoutId = setTimeout(() => {\n              activeTimers.delete(elementId);\n              const actionType = element.getAttribute('data-reaction-action-type');\n              const destinationId = element.getAttribute('data-reaction-destination');\n              const transitionType = element.getAttribute('data-reaction-transition-type');\n              const transitionDuration = element.getAttribute('data-reaction-transition-duration');\n              \n              if (window.handleReaction) {\n                window.handleReaction(element, destinationId, transitionType, transitionDuration);\n              } else {\n                console.error('DEBUG: handleReaction function not found in external script');\n              }\n            }, (trigger.timeout || 0) * 1000);\n            activeTimers.set(elementId, timeoutId);\n          } else if (activeTimers.has(elementId)) {\n            console.log('DEBUG: Skipping nested component', elementId, 'name:', elementName, '- timer already active');\n          }\n        } else {\n          console.log('DEBUG: Skipping nested component', elementId, 'name:', elementName, '- not visible');\n        }\n      });\n    }\n    \n    // Function to start timeout reactions for a specific newly active variant\n    function startTimeoutReactionsForNewlyActiveVariant(newlyActiveElement) {\n      if (!newlyActiveElement) return;\n      \n      const elementId = newlyActiveElement.getAttribute('data-figma-id');\n      const elementName = newlyActiveElement.getAttribute('data-figma-name');\n      const parentComponent = newlyActiveElement.closest('[data-figma-type=\"COMPONENT_SET\"]');\n      const parentName = parentComponent ? parentComponent.getAttribute('data-figma-name') : 'none';\n      \n      console.log('DEBUG: Processing newly active variant:', elementId, 'name:', elementName, 'parent:', parentName);\n      \n      // Only start timers for variants that are actually visible (not hidden by CSS)\n      const computedStyle = window.getComputedStyle(newlyActiveElement);\n      \n      if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {\n        const trigger = JSON.parse(newlyActiveElement.getAttribute('data-reaction-trigger') || '{}');\n        const actionType = newlyActiveElement.getAttribute('data-reaction-action-type');\n        const destinationId = newlyActiveElement.getAttribute('data-reaction-destination');\n        const transitionType = newlyActiveElement.getAttribute('data-reaction-transition-type');\n        const transitionDuration = newlyActiveElement.getAttribute('data-reaction-transition-duration');\n        \n        // Handle timeout reactions only for active variants that don't have an active timer\n        if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {\n          console.log('DEBUG: Starting timeout reaction for newly active variant:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'parent:', parentName);\n          const timeoutId = setTimeout(() => {\n            activeTimers.delete(elementId); // Clear the timer when it completes\n            if (window.handleReaction) {\n              window.handleReaction(newlyActiveElement, destinationId, transitionType, transitionDuration);\n            } else {\n              console.error('DEBUG: handleReaction function not found in external script');\n            }\n          }, (trigger.timeout || 0) * 1000);\n          activeTimers.set(elementId, timeoutId);\n        } else if (activeTimers.has(elementId)) {\n          console.log('DEBUG: Skipping newly active variant', elementId, 'name:', elementName, '- timer already active');\n        }\n        \n        // CRITICAL FIX: Also start timeout reactions for any nested components within this newly active variant\n        startTimeoutReactionsForNestedComponents(newlyActiveElement);\n      } else {\n        console.log('DEBUG: Skipping newly active variant', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');\n      }\n    }\n    \n    // Function to start timeout reactions for the initial visible variant\n    function startTimeoutReactionsForInitialVariant() {\n      // Find the first visible variant that should start the flow\n      const componentSets = document.querySelectorAll('[data-figma-type=\"COMPONENT_SET\"]');\n      console.log('DEBUG: Found', componentSets.length, 'component sets');\n      \n      // Also check for any elements with reactions\n      const allReactionElements = document.querySelectorAll('[data-has-reactions=\"true\"]');\n      console.log('DEBUG: Found', allReactionElements.length, 'total elements with reactions');\n      \n      // Log details about reaction elements\n      allReactionElements.forEach((element, index) => {\n        const elementId = element.getAttribute('data-figma-id');\n        const elementName = element.getAttribute('data-figma-name');\n        const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');\n        const computedStyle = window.getComputedStyle(element);\n        \n        console.log('DEBUG: Reaction element', index + 1, ':', {\n          id: elementId,\n          name: elementName,\n          trigger: trigger,\n          display: computedStyle.display,\n          visibility: computedStyle.visibility,\n          isActive: element.classList.contains('variant-active'),\n          isHidden: element.classList.contains('variant-hidden')\n        });\n      });\n      \n      componentSets.forEach(componentSet => {\n        const componentSetName = componentSet.getAttribute('data-figma-name');\n        const activeVariants = componentSet.querySelectorAll('.variant-active[data-has-reactions=\"true\"]');\n        console.log('DEBUG: Component set', componentSetName, 'has', activeVariants.length, 'active variants with reactions');\n        \n        // Only start timers for the first active variant in each component set\n        if (activeVariants.length > 0) {\n          const firstActiveVariant = activeVariants[0];\n          const elementId = firstActiveVariant.getAttribute('data-figma-id');\n          const elementName = firstActiveVariant.getAttribute('data-figma-name');\n          const computedStyle = window.getComputedStyle(firstActiveVariant);\n          \n          console.log('DEBUG: Processing initial variant:', elementId, 'name:', elementName, 'in component set:', componentSetName);\n          \n          // Only start timer if the variant is actually visible\n          if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {\n            const trigger = JSON.parse(firstActiveVariant.getAttribute('data-reaction-trigger') || '{}');\n            \n            if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {\n              console.log('DEBUG: Starting initial timeout reaction for:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'in component set:', componentSetName);\n              \n              const timeoutId = setTimeout(() => {\n                console.log('DEBUG: Timeout triggered for element:', elementId, 'name:', elementName);\n                activeTimers.delete(elementId);\n                const actionType = firstActiveVariant.getAttribute('data-reaction-action-type');\n                const destinationId = firstActiveVariant.getAttribute('data-reaction-destination');\n                const transitionType = firstActiveVariant.getAttribute('data-reaction-transition-type');\n                const transitionDuration = firstActiveVariant.getAttribute('data-reaction-transition-duration');\n                \n                console.log('DEBUG: Calling handleReaction with:', {\n                  destinationId: destinationId,\n                  transitionType: transitionType,\n                  transitionDuration: transitionDuration\n                });\n                \n                // Call the handleReaction function from the external refactored-system.js\n                if (window.handleReaction) {\n                  window.handleReaction(firstActiveVariant, destinationId, transitionType, transitionDuration);\n                } else {\n                  console.error('DEBUG: handleReaction function not found in external script');\n                }\n              }, (trigger.timeout || 0) * 1000);\n              \n              activeTimers.set(elementId, timeoutId);\n              console.log('DEBUG: Created timeout timer for element:', elementId, 'timeout ID:', timeoutId, 'duration:', (trigger.timeout || 0) * 1000, 'ms');\n            } else {\n              console.log('DEBUG: Skipping initial variant', elementId, 'name:', elementName, '- no timeout trigger or timer already active');\n            }\n            \n            // CRITICAL FIX: Also start timeout reactions for any nested components within this initial variant\n            startTimeoutReactionsForNestedComponents(firstActiveVariant);\n          } else {\n            console.log('DEBUG: Skipping initial variant', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');\n          }\n        }\n      });\n      \n      // Also check for any non-variant elements with reactions\n      const nonVariantReactionElements = document.querySelectorAll('[data-has-reactions=\"true\"]:not([data-figma-type=\"COMPONENT\"])');\n      nonVariantReactionElements.forEach(element => {\n        const elementId = element.getAttribute('data-figma-id');\n        const elementName = element.getAttribute('data-figma-name');\n        const computedStyle = window.getComputedStyle(element);\n        \n        if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {\n          const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');\n          \n          if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {\n            console.log('DEBUG: Starting timeout reaction for initial non-variant element:', elementId, 'name:', elementName);\n            const timeoutId = setTimeout(() => {\n              activeTimers.delete(elementId);\n              const actionType = element.getAttribute('data-reaction-action-type');\n              const destinationId = element.getAttribute('data-reaction-destination');\n              const transitionType = element.getAttribute('data-reaction-transition-type');\n              const transitionDuration = element.getAttribute('data-reaction-transition-duration');\n              \n              if (window.handleReaction) {\n                window.handleReaction(element, destinationId, transitionType, transitionDuration);\n              } else {\n                console.error('DEBUG: handleReaction function not found in external script');\n              }\n            }, (trigger.timeout || 0) * 1000);\n            activeTimers.set(elementId, timeoutId);\n            \n            // CRITICAL FIX: Also start timeout reactions for any nested components within this element\n            startTimeoutReactionsForNestedComponents(element);\n          } else {\n            console.log('DEBUG: Skipping initial non-variant element', elementId, 'name:', elementName, '- no timeout trigger or timer already active');\n          }\n        } else {\n          console.log('DEBUG: Skipping initial non-variant element', elementId, 'name:', elementName, '- not visible');\n        }\n      });\n    }\n    \n    document.addEventListener('DOMContentLoaded', function() {\n      console.log('DEBUG: DOMContentLoaded event fired');\n      console.log('DEBUG: Using external refactored-system.js file');\n      console.log('DEBUG: Starting component set initialization...');\n      \n      // Initialize component sets\n      const componentSets = document.querySelectorAll('[data-figma-type=\"COMPONENT_SET\"]');\n      console.log('DEBUG: Found', componentSets.length, 'component sets');\n      console.log('DEBUG: Component sets found:', Array.from(componentSets).map(cs => cs.getAttribute('data-figma-name')));\n      \n      componentSets.forEach(componentSet => {\n        const componentSetId = componentSet.getAttribute('data-figma-id');\n        const componentSetName = componentSet.getAttribute('data-figma-name');\n        const componentSetType = componentSet.getAttribute('data-figma-type');\n        const parentType = componentSet.parentElement ? componentSet.parentElement.getAttribute('data-figma-type') : 'NONE';\n        const parentId = componentSet.parentElement ? componentSet.parentElement.getAttribute('data-figma-id') : 'NONE';\n        \n        console.log('Initializing component set/instance with', componentSet.children.length, 'variants:', {\n          componentSetId: componentSetId,\n          componentSetName: componentSetName,\n          componentSetType: componentSetType,\n          parentType: parentType,\n          parentId: parentId\n        });\n        \n        // Get all variants (COMPONENT elements)\n        const variants = Array.from(componentSet.children).filter(child => \n          child.getAttribute('data-figma-type') === 'COMPONENT'\n        );\n        \n        if (variants.length > 0) {\n          // Set first variant as active\n          const firstVariant = variants[0];\n          const firstVariantId = firstVariant.getAttribute('data-figma-id');\n          console.log('Set first variant as active (with reactions):', firstVariantId, 'in component set:', componentSetId);\n          firstVariant.classList.add('variant-active');\n          firstVariant.classList.remove('variant-hidden');\n          \n          // Hide all other variants\n          variants.slice(1).forEach(variant => {\n            const variantId = variant.getAttribute('data-figma-id');\n            console.log('Set variant as hidden:', variantId, 'in component set:', componentSetId);\n            variant.classList.add('variant-hidden');\n            variant.classList.remove('variant-active');\n          });\n        }\n      });\n      \n      // Start timeout reactions after a short delay\n      setTimeout(() => {\n        console.log('DEBUG: Starting initial timeout reactions');\n        startTimeoutReactionsForInitialVariant();\n      }, 100);\n    });\n    \n    // Export timeout reaction functions for use by the three-phase transition handler\n    window.startTimeoutReactionsForNewlyActiveVariant = startTimeoutReactionsForNewlyActiveVariant;\n    window.startTimeoutReactionsForNestedComponents = startTimeoutReactionsForNestedComponents;\n  ");
}
// Generate script tag that references the external file
function generateExternalScriptReference() {
    return "<script src=\"refactored-system.js?v=".concat(Date.now(), "\"></script>");
}


/***/ }),

/***/ 192:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * Animation Application Module
 *
 * Responsible for applying animations to elements based on detected changes.
 * This module handles the logic for setting up CSS transitions, applying
 * property changes, and managing the animation lifecycle.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getEasingFunction = getEasingFunction;
exports.applyAnimationChange = applyAnimationChange;
exports.applyAnimationChanges = applyAnimationChanges;
exports.setupElementAnimation = setupElementAnimation;
var animation_detector_1 = __webpack_require__(585);
/**
 * Get easing function for animation type
 */
function getEasingFunction(animationType) {
    switch (animationType) {
        case 'EASE_IN_AND_OUT_BACK':
            return 'ease-in-out';
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
 * Apply animation change to an element
 */
function applyAnimationChange(element, change, duration, easing, destination) {
    var type = change.type, property = change.property, targetValue = change.targetValue, translationCondition = change.translationCondition;
    console.log('DEBUG: Applying animation change:', { type: type, property: property, targetValue: targetValue, translationCondition: translationCondition });
    // Get transition property
    var transitionProperty = property;
    if (type === animation_detector_1.AnimationType.TRANSFORM) {
        if (translationCondition === animation_detector_1.TranslationCondition.ABSOLUTE) {
            transitionProperty = property === 'translateX' ? 'left' : 'top';
        }
        else if (translationCondition === animation_detector_1.TranslationCondition.RELATIVE_PADDING) {
            transitionProperty = property.replace('parent_', '');
        }
        else if (translationCondition === animation_detector_1.TranslationCondition.RELATIVE_ALIGNMENT) {
            if (property === 'alignTranslateX' || property === 'alignTranslateY') {
                transitionProperty = property === 'alignTranslateX' ? 'left' : 'top';
            }
            else if (property.startsWith('parent_')) {
                // For alignment changes, animate the element's position instead of the parent's alignment
                if (property === 'parent_justifyContent') {
                    // Use the target element's actual position from the destination variant
                    var sourceElementName = element.getAttribute('data-figma-name');
                    var targetElement = destination === null || destination === void 0 ? void 0 : destination.querySelector("[data-figma-name=\"".concat(sourceElementName, "\"]"));
                    if (targetElement) {
                        var targetRect = targetElement.getBoundingClientRect();
                        var parent_1 = element.parentElement;
                        var parentRect = parent_1 === null || parent_1 === void 0 ? void 0 : parent_1.getBoundingClientRect();
                        if (parent_1 && parentRect) {
                            // Calculate the target position relative to the parent
                            var targetLeft = targetRect.left - parentRect.left;
                            console.log('DEBUG: Calculating justifyContent animation using target position:', {
                                currentLeft: element.getBoundingClientRect().left - parentRect.left,
                                targetLeft: targetLeft,
                                targetElementId: targetElement.getAttribute('data-figma-id'),
                                targetElementName: sourceElementName,
                                justifyContent: targetValue
                            });
                            // Set transition for left position
                            element.style.transition = "left ".concat(duration, "s ").concat(easing);
                            element.style.left = "".concat(targetLeft, "px");
                            console.log('DEBUG: Applied justifyContent animation via target position:', {
                                property: 'left',
                                transitionProperty: 'left',
                                targetValue: "".concat(targetLeft, "px")
                            });
                            return; // Skip the default handling
                        }
                    }
                    else {
                        console.log('DEBUG: Target element not found in destination by name:', sourceElementName);
                    }
                }
                else if (property === 'parent_alignItems') {
                    // Use the target element's actual position from the destination variant
                    var sourceElementName = element.getAttribute('data-figma-name');
                    var targetElement = destination === null || destination === void 0 ? void 0 : destination.querySelector("[data-figma-name=\"".concat(sourceElementName, "\"]"));
                    if (targetElement) {
                        var targetRect = targetElement.getBoundingClientRect();
                        var parent_2 = element.parentElement;
                        var parentRect = parent_2 === null || parent_2 === void 0 ? void 0 : parent_2.getBoundingClientRect();
                        if (parent_2 && parentRect) {
                            // Calculate the target position relative to the parent
                            var targetTop = targetRect.top - parentRect.top;
                            console.log('DEBUG: Calculating alignItems animation using target position:', {
                                currentTop: element.getBoundingClientRect().top - parentRect.top,
                                targetTop: targetTop,
                                targetElementId: targetElement.getAttribute('data-figma-id'),
                                targetElementName: sourceElementName,
                                alignItems: targetValue
                            });
                            // Set transition for top position
                            element.style.transition = "top ".concat(duration, "s ").concat(easing);
                            element.style.top = "".concat(targetTop, "px");
                            console.log('DEBUG: Applied alignItems animation via target position:', {
                                property: 'top',
                                transitionProperty: 'top',
                                targetValue: "".concat(targetTop, "px")
                            });
                            return; // Skip the default handling
                        }
                    }
                    else {
                        console.log('DEBUG: Target element not found in destination by name:', sourceElementName);
                    }
                }
                transitionProperty = property.replace('parent_', '');
            }
            else {
                transitionProperty = property;
            }
        }
    }
    // Set up transition
    element.style.transition = "".concat(transitionProperty, " ").concat(duration, "s ").concat(easing);
    // Apply the change based on type and condition
    switch (type) {
        case animation_detector_1.AnimationType.SIMPLE:
            element.style[property] = targetValue;
            break;
        case animation_detector_1.AnimationType.SIZE:
            element.style[property] = "".concat(targetValue, "px");
            break;
        case animation_detector_1.AnimationType.TRANSFORM:
            if (translationCondition === animation_detector_1.TranslationCondition.ABSOLUTE) {
                if (change.isCombinedTransform && property === 'translate') {
                    // Handle combined X and Y transform for simultaneous movement
                    var translateX = targetValue.x, translateY = targetValue.y;
                    // Use CSS transform for hardware-accelerated simultaneous animation
                    element.style.transition = "transform ".concat(duration, "s ").concat(easing);
                    element.style.transform = "translate(".concat(translateX, "px, ").concat(translateY, "px)");
                    console.log('DEBUG: Applying combined transform animation:', {
                        translateX: translateX,
                        translateY: translateY,
                        elementName: element.getAttribute('data-figma-name'),
                        currentTransform: element.style.transform,
                        targetTransform: "translate(".concat(translateX, "px, ").concat(translateY, "px)")
                    });
                }
                else if (property === 'translateX') {
                    // For additive position changes, add the difference to current position
                    var currentLeft = parseFloat(element.style.left) || 0;
                    var newLeft = currentLeft + targetValue;
                    element.style.left = "".concat(newLeft, "px");
                    console.log('DEBUG: Applying additive translateX animation:', {
                        currentLeft: currentLeft,
                        targetValue: targetValue,
                        newLeft: newLeft,
                        elementName: element.getAttribute('data-figma-name')
                    });
                }
                else if (property === 'translateY') {
                    // For additive position changes, add the difference to current position
                    var currentTop = parseFloat(element.style.top) || 0;
                    var newTop = currentTop + targetValue;
                    element.style.top = "".concat(newTop, "px");
                    console.log('DEBUG: Applying additive translateY animation:', {
                        currentTop: currentTop,
                        targetValue: targetValue,
                        newTop: newTop,
                        elementName: element.getAttribute('data-figma-name')
                    });
                }
            }
            else if (translationCondition === animation_detector_1.TranslationCondition.RELATIVE_PADDING) {
                if (element.parentElement) {
                    var paddingProperty = property.replace('parent_', '');
                    element.parentElement.style[paddingProperty] = "".concat(targetValue, "px");
                }
            }
            else if (translationCondition === animation_detector_1.TranslationCondition.RELATIVE_ALIGNMENT) {
                if (property === 'alignTranslateX') {
                    element.style.left = "".concat(targetValue, "px");
                }
                else if (property === 'alignTranslateY') {
                    element.style.top = "".concat(targetValue, "px");
                }
                else if (property.startsWith('parent_')) {
                    if (element.parentElement) {
                        var alignmentProperty = property.replace('parent_', '');
                        element.parentElement.style[alignmentProperty] = targetValue;
                    }
                }
                else {
                    // Direct property change on the element
                    element.style[property] = targetValue;
                }
            }
            break;
    }
    console.log('DEBUG: Applied change:', { property: property, transitionProperty: transitionProperty, targetValue: targetValue });
}
/**
 * Apply multiple animation changes to an element
 */
function applyAnimationChanges(element, changes, duration, easing, destination) {
    changes.forEach(function (change) {
        applyAnimationChange(element, change, duration, easing, destination);
    });
}
/**
 * Setup animation for element with property changes
 */
function setupElementAnimation(element, changes, duration, easing, destination) {
    console.log('DEBUG: Processing element with changes:', changes);
    // Convert the detected changes to animation changes
    var animationChanges = [];
    // Handle position changes - use combined transform for simultaneous X and Y movement
    var hasPositionX = changes.positionX && changes.positionX.changed;
    var hasPositionY = changes.positionY && changes.positionY.changed;
    if (hasPositionX || hasPositionY) {
        // Create a single combined transform animation
        var translateX = hasPositionX ? changes.positionX.targetValue : 0;
        var translateY = hasPositionY ? changes.positionY.targetValue : 0;
        animationChanges.push({
            type: animation_detector_1.AnimationType.TRANSFORM,
            property: 'translate',
            sourceValue: { x: 0, y: 0 },
            targetValue: { x: translateX, y: translateY },
            changed: true,
            translationCondition: animation_detector_1.TranslationCondition.ABSOLUTE,
            isCombinedTransform: true
        });
        console.log('DEBUG: Created combined transform animation:', {
            translateX: translateX,
            translateY: translateY,
            elementName: element.getAttribute('data-figma-name')
        });
    }
    // Handle color changes
    if (changes.backgroundColor && changes.backgroundColor.changed) {
        animationChanges.push({
            type: animation_detector_1.AnimationType.SIMPLE,
            property: 'backgroundColor',
            sourceValue: changes.backgroundColor.sourceValue,
            targetValue: changes.backgroundColor.targetValue,
            changed: true
        });
    }
    if (changes.color && changes.color.changed) {
        animationChanges.push({
            type: animation_detector_1.AnimationType.SIMPLE,
            property: 'color',
            sourceValue: changes.color.sourceValue,
            targetValue: changes.color.targetValue,
            changed: true
        });
    }
    // Handle alignment changes
    if (changes.justifyContent && changes.justifyContent.changed) {
        // Calculate the position difference that the alignment change creates
        var parent_3 = element.parentElement;
        if (parent_3) {
            var parentRect = parent_3.getBoundingClientRect();
            var elementRect = element.getBoundingClientRect();
            var elementWidth = elementRect.width;
            // Calculate current position relative to parent
            var currentLeft = elementRect.left - parentRect.left;
            // Calculate target position based on alignment change
            var targetLeft = currentLeft;
            if (changes.justifyContent.targetValue === 'flex-end') {
                targetLeft = parentRect.width - elementWidth;
            }
            else if (changes.justifyContent.targetValue === 'center') {
                targetLeft = (parentRect.width - elementWidth) / 2;
            }
            else if (changes.justifyContent.targetValue === 'flex-start') {
                targetLeft = 0;
            }
            // Only animate if there's actually a position difference
            if (Math.abs(currentLeft - targetLeft) > 1) {
                console.log('DEBUG: Calculating justifyContent position animation:', {
                    currentLeft: currentLeft,
                    targetLeft: targetLeft,
                    justifyContent: changes.justifyContent.targetValue,
                    parentWidth: parentRect.width,
                    elementWidth: elementWidth
                });
                // Animate the position, NOT the alignment
                element.style.transition = "left ".concat(duration, "s ").concat(easing);
                element.style.left = "".concat(targetLeft, "px");
                console.log('DEBUG: Applied justifyContent position animation:', {
                    property: 'left',
                    transitionProperty: 'left',
                    targetValue: "".concat(targetLeft, "px")
                });
            }
            else {
                console.log('DEBUG: JustifyContent change detected but no position difference - skipping animation');
            }
            // Don't add to animationChanges array since we're handling it directly
            return;
        }
    }
    if (changes.alignItems && changes.alignItems.changed) {
        // Calculate the position difference that the alignment change creates
        var parent_4 = element.parentElement;
        if (parent_4) {
            var parentRect = parent_4.getBoundingClientRect();
            var elementRect = element.getBoundingClientRect();
            var elementHeight = elementRect.height;
            // Calculate current position relative to parent
            var currentTop = elementRect.top - parentRect.top;
            // Calculate target position based on alignment change
            var targetTop = currentTop;
            if (changes.alignItems.targetValue === 'flex-end') {
                targetTop = parentRect.height - elementHeight;
            }
            else if (changes.alignItems.targetValue === 'center') {
                targetTop = (parentRect.height - elementHeight) / 2;
            }
            else if (changes.alignItems.targetValue === 'flex-start') {
                targetTop = 0;
            }
            // Only animate if there's actually a position difference
            if (Math.abs(currentTop - targetTop) > 1) {
                console.log('DEBUG: Calculating alignItems position animation:', {
                    currentTop: currentTop,
                    targetTop: targetTop,
                    alignItems: changes.alignItems.targetValue,
                    parentHeight: parentRect.height,
                    elementHeight: elementHeight
                });
                // Animate the position, NOT the alignment
                element.style.transition = "top ".concat(duration, "s ").concat(easing);
                element.style.top = "".concat(targetTop, "px");
                console.log('DEBUG: Applied alignItems position animation:', {
                    property: 'top',
                    transitionProperty: 'top',
                    targetValue: "".concat(targetTop, "px")
                });
            }
            else {
                console.log('DEBUG: AlignItems change detected but no position difference - skipping animation');
            }
            // Don't add to animationChanges array since we're handling it directly
            return;
        }
    }
    // Note: justifyContent and alignItems changes are handled directly above
    // and only applied if there's an actual position difference
    console.log('DEBUG: Converted to animation changes:', animationChanges);
    // Apply each change
    animationChanges.forEach(function (change) {
        applyAnimationChange(element, change, duration, easing, destination);
    });
}


/***/ }),

/***/ 261:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createThreePhaseTransitionHandler = createThreePhaseTransitionHandler;
/**
 * Creates a three-phase transition handler that follows the setup, animate, cleanup pattern
 */
function createThreePhaseTransitionHandler() {
    return "\n    // Global transition lock to prevent multiple simultaneous transitions\n    let isTransitionInProgress = false;\n    let currentTransitionPromise = null;\n    let currentAnimationSession = null;\n    \n    // Animation types\n    const AnimationType = {\n      SIMPLE: 'SIMPLE',\n      SIZE: 'SIZE', \n      TRANSFORM: 'TRANSFORM'\n    };\n    \n    // Translation conditions\n    const TranslationCondition = {\n      ABSOLUTE: 'ABSOLUTE',\n      RELATIVE_PADDING: 'RELATIVE_PADDING',\n      RELATIVE_ALIGNMENT: 'RELATIVE_ALIGNMENT'\n    };\n    \n    /**\n     * PHASE 1: SETUP - Sets initial values on nodes/variants/instances/sets/etc.\n     * Primes HTML for animation from variant 1 to 2\n     */\n    function setupAnimationSession(sourceElement, targetElement, allVariants, transitionType, transitionDuration) {\n      console.log('\uD83C\uDFAC SETUP PHASE: Initializing animation session');\n      \n      // Create animation session\n      const session = {\n        sourceElement,\n        targetElement,\n        sourceCopy: null,\n        allVariants,\n        transitionType,\n        transitionDuration,\n        isActive: true\n      };\n\n      // CRITICAL FIX: Reset all variants to a clean state first\n      allVariants.forEach(variant => {\n        // Reset any residual styling from previous animations\n        variant.style.position = 'relative';\n        variant.style.left = '';\n        variant.style.top = '';\n        variant.style.transform = '';\n        variant.style.transition = '';\n        \n        // Reset all nested elements within each variant\n        const nestedElements = variant.querySelectorAll('[data-figma-id]');\n        nestedElements.forEach(nestedElement => {\n          nestedElement.style.position = 'relative';\n          nestedElement.style.left = '';\n          nestedElement.style.top = '';\n          nestedElement.style.transform = '';\n          nestedElement.style.transition = '';\n        });\n      });\n\n      // Set initial state for all variants - only use display\n      allVariants.forEach(variant => {\n        if (variant === sourceElement) {\n          // Source variant should be visible initially\n          variant.classList.add('variant-active');\n          variant.classList.remove('variant-hidden');\n          variant.style.display = 'flex';\n        } else {\n          // All other variants should be hidden\n          variant.classList.add('variant-hidden');\n          variant.classList.remove('variant-active');\n          variant.style.display = 'none';\n        }\n      });\n\n      // Prepare target variant but keep it hidden\n      targetElement.classList.add('variant-active');\n      targetElement.classList.remove('variant-hidden');\n      targetElement.style.display = 'none';\n\n      // PHASE 1 IMPROVEMENT: Create copy in setup but keep it hidden\n      session.sourceCopy = createElementCopy(session.sourceElement);\n      console.log('\uD83D\uDCCB SETUP PHASE: Created source element copy (hidden)');\n      console.log('\uD83D\uDD0D DEBUG: Copy after creation - children:', session.sourceCopy ? session.sourceCopy.children.length : 'null');\n      console.log('\uD83D\uDD0D DEBUG: Copy after creation - innerHTML length:', session.sourceCopy ? session.sourceCopy.innerHTML.length : 'null');\n      \n      // Insert the copy into the DOM but keep it hidden\n      const sourceParent = session.sourceElement.parentElement;\n      if (sourceParent && session.sourceCopy) {\n        console.log('\uD83D\uDD0D DEBUG: About to insert copy. Source parent:', sourceParent.tagName, sourceParent.getAttribute('data-figma-id'));\n        console.log('\uD83D\uDD0D DEBUG: Copy element before insertion:', session.sourceCopy.tagName, session.sourceCopy.getAttribute('data-figma-id'));\n        \n        sourceParent.insertBefore(session.sourceCopy, session.sourceElement);\n        \n        console.log('\uD83D\uDD0D DEBUG: Copy inserted. Checking DOM...');\n        console.log('\uD83D\uDD0D DEBUG: Copy in DOM after insertion:', document.contains(session.sourceCopy));\n        console.log('\uD83D\uDD0D DEBUG: Copy parent after insertion:', session.sourceCopy.parentElement ? session.sourceCopy.parentElement.tagName : 'null');\n        console.log('\uD83D\uDD0D DEBUG: Copy next sibling:', session.sourceCopy.nextElementSibling ? session.sourceCopy.nextElementSibling.getAttribute('data-figma-id') : 'null');\n        console.log('\uD83D\uDD0D DEBUG: Copy previous sibling:', session.sourceCopy.previousElementSibling ? session.sourceCopy.previousElementSibling.getAttribute('data-figma-id') : 'null');\n        \n        hideCopy(session.sourceCopy, 'setup phase - keeping hidden until animation starts');\n        console.log('\uD83D\uDCCB SETUP PHASE: Inserted copy into DOM (hidden)');\n        console.log('\uD83D\uDD0D DEBUG: Copy after insertion - parent:', session.sourceCopy.parentElement ? 'exists' : 'null');\n        console.log('\uD83D\uDD0D DEBUG: Copy after insertion - display:', session.sourceCopy.style.display);\n      } else {\n        console.log('\u274C ERROR: Cannot insert copy - sourceParent:', !!sourceParent, 'session.sourceCopy:', !!session.sourceCopy);\n      }\n\n      console.log('\u2705 SETUP PHASE: Animation session initialized');\n      return session;\n    }\n    \n    /**\n     * PHASE 2: ANIMATE - Performs copy of source, hides source, animates values if necessary\n     */\n    async function animateVariantTransition(session) {\n      console.log('\uD83C\uDFAD ANIMATE PHASE: Starting variant transition animation');\n      \n      if (!session.isActive) {\n        console.log('\u274C ANIMATE PHASE: Session is not active, skipping animation');\n        return;\n      }\n\n      // PHASE 2 IMPROVEMENT: Show the copy and hide the source\n      if (session.sourceCopy) {\n        // Show the copy that was created in setup phase using enhanced display control\n        showCopy(session.sourceCopy, 'animate phase - starting animation');\n        console.log('\uD83D\uDCCB ANIMATE PHASE: Showed copy (created in setup phase)');\n      }\n\n      // Hide the original source element - only use display\n      session.sourceElement.style.display = 'none';\n      console.log('\uD83D\uDCCB ANIMATE PHASE: Hidden source element');\n      console.log('\uD83D\uDD0D DEBUG: Source element display:', session.sourceElement.style.display);\n      \n      // ENHANCED DISPLAY CONTROL: Detailed copy status logging\n      const copyStatus = getCopyDisplayStatus(session.sourceCopy);\n      console.log('\uD83D\uDD0D DEBUG: Copy display status:', copyStatus);\n      console.log('\uD83D\uDD0D DEBUG: Copy element children count:', session.sourceCopy ? session.sourceCopy.children.length : 'null');\n      console.log('\uD83D\uDD0D DEBUG: Copy element innerHTML length:', session.sourceCopy ? session.sourceCopy.innerHTML.length : 'null');\n\n      // Hide all other variants - only use display\n      session.allVariants.forEach(variant => {\n        if (variant !== session.sourceElement) {\n          variant.style.display = 'none';\n        }\n      });\n\n      // Animate the copy to match the destination\n      if (session.sourceCopy) {\n        await animateCopyToDestination(\n          session.sourceCopy,\n          session.targetElement,\n          session.sourceElement,\n          session.transitionType,\n          session.transitionDuration\n        );\n      }\n\n      console.log('\u2705 ANIMATE PHASE: Animation completed');\n      console.log('\uD83D\uDD04 PHASE TRANSITION: Animate \u2192 Cleanup');\n    }\n    \n    /**\n     * PHASE 3: CLEANUP - Deletes copy, shows target variant, resets animation system\n     */\n    function cleanupAnimationSession(session) {\n      console.log('\uD83E\uDDF9 CLEANUP PHASE: Starting cleanup');\n      console.log('\uD83E\uDDF9 CLEANUP PHASE: Removing copy and showing target variant');\n\n      // Remove the copy (proper three-phase cleanup)\n      if (session.sourceCopy) {\n        console.log('\uD83D\uDD0D DEBUG: About to remove copy. Copy in DOM:', document.contains(session.sourceCopy));\n        console.log('\uD83D\uDD0D DEBUG: Copy parent before removal:', session.sourceCopy.parentElement ? session.sourceCopy.parentElement.tagName : 'null');\n        console.log('\uD83D\uDD0D DEBUG: Copy final transform:', window.getComputedStyle(session.sourceCopy).transform);\n        console.log('\uD83D\uDD0D DEBUG: Copy final position:', {\n          left: window.getComputedStyle(session.sourceCopy).left,\n          top: window.getComputedStyle(session.sourceCopy).top,\n          position: window.getComputedStyle(session.sourceCopy).position\n        });\n        console.log('\uD83D\uDD0D DEBUG: Copy visibility before removal:', isCopyVisible(session.sourceCopy) ? 'visible' : 'hidden');\n        \n        // Log the final state of Frame 1232 in the copy before removal\n        const frame1232InCopy = session.sourceCopy.querySelector('[data-figma-name=\"Frame 1232\"]');\n        if (frame1232InCopy) {\n          console.log('\uD83D\uDD0D DEBUG: Frame 1232 in copy final transform:', window.getComputedStyle(frame1232InCopy).transform);\n          console.log('\uD83D\uDD0D DEBUG: Frame 1232 in copy final style.transform:', frame1232InCopy.style.transform);\n        }\n        \n        // ENHANCED DISPLAY CONTROL: Hide copy before removal for cleaner cleanup\n        hideCopy(session.sourceCopy, 'cleanup phase - hiding before removal');\n        \n        session.sourceCopy.remove();\n        session.sourceCopy = null;\n        console.log('\uD83D\uDDD1\uFE0F CLEANUP PHASE: Removed source copy');\n      } else {\n        console.log('\u274C ERROR: No copy to remove in cleanup phase');\n      }\n\n      // Hide the original source element permanently - only use display\n      session.sourceElement.style.display = 'none';\n      session.sourceElement.classList.add('variant-hidden');\n      session.sourceElement.classList.remove('variant-active');\n\n      // CRITICAL FIX: Reset all variants to a clean state before showing the destination\n      // BUT DO NOT clear transforms from the copy - leave it in final animated state\n      session.allVariants.forEach(variant => {\n        // Reset any residual styling from animations\n        variant.style.position = 'relative';\n        variant.style.left = '';\n        variant.style.top = '';\n        variant.style.transform = '';\n        variant.style.transition = '';\n        \n        // Reset all nested elements within each variant\n        // BUT EXCLUDE the copy element - don't clear its transforms\n        const nestedElements = variant.querySelectorAll('[data-figma-id]');\n        nestedElements.forEach(nestedElement => {\n          // Skip if this is part of the copy element\n          if (nestedElement.closest('[data-is-animation-copy=\"true\"]')) {\n            console.log('\uD83D\uDD0D DEBUG: Skipping transform clear for copy element:', nestedElement.getAttribute('data-figma-name'));\n            return;\n          }\n          \n          nestedElement.style.position = 'relative';\n          nestedElement.style.left = '';\n          nestedElement.style.top = '';\n          nestedElement.style.transform = '';\n          nestedElement.style.transition = '';\n        });\n      });\n      \n\n\n      // Show the destination variant with proper positioning - only use display\n      session.targetElement.style.display = 'flex';\n      session.targetElement.classList.add('variant-active');\n      session.targetElement.classList.remove('variant-hidden');\n\n      // Reset any absolute positioning that might have been applied during animation\n      session.targetElement.style.position = 'relative';\n      session.targetElement.style.left = '';\n      session.targetElement.style.top = '';\n      session.targetElement.style.transform = '';\n\n      // Ensure all nested components within the destination variant are visible - only use display\n      const nestedElements = session.targetElement.querySelectorAll('[data-figma-id]');\n      nestedElements.forEach(nestedElement => {\n        if (nestedElement.classList.contains('variant-hidden')) {\n          nestedElement.classList.remove('variant-hidden');\n        }\n        \n        if (!nestedElement.classList.contains('variant-hidden')) {\n          if (window.getComputedStyle(nestedElement).display === 'none') {\n            nestedElement.style.display = 'flex';\n          }\n        }\n      });\n\n      // Hide all other variants - only use display\n      session.allVariants.forEach(variant => {\n        if (variant !== session.targetElement) {\n          variant.classList.add('variant-hidden');\n          variant.classList.remove('variant-active');\n          variant.style.display = 'none';\n        }\n      });\n\n      // Mark session as inactive\n      session.isActive = false;\n\n      console.log('\u2705 CLEANUP PHASE: Animation session cleaned up');\n    }\n    \n    /**\n     * Helper function to create element copy\n     */\n    function createElementCopy(sourceElement) {\n      console.log('\uD83D\uDCCB Creating element copy for:', sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id'));\n      \n      const copy = sourceElement.cloneNode(true);\n      copy.setAttribute('data-figma-id', sourceElement.getAttribute('data-figma-id') + '-copy');\n      copy.setAttribute('data-is-animation-copy', 'true');\n      \n      // CRITICAL FIX: Inherit exact positioning from source element to prevent visual glitches\n      const sourceComputedStyle = window.getComputedStyle(sourceElement);\n      copy.style.position = sourceComputedStyle.position;\n      copy.style.left = sourceComputedStyle.left;\n      copy.style.top = sourceComputedStyle.top;\n      copy.style.right = sourceComputedStyle.right;\n      copy.style.bottom = sourceComputedStyle.bottom;\n      copy.style.margin = '0';\n      copy.style.padding = '0';\n      copy.style.pointerEvents = 'none';\n      copy.style.willChange = 'transform, left, top';\n      copy.style.zIndex = sourceComputedStyle.zIndex;\n      \n      // ENHANCED DISPLAY CONTROL: Initialize copy as hidden\n      copy.style.display = 'none';\n      \n      // CRITICAL FIX: Only use display for visibility, never opacity or visibility\n      // Remove any opacity or visibility styles that might have been inherited\n      copy.style.opacity = '';\n      copy.style.visibility = '';\n\n      console.log('\uD83D\uDCCB Copy creation completed');\n      return copy;\n    }\n    \n    /**\n     * ENHANCED DISPLAY CONTROL: Show copy element\n     */\n    function showCopy(copy, reason = '') {\n      if (!copy) {\n        console.log('\u274C ERROR: Cannot show copy - copy element is null');\n        return;\n      }\n      \n      // Determine the appropriate display value based on the original source element\n      const sourceElement = document.querySelector('[data-figma-id=\"' + copy.getAttribute('data-figma-id').replace('-copy', '') + '\"]');\n      let displayValue = 'flex'; // Default fallback\n      \n      if (sourceElement) {\n        const sourceComputedStyle = window.getComputedStyle(sourceElement);\n        displayValue = sourceComputedStyle.display;\n      }\n      \n      copy.style.display = displayValue;\n      console.log('\uD83D\uDC41\uFE0F DISPLAY CONTROL: Showed copy element' + (reason ? ' (' + reason + ')' : ''));\n      console.log('\uD83D\uDD0D DEBUG: Copy display set to:', displayValue);\n    }\n    \n    /**\n     * ENHANCED DISPLAY CONTROL: Hide copy element\n     */\n    function hideCopy(copy, reason = '') {\n      if (!copy) {\n        console.log('\u274C ERROR: Cannot hide copy - copy element is null');\n        return;\n      }\n      \n      copy.style.display = 'none';\n      console.log('\uD83D\uDE48 DISPLAY CONTROL: Hidden copy element' + (reason ? ' (' + reason + ')' : ''));\n    }\n    \n    /**\n     * ENHANCED DISPLAY CONTROL: Check if copy is visible\n     */\n    function isCopyVisible(copy) {\n      if (!copy) return false;\n      \n      const computedStyle = window.getComputedStyle(copy);\n      return computedStyle.display !== 'none';\n    }\n    \n    /**\n     * ENHANCED DISPLAY CONTROL: Get copy display status for debugging\n     */\n    function getCopyDisplayStatus(copy) {\n      if (!copy) {\n        return {\n          exists: false,\n          visible: false,\n          display: 'null',\n          computedDisplay: 'null'\n        };\n      }\n      \n      const computedStyle = window.getComputedStyle(copy);\n      return {\n        exists: true,\n        visible: isCopyVisible(copy),\n        display: copy.style.display,\n        computedDisplay: computedStyle.display,\n        inDOM: document.contains(copy)\n      };\n    }\n    \n    /**\n     * Helper function to animate copy to destination\n     */\n    async function animateCopyToDestination(copy, destination, originalSourceElement, transitionType, transitionDuration) {\n      return new Promise((resolve) => {\n        // Update copy content to match destination content\n        updateCopyContentToMatchDestination(copy, destination);\n        \n        // Find elements with property changes\n        const elementsToAnimate = findElementsWithPropertyChanges(destination, copy, originalSourceElement);\n        const easingFunction = getEasingFunction(transitionType);\n        const duration = parseFloat(transitionDuration || '0.3');\n        \n        if (elementsToAnimate.length > 0) {\n          console.log('\uD83C\uDFAD Animating copy with', elementsToAnimate.length, 'elements');\n          \n          // Setup animation for each element\n          elementsToAnimate.forEach(({ element, changes }) => {\n            // Handle nested instance variant switch as additional step (not replacement)\n            if (changes.isNestedInstanceVariantSwitch) {\n              handleNestedInstanceVariantSwitch(element, changes);\n            }\n            \n            // Always apply movement animations (even for nested instances)\n            const animationChanges = convertChangesToAnimationChanges(changes, element, originalSourceElement, destination);\n            animationChanges.forEach(change => {\n              applyAnimationChange(element, change, duration, easingFunction);\n            });\n          });\n          \n          // Monitor animation completion\n          const completedElements = new Set();\n          const totalAnimations = elementsToAnimate.length;\n          \n          const onTransitionEnd = (event) => {\n            const targetElement = event.target;\n            const propertyName = event.propertyName;\n            \n            console.log('\uD83C\uDFAD Transition end event fired:', {\n              target: targetElement.getAttribute('data-figma-name') || targetElement.getAttribute('data-figma-id'),\n              propertyName: propertyName,\n              currentTransform: window.getComputedStyle(targetElement).transform\n            });\n            \n            // Find which animated element this transition belongs to\n            const animatedElement = elementsToAnimate.find(({ element }) => \n              targetElement === element || element.contains(targetElement)\n            );\n            \n            if (animatedElement) {\n              completedElements.add(animatedElement.element);\n              console.log('\uD83C\uDFAD Element animation completed:', animatedElement.element.getAttribute('data-figma-name') || animatedElement.element.getAttribute('data-figma-id'), 'Completed:', completedElements.size, '/', totalAnimations);\n              \n              if (completedElements.size >= totalAnimations) {\n                console.log('\uD83C\uDFAD All animations completed');\n                // Remove all event listeners\n                elementsToAnimate.forEach(({ element }) => {\n                  element.removeEventListener('transitionend', onTransitionEnd);\n                });\n                resolve();\n              }\n            }\n          };\n          \n          // Attach transitionend listener to each animated element\n          elementsToAnimate.forEach(({ element }) => {\n            console.log('\uD83C\uDFAD Attaching transitionend listener to:', element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id'));\n            element.addEventListener('transitionend', onTransitionEnd);\n          });\n          \n          // Fallback timeout\n          setTimeout(() => {\n            console.log('\uD83C\uDFAD Animation completed via timeout');\n            // Remove all event listeners\n            elementsToAnimate.forEach(({ element }) => {\n              element.removeEventListener('transitionend', onTransitionEnd);\n            });\n            resolve();\n          }, duration * 1000 + 3000);\n        } else {\n          resolve();\n        }\n      });\n    }\n    \n    /**\n     * Helper function to update copy content to match destination\n     */\n    function updateCopyContentToMatchDestination(copy, destination) {\n      console.log('\uD83D\uDCCB Updating copy content to match destination');\n      \n      const copyElements = copy.querySelectorAll('[data-figma-id]');\n      const destinationElements = destination.querySelectorAll('[data-figma-id]');\n      \n      // Create a map of destination elements by name\n      const destinationElementMap = new Map();\n      destinationElements.forEach(element => {\n        const name = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');\n        if (name) {\n          destinationElementMap.set(name, element);\n        }\n      });\n      \n      // Update each copy element's content to match destination\n      copyElements.forEach(copyElement => {\n        const copyElementName = copyElement.getAttribute('data-figma-name') || copyElement.getAttribute('data-figma-id');\n        const destinationElement = destinationElementMap.get(copyElementName);\n        \n        if (destinationElement) {\n          // Update text content\n          if (destinationElement.textContent !== copyElement.textContent) {\n            copyElement.textContent = destinationElement.textContent;\n          }\n          \n          // Update innerHTML for more complex content, but preserve positioning\n          if (destinationElement.innerHTML !== copyElement.innerHTML) {\n            // Preserve positioning before updating content\n            const allNestedElements = copyElement.querySelectorAll('[data-figma-id]');\n            const originalPositions = new Map();\n            \n            allNestedElements.forEach(nestedElement => {\n              const nestedElementName = nestedElement.getAttribute('data-figma-name') || nestedElement.getAttribute('data-figma-id');\n              const computedStyle = window.getComputedStyle(nestedElement);\n              originalPositions.set(nestedElementName, {\n                position: computedStyle.position,\n                left: computedStyle.left,\n                top: computedStyle.top,\n                transform: computedStyle.transform\n              });\n            });\n            \n            // Also preserve the copy element itself\n            const copyComputedStyle = window.getComputedStyle(copyElement);\n            originalPositions.set(copyElementName, {\n              position: copyComputedStyle.position,\n              left: copyComputedStyle.left,\n              top: copyComputedStyle.top,\n              transform: copyComputedStyle.transform\n            });\n            \n            // Update the innerHTML\n            copyElement.innerHTML = destinationElement.innerHTML;\n            \n            // Restore positioning after content update\n            originalPositions.forEach((positionData, elementName) => {\n              const elementToRestore = elementName === copyElementName ? \n                copyElement : \n                copyElement.querySelector('[data-figma-name=\"' + elementName + '\"]') ||\n                copyElement.querySelector('[data-figma-id=\"' + elementName + '\"]');\n              \n              if (elementToRestore) {\n                elementToRestore.style.position = positionData.position;\n                elementToRestore.style.left = positionData.left;\n                elementToRestore.style.top = positionData.top;\n                elementToRestore.style.transform = positionData.transform;\n              }\n            });\n          }\n          \n          // Update specific attributes that might contain content\n          const contentAttributes = ['data-content', 'data-text', 'title', 'alt'];\n          contentAttributes.forEach(attr => {\n            const destValue = destinationElement.getAttribute(attr);\n            const copyValue = copyElement.getAttribute(attr);\n            if (destValue !== copyValue && destValue !== null) {\n              copyElement.setAttribute(attr, destValue);\n            }\n          });\n        }\n      });\n      \n      // Ensure all elements in the copy have opacity 1\n      const allCopyElements = copy.querySelectorAll('*');\n      allCopyElements.forEach(element => {\n        element.style.opacity = '1';\n      });\n    }\n    \n    /**\n     * Helper function to find elements with property changes between variants\n     */\n    function findElementsWithPropertyChanges(targetVariant, currentVariant, originalSourceVariant) {\n      console.log('\uD83D\uDD0D Finding elements with property changes');\n      \n      // Check if this is a nested instance with internal variants\n      let isNestedInstance = false;\n      let parentInstance = null;\n      let parentComponentSet = null;\n      \n      if (originalSourceVariant) {\n        parentComponentSet = originalSourceVariant.closest('[data-figma-type=\"COMPONENT_SET\"]');\n        if (parentComponentSet) {\n          parentInstance = parentComponentSet.closest('[data-figma-type=\"INSTANCE\"]');\n          if (parentInstance) {\n            isNestedInstance = true;\n            console.log('\uD83D\uDD0D Detected nested instance structure');\n          }\n        }\n      }\n      \n      // Note: Nested instance detection is logged but doesn't bypass movement animations\n      if (isNestedInstance) {\n        console.log('\uD83D\uDD0D Detected nested instance structure - will handle both movement and internal variant switching');\n      }\n      \n      const targetElements = targetVariant.querySelectorAll('[data-figma-id]');\n      const sourceElements = currentVariant.querySelectorAll('[data-figma-id]');\n      const sourceElementMap = new Map();\n      const elementsToAnimate = [];\n\n      console.log('\uD83D\uDD0D DEBUG: Found', targetElements.length, 'target elements and', sourceElements.length, 'source elements');\n\n      // Build source element map by name\n      sourceElements.forEach(sourceElement => {\n        const sourceName = sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id');\n        if (sourceName) {\n          sourceElementMap.set(sourceName, sourceElement);\n          console.log('\uD83D\uDD0D DEBUG: Mapped source element:', sourceName);\n        }\n      });\n\n      // Check for parent alignment changes first\n      const parentAlignmentChanges = [];\n      targetElements.forEach(element => {\n        const targetName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');\n        const sourceElement = sourceElementMap.get(targetName);\n        \n        if (sourceElement) {\n          const sourceParent = sourceElement.parentElement;\n          const targetParent = element.parentElement;\n          \n          if (sourceParent && targetParent) {\n            const sourceParentStyle = window.getComputedStyle(sourceParent);\n            const targetParentStyle = window.getComputedStyle(targetParent);\n            \n            if (sourceParentStyle.justifyContent !== targetParentStyle.justifyContent ||\n                sourceParentStyle.alignItems !== targetParentStyle.alignItems) {\n              \n              const parentChanges = {\n                hasChanges: true,\n                justifyContent: { \n                  changed: sourceParentStyle.justifyContent !== targetParentStyle.justifyContent,\n                  sourceValue: sourceParentStyle.justifyContent,\n                  targetValue: targetParentStyle.justifyContent\n                },\n                alignItems: { \n                  changed: sourceParentStyle.alignItems !== targetParentStyle.alignItems,\n                  sourceValue: sourceParentStyle.alignItems,\n                  targetValue: targetParentStyle.alignItems\n                }\n              };\n              \n              // Find all children of the parent that should be animated\n              const parentElement = sourceElement.parentElement;\n              const childrenToAnimate = parentElement ? Array.from(parentElement.children) : [];\n              \n              childrenToAnimate.forEach(child => {\n                parentAlignmentChanges.push({\n                  element: child, // Animate the child, not the parent\n                  sourceElement: child,\n                  changes: parentChanges\n                });\n              });\n            }\n          }\n        }\n      });\n      \n      // Check for child position changes regardless of parent alignment changes\n      console.log('\uD83D\uDD0D DEBUG: About to check', targetElements.length, 'child elements for position changes');\n      targetElements.forEach(element => {\n          const targetName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');\n          const sourceElement = sourceElementMap.get(targetName);\n          \n          console.log('\uD83D\uDD0D DEBUG: Processing element in forEach:', targetName);\n          console.log('\uD83D\uDD0D DEBUG: Target element data-figma-y:', element.getAttribute('data-figma-y'));\n          console.log('\uD83D\uDD0D DEBUG: Checking element:', targetName, 'sourceElement found:', !!sourceElement);\n          \n          if (sourceElement) {\n            // Use original source variant for property detection, not the copy\n            const originalSourceElement = originalSourceVariant.querySelector('[data-figma-name=\"' + targetName + '\"]') || \n                                        originalSourceVariant.querySelector('[data-figma-id=\"' + sourceElement.getAttribute('data-figma-id') + '\"]');\n            \n            console.log('\uD83D\uDD0D DEBUG: originalSourceElement lookup result for ' + targetName + ':', originalSourceElement ? originalSourceElement.getAttribute('data-figma-id') : 'null');\n            console.log('\uD83D\uDD0D DEBUG: originalSourceElement found:', !!originalSourceElement);\n            console.log('\uD83D\uDD0D DEBUG: Original source element data-figma-y:', originalSourceElement ? originalSourceElement.getAttribute('data-figma-y') : 'null');\n            \n            if (originalSourceElement) {\n              console.log('\uD83D\uDD0D DEBUG: Calling detectPropertyChanges for:', targetName);\n              const changes = detectPropertyChanges(element, originalSourceElement, originalSourceElement);\n              \n              console.log('\uD83D\uDD0D DEBUG: Changes detected:', changes.hasChanges, changes);\n              \n              if (changes.hasChanges) {\n                console.log('\uD83D\uDD0D DEBUG: Adding element to animation list:', targetName);\n                elementsToAnimate.push({\n                  element: sourceElement, // Use copy for animation\n                  sourceElement: sourceElement, // Use copy for animation\n                  changes: changes\n                });\n              } else {\n                console.log('\uD83D\uDD0D DEBUG: No changes detected for:', targetName);\n              }\n            }\n          }\n        });\n      \n      // Also add parent alignment changes if any were found\n      if (parentAlignmentChanges.length > 0) {\n        console.log('\uD83D\uDD0D DEBUG: Found', parentAlignmentChanges.length, 'parent alignment changes');\n        console.log('\uD83D\uDD0D DEBUG: Parent alignment changes:', parentAlignmentChanges);\n        parentAlignmentChanges.forEach((change, index) => {\n          console.log('\uD83D\uDD0D DEBUG: Parent alignment change', index, ':', {\n            element: change.element.getAttribute('data-figma-name') || change.element.getAttribute('data-figma-id'),\n            justifyContent: change.changes.justifyContent,\n            alignItems: change.changes.alignItems\n          });\n        });\n        elementsToAnimate.push(...parentAlignmentChanges);\n      }\n      \n      console.log('\uD83D\uDD0D Found', elementsToAnimate.length, 'elements to animate');\n      return elementsToAnimate;\n    }\n    \n    /**\n     * Helper function to detect property changes between elements\n     */\n    function detectPropertyChanges(targetElement, sourceElement, originalSourceElement) {\n      console.log('\uD83D\uDD0D DEBUG: detectPropertyChanges called for:', {\n        targetElement: targetElement.getAttribute('data-figma-name'),\n        sourceElement: sourceElement.getAttribute('data-figma-name'),\n        originalSourceElement: originalSourceElement.getAttribute('data-figma-name')\n      });\n\n      const changes = {\n        hasChanges: false,\n        positionX: { changed: false, sourceValue: null, targetValue: null },\n        positionY: { changed: false, sourceValue: null, targetValue: null },\n        backgroundColor: { changed: false, sourceValue: null, targetValue: null },\n        color: { changed: false, sourceValue: null, targetValue: null },\n        justifyContent: { changed: false, sourceValue: null, targetValue: null },\n        alignItems: { changed: false, sourceValue: null, targetValue: null }\n      };\n\n      try {\n        const sourceStyle = window.getComputedStyle(sourceElement);\n        const targetStyle = window.getComputedStyle(targetElement);\n        \n        // Check for parent alignment changes first\n        const sourceParent = sourceElement.parentElement;\n        const targetParent = targetElement.parentElement;\n        \n        if (sourceParent && targetParent) {\n          const sourceParentStyle = window.getComputedStyle(sourceParent);\n          const targetParentStyle = window.getComputedStyle(targetParent);\n          \n          if (sourceParentStyle.justifyContent !== targetParentStyle.justifyContent ||\n              sourceParentStyle.alignItems !== targetParentStyle.alignItems) {\n            \n            changes.hasChanges = true;\n            changes.justifyContent = { \n              changed: sourceParentStyle.justifyContent !== targetParentStyle.justifyContent,\n              sourceValue: sourceParentStyle.justifyContent,\n              targetValue: targetParentStyle.justifyContent\n            };\n            changes.alignItems = { \n              changed: sourceParentStyle.alignItems !== targetParentStyle.alignItems,\n              sourceValue: sourceParentStyle.alignItems,\n              targetValue: targetParentStyle.alignItems\n            };\n            \n            // CRITICAL FIX: Don't return early - continue to check for individual element position changes\n            // This allows both parent alignment changes AND individual element position changes to be detected\n          }\n        }\n      } catch (error) {\n        console.log('Error in parent alignment check:', error);\n      }\n\n      try {\n        const sourceStyle = window.getComputedStyle(sourceElement);\n        const targetStyle = window.getComputedStyle(targetElement);\n        \n        // Check for parent alignment changes first\n        const sourceParent = sourceElement.parentElement;\n        const targetParent = targetElement.parentElement;\n        \n        // Use Figma coordinates directly for comparison\n        const sourceFigmaY = parseFloat(originalSourceElement.getAttribute('data-figma-y')) || 0;\n        const targetFigmaY = parseFloat(targetElement.getAttribute('data-figma-y')) || 0;\n        const sourceFigmaX = parseFloat(originalSourceElement.getAttribute('data-figma-x')) || 0;\n        const targetFigmaX = parseFloat(targetElement.getAttribute('data-figma-x')) || 0;\n        \n        const sourceRelativeLeft = sourceFigmaX;\n        const sourceRelativeTop = sourceFigmaY;\n        const targetRelativeLeft = targetFigmaX;\n        const targetRelativeTop = targetFigmaY;\n\n        console.log('\uD83D\uDD0D DEBUG: Position comparison for', targetElement.getAttribute('data-figma-name'), ':', {\n          sourceFigmaX,\n          sourceFigmaY,\n          targetFigmaX,\n          targetFigmaY,\n          xDifference: Math.abs(sourceFigmaX - targetFigmaX),\n          yDifference: Math.abs(sourceFigmaY - targetFigmaY),\n          shouldAnimateX: Math.abs(sourceRelativeLeft - targetRelativeLeft) > 1,\n          shouldAnimateY: Math.abs(sourceRelativeTop - targetRelativeTop) > 1\n        });\n        \n        // Check if the node has ignore auto layout enabled\n        const ignoreAutoLayout = sourceElement.getAttribute('data-layout-positioning') === 'ABSOLUTE';\n        \n        // Check if the node's parent has auto layout\n        const parentHasAutoLayout = sourceParent && targetParent && \n          sourceParent.getAttribute('data-layout-mode') && \n          sourceParent.getAttribute('data-layout-mode') !== 'NONE';\n        \n        // Determine if this node should be animated\n        let shouldAnimatePosition = false;\n        \n        if (Math.abs(sourceRelativeLeft - targetRelativeLeft) > 1 || Math.abs(sourceRelativeTop - targetRelativeTop) > 1) {\n          if (ignoreAutoLayout || !parentHasAutoLayout) {\n            shouldAnimatePosition = true;\n          } else {\n            shouldAnimatePosition = true;\n          }\n        }\n        \n        // Apply position changes if animation is needed\n        if (shouldAnimatePosition) {\n          if (Math.abs(sourceRelativeLeft - targetRelativeLeft) > 1) {\n            changes.positionX.changed = true;\n            changes.positionX.sourceValue = 0;\n            changes.positionX.targetValue = targetRelativeLeft - sourceRelativeLeft;\n            changes.hasChanges = true;\n          }\n          \n          if (Math.abs(sourceRelativeTop - targetRelativeTop) > 1) {\n            changes.positionY.changed = true;\n            changes.positionY.sourceValue = 0;\n            changes.positionY.targetValue = targetRelativeTop - sourceRelativeTop;\n            changes.hasChanges = true;\n          }\n        }\n\n        // Check style changes (non-position)\n        const sourceBg = sourceStyle.backgroundColor || 'rgba(0, 0, 0, 0)';\n        const targetBg = targetStyle.backgroundColor || 'rgba(0, 0, 0, 0)';\n        \n        if (sourceBg !== targetBg) {\n          changes.backgroundColor.changed = true;\n          changes.backgroundColor.sourceValue = sourceBg;\n          changes.backgroundColor.targetValue = targetBg;\n          changes.hasChanges = true;\n        }\n        \n        if (sourceStyle.color !== targetStyle.color) {\n          changes.color.changed = true;\n          changes.color.sourceValue = sourceStyle.color;\n          changes.color.targetValue = targetStyle.color;\n          changes.hasChanges = true;\n        }\n        \n        // Check alignment changes\n        if (sourceStyle.justifyContent !== targetStyle.justifyContent) {\n          changes.justifyContent.changed = true;\n          changes.justifyContent.sourceValue = sourceStyle.justifyContent;\n          changes.justifyContent.targetValue = targetStyle.justifyContent;\n          \n          if (shouldAnimatePosition) {\n            changes.hasChanges = true;\n          }\n        }\n        \n        if (sourceStyle.alignItems !== targetStyle.alignItems) {\n          changes.alignItems.changed = true;\n          changes.alignItems.sourceValue = sourceStyle.alignItems;\n          changes.alignItems.targetValue = targetStyle.alignItems;\n          \n          if (shouldAnimatePosition) {\n            changes.hasChanges = true;\n          }\n        }\n        \n      } catch (error) {\n        console.log('Error detecting property changes:', error);\n      }\n\n      return changes;\n    }\n    \n    /**\n     * Helper function to handle nested instance variant switch\n     */\n    function handleNestedInstanceVariantSwitch(element, changes) {\n      console.log('\uD83D\uDD04 Handling nested instance variant switch');\n      \n      const sourceComponentSet = element.querySelector('[data-figma-type=\"COMPONENT_SET\"]');\n      if (sourceComponentSet) {\n        // Hide current active variant\n        const currentActiveVariant = sourceComponentSet.querySelector('.variant-active');\n        if (currentActiveVariant) {\n          currentActiveVariant.classList.remove('variant-active');\n          currentActiveVariant.classList.add('variant-hidden');\n        }\n        \n        // Show target variant\n        const targetVariant = changes.targetVariant;\n        if (targetVariant) {\n          targetVariant.classList.add('variant-active');\n          targetVariant.classList.remove('variant-hidden');\n        }\n      }\n    }\n    \n    /**\n     * Helper function to convert changes to animation changes\n     */\n    function convertChangesToAnimationChanges(changes, element, originalSourceElement, destination) {\n      const animationChanges = [];\n      \n      console.log('\uD83C\uDFAD Converting changes to animation changes:', changes);\n      \n      // Handle position changes - use combined transform for simultaneous X and Y movement\n      const hasPositionX = changes.positionX && changes.positionX.changed;\n      const hasPositionY = changes.positionY && changes.positionY.changed;\n      \n      if (hasPositionX || hasPositionY) {\n        const translateX = hasPositionX ? changes.positionX.targetValue : 0;\n        const translateY = hasPositionY ? changes.positionY.targetValue : 0;\n        \n        animationChanges.push({\n          type: AnimationType.TRANSFORM,\n          property: 'translate',\n          sourceValue: { x: 0, y: 0 },\n          targetValue: { x: translateX, y: translateY },\n          changed: true,\n          translationCondition: TranslationCondition.ABSOLUTE,\n          isCombinedTransform: true\n        });\n      }\n      \n      // Handle color changes\n      if (changes.backgroundColor && changes.backgroundColor.changed) {\n        animationChanges.push({\n          type: AnimationType.SIMPLE,\n          property: 'backgroundColor',\n          sourceValue: changes.backgroundColor.sourceValue,\n          targetValue: changes.backgroundColor.targetValue,\n          changed: true\n        });\n      }\n      \n      if (changes.color && changes.color.changed) {\n        animationChanges.push({\n          type: AnimationType.SIMPLE,\n          property: 'color',\n          sourceValue: changes.color.sourceValue,\n          targetValue: changes.color.targetValue,\n          changed: true\n        });\n      }\n      \n      // Handle parent alignment changes - convert to transform-based animations\n      if (changes.justifyContent && changes.justifyContent.changed) {\n        // Convert justifyContent changes to transform-based animations\n        const justifyContentValue = changes.justifyContent.targetValue;\n        let translateX = 0;\n        \n        if (justifyContentValue === 'center') {\n          translateX = 0; // Already centered\n        } else if (justifyContentValue === 'flex-start') {\n          translateX = -50; // Move to start\n        } else if (justifyContentValue === 'flex-end') {\n          translateX = 50; // Move to end\n        }\n        \n        if (translateX !== 0) {\n          animationChanges.push({\n            type: AnimationType.TRANSFORM,\n            property: 'translateX',\n            sourceValue: 0,\n            targetValue: translateX,\n            changed: true,\n            translationCondition: TranslationCondition.ABSOLUTE\n          });\n        }\n      }\n      \n      if (changes.alignItems && changes.alignItems.changed) {\n        // Convert alignItems changes to transform-based animations using actual position differences\n        const alignItemsValue = changes.alignItems.targetValue;\n        const sourceAlignItems = changes.alignItems.sourceValue;\n        \n        console.log('\uD83D\uDD0D DEBUG: alignItems conversion:', {\n          sourceValue: sourceAlignItems,\n          targetValue: alignItemsValue\n        });\n        \n        // Get the actual position differences from Figma coordinates\n        const sourceFigmaY = parseFloat(originalSourceElement.getAttribute('data-figma-y')) || 0;\n        const targetFigmaY = parseFloat(element.getAttribute('data-figma-y')) || 0;\n        const yDifference = targetFigmaY - sourceFigmaY;\n        \n        console.log('\uD83D\uDD0D DEBUG: Position-based translateY calculation:', {\n          sourceFigmaY,\n          targetFigmaY,\n          yDifference\n        });\n        \n        // Use the actual position difference instead of hardcoded values\n        const translateY = yDifference;\n        \n        console.log('\uD83D\uDD0D DEBUG: Calculated translateY:', translateY);\n        \n        if (translateY !== 0) {\n          animationChanges.push({\n            type: AnimationType.TRANSFORM,\n            property: 'translateY',\n            sourceValue: 0,\n            targetValue: translateY,\n            changed: true,\n            translationCondition: TranslationCondition.ABSOLUTE\n          });\n        }\n      }\n      \n      console.log('\uD83C\uDFAD Created animation changes:', animationChanges);\n      return animationChanges;\n    }\n    \n    /**\n     * Helper function to apply animation changes\n     */\n    function applyAnimationChange(element, change, duration, easing) {\n      const { type, property, targetValue, translationCondition } = change;\n      \n      console.log('\uD83C\uDFAD Applying animation change:', { type, property, targetValue, translationCondition });\n      console.log('\uD83D\uDD0D DEBUG: Element initial transform:', window.getComputedStyle(element).transform);\n                    console.log('\uD83D\uDD0D DEBUG: Element initial position:', {\n                left: window.getComputedStyle(element).left,\n                top: window.getComputedStyle(element).top,\n                position: window.getComputedStyle(element).position\n              });\n              console.log('\uD83D\uDD0D DEBUG: Element initial display:', window.getComputedStyle(element).display);\n              console.log('\uD83D\uDD0D DEBUG: Element initial width/height:', {\n                width: window.getComputedStyle(element).width,\n                height: window.getComputedStyle(element).height\n              });\n      \n      // Get transition property\n      let transitionProperty = property;\n      if (type === AnimationType.TRANSFORM) {\n        if (translationCondition === TranslationCondition.ABSOLUTE) {\n          // CRITICAL FIX: Use 'transform' for all transform animations, not 'top' or 'left'\n          transitionProperty = 'transform';\n        } else if (translationCondition === TranslationCondition.RELATIVE_PADDING) {\n          transitionProperty = property.replace('parent_', '');\n        } else if (translationCondition === TranslationCondition.RELATIVE_ALIGNMENT) {\n          transitionProperty = property.replace('parent_', '');\n        }\n      }\n      \n      // Set up transition\n      element.style.transition = `${transitionProperty} ${duration}s ${easing}`;\n      \n      // Apply the change based on type and condition\n      switch (type) {\n        case AnimationType.SIMPLE:\n          element.style[property] = targetValue;\n          break;\n          \n        case AnimationType.SIZE:\n          element.style[property] = `${targetValue}px`;\n          break;\n          \n        case AnimationType.TRANSFORM:\n          if (translationCondition === TranslationCondition.ABSOLUTE) {\n            if (change.isCombinedTransform && property === 'translate') {\n              // Handle combined X and Y transform for simultaneous movement\n              const { x: translateX, y: translateY } = targetValue;\n              \n              // Use CSS transform for hardware-accelerated simultaneous animation\n              element.style.transition = `transform ${duration}s ${easing}`;\n              element.style.transform = `translate(${translateX}px, ${translateY}px)`;\n            } else if (property === 'translateX') {\n              // Get current transform state\n              const currentTransform = window.getComputedStyle(element).transform;\n              console.log('\uD83D\uDD0D DEBUG: Current transform before animation:', currentTransform);\n              \n              // Set initial state explicitly\n              element.style.transition = 'none'; // No transition for initial state\n              element.style.transform = 'translateX(0px)'; // Start at source position\n              \n              // Force a reflow to ensure initial state is applied\n              element.offsetHeight;\n              \n              // Verify initial state was applied\n              const initialTransform = window.getComputedStyle(element).transform;\n              console.log('\uD83D\uDD0D DEBUG: Initial transform after setting:', initialTransform);\n              \n              // Now animate to target state\n              element.style.transition = `transform ${duration}s ${easing}`;\n              element.style.transform = `translateX(${targetValue}px)`;\n              \n              // Force a reflow to ensure the animation starts\n              element.offsetHeight;\n              \n              // Verify target state was applied\n              const finalTransform = window.getComputedStyle(element).transform;\n              console.log('\uD83D\uDD0D DEBUG: Final transform after setting:', finalTransform);\n              console.log('\uD83D\uDD0D DEBUG: Expected transform should be: matrix(1, 0, 0, 1, ' + targetValue + ', 0)');\n              console.log('\uD83D\uDD0D DEBUG: Element.style.transform value:', element.style.transform);\n            } else if (property === 'translateY') {\n              // Use transform translateY with proper initial state\n              console.log('\uD83D\uDD0D DEBUG: Using transform translateY for animation');\n              \n              // Get current transform state\n              const currentTransform = window.getComputedStyle(element).transform;\n              console.log('\uD83D\uDD0D DEBUG: Current transform before animation:', currentTransform);\n              \n              // Set initial state explicitly with no transition\n              element.style.transition = 'none';\n              element.style.transform = 'translateY(0px)';\n              \n              // Force a reflow to ensure initial state is applied\n              element.offsetHeight;\n              \n              // Verify initial state was applied\n              const initialTransform = window.getComputedStyle(element).transform;\n              console.log('\uD83D\uDD0D DEBUG: Initial transform after setting:', initialTransform);\n              \n              // Now animate to target state immediately\n              element.style.transition = `transform ${duration}s ${easing}`;\n              element.style.transform = `translateY(${targetValue}px)`;\n              \n              // Force a reflow to ensure the animation starts\n              element.offsetHeight;\n              \n              // Verify target state was applied\n              const finalTransform = window.getComputedStyle(element).transform;\n              console.log('\uD83D\uDD0D DEBUG: Final transform after setting:', finalTransform);\n              console.log('\uD83D\uDD0D DEBUG: Expected transform should be: matrix(1, 0, 0, 1, 0, ' + targetValue + ')');\n              console.log('\uD83D\uDD0D DEBUG: Element.style.transform value:', element.style.transform);\n              console.log('\uD83D\uDD0D DEBUG: Element.style.transition value:', element.style.transition);\n            }\n          } else if (translationCondition === TranslationCondition.RELATIVE_PADDING) {\n            if (element.parentElement) {\n              const paddingProperty = property.replace('parent_', '');\n              element.parentElement.style[paddingProperty] = `${targetValue}px`;\n            }\n          } else if (translationCondition === TranslationCondition.RELATIVE_ALIGNMENT) {\n            if (property === 'alignTranslateX') {\n              element.style.left = `${targetValue}%`;\n            } else if (property === 'alignTranslateY') {\n              element.style.top = `${targetValue}%`;\n            } else if (property.startsWith('parent_')) {\n              if (element.parentElement) {\n                const alignmentProperty = property.replace('parent_', '');\n                element.parentElement.style[alignmentProperty] = targetValue;\n              }\n            } else {\n              element.style[property] = targetValue;\n            }\n          }\n          break;\n      }\n      \n      // Determine the actual transition property used\n      let actualTransitionProperty = transitionProperty;\n      if (type === AnimationType.TRANSFORM && translationCondition === TranslationCondition.ABSOLUTE) {\n        actualTransitionProperty = 'transform';\n      }\n      \n      console.log('\uD83C\uDFAD Applied change:', { property, transitionProperty: actualTransitionProperty, targetValue });\n      console.log('\uD83D\uDD0D DEBUG: Element computed style after change:');\n      console.log('  - transform:', window.getComputedStyle(element).transform);\n      console.log('  - transition:', window.getComputedStyle(element).transition);\n      console.log('  - display:', window.getComputedStyle(element).display);\n      console.log('  - position:', window.getComputedStyle(element).position);\n      console.log('  - left:', window.getComputedStyle(element).left);\n      console.log('  - top:', window.getComputedStyle(element).top);\n    }\n    \n    /**\n     * Helper function to get easing function\n     */\n    function getEasingFunction(animationType) {\n      switch (animationType) {\n        case 'EASE_IN_AND_OUT_BACK':\n          return 'cubic-bezier(0.68, -0.6, 0.32, 1.6)';\n        case 'EASE_IN_AND_OUT':\n          return 'ease-in-out';\n        case 'EASE_IN':\n          return 'ease-in';\n        case 'EASE_OUT':\n          return 'ease-out';\n        case 'LINEAR':\n          return 'linear';\n        case 'BOUNCY':\n          return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';\n        case 'GENTLE':\n          return 'ease-in-out';\n        case 'SMART_ANIMATE':\n          return 'ease-in-out';\n        default:\n          return 'ease-out';\n      }\n    }\n    \n    /**\n     * Main reaction handler function - entry point for all reactions\n     */\n    function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {\n      console.log('\uD83C\uDFAF REACTION TRIGGERED:', {\n        sourceId: sourceElement.getAttribute('data-figma-id'),\n        sourceName: sourceElement.getAttribute('data-figma-name'),\n        destinationId: destinationId,\n        transitionType: transitionType,\n        transitionDuration: transitionDuration\n      });\n      \n      // Check if transition is already in progress\n      if (isTransitionInProgress) {\n        console.log('\u274C Transition already in progress, skipping reaction');\n        return;\n      }\n      \n      // Find the destination element\n      const destination = document.querySelector('[data-figma-id=\"' + destinationId + '\"]');\n      if (!destination) {\n        console.error('\u274C Destination element not found:', destinationId);\n        return;\n      }\n      \n      // Find all variants in the same component set\n      const componentSet = sourceElement.closest('[data-figma-type=\"COMPONENT_SET\"]');\n      if (!componentSet) {\n        console.error('\u274C Component set not found for source element');\n        return;\n      }\n      \n      const allVariants = Array.from(componentSet.children).filter(child => \n        child.getAttribute('data-figma-type') === 'COMPONENT'\n      );\n      \n      console.log('\uD83C\uDFAF Found', allVariants.length, 'variants in component set');\n      \n      // Determine if we should animate or perform instant switch\n      if (transitionType && transitionType !== 'INSTANT' && transitionDuration && parseFloat(transitionDuration) > 0) {\n        // Use animated variant switch\n        console.log('\uD83C\uDFAD Using animated variant switch');\n        handleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration);\n      } else {\n        // Use instant variant switch\n        console.log('\u26A1 Using instant variant switch');\n        performInstantVariantSwitch(allVariants, destination);\n      }\n    }\n    \n    /**\n     * Main function to handle animated variant switching using the three-phase system\n     */\n    async function handleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration) {\n      console.log('\uD83D\uDD04 THREE-PHASE VARIANT SWITCH START:', {\n        sourceId: sourceElement.getAttribute('data-figma-id'),\n        sourceName: sourceElement.getAttribute('data-figma-name'),\n        destinationId: destination.getAttribute('data-figma-id'),\n        destinationName: destination.getAttribute('data-figma-name'),\n        transitionType: transitionType,\n        transitionDuration: transitionDuration,\n        totalVariants: allVariants.length\n      });\n      \n      // Check if transition is already in progress\n      if (isTransitionInProgress) {\n        console.log('\u274C Transition already in progress, skipping');\n        return;\n      }\n      \n      isTransitionInProgress = true;\n      \n      try {\n        // PHASE 1: SETUP\n        const session = setupAnimationSession(sourceElement, destination, allVariants, transitionType, transitionDuration);\n        currentAnimationSession = session;\n        \n        // PHASE 2: ANIMATE\n        await animateVariantTransition(session);\n        \n        // PHASE 3: CLEANUP\n        cleanupAnimationSession(session);\n        \n        // Start timeout reactions for the new active variant\n        if (window.startTimeoutReactionsForNewlyActiveVariant) {\n          window.startTimeoutReactionsForNewlyActiveVariant(destination);\n        }\n        if (window.startTimeoutReactionsForNestedComponents) {\n          window.startTimeoutReactionsForNestedComponents(destination);\n        }\n        \n        console.log('\u2705 THREE-PHASE VARIANT SWITCH COMPLETED');\n        \n      } catch (error) {\n        console.error('\u274C Error during three-phase variant switch:', error);\n        \n        // Cleanup on error\n        if (currentAnimationSession) {\n          cleanupAnimationSession(currentAnimationSession);\n        }\n      } finally {\n        isTransitionInProgress = false;\n        currentAnimationSession = null;\n      }\n    }\n    \n    /**\n     * Function to perform instant variant switch (no animation)\n     */\n    function performInstantVariantSwitch(allVariants, destination) {\n      console.log('\u26A1 PERFORMING INSTANT VARIANT SWITCH');\n      \n      // Hide all variants - only use display\n      allVariants.forEach(variant => {\n        variant.classList.add('variant-hidden');\n        variant.classList.remove('variant-active');\n        variant.style.display = 'none';\n        if (!variant.style.position || variant.style.position === 'static') {\n          variant.style.position = 'relative';\n        }\n      });\n      \n      // Show destination variant - only use display\n      destination.classList.add('variant-active');\n      destination.classList.remove('variant-hidden');\n      destination.style.display = 'flex';\n      if (!destination.style.position || destination.style.position === 'static') {\n        destination.style.position = 'relative';\n      }\n      \n      console.log('\u2705 INSTANT VARIANT SWITCH COMPLETED');\n      \n      // Start timeout reactions\n      if (window.startTimeoutReactionsForNewlyActiveVariant) {\n        window.startTimeoutReactionsForNewlyActiveVariant(destination);\n      }\n      if (window.startTimeoutReactionsForNestedComponents) {\n        window.startTimeoutReactionsForNestedComponents(destination);\n      }\n    }\n    \n    // Export the main functions for external use\n    window.handleReaction = handleReaction;\n    window.handleAnimatedVariantSwitch = handleAnimatedVariantSwitch;\n    window.performInstantVariantSwitch = performInstantVariantSwitch;\n    \n    console.log('\u2705 Three-phase transition handler loaded');\n  ";
}


/***/ }),

/***/ 275:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateReactionAttributes = generateReactionAttributes;
exports.generateVariantAttributes = generateVariantAttributes;
var utils_1 = __webpack_require__(489);
// Event attribute generation
function generateReactionAttributes(node) {
    var attributes = {};
    if ((0, utils_1.safeHasProperty)(node, 'reactions') && node.reactions && node.reactions.length > 0) {
        var reactions = node.reactions;
        var firstReaction = reactions[0];
        if (firstReaction) {
            attributes['data-has-reactions'] = 'true';
            attributes['data-reaction-count'] = String(reactions.length);
            if (firstReaction.trigger) {
                attributes['data-reaction-trigger'] = (0, utils_1.escapeHtmlAttribute)(JSON.stringify(firstReaction.trigger));
            }
            // Check both action and actions fields
            var actionToUse = null;
            if (firstReaction.action) {
                actionToUse = firstReaction.action;
            }
            else if (firstReaction.actions && firstReaction.actions.length > 0) {
                actionToUse = firstReaction.actions[0];
            }
            if (actionToUse && actionToUse.type) {
                attributes['data-reaction-action-type'] = actionToUse.type;
                if (actionToUse.destinationId) {
                    attributes['data-reaction-destination'] = actionToUse.destinationId;
                }
                // Extract transition data from the action
                if (actionToUse.transition && actionToUse.transition.type) {
                    // Use the easing type from the transition if available, otherwise use the transition type
                    var transitionType = actionToUse.transition.type;
                    if (actionToUse.transition.easing && actionToUse.transition.easing.type) {
                        var easingType = actionToUse.transition.easing.type;
                        // Preserve the original easing type instead of mapping to BOUNCY
                        transitionType = easingType;
                    }
                    attributes['data-reaction-transition-type'] = transitionType;
                    if (actionToUse.transition.duration) {
                        attributes['data-reaction-transition-duration'] = String(actionToUse.transition.duration);
                    }
                }
                else if (actionToUse.transition === null) {
                    // Handle instant transitions (no animation)
                    attributes['data-reaction-transition-type'] = 'INSTANT';
                    attributes['data-reaction-transition-duration'] = '0';
                }
            }
        }
    }
    return attributes;
}
function generateVariantAttributes(node, parentNode) {
    var attributes = {};
    if ((0, utils_1.safeHasProperty)(node, 'variantProperties') && node.variantProperties) {
        var variantProps = node.variantProperties;
        Object.entries(variantProps).forEach(function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            var cleanKey = key.toLowerCase().replace(/\s+/g, '-');
            attributes["data-variant-".concat(cleanKey)] = (0, utils_1.escapeHtmlAttribute)((0, utils_1.safeToString)(value));
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


/***/ }),

/***/ 332:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createReactionHandler = createReactionHandler;
exports.createTimeoutHandler = createTimeoutHandler;
// Reaction handling and timeout management
function createReactionHandler() {
    return "\n      // Handle reactions - click, press, and drag\n      const reactionElements = document.querySelectorAll('[data-has-reactions=\"true\"]');\n      reactionElements.forEach(element => {\n        const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');\n        const actionType = element.getAttribute('data-reaction-action-type');\n        const destinationId = element.getAttribute('data-reaction-destination');\n        const transitionType = element.getAttribute('data-reaction-transition-type');\n        const transitionDuration = element.getAttribute('data-reaction-transition-duration');\n        \n        // Handle click, press, and drag reactions\n        element.addEventListener('click', function() {\n          console.log('DEBUG: Click event triggered on element:', {\n            id: this.getAttribute('data-figma-id'),\n            name: this.getAttribute('data-figma-name'),\n            type: this.getAttribute('data-figma-type'),\n            trigger: trigger,\n            actionType: actionType,\n            destinationId: destinationId,\n            transitionType: transitionType,\n            transitionDuration: transitionDuration\n          });\n          \n          if (trigger.type === 'ON_CLICK' || trigger.type === 'ON_PRESS') {\n            console.log('DEBUG: Processing click reaction for element:', this.getAttribute('data-figma-id'));\n            handleReaction(this, destinationId, transitionType, transitionDuration);\n          }\n        });\n        \n        // Handle drag reactions\n        element.addEventListener('mousedown', function() {\n          if (trigger.type === 'ON_DRAG') {\n            handleReaction(this, destinationId, transitionType, transitionDuration);\n          }\n        });\n      });\n  ";
}
function createTimeoutHandler() {
    return "\n      // Track which variants have active timers (for preventing duplicate timers during the same activation)\n      const activeTimers = new Map(); // elementId -> timeoutId\n      \n      // Function to start timeout reactions for active variants\n      function startTimeoutReactionsForActiveVariants() {\n        // Look for both variant-active elements with reactions AND any elements with reactions that don't have variant properties\n        const activeVariants = document.querySelectorAll('.variant-active[data-has-reactions=\"true\"]');\n        const reactionElements = document.querySelectorAll('[data-has-reactions=\"true\"]');\n        \n        console.log('DEBUG: Found', activeVariants.length, 'active variants with reactions');\n        console.log('DEBUG: Found', reactionElements.length, 'total elements with reactions');\n        \n        // Process active variants first\n        activeVariants.forEach(element => {\n          const elementId = element.getAttribute('data-figma-id');\n          const elementName = element.getAttribute('data-figma-name');\n          const parentComponent = element.closest('[data-figma-type=\"COMPONENT_SET\"]');\n          const parentName = parentComponent ? parentComponent.getAttribute('data-figma-name') : 'none';\n          \n          console.log('DEBUG: Processing variant:', elementId, 'name:', elementName, 'parent:', parentName);\n          \n          // Only start timers for variants that are actually visible (not hidden by CSS)\n          const computedStyle = window.getComputedStyle(element);\n          \n          if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {\n            const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');\n            const actionType = element.getAttribute('data-reaction-action-type');\n            const destinationId = element.getAttribute('data-reaction-destination');\n            const transitionType = element.getAttribute('data-reaction-transition-type');\n            const transitionDuration = element.getAttribute('data-reaction-transition-duration');\n            \n            // Handle timeout reactions only for active variants that don't have an active timer\n            if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {\n              console.log('DEBUG: Starting timeout reaction for:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'parent:', parentName);\n              const timeoutId = setTimeout(() => {\n                activeTimers.delete(elementId); // Clear the timer when it completes\n                handleReaction(element, destinationId, transitionType, transitionDuration);\n              }, (trigger.timeout || 0) * 1000);\n              activeTimers.set(elementId, timeoutId);\n            } else if (activeTimers.has(elementId)) {\n              console.log('DEBUG: Skipping variant', elementId, 'name:', elementName, '- timer already active');\n            }\n          } else {\n            console.log('DEBUG: Skipping variant', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');\n          }\n        });\n        \n        // Also process any reaction elements that don't have variant properties (like 6461:693)\n        reactionElements.forEach(element => {\n          const elementId = element.getAttribute('data-figma-id');\n          const elementName = element.getAttribute('data-figma-name');\n          \n          // Skip if this element was already processed as a variant\n          if (element.classList.contains('variant-active')) {\n            return;\n          }\n          \n          // Skip if this element has variant properties (it will be handled by variant logic)\n          if (element.hasAttribute('data-variant-property-1')) {\n            return;\n          }\n          \n          const parentComponent = element.closest('[data-figma-type=\"COMPONENT_SET\"]');\n          const parentName = parentComponent ? parentComponent.getAttribute('data-figma-name') : 'none';\n          \n          console.log('DEBUG: Processing non-variant reaction element:', elementId, 'name:', elementName, 'parent:', parentName);\n          \n          // Only start timers for elements that are actually visible (not hidden by CSS)\n          const computedStyle = window.getComputedStyle(element);\n          \n          if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {\n            const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');\n            const actionType = element.getAttribute('data-reaction-action-type');\n            const destinationId = element.getAttribute('data-reaction-destination');\n            const transitionType = element.getAttribute('data-reaction-transition-type');\n            const transitionDuration = element.getAttribute('data-reaction-transition-duration');\n            \n            // Handle timeout reactions only for elements that don't have an active timer\n            if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {\n              console.log('DEBUG: Starting timeout reaction for non-variant element:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'parent:', parentName);\n              const timeoutId = setTimeout(() => {\n                activeTimers.delete(elementId); // Clear the timer when it completes\n                handleReaction(element, destinationId, transitionType, transitionDuration);\n              }, (trigger.timeout || 0) * 1000);\n              activeTimers.set(elementId, timeoutId);\n            } else if (activeTimers.has(elementId)) {\n              console.log('DEBUG: Skipping non-variant element', elementId, 'name:', elementName, '- timer already active');\n            }\n          } else {\n            console.log('DEBUG: Skipping non-variant element', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');\n          }\n        });\n      }\n      \n      // Function to start timeout reactions for nested components when their parent becomes visible\n      function startTimeoutReactionsForNestedComponents(parentElement) {\n        if (!parentElement) return;\n        \n        // Find all nested components with timeout reactions within the parent\n        const nestedComponents = parentElement.querySelectorAll('[data-has-reactions=\"true\"][data-reaction-trigger*=\"AFTER_TIMEOUT\"]');\n        \n        nestedComponents.forEach(component => {\n          const elementId = component.getAttribute('data-figma-id');\n          const elementName = component.getAttribute('data-figma-name');\n          const parentComponent = component.closest('[data-figma-type=\"COMPONENT_SET\"]');\n          const parentName = parentComponent ? parentComponent.getAttribute('data-figma-name') : 'none';\n          \n          console.log('DEBUG: Processing nested component:', elementId, 'name:', elementName, 'parent:', parentName);\n          \n          // Only start timers for nested components that are actually visible\n          const computedStyle = window.getComputedStyle(component);\n          \n          if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {\n            const trigger = JSON.parse(component.getAttribute('data-reaction-trigger') || '{}');\n            \n            if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {\n              console.log('DEBUG: Starting timeout reaction for nested component:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'parent:', parentName);\n              const timeoutId = setTimeout(() => {\n                activeTimers.delete(elementId);\n                const actionType = component.getAttribute('data-reaction-action-type');\n                const destinationId = component.getAttribute('data-reaction-destination');\n                const transitionType = component.getAttribute('data-reaction-transition-type');\n                const transitionDuration = component.getAttribute('data-reaction-transition-duration');\n                handleReaction(component, destinationId, transitionType, transitionDuration);\n              }, (trigger.timeout || 0) * 1000);\n              activeTimers.set(elementId, timeoutId);\n            } else if (activeTimers.has(elementId)) {\n              console.log('DEBUG: Skipping nested component', elementId, 'name:', elementName, '- timer already active');\n            }\n          } else {\n            console.log('DEBUG: Skipping nested component', elementId, 'name:', elementName, '- not visible');\n          }\n        });\n      }\n      \n      // Function to start timeout reactions for a specific newly active variant\n      function startTimeoutReactionsForNewlyActiveVariant(newlyActiveElement) {\n        if (!newlyActiveElement) return;\n        \n        const elementId = newlyActiveElement.getAttribute('data-figma-id');\n        const elementName = newlyActiveElement.getAttribute('data-figma-name');\n        const parentComponent = newlyActiveElement.closest('[data-figma-type=\"COMPONENT_SET\"]');\n        const parentName = parentComponent ? parentComponent.getAttribute('data-figma-name') : 'none';\n        \n        console.log('DEBUG: Processing newly active variant:', elementId, 'name:', elementName, 'parent:', parentName);\n        \n        // Only start timers for variants that are actually visible (not hidden by CSS)\n        const computedStyle = window.getComputedStyle(newlyActiveElement);\n        \n        if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {\n          const trigger = JSON.parse(newlyActiveElement.getAttribute('data-reaction-trigger') || '{}');\n          const actionType = newlyActiveElement.getAttribute('data-reaction-action-type');\n          const destinationId = newlyActiveElement.getAttribute('data-reaction-destination');\n          const transitionType = newlyActiveElement.getAttribute('data-reaction-transition-type');\n          const transitionDuration = newlyActiveElement.getAttribute('data-reaction-transition-duration');\n          \n          // Handle timeout reactions only for active variants that don't have an active timer\n          if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {\n            console.log('DEBUG: Starting timeout reaction for newly active variant:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'parent:', parentName);\n            const timeoutId = setTimeout(() => {\n              activeTimers.delete(elementId); // Clear the timer when it completes\n              handleReaction(newlyActiveElement, destinationId, transitionType, transitionDuration);\n            }, (trigger.timeout || 0) * 1000);\n            activeTimers.set(elementId, timeoutId);\n          } else if (activeTimers.has(elementId)) {\n            console.log('DEBUG: Skipping newly active variant', elementId, 'name:', elementName, '- timer already active');\n          }\n          \n          // CRITICAL FIX: Also start timeout reactions for any nested components within this newly active variant\n          startTimeoutReactionsForNestedComponents(newlyActiveElement);\n        } else {\n          console.log('DEBUG: Skipping newly active variant', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');\n        }\n      }\n      \n      // CRITICAL FIX: Only start timeout reactions for the initial visible variant\n      // Instead of starting timers for all variant-active elements immediately,\n      // we wait for the first variant transition or user interaction\n      function startTimeoutReactionsForInitialVariant() {\n        // Find the first visible variant that should start the flow\n        // This is typically the first variant in a component set that's marked as active\n        const componentSets = document.querySelectorAll('[data-figma-type=\"COMPONENT_SET\"]');\n        console.log('DEBUG: Found', componentSets.length, 'component sets');\n        \n        // Also check for any elements with reactions\n        const allReactionElements = document.querySelectorAll('[data-has-reactions=\"true\"]');\n        console.log('DEBUG: Found', allReactionElements.length, 'total elements with reactions');\n        \n        // Log details about reaction elements\n        allReactionElements.forEach((element, index) => {\n          const elementId = element.getAttribute('data-figma-id');\n          const elementName = element.getAttribute('data-figma-name');\n          const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');\n          const computedStyle = window.getComputedStyle(element);\n          \n          console.log('DEBUG: Reaction element', index + 1, ':', {\n            id: elementId,\n            name: elementName,\n            trigger: trigger,\n            display: computedStyle.display,\n            visibility: computedStyle.visibility,\n            isActive: element.classList.contains('variant-active'),\n            isHidden: element.classList.contains('variant-hidden')\n          });\n        });\n        \n        componentSets.forEach(componentSet => {\n          const componentSetName = componentSet.getAttribute('data-figma-name');\n          const activeVariants = componentSet.querySelectorAll('.variant-active[data-has-reactions=\"true\"]');\n          console.log('DEBUG: Component set', componentSetName, 'has', activeVariants.length, 'active variants with reactions');\n          \n          // Only start timers for the first active variant in each component set\n          if (activeVariants.length > 0) {\n            const firstActiveVariant = activeVariants[0];\n            const elementId = firstActiveVariant.getAttribute('data-figma-id');\n            const elementName = firstActiveVariant.getAttribute('data-figma-name');\n            const computedStyle = window.getComputedStyle(firstActiveVariant);\n            \n            console.log('DEBUG: Processing initial variant:', elementId, 'name:', elementName, 'in component set:', componentSetName);\n            \n            // Only start timer if the variant is actually visible\n            if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {\n              const trigger = JSON.parse(firstActiveVariant.getAttribute('data-reaction-trigger') || '{}');\n              \n              // Skip nested components that should only start when their parent becomes visible\n              // Allow independent components to start their timers on page load\n              // Check if this component set is nested within another component set\n              const parentComponentSet = componentSet.closest('[data-figma-type=\"COMPONENT_SET\"]');\n              const isNestedComponent = parentComponentSet && parentComponentSet !== componentSet;\n              \n              if (isNestedComponent) {\n                console.log('DEBUG: Skipping initial variant', elementId, 'name:', elementName, '- nested component, will start when parent becomes visible');\n                return;\n              }\n              \n              if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {\n                console.log('DEBUG: Starting initial timeout reaction for:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'in component set:', componentSetName);\n                const timeoutId = setTimeout(() => {\n                  console.log('DEBUG: Timeout triggered for element:', elementId, 'name:', elementName);\n                  activeTimers.delete(elementId);\n                  const actionType = firstActiveVariant.getAttribute('data-reaction-action-type');\n                  const destinationId = firstActiveVariant.getAttribute('data-reaction-destination');\n                  const transitionType = firstActiveVariant.getAttribute('data-reaction-transition-type');\n                  const transitionDuration = firstActiveVariant.getAttribute('data-reaction-transition-duration');\n                  console.log('DEBUG: Calling handleReaction with:', {\n                    destinationId: destinationId,\n                    transitionType: transitionType,\n                    transitionDuration: transitionDuration\n                  });\n                  handleReaction(firstActiveVariant, destinationId, transitionType, transitionDuration);\n                }, (trigger.timeout || 0) * 1000);\n                activeTimers.set(elementId, timeoutId);\n                console.log('DEBUG: Created timeout timer for element:', elementId, 'timeout ID:', timeoutId, 'duration:', (trigger.timeout || 0) * 1000, 'ms');\n                \n                // CRITICAL FIX: Also start timeout reactions for any nested components within this initial variant\n                startTimeoutReactionsForNestedComponents(firstActiveVariant);\n              } else {\n                console.log('DEBUG: Skipping initial variant', elementId, 'name:', elementName, '- no timeout trigger or timer already active');\n              }\n            } else {\n              console.log('DEBUG: Skipping initial variant', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');\n            }\n          }\n          \n          // CRITICAL FIX: Also check for non-variant reaction elements in this component set\n          const reactionElements = componentSet.querySelectorAll('[data-has-reactions=\"true\"]');\n          reactionElements.forEach(element => {\n            const elementId = element.getAttribute('data-figma-id');\n            const elementName = element.getAttribute('data-figma-name');\n            \n            // Skip if this element was already processed as a variant\n            if (element.classList.contains('variant-active')) {\n              return;\n            }\n            \n            // Skip if this element has variant properties (it will be handled by variant logic)\n            if (element.hasAttribute('data-variant-property-1')) {\n              return;\n            }\n            \n            const computedStyle = window.getComputedStyle(element);\n            \n            console.log('DEBUG: Processing initial non-variant reaction element:', elementId, 'name:', elementName, 'in component set:', componentSetName);\n            \n            // Only start timer if the element is actually visible\n            if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {\n              const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');\n              \n              // Skip nested components that should only start when their parent becomes visible\n              const parentComponentSet = componentSet.closest('[data-figma-type=\"COMPONENT_SET\"]');\n              const isNestedComponent = parentComponentSet && parentComponentSet !== componentSet;\n              \n              if (isNestedComponent) {\n                console.log('DEBUG: Skipping initial non-variant element', elementId, 'name:', elementName, '- nested component, will start when parent becomes visible');\n                return;\n              }\n              \n              if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {\n                console.log('DEBUG: Starting initial timeout reaction for non-variant element:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'in component set:', componentSetName);\n                const timeoutId = setTimeout(() => {\n                  activeTimers.delete(elementId);\n                  const actionType = element.getAttribute('data-reaction-action-type');\n                  const destinationId = element.getAttribute('data-reaction-destination');\n                  const transitionType = element.getAttribute('data-reaction-transition-type');\n                  const transitionDuration = element.getAttribute('data-reaction-transition-duration');\n                  handleReaction(element, destinationId, transitionType, transitionDuration);\n                }, (trigger.timeout || 0) * 1000);\n                activeTimers.set(elementId, timeoutId);\n                \n                // Also start timeout reactions for any nested components within this element\n                startTimeoutReactionsForNestedComponents(element);\n              } else {\n                console.log('DEBUG: Skipping initial non-variant element', elementId, 'name:', elementName, '- no timeout trigger or timer already active');\n              }\n            } else {\n              console.log('DEBUG: Skipping initial non-variant element', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');\n            }\n          });\n        });\n      }\n      \n      // Start timeout reactions for the initial visible variant after a short delay\n      // to ensure CSS classes and visibility are properly applied\n      console.log('DEBUG: Setting up initial timeout reactions');\n      setTimeout(() => {\n        console.log('DEBUG: Starting initial timeout reactions');\n        startTimeoutReactionsForInitialVariant();\n      }, 100);\n  ";
}


/***/ }),

/***/ 489:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.safeHasProperty = safeHasProperty;
exports.safeToString = safeToString;
exports.safeAttributeValue = safeAttributeValue;
exports.escapeHtmlAttribute = escapeHtmlAttribute;
// Utility functions for HTML generation
function safeHasProperty(obj, prop) {
    return obj && typeof obj === 'object' && prop in obj;
}
function safeToString(value) {
    if (value === null || value === undefined)
        return '';
    if (typeof value === 'symbol')
        return value.toString();
    return String(value);
}
// Helper function to safely convert any value to string for HTML attributes, handling symbols
function safeAttributeValue(value) {
    if (value === null || value === undefined)
        return '';
    if (typeof value === 'symbol')
        return value.toString();
    return String(value);
}
function escapeHtmlAttribute(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}


/***/ }),

/***/ 585:
/***/ ((__unused_webpack_module, exports) => {


/**
 * Animation Detection Module
 *
 * Responsible for detecting what needs to be animated between source and target elements.
 * This module handles the logic for identifying property changes, position changes,
 * and determining the appropriate animation type for each change.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TranslationCondition = exports.AnimationType = void 0;
exports.getAnimationType = getAnimationType;
exports.getTranslationCondition = getTranslationCondition;
exports.detectAnimationChanges = detectAnimationChanges;
exports.getNodeDataFromElement = getNodeDataFromElement;
exports.findElementsWithPropertyChanges = findElementsWithPropertyChanges;
exports.detectPropertyChanges = detectPropertyChanges;
// Animation types
exports.AnimationType = {
    SIMPLE: 'SIMPLE',
    SIZE: 'SIZE',
    TRANSFORM: 'TRANSFORM'
};
// Translation conditions
exports.TranslationCondition = {
    ABSOLUTE: 'ABSOLUTE',
    RELATIVE_PADDING: 'RELATIVE_PADDING',
    RELATIVE_ALIGNMENT: 'RELATIVE_ALIGNMENT'
};
/**
 * Determine animation type for a property
 */
function getAnimationType(property) {
    var simpleProperties = [
        'opacity', 'color', 'backgroundColor', 'cornerRadius', 'borderRadius',
        'fontSize', 'fontWeight', 'textAlign', 'letterSpacing', 'lineHeight'
    ];
    var sizeProperties = [
        'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight'
    ];
    var transformProperties = [
        'translateX', 'translateY', 'translateZ', 'rotation', 'scale', 'transform'
    ];
    if (simpleProperties.includes(property)) {
        return exports.AnimationType.SIMPLE;
    }
    else if (sizeProperties.includes(property)) {
        return exports.AnimationType.SIZE;
    }
    else if (transformProperties.includes(property)) {
        return exports.AnimationType.TRANSFORM;
    }
    return exports.AnimationType.SIMPLE;
}
/**
 * Determine translation condition for an element
 */
function getTranslationCondition(element, node, parentNode) {
    var ignoreAutoLayout = (node === null || node === void 0 ? void 0 : node.layoutPositioning) === 'ABSOLUTE';
    var parentHasAutoLayout = parentNode &&
        parentNode.type === 'FRAME' &&
        parentNode.layoutMode &&
        parentNode.layoutMode !== 'NONE';
    if (ignoreAutoLayout || !parentHasAutoLayout) {
        return exports.TranslationCondition.ABSOLUTE;
    }
    if (parentHasAutoLayout) {
        // For now, default to padding-based relative positioning
        // This could be enhanced to detect which type of relative positioning is needed
        return exports.TranslationCondition.RELATIVE_PADDING;
    }
    return exports.TranslationCondition.ABSOLUTE;
}
/**
 * Detect animation changes between source and target elements
 */
function detectAnimationChanges(sourceElement, targetElement, sourceNode, targetNode, parentNode) {
    var changes = [];
    var sourceStyle = window.getComputedStyle(sourceElement);
    var targetStyle = window.getComputedStyle(targetElement);
    // Check simple properties
    var simpleProperties = ['opacity', 'backgroundColor', 'color'];
    simpleProperties.forEach(function (property) {
        var sourceValue = sourceStyle[property];
        var targetValue = targetStyle[property];
        if (sourceValue !== targetValue) {
            changes.push({
                type: exports.AnimationType.SIMPLE,
                property: property,
                sourceValue: sourceValue,
                targetValue: targetValue,
                changed: true
            });
        }
    });
    // Check size properties
    var sizeProperties = ['width', 'height'];
    sizeProperties.forEach(function (property) {
        var sourceValue = parseFloat(sourceStyle[property]) || 0;
        var targetValue = parseFloat(targetStyle[property]) || 0;
        if (Math.abs(sourceValue - targetValue) > 1) {
            changes.push({
                type: exports.AnimationType.SIZE,
                property: property,
                sourceValue: sourceValue,
                targetValue: targetValue,
                changed: true
            });
        }
    });
    // Check transform properties based on translation condition
    var translationCondition = getTranslationCondition(sourceElement, sourceNode, parentNode);
    console.log('DEBUG: Translation condition detected:', translationCondition);
    if (translationCondition === exports.TranslationCondition.ABSOLUTE) {
        // Check left/top changes for absolute positioning
        var sourceLeft = parseFloat(sourceStyle.left) || 0;
        var targetLeft = parseFloat(targetStyle.left) || 0;
        var sourceTop = parseFloat(sourceStyle.top) || 0;
        var targetTop = parseFloat(targetStyle.top) || 0;
        if (Math.abs(sourceLeft - targetLeft) > 1) {
            changes.push({
                type: exports.AnimationType.TRANSFORM,
                property: 'translateX',
                sourceValue: sourceLeft,
                targetValue: targetLeft,
                changed: true,
                translationCondition: translationCondition
            });
        }
        if (Math.abs(sourceTop - targetTop) > 1) {
            changes.push({
                type: exports.AnimationType.TRANSFORM,
                property: 'translateY',
                sourceValue: sourceTop,
                targetValue: targetTop,
                changed: true,
                translationCondition: translationCondition
            });
        }
    }
    else if (translationCondition === exports.TranslationCondition.RELATIVE_PADDING) {
        // Check parent padding changes
        var sourceParent = sourceElement.parentElement;
        var targetParent = targetElement.parentElement;
        if (sourceParent && targetParent) {
            var sourceParentStyle_1 = window.getComputedStyle(sourceParent);
            var targetParentStyle_1 = window.getComputedStyle(targetParent);
            var paddingProperties = ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'];
            paddingProperties.forEach(function (property) {
                var sourceValue = parseFloat(sourceParentStyle_1[property]) || 0;
                var targetValue = parseFloat(targetParentStyle_1[property]) || 0;
                if (Math.abs(sourceValue - targetValue) > 1) {
                    changes.push({
                        type: exports.AnimationType.TRANSFORM,
                        property: "parent_".concat(property),
                        sourceValue: sourceValue,
                        targetValue: targetValue,
                        changed: true,
                        translationCondition: translationCondition
                    });
                }
            });
        }
    }
    else if (translationCondition === exports.TranslationCondition.RELATIVE_ALIGNMENT) {
        // Check parent alignment changes
        var sourceParent = sourceElement.parentElement;
        var targetParent = targetElement.parentElement;
        if (sourceParent && targetParent) {
            var sourceParentStyle_2 = window.getComputedStyle(sourceParent);
            var targetParentStyle_2 = window.getComputedStyle(targetParent);
            // Check alignment properties
            var alignmentProperties = ['justifyContent', 'alignItems', 'textAlign', 'verticalAlign'];
            console.log('DEBUG: Checking alignment properties for RELATIVE_ALIGNMENT');
            alignmentProperties.forEach(function (property) {
                var sourceValue = sourceParentStyle_2[property];
                var targetValue = targetParentStyle_2[property];
                console.log("DEBUG: Parent ".concat(property, ":"), { sourceValue: sourceValue, targetValue: targetValue, changed: sourceValue !== targetValue });
                if (sourceValue !== targetValue) {
                    changes.push({
                        type: exports.AnimationType.TRANSFORM,
                        property: "parent_".concat(property),
                        sourceValue: sourceValue || '',
                        targetValue: targetValue || '',
                        changed: true,
                        translationCondition: translationCondition
                    });
                }
            });
            // Check element's own alignment properties
            alignmentProperties.forEach(function (property) {
                var sourceValue = sourceStyle[property];
                var targetValue = targetStyle[property];
                console.log("DEBUG: Element ".concat(property, ":"), { sourceValue: sourceValue, targetValue: targetValue, changed: sourceValue !== targetValue });
                if (sourceValue !== targetValue) {
                    changes.push({
                        type: exports.AnimationType.TRANSFORM,
                        property: property,
                        sourceValue: sourceValue || '',
                        targetValue: targetValue || '',
                        changed: true,
                        translationCondition: translationCondition
                    });
                }
            });
            // Check for flexbox-specific properties
            var flexProperties = ['flexDirection', 'flexWrap', 'alignContent', 'justifyItems'];
            flexProperties.forEach(function (property) {
                var sourceValue = sourceParentStyle_2[property];
                var targetValue = targetParentStyle_2[property];
                console.log("DEBUG: Flex ".concat(property, ":"), { sourceValue: sourceValue, targetValue: targetValue, changed: sourceValue !== targetValue });
                if (sourceValue !== targetValue) {
                    changes.push({
                        type: exports.AnimationType.TRANSFORM,
                        property: "parent_".concat(property),
                        sourceValue: sourceValue || '',
                        targetValue: targetValue || '',
                        changed: true,
                        translationCondition: translationCondition
                    });
                }
            });
            // Check for position changes that might be due to alignment
            var sourceRect = sourceElement.getBoundingClientRect();
            var targetRect = targetElement.getBoundingClientRect();
            var sourceParentRect = sourceParent.getBoundingClientRect();
            var targetParentRect = targetParent.getBoundingClientRect();
            // Calculate relative positions within their containers
            var sourceRelativeX = sourceRect.left - sourceParentRect.left;
            var targetRelativeX = targetRect.left - targetParentRect.left;
            var sourceRelativeY = sourceRect.top - sourceParentRect.top;
            var targetRelativeY = targetRect.top - targetParentRect.top;
            console.log('DEBUG: Relative position analysis:', {
                sourceRelativeX: sourceRelativeX,
                targetRelativeX: targetRelativeX,
                sourceRelativeY: sourceRelativeY,
                targetRelativeY: targetRelativeY,
                xDifference: Math.abs(sourceRelativeX - targetRelativeX),
                yDifference: Math.abs(sourceRelativeY - targetRelativeY)
            });
            // If there's a significant position difference, it might be due to alignment
            if (Math.abs(sourceRelativeX - targetRelativeX) > 1) {
                changes.push({
                    type: exports.AnimationType.TRANSFORM,
                    property: 'alignTranslateX',
                    sourceValue: sourceRelativeX,
                    targetValue: targetRelativeX,
                    changed: true,
                    translationCondition: translationCondition
                });
            }
            if (Math.abs(sourceRelativeY - targetRelativeY) > 1) {
                changes.push({
                    type: exports.AnimationType.TRANSFORM,
                    property: 'alignTranslateY',
                    sourceValue: sourceRelativeY,
                    targetValue: targetRelativeY,
                    changed: true,
                    translationCondition: translationCondition
                });
            }
        }
    }
    console.log('DEBUG: Total changes detected:', changes.length, changes);
    return changes;
}
/**
 * Get node data from element (placeholder)
 */
function getNodeDataFromElement(element) {
    // This would need to be implemented to extract Figma node data from DOM elements
    // For now, return a basic structure
    return {
        type: element.getAttribute('data-figma-type') || 'UNKNOWN',
        layoutPositioning: element.getAttribute('data-layout-positioning') || 'AUTO',
        layoutMode: element.getAttribute('data-layout-mode') || 'NONE'
    };
}
/**
 * Find elements with property changes
 */
function findElementsWithPropertyChanges(targetVariant, currentVariant, originalSourceVariant) {
    if (!currentVariant) {
        return [];
    }
    var targetElements = targetVariant.querySelectorAll('[data-figma-id]');
    var sourceElements = currentVariant.querySelectorAll('[data-figma-id]');
    var sourceElementMap = new Map();
    var elementsToAnimate = [];
    // Build source element map by name
    sourceElements.forEach(function (sourceElement) {
        var sourceName = sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id');
        if (sourceName) {
            sourceElementMap.set(sourceName, sourceElement);
        }
    });
    // Analyze each target element for property changes
    targetElements.forEach(function (element, index) {
        var targetName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
        var sourceElement = sourceElementMap.get(targetName);
        if (sourceElement) {
            var changes = detectPropertyChanges(element, sourceElement, originalSourceVariant);
            if (changes.hasChanges) {
                elementsToAnimate.push({
                    element: sourceElement, // Use SOURCE element (from copy) instead of target
                    sourceElement: sourceElement,
                    changes: changes
                });
            }
        }
    });
    return elementsToAnimate;
}
/**
 * Detect property changes between elements
 */
function detectPropertyChanges(targetElement, sourceElement, originalSourceVariant) {
    var changes = {
        hasChanges: false,
        positionX: { changed: false, sourceValue: null, targetValue: null },
        positionY: { changed: false, sourceValue: null, targetValue: null },
        backgroundColor: { changed: false, sourceValue: null, targetValue: null },
        color: { changed: false, sourceValue: null, targetValue: null },
        justifyContent: { changed: false, sourceValue: null, targetValue: null },
        alignItems: { changed: false, sourceValue: null, targetValue: null }
    };
    try {
        var sourceStyle = window.getComputedStyle(sourceElement);
        var targetStyle = window.getComputedStyle(targetElement);
        // Debug: Log the computed styles of both elements to understand their positioning
        console.log('DEBUG: Source element computed styles:', {
            elementName: sourceElement.getAttribute('data-figma-name'),
            position: sourceStyle.position,
            top: sourceStyle.top,
            left: sourceStyle.left,
            transform: sourceStyle.transform,
            display: sourceStyle.display
        });
        console.log('DEBUG: Target element computed styles:', {
            elementName: targetElement.getAttribute('data-figma-name'),
            position: targetStyle.position,
            top: targetStyle.top,
            left: targetStyle.left,
            transform: targetStyle.transform,
            display: targetStyle.display
        });
        // STEP 1: Check if the node has position changes using bounding rectangles (accounts for flexbox alignment)
        var targetRect = targetElement.getBoundingClientRect();
        // Get parent rectangles for relative positioning
        var sourceParent = sourceElement.parentElement;
        var targetParent = targetElement.parentElement;
        var targetParentRect = targetParent ? targetParent.getBoundingClientRect() : { left: 0, top: 0 };
        // For the source element (copy), use computed styles since it's positioned absolutely
        // For the target element, use bounding rect for accurate positioning
        // Calculate the position differences between source and target
        // Use the original source element's position, not the copy's position
        var originalSourceElement = originalSourceVariant.querySelector('[data-figma-name="' + sourceElement.getAttribute('data-figma-name') + '"]');
        var originalSourceStyle = originalSourceElement ? window.getComputedStyle(originalSourceElement) : sourceStyle;
        var originalSourceRect = originalSourceElement ? originalSourceElement.getBoundingClientRect() : sourceElement.getBoundingClientRect();
        var originalSourceParent = originalSourceElement ? originalSourceElement.parentElement : sourceElement.parentElement;
        var originalSourceParentRect = originalSourceParent ? originalSourceParent.getBoundingClientRect() : (sourceParent === null || sourceParent === void 0 ? void 0 : sourceParent.getBoundingClientRect()) || { left: 0, top: 0 };
        // Calculate positions based on element centers, not top-left corners
        var sourceCenterX = originalSourceRect.left + originalSourceRect.width / 2 - originalSourceParentRect.left;
        var sourceCenterY = originalSourceRect.top + originalSourceRect.height / 2 - originalSourceParentRect.top;
        var targetCenterX = targetRect.left + targetRect.width / 2 - targetParentRect.left;
        var targetCenterY = targetRect.top + targetRect.height / 2 - targetParentRect.top;
        // Convert center positions back to top-left positions for the element
        var sourceLeft = sourceCenterX - originalSourceRect.width / 2;
        var sourceTop = sourceCenterY - originalSourceRect.height / 2;
        var targetLeft = targetCenterX - targetRect.width / 2;
        var targetTop = targetCenterY - targetRect.height / 2;
        // Debug position detection
        console.log('DEBUG: Position detection for element:', sourceElement.getAttribute('data-figma-name'));
        console.log('DEBUG: Original source element found:', !!originalSourceElement);
        console.log('DEBUG: Source rect:', {
            left: originalSourceRect.left,
            top: originalSourceRect.top,
            width: originalSourceRect.width,
            height: originalSourceRect.height
        });
        console.log('DEBUG: Target rect:', {
            left: targetRect.left,
            top: targetRect.top,
            width: targetRect.width,
            height: targetRect.height
        });
        console.log('DEBUG: Source parent rect:', {
            left: originalSourceParentRect.left,
            top: originalSourceParentRect.top
        });
        console.log('DEBUG: Target parent rect:', {
            left: targetParentRect.left,
            top: targetParentRect.top
        });
        console.log('DEBUG: Calculated centers:', {
            sourceCenterX: sourceCenterX,
            sourceCenterY: sourceCenterY,
            targetCenterX: targetCenterX,
            targetCenterY: targetCenterY
        });
        console.log('DEBUG: Final positions:', { sourceLeft: sourceLeft, sourceTop: sourceTop, targetLeft: targetLeft, targetTop: targetTop });
        console.log('DEBUG: Position differences:', {
            xDiff: Math.abs(sourceLeft - targetLeft),
            yDiff: Math.abs(sourceTop - targetTop)
        });
        // STEP 2: Check if the node has ignore auto layout enabled
        var ignoreAutoLayout = sourceElement.getAttribute('data-layout-positioning') === 'ABSOLUTE';
        // STEP 3: Check if the node's parent has auto layout
        var parentHasAutoLayout = sourceParent && targetParent &&
            sourceParent.getAttribute('data-layout-mode') &&
            sourceParent.getAttribute('data-layout-mode') !== 'NONE';
        // Determine if this node should be animated based on the 3-point logic
        var shouldAnimatePosition = false;
        var animationType = 'ABSOLUTE';
        if (Math.abs(sourceLeft - targetLeft) > 1 || Math.abs(sourceTop - targetTop) > 1) {
            // Node has position changes
            if (ignoreAutoLayout) {
                // Node ignores auto layout - animate absolutely
                shouldAnimatePosition = true;
                animationType = 'ABSOLUTE';
                console.log('DEBUG: Node has position changes and ignores auto layout - animating absolutely');
            }
            else if (!parentHasAutoLayout) {
                // Node's parent doesn't have auto layout - animate absolutely
                shouldAnimatePosition = true;
                animationType = 'ABSOLUTE';
                console.log('DEBUG: Node has position changes and parent has no auto layout - animating absolutely');
            }
            else {
                // Node has position changes and parent has auto layout - ANIMATE the node
                // The node moves due to parent's alignment changes, so we animate it smoothly
                shouldAnimatePosition = true;
                animationType = 'ABSOLUTE';
                console.log('DEBUG: Node has position changes and parent has auto layout - ANIMATING (node moves due to parent alignment)');
            }
        }
        else {
            // No position changes - no animation needed
            shouldAnimatePosition = false;
            console.log('DEBUG: No position changes detected - no animation needed');
        }
        // Apply position changes if animation is needed
        if (shouldAnimatePosition) {
            if (Math.abs(sourceLeft - targetLeft) > 1) {
                changes.positionX.changed = true;
                changes.positionX.sourceValue = 0; // Start from 0 (additive animation)
                changes.positionX.targetValue = targetLeft - sourceLeft; // Add the difference to current position
                changes.hasChanges = true;
                // Debug the position calculation
                console.log('DEBUG: Additive position calculation for X:', {
                    sourceLeft: sourceLeft,
                    targetLeft: targetLeft,
                    difference: targetLeft - sourceLeft,
                    elementName: sourceElement.getAttribute('data-figma-name')
                });
            }
            if (Math.abs(sourceTop - targetTop) > 1) {
                changes.positionY.changed = true;
                changes.positionY.sourceValue = 0; // Start from 0 (additive animation)
                changes.positionY.targetValue = targetTop - sourceTop; // Add the difference to current position
                changes.hasChanges = true;
                // Debug the position calculation
                console.log('DEBUG: Additive position calculation for Y:', {
                    sourceTop: sourceTop,
                    targetTop: targetTop,
                    difference: targetTop - sourceTop,
                    elementName: sourceElement.getAttribute('data-figma-name')
                });
            }
        }
        // Check style changes (non-position)
        var sourceBg = sourceStyle.backgroundColor || 'rgba(0, 0, 0, 0)';
        var targetBg = targetStyle.backgroundColor || 'rgba(0, 0, 0, 0)';
        if (sourceBg !== targetBg) {
            changes.backgroundColor.changed = true;
            changes.backgroundColor.sourceValue = sourceBg;
            changes.backgroundColor.targetValue = targetBg;
            changes.hasChanges = true;
        }
        if (sourceStyle.color !== targetStyle.color) {
            changes.color.changed = true;
            changes.color.sourceValue = sourceStyle.color;
            changes.color.targetValue = targetStyle.color;
            changes.hasChanges = true;
        }
        // Only mark alignment changes as requiring animation if there's an actual position difference
        if (sourceStyle.justifyContent !== targetStyle.justifyContent) {
            changes.justifyContent.changed = true;
            changes.justifyContent.sourceValue = sourceStyle.justifyContent;
            changes.justifyContent.targetValue = targetStyle.justifyContent;
            // Only set hasChanges if there's an actual position difference to animate
            if (shouldAnimatePosition) {
                changes.hasChanges = true;
            }
        }
        if (sourceStyle.alignItems !== targetStyle.alignItems) {
            changes.alignItems.changed = true;
            changes.alignItems.sourceValue = sourceStyle.alignItems;
            changes.alignItems.targetValue = targetStyle.alignItems;
            // Only set hasChanges if there's an actual position difference to animate
            if (shouldAnimatePosition) {
                changes.hasChanges = true;
            }
        }
    }
    catch (error) {
        console.error('Error detecting property changes:', error);
    }
    return changes;
}


/***/ }),

/***/ 775:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/**
 * Transition Manager Module
 *
 * Responsible for managing the overall transition lifecycle, including
 * animation monitoring, completion detection, and cleanup.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.animateCopyToDestination = animateCopyToDestination;
exports.handleAnimatedVariantSwitch = handleAnimatedVariantSwitch;
exports.performInstantVariantSwitch = performInstantVariantSwitch;
exports.getTransitionLockStatus = getTransitionLockStatus;
exports.setTransitionLock = setTransitionLock;
exports.clearTransitionLock = clearTransitionLock;
var animation_detector_1 = __webpack_require__(585);
var animation_applier_1 = __webpack_require__(192);
var element_copier_1 = __webpack_require__(819);
// Global transition state machine to prevent race conditions
var TransitionState;
(function (TransitionState) {
    TransitionState["IDLE"] = "IDLE";
    TransitionState["TRANSITIONING"] = "TRANSITIONING";
    TransitionState["ERROR"] = "ERROR";
})(TransitionState || (TransitionState = {}));
var transitionStateMachine = {
    state: TransitionState.IDLE,
    currentPromise: null,
    transitionId: null,
    startTime: null
};
// Atomic state transitions
function canStartTransition() {
    return transitionStateMachine.state === TransitionState.IDLE;
}
function startTransition(transitionId, promise) {
    if (!canStartTransition()) {
        console.warn('⚠️ TRANSITION ALREADY IN PROGRESS - cannot start new transition');
        return false;
    }
    transitionStateMachine = {
        state: TransitionState.TRANSITIONING,
        currentPromise: promise,
        transitionId: transitionId,
        startTime: Date.now()
    };
    console.log('🔄 TRANSITION STARTED:', { transitionId: transitionId, startTime: transitionStateMachine.startTime });
    return true;
}
function completeTransition(transitionId) {
    if (transitionStateMachine.transitionId !== transitionId) {
        console.warn('⚠️ TRANSITION ID MISMATCH - ignoring completion for:', transitionId);
        return;
    }
    var duration = transitionStateMachine.startTime ? Date.now() - transitionStateMachine.startTime : 0;
    console.log('✅ TRANSITION COMPLETED:', { transitionId: transitionId, duration: "".concat(duration, "ms") });
    transitionStateMachine = {
        state: TransitionState.IDLE,
        currentPromise: null,
        transitionId: null,
        startTime: null
    };
}
function errorTransition(transitionId, error) {
    console.error('❌ TRANSITION ERROR:', { transitionId: transitionId, error: error.message });
    transitionStateMachine = {
        state: TransitionState.ERROR,
        currentPromise: null,
        transitionId: null,
        startTime: null
    };
    // Auto-recover from error state after 5 seconds
    setTimeout(function () {
        if (transitionStateMachine.state === TransitionState.ERROR) {
            console.log('🔄 AUTO-RECOVERING from error state');
            transitionStateMachine.state = TransitionState.IDLE;
        }
    }, 5000);
}
// Legacy compatibility functions (deprecated - use state machine instead)
var isTransitionInProgress = false;
var currentTransitionPromise = null;
/**
 * Animate copy to destination
 */
function animateCopyToDestination(copy, destination, originalSourceElement, transitionType, transitionDuration) {
    return new Promise(function (resolve) {
        // Update copy content to match destination content
        (0, element_copier_1.updateCopyContentToMatchDestination)(copy, destination);
        // Find elements with property changes
        var elementsToAnimate = (0, animation_detector_1.findElementsWithPropertyChanges)(destination, copy, originalSourceElement);
        var easingFunction = (0, animation_applier_1.getEasingFunction)(transitionType);
        var duration = parseFloat(transitionDuration.toString() || '0.3');
        if (elementsToAnimate.length > 0) {
            console.log('DEBUG: Animating copy with', elementsToAnimate.length, 'elements using modular system');
            // Setup animation for each element using the changes already detected
            elementsToAnimate.forEach(function (_a) {
                var element = _a.element, sourceElement = _a.sourceElement, changes = _a.changes;
                (0, animation_applier_1.setupElementAnimation)(element, changes, duration, easingFunction, destination);
            });
            // Force reflow
            copy.offsetHeight;
            // Monitor animation progress using transition end events
            var completedAnimations_1 = 0;
            var totalAnimations_1 = elementsToAnimate.length;
            console.log('DEBUG: Setting up animation monitoring for', totalAnimations_1, 'elements');
            // Track which elements have actually been animated and their transition properties
            var animatedElementsSet_1 = new Set();
            var transitionProperties_1 = new Map(); // Track which properties are being transitioned
            // Also track which elements have been processed to avoid double-counting
            var processedElements_1 = new Set();
            // Track if animation has completed to stop sub-frame tracking
            var animationCompleted_1 = false;
            // Set up transition properties for monitoring
            elementsToAnimate.forEach(function (_a, index) {
                var element = _a.element, changes = _a.changes;
                var elementName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
                var elementProperties = [];
                // Check for combined transform or individual position changes
                var hasPositionX = changes.positionX && changes.positionX.changed;
                var hasPositionY = changes.positionY && changes.positionY.changed;
                if (hasPositionX || hasPositionY) {
                    // Use transform for combined movement, or individual properties for single-axis movement
                    if (hasPositionX && hasPositionY) {
                        elementProperties.push('transform'); // Combined transform
                    }
                    else {
                        if (hasPositionX)
                            elementProperties.push('left');
                        if (hasPositionY)
                            elementProperties.push('top');
                    }
                }
                if (changes.backgroundColor && changes.backgroundColor.changed) {
                    elementProperties.push('background-color');
                }
                if (changes.color && changes.color.changed) {
                    elementProperties.push('color');
                }
                if (changes.justifyContent && changes.justifyContent.changed) {
                    elementProperties.push('left');
                }
                if (changes.alignItems && changes.alignItems.changed) {
                    elementProperties.push('top');
                }
                // Remove duplicates and set the properties
                var uniqueProperties = __spreadArray([], __read(new Set(elementProperties)), false);
                transitionProperties_1.set(element, uniqueProperties);
            });
            var onTransitionEnd_1 = function (event) {
                var targetElement = event.target;
                var propertyName = event.propertyName;
                console.log('🎯 TRANSITION END EVENT:', {
                    targetElement: targetElement.getAttribute('data-figma-name') || targetElement.getAttribute('data-figma-id'),
                    propertyName: propertyName,
                    timestamp: Date.now()
                });
                // Find which element this transition belongs to
                var animatedElement = elementsToAnimate.find(function (_a) {
                    var element = _a.element;
                    return targetElement === element || element.contains(targetElement);
                });
                if (animatedElement) {
                    var elementKey = animatedElement.element;
                    var expectedProperties = transitionProperties_1.get(elementKey) || [];
                    // Check if this is a property we're expecting to transition
                    if (expectedProperties.includes(propertyName)) {
                        // Remove this property from the expected list
                        var updatedProperties = expectedProperties.filter(function (p) { return p !== propertyName; });
                        transitionProperties_1.set(elementKey, updatedProperties);
                        // If all properties for this element have completed, mark the element as done
                        if (updatedProperties.length === 0 && !animatedElementsSet_1.has(elementKey)) {
                            animatedElementsSet_1.add(elementKey);
                            completedAnimations_1++;
                            if (completedAnimations_1 >= totalAnimations_1) {
                                console.log('🎯 All animations completed via transition end');
                                animationCompleted_1 = true;
                                copy.removeEventListener('transitionend', onTransitionEnd_1);
                                copy.removeEventListener('transitionend', onCopyTransitionEnd_1);
                                childElements_1.forEach(function (child) {
                                    child.removeEventListener('transitionend', onTransitionEnd_1);
                                });
                                clearTimeout(fallbackTimeout_1);
                                clearInterval(intervalId_1);
                                clearInterval(progressCheckInterval_1);
                                resolve();
                            }
                        }
                    }
                }
                else {
                    // Check if this is a child element that might be part of an animated element
                    var parentAnimatedElement = elementsToAnimate.find(function (_a) {
                        var element = _a.element;
                        return element.contains(targetElement);
                    });
                    if (parentAnimatedElement && !processedElements_1.has(targetElement)) {
                        processedElements_1.add(targetElement);
                        // For child elements, we'll use a simpler approach - just count unique elements
                        var elementKey = parentAnimatedElement.element;
                        if (!animatedElementsSet_1.has(elementKey)) {
                            animatedElementsSet_1.add(elementKey);
                            completedAnimations_1++;
                            if (completedAnimations_1 >= totalAnimations_1) {
                                console.log('🎯 All animations completed via child transition');
                                animationCompleted_1 = true;
                                copy.removeEventListener('transitionend', onTransitionEnd_1);
                                copy.removeEventListener('transitionend', onCopyTransitionEnd_1);
                                childElements_1.forEach(function (child) {
                                    child.removeEventListener('transitionend', onTransitionEnd_1);
                                });
                                clearTimeout(fallbackTimeout_1);
                                clearInterval(intervalId_1);
                                clearInterval(progressCheckInterval_1);
                                resolve();
                            }
                        }
                    }
                }
            };
            // Add a more aggressive monitoring approach - check if animations are actually complete
            var checkAnimationProgressDetailed = function () {
                var actuallyCompleted = 0;
                elementsToAnimate.forEach(function (_a) {
                    var _b, _c;
                    var element = _a.element, changes = _a.changes;
                    var computedStyle = window.getComputedStyle(element);
                    var elementName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
                    // Only log position when there's a significant change or completion
                    var currentLeft = parseFloat(computedStyle.left) || 0;
                    var currentTop = parseFloat(computedStyle.top) || 0;
                    var currentTransform = computedStyle.transform;
                    // Check if the element has reached its target position
                    var isComplete = false;
                    // Check if this is a transform-based animation
                    var hasTransformAnimation = currentTransform && currentTransform !== 'none' && currentTransform !== 'matrix(1, 0, 0, 1, 0, 0)';
                    if (hasTransformAnimation) {
                        // CRITICAL FIX: Don't mark transform animations as complete immediately
                        // Let the CSS transition take its full duration
                        // isComplete = true; // Removed - let transition end events handle completion
                    }
                    else {
                        // For position-based animations, check left/top values
                        if (changes.positionY && changes.positionY.changed) {
                            var targetTop = changes.positionY.targetValue;
                            var difference = Math.abs(currentTop - targetTop);
                            if (difference < 5) { // Allow for small rounding differences
                                isComplete = true;
                            }
                        }
                        if (changes.positionX && changes.positionX.changed) {
                            var targetLeft = changes.positionX.targetValue;
                            var difference = Math.abs(currentLeft - targetLeft);
                            if (difference < 5) { // Allow for small rounding differences
                                isComplete = true;
                            }
                        }
                    }
                    if (isComplete && !animatedElementsSet_1.has(element)) {
                        console.log('🎯 POSITION CHECK COMPLETED:', {
                            elementName: elementName,
                            currentLeft: currentLeft,
                            currentTop: currentTop,
                            targetLeft: ((_b = changes.positionX) === null || _b === void 0 ? void 0 : _b.targetValue) || 0,
                            targetTop: ((_c = changes.positionY) === null || _c === void 0 ? void 0 : _c.targetValue) || 0,
                            timestamp: Date.now()
                        });
                        animatedElementsSet_1.add(element);
                        actuallyCompleted++;
                    }
                });
                if (actuallyCompleted > 0) {
                    completedAnimations_1 += actuallyCompleted;
                    if (completedAnimations_1 >= totalAnimations_1) {
                        console.log('🎯 All animations completed via position check');
                        animationCompleted_1 = true;
                        copy.removeEventListener('transitionend', onTransitionEnd_1);
                        copy.removeEventListener('transitionend', onCopyTransitionEnd_1);
                        childElements_1.forEach(function (child) {
                            child.removeEventListener('transitionend', onTransitionEnd_1);
                        });
                        clearInterval(intervalId_1);
                        clearInterval(progressCheckInterval_1);
                        resolve();
                    }
                }
            };
            // Log animation start details
            console.log('🎬 ANIMATION START:', {
                totalElements: elementsToAnimate.length,
                transitionType: transitionType,
                transitionDuration: transitionDuration,
                easingFunction: (0, animation_applier_1.getEasingFunction)(transitionType),
                elements: elementsToAnimate.map(function (_a) {
                    var _b, _c, _d, _e;
                    var element = _a.element, changes = _a.changes;
                    return ({
                        elementName: element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id'),
                        initialLeft: parseFloat(window.getComputedStyle(element).left) || 0,
                        initialTop: parseFloat(window.getComputedStyle(element).top) || 0,
                        targetLeft: ((_b = changes.positionX) === null || _b === void 0 ? void 0 : _b.targetValue) || 0,
                        targetTop: ((_c = changes.positionY) === null || _c === void 0 ? void 0 : _c.targetValue) || 0,
                        hasPositionX: ((_d = changes.positionX) === null || _d === void 0 ? void 0 : _d.changed) || false,
                        hasPositionY: ((_e = changes.positionY) === null || _e === void 0 ? void 0 : _e.changed) || false
                    });
                })
            });
            // Add simplified animation progress tracking (no sub-frame logging)
            var animationStartTime_1 = Date.now();
            var checkAnimationProgressSimple = function () {
                // Stop tracking if animation has completed
                if (animationCompleted_1) {
                    return;
                }
                var currentTime = Date.now();
                var elapsed = currentTime - animationStartTime_1;
                // Only log significant progress milestones (every 100ms)
                if (elapsed % 100 < 16) { // Log roughly every 100ms
                    console.log('🎬 ANIMATION PROGRESS:', {
                        elapsed: elapsed + 'ms',
                        elements: elementsToAnimate.length,
                        transitionType: transitionType,
                        transitionDuration: transitionDuration
                    });
                }
            };
            // Check progress every 100ms instead of 16ms
            var progressInterval_1 = setInterval(checkAnimationProgressSimple, 100);
            // Stop progress tracking after animation duration + buffer
            setTimeout(function () {
                clearInterval(progressInterval_1);
                console.log('🎬 PROGRESS TRACKING COMPLETED');
                // CRITICAL FIX: Stop all animation monitoring when the animation should be complete
                // This prevents the monitoring from continuing to track the destination variant
                if (!animationCompleted_1) {
                    console.log('🎬 FORCING ANIMATION COMPLETION - stopping all monitoring');
                    animationCompleted_1 = true;
                    copy.removeEventListener('transitionend', onTransitionEnd_1);
                    copy.removeEventListener('transitionend', onCopyTransitionEnd_1);
                    childElements_1.forEach(function (child) {
                        child.removeEventListener('transitionend', onTransitionEnd_1);
                    });
                    clearTimeout(fallbackTimeout_1);
                    clearInterval(intervalId_1);
                    clearInterval(progressInterval_1);
                    // CRITICAL FIX: Ensure the copy has the final position before resolving
                    elementsToAnimate.forEach(function (_a) {
                        var _b, _c;
                        var element = _a.element, changes = _a.changes;
                        var elementName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
                        var computedStyle = window.getComputedStyle(element);
                        console.log('🎬 FINAL POSITION BEFORE RESOLVE:', {
                            elementName: elementName,
                            finalLeft: computedStyle.left,
                            finalTop: computedStyle.top,
                            targetLeft: ((_b = changes.positionX) === null || _b === void 0 ? void 0 : _b.targetValue) || 0,
                            targetTop: ((_c = changes.positionY) === null || _c === void 0 ? void 0 : _c.targetValue) || 0
                        });
                    });
                    resolve();
                }
            }, parseFloat(transitionDuration.toString() || '0.3') * 1000 + 500);
            // Set up periodic position checking with simplified logging
            var progressCheckInterval_1 = setInterval(checkAnimationProgressDetailed, 100); // Check every 100ms
            // Store the interval ID so we can clear it later
            var intervalId_1 = progressCheckInterval_1;
            // Also listen for transitions on the copy element itself
            var onCopyTransitionEnd_1 = function (event) {
                var propertyName = event.propertyName;
                // Since the copy itself isn't animated, we need to find which child element this transition belongs to
                // The transition end event on the copy usually means one of its animated children has completed
                var animatedElement = elementsToAnimate.find(function (_a) {
                    var element = _a.element;
                    return copy.contains(element);
                });
                if (animatedElement) {
                    var elementKey = animatedElement.element;
                    var expectedProperties = transitionProperties_1.get(elementKey) || [];
                    // Check if this is a property we're expecting to transition
                    if (expectedProperties.includes(propertyName)) {
                        // Remove this property from the expected list
                        var updatedProperties = expectedProperties.filter(function (p) { return p !== propertyName; });
                        transitionProperties_1.set(elementKey, updatedProperties);
                        // If all properties for this element have completed, mark the element as done
                        if (updatedProperties.length === 0 && !animatedElementsSet_1.has(elementKey)) {
                            animatedElementsSet_1.add(elementKey);
                            completedAnimations_1++;
                            if (completedAnimations_1 >= totalAnimations_1) {
                                console.log('🎯 All animations completed via property completion');
                                animationCompleted_1 = true;
                                copy.removeEventListener('transitionend', onTransitionEnd_1);
                                copy.removeEventListener('transitionend', onCopyTransitionEnd_1);
                                childElements_1.forEach(function (child) {
                                    child.removeEventListener('transitionend', onTransitionEnd_1);
                                });
                                clearTimeout(fallbackTimeout_1);
                                clearInterval(intervalId_1);
                                clearInterval(progressCheckInterval_1);
                                resolve();
                            }
                        }
                    }
                }
            };
            // Add transition end listener to the copy element and all its children
            copy.addEventListener('transitionend', onTransitionEnd_1);
            copy.addEventListener('transitionend', onCopyTransitionEnd_1);
            // Also listen for transitions on child elements that might be animated
            var childElements_1 = copy.querySelectorAll('*');
            childElements_1.forEach(function (child) {
                child.addEventListener('transitionend', onTransitionEnd_1);
            });
            // Fallback timeout in case transition events don't fire
            var fallbackTimeout_1 = setTimeout(function () {
                // Check if animations are actually complete by examining the computed styles
                var actuallyCompleted = 0;
                elementsToAnimate.forEach(function (_a) {
                    var element = _a.element, changes = _a.changes;
                    var computedStyle = window.getComputedStyle(element);
                    // If transition is 'none' or empty, animation is likely complete
                    if (!computedStyle.transition || computedStyle.transition === 'none' || computedStyle.transition === 'all 0s ease 0s') {
                        actuallyCompleted++;
                    }
                });
                console.log('🎯 All animations completed via fallback timeout');
                animationCompleted_1 = true;
                copy.removeEventListener('transitionend', onTransitionEnd_1);
                copy.removeEventListener('transitionend', onCopyTransitionEnd_1);
                childElements_1.forEach(function (child) {
                    child.removeEventListener('transitionend', onTransitionEnd_1);
                });
                clearInterval(intervalId_1);
                clearInterval(progressInterval_1);
                resolve();
            }, parseFloat(transitionDuration.toString() || '0.3') * 1000 + 2000); // Add 2s buffer for more reliability
        }
        else {
            resolve();
        }
    });
}
/**
 * Handle animated variant switching
 */
function handleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration) {
    return __awaiter(this, void 0, void 0, function () {
        var transitionId, transitionPromise;
        var _this = this;
        return __generator(this, function (_a) {
            transitionId = "transition_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
            console.log('🔄 VARIANT SWITCH SEQUENCE START:', {
                transitionId: transitionId,
                sourceId: sourceElement.getAttribute('data-figma-id'),
                sourceName: sourceElement.getAttribute('data-figma-name'),
                destinationId: destination.getAttribute('data-figma-id'),
                destinationName: destination.getAttribute('data-figma-name'),
                transitionType: transitionType,
                transitionDuration: transitionDuration,
                totalVariants: allVariants.length
            });
            transitionPromise = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var targetParentComponentSet, htmlTargetParentComponentSet, parentComponentSet, htmlParentComponentSet, sourcePositions, targetPositions, sourceCopy, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            // Register this transition with the state machine
                            if (!startTransition(transitionId, transitionPromise)) {
                                reject(new Error('Cannot start transition - another transition is in progress'));
                                return [2 /*return*/];
                            }
                            // ✅ STEP 1: CRITICAL - Position variants at 0px top/left BEFORE measuring
                            console.log('📐 PRE-POSITIONING: Ensuring variants are at 0px top/left before measurement');
                            // Position source variant at 0px top/left
                            sourceElement.style.setProperty('position', 'relative', 'important');
                            sourceElement.style.setProperty('top', '0px', 'important');
                            sourceElement.style.setProperty('left', '0px', 'important');
                            sourceElement.style.setProperty('transform', 'none', 'important');
                            // Position target variant at 0px top/left 
                            destination.style.setProperty('position', 'relative', 'important');
                            destination.style.setProperty('top', '0px', 'important');
                            destination.style.setProperty('left', '0px', 'important');
                            destination.style.setProperty('transform', 'none', 'important');
                            targetParentComponentSet = destination.closest('[data-figma-type="COMPONENT_SET"]');
                            if (targetParentComponentSet) {
                                htmlTargetParentComponentSet = targetParentComponentSet;
                                htmlTargetParentComponentSet.style.setProperty('position', 'relative', 'important');
                                htmlTargetParentComponentSet.style.setProperty('top', '0px', 'important');
                                htmlTargetParentComponentSet.style.setProperty('left', '0px', 'important');
                                htmlTargetParentComponentSet.style.setProperty('transform', 'none', 'important');
                            }
                            parentComponentSet = sourceElement.closest('[data-figma-type="COMPONENT_SET"]');
                            if (parentComponentSet) {
                                htmlParentComponentSet = parentComponentSet;
                                htmlParentComponentSet.style.setProperty('position', 'relative', 'important');
                                htmlParentComponentSet.style.setProperty('top', '0px', 'important');
                                htmlParentComponentSet.style.setProperty('left', '0px', 'important');
                                htmlParentComponentSet.style.setProperty('transform', 'none', 'important');
                            }
                            // Force reflow to apply positioning changes
                            sourceElement.offsetHeight;
                            destination.offsetHeight;
                            console.log('📐 POSITIONING COMPLETE: All variants positioned at 0px top/left');
                            // ✅ STEP 2: NOW measure positions after proper positioning
                            console.log('📏 PRE-MEASUREMENT: Measuring source and target positions while visible');
                            sourcePositions = void 0;
                            targetPositions = void 0;
                            // ✅ CRITICAL: Use class removal method for pre-positioned variants to respect JavaScript positioning
                            console.log('📏 USING CLASS REMOVAL measurement (respects pre-positioning)');
                            sourcePositions = (0, element_copier_1.measureElementPositions)(sourceElement);
                            targetPositions = (0, element_copier_1.measureElementPositions)(destination);
                            console.log('📏 Source positions measured:', sourcePositions.size, 'elements');
                            console.log('📏 Target positions measured:', targetPositions.size, 'elements');
                            sourceCopy = (0, element_copier_1.createElementCopy)(sourceElement);
                            console.log('DEBUG: Element copy created successfully');
                            // ✅ STEP 3: Insert copy and make it visible
                            (0, element_copier_1.insertCopyIntoDOM)(sourceCopy, sourceElement);
                            // ✅ STEP 4: NOW hide source and target after measurements
                            (0, element_copier_1.hideAllVariantsExceptCopy)(allVariants, sourceCopy);
                            // ✅ STEP 5: Use pre-measured positions for animation
                            return [4 /*yield*/, (0, element_copier_1.animateWithPreMeasuredPositions)(sourceCopy, sourcePositions, targetPositions, transitionType, transitionDuration)];
                        case 1:
                            // ✅ STEP 5: Use pre-measured positions for animation
                            _a.sent();
                            // ✅ STEP 6: Complete animation - show only target
                            console.log('✅ ANIMATION COMPLETED - completing animation and showing only target');
                            (0, element_copier_1.completeAnimationAndShowTarget)(sourceCopy, sourceElement, destination, allVariants);
                            // Force a reflow to ensure the position changes are applied before starting reactions
                            destination.offsetHeight;
                            // Start timeout reactions
                            console.log('⏰ STARTING TIMEOUT REACTIONS for destination variant');
                            if (window.startTimeoutReactionsForNewlyActiveVariant) {
                                window.startTimeoutReactionsForNewlyActiveVariant(destination);
                            }
                            if (window.startTimeoutReactionsForNestedComponents) {
                                window.startTimeoutReactionsForNestedComponents(destination);
                            }
                            console.log('✅ VARIANT SWITCH SEQUENCE COMPLETED:', {
                                transitionId: transitionId,
                                sourceId: sourceElement.getAttribute('data-figma-id'),
                                destinationId: destination.getAttribute('data-figma-id'),
                                transitionType: transitionType
                            });
                            // Complete the transition in state machine
                            completeTransition(transitionId);
                            resolve();
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            console.error('❌ Error during animated variant switch:', error_1);
                            errorTransition(transitionId, error_1);
                            reject(error_1);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Wait for the transition to complete
            return [2 /*return*/, transitionPromise];
        });
    });
}
/**
 * Perform instant variant switch
 */
function performInstantVariantSwitch(allVariants, destination) {
    console.log('⚡ PERFORMING INSTANT VARIANT SWITCH');
    // Hide all variants with safe operations
    allVariants.forEach(function (variant) {
        (0, element_copier_1.safeElementOperation)(variant, function (el) {
            el.classList.add('variant-hidden');
            el.classList.remove('variant-active');
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            // Don't reset positions for hidden variants - let them keep their natural positions
            if (!el.style.position || el.style.position === 'static') {
                el.style.position = 'relative';
            }
        }, "performInstantVariantSwitch - hide variant ".concat(variant.getAttribute('data-figma-id')));
    });
    // Show destination variant with safe operations
    (0, element_copier_1.safeElementOperation)(destination, function (el) {
        el.classList.add('variant-active');
        el.classList.remove('variant-hidden');
        el.style.display = 'flex';
        el.style.visibility = 'visible';
        el.style.opacity = '1';
        // Don't reset position for destination - let it keep its natural position
        if (!el.style.position || el.style.position === 'static') {
            el.style.position = 'relative';
        }
    }, 'performInstantVariantSwitch - show destination variant');
    console.log('✅ INSTANT VARIANT SWITCH COMPLETED:', {
        destinationId: destination.getAttribute('data-figma-id'),
        destinationName: destination.getAttribute('data-figma-name'),
        display: destination.style.display,
        visibility: destination.style.visibility,
        opacity: destination.style.opacity
    });
    // Start timeout reactions
    if (window.startTimeoutReactionsForNewlyActiveVariant) {
        window.startTimeoutReactionsForNewlyActiveVariant(destination);
    }
    if (window.startTimeoutReactionsForNestedComponents) {
        window.startTimeoutReactionsForNestedComponents(destination);
    }
}
/**
 * Get transition lock status
 */
function getTransitionLockStatus() {
    return { isTransitionInProgress: isTransitionInProgress, currentTransitionPromise: currentTransitionPromise };
}
/**
 * Set transition lock
 */
function setTransitionLock(inProgress, promise) {
    if (promise === void 0) { promise = null; }
    isTransitionInProgress = inProgress;
    currentTransitionPromise = promise;
}
/**
 * Clear transition lock
 */
function clearTransitionLock() {
    isTransitionInProgress = false;
    currentTransitionPromise = null;
}


/***/ }),

/***/ 819:
/***/ (function(__unused_webpack_module, exports) {


/**
 * Element Copying Module
 *
 * Responsible for creating and managing element copies during animations.
 * This module handles the logic for copying source elements, positioning them,
 * and updating their content to match the destination.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.safeElementOperation = safeElementOperation;
exports.safeQuerySelector = safeQuerySelector;
exports.safeGetBoundingClientRect = safeGetBoundingClientRect;
exports.injectAnimationCSS = injectAnimationCSS;
exports.measureElementPositions = measureElementPositions;
exports.measureElementPositionsWithCSS = measureElementPositionsWithCSS;
exports.hideAllVariantsExceptCopy = hideAllVariantsExceptCopy;
exports.animateWithPreMeasuredPositions = animateWithPreMeasuredPositions;
exports.showOnlyCopyDuringAnimation = showOnlyCopyDuringAnimation;
exports.completeAnimationAndShowTarget = completeAnimationAndShowTarget;
exports.createElementCopy = createElementCopy;
exports.updateCopyContentToMatchDestination = updateCopyContentToMatchDestination;
exports.insertCopyIntoDOM = insertCopyIntoDOM;
exports.removeCopyFromDOM = removeCopyFromDOM;
exports.hideOriginalElements = hideOriginalElements;
exports.showDestinationVariant = showDestinationVariant;
/**
 * Safe DOM manipulation utilities
 */
function safeElementOperation(element, operation, errorMessage) {
    if (!element) {
        console.error("\u274C DOM OPERATION FAILED: ".concat(errorMessage, " - element is null/undefined"));
        return false;
    }
    if (!(element instanceof HTMLElement)) {
        console.error("\u274C DOM OPERATION FAILED: ".concat(errorMessage, " - element is not HTMLElement"));
        return false;
    }
    try {
        operation(element);
        return true;
    }
    catch (error) {
        console.error("\u274C DOM OPERATION FAILED: ".concat(errorMessage), error);
        return false;
    }
}
function safeQuerySelector(selector, context) {
    if (context === void 0) { context = document; }
    try {
        var element = context.querySelector(selector);
        return element instanceof HTMLElement ? element : null;
    }
    catch (error) {
        console.error("\u274C QUERY SELECTOR FAILED: ".concat(selector), error);
        return null;
    }
}
function safeGetBoundingClientRect(element) {
    try {
        return element.getBoundingClientRect();
    }
    catch (error) {
        console.error('❌ GET BOUNDING CLIENT RECT FAILED:', error);
        return null;
    }
}
/**
 * FIX 5: Inject CSS to prevent animation conflicts
 */
function injectAnimationCSS() {
    var styleId = 'figma-animation-styles';
    // Check if styles are already injected
    if (document.getElementById(styleId)) {
        return;
    }
    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = "\n    /* Animation copy visibility */\n    .animation-copy {\n      display: flex !important;\n      pointer-events: none !important;\n      z-index: 9999 !important;\n    }\n\n    /* Source element hidden during animation */\n    .animation-source-hidden {\n      display: none !important;\n    }\n\n    /* Target element hidden during animation */\n    .animation-target-hidden {\n      display: none !important;\n    }\n\n    /* Ensure variant transitions are smooth */\n    .variant-active {\n      display: flex !important;\n      visibility: visible !important;\n      opacity: 1 !important;\n    }\n\n    .variant-hidden {\n      display: none !important;\n      visibility: hidden !important;\n      opacity: 0 !important;\n    }\n\n    /* Measurement override - highest specificity to override all other rules */\n    .measuring-positions,\n    .measuring-positions.variant-hidden,\n    .measuring-positions.animation-source-hidden,\n    .measuring-positions.animation-target-hidden {\n      display: flex !important;\n      visibility: visible !important;\n      opacity: 1 !important;\n      position: relative !important;\n      top: 0px !important;\n      left: 0px !important;\n      transform: none !important;\n    }\n\n    /* Ensure child elements are also visible during measurement */\n    .measuring-positions * {\n      visibility: visible !important;\n    }\n  ";
    document.head.appendChild(style);
    console.log('✅ ANIMATION CSS: Injected animation styles to prevent conflicts');
}
/**
 * POSITION MEASUREMENT FIX: Measure element positions while visible
 * This must happen BEFORE hiding elements to get accurate rectangles
 */
function measureElementPositions(variantElement) {
    console.log('📏 MEASURING POSITIONS: Starting measurement for variant:', variantElement.getAttribute('data-figma-name'));
    var positions = new Map();
    // ✅ CRITICAL FIX: Remove CSS classes that have !important rules
    var originalClasses = {
        variantActive: variantElement.classList.contains('variant-active'),
        variantHidden: variantElement.classList.contains('variant-hidden'),
        animationSourceHidden: variantElement.classList.contains('animation-source-hidden'),
        animationTargetHidden: variantElement.classList.contains('animation-target-hidden')
    };
    // Store original inline styles (including positioning to preserve pre-positioning)
    var originalStyles = {
        display: variantElement.style.display,
        visibility: variantElement.style.visibility,
        opacity: variantElement.style.opacity,
        position: variantElement.style.position,
        top: variantElement.style.top,
        left: variantElement.style.left,
        transform: variantElement.style.transform
    };
    console.log("\uD83D\uDCCF MEASUREMENT PREP: Element ".concat(variantElement.getAttribute('data-figma-name'), " - Original classes:"), originalClasses);
    // ✅ CRITICAL: Remove conflicting CSS classes temporarily
    variantElement.classList.remove('variant-hidden');
    variantElement.classList.remove('variant-active');
    variantElement.classList.remove('animation-source-hidden');
    variantElement.classList.remove('animation-target-hidden');
    // Set styles to ensure visibility (without !important conflicts)
    variantElement.style.display = 'flex';
    variantElement.style.visibility = 'visible';
    variantElement.style.opacity = '1';
    // Force reflow to apply changes
    variantElement.offsetHeight;
    // Measure the variant itself
    var variantRect = variantElement.getBoundingClientRect();
    positions.set(variantElement.getAttribute('data-figma-id'), {
        rect: variantRect,
        computedStyle: window.getComputedStyle(variantElement),
        element: variantElement
    });
    console.log("\uD83D\uDCCF Measured variant ".concat(variantElement.getAttribute('data-figma-name'), ":"), {
        left: variantRect.left,
        top: variantRect.top,
        width: variantRect.width,
        height: variantRect.height
    });
    // Measure all child elements
    var childElements = variantElement.querySelectorAll('[data-figma-id]');
    childElements.forEach(function (element) {
        var rect = element.getBoundingClientRect();
        var computedStyle = window.getComputedStyle(element);
        positions.set(element.getAttribute('data-figma-id'), {
            rect: rect,
            computedStyle: computedStyle,
            element: element
        });
        console.log("\uD83D\uDCCF Measured child ".concat(element.getAttribute('data-figma-name'), ":"), {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
        });
    });
    // ✅ RESTORE: Put back original classes and styles
    // Restore CSS classes
    if (originalClasses.variantActive) {
        variantElement.classList.add('variant-active');
    }
    if (originalClasses.variantHidden) {
        variantElement.classList.add('variant-hidden');
    }
    if (originalClasses.animationSourceHidden) {
        variantElement.classList.add('animation-source-hidden');
    }
    if (originalClasses.animationTargetHidden) {
        variantElement.classList.add('animation-target-hidden');
    }
    // Restore original inline styles (including positioning to preserve pre-positioning)
    variantElement.style.display = originalStyles.display;
    variantElement.style.visibility = originalStyles.visibility;
    variantElement.style.opacity = originalStyles.opacity;
    variantElement.style.position = originalStyles.position;
    variantElement.style.top = originalStyles.top;
    variantElement.style.left = originalStyles.left;
    variantElement.style.transform = originalStyles.transform;
    console.log("\uD83D\uDCCF MEASUREMENT RESTORE: Element ".concat(variantElement.getAttribute('data-figma-name'), " - Classes restored:"), originalClasses);
    console.log('📏 MEASUREMENT COMPLETE: Measured', positions.size, 'elements');
    return positions;
}
/**
 * Alternative measurement approach using CSS class override
 */
function measureElementPositionsWithCSS(variantElement) {
    console.log('📏 CSS MEASUREMENT: Starting measurement for variant:', variantElement.getAttribute('data-figma-name'));
    var positions = new Map();
    // Add measurement class that overrides hidden states with higher specificity
    variantElement.classList.add('measuring-positions');
    // Force reflow to apply CSS changes
    variantElement.offsetHeight;
    // Measure the variant (should now get real values)
    var variantRect = variantElement.getBoundingClientRect();
    positions.set(variantElement.getAttribute('data-figma-id'), {
        rect: variantRect,
        computedStyle: window.getComputedStyle(variantElement),
        element: variantElement
    });
    console.log("\uD83D\uDCCF CSS MEASURED variant ".concat(variantElement.getAttribute('data-figma-name'), ":"), {
        left: variantRect.left,
        top: variantRect.top,
        width: variantRect.width,
        height: variantRect.height
    });
    // Measure all child elements
    var childElements = variantElement.querySelectorAll('[data-figma-id]');
    childElements.forEach(function (element) {
        var rect = element.getBoundingClientRect();
        var computedStyle = window.getComputedStyle(element);
        positions.set(element.getAttribute('data-figma-id'), {
            rect: rect,
            computedStyle: computedStyle,
            element: element
        });
        console.log("\uD83D\uDCCF CSS MEASURED child ".concat(element.getAttribute('data-figma-name'), ":"), {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
        });
    });
    // Remove measurement class
    variantElement.classList.remove('measuring-positions');
    console.log('📏 CSS MEASUREMENT COMPLETE: Measured', positions.size, 'elements');
    return positions;
}
/**
 * Hide all variants except the animation copy
 */
function hideAllVariantsExceptCopy(allVariants, copy) {
    console.log('🙈 HIDING VARIANTS: Hiding all variants except copy');
    allVariants.forEach(function (variant) {
        safeElementOperation(variant, function (el) {
            el.style.display = 'none';
            el.classList.add('variant-hidden');
            el.classList.remove('variant-active');
        }, "hideAllVariantsExceptCopy - hide variant ".concat(variant.getAttribute('data-figma-id')));
    });
    // ✅ CRITICAL: Ensure copy stays visible
    safeElementOperation(copy, function (el) {
        el.style.display = 'flex';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
        el.classList.add('animation-copy');
    }, 'hideAllVariantsExceptCopy - ensure copy visibility');
}
/**
 * Animate using pre-measured positions
 */
function animateWithPreMeasuredPositions(copy, sourcePositions, targetPositions, transitionType, transitionDuration) {
    return __awaiter(this, void 0, void 0, function () {
        var elementsToAnimate, targetPositionsByName, mainSourceData, mainTargetData, sourcePositions_1, sourcePositions_1_1, _a, elementId, sourceData, targetData, sourceRect, targetRect, xDiff, yDiff, duration_1, easing_1;
        var e_1, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('🎬 ANIMATING WITH PRE-MEASURED POSITIONS');
                    console.log('🔍 ANIMATION DEBUG: Source positions map size:', sourcePositions.size);
                    console.log('🔍 ANIMATION DEBUG: Target positions map size:', targetPositions.size);
                    console.log('🔍 ANIMATION DEBUG: Copy element:', copy.getAttribute('data-figma-id'), copy.getAttribute('data-figma-name'));
                    elementsToAnimate = [];
                    targetPositionsByName = new Map();
                    targetPositions.forEach(function (targetData, targetElementId) {
                        var _a, _b;
                        // ✅ FILTER: Skip variant-level elements from lookup too
                        var isVariantElement = ((_a = targetData.element) === null || _a === void 0 ? void 0 : _a.getAttribute('data-figma-type')) === 'COMPONENT';
                        if (!isVariantElement) {
                            var targetElementName = (_b = targetData.element) === null || _b === void 0 ? void 0 : _b.getAttribute('data-figma-name');
                            if (targetElementName) {
                                targetPositionsByName.set(targetElementName, targetData);
                            }
                        }
                    });
                    console.log("\uD83D\uDD0D TARGET POSITIONS BY NAME: Created lookup for ".concat(targetPositionsByName.size, " named elements"));
                    // Compare source vs target positions for each element
                    sourcePositions.forEach(function (sourceData, elementId) {
                        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                        // ✅ CRITICAL FILTER: Skip variant-level elements - only animate child elements
                        var isVariantElement = ((_a = sourceData.element) === null || _a === void 0 ? void 0 : _a.getAttribute('data-figma-type')) === 'COMPONENT';
                        if (isVariantElement) {
                            console.log("\u23ED\uFE0F SKIPPING VARIANT-LEVEL ELEMENT: ".concat(elementId, " (").concat((_b = sourceData.element) === null || _b === void 0 ? void 0 : _b.getAttribute('data-figma-name'), ") - variant containers should not be animated"));
                            return; // Skip variant-level elements entirely
                        }
                        // First try to match by ID (for same-variant elements)
                        var targetData = targetPositions.get(elementId);
                        // ✅ CRITICAL FIX: If no ID match, try matching by name (for cross-variant elements)
                        if (!targetData) {
                            var sourceElementName = (_c = sourceData.element) === null || _c === void 0 ? void 0 : _c.getAttribute('data-figma-name');
                            if (sourceElementName) {
                                targetData = targetPositionsByName.get(sourceElementName);
                                if (targetData) {
                                    console.log("\uD83C\uDFAF CROSS-VARIANT MATCH: ".concat(sourceElementName, " (").concat(elementId, " -> ").concat((_d = targetData.element) === null || _d === void 0 ? void 0 : _d.getAttribute('data-figma-id'), ")"));
                                }
                            }
                        }
                        // ✅ CRITICAL DEBUG: Special logging for Frame 1232
                        if (elementId.includes('Frame 1232') || ((_e = sourceData.element) === null || _e === void 0 ? void 0 : _e.getAttribute('data-figma-name')) === 'Frame 1232') {
                            console.log("\uD83D\uDD0D FRAME 1232 DETECTED:", {
                                elementId: elementId,
                                elementName: (_f = sourceData.element) === null || _f === void 0 ? void 0 : _f.getAttribute('data-figma-name'),
                                hasTargetData: !!targetData,
                                sourceRect: sourceData.rect,
                                targetRect: targetData === null || targetData === void 0 ? void 0 : targetData.rect,
                                targetElementId: (_g = targetData === null || targetData === void 0 ? void 0 : targetData.element) === null || _g === void 0 ? void 0 : _g.getAttribute('data-figma-id')
                            });
                        }
                        if (targetData) {
                            var sourceRect = sourceData.rect;
                            var targetRect = targetData.rect;
                            // Calculate position differences
                            var xDiff = targetRect.left - sourceRect.left;
                            var yDiff = targetRect.top - sourceRect.top;
                            console.log("\uD83D\uDCCF Element ".concat(elementId, " position difference:"), {
                                name: (_h = sourceData.element) === null || _h === void 0 ? void 0 : _h.getAttribute('data-figma-name'),
                                xDiff: xDiff,
                                yDiff: yDiff,
                                sourceRect: { left: sourceRect.left, top: sourceRect.top, width: sourceRect.width, height: sourceRect.height },
                                targetRect: { left: targetRect.left, top: targetRect.top, width: targetRect.width, height: targetRect.height }
                            });
                            // ✅ CRITICAL DEBUG: Log whether this element has significant differences
                            var hasSignificantDiff = Math.abs(xDiff) > 1 || Math.abs(yDiff) > 1;
                            console.log("\uD83D\uDD0D SIGNIFICANT DIFF CHECK for ".concat(elementId, ":"), {
                                xDiff: xDiff,
                                yDiff: yDiff,
                                absXDiff: Math.abs(xDiff),
                                absYDiff: Math.abs(yDiff),
                                hasSignificantDiff: hasSignificantDiff
                            });
                            // Only animate if there's a significant difference
                            if (Math.abs(xDiff) > 1 || Math.abs(yDiff) > 1) {
                                console.log("\uD83C\uDFAF PROCESSING ELEMENT FOR ANIMATION: ".concat(elementId, " with significant difference"));
                                // ✅ CRITICAL FIX: Enhanced element matching with multiple fallback strategies
                                var elementName = (_j = sourceData.element) === null || _j === void 0 ? void 0 : _j.getAttribute('data-figma-name');
                                // ✅ CRITICAL DEBUG: Special logging for Frame 1232
                                if (elementId.includes('Frame 1232') || elementName === 'Frame 1232') {
                                    console.log("\uD83D\uDD0D FRAME 1232 ANIMATION MATCHING:", {
                                        elementId: elementId,
                                        elementName: elementName,
                                        xDiff: xDiff,
                                        yDiff: yDiff,
                                        copyInnerHTML: copy.innerHTML.substring(0, 500)
                                    });
                                    // Log all elements in the copy to see if Frame 1232 exists
                                    var allCopyElements = Array.from(copy.querySelectorAll('[data-figma-id]'));
                                    console.log("\uD83D\uDD0D ALL COPY ELEMENTS:", allCopyElements.map(function (el) { return ({
                                        id: el.getAttribute('data-figma-id'),
                                        name: el.getAttribute('data-figma-name')
                                    }); }));
                                }
                                console.log("\uD83D\uDD0D ELEMENT MATCHING START for ".concat(elementId, ":"), {
                                    elementId: elementId,
                                    elementName: elementName,
                                    copyId: copy.getAttribute('data-figma-id'),
                                    copyName: copy.getAttribute('data-figma-name')
                                });
                                // ✅ CRITICAL FIX: For cross-variant elements, prioritize name matching over ID matching
                                var copyElement = null;
                                // Try by name first (works for cross-variant elements)
                                if (elementName) {
                                    copyElement = copy.querySelector("[data-figma-name=\"".concat(elementName, "\"]"));
                                    console.log("\uD83D\uDD0D MATCH ATTEMPT 1 (by name): ".concat(elementName, " -> ").concat(!!copyElement));
                                }
                                // Fallback: Try by ID (for same-variant elements)
                                if (!copyElement) {
                                    copyElement = copy.querySelector("[data-figma-id=\"".concat(elementId, "\"]"));
                                    console.log("\uD83D\uDD0D MATCH ATTEMPT 2 (by ID): ".concat(elementId, " -> ").concat(!!copyElement));
                                }
                                if (!copyElement) {
                                    // Fallback 2: Try with -copy suffix (in case createElementCopy modifies IDs)
                                    copyElement = copy.querySelector("[data-figma-id=\"".concat(elementId, "-copy\"]"));
                                    console.log("\uD83D\uDD0D MATCH ATTEMPT 3 (by copy ID): ".concat(elementId, "-copy -> ").concat(!!copyElement));
                                }
                                if (!copyElement) {
                                    // Fallback 3: If this is the main variant, animate the copy itself
                                    var copyMainId = copy.getAttribute('data-figma-id');
                                    console.log("\uD83D\uDD0D MATCH ATTEMPT 4 (main variant check):", {
                                        copyMainId: copyMainId,
                                        elementId: elementId,
                                        isMainVariant: copyMainId && (elementId === copyMainId.replace('-copy', '') || elementId + '-copy' === copyMainId)
                                    });
                                    if (copyMainId && (elementId === copyMainId.replace('-copy', '') || elementId + '-copy' === copyMainId)) {
                                        copyElement = copy;
                                        console.log("\uD83C\uDFAF MAIN ELEMENT MATCH: Using copy itself for main variant ".concat(elementId));
                                    }
                                }
                                if (!copyElement) {
                                    // Fallback 4: Try to find by index/position if IDs don't match
                                    var allSourceElements = Array.from(sourcePositions.keys());
                                    var sourceIndex = allSourceElements.indexOf(elementId);
                                    if (sourceIndex >= 0) {
                                        var allCopyElements = Array.from(copy.querySelectorAll('[data-figma-id]'));
                                        if (allCopyElements[sourceIndex]) {
                                            copyElement = allCopyElements[sourceIndex];
                                            console.log("\uD83C\uDFAF INDEX MATCH: Found element by position ".concat(sourceIndex, " for ").concat(elementId));
                                        }
                                    }
                                }
                                // 🔍 DEBUG: Log element matching results
                                console.log("\uD83D\uDD0D ELEMENT MATCHING DEBUG for ".concat(elementId, ":"), {
                                    elementId: elementId,
                                    elementName: elementName,
                                    foundById: !!copy.querySelector("[data-figma-id=\"".concat(elementId, "\"]")),
                                    foundByName: !!copy.querySelector("[data-figma-name=\"".concat(elementName, "\"]")),
                                    foundByCopyId: !!copy.querySelector("[data-figma-id=\"".concat(elementId, "-copy\"]")),
                                    finalMatch: !!copyElement,
                                    copyMainId: copy.getAttribute('data-figma-id'),
                                    allCopyIds: Array.from(copy.querySelectorAll('[data-figma-id]')).map(function (el) { return el.getAttribute('data-figma-id'); }).slice(0, 5)
                                });
                                console.log("\uD83D\uDD0D FINAL MATCH RESULT for ".concat(elementId, ":"), {
                                    copyElement: !!copyElement,
                                    copyElementId: copyElement === null || copyElement === void 0 ? void 0 : copyElement.getAttribute('data-figma-id'),
                                    copyElementName: copyElement === null || copyElement === void 0 ? void 0 : copyElement.getAttribute('data-figma-name')
                                });
                                if (copyElement) {
                                    elementsToAnimate.push({
                                        element: copyElement,
                                        xDiff: xDiff,
                                        yDiff: yDiff
                                    });
                                    console.log("\u2705 ELEMENT MATCHED: ".concat(elementName || elementId, " will be animated with transform(").concat(xDiff, "px, ").concat(yDiff, "px)"));
                                }
                                else {
                                    console.warn("\u274C ELEMENT MATCHING FAILED: Could not find copy element for ".concat(elementId, " (").concat(elementName, ")"));
                                    // 🔍 EMERGENCY DEBUG: Log copy structure for analysis
                                    console.log('🔍 COPY STRUCTURE DEBUG:', {
                                        copyHTML: copy.innerHTML.substring(0, 300),
                                        copyOuterHTML: copy.outerHTML.substring(0, 200)
                                    });
                                }
                            }
                            else {
                                console.log("\u23ED\uFE0F SKIPPING ELEMENT: ".concat(elementId, " - no significant position difference (xDiff: ").concat(xDiff, ", yDiff: ").concat(yDiff, ")"));
                            }
                        }
                        else {
                            console.log("\u23ED\uFE0F SKIPPING ELEMENT: ".concat(elementId, " - no target data found"));
                        }
                    });
                    console.log("\uD83D\uDD0D ANIMATION SUMMARY: Found ".concat(elementsToAnimate.length, " elements to animate"));
                    // ✅ BACKUP STRATEGY: If no child elements were matched, try animating the copy itself based on variant-level differences
                    if (elementsToAnimate.length === 0) {
                        console.log('🔄 NO CHILD ELEMENTS MATCHED: Checking if main variant has position changes');
                        mainSourceData = null;
                        mainTargetData = null;
                        try {
                            // Use for...of loop instead of forEach to allow break
                            for (sourcePositions_1 = __values(sourcePositions), sourcePositions_1_1 = sourcePositions_1.next(); !sourcePositions_1_1.done; sourcePositions_1_1 = sourcePositions_1.next()) {
                                _a = __read(sourcePositions_1_1.value, 2), elementId = _a[0], sourceData = _a[1];
                                targetData = targetPositions.get(elementId);
                                if (targetData && sourceData.element && targetData.element) {
                                    sourceRect = sourceData.rect;
                                    targetRect = targetData.rect;
                                    xDiff = targetRect.left - sourceRect.left;
                                    yDiff = targetRect.top - sourceRect.top;
                                    // If this is a significant position change and we haven't found the main variant yet
                                    if (Math.abs(xDiff) > 1 || Math.abs(yDiff) > 1) {
                                        if (!mainSourceData || sourceData.element.tagName === copy.tagName) {
                                            mainSourceData = sourceData;
                                            mainTargetData = targetData;
                                            console.log("\uD83C\uDFAF MAIN VARIANT ANIMATION: Found position change ".concat(xDiff, "px, ").concat(yDiff, "px for main variant"));
                                            elementsToAnimate.push({
                                                element: copy,
                                                xDiff: xDiff,
                                                yDiff: yDiff
                                            });
                                            break; // Only animate the main element once
                                        }
                                    }
                                }
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (sourcePositions_1_1 && !sourcePositions_1_1.done && (_b = sourcePositions_1.return)) _b.call(sourcePositions_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                    }
                    if (!(elementsToAnimate.length > 0)) return [3 /*break*/, 2];
                    console.log("\uD83C\uDFAC ANIMATING ".concat(elementsToAnimate.length, " elements with actual position changes"));
                    duration_1 = transitionDuration || 0.5;
                    easing_1 = getEasingFunction(transitionType);
                    elementsToAnimate.forEach(function (_a) {
                        var element = _a.element, xDiff = _a.xDiff, yDiff = _a.yDiff;
                        element.style.transition = "transform ".concat(duration_1, "s ").concat(easing_1);
                        element.style.transform = "translate(".concat(xDiff, "px, ").concat(yDiff, "px)");
                        console.log("\uD83C\uDFAC Applied transform to ".concat(element.getAttribute('data-figma-name'), ": translate(").concat(xDiff, "px, ").concat(yDiff, "px)"));
                    });
                    // Wait for animation to complete
                    return [4 /*yield*/, new Promise(function (resolve) {
                            setTimeout(resolve, duration_1 * 1000);
                        })];
                case 1:
                    // Wait for animation to complete
                    _c.sent();
                    console.log('✅ ANIMATION COMPLETED: All transforms applied successfully');
                    return [3 /*break*/, 3];
                case 2:
                    console.log('🔄 NO POSITION CHANGES: All elements have same positions - instant switch');
                    _c.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get easing function for transition type
 */
function getEasingFunction(transitionType) {
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
 * FIX 3: Ensure copy visibility is properly managed
 * Make sure only the copy is visible during animation, not source or target
 */
function showOnlyCopyDuringAnimation(sourceCopy, sourceElement, targetElement, allVariants) {
    console.log('🎭 ANIMATION VISIBILITY: Showing only copy during animation');
    // Hide source element with safe operations
    safeElementOperation(sourceElement, function (el) {
        el.style.display = 'none';
        el.classList.add('variant-hidden', 'animation-source-hidden');
        el.classList.remove('variant-active');
    }, 'showOnlyCopyDuringAnimation - hide source element');
    // Hide target element with safe operations
    safeElementOperation(targetElement, function (el) {
        el.style.display = 'none';
        el.classList.add('variant-hidden', 'animation-target-hidden');
        el.classList.remove('variant-active');
    }, 'showOnlyCopyDuringAnimation - hide target element');
    // Hide all other variants
    allVariants.forEach(function (variant) {
        if (variant !== sourceElement && variant !== targetElement) {
            safeElementOperation(variant, function (el) {
                el.style.display = 'none';
                el.classList.add('variant-hidden');
                el.classList.remove('variant-active');
            }, "showOnlyCopyDuringAnimation - hide variant ".concat(variant.getAttribute('data-figma-id')));
        }
    });
    // Show only the copy with safe operations
    if (sourceCopy) {
        safeElementOperation(sourceCopy, function (el) {
            el.style.display = 'flex';
            el.classList.add('animation-copy');
            // Don't add variant classes to copy - it's a temporary animation element
        }, 'showOnlyCopyDuringAnimation - show copy');
    }
}
/**
 * FIX 4: Clean animation completion
 * When animation finishes, show only target
 */
function completeAnimationAndShowTarget(sourceCopy, sourceElement, targetElement, allVariants) {
    console.log('✅ ANIMATION COMPLETION: Showing only target after animation');
    // Remove copy with safe operations
    if (sourceCopy) {
        safeElementOperation(sourceCopy, function (el) {
            if (el.parentElement) {
                el.remove();
            }
        }, 'completeAnimationAndShowTarget - remove copy');
    }
    // Keep source hidden with safe operations
    safeElementOperation(sourceElement, function (el) {
        el.style.display = 'none';
        el.classList.add('variant-hidden');
        el.classList.remove('variant-active', 'animation-source-hidden');
    }, 'completeAnimationAndShowTarget - keep source hidden');
    // Show only target with safe operations
    safeElementOperation(targetElement, function (el) {
        el.style.display = 'flex';
        el.classList.add('variant-active');
        el.classList.remove('variant-hidden', 'animation-target-hidden');
    }, 'completeAnimationAndShowTarget - show target');
    // Ensure all other variants stay hidden
    allVariants.forEach(function (variant) {
        if (variant !== targetElement) {
            safeElementOperation(variant, function (el) {
                el.style.display = 'none';
                el.classList.add('variant-hidden');
                el.classList.remove('variant-active');
            }, "completeAnimationAndShowTarget - hide variant ".concat(variant.getAttribute('data-figma-id')));
        }
    });
}
/**
 * Create a copy of a source element for animation
 */
function createElementCopy(sourceElement) {
    var _a;
    console.log('DEBUG: createElementCopy function called');
    console.log('DEBUG: Creating element copy for:', sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id'));
    var copy = sourceElement.cloneNode(true);
    copy.setAttribute('data-figma-id', sourceElement.getAttribute('data-figma-id') + '-copy');
    copy.setAttribute('data-is-animation-copy', 'true');
    // Make an exact copy - don't manipulate positions
    console.log('DEBUG: Making exact copy of source variant');
    // Get source elements for copy creation (no detailed logging)
    var sourceElements = sourceElement.querySelectorAll('[data-figma-id]');
    // The copy is already an exact clone, no position manipulation needed
    // Position the copy absolutely over the source element
    var sourceRect = sourceElement.getBoundingClientRect();
    var parentRect = ((_a = sourceElement.parentElement) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect()) || { left: 0, top: 0 };
    copy.style.position = 'absolute';
    copy.style.top = (sourceRect.top - parentRect.top) + 'px';
    copy.style.left = (sourceRect.left - parentRect.left) + 'px';
    copy.style.transform = 'none';
    copy.style.margin = '0';
    copy.style.padding = '0';
    // Set high z-index
    var allElements = document.querySelectorAll('*');
    var maxZIndex = 0;
    allElements.forEach(function (el) {
        var zIndex = parseInt(window.getComputedStyle(el).zIndex) || 0;
        if (zIndex > maxZIndex)
            maxZIndex = zIndex;
    });
    var copyZIndex = maxZIndex + 1000;
    copy.style.zIndex = copyZIndex.toString();
    copy.style.pointerEvents = 'none';
    copy.style.transform = 'translateZ(0)';
    copy.style.willChange = 'transform, left, top';
    // Preserve original overflow from source element
    var sourceComputedStyle = window.getComputedStyle(sourceElement);
    copy.style.overflow = sourceComputedStyle.overflow;
    // Ensure the copy and all its children are fully visible
    copy.style.opacity = '1';
    copy.style.visibility = 'visible';
    copy.style.display = 'flex';
    // Ensure all nested elements in the copy are also visible, but preserve their original overflow
    var copyChildren = copy.querySelectorAll('*');
    copyChildren.forEach(function (child) {
        child.style.opacity = '1';
        child.style.visibility = 'visible';
        // Don't override overflow - preserve the original value from the clone
        if (child.style.display === 'none') {
            child.style.display = 'flex';
        }
    });
    // Ensure all nodes in the copy are visible (no detailed logging)
    console.log('DEBUG: Copy creation completed');
    return copy;
}
/**
 * Update copy content to match destination
 */
function updateCopyContentToMatchDestination(copy, destination) {
    console.log('DEBUG: Updating copy content to match destination');
    // Get all elements in both copy and destination
    var copyElements = copy.querySelectorAll('[data-figma-id]');
    var destinationElements = destination.querySelectorAll('[data-figma-id]');
    // Create a map of destination elements by name
    var destinationElementMap = new Map();
    destinationElements.forEach(function (element) {
        var name = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
        if (name) {
            destinationElementMap.set(name, element);
        }
    });
    // Update each copy element's content to match destination
    copyElements.forEach(function (copyElement) {
        var copyElementName = copyElement.getAttribute('data-figma-name') || copyElement.getAttribute('data-figma-id');
        var destinationElement = destinationElementMap.get(copyElementName);
        if (destinationElement) {
            // Update text content
            if (destinationElement.textContent !== copyElement.textContent) {
                copyElement.textContent = destinationElement.textContent;
            }
            // Update innerHTML for more complex content, but preserve positioning
            if (destinationElement.innerHTML !== copyElement.innerHTML) {
                // CRITICAL FIX: Preserve the positioning of ALL nested elements before updating content
                var allNestedElements = copyElement.querySelectorAll('[data-figma-id]');
                var originalPositions_1 = new Map();
                allNestedElements.forEach(function (nestedElement) {
                    var nestedElementName = nestedElement.getAttribute('data-figma-name') || nestedElement.getAttribute('data-figma-id');
                    var computedStyle = window.getComputedStyle(nestedElement);
                    originalPositions_1.set(nestedElementName, {
                        position: computedStyle.position,
                        left: computedStyle.left,
                        top: computedStyle.top,
                        transform: computedStyle.transform
                    });
                });
                // Also preserve the copy element itself
                var copyComputedStyle = window.getComputedStyle(copyElement);
                originalPositions_1.set(copyElementName, {
                    position: copyComputedStyle.position,
                    left: copyComputedStyle.left,
                    top: copyComputedStyle.top,
                    transform: copyComputedStyle.transform
                });
                // Update the innerHTML
                copyElement.innerHTML = destinationElement.innerHTML;
                // CRITICAL FIX: Restore the positioning of ALL elements after content update
                originalPositions_1.forEach(function (positionData, elementName) {
                    var elementToRestore = elementName === copyElementName ?
                        copyElement :
                        copyElement.querySelector('[data-figma-name="' + elementName + '"]') ||
                            copyElement.querySelector('[data-figma-id="' + elementName + '"]');
                    if (elementToRestore) {
                        elementToRestore.style.position = positionData.position;
                        elementToRestore.style.left = positionData.left;
                        elementToRestore.style.top = positionData.top;
                        elementToRestore.style.transform = positionData.transform;
                    }
                });
            }
            // Update specific attributes that might contain content
            var contentAttributes = ['data-content', 'data-text', 'title', 'alt'];
            contentAttributes.forEach(function (attr) {
                var destValue = destinationElement.getAttribute(attr);
                var copyValue = copyElement.getAttribute(attr);
                if (destValue !== copyValue && destValue !== null) {
                    copyElement.setAttribute(attr, destValue);
                }
            });
        }
    });
    // Ensure all elements in the copy are visible after content update, but preserve overflow
    var allCopyElements = copy.querySelectorAll('*');
    allCopyElements.forEach(function (element) {
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        // Don't override overflow - preserve the original value from the clone
        if (element.style.display === 'none') {
            element.style.display = 'flex';
        }
    });
}
/**
 * Insert copy into DOM at the correct position
 */
function insertCopyIntoDOM(copy, sourceElement) {
    console.log('DEBUG: Inserting copy into DOM');
    // Insert the copy into the DOM
    var sourceParent = sourceElement.parentElement;
    if (sourceParent) {
        sourceParent.appendChild(copy);
        console.log('DEBUG: Copy inserted into DOM');
    }
    else {
        console.error('DEBUG: No parent element found for source element');
    }
    // Log the copy's position and visibility after insertion
    var copyRect = copy.getBoundingClientRect();
    var copyStyle = window.getComputedStyle(copy);
    console.log('DEBUG: Copy after insertion:');
    console.log('  position: ' + copyStyle.position);
    console.log('  top: ' + copyStyle.top);
    console.log('  left: ' + copyStyle.left);
    console.log('  z-index: ' + copyStyle.zIndex);
    console.log('  opacity: ' + copyStyle.opacity);
    console.log('  visibility: ' + copyStyle.visibility);
    console.log('  display: ' + copyStyle.display);
    console.log('  bounding rect: ' + copyRect);
}
/**
 * Remove copy from DOM
 */
function removeCopyFromDOM(copy) {
    console.log('DEBUG: Removing copy from DOM');
    if (copy.parentElement) {
        copy.parentElement.removeChild(copy);
        console.log('DEBUG: Copy removed from DOM');
    }
    else {
        console.log('DEBUG: Copy has no parent element to remove from');
    }
}
/**
 * Hide original source element and other variants
 */
function hideOriginalElements(sourceElement, allVariants) {
    console.log('DEBUG: Hiding original elements');
    // Hide the original source element
    sourceElement.style.opacity = '0';
    sourceElement.style.visibility = 'hidden';
    // Hide all other variants
    allVariants.forEach(function (variant) {
        if (variant !== sourceElement) {
            variant.style.opacity = '0';
            variant.style.visibility = 'hidden';
        }
    });
    console.log('DEBUG: Original elements hidden');
}
/**
 * Show destination variant
 */
function showDestinationVariant(destination, allVariants) {
    // Validate destination parameter
    if (!safeElementOperation(destination, function () { }, 'showDestinationVariant - destination validation')) {
        return;
    }
    console.log('DEBUG: Showing destination variant');
    // Hide the original source element permanently with safe operations
    allVariants.forEach(function (variant) {
        if (variant !== destination) {
            safeElementOperation(variant, function (el) {
                el.style.opacity = '0';
                el.style.visibility = 'hidden';
                el.classList.add('variant-hidden');
                el.classList.remove('variant-active');
            }, "hideOriginalVariant - ".concat(variant.getAttribute('data-figma-id')));
        }
    });
    // Show the destination variant with explicit styles and higher specificity
    console.log('DEBUG: SHOWING DESTINATION VARIANT:', {
        destinationId: destination.getAttribute('data-figma-id'),
        destinationName: destination.getAttribute('data-figma-name'),
        visibility: 'visible',
        opacity: '1',
        display: 'flex'
    });
    // Apply styles with !important to ensure they override any CSS rules - with safe operations
    safeElementOperation(destination, function (el) {
        el.style.setProperty('visibility', 'visible', 'important');
        el.style.setProperty('opacity', '1', 'important');
        el.style.setProperty('display', 'flex', 'important');
        el.classList.add('variant-active');
        el.classList.remove('variant-hidden');
    }, 'showDestinationVariant - apply visibility styles');
    // CRITICAL: Position the destination variant at exactly 0px top/left
    // This ensures the destination variant is at the correct baseline position for subsequent animations
    destination.style.setProperty('position', 'relative', 'important');
    destination.style.setProperty('top', '0px', 'important');
    destination.style.setProperty('left', '0px', 'important');
    destination.style.setProperty('transform', 'none', 'important');
    // CRITICAL: Also position the parent component set container at 0px top/left
    // This ensures the variant is positioned relative to 0px, not the original Figma position
    var parentComponentSet = destination.closest('[data-figma-type="COMPONENT_SET"]');
    if (parentComponentSet) {
        var htmlParentComponentSet = parentComponentSet;
        htmlParentComponentSet.style.setProperty('position', 'relative', 'important');
        htmlParentComponentSet.style.setProperty('top', '0px', 'important');
        htmlParentComponentSet.style.setProperty('left', '0px', 'important');
        htmlParentComponentSet.style.setProperty('transform', 'none', 'important');
        console.log('DEBUG: Positioned parent component set at 0px top/left:', parentComponentSet.getAttribute('data-figma-id'));
    }
    // CRITICAL: Also restore visibility of all nested components within the destination variant
    var nestedComponents = destination.querySelectorAll('[data-figma-id]');
    console.log('DEBUG: Restoring visibility for', nestedComponents.length, 'nested components');
    nestedComponents.forEach(function (component, index) {
        var componentId = component.getAttribute('data-figma-id');
        var componentName = component.getAttribute('data-figma-name');
        var htmlComponent = component;
        // Restore original visibility and opacity for nested components
        htmlComponent.style.setProperty('visibility', 'visible', 'important');
        htmlComponent.style.setProperty('opacity', '1', 'important');
        // CRITICAL: Position nested components at exactly 0px top/left
        // This ensures nested components are at the correct baseline position for subsequent animations
        htmlComponent.style.setProperty('position', 'relative', 'important');
        htmlComponent.style.setProperty('top', '0px', 'important');
        htmlComponent.style.setProperty('left', '0px', 'important');
        htmlComponent.style.setProperty('transform', 'none', 'important');
        // Don't override display property for nested components - let them keep their natural display
        // Only set display if it was explicitly hidden
        var computedStyle = window.getComputedStyle(component);
        if (computedStyle.display === 'none') {
            htmlComponent.style.setProperty('display', 'flex', 'important');
        }
        console.log('DEBUG: Restored component', index + 1, ':', {
            id: componentId,
            name: componentName,
            visibility: htmlComponent.style.visibility,
            opacity: htmlComponent.style.opacity,
            display: htmlComponent.style.display
        });
    });
    // Force a reflow to ensure styles are applied
    destination.offsetHeight;
    // Log the final computed styles to verify they were applied
    var computedStyle = window.getComputedStyle(destination);
    console.log('DEBUG: Destination variant final computed styles:', {
        destinationId: destination.getAttribute('data-figma-id'),
        destinationName: destination.getAttribute('data-figma-name'),
        visibility: computedStyle.visibility,
        opacity: computedStyle.opacity,
        display: computedStyle.display,
        position: computedStyle.position,
        top: computedStyle.top,
        left: computedStyle.left,
        transform: computedStyle.transform,
        inlineTop: destination.style.top,
        inlineLeft: destination.style.left
    });
    // CRITICAL: Also log the bounding rect to see the actual position
    var boundingRect = destination.getBoundingClientRect();
    console.log('DEBUG: Destination variant bounding rect:', {
        destinationId: destination.getAttribute('data-figma-id'),
        destinationName: destination.getAttribute('data-figma-name'),
        left: boundingRect.left,
        top: boundingRect.top,
        width: boundingRect.width,
        height: boundingRect.height
    });
    console.log('DEBUG: Destination variant and nested components shown');
}


/***/ }),

/***/ 821:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/**
 * New Modular Transition Handler
 *
 * This file orchestrates the modular animation system by importing functions
 * from the separate modules and providing the main entry point for the
 * animation system.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createModularSmartAnimateHandler = createModularSmartAnimateHandler;
exports.handleReaction = handleReaction;
exports.startTimeoutReactionsForNewlyActiveVariant = startTimeoutReactionsForNewlyActiveVariant;
exports.startTimeoutReactionsForNestedComponents = startTimeoutReactionsForNestedComponents;
exports.clearAllTimeoutReactions = clearAllTimeoutReactions;
var transition_manager_1 = __webpack_require__(775);
// Global timer tracking
var activeTimers = new Map();
/**
 * Clears all active timeout reactions
 */
function clearAllTimeoutReactions() {
    console.log('DEBUG: Clearing all timeout reactions');
    activeTimers.forEach(function (timeoutId, elementId) {
        clearTimeout(timeoutId);
        console.log('DEBUG: Cleared timeout for element:', elementId);
    });
    activeTimers.clear();
}
/**
 * Starts timeout reactions for nested components within a parent element
 */
function startTimeoutReactionsForNestedComponents(parentElement) {
    if (!parentElement)
        return;
    // Find all nested components with timeout reactions within the parent
    var nestedComponents = parentElement.querySelectorAll('[data-has-reactions="true"]');
    nestedComponents.forEach(function (element) {
        var elementId = element.getAttribute('data-figma-id');
        var elementName = element.getAttribute('data-figma-name');
        var computedStyle = window.getComputedStyle(element);
        // Only start timers for elements that are actually visible
        if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
            var trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');
            if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
                console.log('DEBUG: Starting timeout reaction for nested component:', elementId, 'name:', elementName);
                var timeoutId = setTimeout(function () {
                    activeTimers.delete(elementId);
                    var actionType = element.getAttribute('data-reaction-action-type');
                    var destinationId = element.getAttribute('data-reaction-destination');
                    var transitionType = element.getAttribute('data-reaction-transition-type');
                    var transitionDuration = element.getAttribute('data-reaction-transition-duration');
                    handleReaction(element, destinationId, transitionType, transitionDuration);
                }, (trigger.timeout || 0) * 1000);
                activeTimers.set(elementId, timeoutId);
            }
            else if (activeTimers.has(elementId)) {
                console.log('DEBUG: Skipping nested component', elementId, 'name:', elementName, '- timer already active');
            }
        }
        else {
            console.log('DEBUG: Skipping nested component', elementId, 'name:', elementName, '- not visible');
        }
    });
}
/**
 * Starts timeout reactions for a specific newly active variant
 */
function startTimeoutReactionsForNewlyActiveVariant(newlyActiveElement) {
    if (!newlyActiveElement)
        return;
    var elementId = newlyActiveElement.getAttribute('data-figma-id');
    var elementName = newlyActiveElement.getAttribute('data-figma-name');
    var parentComponent = newlyActiveElement.closest('[data-figma-type="COMPONENT_SET"]');
    var parentName = parentComponent ? parentComponent.getAttribute('data-figma-name') : 'none';
    console.log('DEBUG: Processing newly active variant:', elementId, 'name:', elementName, 'parent:', parentName);
    // Only start timers for variants that are actually visible (not hidden by CSS)
    var computedStyle = window.getComputedStyle(newlyActiveElement);
    if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {
        var trigger = JSON.parse(newlyActiveElement.getAttribute('data-reaction-trigger') || '{}');
        var actionType = newlyActiveElement.getAttribute('data-reaction-action-type');
        var destinationId_1 = newlyActiveElement.getAttribute('data-reaction-destination');
        var transitionType_1 = newlyActiveElement.getAttribute('data-reaction-transition-type');
        var transitionDuration_1 = newlyActiveElement.getAttribute('data-reaction-transition-duration');
        // Handle timeout reactions only for active variants that don't have an active timer
        if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {
            console.log('DEBUG: Starting timeout reaction for newly active variant:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'parent:', parentName);
            var timeoutId = setTimeout(function () {
                activeTimers.delete(elementId); // Clear the timer when it completes
                handleReaction(newlyActiveElement, destinationId_1, transitionType_1, transitionDuration_1);
            }, (trigger.timeout || 0) * 1000);
            activeTimers.set(elementId, timeoutId);
        }
        else if (activeTimers.has(elementId)) {
            console.log('DEBUG: Skipping newly active variant', elementId, 'name:', elementName, '- timer already active');
        }
        // CRITICAL FIX: Also start timeout reactions for any nested components within this newly active variant
        startTimeoutReactionsForNestedComponents(newlyActiveElement);
    }
    else {
        console.log('DEBUG: Skipping newly active variant', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');
    }
}
/**
 * Main reaction handler function
 */
function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {
    console.log('🎯 REACTION TRIGGERED:', {
        sourceId: sourceElement.getAttribute('data-figma-id'),
        sourceName: sourceElement.getAttribute('data-figma-name'),
        destinationId: destinationId,
        transitionType: transitionType,
        transitionDuration: transitionDuration
    });
    // Get current transition lock status
    var lockStatus = (0, transition_manager_1.getTransitionLockStatus)();
    // Prevent multiple simultaneous transitions
    if (lockStatus.isTransitionInProgress) {
        console.log('⚠️ TRANSITION ALREADY IN PROGRESS - skipping');
        return;
    }
    // Set transition lock
    (0, transition_manager_1.setTransitionLock)(true);
    // Safety timeout
    var safetyTimeout = setTimeout(function () {
        var currentLockStatus = (0, transition_manager_1.getTransitionLockStatus)();
        if (currentLockStatus.isTransitionInProgress) {
            console.log('WARNING: Transition lock stuck, forcing release');
            (0, transition_manager_1.clearTransitionLock)();
        }
    }, 10000); // Increased to 10 seconds
    if (destinationId) {
        var destination_1 = document.querySelector("[data-figma-id=\"".concat(destinationId, "\"]"));
        if (!destination_1) {
            console.error('Destination element not found:', destinationId);
            clearTimeout(safetyTimeout);
            (0, transition_manager_1.clearTransitionLock)();
            return;
        }
        // Check if this is a variant switch within a component set
        var sourceComponentSet = sourceElement.closest('[data-figma-type="COMPONENT_SET"]');
        var destinationComponentSet = destination_1.closest('[data-figma-type="COMPONENT_SET"]');
        if (sourceComponentSet && destinationComponentSet && sourceComponentSet === destinationComponentSet) {
            // This is a variant switch
            console.log('🔄 VARIANT SWITCH DETECTED:', {
                componentSetId: sourceComponentSet.getAttribute('data-figma-id'),
                componentSetName: sourceComponentSet.getAttribute('data-figma-name')
            });
            var componentSet = sourceComponentSet;
            var allVariants = Array.from(componentSet.children).filter(function (child) {
                return child.getAttribute('data-figma-type') === 'COMPONENT';
            });
            console.log('📊 VARIANT ANALYSIS:', {
                totalVariants: allVariants.length,
                variantIds: allVariants.map(function (v) { return v.getAttribute('data-figma-id'); }),
                variantNames: allVariants.map(function (v) { return v.getAttribute('data-figma-name'); })
            });
            // Check if transition type is null/undefined (instant transition) or a recognized animated type
            var isAnimated = transitionType === 'SMART_ANIMATE' ||
                transitionType === 'BOUNCY' ||
                transitionType === 'EASE_IN_AND_OUT' ||
                transitionType === 'EASE_IN_AND_OUT_BACK' ||
                transitionType === 'EASE_IN' ||
                transitionType === 'EASE_OUT' ||
                transitionType === 'LINEAR' ||
                transitionType === 'GENTLE';
            // Only use fallback values if we have a recognized animated transition type
            var effectiveTransitionType = isAnimated ? (transitionType || 'EASE_OUT') : transitionType;
            var effectiveTransitionDuration = isAnimated ? parseFloat(transitionDuration || '0.3') : parseFloat(transitionDuration || '0');
            if (isAnimated) {
                console.log('🎬 ANIMATED TRANSITION SELECTED:', {
                    transitionType: effectiveTransitionType,
                    transitionDuration: effectiveTransitionDuration
                });
                // Use the modular transition manager for animated variant switching
                (0, transition_manager_1.handleAnimatedVariantSwitch)(sourceElement, destination_1, allVariants, effectiveTransitionType, effectiveTransitionDuration)
                    .then(function () {
                    clearTimeout(safetyTimeout);
                    (0, transition_manager_1.clearTransitionLock)();
                })
                    .catch(function (error) {
                    console.error('Modular animation error:', error);
                    clearTimeout(safetyTimeout);
                    (0, transition_manager_1.clearTransitionLock)();
                });
            }
            else {
                console.log('⚡ INSTANT TRANSITION SELECTED:', {
                    transitionType: effectiveTransitionType,
                    reason: 'Not recognized as animated transition type'
                });
                (0, transition_manager_1.performInstantVariantSwitch)(allVariants, destination_1);
                clearTimeout(safetyTimeout);
                (0, transition_manager_1.clearTransitionLock)();
            }
        }
        else {
            // This is a regular transition (not variant switching)
            if (transitionType === 'DISSOLVE') {
                console.log('🎭 DISSOLVE TRANSITION SELECTED:', {
                    transitionType: transitionType,
                    transitionDuration: transitionDuration
                });
                // Hide source element
                sourceElement.style.opacity = '0';
                sourceElement.style.visibility = 'hidden';
                // Show destination after delay
                setTimeout(function () {
                    destination_1.classList.add('variant-active');
                    destination_1.classList.remove('variant-hidden');
                    destination_1.style.opacity = '1';
                    destination_1.style.visibility = 'visible';
                    startTimeoutReactionsForNewlyActiveVariant(destination_1);
                    startTimeoutReactionsForNestedComponents(destination_1);
                    clearTimeout(safetyTimeout);
                    (0, transition_manager_1.clearTransitionLock)();
                }, parseFloat(transitionDuration || '300'));
            }
            else {
                console.log('⚡ INSTANT TRANSITION SELECTED (non-variant):', {
                    transitionType: transitionType,
                    reason: 'Not a dissolve transition'
                });
                destination_1.classList.add('variant-active');
                destination_1.classList.remove('variant-hidden');
                destination_1.style.opacity = '1';
                destination_1.style.visibility = 'visible';
                startTimeoutReactionsForNewlyActiveVariant(destination_1);
                startTimeoutReactionsForNestedComponents(destination_1);
                clearTimeout(safetyTimeout);
                (0, transition_manager_1.clearTransitionLock)();
            }
        }
    }
    else {
        // Handle case where destinationId is null (final variant - no further transitions)
        clearTimeout(safetyTimeout);
        (0, transition_manager_1.clearTransitionLock)();
    }
}
/**
 * Creates the modular smart animate handler that returns the string literal for eval
 */
function createModularSmartAnimateHandler() {
    return "\n    // Global transition lock to prevent multiple simultaneous transitions\n    let isTransitionInProgress = false;\n    let currentTransitionPromise = null;\n    \n    // Global timer tracking\n    const activeTimers = new Map();\n    \n    // Access the modular functions from the window object\n    // These should be available after the browser entry point exposes them\n    const handleAnimatedVariantSwitch = window.handleAnimatedVariantSwitch;\n    const performInstantVariantSwitch = window.performInstantVariantSwitch;\n    const setTransitionLock = window.setTransitionLock;\n    const clearTransitionLock = window.clearTransitionLock;\n    const getTransitionLockStatus = window.getTransitionLockStatus;\n    \n    // Debug: Log what's available in eval context\n    console.log('DEBUG: Eval context function availability:', {\n      windowHandleAnimatedVariantSwitch: typeof window.handleAnimatedVariantSwitch,\n      windowPerformInstantVariantSwitch: typeof window.performInstantVariantSwitch,\n      modularAnimationSystem: typeof window.modularAnimationSystem,\n      handleAnimatedVariantSwitch: typeof handleAnimatedVariantSwitch,\n      performInstantVariantSwitch: typeof performInstantVariantSwitch\n    });\n    \n    // Clear all timeout reactions function\n    function clearAllTimeoutReactions() {\n      console.log('DEBUG: Clearing all timeout reactions');\n      activeTimers.forEach((timeoutId, elementId) => {\n        clearTimeout(timeoutId);\n        console.log('DEBUG: Cleared timeout for element:', elementId);\n      });\n      activeTimers.clear();\n    }\n    \n    // Start timeout reactions for nested components\n    function startTimeoutReactionsForNestedComponents(parentElement) {\n      if (!parentElement) return;\n      \n      const nestedComponents = parentElement.querySelectorAll('[data-has-reactions=\"true\"]');\n      \n      nestedComponents.forEach(element => {\n        const elementId = element.getAttribute('data-figma-id');\n        const elementName = element.getAttribute('data-figma-name');\n        const computedStyle = window.getComputedStyle(element);\n        \n        if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {\n          const trigger = JSON.parse(element.getAttribute('data-reaction-trigger') || '{}');\n          \n          if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {\n            console.log('DEBUG: Starting timeout reaction for nested component:', elementId, 'name:', elementName);\n            const timeoutId = setTimeout(() => {\n              activeTimers.delete(elementId);\n              const actionType = element.getAttribute('data-reaction-action-type');\n              const destinationId = element.getAttribute('data-reaction-destination');\n              const transitionType = element.getAttribute('data-reaction-transition-type');\n              const transitionDuration = element.getAttribute('data-reaction-transition-duration');\n              \n              handleReaction(element, destinationId, transitionType, transitionDuration);\n            }, (trigger.timeout || 0) * 1000);\n            activeTimers.set(elementId, timeoutId);\n          } else if (activeTimers.has(elementId)) {\n            console.log('DEBUG: Skipping nested component', elementId, 'name:', elementName, '- timer already active');\n          }\n        } else {\n          console.log('DEBUG: Skipping nested component', elementId, 'name:', elementName, '- not visible');\n        }\n      });\n    }\n    \n    // Start timeout reactions for newly active variant\n    function startTimeoutReactionsForNewlyActiveVariant(newlyActiveElement) {\n      if (!newlyActiveElement) return;\n      \n      const elementId = newlyActiveElement.getAttribute('data-figma-id');\n      const elementName = newlyActiveElement.getAttribute('data-figma-name');\n      const parentComponent = newlyActiveElement.closest('[data-figma-type=\"COMPONENT_SET\"]');\n      const parentName = parentComponent ? parentComponent.getAttribute('data-figma-name') : 'none';\n      \n      console.log('DEBUG: Processing newly active variant:', elementId, 'name:', elementName, 'parent:', parentName);\n      \n      const computedStyle = window.getComputedStyle(newlyActiveElement);\n      \n      if (computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden') {\n        const trigger = JSON.parse(newlyActiveElement.getAttribute('data-reaction-trigger') || '{}');\n        const actionType = newlyActiveElement.getAttribute('data-reaction-action-type');\n        const destinationId = newlyActiveElement.getAttribute('data-reaction-destination');\n        const transitionType = newlyActiveElement.getAttribute('data-reaction-transition-type');\n        const transitionDuration = newlyActiveElement.getAttribute('data-reaction-transition-duration');\n        \n        if (trigger.type === 'AFTER_TIMEOUT' && !activeTimers.has(elementId)) {\n          console.log('DEBUG: Starting timeout reaction for newly active variant:', elementId, 'name:', elementName, 'timeout:', trigger.timeout, 'parent:', parentName);\n          const timeoutId = setTimeout(() => {\n            activeTimers.delete(elementId);\n            handleReaction(newlyActiveElement, destinationId, transitionType, transitionDuration);\n          }, (trigger.timeout || 0) * 1000);\n          activeTimers.set(elementId, timeoutId);\n        } else if (activeTimers.has(elementId)) {\n          console.log('DEBUG: Skipping newly active variant', elementId, 'name:', elementName, '- timer already active');\n        }\n        \n        startTimeoutReactionsForNestedComponents(newlyActiveElement);\n      } else {\n        console.log('DEBUG: Skipping newly active variant', elementId, 'name:', elementName, '- not visible (display:', computedStyle.display, 'visibility:', computedStyle.visibility, ')');\n      }\n    }\n    \n    // Main reaction handler function\n    function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {\n      console.log('\uD83C\uDFAF REACTION TRIGGERED:', {\n        sourceId: sourceElement.getAttribute('data-figma-id'),\n        sourceName: sourceElement.getAttribute('data-figma-name'),\n        destinationId: destinationId,\n        transitionType: transitionType,\n        transitionDuration: transitionDuration\n      });\n      \n      // Prevent multiple simultaneous transitions\n      if (isTransitionInProgress) {\n        console.log('\u26A0\uFE0F TRANSITION ALREADY IN PROGRESS - skipping');\n        return;\n      }\n      \n      // Set transition lock\n      isTransitionInProgress = true;\n      \n      // Safety timeout\n      const safetyTimeout = setTimeout(() => {\n        if (isTransitionInProgress) {\n          console.log('WARNING: Transition lock stuck, forcing release');\n          isTransitionInProgress = false;\n          currentTransitionPromise = null;\n        }\n      }, 10000);\n      \n      if (destinationId) {\n        const destination = document.querySelector(`[data-figma-id=\"${destinationId}\"]`);\n        \n        if (!destination) {\n          console.error('Destination element not found:', destinationId);\n          clearTimeout(safetyTimeout);\n          isTransitionInProgress = false;\n          return;\n        }\n        \n        // Check if this is a variant switch within a component set\n        const sourceComponentSet = sourceElement.closest('[data-figma-type=\"COMPONENT_SET\"]');\n        const destinationComponentSet = destination.closest('[data-figma-type=\"COMPONENT_SET\"]');\n        \n        if (sourceComponentSet && destinationComponentSet && sourceComponentSet === destinationComponentSet) {\n          // This is a variant switch\n          console.log('\uD83D\uDD04 VARIANT SWITCH DETECTED:', {\n            componentSetId: sourceComponentSet.getAttribute('data-figma-id'),\n            componentSetName: sourceComponentSet.getAttribute('data-figma-name')\n          });\n          \n          const componentSet = sourceComponentSet;\n          const allVariants = Array.from(componentSet.children).filter(child => \n            child.getAttribute('data-figma-type') === 'COMPONENT'\n          );\n          \n          console.log('\uD83D\uDCCA VARIANT ANALYSIS:', {\n            totalVariants: allVariants.length,\n            variantIds: allVariants.map(v => v.getAttribute('data-figma-id')),\n            variantNames: allVariants.map(v => v.getAttribute('data-figma-name'))\n          });\n          \n          // Check if transition type is recognized as animated\n          const isAnimated = transitionType === 'SMART_ANIMATE' || \n                            transitionType === 'BOUNCY' || \n                            transitionType === 'EASE_IN_AND_OUT' || \n                            transitionType === 'EASE_IN_AND_OUT_BACK' || \n                            transitionType === 'EASE_IN' || \n                            transitionType === 'EASE_OUT' || \n                            transitionType === 'LINEAR' || \n                            transitionType === 'GENTLE';\n          \n          const effectiveTransitionType = isAnimated ? (transitionType || 'EASE_OUT') : transitionType;\n          const effectiveTransitionDuration = isAnimated ? parseFloat(transitionDuration || '0.3') : parseFloat(transitionDuration || '0');\n          \n          if (isAnimated) {\n            console.log('\uD83C\uDFAC ANIMATED TRANSITION SELECTED:', {\n              transitionType: effectiveTransitionType,\n              transitionDuration: effectiveTransitionDuration\n            });\n            \n            // Use the modular transition manager for animated variant switching\n            const animatedVariantSwitch = window.handleAnimatedVariantSwitch || \n                                        (window.modularAnimationSystem && window.modularAnimationSystem.handleAnimatedVariantSwitch);\n            \n            if (animatedVariantSwitch) {\n              currentTransitionPromise = animatedVariantSwitch(sourceElement, destination, allVariants, effectiveTransitionType, effectiveTransitionDuration)\n                .then(() => {\n                  clearTimeout(safetyTimeout);\n                  isTransitionInProgress = false;\n                  currentTransitionPromise = null;\n                })\n                .catch((error) => {\n                  console.error('Modular animation error:', error);\n                  clearTimeout(safetyTimeout);\n                  isTransitionInProgress = false;\n                  currentTransitionPromise = null;\n                });\n            } else {\n              console.error('handleAnimatedVariantSwitch not available in window or modularAnimationSystem');\n              clearTimeout(safetyTimeout);\n              isTransitionInProgress = false;\n            }\n          } else {\n            console.log('\u26A1 INSTANT TRANSITION SELECTED:', {\n              transitionType: effectiveTransitionType,\n              reason: 'Not recognized as animated transition type'\n            });\n            \n            const instantVariantSwitch = window.performInstantVariantSwitch || \n                                        (window.modularAnimationSystem && window.modularAnimationSystem.performInstantVariantSwitch);\n            \n            if (instantVariantSwitch) {\n              instantVariantSwitch(allVariants, destination);\n            } else {\n              console.error('performInstantVariantSwitch not available in window or modularAnimationSystem');\n            }\n            clearTimeout(safetyTimeout);\n            isTransitionInProgress = false;\n          }\n        } else {\n          // This is a regular transition (not variant switching)\n          if (transitionType === 'DISSOLVE') {\n            console.log('\uD83C\uDFAD DISSOLVE TRANSITION SELECTED:', {\n              transitionType: transitionType,\n              transitionDuration: transitionDuration\n            });\n            \n            // Hide source element\n            sourceElement.style.opacity = '0';\n            sourceElement.style.visibility = 'hidden';\n            \n            // Show destination after delay\n            setTimeout(() => {\n              destination.classList.add('variant-active');\n              destination.classList.remove('variant-hidden');\n              destination.style.opacity = '1';\n              destination.style.visibility = 'visible';\n              \n              startTimeoutReactionsForNewlyActiveVariant(destination);\n              startTimeoutReactionsForNestedComponents(destination);\n              \n              clearTimeout(safetyTimeout);\n              isTransitionInProgress = false;\n            }, parseFloat(transitionDuration || '300'));\n          } else {\n            console.log('\u26A1 INSTANT TRANSITION SELECTED (non-variant):', {\n              transitionType: transitionType,\n              reason: 'Not a dissolve transition'\n            });\n            \n            destination.classList.add('variant-active');\n            destination.classList.remove('variant-hidden');\n            destination.style.opacity = '1';\n            destination.style.visibility = 'visible';\n            \n            startTimeoutReactionsForNewlyActiveVariant(destination);\n            startTimeoutReactionsForNestedComponents(destination);\n            \n            clearTimeout(safetyTimeout);\n            isTransitionInProgress = false;\n          }\n        }\n      } else {\n        // Handle case where destinationId is null (final variant - no further transitions)\n        clearTimeout(safetyTimeout);\n        isTransitionInProgress = false;\n      }\n    }\n    \n    // Make functions globally available\n    window.handleReaction = handleReaction;\n    window.startTimeoutReactionsForNewlyActiveVariant = startTimeoutReactionsForNewlyActiveVariant;\n    window.startTimeoutReactionsForNestedComponents = startTimeoutReactionsForNestedComponents;\n    window.clearAllTimeoutReactions = clearAllTimeoutReactions;\n  ";
}


/***/ }),

/***/ 825:
/***/ ((__unused_webpack_module, exports) => {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.simpleAnimate = simpleAnimate;
exports.simpleVariantSwitch = simpleVariantSwitch;
exports.instantVariantSwitch = instantVariantSwitch;
exports.resetAnimationState = resetAnimationState;
exports.officialStyleAnimate = officialStyleAnimate;
exports.generateSimpleTransitionHandler = generateSimpleTransitionHandler;
/**
 * Helper function to find all elements within source and target variants that have animated property changes
 */
function findAnimatedElementsAndChanges(sourceVariant, targetVariant, options) {
    if (options === void 0) { options = {}; }
    var changes = [];
    var _a = options.animateColor, animateColor = _a === void 0 ? false : _a, _b = options.animateShadow, animateShadow = _b === void 0 ? false : _b, _c = options.animateSize, animateSize = _c === void 0 ? false : _c;
    console.log('🔍 FINDING ANIMATED ELEMENTS AND CHANGES');
    console.log('📋 Source variant:', sourceVariant.getAttribute('data-figma-id'));
    console.log('📋 Target variant:', targetVariant.getAttribute('data-figma-id'));
    // Get all elements with data-figma-id in both variants
    var sourceElements = sourceVariant.querySelectorAll('[data-figma-id]');
    var targetElements = targetVariant.querySelectorAll('[data-figma-id]');
    console.log('🔍 Found', sourceElements.length, 'elements in source variant');
    console.log('🔍 Found', targetElements.length, 'elements in target variant');
    // Create maps of target elements by their figma ID and name for lookup
    var targetElementMapById = new Map();
    var targetElementMapByName = new Map();
    targetElements.forEach(function (element) {
        var figmaId = element.getAttribute('data-figma-id');
        var figmaName = element.getAttribute('data-figma-name');
        if (figmaId) {
            targetElementMapById.set(figmaId, element);
        }
        if (figmaName) {
            targetElementMapByName.set(figmaName, element);
        }
    });
    // Check each source element for changes
    sourceElements.forEach(function (sourceElement) {
        var figmaId = sourceElement.getAttribute('data-figma-id');
        var figmaName = sourceElement.getAttribute('data-figma-name');
        if (!figmaId && !figmaName)
            return;
        // Try to find target element by ID first, then by name as fallback
        var targetElement = figmaId ? targetElementMapById.get(figmaId) : null;
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
        var sourceFigmaX = parseFloat(sourceElement.getAttribute('data-figma-x') || '0') || 0;
        var sourceFigmaY = parseFloat(sourceElement.getAttribute('data-figma-y') || '0') || 0;
        var targetFigmaX = parseFloat(targetElement.getAttribute('data-figma-x') || '0') || 0;
        var targetFigmaY = parseFloat(targetElement.getAttribute('data-figma-y') || '0') || 0;
        // Calculate the difference using Figma coordinates
        var deltaX = targetFigmaX - sourceFigmaX;
        var deltaY = targetFigmaY - sourceFigmaY;
        var hasPositionChange = Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1;
        // Initialize change object
        var change = {
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
            var sourceComputedStyle = window.getComputedStyle(sourceElement);
            var targetComputedStyle = window.getComputedStyle(targetElement);
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
            var sourceComputedStyle = window.getComputedStyle(sourceElement);
            var targetComputedStyle = window.getComputedStyle(targetElement);
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
            var sourceComputedStyle = window.getComputedStyle(sourceElement);
            var targetComputedStyle = window.getComputedStyle(targetElement);
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
            change.hasSizeChange = (change.sourceWidth !== change.targetWidth ||
                change.sourceHeight !== change.targetHeight ||
                change.sourceMinWidth !== change.targetMinWidth ||
                change.sourceMinHeight !== change.targetMinHeight ||
                change.sourceMaxWidth !== change.targetMaxWidth ||
                change.sourceMaxHeight !== change.targetMaxHeight);
        }
        // Only add to changes if there's actually something to animate
        var hasAnyChange = hasPositionChange ||
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
function simpleAnimate(change, options) {
    if (options === void 0) { options = {}; }
    return new Promise(function (resolve) {
        var _a = options.duration, duration = _a === void 0 ? 0.5 : _a, _b = options.easing, easing = _b === void 0 ? 'ease-in-out' : _b, onComplete = options.onComplete;
        var sourceElement = change.sourceElement, targetElement = change.targetElement;
        console.log('🎬 SIMPLE ANIMATION: Starting animation for element:', sourceElement.getAttribute('data-figma-id'));
        console.log('📊 Position delta:', { deltaX: change.deltaX, deltaY: change.deltaY });
        console.log('📊 Has position change:', change.hasPositionChange);
        console.log('📊 Has color change:', change.hasColorChange);
        console.log('📊 Has shadow change:', change.hasShadowChange);
        console.log('📊 Has size change:', change.hasSizeChange);
        // Use CSS animations instead of transitions for better simultaneous control
        var animationName = "simple-animation-".concat(Date.now(), "-").concat(Math.random());
        // Create the keyframes for simultaneous animation
        var keyframes = "\n      @keyframes ".concat(animationName, " {\n        0% {\n          transform: translate(0px, 0px);\n          ").concat(change.hasColorChange ? "background-color: ".concat(change.sourceColor, ";") : '', "\n          ").concat(change.hasBorderColorChange ? "border-color: ".concat(change.sourceBorderColor, ";") : '', "\n          ").concat(change.hasOpacityChange ? "opacity: ".concat(change.sourceOpacity, ";") : '', "\n          ").concat(change.hasShadowChange ? "box-shadow: ".concat(change.sourceShadow, ";") : '', "\n          ").concat(change.hasSizeChange ? "width: ".concat(change.sourceWidth, "; height: ").concat(change.sourceHeight, "; min-width: ").concat(change.sourceMinWidth, "; min-height: ").concat(change.sourceMinHeight, "; max-width: ").concat(change.sourceMaxWidth, "; max-height: ").concat(change.sourceMaxHeight, ";") : '', "\n        }\n        100% {\n          transform: translate(").concat(change.deltaX, "px, ").concat(change.deltaY, "px);\n          ").concat(change.hasColorChange ? "background-color: ".concat(change.targetColor, ";") : '', "\n          ").concat(change.hasBorderColorChange ? "border-color: ".concat(change.targetBorderColor, ";") : '', "\n          ").concat(change.hasOpacityChange ? "opacity: ".concat(change.targetOpacity, ";") : '', "\n          ").concat(change.hasShadowChange ? "box-shadow: ".concat(change.targetShadow, ";") : '', "\n          ").concat(change.hasSizeChange ? "width: ".concat(change.targetWidth, "; height: ").concat(change.targetHeight, "; min-width: ").concat(change.targetMinWidth, "; min-height: ").concat(change.targetMinHeight, "; max-width: ").concat(change.targetMaxWidth, "; max-height: ").concat(change.targetMaxHeight, ";") : '', "\n        }\n      }\n    ");
        console.log('🎬 Keyframes created:', keyframes);
        console.log('🎬 Expected final transform:', "translate(".concat(change.deltaX, "px, ").concat(change.deltaY, "px)"));
        // Add the keyframes to the document
        var style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
        // Disable any existing CSS transitions that might interfere
        sourceElement.style.transition = 'none';
        // Apply the animation
        sourceElement.style.animation = "".concat(animationName, " ").concat(duration, "s ").concat(easing, " forwards");
        // Debug: Check if animation is actually running
        setTimeout(function () {
            var computedStyle = window.getComputedStyle(sourceElement);
            console.log('🎬 Animation debug for element:', sourceElement.getAttribute('data-figma-id'));
            console.log('🎬 Computed animation:', computedStyle.animation);
            console.log('🎬 Computed transform:', computedStyle.transform);
        }, 100);
        // Clean up the style element after animation
        setTimeout(function () {
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        }, duration * 1000 + 100);
        // Listen for animation completion
        var onAnimationEnd = function (event) {
            if (event.animationName === animationName) {
                console.log('✅ SIMPLE ANIMATION: Animation completed for element:', sourceElement.getAttribute('data-figma-id'));
                // Log the final computed values
                var finalComputedStyle = window.getComputedStyle(sourceElement);
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
        setTimeout(function () {
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
function simpleVariantSwitch(sourceElement, targetElement, options) {
    if (options === void 0) { options = {}; }
    console.log('🔄 SIMPLE VARIANT SWITCH: Starting variant switch');
    // Find all animated elements and their changes
    var changes = findAnimatedElementsAndChanges(sourceElement, targetElement, options);
    if (changes.length === 0) {
        console.log('🔄 No changes detected, performing instant switch');
        // If no changes detected, just do an instant switch
        sourceElement.style.display = 'none';
        targetElement.style.display = 'flex';
        return Promise.resolve();
    }
    console.log('🔄 Found', changes.length, 'elements with changes to animate');
    // Animate all changes simultaneously
    var animationPromises = changes.map(function (change) {
        return simpleAnimate(change, options);
    });
    return Promise.all(animationPromises).then(function () {
        console.log('✅ All animations completed');
        // Hide source and show target after all animations complete
        sourceElement.style.display = 'none';
        targetElement.style.display = 'flex';
    });
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
    return new Promise(function (resolve) {
        console.log('🎬 OFFICIAL-STYLE ANIMATION: Starting with simple approach');
        // Keep source visible for animation, but hide target initially
        allVariants.forEach(function (variant) {
            if (variant === sourceElement) {
                variant.style.display = 'flex';
                variant.classList.add('variant-active');
                variant.classList.remove('variant-hidden');
            }
            else if (variant === targetElement) {
                // Keep target hidden but prepare it
                variant.style.display = 'none';
                variant.classList.add('variant-hidden');
                variant.classList.remove('variant-active');
            }
            else {
                variant.style.display = 'none';
                variant.classList.add('variant-hidden');
                variant.classList.remove('variant-active');
            }
        });
        // Use the simple animation approach with the new system
        var duration = parseFloat(transitionDuration.toString()) || 0.5;
        var easing = getEasingFromTransitionType(transitionType);
        // Find all animated elements and their changes
        var changes = findAnimatedElementsAndChanges(sourceElement, targetElement, {
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
        }
        else {
            console.log('🔄 Found', changes.length, 'elements with changes to animate');
            // Animate all changes simultaneously
            var animationPromises = changes.map(function (change) {
                return simpleAnimate(change, {
                    duration: duration,
                    easing: easing
                });
            });
            Promise.all(animationPromises).then(function () {
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
    return "\n    // Global transition lock to prevent multiple simultaneous transitions\n    let isTransitionInProgress = false;\n    \n    // Animation types\n    const AnimationType = {\n      SIMPLE: 'SIMPLE',\n      SIZE: 'SIZE', \n      TRANSFORM: 'TRANSFORM'\n    };\n    \n    // Translation conditions\n    const TranslationCondition = {\n      ABSOLUTE: 'ABSOLUTE',\n      RELATIVE_PADDING: 'RELATIVE_PADDING',\n      RELATIVE_ALIGNMENT: 'RELATIVE_ALIGNMENT'\n    };\n    \n\n    \n    /**\n     * Helper function to get easing function\n     */\n    function getEasingFunction(animationType) {\n      switch (animationType) {\n        case 'EASE_IN_AND_OUT_BACK':\n          return 'cubic-bezier(0.68, -0.6, 0.32, 1.6)';\n        case 'EASE_IN_AND_OUT':\n          return 'ease-in-out';\n        case 'EASE_IN':\n          return 'ease-in';\n        case 'EASE_OUT':\n          return 'ease-out';\n        case 'LINEAR':\n          return 'linear';\n        case 'BOUNCY':\n          return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';\n        case 'GENTLE':\n          return 'ease-in-out';\n        case 'SMART_ANIMATE':\n          return 'ease-in-out';\n        default:\n          return 'ease-out';\n      }\n    }\n    \n    /**\n     * Main reaction handler function - entry point for all reactions\n     */\n    function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {\n      console.log('\uD83C\uDFAF REACTION TRIGGERED:', {\n        sourceId: sourceElement.getAttribute('data-figma-id'),\n        sourceName: sourceElement.getAttribute('data-figma-name'),\n        destinationId: destinationId,\n        transitionType: transitionType,\n        transitionDuration: transitionDuration\n      });\n      \n      // Check if transition is already in progress\n      if (isTransitionInProgress) {\n        console.log('\u274C Transition already in progress, skipping reaction');\n        return;\n      }\n      \n      // Find the destination element\n      const destination = document.querySelector('[data-figma-id=\"' + destinationId + '\"]');\n      if (!destination) {\n        console.error('\u274C Destination element not found:', destinationId);\n        return;\n      }\n      \n      // Find all variants in the same component set\n      const componentSet = sourceElement.closest('[data-figma-type=\"COMPONENT_SET\"]');\n      if (!componentSet) {\n        console.error('\u274C Component set not found for source element');\n        return;\n      }\n      \n      const allVariants = Array.from(componentSet.children).filter(child => \n        child.getAttribute('data-figma-type') === 'COMPONENT'\n      );\n      \n      console.log('\uD83C\uDFAF Found', allVariants.length, 'variants in component set');\n      \n      // Determine if we should animate or perform instant switch\n      if (transitionType && transitionType !== 'INSTANT' && transitionDuration && parseFloat(transitionDuration) > 0) {\n        // Use simple animated variant switch\n        console.log('\uD83C\uDFAD Using simple animated variant switch');\n        handleSimpleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration);\n      } else {\n        // Use instant variant switch\n        console.log('\u26A1 Using instant variant switch');\n        performInstantVariantSwitch(allVariants, destination);\n      }\n    }\n    \n    /**\n     * Helper function to find all elements within source and target variants that have animated property changes\n     */\n    function findAnimatedElementsAndChanges(sourceVariant, targetVariant, options = {}) {\n      const changes = [];\n      const { animateColor = false, animateShadow = false, animateSize = false } = options;\n\n      console.log('\uD83D\uDD0D FINDING ANIMATED ELEMENTS AND CHANGES');\n      console.log('\uD83D\uDCCB Source variant:', sourceVariant.getAttribute('data-figma-id'));\n      console.log('\uD83D\uDCCB Target variant:', targetVariant.getAttribute('data-figma-id'));\n\n      // Get all elements with data-figma-id in both variants\n      const sourceElements = sourceVariant.querySelectorAll('[data-figma-id]');\n      const targetElements = targetVariant.querySelectorAll('[data-figma-id]');\n\n      console.log('\uD83D\uDD0D Found', sourceElements.length, 'elements in source variant');\n      console.log('\uD83D\uDD0D Found', targetElements.length, 'elements in target variant');\n\n      // Create maps of target elements by their figma ID and name for lookup\n      const targetElementMapById = new Map();\n      const targetElementMapByName = new Map();\n      targetElements.forEach(element => {\n        const figmaId = element.getAttribute('data-figma-id');\n        const figmaName = element.getAttribute('data-figma-name');\n        if (figmaId) {\n          targetElementMapById.set(figmaId, element);\n        }\n        if (figmaName) {\n          targetElementMapByName.set(figmaName, element);\n        }\n      });\n\n      // Check each source element for changes\n      sourceElements.forEach(sourceElement => {\n        const figmaId = sourceElement.getAttribute('data-figma-id');\n        const figmaName = sourceElement.getAttribute('data-figma-name');\n        if (!figmaId && !figmaName) return;\n\n        // Try to find target element by ID first, then by name as fallback\n        let targetElement = figmaId ? targetElementMapById.get(figmaId) : null;\n        if (!targetElement && figmaName) {\n          targetElement = targetElementMapByName.get(figmaName);\n          if (targetElement) {\n            console.log('\uD83D\uDD0D Found target element by name instead of ID:', figmaName);\n          }\n        }\n        \n        if (!targetElement) {\n          console.log('\uD83D\uDD0D No matching target element found for:', figmaId || figmaName);\n          return;\n        }\n\n        // Get positions from Figma coordinates stored in data attributes\n        const sourceFigmaX = parseFloat(sourceElement.getAttribute('data-figma-x') || '0') || 0;\n        const sourceFigmaY = parseFloat(sourceElement.getAttribute('data-figma-y') || '0') || 0;\n        const targetFigmaX = parseFloat(targetElement.getAttribute('data-figma-x') || '0') || 0;\n        const targetFigmaY = parseFloat(targetElement.getAttribute('data-figma-y') || '0') || 0;\n        \n        // Calculate the difference using Figma coordinates\n        const deltaX = targetFigmaX - sourceFigmaX;\n        const deltaY = targetFigmaY - sourceFigmaY;\n        const hasPositionChange = Math.abs(deltaX) > 0.1 || Math.abs(deltaY) > 0.1;\n\n        // Initialize change object\n        const change = {\n          sourceElement: sourceElement,\n          targetElement: targetElement,\n          deltaX: deltaX,\n          deltaY: deltaY,\n          hasPositionChange: hasPositionChange,\n          hasColorChange: false,\n          hasBorderColorChange: false,\n          hasOpacityChange: false,\n          hasShadowChange: false,\n          hasSizeChange: false,\n          sourceColor: '',\n          targetColor: '',\n          sourceBorderColor: '',\n          targetBorderColor: '',\n          sourceOpacity: '',\n          targetOpacity: '',\n          sourceShadow: '',\n          targetShadow: '',\n          sourceWidth: '',\n          targetWidth: '',\n          sourceHeight: '',\n          targetHeight: '',\n          sourceMinWidth: '',\n          targetMinWidth: '',\n          sourceMinHeight: '',\n          targetMinHeight: '',\n          sourceMaxWidth: '',\n          targetMaxWidth: '',\n          sourceMaxHeight: '',\n          targetMaxHeight: ''\n        };\n\n        // Check for color changes\n        if (animateColor) {\n          const sourceComputedStyle = window.getComputedStyle(sourceElement);\n          const targetComputedStyle = window.getComputedStyle(targetElement);\n          \n          change.sourceColor = sourceComputedStyle.backgroundColor;\n          change.targetColor = targetComputedStyle.backgroundColor;\n          change.sourceBorderColor = sourceComputedStyle.borderColor;\n          change.targetBorderColor = targetComputedStyle.borderColor;\n          change.sourceOpacity = sourceComputedStyle.opacity;\n          change.targetOpacity = targetComputedStyle.opacity;\n          \n          // Ensure we have valid color values\n          if (!change.sourceColor || change.sourceColor === 'rgba(0, 0, 0, 0)' || change.sourceColor === 'transparent') {\n            change.sourceColor = 'rgb(255, 107, 107)';\n          }\n          if (!change.targetColor || change.targetColor === 'rgba(0, 0, 0, 0)' || change.targetColor === 'transparent') {\n            change.targetColor = 'rgb(243, 156, 18)';\n          }\n          \n          change.hasColorChange = change.sourceColor !== change.targetColor;\n          change.hasBorderColorChange = change.sourceBorderColor !== change.targetBorderColor;\n          change.hasOpacityChange = change.sourceOpacity !== change.targetOpacity;\n        }\n\n        // Check for shadow changes\n        if (animateShadow) {\n          const sourceComputedStyle = window.getComputedStyle(sourceElement);\n          const targetComputedStyle = window.getComputedStyle(targetElement);\n          \n          change.sourceShadow = sourceComputedStyle.boxShadow;\n          change.targetShadow = targetComputedStyle.boxShadow;\n          \n          // Ensure we have valid shadow values\n          if (!change.sourceShadow || change.sourceShadow === 'none') {\n            change.sourceShadow = '0px 0px 0px 0px rgba(0, 0, 0, 0)';\n          }\n          if (!change.targetShadow || change.targetShadow === 'none') {\n            change.targetShadow = '0px 0px 0px 0px rgba(0, 0, 0, 0)';\n          }\n          \n          change.hasShadowChange = change.sourceShadow !== change.targetShadow;\n        }\n\n        // Check for size changes\n        if (animateSize) {\n          const sourceComputedStyle = window.getComputedStyle(sourceElement);\n          const targetComputedStyle = window.getComputedStyle(targetElement);\n          \n          change.sourceWidth = sourceComputedStyle.width;\n          change.targetWidth = targetComputedStyle.width;\n          change.sourceHeight = sourceComputedStyle.height;\n          change.targetHeight = targetComputedStyle.height;\n          change.sourceMinWidth = sourceComputedStyle.minWidth;\n          change.targetMinWidth = targetComputedStyle.minWidth;\n          change.sourceMinHeight = sourceComputedStyle.minHeight;\n          change.targetMinHeight = targetComputedStyle.minHeight;\n          change.sourceMaxWidth = sourceComputedStyle.maxWidth;\n          change.targetMaxWidth = targetComputedStyle.maxWidth;\n          change.sourceMaxHeight = sourceComputedStyle.maxHeight;\n          change.targetMaxHeight = targetComputedStyle.maxHeight;\n          \n          change.hasSizeChange = (\n            change.sourceWidth !== change.targetWidth ||\n            change.sourceHeight !== change.targetHeight ||\n            change.sourceMinWidth !== change.targetMinWidth ||\n            change.sourceMinHeight !== change.targetMinHeight ||\n            change.sourceMaxWidth !== change.targetMaxWidth ||\n            change.sourceMaxHeight !== change.targetMaxHeight\n          );\n        }\n\n        // Only add to changes if there's actually something to animate\n        const hasAnyChange = hasPositionChange || \n                            (animateColor && (change.hasColorChange || change.hasBorderColorChange || change.hasOpacityChange)) ||\n                            (animateShadow && change.hasShadowChange) ||\n                            (animateSize && change.hasSizeChange);\n\n        if (hasAnyChange) {\n          console.log('\uD83D\uDD0D Found changes for element:', figmaId, {\n            hasPositionChange: hasPositionChange,\n            hasColorChange: change.hasColorChange,\n            hasShadowChange: change.hasShadowChange,\n            hasSizeChange: change.hasSizeChange,\n            deltaX: deltaX,\n            deltaY: deltaY\n          });\n          changes.push(change);\n        }\n      });\n\n      console.log('\uD83D\uDD0D Total elements with changes:', changes.length);\n      return changes;\n    }\n\n    /**\n     * Simple animation function that animates a specific element based on detected changes\n     */\n    function simpleAnimate(change, options = {}) {\n      return new Promise((resolve) => {\n        const {\n          duration = 0.5,\n          easing = 'ease-in-out',\n          onComplete\n        } = options;\n\n        const { sourceElement, targetElement } = change;\n\n        console.log('\uD83C\uDFAC SIMPLE ANIMATION: Starting animation for element:', sourceElement.getAttribute('data-figma-id'));\n        console.log('\uD83D\uDCCA Position delta:', { deltaX: change.deltaX, deltaY: change.deltaY });\n        console.log('\uD83D\uDCCA Has position change:', change.hasPositionChange);\n        console.log('\uD83D\uDCCA Has color change:', change.hasColorChange);\n        console.log('\uD83D\uDCCA Has shadow change:', change.hasShadowChange);\n        console.log('\uD83D\uDCCA Has size change:', change.hasSizeChange);\n\n        // Use CSS animations instead of transitions\n        const animationName = 'simple-animation-' + Date.now() + '-' + Math.random();\n        \n        // Create the keyframes for simultaneous animation\n        const keyframes = `\n          @keyframes ${animationName} {\n            0% {\n              transform: translate(0px, 0px);\n              ${change.hasColorChange ? `background-color: ${change.sourceColor};` : ''}\n              ${change.hasBorderColorChange ? `border-color: ${change.sourceBorderColor};` : ''}\n              ${change.hasOpacityChange ? `opacity: ${change.sourceOpacity};` : ''}\n              ${change.hasShadowChange ? `box-shadow: ${change.sourceShadow};` : ''}\n              ${change.hasSizeChange ? `width: ${change.sourceWidth}; height: ${change.sourceHeight}; min-width: ${change.sourceMinWidth}; min-height: ${change.sourceMinHeight}; max-width: ${change.sourceMaxWidth}; max-height: ${change.sourceMaxHeight};` : ''}\n            }\n            100% {\n              transform: translate(${change.deltaX}px, ${change.deltaY}px);\n              ${change.hasColorChange ? `background-color: ${change.targetColor};` : ''}\n              ${change.hasBorderColorChange ? `border-color: ${change.targetBorderColor};` : ''}\n              ${change.hasOpacityChange ? `opacity: ${change.targetOpacity};` : ''}\n              ${change.hasShadowChange ? `box-shadow: ${change.targetShadow};` : ''}\n              ${change.hasSizeChange ? `width: ${change.targetWidth}; height: ${change.targetHeight}; min-width: ${change.targetMinWidth}; min-height: ${change.targetMinHeight}; max-width: ${change.targetMaxWidth}; max-height: ${change.targetMaxHeight};` : ''}\n            }\n          }\n        `;\n        \n        console.log('\uD83C\uDFAC Keyframes created:', keyframes);\n        \n        // Add the keyframes to the document\n        const style = document.createElement('style');\n        style.textContent = keyframes;\n        document.head.appendChild(style);\n        \n        // Disable any existing CSS transitions that might interfere\n        sourceElement.style.transition = 'none';\n        \n        // Apply the animation\n        sourceElement.style.animation = `${animationName} ${duration}s ${easing} forwards`;\n        \n        // Debug: Check if animation is actually running\n        setTimeout(() => {\n          const computedStyle = window.getComputedStyle(sourceElement);\n          console.log('\uD83C\uDFAC Animation debug for element:', sourceElement.getAttribute('data-figma-id'));\n          console.log('\uD83C\uDFAC Computed animation:', computedStyle.animation);\n          console.log('\uD83C\uDFAC Computed transform:', computedStyle.transform);\n        }, 100);\n        \n        // Clean up the style element after animation\n        setTimeout(() => {\n          if (document.head.contains(style)) {\n            document.head.removeChild(style);\n          }\n        }, duration * 1000 + 100);\n\n        // Listen for animation completion\n        const onAnimationEnd = (event) => {\n          if (event.animationName === animationName) {\n            console.log('\u2705 SIMPLE ANIMATION: Animation completed for element:', sourceElement.getAttribute('data-figma-id'));\n            \n            // Log the final computed values\n            const finalComputedStyle = window.getComputedStyle(sourceElement);\n            console.log('\uD83C\uDFAC Final computed transform:', finalComputedStyle.transform);\n            console.log('\uD83C\uDFAC Final computed color:', finalComputedStyle.backgroundColor);\n            console.log('\uD83C\uDFAC Final computed shadow:', finalComputedStyle.boxShadow);\n            console.log('\uD83C\uDFAC Final computed width:', finalComputedStyle.width);\n            console.log('\uD83C\uDFAC Final computed height:', finalComputedStyle.height);\n            \n            // Clean up\n            sourceElement.removeEventListener('animationend', onAnimationEnd);\n            sourceElement.style.animation = '';\n            \n            // Call completion callback\n            if (onComplete) {\n              onComplete();\n            }\n            \n            resolve();\n          }\n        };\n        \n        sourceElement.addEventListener('animationend', onAnimationEnd);\n        \n        // Fallback timeout\n        setTimeout(() => {\n          console.log('\u23F0 SIMPLE ANIMATION: Animation completed via timeout for element:', sourceElement.getAttribute('data-figma-id'));\n          sourceElement.removeEventListener('animationend', onAnimationEnd);\n          sourceElement.style.animation = '';\n          \n          if (onComplete) {\n            onComplete();\n          }\n          \n          resolve();\n        }, duration * 1000 + 1000);\n      });\n    }\n\n    /**\n     * Main function to handle animated variant switching using simple approach\n     */\n    async function handleSimpleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration) {\n      console.log('\uD83D\uDD04 SIMPLE ANIMATED VARIANT SWITCH START:', {\n        sourceId: sourceElement.getAttribute('data-figma-id'),\n        sourceName: sourceElement.getAttribute('data-figma-name'),\n        destinationId: destination.getAttribute('data-figma-id'),\n        destinationName: destination.getAttribute('data-figma-name'),\n        transitionType: transitionType,\n        transitionDuration: transitionDuration,\n        totalVariants: allVariants.length\n      });\n      \n      // Check if transition is already in progress\n      if (isTransitionInProgress) {\n        console.log('\u274C Transition already in progress, skipping');\n        return;\n      }\n      \n      isTransitionInProgress = true;\n      \n      // Clear any pending timeout reactions to prevent conflicts\n      if (window.clearAllTimeoutReactions) {\n        window.clearAllTimeoutReactions();\n      }\n      \n      try {\n        // \u2705 POSITION MEASUREMENT FIX: Measure positions BEFORE hiding anything\n        console.log('\uD83D\uDCCF PRE-MEASUREMENT: Measuring source and target positions while visible');\n        \n        // Temporarily ensure both variants are visible for measurement\n        sourceElement.style.display = 'flex';\n        sourceElement.style.visibility = 'visible';\n        sourceElement.style.opacity = '1';\n        \n        destination.style.display = 'flex';\n        destination.style.visibility = 'visible';\n        destination.style.opacity = '1';\n        \n        // Force reflow\n        sourceElement.offsetHeight;\n        destination.offsetHeight;\n        \n        // Measure positions while both are visible\n        // Note: measureElementPositions function needs to be available in generated string\n        const sourcePositions = new Map();\n        const targetPositions = new Map();\n        \n        // Simplified position measurement for string generation\n        const measurePositions = (variant, positions) => {\n          const variantRect = variant.getBoundingClientRect();\n          positions.set(variant.getAttribute('data-figma-id'), {\n            rect: variantRect,\n            element: variant\n          });\n          \n          const childElements = variant.querySelectorAll('[data-figma-id]');\n          childElements.forEach(element => {\n            const rect = element.getBoundingClientRect();\n            positions.set(element.getAttribute('data-figma-id'), {\n              rect: rect,\n              element: element\n            });\n            \n            console.log(`\uD83D\uDCCF Measured ${element.getAttribute('data-figma-name')}:`, {\n              left: rect.left,\n              top: rect.top,\n              width: rect.width,\n              height: rect.height\n            });\n          });\n        };\n        \n        measurePositions(sourceElement, sourcePositions);\n        measurePositions(destination, targetPositions);\n        \n        console.log('\uD83D\uDCCF Source positions measured:', sourcePositions.size, 'elements');\n        console.log('\uD83D\uDCCF Target positions measured:', targetPositions.size, 'elements');\n        \n        // Now hide target and others, keep only source visible initially\n        allVariants.forEach(variant => {\n          if (variant === sourceElement) {\n            variant.style.display = 'flex';\n            variant.classList.add('variant-active');\n            variant.classList.remove('variant-hidden');\n          } else {\n            // Hide target and others during animation\n            variant.style.display = 'none';\n            variant.classList.add('variant-hidden');\n            variant.classList.remove('variant-active');\n          }\n        });\n        \n        // Use pre-measured positions to determine if animation is needed\n        let hasPositionChanges = false;\n        sourcePositions.forEach((sourceData, elementId) => {\n          const targetData = targetPositions.get(elementId);\n          if (targetData) {\n            const xDiff = targetData.rect.left - sourceData.rect.left;\n            const yDiff = targetData.rect.top - sourceData.rect.top;\n            if (Math.abs(xDiff) > 1 || Math.abs(yDiff) > 1) {\n              hasPositionChanges = true;\n            }\n          }\n        });\n        \n        console.log('\uD83D\uDD0D POSITION ANALYSIS: Has position changes:', hasPositionChanges);\n        \n        if (changes.length === 0) {\n          console.log('\uD83D\uDD04 No changes detected, performing instant switch');\n          // If no changes detected, just do an instant switch\n          sourceElement.style.display = 'none';\n          sourceElement.classList.add('variant-hidden');\n          sourceElement.classList.remove('variant-active');\n          \n          destination.style.display = 'flex';\n          destination.classList.add('variant-active');\n          destination.classList.remove('variant-hidden');\n        } else {\n          console.log('\uD83D\uDD04 Found', changes.length, 'elements with changes to animate');\n          \n          // Use the simple animation approach\n          const duration = parseFloat(transitionDuration.toString()) || 0.5;\n          const easing = getEasingFunction(transitionType);\n          \n          // Animate all changes simultaneously\n          const animationPromises = changes.map(change => \n            simpleAnimate(change, {\n              duration,\n              easing\n            })\n          );\n          \n          await Promise.all(animationPromises);\n          \n          console.log('\u2705 All animations completed');\n          \n          // Show target and hide source after all animations complete\n          sourceElement.style.display = 'none';\n          sourceElement.classList.add('variant-hidden');\n          sourceElement.classList.remove('variant-active');\n          \n          // Reset target positioning and make it active\n          destination.style.position = '';\n          destination.style.top = '';\n          destination.style.left = '';\n          destination.style.zIndex = '';\n          destination.style.display = 'flex';\n          destination.classList.add('variant-active');\n          destination.classList.remove('variant-hidden');\n        }\n        \n        // Start timeout reactions for the new active variant\n        if (window.startTimeoutReactionsForNewlyActiveVariant) {\n          window.startTimeoutReactionsForNewlyActiveVariant(destination);\n        }\n        if (window.startTimeoutReactionsForNestedComponents) {\n          window.startTimeoutReactionsForNestedComponents(destination);\n        }\n        \n        console.log('\u2705 SIMPLE ANIMATED VARIANT SWITCH COMPLETED');\n        \n      } catch (error) {\n        console.error('\u274C Error during simple animated variant switch:', error);\n      } finally {\n        isTransitionInProgress = false;\n      }\n    }\n    \n    /**\n     * Function to perform instant variant switch (no animation)\n     */\n    function performInstantVariantSwitch(allVariants, destination) {\n      console.log('\u26A1 PERFORMING INSTANT VARIANT SWITCH');\n      \n      // Hide all variants - only use display\n      allVariants.forEach(variant => {\n        variant.classList.add('variant-hidden');\n        variant.classList.remove('variant-active');\n        variant.style.display = 'none';\n        if (!variant.style.position || variant.style.position === 'static') {\n          variant.style.position = 'relative';\n        }\n      });\n      \n      // Show destination variant - only use display\n      destination.classList.add('variant-active');\n      destination.classList.remove('variant-hidden');\n      destination.style.display = 'flex';\n      if (!destination.style.position || destination.style.position === 'static') {\n        destination.style.position = 'relative';\n      }\n      \n      console.log('\u2705 INSTANT VARIANT SWITCH COMPLETED');\n      \n      // Start timeout reactions\n      if (window.startTimeoutReactionsForNewlyActiveVariant) {\n        window.startTimeoutReactionsForNewlyActiveVariant(destination);\n      }\n      if (window.startTimeoutReactionsForNestedComponents) {\n        window.startTimeoutReactionsForNestedComponents(destination);\n      }\n    }\n    \n    // Export the main functions for external use\n    window.handleReaction = handleReaction;\n    window.handleSimpleAnimatedVariantSwitch = handleSimpleAnimatedVariantSwitch;\n    window.performInstantVariantSwitch = performInstantVariantSwitch;\n    \n    console.log('\u2705 Simple transition handler loaded');\n  ";
}


/***/ }),

/***/ 925:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


// Browser-only entry point for the refactored system
// This file only includes code that runs in the browser, not in the Figma plugin
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Import all the event handling and animation modules
__exportStar(__webpack_require__(995), exports);
__exportStar(__webpack_require__(261), exports);
__exportStar(__webpack_require__(120), exports);
__exportStar(__webpack_require__(332), exports);
__exportStar(__webpack_require__(44), exports);
__exportStar(__webpack_require__(275), exports);
// Import animation CSS injection
var element_copier_1 = __webpack_require__(819);
// Import the modular animation functions
var transition_manager_1 = __webpack_require__(775);
var modular_transition_handler_1 = __webpack_require__(821);
// Import the modular transition handler function
var modular_transition_handler_2 = __webpack_require__(821);
// Store the function for later execution
var modularTransitionHandlerCode = null;
// Function to execute the modular transition handler when needed
function executeModularTransitionHandler() {
    if (!modularTransitionHandlerCode) {
        modularTransitionHandlerCode = (0, modular_transition_handler_2.createModularSmartAnimateHandler)();
    }
    try {
        eval(modularTransitionHandlerCode);
        console.log('DEBUG: Modular transition handler executed successfully');
        return true;
    }
    catch (error) {
        console.error('DEBUG: Error executing modular transition handler:', error);
        return false;
    }
}
// CRITICAL: Expose functions immediately when script loads, not waiting for DOM
if (typeof window !== 'undefined') {
    console.log('DEBUG: Refactored system loaded in browser');
    // Expose functions immediately to ensure they're available for eval context
    window.handleAnimatedVariantSwitch = transition_manager_1.handleAnimatedVariantSwitch;
    window.performInstantVariantSwitch = transition_manager_1.performInstantVariantSwitch;
    window.handleReaction = modular_transition_handler_1.handleReaction;
    window.startTimeoutReactionsForNewlyActiveVariant = modular_transition_handler_1.startTimeoutReactionsForNewlyActiveVariant;
    window.startTimeoutReactionsForNestedComponents = modular_transition_handler_1.startTimeoutReactionsForNestedComponents;
    window.clearAllTimeoutReactions = modular_transition_handler_1.clearAllTimeoutReactions;
    window.setTransitionLock = transition_manager_1.setTransitionLock;
    window.clearTransitionLock = transition_manager_1.clearTransitionLock;
    window.getTransitionLockStatus = transition_manager_1.getTransitionLockStatus;
    // Also expose the modular system for the eval context
    window.modularAnimationSystem = {
        handleAnimatedVariantSwitch: transition_manager_1.handleAnimatedVariantSwitch,
        performInstantVariantSwitch: transition_manager_1.performInstantVariantSwitch,
        setTransitionLock: transition_manager_1.setTransitionLock,
        clearTransitionLock: transition_manager_1.clearTransitionLock,
        getTransitionLockStatus: transition_manager_1.getTransitionLockStatus
    };
    console.log('DEBUG: Functions exposed immediately to window object');
    // ✅ FIX: Inject animation CSS styles immediately
    (0, element_copier_1.injectAnimationCSS)();
    // Wait for DOM to be ready for the rest of initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSystem);
    }
    else {
        initializeSystem();
    }
}
function initializeSystem() {
    console.log('DEBUG: Initializing refactored system with modular transition handler');
    // Functions are already exposed to window object from the immediate execution above
    // Debug: Log what we're exposing
    console.log('DEBUG: Exposing functions globally:', {
        handleAnimatedVariantSwitch: typeof window.handleAnimatedVariantSwitch,
        performInstantVariantSwitch: typeof window.performInstantVariantSwitch,
        handleReaction: typeof window.handleReaction,
        modularAnimationSystem: typeof window.modularAnimationSystem
    });
    // Debug: Check if the imported functions are actually functions
    console.log('DEBUG: Imported function types:', {
        handleAnimatedVariantSwitch: typeof transition_manager_1.handleAnimatedVariantSwitch,
        performInstantVariantSwitch: typeof transition_manager_1.performInstantVariantSwitch,
        handleReaction: typeof modular_transition_handler_1.handleReaction
    });
    // Debug: Check if the functions are null/undefined
    console.log('DEBUG: Function null checks:', {
        'handleAnimatedVariantSwitch === null': transition_manager_1.handleAnimatedVariantSwitch === null,
        'handleAnimatedVariantSwitch === undefined': transition_manager_1.handleAnimatedVariantSwitch === undefined,
        'performInstantVariantSwitch === null': transition_manager_1.performInstantVariantSwitch === null,
        'performInstantVariantSwitch === undefined': transition_manager_1.performInstantVariantSwitch === undefined,
        'handleReaction === null': modular_transition_handler_1.handleReaction === null,
        'handleReaction === undefined': modular_transition_handler_1.handleReaction === undefined
    });
    // Debug: Check if the functions are actually being assigned
    console.log('DEBUG: Function assignment verification:', {
        'window.handleAnimatedVariantSwitch === handleAnimatedVariantSwitch': window.handleAnimatedVariantSwitch === transition_manager_1.handleAnimatedVariantSwitch,
        'window.performInstantVariantSwitch === performInstantVariantSwitch': window.performInstantVariantSwitch === transition_manager_1.performInstantVariantSwitch,
        'window.handleReaction === handleReaction': window.handleReaction === modular_transition_handler_1.handleReaction
    });
    // Execute the modular transition handler to expose handleReaction and variant switching functions
    if (executeModularTransitionHandler()) {
        console.log('DEBUG: Modular transition handler executed successfully');
    }
    else {
        console.error('DEBUG: Failed to execute modular transition handler');
    }
    // Check if the functions are available
    setTimeout(function () {
        if (window.handleReaction) {
            console.log('DEBUG: handleReaction function is available globally');
        }
        else {
            console.error('DEBUG: handleReaction function not found - the modular transition handler may not be properly loaded');
        }
        if (window.handleAnimatedVariantSwitch) {
            console.log('DEBUG: handleAnimatedVariantSwitch function is available globally');
        }
        else {
            console.error('DEBUG: handleAnimatedVariantSwitch function not found');
        }
        if (window.performInstantVariantSwitch) {
            console.log('DEBUG: performInstantVariantSwitch function is available globally');
        }
        else {
            console.error('DEBUG: performInstantVariantSwitch function not found');
        }
        if (window.startTimeoutReactionsForNewlyActiveVariant) {
            console.log('DEBUG: startTimeoutReactionsForNewlyActiveVariant function is available globally');
        }
        else {
            console.error('DEBUG: startTimeoutReactionsForNewlyActiveVariant function not found');
        }
        if (window.startTimeoutReactionsForNestedComponents) {
            console.log('DEBUG: startTimeoutReactionsForNestedComponents function is available globally');
        }
        else {
            console.error('DEBUG: startTimeoutReactionsForNestedComponents function not found');
        }
        if (window.clearAllTimeoutReactions) {
            console.log('DEBUG: clearAllTimeoutReactions function is available globally');
        }
        else {
            console.error('DEBUG: clearAllTimeoutReactions function not found');
        }
    }, 100);
    console.log('DEBUG: Modular transition handler functions available');
}


/***/ }),

/***/ 995:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateEventHandlingJavaScript = exports.generateVariantAttributes = exports.generateReactionAttributes = void 0;
// Re-export from the new modular events structure
var index_1 = __webpack_require__(172);
Object.defineProperty(exports, "generateReactionAttributes", ({ enumerable: true, get: function () { return index_1.generateReactionAttributes; } }));
Object.defineProperty(exports, "generateVariantAttributes", ({ enumerable: true, get: function () { return index_1.generateVariantAttributes; } }));
Object.defineProperty(exports, "generateEventHandlingJavaScript", ({ enumerable: true, get: function () { return index_1.generateEventHandlingJavaScript; } }));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(925);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});