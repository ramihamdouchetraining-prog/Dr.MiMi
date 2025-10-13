import { Node, mergeAttributes } from '@tiptap/core';

export interface CalloutOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (type?: 'info' | 'warning' | 'success' | 'danger' | 'note') => ReturnType;
      toggleCallout: (type?: 'info' | 'warning' | 'success' | 'danger' | 'note') => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: 'callout',

  group: 'block',

  content: 'block+',

  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-type') || 'info',
        renderHTML: attributes => {
          return {
            'data-type': attributes.type,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-callout]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const type = HTMLAttributes['data-type'] || 'info';
    
    const styles: Record<string, string> = {
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-900 dark:text-blue-100',
      warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-900 dark:text-yellow-100',
      success: 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-900 dark:text-green-100',
      danger: 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100',
      note: 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-900 dark:text-purple-100',
    };

    const icons: Record<string, string> = {
      info: 'ℹ️',
      warning: '⚠️',
      success: '✅',
      danger: '🚨',
      note: '📝',
    };

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-callout': '',
        class: `callout callout-${type} ${styles[type]} border-l-4 rounded-r-lg p-4 my-4`,
      }),
      [
        'div',
        { class: 'flex items-start gap-3' },
        [
          'span',
          { class: 'text-2xl flex-shrink-0 mt-0.5' },
          icons[type],
        ],
        [
          'div',
          { class: 'flex-1' },
          0,
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setCallout:
        (type = 'info') =>
        ({ commands }) => {
          return commands.wrapIn(this.name, { type });
        },
      toggleCallout:
        (type = 'info') =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, { type });
        },
    };
  },
});
