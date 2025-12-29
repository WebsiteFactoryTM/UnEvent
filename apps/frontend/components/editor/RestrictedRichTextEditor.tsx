"use client";

import { useState, useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HeadingNode } from "@lexical/rich-text";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  EditorState,
} from "lexical";

import { cn } from "@/lib/utils";
import theme from "./Theme";
import { ToolbarPlugin } from "./ToolbarPlugin";

interface RestrictedRichTextEditorProps {
  initialValue?: any; // JSON object from Payload
  legacyValue?: string; // Fallback string for initialization
  onChange?: (editorState: any) => void;
  placeholder?: string;
  className?: string;
  minCharacters?: number; // Minimum character count (default: 50)
  maxCharacters?: number; // Maximum character count (optional)
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you want user notifications, add them here.
function onError(error: Error) {
  console.error(error);
}

// Helper function to calculate character count from Lexical JSON
// Counts actual characters including spaces (without trimming individual nodes)
function getCharacterCount(value: unknown): number {
  if (!value || typeof value !== "object") return 0;

  const root = (value as any).root;
  if (!root || !Array.isArray(root.children)) return 0;

  const traverse = (node: any): number => {
    if (!node) return 0;

    if (node.type === "text" && typeof node.text === "string") {
      return node.text.length;
    }

    if (Array.isArray(node.children)) {
      return node.children.reduce(
        (len: number, child: any) => len + traverse(child),
        0,
      );
    }

    return 0;
  };

  return traverse(root);
}

export function RestrictedRichTextEditor({
  initialValue,
  legacyValue,
  onChange,
  placeholder = "Enter text...",
  className,
  minCharacters,
  maxCharacters,
}: RestrictedRichTextEditorProps) {
  const [characterCount, setCharacterCount] = useState<number>(0);

  // Calculate initial character count
  useEffect(() => {
    if (initialValue && Object.keys(initialValue).length > 0) {
      setCharacterCount(getCharacterCount(initialValue));
    } else if (legacyValue) {
      setCharacterCount(legacyValue.length);
    } else {
      setCharacterCount(0);
    }
  }, [initialValue, legacyValue]);

  const isBelowMinimum =
    minCharacters !== undefined && characterCount < minCharacters;
  const isAboveMaximum =
    maxCharacters !== undefined && characterCount > maxCharacters;
  const hasError = isBelowMinimum || isAboveMaximum;

  const initialConfig = {
    namespace: "UnEventEditor",
    theme,
    onError,
    nodes: [HeadingNode, LinkNode, AutoLinkNode, ListNode, ListItemNode],
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
            <ListPlugin />
            <OnChangePlugin
              onChange={(editorState: EditorState) => {
                const json = editorState.toJSON();
                const count = getCharacterCount(json);
                setCharacterCount(count);

                if (onChange) {
                  onChange(json);
                }
              }}
            />
          </div>
        </div>
        {/* Character count display */}
        <div className="px-2 pb-2 flex flex-col gap-1">
          {minCharacters !== undefined && (
            <div className="flex items-center justify-between text-xs">
              <span className={cn("text-muted-foreground")}>
                Minim {minCharacters} caractere necesare: {characterCount}
              </span>
            </div>
          )}

          {isAboveMaximum && (
            <p className="text-xs text-destructive">
              Maxim {maxCharacters} caractere permise
            </p>
          )}
        </div>
      </LexicalComposer>
    </div>
  );
}
