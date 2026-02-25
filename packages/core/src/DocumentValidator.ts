import { JSONContent } from '@tiptap/core';

export class DocumentValidator {
  /**
   * Validates a Tiptap JSON content object against basic structural requirements.
   * Can be extended for more strict schema enforcement.
   */
  public static validate(json: any): JSONContent {
    if (!json || typeof json !== 'object') {
      return { type: 'doc', content: [] };
    }

    if (json.type !== 'doc') {
      console.warn('DocumentValidator: Invalid root type. Fixing to "doc".');
      json.type = 'doc';
    }

    if (!Array.isArray(json.content)) {
      console.warn('DocumentValidator: Content is not an array. Fixing to empty array.');
      json.content = [];
    }

    // Perform recursive sanitization if needed
    this.sanitizeNodes(json.content);

    return json as JSONContent;
  }

  private static sanitizeNodes(nodes: any[]) {
    nodes.forEach((node, index) => {
      if (!node || typeof node !== 'object' || !node.type) {
        console.warn(`DocumentValidator: Removing invalid node at index ${index}`);
        nodes.splice(index, 1);
        return;
      }

      // Ensure content is handled correctly
      if (node.content && !Array.isArray(node.content)) {
        node.content = [];
      }

      if (node.content) {
        this.sanitizeNodes(node.content);
      }
    });
  }

  /**
   * Returns a deterministic version of the JSON content.
   * Useful for comparison and storage.
   */
  public static getDeterministicJSON(json: JSONContent): string {
    return JSON.stringify(json, Object.keys(json).sort());
  }
}
