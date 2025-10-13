/**
 * Helper utility to get translated field value based on current language
 */

export function getTranslatedField<T>(
  data: T,
  fieldName: keyof T,
  language: 'fr' | 'en' | 'ar'
): string {
  if (!data) return '';
  
  // For French, use the base field
  if (language === 'fr') {
    return (data[fieldName] as any) || '';
  }
  
  // For English and Arabic, try the translated field first, fallback to French
  const translatedFieldName = `${String(fieldName)}${language === 'en' ? 'En' : 'Ar'}` as keyof T;
  const translatedValue = data[translatedFieldName] as any;
  
  if (translatedValue) {
    return translatedValue;
  }
  
  // Fallback to French if translation not available
  return (data[fieldName] as any) || '';
}

/**
 * Get translated title from content object
 */
export function getTitle(content: any, language: 'fr' | 'en' | 'ar'): string {
  return getTranslatedField(content, 'title' as any, language);
}

/**
 * Get translated description from content object
 */
export function getDescription(content: any, language: 'fr' | 'en' | 'ar'): string {
  return getTranslatedField(content, 'description' as any, language);
}

/**
 * Get translated content from content object
 */
export function getContent(content: any, language: 'fr' | 'en' | 'ar'): string {
  return getTranslatedField(content, 'content' as any, language);
}
