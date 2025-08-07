import { FigmaNode, OverrideData } from '../types';
import { safeToString, escapeHtmlAttribute, safeHasProperty } from '../html/utils';

// Node processing functions
export function getAllNodeIds(node: FigmaNode): string[] {
  const ids = [node.id];
  if (node.children) {
    for (const child of node.children) {
      ids.push(...getAllNodeIds(child));
    }
  }
  return ids;
}

export function findNodeById(node: FigmaNode, id: string): FigmaNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

export function applyOverrides(node: FigmaNode, overrideData: OverrideData): FigmaNode {
  // Simple implementation - just return the node
  // In a full implementation, this would apply dynamic overrides
  return node;
}

// Function to get all components from a component set instance
export async function getComponentSetFromInstance(instance: any): Promise<any[]> {
  const components: any[] = [];
  
  try {
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
    
    // Check if this is an instance
    if (instance.type === 'INSTANCE') {
      console.log('Found instance, checking if it has componentProperties...');
      
      // Check if this instance has component properties (indicates it's from a component set)
      if (instance.componentProperties && instance.componentProperties['Property 1']) {
        console.log('Instance has componentProperties:', instance.componentProperties);
        
        // Get the main component that this instance is based on using the async method
        const mainComponent = await instance.getMainComponentAsync();
        console.log('Main component:', mainComponent ? {
          id: mainComponent.id,
          name: mainComponent.name,
          type: mainComponent.type
        } : 'null');
        
        let componentSet = null;
        
        if (mainComponent && mainComponent.type === 'COMPONENT_SET') {
          // Direct component set
          componentSet = mainComponent;
          console.log('Found direct component set');
        } else if (mainComponent && mainComponent.type === 'COMPONENT') {
          // Single component - need to find its parent component set
          console.log('Main component is a single component, looking for parent component set...');
          
          // Try to get the parent of the main component
          const parent = mainComponent.parent;
          if (parent && parent.type === 'COMPONENT_SET') {
            componentSet = parent;
            console.log('Found parent component set:', {
              id: (componentSet as any).id,
              name: (componentSet as any).name,
              type: (componentSet as any).type
            });
          } else {
            console.log('Parent is not a component set:', parent ? {
              id: (parent as any).id,
              name: (parent as any).name,
              type: (parent as any).type
            } : 'null');
          }
        }
        
        if (componentSet && (componentSet as any).type === 'COMPONENT_SET') {
          console.log('Found component set, getting all variants...');
          
          // Get all children of the component set (these are the variants)
          const variants = (componentSet as any).children || [];
          console.log('Found', variants.length, 'variants in component set');
          
          // Create a component for each variant
          variants.forEach((variant: any, index: number) => {
            console.log('Processing variant', index, ':', variant.name);
            
            // Create a component representation of this variant
            const componentFromVariant = {
              // Copy all the essential properties from the variant
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
              overrides: variant.overrides,
              // Mark this as a component from a variant
              isInstanceComponent: true,
              // Apply the variant properties based on the variant's name or properties
              variantProperties: {
                'Property 1': variant.name.toLowerCase().includes('start') ? 'start' : 'end'
              }
            };
            
            console.log('Created component from variant with properties:', {
              id: componentFromVariant.id,
              name: componentFromVariant.name,
              type: componentFromVariant.type,
              variantProperties: componentFromVariant.variantProperties,
              hasReactions: !!componentFromVariant.reactions,
              hasChildren: !!componentFromVariant.children
            });
            
            components.push(componentFromVariant);
          });
        } else {
          console.log('Could not find component set, falling back to instance processing');
          
          // Safely get the component property value, handling symbols
          let propertyValue = 'start'; // default value
          try {
            const property1 = instance.componentProperties['Property 1'];
            if (property1 && typeof property1 === 'object' && 'value' in property1) {
              propertyValue = String(property1.value);
            } else if (typeof property1 === 'string') {
              propertyValue = property1;
            } else if (typeof property1 === 'symbol') {
              propertyValue = property1.toString();
            }
          } catch (error) {
            console.warn('Error accessing component property value:', error);
            propertyValue = 'start'; // fallback
          }
          
          // Fallback: process the instance as a single component
          const componentFromInstance = {
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
            overrides: instance.overrides,
            // Mark this as a component from an instance
            isInstanceComponent: true,
            // Apply the variant properties
            variantProperties: {
              'Property 1': propertyValue
            }
          };
          
          console.log('Created component from instance with properties:', {
            id: componentFromInstance.id,
            name: componentFromInstance.name,
            type: componentFromInstance.type,
            variantProperties: componentFromInstance.variantProperties,
            hasReactions: !!componentFromInstance.reactions,
            hasChildren: !!componentFromInstance.children
          });
          
          components.push(componentFromInstance);
          console.log('Created component from instance with variant:', componentFromInstance.variantProperties);
        }
      } else {
        console.log('Instance does not have componentProperties, treating as regular instance');
      }
    } else {
      console.log('Not an instance, type is:', instance.type);
    }
  } catch (error) {
    console.warn('Error getting component set from instance:', error);
  }
  
  console.log('Returning', components.length, 'components');
  return components;
}

