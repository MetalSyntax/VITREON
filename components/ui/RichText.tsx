import React from 'react';

interface RichTextProps {
    content: string;
    className?: string;
}

export const RichText: React.FC<RichTextProps> = ({ content, className }) => {
    if (!content) return null;

    // Comprehensive Markdown-to-HTML conversion
    let formatted = content
        // Escaping HTML entities to prevent XSS
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        
        // Headers (H1 - H3)
        .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-4 mb-2 text-slate-800 dark:text-white">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-6 mb-3 text-slate-800 dark:text-white">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-black mt-8 mb-4 text-slate-800 dark:text-white">$1</h1>')
        
        // Bold: **text**
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-indigo-600 dark:text-indigo-400">$1</strong>')
        
        // Italic: *text*
        .replace(/\*(.*?)\*/g, '<em class="italic opacity-90">$1</em>')
        
        // Underline: ++text++
        .replace(/\+\+(.*?)\+\+/g, '<u class="underline decoration-indigo-500/50 decoration-2 underline-offset-4">$1</u>')
        
        // Blockquotes: > text
        .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-indigo-500 bg-indigo-500/5 px-4 py-2 my-4 italic text-slate-600 dark:text-slate-400">$1</blockquote>')
        
        // Unordered Lists: - text or * text
        .replace(/^\s*[-*] (.*$)/gm, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300">$1</li>')
        
        // Wrap adjacent <li> in <ul> (Simplified for this parser)
        .replace(/(<li.*<\/li>)/g, '<ul class="my-3 space-y-1">$1</ul>')
        
        // Horizontal Rule: ---
        .replace(/^---$/gm, '<hr class="my-6 border-slate-200 dark:border-white/10" />')
        
        // Code blocks: `code`
        .replace(/`(.*?)`/g, '<code class="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-indigo-500 font-mono text-sm">$1</code>')
        
        // Line breaks (preserving structure)
        .replace(/\n/g, '<br/>');

    return (
        <div 
            className={`rich-text leading-relaxed ${className}`}
            dangerouslySetInnerHTML={{ __html: formatted }}
        />
    );
};
