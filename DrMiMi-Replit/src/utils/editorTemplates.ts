// Advanced CMS Templates for Medical Content

export interface EditorTemplate {
  id: string;
  name: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  category: 'medical' | 'educational' | 'administrative';
  content: any; // TipTap JSON content
}

export const editorTemplates: EditorTemplate[] = [
  {
    id: 'cours-medical',
    name: 'Cours Médical Complet',
    nameEn: 'Complete Medical Course',
    nameAr: 'دورة طبية كاملة',
    icon: '📚',
    category: 'medical',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Titre du Cours' }],
        },
        {
          type: 'callout',
          attrs: { type: 'info' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Objectifs d\'apprentissage : ' },
                { type: 'text', text: 'Listez les objectifs pédagogiques ici...' },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '1. Introduction' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Présentation du contexte médical...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '2. Anatomie / Physiologie' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Description anatomique et physiologique...' }],
        },
        {
          type: 'imageGallery',
          attrs: {
            images: [],
            layout: 'grid',
            columns: 2,
          },
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '3. Physiopathologie' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Mécanismes pathologiques...' }],
        },
        {
          type: 'callout',
          attrs: { type: 'warning' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Point important : ' },
                { type: 'text', text: 'Élément clé à retenir...' },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '4. Diagnostic' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Examen clinique' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Examens complémentaires' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diagnostic différentiel' }] }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '5. Traitement' }],
        },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Médicament' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Posologie' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Effets secondaires' }] }] },
              ],
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Traitement A' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: '500mg 2x/j' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nausées...' }] }] },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '📝 Points Clés à Retenir' }],
        },
        {
          type: 'callout',
          attrs: { type: 'success' },
          content: [
            {
              type: 'taskList',
              content: [
                {
                  type: 'taskItem',
                  attrs: { checked: false },
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Point clé 1' }] }],
                },
                {
                  type: 'taskItem',
                  attrs: { checked: false },
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Point clé 2' }] }],
                },
                {
                  type: 'taskItem',
                  attrs: { checked: false },
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Point clé 3' }] }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'cas-clinique-avance',
    name: 'Cas Clinique Détaillé',
    nameEn: 'Detailed Clinical Case',
    nameAr: 'حالة سريرية مفصلة',
    icon: '🏥',
    category: 'medical',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: '🏥 Cas Clinique' }],
        },
        {
          type: 'callout',
          attrs: { type: 'info' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Objectifs : ' },
                { type: 'text', text: 'Raisonnement clinique, diagnostic différentiel, prise en charge' },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '👤 Présentation du Patient' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Identité : ' },
            { type: 'text', text: 'Patient de [âge] ans, [sexe], [profession]' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', marks: [{ type: 'bold' }], text: 'Antécédents : ' },
            { type: 'text', text: 'Listez les antécédents médicaux...' },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '🩺 Motif de Consultation' }],
        },
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '"Citation directe du patient décrivant ses symptômes..."' }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '📋 Histoire de la Maladie' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Chronologie des symptômes...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '🔬 Examen Clinique' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Examen général : ' },
                    { type: 'text', text: 'État général, constantes...' },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Examen physique : ' },
                    { type: 'text', text: 'Inspection, palpation, percussion, auscultation...' },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '🧪 Examens Complémentaires' }],
        },
        {
          type: 'imageGallery',
          attrs: {
            images: [],
            layout: 'grid',
            columns: 2,
          },
        },
        {
          type: 'callout',
          attrs: { type: 'note' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Question : ' },
                { type: 'text', text: 'Quels examens complémentaires demanderiez-vous ?' },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '💭 Diagnostic Différentiel' }],
        },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hypothèse' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Arguments pour' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Arguments contre' }] }] },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '✅ Diagnostic Retenu' }],
        },
        {
          type: 'callout',
          attrs: { type: 'success' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: 'Diagnostic : ' },
                { type: 'text', text: '[Nom de la pathologie]' },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '💊 Prise en Charge' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Traitement immédiat' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Traitement de fond' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Surveillance' }] }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '📚 Points Pédagogiques' }],
        },
        {
          type: 'callout',
          attrs: { type: 'note' },
          content: [
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Leçon clé 1' }] }],
                },
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Leçon clé 2' }] }],
                },
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Leçon clé 3' }] }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'protocole-medical',
    name: 'Protocole Médical',
    nameEn: 'Medical Protocol',
    nameAr: 'بروتوكول طبي',
    icon: '📋',
    category: 'medical',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: '📋 Protocole : [Nom du Protocole]' }],
        },
        {
          type: 'callout',
          attrs: { type: 'warning' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: '⚠️ Version : ' },
                { type: 'text', text: '1.0 - Date de révision : [DATE]' },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '🎯 Objectif du Protocole' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Décrire l\'objectif principal...' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '👥 Population Cible' }],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Critères d\'inclusion : ' },
                    { type: 'text', text: '...' },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Critères d\'exclusion : ' },
                    { type: 'text', text: '...' },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '⚙️ Procédure Étape par Étape' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Étape 1 : ' },
                    { type: 'text', text: 'Description détaillée...' },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', marks: [{ type: 'bold' }], text: 'Étape 2 : ' },
                    { type: 'text', text: 'Description détaillée...' },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'callout',
          attrs: { type: 'danger' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: '🚨 Contre-indications : ' },
                { type: 'text', text: 'Listez les contre-indications absolues et relatives...' },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '📊 Surveillance' }],
        },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Paramètre' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Fréquence' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Valeurs normales' }] }] },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '📚 Références' }],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Référence bibliographique 1' }] }],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'guide-pratique',
    name: 'Guide Pratique',
    nameEn: 'Practical Guide',
    nameAr: 'دليل عملي',
    icon: '🔧',
    category: 'educational',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: '🔧 Guide Pratique : [Titre]' }],
        },
        {
          type: 'callout',
          attrs: { type: 'info' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: '📖 Ce guide vous accompagne pas à pas dans [objectif]' },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '✅ Prérequis' }],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Prérequis 1' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Prérequis 2' }] }],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '🚀 Guide Pas à Pas' }],
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'Étape 1 : [Titre]' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Instructions détaillées...' }],
        },
        {
          type: 'imageGallery',
          attrs: {
            images: [],
            layout: 'grid',
            columns: 2,
          },
        },
        {
          type: 'callout',
          attrs: { type: 'success' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'bold' }], text: '💡 Astuce : ' },
                { type: 'text', text: 'Conseil pratique...' },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '⚠️ Erreurs Courantes à Éviter' }],
        },
        {
          type: 'callout',
          attrs: { type: 'warning' },
          content: [
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Erreur 1' }] }],
                },
                {
                  type: 'listItem',
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Erreur 2' }] }],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '📝 Résumé' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Récapitulatif des points clés...' }],
        },
      ],
    },
  },
];

// Helper function to get template by ID
export function getTemplateById(id: string): EditorTemplate | undefined {
  return editorTemplates.find(t => t.id === id);
}

// Helper function to get templates by category
export function getTemplatesByCategory(category: EditorTemplate['category']): EditorTemplate[] {
  return editorTemplates.filter(t => t.category === category);
}
