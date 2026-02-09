import React, { useState } from 'react';

interface DiscordMarkdownProps {
  content: string;
}

const Spoiler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  return (
    <span 
      onClick={(e) => { e.stopPropagation(); setVisible(true); }}
      className={`rounded px-0.5 py-[1px] cursor-pointer select-none transition-colors duration-200 align-middle ${
        visible ? 'bg-[#43464d] text-gray-100 cursor-text' : 'bg-[#1e1f22] text-transparent hover:bg-[#232428]'
      }`}
    >
      <span className={visible ? '' : 'opacity-0'}>{children}</span>
    </span>
  );
};

const DiscordMarkdown: React.FC<DiscordMarkdownProps> = ({ content }) => {
  const parseInline = (text: string): React.ReactNode[] => {
    // Regex for inline tokens. Order matters greatly.
    // 1. Spoiler ||...||
    // 2. Inline Code `...`
    // 3. Bold Italic ***...***
    // 4. Bold **...**
    // 5. Underline __...__
    // 6. Strike ~~...~~
    // 7. Italic *...*
    // 8. Italic _..._
    // 9. URLs
    
    const regex = /(\|\|.+?\|\|)|(`[^`]+`)|(\*\*\*.+?\*\*\*)|(\*\*.+?\*\*)|(__.+?__)|(~~.+?~~)|(\*.+?\*)|(_.+?_)|(https?:\/\/[^\s]+)/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      const m = match[0];
      
      if (m.startsWith('||')) {
        parts.push(<Spoiler key={match.index}>{parseInline(m.slice(2, -2))}</Spoiler>);
      } else if (m.startsWith('`')) {
        parts.push(
          <code key={match.index} className="bg-[#2b2d31] px-1.5 py-0.5 rounded text-[0.85em] font-mono mx-0.5 align-middle text-gray-200">
            {m.slice(1, -1)}
          </code>
        );
      } else if (m.startsWith('***')) {
        parts.push(
          <strong key={match.index} className="font-bold text-gray-100">
            <em className="italic">{parseInline(m.slice(3, -3))}</em>
          </strong>
        );
      } else if (m.startsWith('**')) {
        parts.push(<strong key={match.index} className="font-bold text-gray-100">{parseInline(m.slice(2, -2))}</strong>);
      } else if (m.startsWith('__')) {
        parts.push(<u key={match.index} className="underline decoration-current">{parseInline(m.slice(2, -2))}</u>);
      } else if (m.startsWith('~~')) {
        parts.push(<s key={match.index} className="line-through">{parseInline(m.slice(2, -2))}</s>);
      } else if (m.startsWith('*')) {
        parts.push(<em key={match.index} className="italic">{parseInline(m.slice(1, -1))}</em>);
      } else if (m.startsWith('_')) {
        parts.push(<em key={match.index} className="italic">{parseInline(m.slice(1, -1))}</em>);
      } else if (m.startsWith('http')) {
        parts.push(
          <a key={match.index} href={m} target="_blank" rel="noreferrer" className="text-[#00a8fc] hover:underline break-all">
            {m}
          </a>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  const renderLines = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, i) => {
      let content = line;
      let wrapperClass = "min-h-[1.375rem] whitespace-pre-wrap break-words leading-[1.375rem]"; 
      let WrapperTag: any = 'div';
      let prefix: React.ReactNode = null;

      // Headers
      if (line.startsWith('# ') && line.length > 2) {
        content = line.substring(2);
        WrapperTag = 'h1';
        wrapperClass = "text-2xl font-bold text-gray-100 mt-3 mb-1 break-words";
      } else if (line.startsWith('## ') && line.length > 3) {
        content = line.substring(3);
        WrapperTag = 'h2';
        wrapperClass = "text-xl font-bold text-gray-100 mt-2 mb-1 break-words";
      } else if (line.startsWith('### ') && line.length > 4) {
        content = line.substring(4);
        WrapperTag = 'h3';
        wrapperClass = "text-lg font-bold text-gray-100 mt-1 mb-1 break-words";
      } 
      // Blockquotes (allow >text or > text)
      else if (line.startsWith('>')) {
        // Check if it's >>> (multiline - though we handle line by line, treat as single)
        if (line.startsWith('>>>')) {
             content = line.substring(3).trimStart();
        } else {
             content = line.substring(1).trimStart();
        }
        wrapperClass = "flex my-1 pl-2 border-l-4 border-[#4e5058]";
        WrapperTag = 'div';
      }
      // Lists
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          content = line.trim().substring(2);
          wrapperClass = "flex ml-4 relative";
          prefix = <div className="absolute -left-4 top-0 w-4 text-center text-gray-300">•</div>;
      }

      return (
        <WrapperTag key={i} className={wrapperClass}>
          {prefix}
          <div className="flex-1">
             {content ? parseInline(content) : <br />}
          </div>
        </WrapperTag>
      );
    });
  };

  const renderContent = (text: string) => {
    const codeBlockRegex = /```(?:(\w+)\n)?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }
      parts.push({ type: 'codeblock', language: match[1], content: match[2] });
      lastIndex = codeBlockRegex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push({ type: 'text', content: text.substring(lastIndex) });
    }

    return parts.map((part, index) => {
      if (part.type === 'codeblock') {
        return (
          <div key={index} className="bg-[#2b2d31] border border-[#1e1f22] p-2.5 rounded-md font-mono text-sm my-2 overflow-x-auto text-gray-200">
             {part.content}
          </div>
        );
      }
      return <React.Fragment key={index}>{renderLines(part.content)}</React.Fragment>;
    });
  };

  return <>{renderContent(content)}</>;
};

export default DiscordMarkdown;