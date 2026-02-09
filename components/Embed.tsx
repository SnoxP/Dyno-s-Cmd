import React from 'react';
import { Embed as EmbedType } from '../types';
import { ExternalLink, Github } from 'lucide-react';

interface EmbedProps {
  embed: EmbedType;
}

const Embed: React.FC<EmbedProps> = ({ embed }) => {
  return (
    <div className="mt-2 bg-discord-embed border-l-4 border-[#3498db] rounded-r-md p-4 max-w-md w-full grid gap-2 shadow-sm">
      <div className="flex flex-col gap-1">
        {/* Provider/Author Line (Simulated for GitHub) */}
        {embed.url?.includes('github') && (
            <div className="text-xs text-discord-text flex items-center gap-1 mb-1">
                <Github size={14} /> <span>GitHub</span>
            </div>
        )}

        {/* Title */}
        {embed.title && (
          <a 
            href={embed.url || '#'} 
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-400 hover:underline truncate block"
          >
            {embed.title}
          </a>
        )}

        {/* Description */}
        {embed.description && (
          <p className="text-sm text-discord-text opacity-90 leading-snug whitespace-pre-wrap">
            {embed.description}
          </p>
        )}
      </div>

      {/* Image (Thumbnail or Main Image) */}
      {embed.image && (
        <div className="mt-2 rounded-md overflow-hidden">
          <img src={embed.image} alt="Embed content" className="max-w-full h-auto object-cover max-h-[300px]" />
        </div>
      )}

      {/* Footer */}
      {embed.footer && (
        <div className="flex items-center gap-2 mt-1">
            {embed.footer.icon_url && <img src={embed.footer.icon_url} className="w-5 h-5 rounded-full" alt="" />}
            <span className="text-xs text-gray-400">{embed.footer.text}</span>
        </div>
      )}
    </div>
  );
};

export default Embed;
