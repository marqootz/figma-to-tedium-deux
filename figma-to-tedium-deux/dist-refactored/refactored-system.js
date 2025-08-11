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

/***/ 11:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.computeLayoutStyles = computeLayoutStyles;
// Layout and flexbox styles computation
function computeLayoutStyles(node, parentNode) {
    var layoutStyles = {};
    // --- POSITIONING LOGIC ---
    // All instances and component sets should get position: relative and 0px top/left
    // This is their default export state, regardless of nesting
    var isInstanceOrComponentSet = node.type === 'INSTANCE' ||
        node.type === 'COMPONENT_SET' ||
        node.type === 'COMPONENT';
    if (isInstanceOrComponentSet) {
        layoutStyles.position = 'relative';
        layoutStyles.top = '0px';
        layoutStyles.left = '0px';
    }
    // --- AUTO-LAYOUT STYLES ---
    if (node.layoutMode) {
        // Set display: flex for flexbox properties to work, but without !important
        // so CSS classes can override it
        layoutStyles.display = 'flex';
        // Flex direction
        if (node.layoutMode === 'HORIZONTAL') {
            layoutStyles['flex-direction'] = 'row';
        }
        else if (node.layoutMode === 'VERTICAL') {
            layoutStyles['flex-direction'] = 'column';
        }
        // Justify content (primary axis)
        if (node.primaryAxisAlignItems) {
            switch (node.primaryAxisAlignItems) {
                case 'MIN':
                    layoutStyles['justify-content'] = 'flex-start';
                    break;
                case 'MAX':
                    layoutStyles['justify-content'] = 'flex-end';
                    break;
                case 'CENTER':
                    layoutStyles['justify-content'] = 'center';
                    break;
                case 'SPACE_BETWEEN':
                    layoutStyles['justify-content'] = 'space-between';
                    break;
                case 'SPACE_AROUND':
                    layoutStyles['justify-content'] = 'space-around';
                    break;
            }
        }
        // Align items (counter axis)
        if (node.counterAxisAlignItems) {
            switch (node.counterAxisAlignItems) {
                case 'MIN':
                    layoutStyles['align-items'] = 'flex-start';
                    break;
                case 'MAX':
                    layoutStyles['align-items'] = 'flex-end';
                    break;
                case 'CENTER':
                    layoutStyles['align-items'] = 'center';
                    break;
                case 'STRETCH':
                    layoutStyles['align-items'] = 'stretch';
                    break;
            }
        }
        // Gap (item spacing) - handle negative gaps with margins
        if (node.itemSpacing !== undefined) {
            if (['SPACE_BETWEEN', 'SPACE_AROUND'].includes(node.primaryAxisAlignItems || '')) {
                // Explicitly set gap to 0 for space layouts that handle spacing internally
                layoutStyles.gap = '0px';
            }
            else if (node.itemSpacing < 0) {
                // Negative gap: use negative margins instead
                // This will be handled in the parent container's child processing
                layoutStyles.gap = '0px';
            }
            else {
                // Positive gap: use normal gap
                layoutStyles.gap = "".concat(node.itemSpacing, "px");
            }
        }
    }
    return layoutStyles;
}


/***/ }),

/***/ 44:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createComponentSetInitializer = createComponentSetInitializer;
// Component set initialization logic
function createComponentSetInitializer() {
    return "\n      // Initialize component set variants - handle both single and multiple variants\n      // Handle both COMPONENT_SET and COMPONENT elements that contain variants\n      // With the new 1:1 structure, this will handle nested component sets correctly\n      const componentSets = document.querySelectorAll('[data-figma-type=\"COMPONENT_SET\"], [data-figma-type=\"COMPONENT\"]');\n      componentSets.forEach(componentSet => {\n        // Find all COMPONENT children - these are the variants\n        // Some may have explicit variant attributes, others are variants by hierarchy\n        const variants = componentSet.querySelectorAll('[data-figma-type=\"COMPONENT\"]');\n        \n        // Handle both single and multiple variants\n        if (variants.length >= 1) {\n          console.log('Initializing component set/instance with', variants.length, 'variants:', {\n            componentSetId: componentSet.getAttribute('data-figma-id'),\n            componentSetName: componentSet.getAttribute('data-figma-name'),\n            componentSetType: componentSet.getAttribute('data-figma-type'),\n            parentType: componentSet.parentElement?.getAttribute('data-figma-type'),\n            parentId: componentSet.parentElement?.getAttribute('data-figma-id'),\n            variantIds: Array.from(variants).map(v => v.getAttribute('data-figma-id'))\n          });\n          \n          // Reset opacity for all variants to ensure clean initial state\n          variants.forEach(variant => {\n            variant.style.opacity = '1'; // Ensure all variants start with opacity 1\n          });\n          \n          // For single components, just make them visible\n          if (variants.length === 1) {\n            const singleVariant = variants[0];\n            singleVariant.classList.add('variant-active');\n            singleVariant.classList.remove('variant-hidden');\n            console.log('Set single variant as active:', singleVariant.getAttribute('data-figma-id'), 'in component set:', componentSet.getAttribute('data-figma-id'));\n          } else {\n            // For multiple variants, the FIRST variant should be active initially (where reactions are)\n            // This ensures the animation starts from the variant with reactions\n            variants.forEach((variant, index) => {\n              if (index === 0) {\n                variant.classList.add('variant-active');\n                variant.classList.remove('variant-hidden');\n                console.log('Set first variant as active (with reactions):', variant.getAttribute('data-figma-id'), 'in component set:', componentSet.getAttribute('data-figma-id'));\n              } else {\n                variant.classList.add('variant-hidden');\n                variant.classList.remove('variant-active');\n                console.log('Set variant as hidden:', variant.getAttribute('data-figma-id'), 'in component set:', componentSet.getAttribute('data-figma-id'));\n              }\n            });\n          }\n        }\n      });\n  ";
}


/***/ }),

/***/ 68:
/***/ (function(__unused_webpack_module, exports) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.loadFonts = loadFonts;
exports.getEmbeddedFontStyles = getEmbeddedFontStyles;
// Font loading functions
function loadFonts(node) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1, _a, _b, child, e_1_1;
        var e_1, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!(node.type === 'TEXT' && node.fontName)) return [3 /*break*/, 4];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, figma.loadFontAsync(node.fontName)];
                case 2:
                    _d.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _d.sent();
                    console.warn("Failed to load font for node ".concat(node.name, ":"), error_1);
                    return [3 /*break*/, 4];
                case 4:
                    if (!node.children) return [3 /*break*/, 12];
                    _d.label = 5;
                case 5:
                    _d.trys.push([5, 10, 11, 12]);
                    _a = __values(node.children), _b = _a.next();
                    _d.label = 6;
                case 6:
                    if (!!_b.done) return [3 /*break*/, 9];
                    child = _b.value;
                    return [4 /*yield*/, loadFonts(child)];
                case 7:
                    _d.sent();
                    _d.label = 8;
                case 8:
                    _b = _a.next();
                    return [3 /*break*/, 6];
                case 9: return [3 /*break*/, 12];
                case 10:
                    e_1_1 = _d.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 12];
                case 11:
                    try {
                        if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
// Font CSS generation
function getEmbeddedFontStyles() {
    return "\n    /* iOS-compatible font declarations - using consistent font-family names */\n    \n    /* TrueType fonts - \"CircularXX TT\" family with font-weight and font-style variations */\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-Thin.ttf\") format(\"truetype\");\n      font-weight: 100;\n      font-style: normal;\n      font-display: swap;\n    }\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-ThinItalic.ttf\") format(\"truetype\");\n      font-weight: 100;\n      font-style: italic;\n      font-display: swap;\n    }\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-Light.ttf\") format(\"truetype\");\n      font-weight: 300;\n      font-style: normal;\n      font-display: swap;\n    }\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-LightItalic.ttf\") format(\"truetype\");\n      font-weight: 300;\n      font-style: italic;\n      font-display: swap;\n    }\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-Regular.ttf\") format(\"truetype\");\n      font-weight: 400;\n      font-style: normal;\n      font-display: swap;\n    }\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-Italic.ttf\") format(\"truetype\");\n      font-weight: 400;\n      font-style: italic;\n      font-display: swap;\n    }\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-Book.ttf\") format(\"truetype\");\n      font-weight: 450;\n      font-style: normal;\n      font-display: swap;\n    }\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-BookItalic.ttf\") format(\"truetype\");\n      font-weight: 450;\n      font-style: italic;\n      font-display: swap;\n    }\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-Medium.ttf\") format(\"truetype\");\n      font-weight: 500;\n      font-style: normal;\n      font-display: swap;\n    }\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-MediumItalic.ttf\") format(\"truetype\");\n      font-weight: 500;\n      font-style: italic;\n      font-display: swap;\n    }\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-Bold.ttf\") format(\"truetype\");\n      font-weight: 700;\n      font-style: normal;\n      font-display: swap;\n    }\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-BoldItalic.ttf\") format(\"truetype\");\n      font-weight: 700;\n      font-style: italic;\n      font-display: swap;\n    }\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-Black.ttf\") format(\"truetype\");\n      font-weight: 900;\n      font-style: normal;\n      font-display: swap;\n    }\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-BlackItalic.ttf\") format(\"truetype\");\n      font-weight: 900;\n      font-style: italic;\n      font-display: swap;\n    }\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-ExtraBlack.ttf\") format(\"truetype\");\n      font-weight: 950;\n      font-style: normal;\n      font-display: swap;\n    }\n    @font-face {\n      font-family: \"CircularXX TT\";\n      src: url(\"fonts/CircularXXTT-ExtraBlackItalic.ttf\") format(\"truetype\");\n      font-weight: 950;\n      font-style: italic;\n      font-display: swap;\n    }\n  ";
}


/***/ }),

