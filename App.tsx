import React, { useState, useRef, useEffect } from 'react';
import { Tag, Message, CommandType, User } from './types';
import { INITIAL_TAGS, DYNO_USER, CURRENT_USER } from './constants';
import TagMessage from './components/TagMessage';
import { Hash, Bell, Users, HelpCircle, PlusCircle, Gift, Sticker, Smile } from 'lucide-react';

export default function App() {
  const [tags, setTags] = useState<Tag[]>(INITIAL_TAGS);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      user: DYNO_USER,
      content: "Hello! I'm Dyno. \nTry using `/tag create [name] [content]` or `/tag get [name]`.\n\n**Markdown Examples:**\n`*Italic*` \u2192 *Italic*\n`**Bold**` \u2192 **Bold**\n`__Underline__` \u2192 __Underline__\n`~~Strikethrough~~` \u2192 ~~Strikethrough~~\n`||Spoiler||` \u2192 ||Spoiler||\n`# Header` \u2192\n# Header\n`> Quote` \u2192\n> Quote",
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Input Processor
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const content = inputValue;

    // Add user message to chat immediately
    const userMsg: Message = {
      id: Math.random().toString(36),
      user: CURRENT_USER,
      content: content,
      timestamp: Date.now(),
      isCommand: content.startsWith('/')
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");

    // If it's a command, process it logic
    if (content.startsWith('/')) {
        const parts = content.slice(1).split(' ');
        const command = parts[0].toLowerCase();
        
        // Simulate slight network delay for bot interaction
        setTimeout(() => {
          if (command === 'tag') {
            handleTagCommand(parts.slice(1));
          } else if (command === 'tags') {
            handleListTags();
          } else {
             sendBotMessage("Unknown command. Try `/tag get name:[name]` or `/tags`.");
          }
        }, 400);
    }
  };

  const handleTagCommand = (args: string[]) => {
    const subCommand = args[0]?.toLowerCase();

    // Parse Args helper: looks for "name:value" or "content:value"
    const fullArgs = args.slice(1).join(' ');

    if (subCommand === 'get') {
        // Expected: /tag get name:my-tag OR /tag get my-tag
        let tagName = fullArgs;
        if (fullArgs.startsWith('name:')) {
            tagName = fullArgs.replace('name:', '').trim();
        }
        
        const tag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
        
        if (tag) {
            // Check for potential embeds in the tag content (very basic URL detection)
            const urlRegex = /(https?:\/\/[^\s]+)/g;
            const urls = tag.content.match(urlRegex);
            const embeds = [];
            
            if (urls) {
               // If there's a Github link, create a mock embed like the screenshot
               if (urls.some(u => u.includes('github.com'))) {
                   embeds.push({
                       title: `GitHub - ${tag.name} project`,
                       description: `This program is related to ${tag.name}. Contribute to development by creating an account on GitHub.`,
                       url: urls.find(u => u.includes('github.com')),
                       color: '#1e2327',
                       image: 'https://picsum.photos/400/225' 
                   });
               }
            }

            sendBotMessage(tag.content, embeds.length > 0 ? embeds : undefined);
        } else {
            sendBotMessage(`❌ Tag \`${tagName}\` not found.`);
        }

    } else if (subCommand === 'create') {
        // Logic: /tag create name [name] content [content] OR /tag create [name] [content]
        
        let tagName = "";
        let tagContent = "";

        if (fullArgs.includes('content:')) {
            const split = fullArgs.split('content:');
            tagName = split[0].replace('name:', '').trim();
            tagContent = split[1].trim();
        } else {
            // Fallback: first word is name
            const firstSpace = fullArgs.indexOf(' ');
            if (firstSpace === -1) {
                sendBotMessage("❌ Please provide content for the tag.");
                return;
            }
            tagName = fullArgs.substring(0, firstSpace).trim();
            tagContent = fullArgs.substring(firstSpace).trim();
        }

        if (tags.some(t => t.name === tagName)) {
            sendBotMessage(`❌ A tag with the name \`${tagName}\` already exists.`);
            return;
        }

        const newTag: Tag = {
            name: tagName,
            content: tagContent,
            author: CURRENT_USER.username,
            createdAt: Date.now()
        };

        setTags(prev => [...prev, newTag]);
        // Matches the screenshot style
        sendBotMessage(`✅ Tag \`${tagName}\` created successfully.`);

    } else if (subCommand === 'delete') {
         let tagName = fullArgs.replace('name:', '').trim();
         const exists = tags.some(t => t.name === tagName);
         
         if (exists) {
             setTags(prev => prev.filter(t => t.name !== tagName));
             sendBotMessage(`✅ Tag \`${tagName}\` deleted.`);
         } else {
             sendBotMessage(`❌ Tag \`${tagName}\` not found.`);
         }

    } else if (subCommand === 'edit') {
         let tagName = "";
         let tagContent = "";

         if (fullArgs.includes('content:')) {
             const split = fullArgs.split('content:');
             tagName = split[0].replace('name:', '').trim();
             tagContent = split[1].trim();
         } else {
             // Try basic parse /tag edit [name] [new content]
             const firstSpace = fullArgs.indexOf(' ');
             if (firstSpace === -1) {
                sendBotMessage("❌ Usage: `/tag edit name:[name] content:[new content]`");
                return;
             }
             tagName = fullArgs.substring(0, firstSpace).trim();
             tagContent = fullArgs.substring(firstSpace).trim();
         }

         if (!tags.some(t => t.name === tagName)) {
             sendBotMessage(`❌ Tag \`${tagName}\` doesn't exist.`);
             return;
         }

         setTags(prev => prev.map(t => {
             if (t.name === tagName) return { ...t, content: tagContent };
             return t;
         }));
         sendBotMessage(`✅ Tag \`${tagName}\` updated.`);
         
    } else {
        sendBotMessage(`Available subcommands: \`get\`, \`create\`, \`delete\`, \`edit\`.`);
    }
  };

  const handleListTags = () => {
      const tagNames = tags.map(t => t.name).join(', ');
      sendBotMessage(`**Available Tags:**\n${tagNames}`);
  };

  const sendBotMessage = (content: string, embeds?: any[]) => {
      const botMsg: Message = {
          id: Math.random().toString(36),
          user: DYNO_USER,
          content,
          timestamp: Date.now(),
          embeds
      };
      setMessages(prev => [...prev, botMsg]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const insertCommand = (cmd: string) => {
      setInputValue(`/${cmd} `);
      inputRef.current?.focus();
  };

  return (
    <div className="flex h-screen text-gray-100 font-sans antialiased">
      {/* Sidebar - Server List Simulator (Visual Only) */}
      <div className="w-[72px] bg-[#1e1f22] flex flex-col items-center py-3 gap-2 flex-shrink-0">
         <div className="w-12 h-12 bg-discord-brand rounded-[16px] flex items-center justify-center text-white transition-all hover:rounded-[12px] cursor-pointer shadow-sm">
             <div className="font-bold text-sm">Dyno</div>
         </div>
         <div className="w-8 h-[2px] bg-gray-700 rounded-full my-1 opacity-50"></div>
         <div className="w-12 h-12 bg-gray-700 rounded-[24px] hover:rounded-[16px] hover:bg-green-600 transition-all cursor-pointer flex items-center justify-center">
             <PlusCircle size={24} className="text-green-500 hover:text-white transition-colors"/>
         </div>
      </div>

      {/* Channel List Sidebar */}
      <div className="w-60 bg-discord-sidebar flex flex-col flex-shrink-0">
        <div className="h-12 shadow-sm flex items-center px-4 font-bold border-b border-[#1f2023] hover:bg-[#35373c] cursor-pointer transition-colors">
          Dyno Support
        </div>
        <div className="flex-1 overflow-y-auto p-2">
            <div className="text-xs font-bold text-gray-400 uppercase mb-2 px-2 mt-2">Information</div>
            <ChannelItem name="dyno-tags" active={true} />
        </div>
        
        {/* User Mini Profile */}
        <div className="bg-[#232428] p-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-500 overflow-hidden relative group cursor-pointer">
                 <img src={CURRENT_USER.avatar} alt="Me" className="w-full h-full object-cover"/>
                 <div className="absolute inset-0 bg-black/10 hidden group-hover:block"></div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{CURRENT_USER.username}</div>
                <div className="text-xs text-gray-400 truncate">#1337</div>
            </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-discord-bg min-w-0">
        {/* Header */}
        <div className="h-12 border-b border-[#26272d] flex items-center justify-between px-4 shadow-sm flex-shrink-0">
           <div className="flex items-center gap-2 text-gray-200">
               <Hash className="text-gray-400" size={24} />
               <h3 className="font-bold">dyno-tags</h3>
               <span className="text-gray-400 hidden sm:inline text-sm ml-2 border-l border-gray-600 pl-3">
                   Use /tags to see available solutions
               </span>
           </div>
           <div className="flex items-center gap-4 text-gray-400">
               <Bell size={20} className="hover:text-gray-200 cursor-pointer" />
               <Users size={20} className="hover:text-gray-200 cursor-pointer" />
               <div className="relative">
                 <input type="text" placeholder="Search" className="bg-[#1e1f22] text-sm px-2 py-1 rounded transition-all w-36 focus:w-60 outline-none text-gray-200" />
               </div>
               <HelpCircle size={20} className="hover:text-gray-200 cursor-pointer" />
           </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col py-4">
           {messages.map((msg) => (
             <TagMessage key={msg.id} message={msg} />
           ))}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 pb-6 pt-2">
            <div className="bg-discord-input rounded-lg p-2.5 flex items-center gap-3 relative">
                <div className="p-1 bg-gray-400 rounded-full cursor-pointer hover:text-white text-[#313338] transition-colors">
                   <PlusCircle size={20} fill="currentColor" strokeWidth={1} />
                </div>
                <input 
                    ref={inputRef}
                    type="text" 
                    className="bg-transparent flex-1 outline-none text-gray-200 placeholder-gray-500 font-normal"
                    placeholder="Message #dyno-tags"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <div className="flex items-center gap-3 text-gray-400 mr-1">
                   <Gift size={24} className="cursor-pointer hover:text-gray-200" />
                   <Sticker size={24} className="cursor-pointer hover:text-gray-200" />
                   <Smile size={24} className="cursor-pointer hover:text-gray-200" />
                </div>

                {/* Slash Command Suggestion Mockup */}
                {inputValue.startsWith('/') && !inputValue.includes(' ') && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#2b2d31] rounded-md shadow-lg overflow-hidden border border-[#1e1f22] z-50">
                        <div className="p-2 text-xs font-bold text-gray-400 uppercase">Commands</div>
                        <CommandSuggestion name="tag get" desc="Get a tag by name" onClick={() => insertCommand("tag get")} />
                        <CommandSuggestion name="tag create" desc="Create a new tag" onClick={() => insertCommand("tag create")} />
                        <CommandSuggestion name="tag edit" desc="Edit an existing tag" onClick={() => insertCommand("tag edit")} />
                        <CommandSuggestion name="tag delete" desc="Delete a tag" onClick={() => insertCommand("tag delete")} />
                        <CommandSuggestion name="tags" desc="List all tags" onClick={() => insertCommand("tags")} />
                    </div>
                )}
            </div>
             {/* Typing Helper Text */}
             <div className="text-[10px] text-gray-500 mt-1 pl-1">
                 <strong>Tip:</strong> Create tags with <code>/tag create name:my-tag content:This is my content</code>
             </div>
        </div>
      </div>
    </div>
  );
}

const ChannelItem = ({ name, active }: { name: string, active: boolean }) => (
    <div className={`mx-2 px-2 py-1.5 rounded flex items-center gap-1.5 cursor-pointer group ${active ? 'bg-[#3f4147] text-white' : 'text-gray-400 hover:bg-[#35373c] hover:text-gray-200'}`}>
        <Hash size={18} className="text-gray-500" />
        <span className="font-medium truncate">{name}</span>
    </div>
);

const CommandSuggestion = ({ name, desc, onClick }: { name: string, desc: string, onClick?: () => void }) => (
    <div onClick={onClick} className="px-3 py-2 hover:bg-[#404249] cursor-pointer flex items-center justify-between">
        <div className="flex flex-col">
            <span className="text-gray-200 font-medium">/{name}</span>
            <span className="text-gray-400 text-xs">{desc}</span>
        </div>
    </div>
);