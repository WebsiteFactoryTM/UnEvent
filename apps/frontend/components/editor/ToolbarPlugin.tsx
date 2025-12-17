import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { useCallback, useEffect, useState } from "react";

import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  Heading3,
  Heading4,
  List,
  ListOrdered,
} from "lucide-react";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";

export const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [listType, setListType] = useState<"bullet" | "number" | null>(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));

      // Check for link
      const node = selection.anchor.getNode();
      const parent = node.getParent();
      if (parent && parent.getType() === "link") {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      // Check block type
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();

      // If we're inside a listitem, get the parent list
      if (element.getType() === "listitem") {
        const listParent = element.getParent();
        if (listParent && listParent.getType() === "list") {
          element = listParent;
        }
      }

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        if (element.getType() === "heading") {
          // @ts-ignore
          setBlockType(element.getTag());
          setListType(null);
        } else if (element.getType() === "list") {
          // @ts-ignore
          setListType(element.getListType());
          setBlockType("list");
        } else {
          setBlockType(element.getType());
          setListType(null);
        }
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        1,
      ),
    );
  }, [editor, updateToolbar]);

  const formatHeading = (headingSize: "h3" | "h4") => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    } else {
      // Toggle back to paragraph if already heading
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // @ts-ignore
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    }
  };

  const insertLink = useCallback(() => {
    if (!isLink) {
      // If not a link, verify we have a selection and add one
      const url = prompt("Enter URL:"); // Simple prompt for now, can be replaced with a modal
      if (!url) return;
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    } else {
      // Remove link
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  const insertUnorderedList = useCallback(() => {
    if (listType === "bullet") {
      // Remove list if already unordered
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      // Insert or convert to unordered list
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  }, [editor, listType]);

  const insertOrderedList = useCallback(() => {
    if (listType === "number") {
      // Remove list if already ordered
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      // Insert or convert to ordered list
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  }, [editor, listType]);

  return (
    <div className="flex items-center gap-1 border-b p-1 mb-2">
      <Toggle
        size="sm"
        pressed={isBold}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={isItalic}
        onPressedChange={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>

      <div className="w-px h-6 bg-border mx-1" />

      <Toggle
        size="sm"
        pressed={blockType === "h3"}
        onPressedChange={() => formatHeading("h3")}
        aria-label="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={blockType === "h4"}
        onPressedChange={() => formatHeading("h4")}
        aria-label="Heading 4"
      >
        <Heading4 className="h-4 w-4" />
      </Toggle>

      <div className="w-px h-6 bg-border mx-1" />

      <Toggle
        size="sm"
        pressed={listType === "bullet"}
        onPressedChange={insertUnorderedList}
        aria-label="Unordered List"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={listType === "number"}
        onPressedChange={insertOrderedList}
        aria-label="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <div className="w-px h-6 bg-border mx-1" />

      <Toggle
        size="sm"
        pressed={isLink}
        onPressedChange={insertLink}
        aria-label="Insert Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Toggle>
    </div>
  );
};