/***/ 82:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createPropertyDetector = createPropertyDetector;
// Property change detection logic
function createPropertyDetector() {
    return "\n      // Helper function to find elements with property changes between variants\n      function findElementsWithPropertyChanges(targetVariant, currentVariant) {\n        console.log('DEBUG: findElementsWithPropertyChanges called');\n        console.log('  Target variant ID:', targetVariant.getAttribute('data-figma-id'), 'Name:', targetVariant.getAttribute('data-figma-name'));\n        console.log('  Current variant ID:', currentVariant.getAttribute('data-figma-id'), 'Name:', currentVariant.getAttribute('data-figma-name'));\n        \n        if (!currentVariant) {\n          console.log('DEBUG: No current variant provided, returning empty array');\n          return [];\n        }\n        \n        const targetElements = targetVariant.querySelectorAll('[data-figma-id]');\n        const sourceElements = currentVariant.querySelectorAll('[data-figma-id]');\n        const sourceElementMap = new Map();\n        const elementsToAnimate = [];\n\n        console.log('DEBUG: Found', targetElements.length, 'target elements and', sourceElements.length, 'source elements');\n\n        // Build source element map by name\n        sourceElements.forEach(function(sourceElement) {\n          const sourceName = sourceElement.getAttribute('data-figma-name') || sourceElement.getAttribute('data-figma-id');\n          if (sourceName) {\n            sourceElementMap.set(sourceName, sourceElement);\n            console.log('  Mapped source element:', sourceName, '->', sourceElement.getAttribute('data-figma-id'));\n          }\n        });\n\n        // Analyze each target element for property changes\n        targetElements.forEach(function(element, index) {\n          const targetName = element.getAttribute('data-figma-name') || element.getAttribute('data-figma-id');\n          const sourceElement = sourceElementMap.get(targetName);\n          \n          console.log('DEBUG: Analyzing target element ' + (index + 1) + ':', targetName);\n          console.log('  Target element ID:', element.getAttribute('data-figma-id'));\n          console.log('  Source element found:', !!sourceElement);\n          \n          if (sourceElement) {\n            console.log('  Source element ID:', sourceElement.getAttribute('data-figma-id'));\n            const changes = detectPropertyChanges(element, sourceElement);\n            \n            if (changes.hasChanges) {\n              elementsToAnimate.push({\n                element: sourceElement,  // Use SOURCE element (from copy) instead of target\n                sourceElement: sourceElement,\n                changes: changes\n              });\n              console.log('DEBUG: Found element with property changes:', targetName, 'changes:', changes);\n            } else {\n              console.log('DEBUG: No changes detected for element:', targetName);\n            }\n          } else {\n            console.log('DEBUG: No matching source element found for:', targetName);\n          }\n        });\n        \n        console.log('DEBUG: Returning', elementsToAnimate.length, 'elements to animate');\n        return elementsToAnimate;\n      }\n\n      // Helper function to detect property changes between elements\n      function detectPropertyChanges(targetElement, sourceElement) {\n        const changes = {\n          hasChanges: false,\n          positionX: { changed: false, sourceValue: null, targetValue: null },\n          positionY: { changed: false, sourceValue: null, targetValue: null },\n          backgroundColor: { changed: false, sourceValue: null, targetValue: null },\n          color: { changed: false, sourceValue: null, targetValue: null },\n          justifyContent: { changed: false, sourceValue: null, targetValue: null },\n          alignItems: { changed: false, sourceValue: null, targetValue: null }\n        };\n\n        try {\n          // Check position changes by comparing the computed styles\n          const sourceStyle = window.getComputedStyle(sourceElement);\n          const targetStyle = window.getComputedStyle(targetElement);\n          \n          // Check left position changes - use Figma data attributes for more accurate positioning\n          const sourceLeft = parseFloat(sourceStyle.left) || 0;\n          const targetLeft = parseFloat(targetStyle.left) || 0;\n          \n          // Get Figma position data for more accurate target positioning\n          const sourceFigmaX = parseFloat(sourceElement.getAttribute('data-figma-x')) || 0;\n          const targetFigmaX = parseFloat(targetElement.getAttribute('data-figma-x')) || 0;\n          \n          // CRITICAL FIX: Check if the source element has a transform applied from a previous animation\n          // If so, we need to account for that in the position calculation\n          const sourceTransform = sourceStyle.transform;\n          let sourceTransformOffset = 0;\n          if (sourceTransform && sourceTransform !== 'none') {\n            // Extract translateX value from transform matrix\n            const matrix = new DOMMatrix(sourceTransform);\n            sourceTransformOffset = matrix.m41; // m41 is the translateX value\n            console.log('DEBUG: Source element has transform:', sourceTransform, 'translateX offset:', sourceTransformOffset);\n          }\n          \n          // Log detailed information about the elements\n          const sourceName = sourceElement.getAttribute('data-figma-name');\n          const targetName = targetElement.getAttribute('data-figma-name');\n          const sourceId = sourceElement.getAttribute('data-figma-id');\n          const targetId = targetElement.getAttribute('data-figma-id');\n          \n          console.log('DEBUG: Analyzing elements:');\n          console.log('  Source:', sourceName, 'ID:', sourceId, 'Left:', sourceLeft, 'FigmaX:', sourceFigmaX);\n          console.log('  Target:', targetName, 'ID:', targetId, 'Left:', targetLeft, 'FigmaX:', targetFigmaX);\n          \n          // Log parent container dimensions\n          const sourceContainer = sourceElement.closest('[data-figma-type=\"COMPONENT_SET\"], [data-figma-type=\"COMPONENT\"]');\n          const targetContainer = targetElement.closest('[data-figma-type=\"COMPONENT_SET\"], [data-figma-type=\"COMPONENT\"]');\n          \n          if (sourceContainer) {\n            const sourceContainerRect = sourceContainer.getBoundingClientRect();\n            console.log('  Source container dimensions:', sourceContainerRect.width, 'x', sourceContainerRect.height);\n          }\n          \n          if (targetContainer) {\n            const targetContainerRect = targetContainer.getBoundingClientRect();\n            console.log('  Target container dimensions:', targetContainerRect.width, 'x', targetContainerRect.height);\n          }\n          \n          // Log viewport dimensions\n          console.log('  Viewport dimensions:', window.innerWidth, 'x', window.innerHeight);\n          \n          // Log element dimensions\n          const sourceRect = sourceElement.getBoundingClientRect();\n          const targetRect = targetElement.getBoundingClientRect();\n          console.log('  Source element dimensions:', sourceRect.width, 'x', sourceRect.height);\n          console.log('  Target element dimensions:', targetRect.width, 'x', targetRect.height);\n          \n          // Check if target element is properly rendered\n          if (targetRect.width === 0 && targetRect.height === 0) {\n            console.log('DEBUG: Target element has zero dimensions, skipping animation');\n            return changes;\n          }\n          \n          // CRITICAL FIX: Use current computed position for source if element has been animated\n          // This ensures we detect changes from the actual current position, not the original Figma position\n          const sourceHasBeenAnimated = sourceElement.style.position === 'absolute' && \n                                       (sourceElement.style.left || sourceElement.style.top);\n          \n          // Calculate target position by scaling Figma coordinates to actual rendered size\n          // Use SOURCE element's parent (copy) for scaling since we're animating the copy\n          const sourceContainerForScaling = sourceElement.closest('[data-figma-type=\"COMPONENT_SET\"], [data-figma-type=\"COMPONENT\"]');\n          const targetContainerForScaling = sourceElement.closest('[data-figma-type=\"COMPONENT_SET\"], [data-figma-type=\"COMPONENT\"]');\n          \n          let finalTargetLeft = 0; // Start with 0, will be calculated below\n          // Always use computed styles for consistency\n          let finalSourceLeft = parseFloat(sourceStyle.left) || 0;\n          \n          // Add transform offset if present\n          finalSourceLeft += sourceTransformOffset;\n          \n          // CRITICAL FIX: Scale position from component set dimensions to instance dimensions\n          // The target element is positioned in the component set (2619.125px) but needs to be scaled to the instance (346px)\n          const targetComputedStyle = window.getComputedStyle(targetElement);\n          let targetContainerX = targetElement.parentElement;\n          \n          // Walk up the DOM tree to find the nearest INSTANCE container\n          while (targetContainerX && targetContainerX.getAttribute('data-figma-type') !== 'INSTANCE') {\n            targetContainerX = targetContainerX.parentElement;\n          }\n          \n          if (targetContainerX) {\n            const containerRectX = targetContainerX.getBoundingClientRect();\n            const targetElementRectX = targetElement.getBoundingClientRect();\n            \n            // Get the original Figma X position from the target element\n            const figmaX = parseFloat(targetElement.getAttribute('data-figma-x')) || 0;\n            \n            // Scale factor: instance width / component set width\n            // From JSON: component set width = 2619.125px, instance width = 346px\n            const componentSetWidth = 2619.125;\n            const instanceWidth = containerRectX.width;\n            const scaleFactor = instanceWidth / componentSetWidth;\n            \n            // Scale the Figma X position to fit within the instance\n            // Account for the object's width to prevent overflow\n            const objectWidth = targetElementRectX.width;\n            const scaledPosition = figmaX * scaleFactor;\n            \n            // Ensure the object doesn't overflow the container\n            finalTargetLeft = Math.min(scaledPosition, instanceWidth - objectWidth);\n            \n            console.log('DEBUG: Position calculation with object size:', {\n              figmaX: figmaX,\n              scaleFactor: scaleFactor,\n              scaledPosition: scaledPosition,\n              objectWidth: objectWidth,\n              instanceWidth: instanceWidth,\n              finalTargetLeft: finalTargetLeft\n            });\n            \n            console.log('DEBUG: Using scaled INSTANCE-relative position calculation:', {\n              targetElementLeft: targetElementRectX.left,\n              containerLeft: containerRectX.left,\n              containerWidth: containerRectX.width,\n              figmaX: figmaX,\n              componentSetWidth: componentSetWidth,\n              scaleFactor: scaleFactor,\n              finalTargetLeft: finalTargetLeft,\n              targetElement: targetElement.getAttribute('data-figma-name') || targetElement.getAttribute('data-figma-id'),\n              containerElement: targetContainerX.tagName + (targetContainerX.className ? '.' + targetContainerX.className : ''),\n              containerType: targetContainerX.getAttribute('data-figma-type'),\n              containerId: targetContainerX.getAttribute('data-figma-id'),\n              targetComputedLeft: targetComputedStyle.left\n            });\n          } else {\n            // Fallback to computed values if no instance found\n            finalTargetLeft = parseFloat(targetComputedStyle.left) || 0;\n            console.log('DEBUG: Using computed values fallback:', {\n              targetComputedLeft: targetComputedStyle.left,\n              finalTargetLeft: finalTargetLeft,\n              targetElement: targetElement.getAttribute('data-figma-name') || targetElement.getAttribute('data-figma-id')\n            });\n          }\n          \n          console.log('DEBUG: X Position Analysis:');\n          console.log('  Source has been animated:', sourceHasBeenAnimated);\n          console.log('  Source computed left:', sourceLeft, 'Source Figma X:', sourceFigmaX, 'Transform offset:', sourceTransformOffset, 'Final source left:', finalSourceLeft);\n          console.log('  Target computed left:', targetLeft, 'Target Figma X:', targetFigmaX, 'Final target left:', finalTargetLeft);\n          \n          if (Math.abs(finalSourceLeft - finalTargetLeft) > 1) {\n            changes.positionX.changed = true;\n            changes.positionX.sourceValue = finalSourceLeft;\n            changes.positionX.targetValue = finalTargetLeft;\n            changes.hasChanges = true;\n            console.log('DEBUG: Position X change detected:', finalSourceLeft, '->', finalTargetLeft, '(scaled from Figma coordinates)');\n            console.log('DEBUG: Position X change details:');\n            console.log('  Source element rect:', sourceElement.getBoundingClientRect());\n            console.log('  Target element rect:', targetElement.getBoundingClientRect());\n            console.log('  Source element computed style:', window.getComputedStyle(sourceElement).left);\n            console.log('  Target element computed style:', window.getComputedStyle(targetElement).left);\n          } else {\n            console.log('DEBUG: No X position change detected - difference:', Math.abs(finalSourceLeft - finalTargetLeft));\n          }\n          \n          // Check top position changes - use Figma data attributes for more accurate positioning\n          const sourceTop = parseFloat(sourceStyle.top) || 0;\n          const targetTop = parseFloat(targetStyle.top) || 0;\n          \n          // Get Figma position data for more accurate target positioning\n          const sourceFigmaY = parseFloat(sourceElement.getAttribute('data-figma-y')) || 0;\n          const targetFigmaY = parseFloat(targetElement.getAttribute('data-figma-y')) || 0;\n          \n          // CRITICAL FIX: Check if the source element has a transform applied from a previous animation\n          // If so, we need to account for that in the position calculation\n          let sourceTransformYOffset = 0;\n          if (sourceTransform && sourceTransform !== 'none') {\n            // Extract translateY value from transform matrix\n            const matrix = new DOMMatrix(sourceTransform);\n            sourceTransformYOffset = matrix.m42; // m42 is the translateY value\n            console.log('DEBUG: Source element has transform:', sourceTransform, 'translateY offset:', sourceTransformYOffset);\n          }\n          \n          // Calculate target position by scaling Figma coordinates to actual rendered size\n          let finalTargetTop = 0; // Start with 0, will be calculated below\n          // Always use computed styles for consistency\n          let finalSourceTop = parseFloat(sourceStyle.top) || 0;\n          \n          // Add transform offset if present\n          finalSourceTop += sourceTransformYOffset;\n          \n          // CRITICAL FIX: Scale position from component set dimensions to instance dimensions\n          // The target element is positioned in the component set but needs to be scaled to the instance\n          const targetComputedStyleY = window.getComputedStyle(targetElement);\n          let targetContainerY = targetElement.parentElement;\n          \n          // Walk up the DOM tree to find the nearest INSTANCE container\n          while (targetContainerY && targetContainerY.getAttribute('data-figma-type') !== 'INSTANCE') {\n            targetContainerY = targetContainerY.parentElement;\n          }\n          \n          if (targetContainerY) {\n            const containerRectY = targetContainerY.getBoundingClientRect();\n            const targetElementRectY = targetElement.getBoundingClientRect();\n            \n            // Get the original Figma Y position from the target element\n            const figmaY = parseFloat(targetElement.getAttribute('data-figma-y')) || 0;\n            \n            // Scale factor: instance height / component set height\n            // From JSON: component set height = 214px, instance height = 84px\n            const componentSetHeight = 214;\n            const instanceHeight = containerRectY.height;\n            const scaleFactorY = instanceHeight / componentSetHeight;\n            \n            // Scale the Figma Y position to fit within the instance\n            // Account for the object's height to prevent overflow\n            const objectHeight = targetElementRectY.height;\n            const scaledPositionY = figmaY * scaleFactorY;\n            \n            // Ensure the object doesn't overflow the container\n            finalTargetTop = Math.min(scaledPositionY, instanceHeight - objectHeight);\n            \n            console.log('DEBUG: Y Position calculation with object size:', {\n              figmaY: figmaY,\n              scaleFactorY: scaleFactorY,\n              scaledPositionY: scaledPositionY,\n              objectHeight: objectHeight,\n              instanceHeight: instanceHeight,\n              finalTargetTop: finalTargetTop\n            });\n            \n            console.log('DEBUG: Using scaled INSTANCE-relative position calculation Y:', {\n              targetElementTop: targetElementRectY.top,\n              containerTop: containerRectY.top,\n              containerHeight: containerRectY.height,\n              figmaY: figmaY,\n              componentSetHeight: componentSetHeight,\n              scaleFactorY: scaleFactorY,\n              finalTargetTop: finalTargetTop,\n              targetElement: targetElement.getAttribute('data-figma-name') || targetElement.getAttribute('data-figma-id'),\n              containerElement: targetContainerY.tagName + (targetContainerY.className ? '.' + targetContainerY.className : ''),\n              containerType: targetContainerY.getAttribute('data-figma-type'),\n              containerId: targetContainerY.getAttribute('data-figma-id'),\n              targetComputedTop: targetComputedStyleY.top\n            });\n          } else {\n            // Fallback to computed values if no instance found\n            finalTargetTop = parseFloat(targetComputedStyleY.top) || 0;\n            console.log('DEBUG: Using computed values fallback Y:', {\n              targetComputedTop: targetComputedStyleY.top,\n              finalTargetTop: finalTargetTop,\n              targetElement: targetElement.getAttribute('data-figma-name') || targetElement.getAttribute('data-figma-id')\n            });\n          }\n          \n          console.log('DEBUG: Y Position Analysis:');\n          console.log('  Source computed top:', sourceTop, 'Source Figma Y:', sourceFigmaY, 'Transform offset:', sourceTransformYOffset, 'Final source top:', finalSourceTop);\n          console.log('  Target computed top:', targetTop, 'Target Figma Y:', targetFigmaY, 'Final target top:', finalTargetTop);\n          \n          if (Math.abs(finalSourceTop - finalTargetTop) > 1) {\n            changes.positionY.changed = true;\n            changes.positionY.sourceValue = finalSourceTop;\n            changes.positionY.targetValue = finalTargetTop;\n            changes.hasChanges = true;\n            console.log('DEBUG: Position Y change detected:', finalSourceTop, '->', finalTargetTop, '(scaled from Figma coordinates)');\n          } else {\n            console.log('DEBUG: No Y position change detected - difference:', Math.abs(finalSourceTop - finalTargetTop));\n          }\n\n          // Check style changes - use more specific comparison\n          const sourceBg = sourceStyle.backgroundColor || 'rgba(0, 0, 0, 0)';\n          const targetBg = targetStyle.backgroundColor || 'rgba(0, 0, 0, 0)';\n          \n          if (sourceBg !== targetBg) {\n            changes.backgroundColor.changed = true;\n            changes.backgroundColor.sourceValue = sourceBg;\n            changes.backgroundColor.targetValue = targetBg;\n            changes.hasChanges = true;\n            console.log('DEBUG: Background color change detected:', sourceBg, '->', targetBg);\n          }\n          \n          if (sourceStyle.color !== targetStyle.color) {\n            changes.color.changed = true;\n            changes.color.sourceValue = sourceStyle.color;\n            changes.color.targetValue = targetStyle.color;\n            changes.hasChanges = true;\n            console.log('DEBUG: Color change detected:', sourceStyle.color, '->', targetStyle.color);\n          }\n          \n          if (sourceStyle.justifyContent !== targetStyle.justifyContent) {\n            changes.justifyContent.changed = true;\n            changes.justifyContent.sourceValue = sourceStyle.justifyContent;\n            changes.justifyContent.targetValue = targetStyle.justifyContent;\n            changes.hasChanges = true;\n          }\n          \n          if (sourceStyle.alignItems !== targetStyle.alignItems) {\n            changes.alignItems.changed = true;\n            changes.alignItems.sourceValue = sourceStyle.alignItems;\n            changes.alignItems.targetValue = targetStyle.alignItems;\n            changes.hasChanges = true;\n          }\n        } catch (error) {\n          console.log('DEBUG: Error detecting property changes:', error);\n        }\n\n        return changes;\n      }\n  ";
}


/***/ }),

