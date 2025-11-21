import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    type?: string;
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
    schema?: object; // New prop for custom structured data
}

export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords = [],
    image,
    type = 'website',
    author = 'Dr. MiMi',
    publishedTime,
    modifiedTime,
    section,
    tags = [],
    schema, // Destructure new prop
}) => {
    const location = useLocation();
    const siteUrl = 'https://drmimi.netlify.app';
    const currentUrl = `${siteUrl}${location.pathname}`;
    const defaultTitle = 'Dr.MiMi - Plateforme d\'Éducation Médicale';
    const defaultDescription = 'Plateforme éducative médicale XXL pour étudiants en médecine. Cours, quiz, cas cliniques et mentor numérique Dr. MiMi.';
    const defaultImage = `${siteUrl}/images/og-image.png`;

    const fullTitle = title ? `${title} | Dr.MiMi` : defaultTitle;
    const fullDescription = description || defaultDescription;
    const fullImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : defaultImage;

    // Default Structured Data (JSON-LD)
    const defaultStructuredData = {
        '@context': 'https://schema.org',
        '@type': type === 'article' ? 'Article' : 'WebSite',
        url: currentUrl,
        name: fullTitle,
        description: fullDescription,
        image: fullImage,
        author: {
            '@type': 'Person',
            name: author,
        },
        publisher: {
            '@type': 'Organization',
            name: 'Dr. MiMi',
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/images/avatars/smiling.png`,
            },
        },
        ...(publishedTime && { datePublished: publishedTime }),
        ...(modifiedTime && { dateModified: modifiedTime }),
        ...(type === 'article' && {
            headline: title,
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': currentUrl,
            },
            articleSection: section,
            keywords: tags.join(', '),
        }),
    };

    // Merge default with custom schema
    const structuredData = schema ? { ...defaultStructuredData, ...schema } : defaultStructuredData;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={fullDescription} />
            <meta name="keywords" content={keywords.join(', ')} />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:site_name" content="Dr.MiMi" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={currentUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={fullDescription} />
            <meta name="twitter:image" content={fullImage} />

            {/* Article Specific */}
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {section && <meta property="article:section" content={section} />}
            {tags.map((tag) => (
                <meta property="article:tag" content={tag} key={tag} />
            ))}

            {/* Structured Data */}
            <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        </Helmet>
    );
};
