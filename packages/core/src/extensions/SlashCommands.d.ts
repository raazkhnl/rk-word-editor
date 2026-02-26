import { Extension } from '@tiptap/core';
export interface SlashCommand {
    title: string;
    description: string;
    icon: string;
    command: (editor: any) => void;
}
declare const DEFAULT_COMMANDS: SlashCommand[];
export declare const SlashCommands: Extension<any, any>;
export { DEFAULT_COMMANDS as defaultSlashCommands };
