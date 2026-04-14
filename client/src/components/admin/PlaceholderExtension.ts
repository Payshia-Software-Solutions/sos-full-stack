
import { Node, mergeAttributes, InputRule } from '@tiptap/core';

export interface PlaceholderOptions {
  HTMLAttributes: Record<string, any>;
}

export const Placeholder = Node.create<PlaceholderOptions>({
  name: 'placeholder',

  group: 'inline',

  inline: true,

  selectable: true,

  draggable: true,

  atom: true,

  addAttributes() {
    return {
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-placeholder'),
        renderHTML: attributes => {
          if (!attributes.label) {
            return {};
          }

          return {
            'data-placeholder': attributes.label,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-placeholder]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-700 mx-0.5 select-none cursor-default',
      }),
      `${node.attrs.label}`,
    ];
  },

  renderText({ node }) {
    return `${node.attrs.label}`;
  },

  addCommands() {
    return {
      setPlaceholder:
        attributes =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: /\{\{([a-zA-Z0-9_]+)\}\}\s?$/,
        handler: ({ state, range, match }) => {
          const start = range.from;
          const end = range.to;
          const label = match[0].trim();

          state.tr.replaceWith(
            start,
            end,
            this.type.create({
              label,
            })
          );
        },
      }),
    ];
  },
});
