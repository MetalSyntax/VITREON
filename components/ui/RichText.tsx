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
        .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mt-2 mb-1 text-slate-800 dark:text-white">$1</h3>')
        .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-3 mb-2 text-slate-800 dark:text-white">$1</h2>')
        .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-black mt-4 mb-2 text-slate-800 dark:text-white">$1</h1>')
        
        // Bold: **text**
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-indigo-600 dark:text-indigo-400">$1</strong>')
        
        // Italic: *text*
        .replace(/\*(.*?)\*/g, '<em class="italic opacity-90">$1</em>')
        
        // Underline: ++text++
        .replace(/\+\+(.*?)\+\+/g, '<u class="underline decoration-indigo-500/50 decoration-2 underline-offset-4">$1</u>')
        
        // Strikethrough: ~~text~~
        .replace(/~~(.*?)~~/g, '<del class="line-through opacity-50">$1</del>')
        
        // Blockquotes: > text (handle escaped >)
        .replace(/^(&gt;|>) (.*$)/gm, '<blockquote class="border-l-4 border-indigo-500 bg-indigo-500/5 px-4 py-2 my-2 italic text-slate-600 dark:text-slate-400">$2</blockquote>')
        
        // Unordered Lists: - text or * text
        .replace(/^\s*[-*] (.*$)/gm, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300">$1</li>')
        
        // Wrap adjacent <li> in <ul>
        .replace(/(<li(?:(?!<\/ul>).)*<\/li>)+/g, '<ul class="my-2 space-y-1">$&</ul>')
        
        // Links: [text](url)
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-500 hover:underline font-bold">$1</a>')
        
        // Horizontal Rule: ---
        .replace(/^---$/gm, '<hr class="my-6 border-slate-200 dark:border-white/10" />')
        
        // Code blocks: `code`
        .replace(/`(.*?)`/g, '<code class="bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-indigo-500 font-mono text-sm">$1</code>')
        
        // Line breaks: convert \n to <br/> but skip if it's right after a block-level element closing tag
        .replace(/\n/g, '<br/>')
        .replace(/(<\/(h[1-3]|blockquote|ul|hr|div)>)<br\/>/g, '$1');

    return (
        <div 
            className={`rich-text leading-relaxed ${className}`}
            dangerouslySetInnerHTML={{ __html: formatted }}
        />
    );
};
