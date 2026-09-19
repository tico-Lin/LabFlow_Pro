declare module "@toast-ui/editor" {
  export type EditorType = "markdown" | "wysiwyg";
  export type PreviewStyle = "tab" | "vertical";

  export type EditorOptions = {
    el: HTMLElement;
    height?: string;
    minHeight?: string;
    initialValue?: string;
    previewStyle?: PreviewStyle;
    initialEditType?: EditorType;
    hideModeSwitch?: boolean;
    usageStatistics?: boolean;
    autofocus?: boolean;
    placeholder?: string;
    toolbarItems?: string[][];
    theme?: string;
    events?: {
      change?: () => void;
    };
  };

  export class Editor {
    constructor(options: EditorOptions);
    destroy(): void;
    getMarkdown(): string;
    setMarkdown(markdown: string, cursorToEnd?: boolean): void;
  }

  export default Editor;
}