/***/ 111:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.getAllNodeIds = getAllNodeIds;
exports.findNodeById = findNodeById;
exports.applyOverrides = applyOverrides;
exports.getComponentSetFromInstance = getComponentSetFromInstance;
exports.figmaNodeToObject = figmaNodeToObject;
exports.exportNodeToVerboseJSON = exportNodeToVerboseJSON;
var utils_1 = __webpack_require__(489);
// Node processing functions
function getAllNodeIds(node) {
    var e_1, _a;
    var ids = [node.id];
    if (node.children) {
        try {
            for (var _b = __values(node.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                ids.push.apply(ids, __spreadArray([], __read(getAllNodeIds(child)), false));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    return ids;
}
function findNodeById(node, id) {
    var e_2, _a;
    if (node.id === id)
        return node;
    if (node.children) {
        try {
            for (var _b = __values(node.children), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                var found = findNodeById(child, id);
                if (found)
                    return found;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    return null;
}
function applyOverrides(node, overrideData) {
    // Simple implementation - just return the node
    // In a full implementation, this would apply dynamic overrides
    return node;
}
// Function to get all components from a component set instance
function getComponentSetFromInstance(instance) {
    return __awaiter(this, void 0, void 0, function () {
        var components, mainComponent, componentSet, parent_1, instanceNode, componentSetNode, childComponents_1, variants, componentFromInstance, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    components = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    console.log('Checking instance:', instance.type, instance.name);
                    console.log('Instance properties:', Object.keys(instance));
                    console.log('Instance details:', {
                        id: instance.id,
                        name: instance.name,
                        type: instance.type,
                        hasReactions: !!instance.reactions,
                        hasChildren: !!instance.children,
                        hasComponentProperties: !!instance.componentProperties
                    });
                    if (!(instance.type === 'INSTANCE')) return [3 /*break*/, 5];
                    console.log('Found instance, checking if it has componentProperties...');
                    if (!(instance.componentProperties && instance.componentProperties['Property 1'])) return [3 /*break*/, 3];
                    console.log('Instance has componentProperties:', instance.componentProperties);
                    return [4 /*yield*/, instance.getMainComponentAsync()];
                case 2:
                    mainComponent = _a.sent();
                    console.log('Main component:', mainComponent ? {
                        id: mainComponent.id,
                        name: mainComponent.name,
                        type: mainComponent.type
                    } : 'null');
                    componentSet = null;
                    if (mainComponent && mainComponent.type === 'COMPONENT_SET') {
                        // Direct component set
                        componentSet = mainComponent;
                        console.log('Found direct component set');
                    }
                    else if (mainComponent && mainComponent.type === 'COMPONENT') {
                        // Single component - need to find its parent component set
                        console.log('Main component is a single component, looking for parent component set...');
                        parent_1 = mainComponent.parent;
                        if (parent_1 && parent_1.type === 'COMPONENT_SET') {
                            componentSet = parent_1;
                            console.log('Found parent component set:', {
                                id: componentSet.id,
                                name: componentSet.name,
                                type: componentSet.type
                            });
                        }
                        else {
                            console.log('Parent is not a component set:', parent_1 ? {
                                id: parent_1.id,
                                name: parent_1.name,
                                type: parent_1.type
                            } : 'null');
                        }
                    }
                    if (componentSet && componentSet.type === 'COMPONENT_SET') {
                        console.log('Found component set, creating 1:1 Figma structure...');
                        instanceNode = {
                            id: instance.id,
                            name: instance.name,
                            type: 'INSTANCE',
                            x: instance.x,
                            y: instance.y,
                            width: instance.width,
                            height: instance.height,
                            opacity: instance.opacity,
                            fills: instance.fills,
                            strokes: instance.strokes,
                            strokeWeight: instance.strokeWeight,
                            cornerRadius: instance.cornerRadius,
                            layoutMode: instance.layoutMode,
                            primaryAxisAlignItems: instance.primaryAxisAlignItems,
                            counterAxisAlignItems: instance.counterAxisAlignItems,
                            itemSpacing: instance.itemSpacing,
                            layoutSizingHorizontal: instance.layoutSizingHorizontal,
                            layoutSizingVertical: instance.layoutSizingVertical,
                            paddingLeft: instance.paddingLeft,
                            paddingRight: instance.paddingRight,
                            paddingTop: instance.paddingTop,
                            paddingBottom: instance.paddingBottom,
                            fontSize: instance.fontSize,
                            fontName: instance.fontName,
                            fontFamily: instance.fontFamily,
                            fontWeight: instance.fontWeight,
                            textAlignHorizontal: instance.textAlignHorizontal,
                            letterSpacing: instance.letterSpacing,
                            lineHeight: instance.lineHeight,
                            characters: instance.characters,
                            reactions: instance.reactions,
                            children: instance.children,
                            clipsContent: instance.clipsContent,
                            layoutPositioning: instance.layoutPositioning,
                            componentProperties: instance.componentProperties,
                            mainComponentId: instance.mainComponentId,
                            overrides: instance.overrides
                        };
                        componentSetNode = {
                            id: componentSet.id,
                            name: componentSet.name,
                            type: 'COMPONENT_SET',
                            x: componentSet.x,
                            y: componentSet.y,
                            width: componentSet.width,
                            height: componentSet.height,
                            opacity: componentSet.opacity,
                            fills: componentSet.fills,
                            strokes: componentSet.strokes,
                            strokeWeight: componentSet.strokeWeight,
                            cornerRadius: componentSet.cornerRadius,
                            layoutMode: componentSet.layoutMode,
                            primaryAxisAlignItems: componentSet.primaryAxisAlignItems,
                            counterAxisAlignItems: componentSet.counterAxisAlignItems,
                            itemSpacing: componentSet.itemSpacing,
                            layoutSizingHorizontal: 'FILL', // Force 100% width
                            layoutSizingVertical: 'FILL', // Force 100% height
                            paddingLeft: componentSet.paddingLeft,
                            paddingRight: componentSet.paddingRight,
                            paddingTop: componentSet.paddingTop,
                            paddingBottom: componentSet.paddingBottom,
                            fontSize: componentSet.fontSize,
                            fontName: componentSet.fontName,
                            fontFamily: componentSet.fontFamily,
                            fontWeight: componentSet.fontWeight,
                            textAlignHorizontal: componentSet.textAlignHorizontal,
                            letterSpacing: componentSet.letterSpacing,
                            lineHeight: componentSet.lineHeight,
                            characters: componentSet.characters,
                            reactions: componentSet.reactions,
                            children: componentSet.children,
                            clipsContent: componentSet.clipsContent,
                            layoutPositioning: componentSet.layoutPositioning,
                            componentProperties: componentSet.componentProperties,
                            mainComponentId: componentSet.mainComponentId,
                            overrides: componentSet.overrides
                        };
                        childComponents_1 = [];
                        variants = componentSet.children || [];
                        console.log('Found', variants.length, 'variants in component set');
                        variants.forEach(function (variant, index) {
                            console.log('Processing variant', index, ':', variant.name);
                            var childComponent = {
                                id: variant.id,
                                name: variant.name,
                                type: variant.type,
                                x: variant.x,
                                y: variant.y,
                                width: variant.width,
                                height: variant.height,
                                opacity: variant.opacity,
                                fills: variant.fills,
                                strokes: variant.strokes,
                                strokeWeight: variant.strokeWeight,
                                cornerRadius: variant.cornerRadius,
                                layoutMode: variant.layoutMode,
                                primaryAxisAlignItems: variant.primaryAxisAlignItems,
                                counterAxisAlignItems: variant.counterAxisAlignItems,
                                itemSpacing: variant.itemSpacing,
                                layoutSizingHorizontal: variant.layoutSizingHorizontal,
                                layoutSizingVertical: variant.layoutSizingVertical,
                                paddingLeft: variant.paddingLeft,
                                paddingRight: variant.paddingRight,
                                paddingTop: variant.paddingTop,
                                paddingBottom: variant.paddingBottom,
                                fontSize: variant.fontSize,
                                fontName: variant.fontName,
                                fontFamily: variant.fontFamily,
                                fontWeight: variant.fontWeight,
                                textAlignHorizontal: variant.textAlignHorizontal,
                                letterSpacing: variant.letterSpacing,
                                lineHeight: variant.lineHeight,
                                characters: variant.characters,
                                reactions: variant.reactions,
                                children: variant.children,
                                clipsContent: variant.clipsContent,
                                layoutPositioning: variant.layoutPositioning,
                                componentProperties: variant.componentProperties,
                                mainComponentId: variant.mainComponentId,
                                overrides: variant.overrides
                            };
                            childComponents_1.push(childComponent);
                        });
                        // 4. Set up the proper hierarchy: instance -> component set -> children
                        componentSetNode.children = childComponents_1;
                        instanceNode.children = [componentSetNode];
                        console.log('Created 1:1 Figma structure with proper hierarchy:', {
                            instanceNode: {
                                id: instanceNode.id,
                                name: instanceNode.name,
                                type: instanceNode.type,
                                hasChildren: !!instanceNode.children
                            },
                            componentSetNode: {
                                id: componentSetNode.id,
                                name: componentSetNode.name,
                                type: componentSetNode.type,
                                layoutSizingHorizontal: componentSetNode.layoutSizingHorizontal,
                                layoutSizingVertical: componentSetNode.layoutSizingVertical,
                                hasChildren: !!componentSetNode.children
                            },
                            childComponentsCount: childComponents_1.length
                        });
                        // Return only the instance node (which contains the component set as a child)
                        components.push(instanceNode);
                    }
                    else {
                        console.log('Could not find component set, falling back to instance processing');
                        componentFromInstance = {
                            // Copy all the essential properties explicitly
                            id: instance.id,
                            name: instance.name,
                            type: instance.type,
                            x: instance.x,
                            y: instance.y,
                            width: instance.width,
                            height: instance.height,
                            opacity: instance.opacity,
                            fills: instance.fills,
                            strokes: instance.strokes,
                            strokeWeight: instance.strokeWeight,
                            cornerRadius: instance.cornerRadius,
                            layoutMode: instance.layoutMode,
                            primaryAxisAlignItems: instance.primaryAxisAlignItems,
                            counterAxisAlignItems: instance.counterAxisAlignItems,
                            itemSpacing: instance.itemSpacing,
                            layoutSizingHorizontal: instance.layoutSizingHorizontal,
                            layoutSizingVertical: instance.layoutSizingVertical,
                            paddingLeft: instance.paddingLeft,
                            paddingRight: instance.paddingRight,
                            paddingTop: instance.paddingTop,
                            paddingBottom: instance.paddingBottom,
                            fontSize: instance.fontSize,
                            fontName: instance.fontName,
                            fontFamily: instance.fontFamily,
                            fontWeight: instance.fontWeight,
                            textAlignHorizontal: instance.textAlignHorizontal,
                            letterSpacing: instance.letterSpacing,
                            lineHeight: instance.lineHeight,
                            characters: instance.characters,
                            reactions: instance.reactions,
                            children: instance.children,
                            clipsContent: instance.clipsContent,
                            layoutPositioning: instance.layoutPositioning,
                            componentProperties: instance.componentProperties,
                            mainComponentId: instance.mainComponentId,
                            overrides: instance.overrides
                        };
                        console.log('Created component from instance with properties:', {
                            id: componentFromInstance.id,
                            name: componentFromInstance.name,
                            type: componentFromInstance.type,
                            hasReactions: !!componentFromInstance.reactions,
                            hasChildren: !!componentFromInstance.children
                        });
                        components.push(componentFromInstance);
                        console.log('Created component from instance with variant:', componentFromInstance.componentProperties);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    console.log('Instance does not have componentProperties, treating as regular instance');
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    console.log('Not an instance, type is:', instance.type);
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.warn('Error getting component set from instance:', error_1);
                    return [3 /*break*/, 8];
                case 8:
                    console.log('Returning', components.length, 'components');
                    return [2 /*return*/, components];
            }
        });
    });
}
function figmaNodeToObject(node) {
    var e_3, _a;
    console.log('figmaNodeToObject called for node:', {
        type: node === null || node === void 0 ? void 0 : node.type,
        name: node === null || node === void 0 ? void 0 : node.name,
        id: node === null || node === void 0 ? void 0 : node.id,
        hasReactions: !!(node === null || node === void 0 ? void 0 : node.reactions),
        hasChildren: !!(node === null || node === void 0 ? void 0 : node.children),
        hasComponentProperties: !!(node === null || node === void 0 ? void 0 : node.componentProperties)
    });
    var commonProps = [
        'id', 'name', 'type', 'x', 'y', 'width', 'height', 'opacity',
        'fills', 'strokes', 'strokeWeight', 'cornerRadius', 'layoutMode',
        'primaryAxisAlignItems', 'counterAxisAlignItems', 'itemSpacing',
        'layoutSizingHorizontal', 'layoutSizingVertical', 'paddingLeft',
        'paddingRight', 'paddingTop', 'paddingBottom', 'fontSize',
        'fontName', 'fontFamily', 'fontWeight', 'textAlignHorizontal',
        'letterSpacing', 'lineHeight', 'characters', 'variantProperties',
        'reactions', 'children', 'clipsContent', 'layoutPositioning',
        // Add vector-specific properties
        'vectorPaths', 'effects',
        // Add instance-specific properties
        'componentProperties', 'mainComponentId', 'overrides'
    ];
    var result = {};
    try {
        // Copy all properties that exist on the node
        for (var commonProps_1 = __values(commonProps), commonProps_1_1 = commonProps_1.next(); !commonProps_1_1.done; commonProps_1_1 = commonProps_1.next()) {
            var prop = commonProps_1_1.value;
            if ((0, utils_1.safeHasProperty)(node, prop)) {
                result[prop] = node[prop];
                console.log("Copied property ".concat(prop, ":"), node[prop]);
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (commonProps_1_1 && !commonProps_1_1.done && (_a = commonProps_1.return)) _a.call(commonProps_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    // For instances, also copy any additional properties that might be needed
    if (node.type === 'INSTANCE') {
        console.log('Processing INSTANCE node, available properties:', Object.keys(node));
        // Copy all enumerable properties from the instance
        for (var key in node) {
            if (node.hasOwnProperty(key) && !result.hasOwnProperty(key)) {
                try {
                    // Only copy serializable properties
                    if (typeof node[key] !== 'function') {
                        result[key] = node[key];
                        console.log("Copied additional property ".concat(key, ":"), node[key]);
                    }
                }
                catch (error) {
                    // Skip properties that can't be serialized
                    console.log("Skipping non-serializable property: ".concat(key));
                }
            }
        }
    }
    console.log('figmaNodeToObject result keys:', Object.keys(result));
    return result;
}
function exportNodeToVerboseJSON(node_1) {
    return __awaiter(this, arguments, void 0, function (node, parentId) {
        var componentSetComponents, componentExports, baseNodeData, nodeData, _a, _b;
        var _c;
        var _this = this;
        if (parentId === void 0) { parentId = null; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, getComponentSetFromInstance(node)];
                case 1:
                    componentSetComponents = _d.sent();
                    if (!(componentSetComponents.length > 0)) return [3 /*break*/, 3];
                    console.log("Exporting component set with ".concat(componentSetComponents.length, " components"));
                    return [4 /*yield*/, Promise.all(componentSetComponents.map(function (component) { return __awaiter(_this, void 0, void 0, function () {
                            var baseNodeData, _a, _b;
                            var _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        baseNodeData = figmaNodeToObject(component);
                                        _a = [__assign({}, baseNodeData)];
                                        _c = { parentId: parentId };
                                        if (!component.children) return [3 /*break*/, 2];
                                        return [4 /*yield*/, Promise.all(component.children.map(function (child) { return exportNodeToVerboseJSON(child, component.id); }))];
                                    case 1:
                                        _b = _d.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        _b = [];
                                        _d.label = 3;
                                    case 3: return [2 /*return*/, __assign.apply(void 0, _a.concat([(_c.children = _b, _c)]))];
                                }
                            });
                        }); }))];
                case 2:
                    componentExports = _d.sent();
                    return [2 /*return*/, componentExports];
                case 3:
                    baseNodeData = figmaNodeToObject(node);
                    _a = [__assign({}, baseNodeData)];
                    _c = { parentId: parentId };
                    if (!node.children) return [3 /*break*/, 5];
                    return [4 /*yield*/, Promise.all(node.children.map(function (child) { return exportNodeToVerboseJSON(child, node.id); }))];
                case 4:
                    _b = _d.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _b = [];
                    _d.label = 6;
                case 6:
                    nodeData = __assign.apply(void 0, _a.concat([(_c.children = _b, _c)]));
                    return [2 /*return*/, nodeData];
            }
        });
    });
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

/***/ 128:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.computeNodeStyles = void 0;
// Re-export the main style computation function from the new modular structure
var style_computer_1 = __webpack_require__(927);
Object.defineProperty(exports, "computeNodeStyles", ({ enumerable: true, get: function () { return style_computer_1.computeNodeStyles; } }));


/***/ }),

/***/ 137:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
exports.buildComponentSetHTMLAsync = buildComponentSetHTMLAsync;
var styles_1 = __webpack_require__(128);
var events_1 = __webpack_require__(995);
var nodes_1 = __webpack_require__(111);
var svg_1 = __webpack_require__(284);
var image_converter_1 = __webpack_require__(752);
var node_attributes_1 = __webpack_require__(514);
var node_content_1 = __webpack_require__(478);
var utils_1 = __webpack_require__(489);
function buildComponentSetHTMLAsync(node_1) {
    return __awaiter(this, arguments, void 0, function (node, overrideData, parentNode) {
        var componentSetComponents, componentHTMLs;
        var _this = this;
        if (overrideData === void 0) { overrideData = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, nodes_1.getComponentSetFromInstance)(node)];
                case 1:
                    componentSetComponents = _a.sent();
                    if (!(componentSetComponents.length > 0)) return [3 /*break*/, 3];
                    console.log("Building HTML for component set with ".concat(componentSetComponents.length, " components"));
                    return [4 /*yield*/, Promise.all(componentSetComponents.map(function (component, index) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        console.log("Processing component ".concat(index, ":"), {
                                            id: component.id,
                                            name: component.name,
                                            type: component.type
                                        });
                                        return [4 /*yield*/, processNodeDirectly(component, overrideData, parentNode)];
                                    case 1: 
                                    // Process each component normally - they're already in the correct structure
                                    return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); }))];
                case 2:
                    componentHTMLs = _a.sent();
                    // Return all components in their proper order
                    return [2 /*return*/, componentHTMLs.join('\n')];
                case 3: return [4 /*yield*/, processNodeDirectly(node, overrideData, parentNode)];
                case 4: 
                // Process the node directly
                return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// Helper function to process a node directly without checking for component sets
function processNodeDirectly(node_1) {
    return __awaiter(this, arguments, void 0, function (node, overrideData, parentNode) {
        var processedNode, svg, width, height, computedStyles, attributes, reactionAttributes, variantAttributes, allAttributes, styleString, content, childrenHTML, childrenWithMargins, tagName, openTag, closeTag;
        var _this = this;
        if (overrideData === void 0) { overrideData = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    processedNode = (0, nodes_1.applyOverrides)(node, overrideData);
                    if (!(processedNode.type === 'VECTOR')) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, svg_1.convertVectorToSVG)(processedNode)];
                case 1:
                    svg = _a.sent();
                    width = (0, utils_1.safeToString)(processedNode.width || 0);
                    height = (0, utils_1.safeToString)(processedNode.height || 0);
                    return [2 /*return*/, "<svg width=\"".concat(width, "\" height=\"").concat(height, "\" viewBox=\"0 0 ").concat(width, " ").concat(height, "\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">").concat(svg, "</svg>")];
                case 2:
                    if (!(processedNode.type === 'IMAGE' ||
                        (processedNode.type === 'RECTANGLE' && processedNode.fills &&
                            Array.isArray(processedNode.fills) &&
                            processedNode.fills.some(function (fill) { return fill.type === 'IMAGE'; })))) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, image_converter_1.convertImageToHTML)(processedNode)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    if (processedNode.type === 'RECTANGLE') {
                        return [2 /*return*/, (0, svg_1.convertRectangleToSVG)(processedNode)];
                    }
                    if (processedNode.type === 'ELLIPSE') {
                        return [2 /*return*/, (0, svg_1.convertEllipseToSVG)(processedNode)];
                    }
                    computedStyles = (0, styles_1.computeNodeStyles)(processedNode, parentNode);
                    attributes = (0, node_attributes_1.generateNodeAttributes)(processedNode, overrideData);
                    reactionAttributes = (0, events_1.generateReactionAttributes)(processedNode);
                    variantAttributes = (0, events_1.generateVariantAttributes)(processedNode, parentNode);
                    allAttributes = __spreadArray(__spreadArray(__spreadArray([], __read(attributes), false), __read(Object.entries(reactionAttributes).map(function (_a) {
                        var _b = __read(_a, 2), key = _b[0], value = _b[1];
                        return "".concat(key, "=\"").concat(value, "\"");
                    })), false), __read(Object.entries(variantAttributes).map(function (_a) {
                        var _b = __read(_a, 2), key = _b[0], value = _b[1];
                        return "".concat(key, "=\"").concat(value, "\"");
                    })), false);
                    // Convert styles to CSS string
                    console.log("[DEBUG] Computed styles for node ".concat(processedNode.name, ":"), computedStyles);
                    styleString = Object.entries(computedStyles)
                        .filter(function (_a) {
                        var _b = __read(_a, 2), property = _b[0], value = _b[1];
                        return value !== undefined && value !== null && value !== '';
                    })
                        .map(function (_a) {
                        var _b = __read(_a, 2), property = _b[0], value = _b[1];
                        return "".concat(property, ": ").concat(value);
                    })
                        .join('; ');
                    console.log("[DEBUG] Style string for node ".concat(processedNode.name, ":"), styleString);
                    content = (0, node_content_1.generateNodeContent)(processedNode);
                    childrenHTML = '';
                    if (!(processedNode.children && processedNode.children.length > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, Promise.all(processedNode.children.map(function (child, index) { return __awaiter(_this, void 0, void 0, function () {
                            var childHTML, negativeMargin, isVertical, isHorizontal, isFirst, isLast, marginStyles;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, buildComponentSetHTMLAsync(child, overrideData, processedNode)];
                                    case 1:
                                        childHTML = _b.sent();
                                        // Handle negative margins for negative gap values
                                        if (processedNode.itemSpacing !== undefined && processedNode.itemSpacing < 0) {
                                            negativeMargin = processedNode.itemSpacing / 2;
                                            isVertical = processedNode.layoutMode === 'VERTICAL';
                                            isHorizontal = processedNode.layoutMode === 'HORIZONTAL';
                                            if (isVertical || isHorizontal) {
                                                isFirst = index === 0;
                                                isLast = index === (((_a = processedNode.children) === null || _a === void 0 ? void 0 : _a.length) || 0) - 1;
                                                marginStyles = '';
                                                if (isVertical) {
                                                    // Vertical layout: apply margin-top to all except first, margin-bottom to all except last
                                                    if (!isFirst) {
                                                        marginStyles += "margin-top: ".concat(negativeMargin, "px; ");
                                                    }
                                                    if (!isLast) {
                                                        marginStyles += "margin-bottom: ".concat(negativeMargin, "px; ");
                                                    }
                                                }
                                                else if (isHorizontal) {
                                                    // Horizontal layout: apply margin-left to all except first, margin-right to all except last
                                                    if (!isFirst) {
                                                        marginStyles += "margin-left: ".concat(negativeMargin, "px; ");
                                                    }
                                                    if (!isLast) {
                                                        marginStyles += "margin-right: ".concat(negativeMargin, "px; ");
                                                    }
                                                }
                                                // Add margins to the child's style
                                                if (marginStyles) {
                                                    childHTML = childHTML.replace(/style="([^"]*)"/, "style=\"$1; ".concat(marginStyles.trim(), "\""));
                                                }
                                            }
                                        }
                                        return [2 /*return*/, childHTML];
                                }
                            });
                        }); }))];
                case 5:
                    childrenWithMargins = _a.sent();
                    childrenHTML = childrenWithMargins.join('\n');
                    _a.label = 6;
                case 6:
                    tagName = (0, node_attributes_1.getTagName)(processedNode);
                    openTag = "<".concat(tagName, " ").concat(allAttributes.join(' '), " style=\"").concat(styleString, "\">");
                    closeTag = "</".concat(tagName, ">");
                    return [2 /*return*/, "".concat(openTag).concat(content).concat(childrenHTML).concat(closeTag)];
            }
        });
    });
}


