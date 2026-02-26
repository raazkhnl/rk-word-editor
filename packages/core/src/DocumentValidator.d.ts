import { JSONContent } from '@tiptap/core';
export declare class DocumentValidator {
    /**
     * Validates a Tiptap JSON content object against basic structural requirements.
     * Can be extended for more strict schema enforcement.
     */
    static validate(json: any): JSONContent;
    private static sanitizeNodes;
    /**
     * Returns a deterministic version of the JSON content.
     * Useful for comparison and storage.
     */
    static getDeterministicJSON(json: JSONContent): string;
}
