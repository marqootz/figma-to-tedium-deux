/**
 * Simple Browser Entry Point
 * 
 * Exports the simple animation system functions globally for use in HTML.
 */

import { 
  simpleAnimate, 
  simpleVariantSwitch, 
  instantVariantSwitch, 
  resetAnimationState 
} from './html/events/simple-animation-system';

// Export functions globally
declare global {
  interface Window {
    simpleAnimate: typeof simpleAnimate;
    simpleVariantSwitch: typeof simpleVariantSwitch;
    instantVariantSwitch: typeof instantVariantSwitch;
    resetAnimationState: typeof resetAnimationState;
  }
}

// Make functions available globally
window.simpleAnimate = simpleAnimate;
window.simpleVariantSwitch = simpleVariantSwitch;
window.instantVariantSwitch = instantVariantSwitch;
window.resetAnimationState = resetAnimationState;

console.log('✅ Simple animation system loaded in browser');
console.log('📋 Available functions:');
console.log('  - simpleAnimate(source, target, options)');
console.log('  - simpleVariantSwitch(source, target, options)');
console.log('  - instantVariantSwitch(source, target)');
console.log('  - resetAnimationState(source, target)');
