import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Text from '@tiptap/extension-text';
import History from '@tiptap/extension-history';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import {
  SceneHeading,
  Action,
  CharacterCue,
  Dialogue,
  Parenthetical,
  Transition,
  screenplayAutoFormat,
  ScreenplayElement,
} from './extensions';
import ScreenplayToolbar from './ScreenplayToolbar';

interface ScreenplayEditorProps {
  content: string;
  onUpdate: (html: string) => void;
}

// Custom Document that defaults to Action block
const ScreenplayDocument = Document.extend({
  content: '(sceneHeading|action|characterCue|dialogue|parenthetical|transition)+',
});

// Plugin wrapper extension for auto-uppercase
const AutoFormat = Extension.create({
  name: 'screenplayAutoFormat',
  addProseMirrorPlugins() {
    return [screenplayAutoFormat];
  },
});

export default function ScreenplayEditor({ content, onUpdate }: ScreenplayEditorProps) {
  const editor = useEditor({
    extensions: [
      ScreenplayDocument,
      Text,
      History,
      Bold,
      Italic,
      Underline,
      SceneHeading,
      Action,
      CharacterCue,
      Dialogue,
      Parenthetical,
      Transition,
      AutoFormat,
      CharacterCount,
      Placeholder.configure({
        placeholder: ({ node }) => {
          switch (node.type.name) {
            case 'sceneHeading': return 'INT./EXT. LOCATION - TIME';
            case 'action': return 'Describe the scene...';
            case 'characterCue': return 'CHARACTER NAME';
            case 'dialogue': return 'Dialogue...';
            case 'parenthetical': return '(direction)';
            case 'transition': return 'CUT TO:';
            default: return 'Start writing...';
          }
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'screenplay-editor focus:outline-none min-h-[60vh]',
      },
    },
    content: content || '<div class="screenplay-action"></div>',
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  const setElement = (element: ScreenplayElement) => {
    if (!editor) return;
    const nodeMap: Record<ScreenplayElement, string> = {
      'scene-heading': 'sceneHeading',
      action: 'action',
      character: 'characterCue',
      dialogue: 'dialogue',
      parenthetical: 'parenthetical',
      transition: 'transition',
    };
    editor.chain().focus().setNode(nodeMap[element]).run();
  };

  const getActiveElement = (): ScreenplayElement | null => {
    if (!editor) return null;
    if (editor.isActive('sceneHeading')) return 'scene-heading';
    if (editor.isActive('action')) return 'action';
    if (editor.isActive('characterCue')) return 'character';
    if (editor.isActive('dialogue')) return 'dialogue';
    if (editor.isActive('parenthetical')) return 'parenthetical';
    if (editor.isActive('transition')) return 'transition';
    return null;
  };

  return (
    <div className="screenplay-page">
      <ScreenplayToolbar
        activeElement={getActiveElement()}
        onSetElement={setElement}
        editor={editor}
      />
      <div className="screenplay-paper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
