import React from 'react';
import { Message } from '../types';
import DiscordMarkdown from './DiscordMarkdown';
import Embed from './Embed';

interface TagMessageProps {
  message: Message;
}

const TagMessage: React.FC<TagMessageProps> = ({ message }) => {
  const { user, content, timestamp, embeds, isCommand } = message;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const today = new Date();
    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    
    const dateStr = isToday 
      ? `Today at ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
      : `${d.toLocaleDateString()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      
    return dateStr;
  };

  return (
    <div className={`group flex gap-4 px-4 py-0.5 hover:bg-[#2e3035] ${isCommand ? 'mt-4 mb-1' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-10 h-10 mt-0.5 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-700 ${isCommand ? 'opacity-70' : ''}`}>
        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-1.5 leading-[1.375rem]">
          <span className={`font-medium text-white hover:underline cursor-pointer ${isCommand ? 'opacity-90' : ''}`}>
            {user.username}
          </span>
          {user.isBot && (
            <span className="bg-[#5865F2] text-white text-[0.625rem] px-1.5 py-[0rem] rounded-[4px] font-medium flex items-center h-[0.9375rem] leading-none uppercase select-none align-text-top mt-[1px]">
              APP
            </span>
          )}
           {user.botTag && !user.isBot && (
            <span className="bg-[#5865F2] text-white text-[0.625rem] px-1.5 py-[0rem] rounded-[4px] font-medium flex items-center h-[0.9375rem] leading-none uppercase select-none align-text-top mt-[1px]">
              BOT
            </span>
          )}
          <span className="text-xs text-discord-muted ml-0.5">
            {formatTime(timestamp)}
          </span>
        </div>

        {/* Message Body */}
        <div className={`text-[0.9375rem] leading-[1.375rem] text-discord-text font-sans break-words whitespace-pre-wrap ${isCommand ? 'text-discord-muted' : ''}`}>
           {isCommand ? content : <DiscordMarkdown content={content} />}
        </div>

        {/* Embeds */}
        {embeds && embeds.map((embed, idx) => (
          <Embed key={idx} embed={embed} />
        ))}
      </div>
    </div>
  );
};

export default TagMessage;