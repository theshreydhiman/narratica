import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { TextSelection } from '@tiptap/pm/state';

// ── Screenplay element types ──────────────────────────────
export type ScreenplayElement =
  | 'scene-heading'
  | 'action'
  | 'character'
  | 'dialogue'
  | 'parenthetical'
  | 'transition';

// ── Scene Heading (Slug Line) ─────────────────────────────
// e.g. INT. COFFEE SHOP - DAY
export const SceneHeading = Node.create({
  name: 'sceneHeading',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      class: { default: 'screenplay-scene-heading' },
    };
  },

  parseHTML() {
    return [{ tag: 'div.screenplay-scene-heading' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'screenplay-scene-heading' }), 0];
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        // After a scene heading, go to action
        if (editor.isActive('sceneHeading')) {
          return editor.chain()
            .splitBlock()
            .setNode('action')
            .run();
        }
        return false;
      },
    };
  },
});

// ── Action ────────────────────────────────────────────────
// Scene description / stage direction
export const Action = Node.create({
  name: 'action',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      class: { default: 'screenplay-action' },
    };
  },

  parseHTML() {
    return [{ tag: 'div.screenplay-action' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'screenplay-action' }), 0];
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        if (editor.isActive('action')) {
          return editor.chain()
            .splitBlock()
            .setNode('action')
            .run();
        }
        return false;
      },
    };
  },
});

// ── Character Cue ─────────────────────────────────────────
// Character name above dialogue, e.g. JOHN
export const CharacterCue = Node.create({
  name: 'characterCue',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      class: { default: 'screenplay-character' },
    };
  },

  parseHTML() {
    return [{ tag: 'div.screenplay-character' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'screenplay-character' }), 0];
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        // After character name, go to dialogue
        if (editor.isActive('characterCue')) {
          return editor.chain()
            .splitBlock()
            .setNode('dialogue')
            .run();
        }
        return false;
      },
    };
  },
});

// ── Dialogue ──────────────────────────────────────────────
export const Dialogue = Node.create({
  name: 'dialogue',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      class: { default: 'screenplay-dialogue' },
    };
  },

  parseHTML() {
    return [{ tag: 'div.screenplay-dialogue' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'screenplay-dialogue' }), 0];
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        // After dialogue, go to action
        if (editor.isActive('dialogue')) {
          return editor.chain()
            .splitBlock()
            .setNode('action')
            .run();
        }
        return false;
      },
    };
  },
});

// ── Parenthetical ─────────────────────────────────────────
// e.g. (whispering)
export const Parenthetical = Node.create({
  name: 'parenthetical',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      class: { default: 'screenplay-parenthetical' },
    };
  },

  parseHTML() {
    return [{ tag: 'div.screenplay-parenthetical' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'screenplay-parenthetical' }), 0];
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        // After parenthetical, go to dialogue
        if (editor.isActive('parenthetical')) {
          return editor.chain()
            .splitBlock()
            .setNode('dialogue')
            .run();
        }
        return false;
      },
    };
  },
});

// ── Transition ────────────────────────────────────────────
// e.g. CUT TO:, FADE OUT.
export const Transition = Node.create({
  name: 'transition',
  group: 'block',
  content: 'inline*',
  defining: true,

  addAttributes() {
    return {
      class: { default: 'screenplay-transition' },
    };
  },

  parseHTML() {
    return [{ tag: 'div.screenplay-transition' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'screenplay-transition' }), 0];
  },

  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        // After transition, go to scene heading
        if (editor.isActive('transition')) {
          return editor.chain()
            .splitBlock()
            .setNode('sceneHeading')
            .run();
        }
        return false;
      },
    };
  },
});

// ── Auto-uppercase plugin for scene headings, characters, transitions ──
export const screenplayAutoFormat = new Plugin({
  key: new PluginKey('screenplayAutoFormat'),
  appendTransaction(transactions, _oldState, newState) {
    const { doc, tr } = newState;
    let modified = false;

    doc.descendants((node, pos) => {
      if (
        node.type.name === 'sceneHeading' ||
        node.type.name === 'characterCue' ||
        node.type.name === 'transition'
      ) {
        node.content.forEach((child, offset) => {
          if (child.isText && child.text) {
            const upper = child.text.toUpperCase();
            if (child.text !== upper) {
              const from = pos + 1 + offset;
              const to = from + child.text.length;
              tr.replaceWith(from, to, newState.schema.text(upper, child.marks));
              modified = true;
            }
          }
        });
      }
    });

    return modified ? tr : null;
  },
});
