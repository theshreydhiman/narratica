import { Extension } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface GhostTextStorage {
  text: string | null;
}

const ghostTextPluginKey = new PluginKey('ghostText');

export const GhostText = Extension.create<Record<string, never>, GhostTextStorage>({
  name: 'ghostText',

  addStorage() {
    return { text: null };
  },

  addCommands() {
    return {
      setGhostText:
        (text: string) =>
        ({ editor }) => {
          editor.storage.ghostText.text = text;
          // Force a decoration update by dispatching an empty transaction
          const { tr } = editor.state;
          editor.view.dispatch(tr.setMeta(ghostTextPluginKey, { text }));
          return true;
        },
      clearGhostText:
        () =>
        ({ editor }) => {
          editor.storage.ghostText.text = null;
          const { tr } = editor.state;
          editor.view.dispatch(tr.setMeta(ghostTextPluginKey, { text: null }));
          return true;
        },
      acceptGhostText:
        () =>
        ({ editor }) => {
          const ghostText = editor.storage.ghostText.text;
          if (!ghostText) return false;
          editor.storage.ghostText.text = null;
          editor.chain().focus().insertContent(ghostText).run();
          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        if (editor.storage.ghostText.text) {
          editor.commands.acceptGhostText();
          return true;
        }
        return false;
      },
      Escape: ({ editor }) => {
        if (editor.storage.ghostText.text) {
          editor.commands.clearGhostText();
          return true;
        }
        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: ghostTextPluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldSet) {
            const meta = tr.getMeta(ghostTextPluginKey);
            if (meta !== undefined) {
              const text = meta.text;
              if (!text) return DecorationSet.empty;

              const { selection } = tr;
              const pos = selection.$head.pos;

              const widget = Decoration.widget(pos, () => {
                const span = document.createElement('span');
                span.className = 'ghost-text';
                span.textContent = text;
                return span;
              }, { side: 1 });

              return DecorationSet.create(tr.doc, [widget]);
            }

            // Map decorations through document changes
            if (tr.docChanged) {
              // Clear ghost text when user types
              extension.storage.text = null;
              return DecorationSet.empty;
            }

            return oldSet.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state) || DecorationSet.empty;
          },
        },
      }),
    ];
  },
});

// Extend TipTap's Commands interface
declare module '@tiptap/react' {
  interface Commands<ReturnType> {
    ghostText: {
      setGhostText: (text: string) => ReturnType;
      clearGhostText: () => ReturnType;
      acceptGhostText: () => ReturnType;
    };
  }
}
