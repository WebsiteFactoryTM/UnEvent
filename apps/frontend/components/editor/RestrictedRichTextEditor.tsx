"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HeadingNode } from "@lexical/rich-text";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  EditorState,
} from "lexical";

import theme from "./Theme";
import { ToolbarPlugin } from "./ToolbarPlugin";
import { cn } from "@/lib/utils";

interface RestrictedRichTextEditorProps {
  initialValue?: any; // JSON object from Payload
  legacyValue?: string; // Fallback string for initialization
  onChange?: (editorState: any) => void;
  placeholder?: string;
  className?: string;
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you want user notifications, add them here.
function onError(error: Error) {
  console.error(error);
}

export function RestrictedRichTextEditor({
  initialValue,
  legacyValue,
  onChange,
  placeholder = "Enter text...",
  className,
}: RestrictedRichTextEditorProps) {
  const initialConfig = {
    namespace: "UnEventEditor",
    theme,
    onError,
    nodes: [HeadingNode, LinkNode, AutoLinkNode],
    editorState: (editor: any) => {
      // If we have rich text JSON, use it
      if (initialValue && Object.keys(initialValue).length > 0) {
        const state = editor.parseEditorState(initialValue);
        editor.setEditorState(state);
        return;
      }

      // If we have legacy string content, convert it to a paragraph
      if (legacyValue) {
        editor.update(() => {
          const root = $getRoot();
          const paragraph = $createParagraphNode();
          const text = $createTextNode(legacyValue);
          paragraph.append(text);
          root.append(paragraph);
        });
      }
    },
  };

  return (
    <div className={cn("relative border rounded-md shadow-sm", className)}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container rounded-md bg-background">
          <ToolbarPlugin />
          <div className="relative p-2 min-h-[150px]">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="outline-none min-h-[150px] text-sm text-foreground" />
              }
              placeholder={
                <div className="absolute top-2 left-2 text-muted-foreground pointer-events-none text-sm">
                  {placeholder}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <LinkPlugin />
            <OnChangePlugin
              onChange={(editorState: EditorState) => {
                if (onChange) {
                  const json = editorState.toJSON();
                  onChange(json);
                }
              }}
            />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
}
