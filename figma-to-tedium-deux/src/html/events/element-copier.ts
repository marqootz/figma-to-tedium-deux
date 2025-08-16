/**
 * Element Copying Module
 * 
 * Responsible for creating and managing element copies during animations.
 * This module handles the logic for copying source elements, positioning them,
 * and updating their content to match the destination.
 */

/**
 * Create a copy of a source element for animation
 */
export function createElementCopy(sourceElement: HTMLElement): HTMLElement {
  console.log('DEBUG: createElementCopy function called');
  console.log('DEBUG: Creating element copy for:', sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id'));
  
  const copy = sourceElement.cloneNode(true) as HTMLElement;
  copy.setAttribute('data-figma-id', sourceElement.getAttribute('data-figma-id') + '-copy');
  copy.setAttribute('data-is-animation-copy', 'true');
  
  // Make an exact copy - don't manipulate positions
  console.log('DEBUG: Making exact copy of source variant');
  
  // Get source elements for copy creation (no detailed logging)
  const sourceElements = sourceElement.querySelectorAll('[data-figma-id]');
  
  // The copy is already an exact clone, no position manipulation needed
  
  // Position the copy absolutely over the source element
  const sourceRect = sourceElement.getBoundingClientRect();
  const parentRect = sourceElement.parentElement?.getBoundingClientRect() || { left: 0, top: 0 };
  
  copy.style.position = 'absolute';
  copy.style.top = (sourceRect.top - parentRect.top) + 'px';
  copy.style.left = (sourceRect.left - parentRect.left) + 'px';
  copy.style.transform = 'none';
  copy.style.margin = '0';
  copy.style.padding = '0';
  
  // Set high z-index
  const allElements = document.querySelectorAll('*');
  let maxZIndex = 0;
  allElements.forEach(el => {
    const zIndex = parseInt(window.getComputedStyle(el).zIndex) || 0;
    if (zIndex > maxZIndex) maxZIndex = zIndex;
  });
  
  const copyZIndex = maxZIndex + 1000;
  copy.style.zIndex = copyZIndex.toString();
  copy.style.pointerEvents = 'none';
  copy.style.transform = 'translateZ(0)';
  copy.style.willChange = 'transform, left, top';
  
  // Preserve original overflow from source element
  const sourceComputedStyle = window.getComputedStyle(sourceElement);
  copy.style.overflow = sourceComputedStyle.overflow;
  
  // Ensure the copy and all its children are fully visible
  copy.style.opacity = '1';
  copy.style.visibility = 'visible';
  copy.style.display = 'flex';

  // Ensure all nested elements in the copy are also visible, but preserve their original overflow
  const copyChildren = copy.querySelectorAll('*');
  copyChildren.forEach(child => {
    (child as HTMLElement).style.opacity = '1';
    (child as HTMLElement).style.visibility = 'visible';
    // Don't override overflow - preserve the original value from the clone
    if ((child as HTMLElement).style.display === 'none') {
      (child as HTMLElement).style.display = 'flex';
    }
  });

  // Ensure all nodes in the copy are visible (no detailed logging)

  console.log('DEBUG: Copy creation completed');
  return copy;
}

/**
 * Update copy content to match destination
 */
export function updateCopyContentToMatchDestination(copy: HTMLElement, destination: HTMLElement): void {
  console.log('DEBUG: Updating copy content to match destination');
  
  // Get all elements in both copy and destination
  const copyElements = copy.querySelectorAll('[data-figma-id]');
  const destinationElements = destination.querySelectorAll('[data-figma-id]');
  
  // Create a map of destination elements by name
  const destinationElementMap = new Map();
  destinationElements.forEach(element => {
    const name = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');
    if (name) {
      destinationElementMap.set(name, element);
    }
  });
  
  // Update each copy element's content to match destination
  copyElements.forEach(copyElement => {
    const copyElementName = copyElement.getAttribute('data-figma-name') || copyElement.getAttribute('data-figma-id');
    const destinationElement = destinationElementMap.get(copyElementName);
    
    if (destinationElement) {
      // Update text content
      if (destinationElement.textContent !== copyElement.textContent) {
        copyElement.textContent = destinationElement.textContent;
      }
      
      // Update innerHTML for more complex content, but preserve positioning
      if (destinationElement.innerHTML !== copyElement.innerHTML) {
        
        // CRITICAL FIX: Preserve the positioning of ALL nested elements before updating content
        const allNestedElements = copyElement.querySelectorAll('[data-figma-id]');
        const originalPositions = new Map();
        
        allNestedElements.forEach(nestedElement => {
          const nestedElementName = nestedElement.getAttribute('data-figma-name') || nestedElement.getAttribute('data-figma-id');
          const computedStyle = window.getComputedStyle(nestedElement as HTMLElement);
          originalPositions.set(nestedElementName, {
            position: computedStyle.position,
            left: computedStyle.left,
            top: computedStyle.top,
            transform: computedStyle.transform
          });
        });
        
        // Also preserve the copy element itself
        const copyComputedStyle = window.getComputedStyle(copyElement as HTMLElement);
        originalPositions.set(copyElementName, {
          position: copyComputedStyle.position,
          left: copyComputedStyle.left,
          top: copyComputedStyle.top,
          transform: copyComputedStyle.transform
        });
        
        // Update the innerHTML
        copyElement.innerHTML = destinationElement.innerHTML;
        
        // CRITICAL FIX: Restore the positioning of ALL elements after content update
        originalPositions.forEach((positionData, elementName) => {
          const elementToRestore = elementName === copyElementName ? 
            copyElement : 
            copyElement.querySelector('[data-figma-name="' + elementName + '"]') ||
            copyElement.querySelector('[data-figma-id="' + elementName + '"]');
          
          if (elementToRestore) {
            (elementToRestore as HTMLElement).style.position = positionData.position;
            (elementToRestore as HTMLElement).style.left = positionData.left;
            (elementToRestore as HTMLElement).style.top = positionData.top;
            (elementToRestore as HTMLElement).style.transform = positionData.transform;
          }
        });
      }
      
      // Update specific attributes that might contain content
      const contentAttributes = ['data-content', 'data-text', 'title', 'alt'];
      contentAttributes.forEach(attr => {
        const destValue = destinationElement.getAttribute(attr);
        const copyValue = copyElement.getAttribute(attr);
        if (destValue !== copyValue && destValue !== null) {
          copyElement.setAttribute(attr, destValue);
        }
      });
    }
  });
  
  // Ensure all elements in the copy are visible after content update, but preserve overflow
  const allCopyElements = copy.querySelectorAll('*');
  allCopyElements.forEach(element => {
    (element as HTMLElement).style.opacity = '1';
    (element as HTMLElement).style.visibility = 'visible';
    // Don't override overflow - preserve the original value from the clone
    if ((element as HTMLElement).style.display === 'none') {
      (element as HTMLElement).style.display = 'flex';
    }
  });
}

/**
 * Insert copy into DOM at the correct position
 */
export function insertCopyIntoDOM(copy: HTMLElement, sourceElement: HTMLElement): void {
  console.log('DEBUG: Inserting copy into DOM');
  
  // Insert the copy into the DOM
  const sourceParent = sourceElement.parentElement;
  if (sourceParent) {
    sourceParent.appendChild(copy);
    console.log('DEBUG: Copy inserted into DOM');
  } else {
    console.error('DEBUG: No parent element found for source element');
  }
  
  // Log the copy's position and visibility after insertion
  const copyRect = copy.getBoundingClientRect();
  const copyStyle = window.getComputedStyle(copy);
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
export function removeCopyFromDOM(copy: HTMLElement): void {
  console.log('DEBUG: Removing copy from DOM');
  if (copy.parentElement) {
    copy.parentElement.removeChild(copy);
    console.log('DEBUG: Copy removed from DOM');
  } else {
    console.log('DEBUG: Copy has no parent element to remove from');
  }
}

/**
 * Hide original source element and other variants
 */
export function hideOriginalElements(sourceElement: HTMLElement, allVariants: HTMLElement[]): void {
  console.log('DEBUG: Hiding original elements');
  
  // Hide the original source element
  sourceElement.style.opacity = '0';
  sourceElement.style.visibility = 'hidden';
  
  // Hide all other variants
  allVariants.forEach(variant => {
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
export function showDestinationVariant(destination: HTMLElement, allVariants: HTMLElement[]): void {
  console.log('DEBUG: Showing destination variant');
  
  // Hide the original source element permanently
  allVariants.forEach(variant => {
    if (variant !== destination) {
      variant.style.opacity = '0';
      variant.style.visibility = 'hidden';
      variant.classList.add('variant-hidden');
      variant.classList.remove('variant-active');
    }
  });
  
  // Simply show the destination variant - don't touch its positioning
  console.log('DEBUG: SHOWING DESTINATION VARIANT:', {
    destinationId: destination.getAttribute('data-figma-id'),
    destinationName: destination.getAttribute('data-figma-name'),
    visibility: 'visible',
    opacity: '1',
    display: 'flex'
  });
  
  destination.style.visibility = 'visible';
  destination.style.opacity = '1';
  destination.style.display = 'flex';
  destination.classList.add('variant-active');
  destination.classList.remove('variant-hidden');
  
  console.log('DEBUG: Destination variant shown');
}
