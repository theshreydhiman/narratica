import { Editor } from '@tiptap/react';
import { ScreenplayElement } from './extensions';

interface ScreenplayToolbarProps {
  activeElement: ScreenplayElement | null;
  onSetElement: (element: ScreenplayElement) => void;
  editor: Editor | null;
}

const elements: { key: ScreenplayElement; label: string; shortcut: string }[] = [
  { key: 'scene-heading', label: 'Scene', shortcut: '1' },
  { key: 'action', label: 'Action', shortcut: '2' },
  { key: 'character', label: 'Character', shortcut: '3' },
  { key: 'dialogue', label: 'Dialogue', shortcut: '4' },
  { key: 'parenthetical', label: 'Paren', shortcut: '5' },
  { key: 'transition', label: 'Transition', shortcut: '6' },
];

export default function ScreenplayToolbar({ activeElement, onSetElement, editor }: ScreenplayToolbarProps) {
  if (!editor) return null;

  return (
    <div className="screenplay-toolbar">
      <div className="flex items-center gap-1">
        {elements.map((el) => (
          <button
            key={el.key}
            onClick={() => onSetElement(el.key)}
            className={`screenplay-toolbar-btn ${activeElement === el.key ? 'active' : ''}`}
            title={`${el.label} (Ctrl+${el.shortcut})`}
          >
            {el.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 ml-auto">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`screenplay-toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`screenplay-toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`screenplay-toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
      </div>
    </div>
  );
}
