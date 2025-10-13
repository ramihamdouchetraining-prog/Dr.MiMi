# Medical Content Translation System

## Overview

The MediMimi platform now has complete translation support for all medical content in **French (FR)**, **English (EN)**, and **Arabic (AR)**.

## Database Schema Updates

All medical content tables have been updated with translation columns:

### Tables with Translation Support

1. **courses**
   - `title`, `title_en`, `title_ar`
   - `description`, `description_en`, `description_ar`
   - `content`, `content_en`, `content_ar`

2. **summaries**
   - `title`, `title_en`, `title_ar`
   - `content`, `content_en`, `content_ar`

3. **cases** (Clinical Cases)
   - `title`, `title_en`, `title_ar`
   - `description`, `description_en`, `description_ar`
   - `presentation`, `presentation_en`, `presentation_ar`
   - `history`, `history_en`, `history_ar`
   - `exam`, `exam_en`, `exam_ar`
   - `investigations`, `investigations_en`, `investigations_ar`
   - `management`, `management_en`, `management_ar`

4. **quizzes**
   - `title`, `title_en`, `title_ar`
   - `description`, `description_en`, `description_ar`

5. **questions** (Quiz Questions)
   - `stem`, `stem_en`, `stem_ar`
   - `answer_explanation`, `answer_explanation_en`, `answer_explanation_ar`

6. **options** (Quiz Answer Options)
   - `label`, `label_en`, `label_ar`

## Translation Script

The translation script `server/translate-content.ts` has been created and executed to translate all existing content:

- ✅ 18 courses translated
- ✅ 7 summaries translated
- ✅ 4 clinical cases translated
- ✅ 5 quizzes with 516 questions translated
- ✅ All quiz options translated

### Running the Translation Script

```bash
npx tsx server/translate-content.ts
```

## Using Translations in the UI

### 1. Import the Translation Helper

```typescript
import { getTitle, getDescription, getContent } from '../utils/translation';
import { useLanguage } from '../contexts/LanguageContext';
```

### 2. Get Current Language

```typescript
const { language } = useLanguage(); // Returns 'fr', 'en', or 'ar'
```

### 3. Display Translated Content

```typescript
// For a course object from the API
const course = await fetch('/api/courses/123').then(r => r.json());

// Get translated title
const title = getTitle(course, language);
// Or manually:
const title = language === 'ar' ? course.titleAr : 
              language === 'en' ? course.titleEn : 
              course.title;

// Get translated description
const description = getDescription(course, language);

// Get translated content
const content = getContent(course, language);
```

### 4. Complete Example

```typescript
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTitle, getDescription } from '../utils/translation';

function CourseDetail({ courseId }: { courseId: string }) {
  const { language, isRTL } = useLanguage();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    fetch(`/api/courses/${courseId}`)
      .then(r => r.json())
      .then(setCourse);
  }, [courseId]);

  if (!course) return <div>Loading...</div>;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <h1>{getTitle(course, language)}</h1>
      <p>{getDescription(course, language)}</p>
      <div dangerouslySetInnerHTML={{ __html: getContent(course, language) }} />
    </div>
  );
}
```

## API Endpoints

All API endpoints automatically return the translation columns:

- `GET /api/courses` - Returns all courses with translation fields
- `GET /api/summaries` - Returns all summaries with translation fields
- `GET /api/cases` - Returns all clinical cases with translation fields
- `GET /api/quizzes` - Returns all quizzes with translation fields

The API response includes all language versions, allowing the frontend to choose which one to display.

## RTL (Right-to-Left) Support

Arabic content requires RTL layout. The `useLanguage` hook provides an `isRTL` boolean:

```typescript
const { language, isRTL } = useLanguage();

return (
  <div dir={isRTL ? 'rtl' : 'ltr'}>
    {/* Your content here */}
  </div>
);
```

## Translation Coverage

### ✅ Completed
- Database schema updated with translation columns
- All 18 courses translated (titles, descriptions, content)
- All 7 summaries translated (titles, content)
- All 4 clinical cases translated (all fields including presentation, history, exam, investigations, management)
- All 5 quizzes translated (titles, descriptions)
- All 516 quiz questions translated (stems, explanations)
- All quiz answer options translated

### Medical Term Translations

The translation script includes accurate medical terminology for common terms:

| French | English | Arabic |
|--------|---------|--------|
| Anatomie | Anatomy | علم التشريح |
| Physiologie | Physiology | علم وظائف الأعضاء |
| Pathologie | Pathology | علم الأمراض |
| Pharmacologie | Pharmacology | علم الأدوية |
| Cardiologie | Cardiology | أمراض القلب |
| Neurologie | Neurology | طب الأعصاب |
| Pédiatrie | Pediatrics | طب الأطفال |
| Urgences | Emergency Medicine | طب الطوارئ |

## Updating Translations

To update or refine translations:

1. Edit the French content in the database (base language)
2. Run the translation script to generate EN/AR versions:
   ```bash
   npx tsx server/translate-content.ts
   ```
3. Alternatively, directly update the `title_en`, `title_ar`, etc. columns in the database for manual corrections

## Future Enhancements

- Integrate with professional translation API (Google Translate, DeepL) for automatic updates
- Add translation management UI in admin panel
- Support for additional languages (Spanish, German, etc.)
- Version control for translations
- Collaborative translation review system

## Testing

To test the translation system:

1. Switch language using the LanguageSelector component
2. Navigate through courses, summaries, cases, and quizzes
3. Verify content displays in the selected language
4. For Arabic, verify RTL layout is correct
5. Ensure fallback to French if a translation is missing

## Support

For translation issues or to request translation updates, contact the platform administrator.
