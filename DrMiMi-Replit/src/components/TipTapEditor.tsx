import React, { useCallback, useMemo } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Placeholder } from '@tiptap/extension-placeholder';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { Youtube } from '@tiptap/extension-youtube';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Typography } from '@tiptap/extension-typography';
import { common, createLowlight } from 'lowlight';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Table as TableIcon, Image as ImageIcon, Youtube as YoutubeIcon,
  Link as LinkIcon, Undo, Redo, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Highlighter, CheckSquare, FileCode, GalleryHorizontal, X, Save, Eye, Lock,
  Info, AlertTriangle, CheckCircle, ShieldAlert, Layout,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageGallery } from '../extentions/ImageGallery';
import { Callout } from '../extentions/Callout';
import { PaywallBlock } from '../extentions/PaywallBlock';
import { editorTemplates } from '../utils/editorTemplates';

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

interface TipTapEditorProps {
  content?: any;
  onChange?: (content: any) => void;
  onSave?: (content: any) => void;
  placeholder?: string;
  editable?: boolean;
  showToolbar?: boolean;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  content,
  onChange,
  onSave,
  placeholder = "Tapez '/' pour insérer un bloc ou commencez à écrire...",
  editable = true,
  showToolbar = true,
}) => {
  const [showTemplates, setShowTemplates] = React.useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We use CodeBlockLowlight instead
      }),
      Underline,
      TextStyle,
      Color,
      Subscript,
      Superscript,
      Typography,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg shadow-md my-4',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 dark:bg-gray-800 font-semibold text-left p-2',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 dark:border-gray-600 p-2',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 480,
        nocookie: true,
        HTMLAttributes: {
          class: 'rounded-lg shadow-lg my-4',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 rounded-lg p-4 my-4 overflow-x-auto',
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `Titre ${node.attrs.level}...`;
          }
          return placeholder;
        },
      }),
      ImageGallery.configure({
        HTMLAttributes: {
          class: 'image-gallery my-6',
        },
      }),
      Callout.configure({
        HTMLAttributes: {
          class: 'callout',
        },
      }),
      PaywallBlock.configure({
        HTMLAttributes: {
          class: 'paywall-block',
        },
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  // Image upload handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        editor?.chain().focus().setImage({ src: reader.result as string }).run();
      };
      reader.readAsDataURL(file);
    });
  }, [editor]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    noClick: true,
  });

  // Toolbar actions
  const toolbarActions = useMemo(() => [
    {
      group: 'history',
      items: [
        { icon: Undo, action: () => editor?.chain().focus().undo().run(), isActive: false, title: 'Annuler' },
        { icon: Redo, action: () => editor?.chain().focus().redo().run(), isActive: false, title: 'Refaire' },
      ],
    },
    {
      group: 'formatting',
      items: [
        { icon: Bold, action: () => editor?.chain().focus().toggleBold().run(), isActive: editor?.isActive('bold'), title: 'Gras' },
        { icon: Italic, action: () => editor?.chain().focus().toggleItalic().run(), isActive: editor?.isActive('italic'), title: 'Italique' },
        { icon: UnderlineIcon, action: () => editor?.chain().focus().toggleUnderline().run(), isActive: editor?.isActive('underline'), title: 'Souligné' },
        { icon: Strikethrough, action: () => editor?.chain().focus().toggleStrike().run(), isActive: editor?.isActive('strike'), title: 'Barré' },
        { icon: Highlighter, action: () => editor?.chain().focus().toggleHighlight().run(), isActive: editor?.isActive('highlight'), title: 'Surligné' },
      ],
    },
    {
      group: 'headings',
      items: [
        { icon: Heading1, action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor?.isActive('heading', { level: 1 }), title: 'Titre 1' },
        { icon: Heading2, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor?.isActive('heading', { level: 2 }), title: 'Titre 2' },
        { icon: Heading3, action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor?.isActive('heading', { level: 3 }), title: 'Titre 3' },
      ],
    },
    {
      group: 'alignment',
      items: [
        { icon: AlignLeft, action: () => editor?.chain().focus().setTextAlign('left').run(), isActive: editor?.isActive({ textAlign: 'left' }), title: 'Aligner à gauche' },
        { icon: AlignCenter, action: () => editor?.chain().focus().setTextAlign('center').run(), isActive: editor?.isActive({ textAlign: 'center' }), title: 'Centrer' },
        { icon: AlignRight, action: () => editor?.chain().focus().setTextAlign('right').run(), isActive: editor?.isActive({ textAlign: 'right' }), title: 'Aligner à droite' },
        { icon: AlignJustify, action: () => editor?.chain().focus().setTextAlign('justify').run(), isActive: editor?.isActive({ textAlign: 'justify' }), title: 'Justifier' },
      ],
    },
    {
      group: 'lists',
      items: [
        { icon: List, action: () => editor?.chain().focus().toggleBulletList().run(), isActive: editor?.isActive('bulletList'), title: 'Liste à puces' },
        { icon: ListOrdered, action: () => editor?.chain().focus().toggleOrderedList().run(), isActive: editor?.isActive('orderedList'), title: 'Liste numérotée' },
        { icon: CheckSquare, action: () => editor?.chain().focus().toggleTaskList().run(), isActive: editor?.isActive('taskList'), title: 'Liste de tâches' },
      ],
    },
    {
      group: 'blocks',
      items: [
        { icon: Quote, action: () => editor?.chain().focus().toggleBlockquote().run(), isActive: editor?.isActive('blockquote'), title: 'Citation' },
        { icon: FileCode, action: () => editor?.chain().focus().toggleCodeBlock().run(), isActive: editor?.isActive('codeBlock'), title: 'Bloc de code' },
        { icon: TableIcon, action: () => editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), isActive: false, title: 'Tableau' },
      ],
    },
    {
      group: 'media',
      items: [
        { icon: ImageIcon, action: () => document.getElementById('image-upload')?.click(), isActive: false, title: 'Image' },
        { icon: GalleryHorizontal, action: () => {
          const urls = prompt('URLs des images (séparées par des virgules):');
          if (urls) {
            const images = urls.split(',').map(url => ({ src: url.trim(), alt: '', caption: '' }));
            editor?.chain().focus().setImageGallery(images).run();
          }
        }, isActive: false, title: 'Galerie d\'images' },
        { icon: YoutubeIcon, action: () => {
          const url = prompt('URL YouTube:');
          if (url) editor?.chain().focus().setYoutubeVideo({ src: url }).run();
        }, isActive: false, title: 'Vidéo YouTube' },
        { icon: LinkIcon, action: () => {
          const url = prompt('URL:');
          if (url) editor?.chain().focus().setLink({ href: url }).run();
        }, isActive: editor?.isActive('link'), title: 'Lien' },
      ],
    },
    {
      group: 'blocks-advanced',
      items: [
        { icon: Info, action: () => editor?.chain().focus().setCallout('info').run(), isActive: editor?.isActive('callout', { type: 'info' }), title: 'Callout Info' },
        { icon: AlertTriangle, action: () => editor?.chain().focus().setCallout('warning').run(), isActive: editor?.isActive('callout', { type: 'warning' }), title: 'Callout Warning' },
        { icon: CheckCircle, action: () => editor?.chain().focus().setCallout('success').run(), isActive: editor?.isActive('callout', { type: 'success' }), title: 'Callout Success' },
        { icon: ShieldAlert, action: () => editor?.chain().focus().setCallout('danger').run(), isActive: editor?.isActive('callout', { type: 'danger' }), title: 'Callout Danger' },
        { icon: Lock, action: () => editor?.chain().focus().setPaywallBlock().run(), isActive: false, title: 'Paywall' },
      ],
    },
  ], [editor]);

  if (!editor) return null;

  return (
    <div className="w-full">
      {showToolbar && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
          <div className="flex flex-wrap items-center gap-1 p-2">
            {toolbarActions.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                {groupIndex > 0 && <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />}
                {group.items.map((item, itemIndex) => (
                  <motion.button
                    key={itemIndex}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={item.action}
                    className={`p-2 rounded-md transition-colors ${
                      item.isActive
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    title={item.title}
                  >
                    <item.icon className="w-4 h-4" />
                  </motion.button>
                ))}
              </React.Fragment>
            ))}
            <div className="ml-auto flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                <Layout className="w-4 h-4" />
                Templates
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSave?.(editor.getJSON())}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <Eye className="w-4 h-4" />
                Aperçu
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTemplates(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    📚 Templates Avancés
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Choisissez un template pour démarrer rapidement
                  </p>
                </div>
                <button
                  onClick={() => setShowTemplates(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {editorTemplates.map((template) => (
                    <motion.button
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        editor?.commands.setContent(template.content);
                        onChange?.(template.content);
                        setShowTemplates(false);
                      }}
                      className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-400 transition-all text-left group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{template.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                            {template.name}
                          </h3>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {template.nameEn}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {template.nameAr}
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              template.category === 'medical' 
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                : template.category === 'educational'
                                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}>
                              {template.category === 'medical' ? '🏥 Médical' : 
                               template.category === 'educational' ? '📚 Éducatif' : 
                               '📄 Administratif'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        {...getRootProps()}
        className={`relative min-h-[500px] ${isDragActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
      >
        <input {...getInputProps()} id="image-upload" className="hidden" />
        
        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 dark:bg-blue-900/50 z-10 rounded-lg">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <p className="text-blue-600 font-medium">Déposez vos images ici</p>
            </div>
          </div>
        )}

        {/* FloatingMenu temporarily disabled - will be reimplemented */}

        {/* BubbleMenu temporarily disabled - will be reimplemented */}

        <EditorContent
          editor={editor}
          className="prose prose-lg dark:prose-invert max-w-none p-6 focus:outline-none"
        />
      </div>
    </div>
  );
};