/***/ }),

/***/ 172:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createComponentSetInitializer = exports.createSmartAnimateHandler = exports.createPropertyDetector = exports.createTimeoutHandler = exports.createReactionHandler = exports.createVariantSwitchingHandler = exports.generateVariantAttributes = exports.generateReactionAttributes = void 0;
exports.generateEventHandlingJavaScript = generateEventHandlingJavaScript;
// Re-export all event functions
var attributes_1 = __webpack_require__(275);
Object.defineProperty(exports, "generateReactionAttributes", ({ enumerable: true, get: function () { return attributes_1.generateReactionAttributes; } }));
Object.defineProperty(exports, "generateVariantAttributes", ({ enumerable: true, get: function () { return attributes_1.generateVariantAttributes; } }));
var variant_handler_1 = __webpack_require__(120);
Object.defineProperty(exports, "createVariantSwitchingHandler", ({ enumerable: true, get: function () { return variant_handler_1.createVariantSwitchingHandler; } }));
var reaction_handler_1 = __webpack_require__(332);
Object.defineProperty(exports, "createReactionHandler", ({ enumerable: true, get: function () { return reaction_handler_1.createReactionHandler; } }));
Object.defineProperty(exports, "createTimeoutHandler", ({ enumerable: true, get: function () { return reaction_handler_1.createTimeoutHandler; } }));
var property_detector_1 = __webpack_require__(82);
Object.defineProperty(exports, "createPropertyDetector", ({ enumerable: true, get: function () { return property_detector_1.createPropertyDetector; } }));
var transition_handler_1 = __webpack_require__(920);
Object.defineProperty(exports, "createSmartAnimateHandler", ({ enumerable: true, get: function () { return transition_handler_1.createSmartAnimateHandler; } }));
var initializer_1 = __webpack_require__(44);
Object.defineProperty(exports, "createComponentSetInitializer", ({ enumerable: true, get: function () { return initializer_1.createComponentSetInitializer; } }));
// Import all handler functions for use in the main generator
var variant_handler_2 = __webpack_require__(120);
var reaction_handler_2 = __webpack_require__(332);
var property_detector_2 = __webpack_require__(82);
var transition_handler_2 = __webpack_require__(920);
var initializer_2 = __webpack_require__(44);
// Main event handling JavaScript generator
function generateEventHandlingJavaScript() {
    return "\n    // Event handling for interactive elements\n    console.log('DEBUG: Event handling JavaScript loaded');\n    document.addEventListener('DOMContentLoaded', function() {\n      console.log('DEBUG: DOMContentLoaded event fired');\n      ".concat((0, variant_handler_2.createVariantSwitchingHandler)(), "\n      ").concat((0, reaction_handler_2.createReactionHandler)(), "\n      ").concat((0, reaction_handler_2.createTimeoutHandler)(), "\n      ").concat((0, property_detector_2.createPropertyDetector)(), "\n      ").concat((0, transition_handler_2.createSmartAnimateHandler)(), "\n      ").concat((0, initializer_2.createComponentSetInitializer)(), "\n      console.log('DEBUG: All event handlers initialized');\n    });\n    \n    // Also run immediately if DOM is already loaded\n    if (document.readyState === 'loading') {\n      console.log('DEBUG: DOM still loading, waiting for DOMContentLoaded');\n    } else {\n      console.log('DEBUG: DOM already loaded, running handlers immediately');\n      ").concat((0, variant_handler_2.createVariantSwitchingHandler)(), "\n      ").concat((0, reaction_handler_2.createReactionHandler)(), "\n      ").concat((0, reaction_handler_2.createTimeoutHandler)(), "\n      ").concat((0, property_detector_2.createPropertyDetector)(), "\n      ").concat((0, transition_handler_2.createSmartAnimateHandler)(), "\n      ").concat((0, initializer_2.createComponentSetInitializer)(), "\n      console.log('DEBUG: All event handlers initialized (immediate)');\n    }\n  ");
}


/***/ }),

/***/ 195:
/***/ (function(__unused_webpack_module, exports) {


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
exports.convertGradientToCSS = convertGradientToCSS;
// Convert Figma gradient to CSS gradient
function convertGradientToCSS(gradient, nodeOpacity) {
    if (!gradient.gradientStops || !Array.isArray(gradient.gradientStops)) {
        return '';
    }
    // Convert gradient stops to CSS format
    var stops = gradient.gradientStops.map(function (stop) {
        var _a = stop.color, r = _a.r, g = _a.g, b = _a.b, _b = _a.a, a = _b === void 0 ? 1 : _b;
        var stopOpacity = stop.opacity !== undefined ? stop.opacity : 1;
        var finalAlpha = a * stopOpacity * nodeOpacity;
        var color = "rgba(".concat(Math.round(r * 255), ", ").concat(Math.round(g * 255), ", ").concat(Math.round(b * 255), ", ").concat(finalAlpha, ")");
        // Convert Figma position (0-1) to CSS percentage (0-100)
        var position = stop.position;
        if (typeof position === 'number') {
            // Figma uses 0-1 range, CSS uses 0-100%
            position = Math.max(0, Math.min(100, position * 100));
            position = position.toFixed(2);
        }
        else {
            position = '0';
        }
        return "".concat(color, " ").concat(position, "%");
    }).join(', ');
    if (gradient.type === 'GRADIENT_LINEAR') {
        // Handle linear gradient direction using gradientTransform matrix
        var direction = 'to right'; // default
        if (gradient.gradientTransform) {
            // Parse gradient transform matrix for linear gradients
            var transform = gradient.gradientTransform;
            if (transform && Array.isArray(transform) && transform.length >= 2) {
                // gradientTransform is a 2x3 matrix: [[a, b, c], [d, e, f]]
                // where a, d control x-direction scaling/shearing
                // and b, e control y-direction scaling/shearing
                var _a = __read(transform[0], 3), a = _a[0], b = _a[1], c = _a[2];
                var _b = __read(transform[1], 3), d = _b[0], e = _b[1], f = _b[2];
                // Calculate the angle from the transformation matrix
                // The angle is determined by the direction vector [a, d]
                if (Math.abs(a) > 0.001 || Math.abs(d) > 0.001) {
                    // Calculate angle from the transformation matrix
                    // Subtract 270 degrees to correct the rotation offset
                    var angle = Math.atan2(d, a) * 180 / Math.PI - 270;
                    direction = "".concat(angle, "deg");
                }
            }
        }
        return "linear-gradient(".concat(direction, ", ").concat(stops, ")");
    }
    else if (gradient.type === 'GRADIENT_RADIAL') {
        // Handle radial gradient using gradientTransform matrix
        var shape = 'circle';
        var size = 'farthest-corner';
        var position = 'center';
        if (gradient.gradientTransform) {
            // Parse gradient transform matrix for radial gradients
            var transform = gradient.gradientTransform;
            if (transform && Array.isArray(transform) && transform.length >= 2) {
                // gradientTransform is a 2x3 matrix: [[a, b, c], [d, e, f]]
                // where c, f control translation (center position)
                // and a, d, b, e control scaling and rotation
                var _c = __read(transform[0], 3), a = _c[0], b = _c[1], c = _c[2];
                var _d = __read(transform[1], 3), d = _d[0], e = _d[1], f = _d[2];
                // Convert translation values (c, f) to CSS percentages
                var centerXPercent = Math.max(0, Math.min(100, c * 100));
                var centerYPercent = Math.max(0, Math.min(100, f * 100));
                // Use center if position is very small (near 0)
                if (Math.abs(centerXPercent) < 0.1 && Math.abs(centerYPercent) < 0.1) {
                    position = 'center';
                }
                else {
                    position = "".concat(centerXPercent.toFixed(2), "% ").concat(centerYPercent.toFixed(2), "%");
                }
                // Calculate radius from the transformation matrix
                // The radius is determined by the scaling factors
                var scaleX = Math.sqrt(a * a + d * d);
                var scaleY = Math.sqrt(b * b + e * e);
                var radius = Math.max(scaleX, scaleY);
                // Map radius to CSS size keywords
                if (radius > 0 && radius < 0.5) {
                    size = 'closest-side';
                }
                else if (radius > 0.5 && radius < 1) {
                    size = 'farthest-side';
                }
                else if (radius > 1 && radius < 1.5) {
                    size = 'closest-corner';
                }
                else {
                    size = 'farthest-corner'; // Default size
                }
            }
        }
        return "radial-gradient(".concat(shape, " ").concat(size, " at ").concat(position, ", ").concat(stops, ")");
    }
    return '';
}


/***/ }),

/***/ 232:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.computeTextStyles = computeTextStyles;
// Text-specific styles computation
function computeTextStyles(node, nodeOpacity) {
    var textStyles = {};
    if (node.type === 'TEXT') {
        if (node.fontSize) {
            textStyles['font-size'] = "".concat(node.fontSize, "px");
        }
        // Font family - use fontName like the original project
        if (node.fontName && node.fontName) {
            if (typeof node.fontName === 'object' && node.fontName.family) {
                var figmaFamily = String(node.fontName.family);
                console.log("[DEBUG] Font family from fontName: ".concat(figmaFamily));
                // Use exact Figma font names - no substitutions
                textStyles['font-family'] = "".concat(figmaFamily, ", sans-serif");
            }
        }
        else if (node.fontFamily) {
            console.log("[DEBUG] Font family from fontFamily: ".concat(node.fontFamily));
            textStyles['font-family'] = "".concat(node.fontFamily);
        }
        else {
            console.log("[DEBUG] No font family found for node: ".concat(node.name));
            console.log("[DEBUG] Node fontName:", node.fontName);
            console.log("[DEBUG] Node fontFamily:", node.fontFamily);
            // Default to CircularXX TT for testing
            textStyles['font-family'] = "CircularXX TT, sans-serif";
        }
        // Font weight - use fontName style like the original project
        if (node.fontName && node.fontName) {
            if (typeof node.fontName === 'object' && node.fontName.style) {
                var figmaStyle = String(node.fontName.style);
                // Convert Figma font style to CSS font weight
                var cssWeight = figmaStyle;
                if (typeof figmaStyle === 'string') {
                    if (figmaStyle.includes('Bold'))
                        cssWeight = '700';
                    else if (figmaStyle.includes('Medium'))
                        cssWeight = '500';
                    else if (figmaStyle.includes('Light'))
                        cssWeight = '300';
                    else if (figmaStyle.includes('Thin'))
                        cssWeight = '100';
                    else
                        cssWeight = '400'; // Regular/Book
                }
                textStyles['font-weight'] = cssWeight;
            }
        }
        else if (node.fontWeight) {
            textStyles['font-weight'] = String(node.fontWeight);
        }
        if (node.textAlignHorizontal) {
            textStyles['text-align'] = node.textAlignHorizontal.toLowerCase();
        }
        if (node.letterSpacing) {
            if (typeof node.letterSpacing === 'object' && node.letterSpacing.value) {
                var unit = node.letterSpacing.unit === 'PERCENT' ? '%' : 'px';
                textStyles['letter-spacing'] = "".concat(node.letterSpacing.value).concat(unit);
            }
            else if (typeof node.letterSpacing === 'number') {
                textStyles['letter-spacing'] = "".concat(node.letterSpacing, "px");
            }
        }
        if (node.lineHeight) {
            // Handle object with value and unit
            if (typeof node.lineHeight === 'object' && node.lineHeight.value) {
                if (node.lineHeight.unit === 'AUTO' || node.lineHeight.unit === 'Auto' || node.lineHeight.unit === 'auto') {
                    textStyles['line-height'] = '100%';
                }
                else {
                    var value = node.lineHeight.value;
                    // Figma line height is always percentage, convert to CSS percentage
                    textStyles['line-height'] = "".concat(value, "%");
                }
            }
            // Handle number (assume percentage)
            else if (typeof node.lineHeight === 'number') {
                textStyles['line-height'] = "".concat(node.lineHeight, "%");
            }
            // Handle string "auto" values
            else if (typeof node.lineHeight === 'string' && (node.lineHeight === 'AUTO' || node.lineHeight === 'Auto' || node.lineHeight === 'auto')) {
                textStyles['line-height'] = '100%';
            }
            // Default to 100% if no valid line height
            else {
                textStyles['line-height'] = '100%';
            }
        }
    }
    return textStyles;
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
                    // Check if this is a bouncy animation based on easing type
                    var transitionType = actionToUse.transition.type;
                    if (actionToUse.transition.easing && actionToUse.transition.easing.type) {
                        var easingType = actionToUse.transition.easing.type;
                        // Map Figma easing types to our transition types
                        if (easingType === 'EASE_IN_AND_OUT_BACK' || easingType === 'BOUNCY') {
                            transitionType = 'BOUNCY';
                        }
                        else {
                            // For other easing types, preserve the original easing type
                            transitionType = easingType;
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

/***/ 282:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.computeFillStyles = computeFillStyles;
var gradient_converter_1 = __webpack_require__(195);
// Fill and background styles computation
function computeFillStyles(node, nodeOpacity) {
    var fillStyles = {};
    // --- FILLS ---
    if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
        var fill = node.fills[0];
        if (fill.type === 'SOLID' && fill.color) {
            var _a = fill.color, r = _a.r, g = _a.g, b = _a.b, _b = _a.a, a = _b === void 0 ? 1 : _b;
            // Combine color alpha with fill opacity and node appearance opacity
            var fillOpacity = fill.opacity !== undefined ? fill.opacity : 1;
            var finalAlpha = a * fillOpacity * nodeOpacity;
            var rgba = "rgba(".concat(Math.round(r * 255), ", ").concat(Math.round(g * 255), ", ").concat(Math.round(b * 255), ", ").concat(finalAlpha, ")");
            if (node.type === 'TEXT') {
                fillStyles.color = rgba;
            }
            else {
                fillStyles['background-color'] = rgba;
            }
        }
        else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL') {
            // Handle gradients
            var gradientCSS = (0, gradient_converter_1.convertGradientToCSS)(fill, nodeOpacity);
            if (gradientCSS) {
                if (node.type === 'TEXT') {
                    fillStyles.color = gradientCSS;
                }
                else {
                    fillStyles['background-image'] = gradientCSS;
                }
            }
        }
    }
    return fillStyles;
}


/***/ }),