export function figmaNodeToObject(node: any): any {
  console.log('figmaNodeToObject called for node:', {
    type: node?.type,
    name: node?.name,
    id: node?.id,
    hasReactions: !!node?.reactions,
    hasChildren: !!node?.children,
    hasComponentProperties: !!node?.componentProperties
  });
  
  const commonProps = [
    'id', 'name', 'type', 'x', 'y', 'width', 'height', 'opacity',
    'fills', 'strokes', 'strokeWeight', 'cornerRadius', 'layoutMode',
    'primaryAxisAlignItems', 'counterAxisAlignItems', 'itemSpacing',
    'layoutSizingHorizontal', 'layoutSizingVertical', 'paddingLeft',
    'paddingRight', 'paddingTop', 'paddingBottom', 'fontSize',
    'fontName', 'fontFamily', 'fontWeight', 'textAlignHorizontal',
    'letterSpacing', 'lineHeight', 'characters', 'variantProperties',
    'reactions', 'children', 'clipsContent', 'layoutPositioning',
    // Add instance-specific properties
    'componentProperties', 'mainComponentId', 'overrides'
  ];

  const result: any = {};
  
  // Copy all properties that exist on the node
  for (const prop of commonProps) {
    if (safeHasProperty(node, prop)) {
      result[prop] = (node as any)[prop];
      console.log(`Copied property ${prop}:`, (node as any)[prop]);
    }
  }
  
  // For instances, also copy any additional properties that might be needed
  if (node.type === 'INSTANCE') {
    console.log('Processing INSTANCE node, available properties:', Object.keys(node));
    // Copy all enumerable properties from the instance
    for (const key in node) {
      if (node.hasOwnProperty(key) && !result.hasOwnProperty(key)) {
        try {
          // Only copy serializable properties
          if (typeof node[key] !== 'function') {
            result[key] = node[key];
            console.log(`Copied additional property ${key}:`, node[key]);
          }
        } catch (error) {
          // Skip properties that can't be serialized
          console.log(`Skipping non-serializable property: ${key}`);
        }
      }
    }
  }

  console.log('figmaNodeToObject result keys:', Object.keys(result));
  return result;
}

export async function exportNodeToVerboseJSON(node: any, parentId: string | null = null): Promise<any> {
  // Check if this is an instance of a component set
  const componentSetComponents = await getComponentSetFromInstance(node);
  
  if (componentSetComponents.length > 0) {
    console.log(`Exporting component set with ${componentSetComponents.length} components`);
    
    // Export all components from the set
    const componentExports = await Promise.all(
      componentSetComponents.map(async (component) => {
        const baseNodeData = figmaNodeToObject(component);
        
        return {
          ...baseNodeData,
          parentId: parentId,
          children: component.children ? await Promise.all(
            component.children.map((child: any) => exportNodeToVerboseJSON(child, component.id))
          ) : []
        };
      })
    );
    
    return componentExports;
  }
  
  // Use figmaNodeToObject to get all properties including fontName
  const baseNodeData = figmaNodeToObject(node);
  
  const nodeData = {
    ...baseNodeData,
    parentId: parentId,
    children: node.children ? await Promise.all(
      node.children.map((child: any) => exportNodeToVerboseJSON(child, node.id))
    ) : []
  };

  return nodeData;
} 