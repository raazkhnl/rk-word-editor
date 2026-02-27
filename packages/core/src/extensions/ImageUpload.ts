import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

/**
 * ImageUpload extension - Enables uploading images from PC via file input
 * and drag-and-drop onto the editor area.
 * Converts files to base64 data URLs and inserts them as img nodes.
 */
export const ImageUpload = Extension.create({
    name: 'imageUpload',

    addOptions() {
        return {
            maxFileSizeMB: 10,
            acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
            onUpload: null as ((file: File) => Promise<string>) | null,
        };
    },

    addCommands() {
        return {
            uploadImage: (file: File) => ({ commands }: { commands: any }) => {
                return this.options.onUpload
                    ? this.options.onUpload(file).then((src: string) =>
                        commands.setImage({ src, alt: file.name })
                    )
                    : new Promise<boolean>(resolve => {
                        const reader = new FileReader();
                        reader.onload = e => {
                            const src = e.target?.result as string;
                            commands.setImage({ src, alt: file.name });
                            resolve(true);
                        };
                        reader.onerror = () => resolve(false);
                        reader.readAsDataURL(file);
                    });
            },
            openImageUpload: () => () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        // Trigger the uploadImage command
                        (this.editor.commands as any).uploadImage(file);
                    }
                };
                input.click();
                return true;
            },
        } as any;
    },

    addProseMirrorPlugins() {
        const options = this.options;
        const editor = this.editor;

        return [
            new Plugin({
                key: new PluginKey('imageUpload'),
                props: {
                    handleDOMEvents: {
                        drop(_view: any, event: DragEvent) {
                            console.log('[ImageUpload] Drop event detected');
                            const files = event.dataTransfer?.files;
                            if (!files || files.length === 0) return false;

                            const imageFiles = Array.from(files).filter(f =>
                                options.acceptedTypes.includes(f.type)
                            );
                            if (imageFiles.length === 0) return false;

                            event.preventDefault();
                            imageFiles.forEach(file => {
                                console.log('[ImageUpload] Uploading dropped image:', file.name);
                                (editor.commands as any).uploadImage(file);
                            });
                            return true;
                        },
                    },
                    handlePaste: (_view: any, event: ClipboardEvent) => {
                        console.log('[ImageUpload] Paste event detected');
                        const items = event.clipboardData?.items;
                        if (!items) return false;

                        let handled = false;
                        Array.from(items).forEach(item => {
                            if (item.type.startsWith('image/')) {
                                const file = item.getAsFile();
                                if (file) {
                                    // Validate file size and type
                                    if (options.maxFileSizeMB && file.size > options.maxFileSizeMB * 1024 * 1024) {
                                        console.warn(`[ImageUpload] File too large: ${file.name}`);
                                        return;
                                    }
                                    if (options.acceptedTypes && !options.acceptedTypes.includes(file.type)) {
                                        console.warn(`[ImageUpload] Invalid file type: ${file.type}`);
                                        return;
                                    }

                                    console.log('[ImageUpload] Uploading pasted image:', file.name);
                                    event.preventDefault();
                                    (editor.commands as any).uploadImage(file);
                                    handled = true;
                                }
                            }
                        });
                        return handled;
                    },
                },
            }),
        ];
    },
});