/***/ 284:
/***/ (function(__unused_webpack_module, exports) {


// SVG conversion utilities - matches figma-to-tedium approach
// This module provides utilities for converting Figma vector nodes to SVG
// but is not used in the main HTML generation (which only handles TEXT nodes)
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.base64Encode = base64Encode;
exports.colorToRGBA = colorToRGBA;
exports.encodeSVGToBase64 = encodeSVGToBase64;
exports.convertVectorToSVG = convertVectorToSVG;
exports.convertRectangleToSVG = convertRectangleToSVG;
exports.convertEllipseToSVG = convertEllipseToSVG;
function base64Encode(str) {
    if (typeof btoa !== 'undefined') {
        return btoa(str);
    }
    // Fallback for environments without btoa (Figma plugin environment)
    var utf8 = unescape(encodeURIComponent(str));
    var result = '';
    var i = 0;
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    while (i < utf8.length) {
        var c1 = utf8.charCodeAt(i++);
        var c2 = utf8.charCodeAt(i++);
        var c3 = utf8.charCodeAt(i++);
        var e1 = c1 >> 2;
        var e2 = ((c1 & 3) << 4) | (c2 >> 4);
        var e3 = isNaN(c2) ? 64 : (((c2 & 15) << 2) | (c3 >> 6));
        var e4 = isNaN(c3) ? 64 : (c3 & 63);
        result += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
    }
    return result;
}
function base64Decode(str) {
    if (typeof atob !== 'undefined') {
        return atob(str);
    }
    // Fallback for environments without atob (Figma plugin environment)
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var result = '';
    var i = 0;
    // Remove any padding
    str = str.replace(/=+$/, '');
    while (i < str.length) {
        var e1 = chars.indexOf(str.charAt(i++));
        var e2 = chars.indexOf(str.charAt(i++));
        var e3 = chars.indexOf(str.charAt(i++));
        var e4 = chars.indexOf(str.charAt(i++));
        var c1 = (e1 << 2) | (e2 >> 4);
        var c2 = ((e2 & 15) << 4) | (e3 >> 2);
        var c3 = ((e3 & 3) << 6) | e4;
        result += String.fromCharCode(c1);
        if (e3 !== 64)
            result += String.fromCharCode(c2);
        if (e4 !== 64)
            result += String.fromCharCode(c3);
    }
    return result;
}
function colorToRGBA(color, opacity) {
    var _a;
    if (opacity === void 0) { opacity = 1; }
    var r = Math.round(color.r * 255);
    var g = Math.round(color.g * 255);
    var b = Math.round(color.b * 255);
    var a = ((_a = color.a) !== null && _a !== void 0 ? _a : 1) * opacity;
    return "rgba(".concat(r, ", ").concat(g, ", ").concat(b, ", ").concat(a, ")");
}
function getVectorStyles(vector) {
    var styles = {
        fills: [],
        strokes: [],
        strokeWeight: vector.strokeWeight || 0,
        gradients: []
    };
    // Process fills
    if (vector.fills && Array.isArray(vector.fills)) {
        styles.fills = vector.fills.map(function (fill, fillIndex) {
            var _a;
            if (fill.type === 'SOLID') {
                var color = fill.color;
                var opacity = (_a = fill.opacity) !== null && _a !== void 0 ? _a : 1;
                var r = Math.round(color.r * 255);
                var g = Math.round(color.g * 255);
                var b = Math.round(color.b * 255);
                return "rgba(".concat(r, ", ").concat(g, ", ").concat(b, ", ").concat(opacity, ")");
            }
            else if (fill.type === 'GRADIENT_LINEAR' || fill.type === 'GRADIENT_RADIAL') {
                var gradientId = "gradient-".concat(vector.id, "-").concat(fillIndex);
                styles.gradients.push({
                    id: gradientId,
                    type: fill.type,
                    fill: fill
                });
                return "url(#".concat(gradientId, ")");
            }
            return 'none';
        });
    }
    // Process strokes
    if (vector.strokes && Array.isArray(vector.strokes)) {
        styles.strokes = vector.strokes.map(function (stroke) {
            var _a;
            if (stroke.type === 'SOLID') {
                var color = stroke.color;
                var opacity = (_a = stroke.opacity) !== null && _a !== void 0 ? _a : 1;
                var r = Math.round(color.r * 255);
                var g = Math.round(color.g * 255);
                var b = Math.round(color.b * 255);
                return "rgba(".concat(r, ", ").concat(g, ", ").concat(b, ", ").concat(opacity, ")");
            }
            return 'none';
        });
    }
    return styles;
}
function createSVGGradientDefinitions(gradients) {
    if (gradients.length === 0)
        return '';
    var defs = gradients.map(function (gradient) {
        var id = gradient.id, type = gradient.type, fill = gradient.fill;
        if (type === 'GRADIENT_LINEAR') {
            var stops = fill.gradientStops.map(function (stop) {
                var color = colorToRGBA(stop.color, stop.opacity);
                return "<stop offset=\"".concat(stop.position, "%\" stop-color=\"").concat(color, "\" />");
            }).join('');
            return "<linearGradient id=\"".concat(id, "\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">").concat(stops, "</linearGradient>");
        }
        else if (type === 'GRADIENT_RADIAL') {
            var stops = fill.gradientStops.map(function (stop) {
                var color = colorToRGBA(stop.color, stop.opacity);
                return "<stop offset=\"".concat(stop.position, "%\" stop-color=\"").concat(color, "\" />");
            }).join('');
            return "<radialGradient id=\"".concat(id, "\" cx=\"50%\" cy=\"50%\" r=\"50%\">").concat(stops, "</radialGradient>");
        }
        return '';
    }).join('');
    return defs ? "<defs>".concat(defs, "</defs>") : '';
}
function encodeSVGToBase64(svg) {
    return base64Encode(svg);
}
function convertVectorToSVG(node) {
    return __awaiter(this, void 0, void 0, function () {
        var width, height, styles, blurFilterDef, blurFilterRef, blur_1, filterId, paths, gradientDefs, wrappedPaths;
        var _a, _b;
        return __generator(this, function (_c) {
            console.log('DEBUG: Converting vector to SVG:', {
                nodeId: node.id,
                nodeName: node.name,
                nodeType: node.type,
                hasVectorPaths: !!node.vectorPaths,
                vectorPathsLength: ((_a = node.vectorPaths) === null || _a === void 0 ? void 0 : _a.length) || 0,
                hasFills: !!node.fills,
                fillsLength: ((_b = node.fills) === null || _b === void 0 ? void 0 : _b.length) || 0,
                hasBounds: !!node.absoluteRenderBounds,
                hasWidth: !!node.width,
                hasHeight: !!node.height,
                availableProperties: Object.keys(node).filter(function (key) { return !key.startsWith('_'); })
            });
            width = node.width || (node.absoluteRenderBounds ? node.absoluteRenderBounds.width : 0);
            height = node.height || (node.absoluteRenderBounds ? node.absoluteRenderBounds.height : 0);
            if (!width || !height) {
                console.warn('No valid dimensions found for vector node:', {
                    nodeId: node.id,
                    nodeName: node.name,
                    width: node.width,
                    height: node.height,
                    bounds: node.absoluteRenderBounds
                });
                return [2 /*return*/, ''];
            }
            styles = getVectorStyles(node);
            blurFilterDef = '';
            blurFilterRef = '';
            if (node.effects && Array.isArray(node.effects)) {
                blur_1 = node.effects.find(function (effect) { return effect.type === 'LAYER_BLUR' || effect.type === 'BACKGROUND_BLUR'; });
                if (blur_1) {
                    filterId = "blur-".concat(node.id);
                    blurFilterDef = "<filter id=\"".concat(filterId, "\">\n    <feGaussianBlur stdDeviation=\"").concat(blur_1.radius, "\" />\n  </filter>");
                    blurFilterRef = " filter=\"url(#".concat(filterId, ")\"");
                }
            }
            if (!node.vectorPaths || !Array.isArray(node.vectorPaths)) {
                console.warn('No vector paths found for vector:', {
                    nodeId: node.id,
                    nodeName: node.name,
                    vectorPaths: node.vectorPaths
                });
                return [2 /*return*/, ''];
            }
            paths = node.vectorPaths.map(function (path, index) {
                var _a, _b;
                console.log('DEBUG: Processing vector path:', {
                    pathIndex: index,
                    pathData: path.data,
                    pathDataLength: ((_a = path.data) === null || _a === void 0 ? void 0 : _a.length) || 0
                });
                var fill = styles.fills.length === 1 ? styles.fills[0] : (styles.fills[index] || 'none');
                var stroke = styles.strokes.length === 1 ? styles.strokes[0] : (styles.strokes[index] || 'none');
                var strokeWidth = styles.strokeWeight || 0;
                // Decode path data from base64
                var decodedPathData = path.data;
                try {
                    if (/^[A-Za-z0-9+/=]+$/.test(path.data)) {
                        decodedPathData = base64Decode(path.data);
                        console.log('DEBUG: Decoded base64 path data:', {
                            originalLength: ((_b = path.data) === null || _b === void 0 ? void 0 : _b.length) || 0,
                            decodedLength: (decodedPathData === null || decodedPathData === void 0 ? void 0 : decodedPathData.length) || 0,
                            firstChars: (decodedPathData === null || decodedPathData === void 0 ? void 0 : decodedPathData.substring(0, 50)) || 'empty'
                        });
                    }
                    if (!decodedPathData || decodedPathData.trim() === '') {
                        console.warn('Empty decoded path data for path index:', index);
                        return '';
                    }
                    var validCommands = ['M', 'L', 'H', 'V', 'C', 'S', 'Q', 'T', 'A', 'Z'];
                    var firstChar = decodedPathData.trim().charAt(0).toUpperCase();
                    if (!validCommands.includes(firstChar)) {
                        console.warn('Invalid SVG path command:', firstChar);
                        return '';
                    }
                }
                catch (error) {
                    console.warn('Error decoding path data:', error);
                    decodedPathData = path.data;
                }
                return "<path d=\"".concat(decodedPathData, "\" \n            fill=\"").concat(fill, "\" \n            stroke=\"").concat(stroke, "\" \n            stroke-width=\"").concat(String(strokeWidth), "\"\n            fill-rule=\"nonzero\"").concat(blurFilterRef, " />");
            }).join('\n    ');
            if (!paths) {
                console.warn('No path data found for vector');
                return [2 /*return*/, ''];
            }
            gradientDefs = createSVGGradientDefinitions(styles.gradients);
            wrappedPaths = "<g id=\"".concat(node.name.replace(/\s+/g, '_'), "\">\n    ").concat(paths, "\n</g>");
            return [2 /*return*/, gradientDefs + '\n    ' + wrappedPaths];
        });
    });
}
function convertRectangleToSVG(node) {
    var svg = "<svg viewBox=\"0 0 ".concat(node.width, " ").concat(node.height, "\" xmlns=\"http://www.w3.org/2000/svg\">");
    var fillColor = 'none';
    if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
        var fill = node.fills[0];
        if (fill.type === 'SOLID') {
            fillColor = colorToRGBA(fill.color, fill.opacity);
        }
    }
    var rx = node.cornerRadius && typeof node.cornerRadius === 'number' ? node.cornerRadius : 0;
    return "".concat(svg, "<rect width=\"").concat(node.width, "\" height=\"").concat(node.height, "\" fill=\"").concat(fillColor, "\" rx=\"").concat(rx, "\"/></svg>");
}
function convertEllipseToSVG(node) {
    var svg = "<svg viewBox=\"0 0 ".concat(node.width, " ").concat(node.height, "\" xmlns=\"http://www.w3.org/2000/svg\">");
    var fillColor = 'none';
    if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
        var fill = node.fills[0];
        if (fill.type === 'SOLID') {
            fillColor = colorToRGBA(fill.color, fill.opacity);
        }
    }
    var cx = node.width / 2;
    var cy = node.height / 2;
    var rx = node.width / 2;
    var ry = node.height / 2;
    return "".concat(svg, "<ellipse cx=\"").concat(cx, "\" cy=\"").concat(cy, "\" rx=\"").concat(rx, "\" ry=\"").concat(ry, "\" fill=\"").concat(fillColor, "\"/></svg>");
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

/***/ 383:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
// Import modules
var generator_1 = __webpack_require__(605);
var fonts_1 = __webpack_require__(68);
var nodes_1 = __webpack_require__(111);
var fonts_2 = __webpack_require__(68);
var events_1 = __webpack_require__(995);
// Main plugin code
figma.showUI(__html__, { width: 400, height: 340 });
figma.ui.onmessage = function (msg) { return __awaiter(void 0, void 0, void 0, function () {
    var selection, selection_1, selection_1_1, node, e_1_1, htmlResults, finalHTML, error_1, selection, jsonResults, jsonString, error_2, selection, selectedNodeId;
    var e_1, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!(msg.type === 'export-html')) return [3 /*break*/, 12];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 11, , 12]);
                console.log('Received export-html message in backend');
                selection = figma.currentPage.selection;
                if (selection.length === 0) {
                    figma.notify('Please select at least one element to export as HTML');
                    return [2 /*return*/];
                }
                console.log('Processing', selection.length, 'selected nodes');
                _b.label = 2;
            case 2:
                _b.trys.push([2, 7, 8, 9]);
                selection_1 = __values(selection), selection_1_1 = selection_1.next();
                _b.label = 3;
            case 3:
                if (!!selection_1_1.done) return [3 /*break*/, 6];
                node = selection_1_1.value;
                return [4 /*yield*/, (0, fonts_2.loadFonts)(node)];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5:
                selection_1_1 = selection_1.next();
                return [3 /*break*/, 3];
            case 6: return [3 /*break*/, 9];
            case 7:
                e_1_1 = _b.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 9];
            case 8:
                try {
                    if (selection_1_1 && !selection_1_1.done && (_a = selection_1.return)) _a.call(selection_1);
                }
                finally { if (e_1) throw e_1.error; }
                return [7 /*endfinally*/];
            case 9: return [4 /*yield*/, Promise.all(selection.map(function (node) { return __awaiter(void 0, void 0, void 0, function () {
                    var totalNodes;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                totalNodes = (0, nodes_1.getAllNodeIds)(node).length;
                                console.log('Total nodes including children:', totalNodes);
                                return [4 /*yield*/, (0, generator_1.buildComponentSetHTMLAsync)(node)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    });
                }); }))];
            case 10:
                htmlResults = _b.sent();
                finalHTML = "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, user-scalable=no\">\n  <style>\n    ".concat((0, fonts_1.getEmbeddedFontStyles)(), "\n    html, body { box-sizing: border-box; margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; }\n    p { margin: 0; }\n    /* Component set sizing - only apply 100% if not explicitly set to fixed dimensions */\n    /* This ensures components without explicit dimensions fill their container */\n    [data-figma-id]:not([style*=\"width:\"]):not([style*=\"height:\"]) { width: 100%; height: 100%; }\n    /* Variant visibility classes */\n    .variant-active {\n      display: flex !important;\n    }\n    .variant-hidden {\n      display: none !important;\n    }\n    /* Let JavaScript handle component visibility instead of CSS rules */\n    /* This allows the variant handler to properly manage which components are visible */\n    /* Components will be shown/hidden by the JavaScript variant switching logic */\n    /* Dissolve transition overrides */\n    .dissolve-source, .dissolve-target {\n      display: block !important;\n    }\n    .dissolve-source {\n      opacity: 1;\n    }\n    .dissolve-target {\n      opacity: 0;\n    }\n    /* Smart animate transition overrides */\n    .smart-animate-source, .smart-animate-target {\n      display: block !important;\n    }\n    .smart-animate-source {\n      opacity: 1;\n    }\n    .smart-animate-target {\n      opacity: 1;\n    }\n    /* iOS font loading optimization */\n    * {\n      -webkit-font-smoothing: antialiased;\n      -moz-osx-font-smoothing: grayscale;\n    }\n  </style>\n</head>\n<body>\n").concat(htmlResults.join('\n'), "\n<script>\n").concat((0, events_1.generateEventHandlingJavaScript)(), "\n</script>\n</body>\n</html>");
                console.log('Sending HTML to UI, length:', finalHTML.length);
                figma.ui.postMessage({ type: 'export-html', html: finalHTML, nodeCount: selection.length });
                figma.notify('Export completed successfully');
                return [3 /*break*/, 12];
            case 11:
                error_1 = _b.sent();
                console.error('Export error:', error_1);
                figma.notify("Export failed: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                return [3 /*break*/, 12];
            case 12:
                if (!(msg.type === 'export-json')) return [3 /*break*/, 16];
                _b.label = 13;
            case 13:
                _b.trys.push([13, 15, , 16]);
                console.log('Received export-json message in backend');
                selection = figma.currentPage.selection;
                if (selection.length === 0) {
                    figma.notify('Please select at least one element to export as JSON');
                    return [2 /*return*/];
                }
                return [4 /*yield*/, Promise.all(selection.map(function (node) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, (0, nodes_1.exportNodeToVerboseJSON)(node, node.parent ? node.parent.id : null)];
                            case 1: return [2 /*return*/, _a.sent()];
                        }
                    }); }); }))];
            case 14:
                jsonResults = _b.sent();
                jsonString = JSON.stringify(jsonResults, null, 2);
                console.log('Generated JSON string:', jsonString.slice(0, 500)); // Log first 500 chars for brevity
                // Send the JSON string to the UI for download
                figma.ui.postMessage({ type: 'export-json', json: jsonString });
                figma.notify('JSON export completed');
                return [3 /*break*/, 16];
            case 15:
                error_2 = _b.sent();
                console.error('JSON export error:', error_2);
                figma.notify("JSON export failed: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                return [3 /*break*/, 16];
            case 16:
                if (msg.type === 'get-selected-node') {
                    try {
                        console.log('Received get-selected-node message in backend');
                        selection = figma.currentPage.selection;
                        if (selection.length === 0) {
                            // No node selected
                            figma.ui.postMessage({ type: 'selected-node-info', nodeId: null });
                            return [2 /*return*/];
                        }
                        selectedNodeId = selection[0].id;
                        console.log('Selected node ID:', selectedNodeId);
                        // Send the node ID back to the UI
                        figma.ui.postMessage({ type: 'selected-node-info', nodeId: selectedNodeId });
                    }
                    catch (error) {
                        console.error('Error getting selected node:', error);
                        figma.ui.postMessage({ type: 'selected-node-info', nodeId: null });
                    }
                }
                return [2 /*return*/];
        }
    });
}); };


/***/ }),

