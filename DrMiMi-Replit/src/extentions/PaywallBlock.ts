import { Node, mergeAttributes } from '@tiptap/core';

export interface PaywallBlockOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paywallBlock: {
      setPaywallBlock: (config?: {
        price?: number;
        currency?: string;
        previewLines?: number;
        buttonText?: string;
      }) => ReturnType;
    };
  }
}

export const PaywallBlock = Node.create<PaywallBlockOptions>({
  name: 'paywallBlock',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      price: {
        default: 500,
        parseHTML: element => parseFloat(element.getAttribute('data-price') || '500'),
        renderHTML: attributes => {
          return {
            'data-price': attributes.price,
          };
        },
      },
      currency: {
        default: 'DZD',
        parseHTML: element => element.getAttribute('data-currency') || 'DZD',
        renderHTML: attributes => {
          return {
            'data-currency': attributes.currency,
          };
        },
      },
      previewLines: {
        default: 3,
        parseHTML: element => parseInt(element.getAttribute('data-preview-lines') || '3'),
        renderHTML: attributes => {
          return {
            'data-preview-lines': attributes.previewLines,
          };
        },
      },
      buttonText: {
        default: 'Débloquer le contenu',
        parseHTML: element => element.getAttribute('data-button-text') || 'Débloquer le contenu',
        renderHTML: attributes => {
          return {
            'data-button-text': attributes.buttonText,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="paywall-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'paywall-block',
        class: 'paywall-block my-6',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setPaywallBlock:
        (config = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              price: config.price || 500,
              currency: config.currency || 'DZD',
              previewLines: config.previewLines || 3,
              buttonText: config.buttonText || 'Débloquer le contenu',
            },
          });
        },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.className = 'paywall-block relative my-6 border-2 border-amber-400 dark:border-amber-600 rounded-lg overflow-hidden';
      dom.setAttribute('data-type', 'paywall-block');

      const price = node.attrs.price || 500;
      const currency = node.attrs.currency || 'DZD';
      const buttonText = node.attrs.buttonText || 'Débloquer le contenu';
      const previewLines = node.attrs.previewLines || 3;

      dom.innerHTML = `
        <div class="bg-gradient-to-b from-transparent via-white/50 to-white dark:via-gray-800/50 dark:to-gray-800 p-6">
          <!-- Blur preview -->
          <div class="relative mb-4">
            <div class="blur-sm select-none pointer-events-none text-gray-500 dark:text-gray-400">
              ${Array(previewLines).fill('<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>').join('')}
            </div>
            <div class="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-gray-800"></div>
          </div>

          <!-- Lock icon and message -->
          <div class="text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
              <svg class="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            
            <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              🔒 Contenu Premium
            </h3>
            
            <p class="text-gray-600 dark:text-gray-400 mb-4">
              Ce contenu est réservé aux abonnés premium
            </p>

            <div class="flex items-center justify-center gap-2 mb-4">
              <span class="text-3xl font-bold text-amber-600 dark:text-amber-400">
                ${price.toLocaleString()} ${currency}
              </span>
            </div>

            <button class="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-lg transform transition hover:scale-105">
              ${buttonText} →
            </button>

            <p class="text-xs text-gray-500 dark:text-gray-500 mt-3">
              ✓ Accès illimité • ✓ Téléchargement PDF • ✓ Support 24/7
            </p>
          </div>
        </div>
      `;

      // Make paywall editable on click
      dom.addEventListener('click', (e) => {
        e.preventDefault();
        if (editor.isEditable) {
          const newPrice = prompt('Prix:', String(price));
          const newCurrency = prompt('Devise (DZD/EUR):', currency);
          
          if (newPrice && newCurrency && typeof getPos === 'function') {
            editor.chain()
              .focus()
              .setNodeSelection(getPos())
              .deleteSelection()
              .setPaywallBlock({
                price: parseFloat(newPrice),
                currency: newCurrency,
                previewLines,
                buttonText,
              })
              .run();
          }
        }
      });

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.type.name !== this.name) {
            return false;
          }
          return true;
        },
      };
    };
  },
});
