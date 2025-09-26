import { SerializedNodes } from '@craftjs/core';
import { BlockStyles } from '../types/blocks';

// Specific props types for component metadata
type ComponentProps = 
  | { text?: string; fontSize?: string; color?: string; fontWeight?: string } // Text component props
  | { src?: string; alt?: string; width?: number; height?: number; objectFit?: string } // Image component props
  | { title?: string; subtitle?: string; backgroundColor?: string; layout?: string } // Block component props
  | { columns?: number; gap?: string; alignItems?: string; justifyContent?: string } // Container component props
  | { href?: string; target?: string; variant?: string; size?: string } // Button component props
  | { items?: unknown[]; type?: string; spacing?: string } // List component props
  | { headers?: string[]; rows?: string[][]; striped?: boolean } // Table component props
  | Record<string, unknown>; // Fallback for unknown props

// Interface for page data structure
export interface PageData {
  id?: string;
  title: string;
  slug: string;
  content: SerializedNodes;
  metadata?: {
    description?: string;
    keywords?: string[];
    author?: string;
    createdAt?: string;
    updatedAt?: string;
    version?: string;
    lastModifiedBy?: string;
  };
}

// Interface for component metadata
export interface ComponentMetadata {
  id: string;
  type: string;
  displayName: string;
  props: ComponentProps;
  children?: string[];
  parent?: string;
  styles?: BlockStyles;
  isCanvas?: boolean;
  hidden?: boolean;
}

// Craft.js Serializer Service
export class CraftSerializer {
  /**
   * Serialize Craft.js editor state to JSON
   */
  static serialize(nodes: SerializedNodes): string {
    try {
      const serializedData = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        nodes: nodes,
        metadata: {
          componentCount: Object.keys(nodes).length,
          rootNode: this.findRootNode(nodes)
        }
      };
      
      return JSON.stringify(serializedData, null, 2);
    } catch (error) {
      console.error('Error serializing Craft.js data:', error);
      throw new Error('Failed to serialize editor content');
    }
  }

  /**
   * Deserialize JSON to Craft.js editor state
   */
  static deserialize(jsonString: string): SerializedNodes {
    try {
      const data = JSON.parse(jsonString);
      
      // Validate structure
      if (!data.nodes) {
        throw new Error('Invalid JSON structure: missing nodes');
      }
      
      // Version compatibility check
      if (data.version && !this.isCompatibleVersion(data.version)) {
        console.warn(`Version mismatch: ${data.version}. Some features may not work correctly.`);
      }
      
      return data.nodes;
    } catch (error) {
      console.error('Error deserializing Craft.js data:', error);
      throw new Error('Failed to deserialize editor content');
    }
  }

  /**
   * Create a page data object
   */
  static createPageData(
    title: string,
    slug: string,
    nodes: SerializedNodes,
    metadata?: PageData['metadata']
  ): PageData {
    return {
      title,
      slug,
      content: nodes,
      metadata: {
        ...metadata,
        updatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Extract component metadata from serialized nodes
   */
  static extractComponentMetadata(nodes: SerializedNodes): ComponentMetadata[] {
    const components: ComponentMetadata[] = [];
    
    Object.entries(nodes).forEach(([nodeId, node]) => {
      if (node.type && typeof node.type === 'object' && 'resolvedName' in node.type) {
        components.push({
          id: nodeId,
          type: node.type.resolvedName as string,
          displayName: node.displayName || node.type.resolvedName as string,
          props: node.props || {},
          children: node.nodes || [],
          parent: node.parent || undefined
        });
      }
    });
    
    return components;
  }

  /**
   * Validate serialized nodes structure
   */
  static validateNodes(nodes: SerializedNodes): boolean {
    try {
      // Check if nodes is an object
      if (typeof nodes !== 'object' || nodes === null) {
        return false;
      }
      
      // Check if all nodes have required properties
      for (const [nodeId, node] of Object.entries(nodes)) {
        if (!node.type || !node.props) {
          console.warn(`Invalid node structure for node ${nodeId}`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error validating nodes:', error);
      return false;
    }
  }

  /**
   * Clean up serialized nodes (remove unnecessary data)
   */
  static cleanNodes(nodes: SerializedNodes): SerializedNodes {
    const cleanedNodes: SerializedNodes = {};
    
    Object.entries(nodes).forEach(([nodeId, node]) => {
      cleanedNodes[nodeId] = {
        type: node.type,
        props: node.props,
        displayName: node.displayName,
        custom: node.custom,
        parent: node.parent,
        nodes: node.nodes,
        linkedNodes: node.linkedNodes
      };
    });
    
    return cleanedNodes;
  }

  // Private helper methods
  private static findRootNode(nodes: SerializedNodes): string | null {
    for (const [nodeId, node] of Object.entries(nodes)) {
      if (!node.parent) {
        return nodeId;
      }
    }
    return null;
  }

  private static isCompatibleVersion(version: string): boolean {
    // Simple version compatibility check
    const [major] = version.split('.');
    return major === '1';
  }
}

// Export utility functions
export const serializeCraftData = CraftSerializer.serialize;
export const deserializeCraftData = CraftSerializer.deserialize;
export const validateCraftNodes = CraftSerializer.validateNodes;
export const createPageData = CraftSerializer.createPageData;