/***/ 463:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.computeSizingStyles = computeSizingStyles;
// Sizing and positioning styles computation
function computeSizingStyles(node, parentNode) {
    var sizingStyles = {};
    // --- BOX SIZING ---
    // Use border-box so width includes padding and border
    sizingStyles['box-sizing'] = 'border-box';
    // --- IGNORE LAYOUT (Relative Positioning) ---
    if (node.layoutPositioning === 'ABSOLUTE') {
        sizingStyles.position = 'relative';
        // Use Figma coordinates directly, but compensate for parent padding
        if (node.x !== undefined && node.y !== undefined) {
            if (parentNode) {
                // Compensate for parent's padding since Figma coordinates already include padding
                var parentPaddingLeft = parentNode.paddingLeft || 0;
                var parentPaddingTop = parentNode.paddingTop || 0;
                var compensatedX = node.x - parentPaddingLeft;
                var compensatedY = node.y - parentPaddingTop;
                sizingStyles.left = "".concat(compensatedX, "px");
                sizingStyles.top = "".concat(compensatedY, "px");
            }
            else {
                // No parent, use coordinates directly
                sizingStyles.left = "".concat(node.x, "px");
                sizingStyles.top = "".concat(node.y, "px");
            }
        }
    }
    // --- SPECIAL EXCEPTION FOR FIRST COMPONENT SET AND ITS COMPONENTS ---
    // Check if this is the first component set (a) or one of its components (a1, a2, ...)
    // The first component set is the one that has no parent, and its components are direct children
    // Method 1: Check if this is the first component set (no parent, type is COMPONENT_SET)
    var isFirstComponentSet = node.type === 'COMPONENT_SET' && !parentNode;
    // Method 2: Check if this is a component that is a direct child of the first component set
    // The first component set is identified as a COMPONENT_SET with no parent
    var isComponentOfFirstSet = parentNode &&
        parentNode.type === 'COMPONENT_SET' &&
        !parentNode.parent &&
        node.type === 'COMPONENT';
    // Method 3: Direct ID check for the specific components we know should have 100% sizing
    var isSpecificComponent = node.type === 'COMPONENT' &&
        (node.id === '6421:585' || node.id === '6421:587');
    // Method 4: Check if this is a nested component set container (instance with parent)
    // Nested component set containers should use their actual instance dimensions, not forced 100%
    // This ONLY applies to the container, not the variant nodes inside it
    var isNestedComponentSetContainer = node.type === 'INSTANCE' && parentNode !== undefined;
    // Method 5: Check if this is any component set (should always have 100% sizing)
    var isAnyComponentSet = node.type === 'COMPONENT_SET';
    // Debug logging
    console.log("[SIZING DEBUG] Node ".concat(node.id, " (").concat(node.type, "):"), {
        nodeType: node.type,
        nodeId: node.id,
        hasParent: !!parentNode,
        parentType: parentNode === null || parentNode === void 0 ? void 0 : parentNode.type,
        parentId: parentNode === null || parentNode === void 0 ? void 0 : parentNode.id,
        parentHasParent: !!(parentNode === null || parentNode === void 0 ? void 0 : parentNode.parent),
        isFirstComponentSet: isFirstComponentSet,
        isComponentOfFirstSet: isComponentOfFirstSet,
        isSpecificComponent: isSpecificComponent,
        isNestedComponentSetContainer: isNestedComponentSetContainer,
        isAnyComponentSet: isAnyComponentSet,
        instanceWidth: node.width,
        instanceHeight: node.height
    });
    if (isFirstComponentSet || isComponentOfFirstSet || isSpecificComponent || isAnyComponentSet) {
        // Force 100% width and height for component sets and their components
        // This takes precedence over any other sizing logic
        sizingStyles.width = '100%';
        sizingStyles.height = '100%';
        console.log("[SIZING DEBUG] Applied 100% sizing to node ".concat(node.id));
    }
    else if (isNestedComponentSetContainer) {
        // For nested component set containers (instances), use their actual dimensions from Figma
        // This captures the designer's intent for the nested instance size
        // This ONLY applies to the container, not the variant nodes inside it
        if (node.width !== undefined) {
            sizingStyles.width = "".concat(node.width, "px");
        }
        if (node.height !== undefined) {
            sizingStyles.height = "".concat(node.height, "px");
        }
        console.log("[SIZING DEBUG] Applied instance dimensions to nested component set container ".concat(node.id, ": ").concat(node.width, "px x ").concat(node.height, "px"));
    }
    else {
        // --- NORMAL SIZING FOR EVERYTHING ELSE (including variant nodes) ---
        if (node.width !== undefined) {
            sizingStyles.width = "".concat(node.width, "px");
        }
        if (node.height !== undefined) {
            sizingStyles.height = "".concat(node.height, "px");
        }
    }
    // --- LAYOUT SIZING (applies to ALL nodes, including special cases) ---
    // Layout sizing values should override basic width/height when present
    if (node.layoutSizingHorizontal === 'FILL') {
        sizingStyles.width = '100%';
        console.log("[SIZING DEBUG] Applied FILL horizontal sizing to node ".concat(node.id));
    }
    else if (node.layoutSizingHorizontal === 'HUG') {
        sizingStyles.width = 'fit-content';
        console.log("[SIZING DEBUG] Applied HUG horizontal sizing to node ".concat(node.id));
    }
    if (node.layoutSizingVertical === 'FILL') {
        sizingStyles.height = '100%';
        console.log("[SIZING DEBUG] Applied FILL vertical sizing to node ".concat(node.id));
    }
    else if (node.layoutSizingVertical === 'HUG') {
        sizingStyles.height = 'fit-content';
        console.log("[SIZING DEBUG] Applied HUG vertical sizing to node ".concat(node.id));
    }
    // Note: FIXED vertical sizing keeps the explicit height value (already set above)
    // --- POSITIONING (only if not ignoring layout) ---
    if (node.layoutPositioning !== 'ABSOLUTE') {
        // Check if element has explicit Figma coordinates
        var hasExplicitCoordinates = node.x !== undefined || node.y !== undefined;
        // Check if this is a child of an auto-layout frame (should get 0px positioning)
        // Each node looks UP to its parent for positioning guidance
        // If parent has auto-layout, child gets 0px positioning
        // If parent has NO auto-layout, child gets explicit coordinates
        var isChildOfAutoLayoutFrame = parentNode &&
            parentNode.type === 'FRAME' &&
            parentNode.layoutMode;
        // CRITICAL FIX: Check if parent has NO auto-layout (NONE layout mode)
        // In this case, children should get explicit positioning values
        var isChildOfNonAutoLayoutFrame = parentNode &&
            parentNode.type === 'FRAME' &&
            parentNode.layoutMode === 'NONE';
        // Comprehensive approach: Any element that should be positioned at 0px
        // This includes top-level elements, children of positioned containers, and certain node types
        var isTopLevel = !parentNode;
        var hasPositionedParent = parentNode &&
            (parentNode.type === 'COMPONENT_SET' ||
                parentNode.type === 'COMPONENT' ||
                parentNode.type === 'INSTANCE');
        // Also handle INSTANCE and COMPONENT_SET elements that should be positioned at 0px
        var shouldBePositionedAtZero = isTopLevel ||
            hasPositionedParent ||
            node.type === 'INSTANCE' ||
            node.type === 'COMPONENT_SET' ||
            node.type === 'COMPONENT' ||
            isChildOfAutoLayoutFrame;
        // CRITICAL FIX: Handle children of non-auto-layout frames first
        if (isChildOfNonAutoLayoutFrame && hasExplicitCoordinates) {
            // Children of frames with NO auto-layout should get explicit positioning
            sizingStyles.position = 'absolute';
            if (node.x !== undefined) {
                sizingStyles.left = "".concat(node.x, "px");
            }
            if (node.y !== undefined) {
                sizingStyles.top = "".concat(node.y, "px");
            }
            console.log("[SIZING DEBUG] Applied explicit positioning to child of non-auto-layout frame ".concat(node.type, " ").concat(node.id, ": left: ").concat(node.x, "px, top: ").concat(node.y, "px"));
        }
        else if (shouldBePositionedAtZero) {
            // These elements get position: relative + 0px coordinates
            sizingStyles.position = 'relative';
            sizingStyles.left = '0px';
            sizingStyles.top = '0px';
            console.log("[SIZING DEBUG] Applied position: relative + 0px to ".concat(isTopLevel ? 'top-level' : 'positioned element', " ").concat(node.type, " ").concat(node.id, " (parent: ").concat(parentNode === null || parentNode === void 0 ? void 0 : parentNode.type, ")"));
        }
        else if (hasExplicitCoordinates && !isChildOfAutoLayoutFrame && !shouldBePositionedAtZero) {
            // Elements with explicit coordinates get NO position property + their coordinates
            // BUT only if they're NOT children of auto-layout frames AND NOT positioned at zero
            // This means they use position: static (default) + their Figma coordinates
            if (node.x !== undefined) {
                sizingStyles.left = "".concat(node.x, "px");
            }
            if (node.y !== undefined) {
                sizingStyles.top = "".concat(node.y, "px");
            }
            console.log("[SIZING DEBUG] Applied position: static + explicit coordinates to ".concat(node.type, " ").concat(node.id, ": left: ").concat(node.x, "px, top: ").concat(node.y, "px"));
        }
        else if (isChildOfAutoLayoutFrame) {
            // Children of auto-layout frames should NOT get explicit coordinates
            // They should keep the 0px positioning from layout-styles.ts
            console.log("[SIZING DEBUG] Skipping explicit coordinates for child of auto-layout frame ".concat(node.type, " ").concat(node.id, " (parent: ").concat(parentNode === null || parentNode === void 0 ? void 0 : parentNode.type, ")"));
        }
    }
    // --- PADDING ---
    if (node.paddingLeft)
        sizingStyles['padding-left'] = "".concat(node.paddingLeft, "px");
    if (node.paddingRight)
        sizingStyles['padding-right'] = "".concat(node.paddingRight, "px");
    if (node.paddingTop)
        sizingStyles['padding-top'] = "".concat(node.paddingTop, "px");
    if (node.paddingBottom)
        sizingStyles['padding-bottom'] = "".concat(node.paddingBottom, "px");
    // --- CLIP CONTENT ---
    if (node.clipsContent === true) {
        sizingStyles.overflow = 'hidden';
    }
    return sizingStyles;
}


/***/ }),

/***/ 478:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isVideoFrame = isVideoFrame;
exports.extractVideoFilename = extractVideoFilename;
exports.generateNodeContent = generateNodeContent;
var utils_1 = __webpack_require__(489);
// Function to detect if a frame is a video frame
function isVideoFrame(node) {
    return typeof node.name === 'string' && node.name.startsWith('[VIDEO]');
}
// Function to extract video filename from frame name
function extractVideoFilename(node) {
    if (!isVideoFrame(node))
        return null;
    // Extract the filename after [VIDEO] prefix
    var match = node.name.match(/^\[VIDEO\]\s*(.+)$/);
    var extracted = match && match[1] ? match[1].trim() : null;
    // Return null if the extracted string is empty
    return extracted && extracted.length > 0 ? extracted : null;
}
// Function to generate video HTML content
function generateVideoContent(node) {
    var filename = extractVideoFilename(node);
    if (!filename)
        return '';
    // Generate video element with the specified structure
    // Use relative path for video files and add CSS for scaling
    return "<video controls preload=\"metadata\" style=\"width: 100%; height: 100%; object-fit: contain;\">\n    <source src=\"video/".concat(filename, "\" type=\"video/mp4\">\n    Your browser does not support the video tag.\n  </video>");
}
function generateNodeContent(node) {
    // Check if this is a video frame first
    if (isVideoFrame(node)) {
        return generateVideoContent(node);
    }
    // For text nodes, return the text content with line breaks converted to <br> tags
    if (node.type === 'TEXT' && node.characters) {
        var textContent = (0, utils_1.safeToString)(node.characters);
        // Convert \n characters to <br> tags for proper line breaks in HTML
        return textContent.replace(/\n/g, '<br>');
    }
    // For other node types, return empty content
    return '';
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

/***/ 514:
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
exports.isVideoFrame = isVideoFrame;
exports.extractVideoFilename = extractVideoFilename;
exports.getTagName = getTagName;
exports.generateNodeAttributes = generateNodeAttributes;
var utils_1 = __webpack_require__(489);
// Function to detect if a frame is a video frame
function isVideoFrame(node) {
    return typeof node.name === 'string' && node.name.startsWith('[VIDEO]');
}
// Function to extract video filename from frame name
function extractVideoFilename(node) {
    if (!isVideoFrame(node))
        return null;
    // Extract the filename after [VIDEO] prefix
    var match = node.name.match(/^\[VIDEO\]\s*(.+)$/);
    var extracted = match && match[1] ? match[1].trim() : null;
    // Return null if the extracted string is empty
    return extracted && extracted.length > 0 ? extracted : null;
}
function getTagName(node) {
    switch (node.type) {
        case 'TEXT':
            return 'p';
        case 'RECTANGLE':
        case 'ELLIPSE':
        case 'VECTOR':
        case 'LINE':
        case 'POLYGON':
        case 'STAR':
        case 'BOOLEAN_OPERATION':
        case 'FRAME':
        case 'GROUP':
        case 'COMPONENT':
        case 'COMPONENT_SET':
        case 'INSTANCE':
        case 'SLICE':
        case 'DOCUMENT':
        case 'PAGE':
        case 'CANVAS':
        default:
            return 'div';
    }
}
function generateNodeAttributes(node, overrideData) {
    var attributes = [];
    // Add data-figma-id attribute
    if (node.id) {
        attributes.push("data-figma-id=\"".concat((0, utils_1.escapeHtmlAttribute)((0, utils_1.safeAttributeValue)(node.id)), "\""));
    }
    // Add data-figma-name attribute
    if (node.name) {
        attributes.push("data-figma-name=\"".concat((0, utils_1.escapeHtmlAttribute)((0, utils_1.safeAttributeValue)(node.name)), "\""));
    }
    // Add data-figma-type attribute
    if (node.type) {
        attributes.push("data-figma-type=\"".concat((0, utils_1.escapeHtmlAttribute)((0, utils_1.safeAttributeValue)(node.type)), "\""));
    }
    // Add video-specific attributes for video frames
    if (isVideoFrame(node)) {
        attributes.push('data-video-frame="true"');
        var filename = extractVideoFilename(node);
        if (filename) {
            attributes.push("data-video-filename=\"".concat((0, utils_1.escapeHtmlAttribute)((0, utils_1.safeAttributeValue)(filename)), "\""));
        }
    }
    // Add override data attributes
    if (overrideData && Object.keys(overrideData).length > 0) {
        Object.entries(overrideData).forEach(function (_a) {
            var _b = __read(_a, 2), key = _b[0], value = _b[1];
            if (value !== undefined && value !== null) {
                attributes.push("data-override-".concat(key, "=\"").concat((0, utils_1.escapeHtmlAttribute)((0, utils_1.safeAttributeValue)(value)), "\""));
            }
        });
    }
    // Add variant attributes for components that are variants
    if (node.type === 'COMPONENT' && node.name) {
        // Check if the name contains variant information (e.g., "Property 1=default")
        var variantMatch = node.name.match(/^([^=]+)=(.+)$/);
        if (variantMatch && variantMatch.length >= 3) {
            var propertyName = variantMatch[1].toLowerCase().replace(/\s+/g, '-');
            var propertyValue = variantMatch[2];
            var attributeName = "data-variant-".concat(propertyName);
            var attributeValue = (0, utils_1.escapeHtmlAttribute)((0, utils_1.safeAttributeValue)(propertyValue));
            attributes.push("".concat(attributeName, "=\"").concat(attributeValue, "\""));
        }
    }
    // Add layout mode attribute for debugging
    if (node.layoutMode) {
        attributes.push("data-layout-mode=\"".concat((0, utils_1.escapeHtmlAttribute)((0, utils_1.safeAttributeValue)(node.layoutMode)), "\""));
    }
    // Add primary axis alignment attribute
    if (node.primaryAxisAlignItems) {
        attributes.push("data-primary-axis=\"".concat((0, utils_1.escapeHtmlAttribute)((0, utils_1.safeAttributeValue)(node.primaryAxisAlignItems)), "\""));
    }
    // Add counter axis alignment attribute
    if (node.counterAxisAlignItems) {
        attributes.push("data-counter-axis=\"".concat((0, utils_1.escapeHtmlAttribute)((0, utils_1.safeAttributeValue)(node.counterAxisAlignItems)), "\""));
    }
    // Add item spacing attribute
    if (node.itemSpacing !== undefined) {
        attributes.push("data-item-spacing=\"".concat((0, utils_1.safeAttributeValue)(node.itemSpacing), "\""));
    }
    // Add sizing attributes
    if (node.layoutSizingHorizontal) {
        attributes.push("data-sizing-horizontal=\"".concat((0, utils_1.escapeHtmlAttribute)((0, utils_1.safeAttributeValue)(node.layoutSizingHorizontal)), "\""));
    }
    if (node.layoutSizingVertical) {
        attributes.push("data-sizing-vertical=\"".concat((0, utils_1.escapeHtmlAttribute)((0, utils_1.safeAttributeValue)(node.layoutSizingVertical)), "\""));
    }
    // Add padding attributes
    if (node.paddingLeft !== undefined) {
        attributes.push("data-padding-left=\"".concat((0, utils_1.safeAttributeValue)(node.paddingLeft), "\""));
    }
    if (node.paddingRight !== undefined) {
        attributes.push("data-padding-right=\"".concat((0, utils_1.safeAttributeValue)(node.paddingRight), "\""));
    }
    if (node.paddingTop !== undefined) {
        attributes.push("data-padding-top=\"".concat((0, utils_1.safeAttributeValue)(node.paddingTop), "\""));
    }
    if (node.paddingBottom !== undefined) {
        attributes.push("data-padding-bottom=\"".concat((0, utils_1.safeAttributeValue)(node.paddingBottom), "\""));
    }
    // Add text-specific attributes
    if (node.type === 'TEXT') {
        if (node.fontSize !== undefined) {
            attributes.push("data-font-size=\"".concat((0, utils_1.safeAttributeValue)(node.fontSize), "\""));
        }
        if (node.fontWeight !== undefined) {
            attributes.push("data-font-weight=\"".concat((0, utils_1.safeAttributeValue)(node.fontWeight), "\""));
        }
        if (node.textAlignHorizontal) {
            attributes.push("data-text-align=\"".concat((0, utils_1.escapeHtmlAttribute)((0, utils_1.safeAttributeValue)(node.textAlignHorizontal)), "\""));
        }
        if (node.letterSpacing !== undefined) {
            if (typeof node.letterSpacing === 'object' && node.letterSpacing.value) {
                attributes.push("data-letter-spacing=\"".concat((0, utils_1.safeAttributeValue)(node.letterSpacing.value), "\""));
            }
            else if (typeof node.letterSpacing === 'number') {
                attributes.push("data-letter-spacing=\"".concat((0, utils_1.safeAttributeValue)(node.letterSpacing), "\""));
            }
        }
        if (node.lineHeight !== undefined) {
            if (typeof node.lineHeight === 'object' && node.lineHeight.value) {
                attributes.push("data-line-height=\"".concat((0, utils_1.safeAttributeValue)(node.lineHeight.value), "\""));
            }
            else if (typeof node.lineHeight === 'number') {
                attributes.push("data-line-height=\"".concat((0, utils_1.safeAttributeValue)(node.lineHeight), "\""));
            }
        }
    }
    // Add visual attributes
    if (node.opacity !== undefined) {
        attributes.push("data-opacity=\"".concat((0, utils_1.safeAttributeValue)(node.opacity), "\""));
    }
    if (node.cornerRadius !== undefined) {
        attributes.push("data-corner-radius=\"".concat((0, utils_1.safeAttributeValue)(node.cornerRadius), "\""));
    }
    if (node.strokeWeight !== undefined) {
        attributes.push("data-stroke-weight=\"".concat((0, utils_1.safeAttributeValue)(node.strokeWeight), "\""));
    }
    // Add clipping attribute
    if (node.clipsContent === true) {
        attributes.push('data-clips-content="true"');
    }
    // Add layout positioning attribute
    if (node.layoutPositioning) {
        attributes.push("data-layout-positioning=\"".concat((0, utils_1.escapeHtmlAttribute)((0, utils_1.safeAttributeValue)(node.layoutPositioning)), "\""));
    }
    // Add Figma position attributes for animation detection
    if (node.x !== undefined && node.x !== null) {
        attributes.push("data-figma-x=\"".concat((0, utils_1.safeAttributeValue)(node.x), "\""));
    }
    if (node.y !== undefined && node.y !== null) {
        attributes.push("data-figma-y=\"".concat((0, utils_1.safeAttributeValue)(node.y), "\""));
    }
    return attributes;
}


/***/ }),

