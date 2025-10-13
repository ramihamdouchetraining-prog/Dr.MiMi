import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';

export interface ImageGalleryOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageGallery: {
      setImageGallery: (images: { src: string; alt?: string; caption?: string }[]) => ReturnType;
    };
  }
}

export const ImageGallery = Node.create<ImageGalleryOptions>({
  name: 'imageGallery',

  group: 'block',

  content: 'inline*',

  addAttributes() {
    return {
      images: {
        default: [],
        parseHTML: element => {
          const imagesData = element.getAttribute('data-images');
          return imagesData ? JSON.parse(imagesData) : [];
        },
        renderHTML: attributes => {
          return {
            'data-images': JSON.stringify(attributes.images),
          };
        },
      },
      layout: {
        default: 'grid',
        parseHTML: element => element.getAttribute('data-layout') || 'grid',
        renderHTML: attributes => {
          return {
            'data-layout': attributes.layout,
          };
        },
      },
      columns: {
        default: 3,
        parseHTML: element => parseInt(element.getAttribute('data-columns') || '3'),
        renderHTML: attributes => {
          return {
            'data-columns': attributes.columns,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-gallery"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'image-gallery',
        class: 'image-gallery my-6',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setImageGallery:
        (images) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              images,
            },
          });
        },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div');
      dom.className = 'image-gallery my-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg';
      dom.setAttribute('data-type', 'image-gallery');
      
      const images = node.attrs.images || [];
      const layout = node.attrs.layout || 'grid';
      const columns = node.attrs.columns || 3;

      if (images.length === 0) {
        dom.innerHTML = `
          <div class="text-center text-gray-500 dark:text-gray-400 py-8">
            <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="font-medium">Galerie d'images</p>
            <p class="text-sm">Cliquez pour ajouter des images</p>
          </div>
        `;
      } else {
        const gridClass = layout === 'grid' 
          ? `grid grid-cols-${columns} gap-4` 
          : layout === 'masonry'
          ? 'columns-3 gap-4'
          : 'flex flex-nowrap gap-4 overflow-x-auto';

        const imagesHTML = images.map((img: any) => `
          <div class="relative group">
            <img 
              src="${img.src}" 
              alt="${img.alt || ''}" 
              class="w-full h-auto rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
            />
            ${img.caption ? `<p class="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">${img.caption}</p>` : ''}
          </div>
        `).join('');

        dom.innerHTML = `
          <div class="mb-2 flex justify-between items-center">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">📸 Galerie (${images.length} images)</span>
            <button class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800">
              Modifier
            </button>
          </div>
          <div class="${gridClass}">
            ${imagesHTML}
          </div>
        `;
      }

      // Make gallery editable on click
      dom.addEventListener('click', (e) => {
        e.preventDefault();
        if (editor.isEditable) {
          const urls = prompt(
            'Entrez les URLs des images séparées par des virgules:',
            images.map((img: any) => img.src).join(', ')
          );
          
          if (urls) {
            const newImages = urls.split(',').map(url => ({
              src: url.trim(),
              alt: '',
              caption: '',
            }));

            if (typeof getPos === 'function') {
              editor.chain()
                .focus()
                .setNodeSelection(getPos())
                .deleteSelection()
                .setImageGallery(newImages)
                .run();
            }
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
