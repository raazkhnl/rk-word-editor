/// <reference types="vite/client" />

declare module '*.css';
declare module '*.css?inline' {
    const content: string;
    export default content;
}
declare module '@raazkhnl/rk-editor-ui/styles.css';
declare module '@raazkhnl/rk-editor-ui/styles';