/***/ 605:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateNodeContent = exports.extractVideoFilename = exports.isVideoFrame = exports.generateNodeAttributes = exports.getTagName = exports.convertImageToHTML = exports.buildComponentSetHTMLAsync = void 0;
// Re-export the main function from the new modular structure
var html_builder_1 = __webpack_require__(137);
Object.defineProperty(exports, "buildComponentSetHTMLAsync", ({ enumerable: true, get: function () { return html_builder_1.buildComponentSetHTMLAsync; } }));
var image_converter_1 = __webpack_require__(752);
Object.defineProperty(exports, "convertImageToHTML", ({ enumerable: true, get: function () { return image_converter_1.convertImageToHTML; } }));
var node_attributes_1 = __webpack_require__(514);
Object.defineProperty(exports, "getTagName", ({ enumerable: true, get: function () { return node_attributes_1.getTagName; } }));
Object.defineProperty(exports, "generateNodeAttributes", ({ enumerable: true, get: function () { return node_attributes_1.generateNodeAttributes; } }));
Object.defineProperty(exports, "isVideoFrame", ({ enumerable: true, get: function () { return node_attributes_1.isVideoFrame; } }));
Object.defineProperty(exports, "extractVideoFilename", ({ enumerable: true, get: function () { return node_attributes_1.extractVideoFilename; } }));
var node_content_1 = __webpack_require__(478);
Object.defineProperty(exports, "generateNodeContent", ({ enumerable: true, get: function () { return node_content_1.generateNodeContent; } }));


/***/ }),

/***/ 752:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.convertImageToHTML = convertImageToHTML;
var utils_1 = __webpack_require__(489);
// Image conversion function
function convertImageToHTML(node) {
    return __awaiter(this, void 0, void 0, function () {
        var width, height, alt, imageHash, imageFill, image, bytes, uint8Array, base64Chars, base64Data, i, byte1, byte2, byte3, chunk1, chunk2, chunk3, chunk4, imageFormat, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    width = (0, utils_1.safeToString)(node.width || 0);
                    height = (0, utils_1.safeToString)(node.height || 0);
                    alt = (0, utils_1.escapeHtmlAttribute)((0, utils_1.safeToString)(node.name || 'Image'));
                    imageHash = null;
                    if (node.fills && Array.isArray(node.fills) && node.fills.length > 0) {
                        imageFill = node.fills.find(function (fill) { return fill.type === 'IMAGE'; });
                        if (imageFill && imageFill.imageHash) {
                            imageHash = imageFill.imageHash;
                        }
                    }
                    // Also check direct imageHash property for backward compatibility
                    if (!imageHash && node.imageHash) {
                        imageHash = node.imageHash;
                    }
                    if (!imageHash) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log('Attempting to load image with hash:', imageHash);
                    // Check if the image hash is valid
                    if (!imageHash || typeof imageHash !== 'string') {
                        throw new Error('Invalid image hash: ' + imageHash);
                    }
                    image = figma.getImageByHash(imageHash);
                    console.log('Image object retrieved:', image);
                    if (!image) {
                        throw new Error('Image not found for hash: ' + imageHash);
                    }
                    return [4 /*yield*/, image.getBytesAsync()];
                case 2:
                    bytes = _a.sent();
                    console.log('Image bytes retrieved, length:', bytes.length);
                    uint8Array = new Uint8Array(bytes);
                    base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                    base64Data = '';
                    for (i = 0; i < uint8Array.length; i += 3) {
                        byte1 = uint8Array[i] || 0;
                        byte2 = i + 1 < uint8Array.length ? (uint8Array[i + 1] || 0) : 0;
                        byte3 = i + 2 < uint8Array.length ? (uint8Array[i + 2] || 0) : 0;
                        chunk1 = byte1 >> 2;
                        chunk2 = ((byte1 & 3) << 4) | (byte2 >> 4);
                        chunk3 = ((byte2 & 15) << 2) | (byte3 >> 6);
                        chunk4 = byte3 & 63;
                        base64Data += base64Chars[chunk1];
                        base64Data += base64Chars[chunk2];
                        base64Data += i + 1 < uint8Array.length ? base64Chars[chunk3] : '=';
                        base64Data += i + 2 < uint8Array.length ? base64Chars[chunk4] : '=';
                    }
                    console.log('Base64 conversion successful, length:', base64Data.length);
                    imageFormat = 'image/png';
                    return [2 /*return*/, "<img src=\"data:".concat(imageFormat, ";base64,").concat(base64Data, "\" width=\"").concat(width, "\" height=\"").concat(height, "\" alt=\"").concat(alt, "\" style=\"object-fit: cover;\" data-image-hash=\"").concat(imageHash, "\" />")];
                case 3:
                    error_1 = _a.sent();
                    console.error('Failed to load image:', error_1);
                    console.error('Error details:', {
                        message: error_1 instanceof Error ? error_1.message : String(error_1),
                        stack: error_1 instanceof Error ? error_1.stack : 'No stack trace',
                        imageHash: imageHash
                    });
                    // Fallback to informative placeholder if image loading fails
                    return [2 /*return*/, "<div style=\"width: ".concat(width, "px; height: ").concat(height, "px; background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%); background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0px; display: flex; align-items: center; justify-content: center; border: 2px dashed #ccc; color: #666; font-family: Arial, sans-serif; font-size: 12px; text-align: center;\" data-figma-type=\"image-placeholder\" data-image-hash=\"").concat(imageHash, "\">\n        <div>\n          <div style=\"font-weight: bold; margin-bottom: 4px;\">\uD83D\uDCF7 Image</div>\n          <div style=\"font-size: 10px; color: #999;\">").concat(width, " \u00D7 ").concat(height, "px</div>\n          <div style=\"font-size: 9px; color: #ccc; margin-top: 4px;\">Hash: ").concat(imageHash ? imageHash.substring(0, 8) + '...' : 'N/A', "</div>\n        </div>\n      </div>")];
                case 4: 
                // Fallback for nodes without image hash
                return [2 /*return*/, "<div style=\"width: ".concat(width, "px; height: ").concat(height, "px; background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; color: #999; font-family: Arial, sans-serif; font-size: 12px;\" data-figma-type=\"image-placeholder\">Image Placeholder</div>")];
            }
        });
    });
}


/***/ }),

/***/ 855:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.computeBorderStyles = computeBorderStyles;
var gradient_converter_1 = __webpack_require__(195);
// Border and stroke styles computation
function computeBorderStyles(node, nodeOpacity) {
    var borderStyles = {};
    // Skip border processing for component set containers to ignore Figma's purple dashed border
    if (node.type === 'COMPONENT_SET') {
        return borderStyles;
    }
    // --- BORDERS ---
    if (node.strokes && Array.isArray(node.strokes) && node.strokes.length > 0) {
        var stroke = node.strokes[0];
        if (stroke.type === 'SOLID' && stroke.color) {
            var _a = stroke.color, r = _a.r, g = _a.g, b = _a.b, _b = _a.a, a = _b === void 0 ? 1 : _b;
            var strokeOpacity = stroke.opacity !== undefined ? stroke.opacity : 1;
            var finalAlpha = a * strokeOpacity * nodeOpacity;
            var strokeColor = "rgba(".concat(Math.round(r * 255), ", ").concat(Math.round(g * 255), ", ").concat(Math.round(b * 255), ", ").concat(finalAlpha, ")");
            var strokeWeight = node.strokeWeight || 1;
            borderStyles.border = "".concat(strokeWeight, "px solid ").concat(strokeColor);
        }
        else if (stroke.type === 'GRADIENT_LINEAR' || stroke.type === 'GRADIENT_RADIAL') {
            // Handle gradient strokes using multiple background layers technique
            var gradientCSS = (0, gradient_converter_1.convertGradientToCSS)(stroke, nodeOpacity);
            if (gradientCSS) {
                var strokeWeight = node.strokeWeight || 1;
                // Set up the multiple background layers for gradient border
                // First layer is always linear-gradient(white,white) for gradient borders
                borderStyles.border = "double ".concat(strokeWeight, "px transparent");
                borderStyles['background-image'] = "linear-gradient(white,white),".concat(gradientCSS);
                borderStyles['background-origin'] = 'border-box';
                borderStyles['background-clip'] = 'padding-box, border-box';
            }
        }
    }
    // --- CORNER RADIUS ---
    if (node.cornerRadius !== undefined) {
        borderStyles['border-radius'] = "".concat(node.cornerRadius, "px");
    }
    return borderStyles;
}


/***/ }),

