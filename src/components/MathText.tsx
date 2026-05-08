import katex from 'katex';
import { useEffect, useRef } from 'react';

interface MathTextProps {
  text: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * Renders text containing LaTeX math formulas.
 * Supports formulas wrapped in $...$ for inline and $$...$$ for block.
 */
export default function MathText({ text, displayMode = false, className = '' }: MathTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Find all math patterns and render them
      // This is a simplified regex-based replacement for the demo.
      // In production, you'd use a more robust parser.
      const html = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
        return katex.renderToString(math, { displayMode: true, throwOnError: false });
      }).replace(/\$([\s\S]+?)\$/g, (_, math) => {
        return `<span class="katex-formula-inline">${katex.renderToString(math, { displayMode: false, throwOnError: false })}</span>`;
      });

      containerRef.current.innerHTML = html;
    }
  }, [text]);

  return (
    <div 
      ref={containerRef} 
      className={`prose prose-blue max-w-none ${className}`}
    />
  );
}