/***/ 920:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createSmartAnimateHandler = createSmartAnimateHandler;
// Animation transition handling logic - copy-based approach
function createSmartAnimateHandler() {
    return "\n      // Global transition lock to prevent multiple simultaneous transitions\n      let isTransitionInProgress = false;\n      \n      // Helper function to map Figma animation types to CSS easing functions\n      function getEasingFunction(animationType) {\n        switch (animationType) {\n          case 'EASE_IN_AND_OUT_BACK':\n            return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';\n          case 'EASE_IN_AND_OUT':\n            return 'ease-in-out';\n          case 'EASE_IN':\n            return 'ease-in';\n          case 'EASE_OUT':\n            return 'ease-out';\n          case 'LINEAR':\n            return 'linear';\n          case 'BOUNCY':\n            return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';\n          case 'GENTLE':\n            return 'ease-in-out'; // Gentle is typically a smooth ease-in-out\n          case 'SMART_ANIMATE':\n            // SMART_ANIMATE should use the actual easing type from the reaction data\n            // For now, default to ease-in-out which is commonly used for smart animate\n            return 'ease-in-out';\n          default:\n            return 'ease-out';\n        }\n      }\n      \n      // Helper function to create a deep copy of an element\n      function createElementCopy(sourceElement) {\n        const copy = sourceElement.cloneNode(true);\n        copy.setAttribute('data-figma-id', sourceElement.getAttribute('data-figma-id') + '-copy');\n        copy.setAttribute('data-is-animation-copy', 'true');\n        \n        // Immediately reset all internal elements to their original positions\n        const copyElements = copy.querySelectorAll('*');\n        copyElements.forEach(element => {\n          if (element.hasAttribute('data-figma-id')) {\n            // Reset to original Figma positions (0,0) for animation\n            element.style.position = 'relative';\n            element.style.left = '0px';\n            element.style.top = '0px';\n            \n            // Force remove any existing inline styles that might interfere\n            element.style.removeProperty('transform');\n            element.style.removeProperty('margin');\n            element.style.removeProperty('padding');\n            \n            // Force the style to be applied by setting it again\n            element.style.setProperty('left', '0px', 'important');\n            element.style.setProperty('top', '0px', 'important');\n            \n            console.log('DEBUG: Reset copy element:', element.getAttribute('data-figma-id'), {\n              position: element.style.position,\n              left: element.style.left,\n              top: element.style.top,\n              computedLeft: window.getComputedStyle(element).left,\n              computedTop: window.getComputedStyle(element).top,\n              elementRect: element.getBoundingClientRect()\n            });\n          }\n        });\n        \n        // Debug: List all elements in the copy with their IDs\n        console.log('DEBUG: All elements in copy:', Array.from(copy.querySelectorAll('[data-figma-id]')).map(el => ({\n          id: el.getAttribute('data-figma-id'),\n          left: el.style.left,\n          top: el.style.top\n        })));\n        \n        // Get the source element's computed position\n        const sourceRect = sourceElement.getBoundingClientRect();\n        const parentRect = sourceElement.parentElement.getBoundingClientRect();\n        \n        // Position the copy absolutely over the source element\n        copy.style.position = 'absolute';\n        copy.style.top = (sourceRect.top - parentRect.top) + 'px';\n        copy.style.left = (sourceRect.left - parentRect.left) + 'px';\n        \n\n        \n        // Override any inline styles that might interfere with positioning\n        copy.style.transform = 'none'; // Remove any transforms\n        copy.style.margin = '0'; // Remove margins\n        copy.style.padding = '0'; // Remove padding\n        \n        // Ensure copy is always on top by finding the highest z-index in the document\n        const allElements = document.querySelectorAll('*');\n        let maxZIndex = 0;\n        allElements.forEach(el => {\n          const zIndex = parseInt(window.getComputedStyle(el).zIndex) || 0;\n          if (zIndex > maxZIndex) maxZIndex = zIndex;\n        });\n        \n        // Set copy z-index higher than any existing element\n        const copyZIndex = maxZIndex + 1000;\n        copy.style.zIndex = copyZIndex.toString();\n        copy.style.pointerEvents = 'none'; // Prevent interaction with copy\n        copy.style.transform = 'translateZ(0)'; // Create new stacking context and enable hardware acceleration\n        copy.style.willChange = 'transform, left, top'; // Optimize for animations\n        \n        console.log('DEBUG: Copy z-index management:', {\n          maxZIndexFound: maxZIndex,\n          copyZIndex: copyZIndex,\n          copyPosition: copy.style.position,\n          copyTop: copy.style.top,\n          copyLeft: copy.style.left\n        });\n        \n        console.log('DEBUG: Copy positioned at:', {\n          sourceTop: sourceRect.top - parentRect.top,\n          sourceLeft: sourceRect.left - parentRect.left,\n          sourceRect: sourceRect,\n          parentRect: parentRect,\n          copyPosition: copy.style.position,\n          copyTop: copy.style.top,\n          copyLeft: copy.style.left\n        });\n        \n        return copy;\n      }\n      \n      // Helper function to animate copy to destination values\n      function animateCopyToDestination(copy, destination, transitionType, transitionDuration) {\n        return new Promise((resolve) => {\n          // Find elements with property changes\n          const elementsToAnimate = findElementsWithPropertyChanges(destination, copy);\n          \n          if (elementsToAnimate.length > 0) {\n            console.log('DEBUG: Animating copy with', elementsToAnimate.length, 'elements');\n            console.log('DEBUG: Elements to animate:', elementsToAnimate.map(({ element, changes }) => ({\n              id: element.getAttribute('data-figma-id'),\n              left: element.style.left,\n              top: element.style.top,\n              hasPositionX: changes.positionX?.changed || false,\n              hasPositionY: changes.positionY?.changed || false\n            })));\n            \n            // Setup animation for each element in the copy\n            elementsToAnimate.forEach(({ element, sourceElement, changes }) => {\n              const easingFunction = getEasingFunction(transitionType);\n              const duration = parseFloat(transitionDuration || '0.3');\n              \n              console.log('DEBUG: Animation setup for element:', element.getAttribute('data-figma-id'), {\n                transitionType: transitionType,\n                easingFunction: easingFunction,\n                duration: duration\n              });\n              \n              // Build transition string\n              const transitionProperties = [];\n              if (changes.backgroundColor && changes.backgroundColor.changed) {\n                transitionProperties.push(`background-color ${duration}s ${easingFunction}`);\n              }\n              if (changes.color && changes.color.changed) {\n                transitionProperties.push(`color ${duration}s ${easingFunction}`);\n              }\n              if (changes.opacity && changes.opacity.changed) {\n                transitionProperties.push(`opacity ${duration}s ${easingFunction}`);\n              }\n              if (changes.positionX && changes.positionX.changed) {\n                transitionProperties.push(`left ${duration}s ${easingFunction}`);\n              }\n              if (changes.positionY && changes.positionY.changed) {\n                transitionProperties.push(`top ${duration}s ${easingFunction}`);\n              }\n              if (changes.width && changes.width.changed) {\n                transitionProperties.push(`width ${duration}s ${easingFunction}`);\n              }\n              if (changes.height && changes.height.changed) {\n                transitionProperties.push(`height ${duration}s ${easingFunction}`);\n              }\n              \n              // Apply transition\n              if (transitionProperties.length > 0) {\n                element.style.transition = transitionProperties.join(', ');\n                console.log('DEBUG: Applied transition to element:', element.getAttribute('data-figma-id'), 'transition:', element.style.transition);\n                \n                // Verify transition was applied\n                setTimeout(() => {\n                  const computedTransition = window.getComputedStyle(element).transition;\n                  console.log('DEBUG: Verified transition for element:', element.getAttribute('data-figma-id'), 'computed transition:', computedTransition);\n                }, 0);\n              }\n            });\n            \n            // Force reflow to ensure transitions are applied\n            copy.offsetHeight;\n            \n                    // Apply target values to animate the copy with proper timing\n        requestAnimationFrame(() => {\n          console.log('DEBUG: Applying target values to copy elements');\n          \n          // Log initial positions before animation\n          elementsToAnimate.forEach(({ element, changes }) => {\n            console.log('DEBUG: Initial position of element:', element.getAttribute('data-figma-id'), {\n              top: element.style.top,\n              left: element.style.left,\n              transition: element.style.transition,\n              computedTransition: window.getComputedStyle(element).transition\n            });\n          });\n              \n              elementsToAnimate.forEach(({ element, changes }) => {\n                if (changes.backgroundColor && changes.backgroundColor.changed) {\n                  element.style.backgroundColor = changes.backgroundColor.targetValue;\n                }\n                if (changes.color && changes.color.changed) {\n                  element.style.color = changes.color.targetValue;\n                }\n                if (changes.opacity && changes.opacity.changed) {\n                  element.style.opacity = changes.opacity.targetValue;\n                }\n                if (changes.positionX && changes.positionX.changed) {\n                  // Set the target position directly (not relative to current position)\n                  const targetLeft = parseFloat(changes.positionX.targetValue);\n                  \n                  console.log('DEBUG: Before position change - element:', element.getAttribute('data-figma-id'), {\n                    currentLeft: element.style.left,\n                    currentPosition: element.style.position,\n                    targetLeft: targetLeft,\n                    elementRect: element.getBoundingClientRect()\n                  });\n                  \n                  element.style.left = targetLeft + 'px';\n                  \n                  console.log('DEBUG: After position change - element:', element.getAttribute('data-figma-id'), {\n                    newLeft: element.style.left,\n                    elementRect: element.getBoundingClientRect()\n                  });\n                  \n                  console.log('DEBUG: Applied position change to copy:', element.getAttribute('data-figma-id'), 'from:', element.style.left || '0px', 'to:', targetLeft + 'px', 'target:', targetLeft, 'easing:', getEasingFunction(transitionType));\n                }\n                if (changes.positionY && changes.positionY.changed) {\n                  // Set the target position directly (not relative to current position)\n                  const targetTop = parseFloat(changes.positionY.targetValue);\n                  \n                  element.style.top = targetTop + 'px';\n                  console.log('DEBUG: Applied position change to copy:', element.getAttribute('data-figma-id'), 'from:', element.style.top || '0px', 'to:', targetTop + 'px', 'target:', targetTop, 'easing:', getEasingFunction(transitionType));\n                }\n                if (changes.width && changes.width.changed) {\n                  element.style.width = changes.width.targetValue + 'px';\n                }\n                if (changes.height && changes.height.changed) {\n                  element.style.height = changes.height.targetValue + 'px';\n                }\n              });\n            }, 16);\n            \n            // Monitor animation progress\n            const animationDuration = parseFloat(transitionDuration || '0.3') * 1000;\n            const checkInterval = 100; // Check every 100ms\n            let checkCount = 0;\n            \n                          const progressCheck = setInterval(() => {\n                checkCount++;\n                elementsToAnimate.forEach(({ element, changes }) => {\n                  const elementRect = element.getBoundingClientRect();\n                  console.log('DEBUG: Animation progress check', checkCount, 'for element:', element.getAttribute('data-figma-id'), {\n                    top: element.style.top,\n                    left: element.style.left,\n                    computedTop: getComputedStyle(element).top,\n                    computedLeft: getComputedStyle(element).left,\n                    boundingRect: elementRect,\n                    isVisible: elementRect.width > 0 && elementRect.height > 0,\n                    viewportPosition: {\n                      x: elementRect.x,\n                      y: elementRect.y,\n                      right: elementRect.right,\n                      bottom: elementRect.bottom\n                    }\n                  });\n                });\n              \n              if (checkCount * checkInterval >= animationDuration) {\n                clearInterval(progressCheck);\n                console.log('DEBUG: Animation completed, removing copy');\n                resolve();\n              }\n            }, checkInterval);\n          } else {\n            // No elements to animate, resolve immediately\n            resolve();\n          }\n        });\n      }\n      \n      // Helper function to perform instant variant switch (no animation)\n      function performInstantVariantSwitch(allVariants, destination) {\n        console.log('DEBUG: Performing instant variant switch');\n        \n        // Hide all variants\n        allVariants.forEach(variant => {\n          variant.classList.add('variant-hidden');\n          variant.classList.remove('variant-active');\n          // Ensure all variants maintain their original positioning\n          variant.style.position = 'relative';\n          variant.style.top = '0px';\n          variant.style.left = '0px';\n        });\n        \n        // Show destination variant\n        destination.classList.add('variant-active');\n        destination.classList.remove('variant-hidden');\n        // Ensure destination maintains its original positioning\n        destination.style.position = 'relative';\n        destination.style.top = '0px';\n        destination.style.left = '0px';\n        \n        // Start timeout reactions\n        startTimeoutReactionsForNewlyActiveVariant(destination);\n        startTimeoutReactionsForNestedComponents(destination);\n      }\n      \n      // Helper function to handle animated variant switching using copy approach\n      async function handleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration) {\n        console.log('DEBUG: Starting animated variant switch with copy approach');\n        console.log('  Transition type:', transitionType, 'Duration:', transitionDuration);\n        \n        // Create a copy of the source variant\n        const sourceCopy = createElementCopy(sourceElement);\n        \n        // Insert the copy into the DOM (positioned over the source)\n        const sourceParent = sourceElement.parentElement;\n        sourceParent.appendChild(sourceCopy);\n        \n        // Hide the original source element and all other variants for testing\n        sourceElement.style.opacity = '0';\n        sourceElement.style.visibility = 'hidden';\n        \n        // Hide all other variants too for clean testing\n        allVariants.forEach(variant => {\n          if (variant !== sourceElement) {\n            variant.style.opacity = '0';\n            variant.style.visibility = 'hidden';\n          }\n        });\n        \n        console.log('DEBUG: Copy created and positioned:', {\n          copyId: sourceCopy.getAttribute('data-figma-id'),\n          copyPosition: sourceCopy.style.position,\n          copyTop: sourceCopy.style.top,\n          copyLeft: sourceCopy.style.left,\n          copyOpacity: sourceCopy.style.opacity,\n          copyZIndex: sourceCopy.style.zIndex,\n          copyDisplay: sourceCopy.style.display,\n          copyVisibility: sourceCopy.style.visibility,\n          copyTransform: sourceCopy.style.transform,\n          copyWillChange: sourceCopy.style.willChange\n        });\n        \n        // Log the copy's actual DOM position and visibility\n        setTimeout(() => {\n          const copyRect = sourceCopy.getBoundingClientRect();\n          const copyComputedStyle = window.getComputedStyle(sourceCopy);\n          console.log('DEBUG: Copy DOM position and visibility:', {\n            copyId: sourceCopy.getAttribute('data-figma-id'),\n            boundingRect: copyRect,\n            computedPosition: copyComputedStyle.position,\n            computedTop: copyComputedStyle.top,\n            computedLeft: copyComputedStyle.left,\n            computedOpacity: copyComputedStyle.opacity,\n            computedZIndex: copyComputedStyle.zIndex,\n            computedDisplay: copyComputedStyle.display,\n            computedVisibility: copyComputedStyle.visibility,\n            computedTransform: copyComputedStyle.transform,\n            isVisible: copyRect.width > 0 && copyRect.height > 0 && copyComputedStyle.opacity !== '0',\n            parentOverflow: window.getComputedStyle(sourceCopy.parentElement).overflow\n          });\n        }, 100);\n        \n        // Show the destination variant (but keep it hidden visually)\n        destination.classList.add('variant-active');\n        destination.classList.remove('variant-hidden');\n        destination.style.visibility = 'hidden'; // Hidden but active for calculations\n        \n        // Force reflow to ensure destination is rendered for calculations\n        destination.offsetHeight;\n        \n        // Animate the copy to match the destination\n        await animateCopyToDestination(sourceCopy, destination, transitionType, transitionDuration);\n        \n        // Animation complete - restore normal behavior\n        sourceCopy.remove(); // Remove the copy\n        \n        // Reset source element visibility\n        sourceElement.style.opacity = '1';\n        sourceElement.style.visibility = 'visible';\n        \n        console.log('DEBUG: Animation completed - normal behavior restored');\n        \n        // Properly activate the destination variant\n        destination.style.visibility = 'visible';\n        destination.style.opacity = '1';\n        destination.classList.add('variant-active');\n        destination.classList.remove('variant-hidden');\n        \n        // Ensure destination has proper positioning\n        destination.style.position = 'relative';\n        destination.style.top = '0px';\n        destination.style.left = '0px';\n        \n        // Hide all other variants\n        allVariants.forEach(variant => {\n          if (variant !== destination) {\n            variant.classList.add('variant-hidden');\n            variant.classList.remove('variant-active');\n            variant.style.position = 'relative';\n            variant.style.top = '0px';\n            variant.style.left = '0px';\n            variant.style.opacity = '0';\n            variant.style.visibility = 'hidden';\n          }\n        });\n        \n        console.log('DEBUG: Normal mode - copy removed, destination variant active and visible');\n        \n        // Start timeout reactions\n        startTimeoutReactionsForNewlyActiveVariant(destination);\n        startTimeoutReactionsForNestedComponents(destination);\n      }\n      \n      // Helper function to handle reaction transitions\n      function handleReaction(sourceElement, destinationId, transitionType, transitionDuration) {\n        console.log('DEBUG: handleReaction called');\n        console.log('  Source element ID:', sourceElement.getAttribute('data-figma-id'));\n        console.log('  Destination ID:', destinationId);\n        console.log('  Transition type:', transitionType, 'Duration:', transitionDuration);\n        \n        // Prevent multiple simultaneous transitions\n        if (isTransitionInProgress) {\n          console.log('DEBUG: Transition already in progress, skipping');\n          return;\n        }\n        \n        // Set transition lock\n        isTransitionInProgress = true;\n        \n        // Safety timeout\n        const safetyTimeout = setTimeout(() => {\n          if (isTransitionInProgress) {\n            console.log('WARNING: Transition lock stuck, forcing release');\n            isTransitionInProgress = false;\n          }\n        }, 5000);\n        \n        if (destinationId) {\n          const destination = document.querySelector(`[data-figma-id=\"${destinationId}\"]`);\n          \n          if (!destination) {\n            console.log('ERROR: Destination element not found:', destinationId);\n            clearTimeout(safetyTimeout);\n            isTransitionInProgress = false;\n            return;\n          }\n          \n          // Check if this is a variant switch within a component set\n          const sourceComponentSet = sourceElement.closest('[data-figma-type=\"COMPONENT_SET\"]');\n          const destinationComponentSet = destination.closest('[data-figma-type=\"COMPONENT_SET\"]');\n          \n          if (sourceComponentSet && destinationComponentSet && sourceComponentSet === destinationComponentSet) {\n            // This is a variant switch\n            const componentSet = sourceComponentSet;\n            const allVariants = Array.from(componentSet.children).filter(child => \n              child.getAttribute('data-figma-type') === 'COMPONENT'\n            );\n            \n            console.log('DEBUG: Transition type check:', {\n              transitionType: transitionType,\n              transitionDuration: transitionDuration,\n              isAnimated: transitionType === 'SMART_ANIMATE' || transitionType === 'BOUNCY' || \n                         transitionType === 'EASE_IN_AND_OUT' || transitionType === 'EASE_IN' || \n                         transitionType === 'EASE_OUT' || transitionType === 'LINEAR'\n            });\n            \n            if (transitionType === 'SMART_ANIMATE' || transitionType === 'BOUNCY' || \n                transitionType === 'EASE_IN_AND_OUT' || transitionType === 'EASE_IN' || \n                transitionType === 'EASE_OUT' || transitionType === 'LINEAR' || \n                transitionType === 'GENTLE') {\n              console.log('DEBUG: Using animated variant switching');\n              // Handle animated variant switching with copy approach\n              handleAnimatedVariantSwitch(sourceElement, destination, allVariants, transitionType, transitionDuration)\n                .then(() => {\n                  clearTimeout(safetyTimeout);\n                  isTransitionInProgress = false;\n                })\n                .catch((error) => {\n                  console.error('Animation error:', error);\n                  clearTimeout(safetyTimeout);\n                  isTransitionInProgress = false;\n                });\n            } else {\n              console.log('DEBUG: Using instant variant switching - transition type not recognized:', transitionType);\n              // Handle instant variant switching\n              performInstantVariantSwitch(allVariants, destination);\n              clearTimeout(safetyTimeout);\n              isTransitionInProgress = false;\n            }\n          } else {\n            // This is a regular transition (not variant switching)\n            // Handle different transition types\n            if (transitionType === 'DISSOLVE') {\n              // Dissolve transition\n              sourceElement.style.opacity = '0';\n              setTimeout(() => {\n                sourceElement.style.opacity = '1';\n                destination.classList.add('variant-active');\n                destination.classList.remove('variant-hidden');\n                destination.style.opacity = '1';\n                \n                startTimeoutReactionsForNewlyActiveVariant(destination);\n                startTimeoutReactionsForNestedComponents(destination);\n                \n                clearTimeout(safetyTimeout);\n                isTransitionInProgress = false;\n              }, parseFloat(transitionDuration || '300'));\n            } else {\n              // Default transition - simple show/hide\n              sourceElement.style.opacity = '1';\n              destination.classList.add('variant-active');\n              destination.classList.remove('variant-hidden');\n              destination.style.opacity = '1';\n              \n              startTimeoutReactionsForNewlyActiveVariant(destination);\n              startTimeoutReactionsForNestedComponents(destination);\n              \n              clearTimeout(safetyTimeout);\n              isTransitionInProgress = false;\n            }\n          }\n        } else {\n          // No destination ID provided\n          clearTimeout(safetyTimeout);\n          isTransitionInProgress = false;\n        }\n      }\n      \n      // Make function globally available\n      window.handleReaction = handleReaction;\n    ";
}


/***/ }),

/***/ 927:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.computeNodeStyles = computeNodeStyles;
var layout_styles_1 = __webpack_require__(11);
var sizing_styles_1 = __webpack_require__(463);
var border_styles_1 = __webpack_require__(855);
var text_styles_1 = __webpack_require__(232);
var fill_styles_1 = __webpack_require__(282);
var utils_1 = __webpack_require__(489);
// Main style computation orchestrator
function computeNodeStyles(node, parentNode) {
    var computedStyles = {};
    // Get node appearance opacity (this should multiply all other opacity values)
    var nodeOpacity = (0, utils_1.safeHasProperty)(node, 'opacity') ? node.opacity : 1;
    // Compute all style categories
    var fillStyles = (0, fill_styles_1.computeFillStyles)(node, nodeOpacity);
    var layoutStyles = (0, layout_styles_1.computeLayoutStyles)(node, parentNode);
    var sizingStyles = (0, sizing_styles_1.computeSizingStyles)(node, parentNode);
    var borderStyles = (0, border_styles_1.computeBorderStyles)(node, nodeOpacity);
    var textStyles = (0, text_styles_1.computeTextStyles)(node, nodeOpacity);
    // Merge all styles (later styles override earlier ones)
    Object.assign(computedStyles, fillStyles);
    Object.assign(computedStyles, layoutStyles);
    Object.assign(computedStyles, sizingStyles);
    Object.assign(computedStyles, borderStyles);
    Object.assign(computedStyles, textStyles);
    return computedStyles;
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
/******/ 	var __webpack_exports__ = __webpack_require__(383);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});