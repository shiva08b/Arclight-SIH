import React, { useState } from 'react';
import {
  BookOpen,
  Send,
  X,
  Bot,
  User,
  Sparkles,
  Search,
  Scale,
  ShieldAlert,
  FileText,
  ChevronRight,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface ActManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  ruleReference?: string;
  timestamp: string;
}

const KNOWLEDGE_BASE = [
  {
    rule: 'Rule 6(3)',
    title: 'MRP Stickers & Alteration Rules',
    keywords: ['sticker', 'mrp', 'alter', 'change price', 'reduce mrp', 'overwrite'],
    content:
      'Under Rule 6(3), it is NOT permissible to affix individual stickers to alter or make declarations. Exception: A sticker with a REVISED LOWER MRP (inclusive of all taxes) may be affixed for price reduction, provided it does NOT cover the original MRP declaration.',
  },
  {
    rule: 'Rule 6(1)',
    title: 'Mandatory Declarations on Every Package',
    keywords: ['declaration', 'mandatory', 'label', 'requirements', 'information'],
    content:
      'Every package must bear: (a) Name & address of Manufacturer/Packer/Importer, (b) Generic name of commodity, (c) Net quantity in standard units, (d) Month & year of manufacture/import, (e) Maximum Retail Price (MRP inclusive of all taxes), and (f) Customer Care details (Name, address, phone, email).',
  },
  {
    rule: 'Rule 7 & Table I',
    title: 'Principal Display Panel & Numeral Height',
    keywords: ['font', 'height', 'numeral', 'pdp', 'size', 'display panel', 'readability'],
    content:
      'Minimum Numeral Height Requirements on PDP:\n• Up to 200g/ml: 1 mm (normal print) / 2 mm (blown/molded)\n• 200g to 500g/ml: 2 mm (normal) / 4 mm (molded)\n• Above 500g/ml: 4 mm (normal) / 6 mm (molded)\nLetter height must not be less than 1 mm (2 mm if molded). Width must be at least 1/3rd of height.',
  },
  {
    rule: 'Rule 9',
    title: 'Manner in Which Declaration Shall Be Made',
    keywords: ['manner', 'color', 'contrast', 'language', 'hindi', 'english', 'legible'],
    content:
      'Declarations must be legible, prominent, and printed in a color that CONTRASTS conspicuously with the background. Declarations must be in Hindi (Devnagri script) or English. Additional languages are permitted.',
  },
  {
    rule: 'Rule 18(2)',
    title: 'Overcharging Above MRP',
    keywords: ['overcharge', 'more than mrp', 'excess price', 'above mrp', 'retailer price'],
    content:
      'Under Rule 18(2), no retail dealer, manufacturer, or packer shall sell any commodity in packed form at a price exceeding the Maximum Retail Price (MRP) printed on the package.',
  },
  {
    rule: 'Rule 26',
    title: 'Exemptions From Legal Metrology Rules',
    keywords: ['exemption', 'exempt', 'not apply', 'small package', 'bulk'],
    content:
      'Rules do NOT apply to: (a) Packages containing net weight/measure <= 10g or 10ml, (b) Fast food items packed by hotels/restaurants, (c) Packages > 25 kg or 25 litres (except cement & fertilizer sold in bags up to 50kg), (d) Commodities meant for industrial or institutional consumers.',
  },
  {
    rule: 'Rule 32',
    title: 'Penalties for Contravention of Rules',
    keywords: ['penalty', 'fine', 'punishment', 'violation', 'court'],
    content:
      'Under Rule 32:\n• Contravention of Rules 27 to 31 (Registration): Fine of up to ₹4,000.\n• Contravention of any other rule where no specific punishment is provided: Fine of up to ₹2,000.',
  },
  {
    rule: 'Rule 23',
    title: 'Deceptive Packages',
    keywords: ['deceptive', 'misleading', 'slack fill', 'false size', 'oversized'],
    content:
      'A package designed to deliberately give an exaggerated or misleading impression as to the quantity contained is a "Deceptive Package". Officers may order repacking/relabeling or seize non-compliant packages.',
  },
];

export function ActManualModal({ isOpen, onClose }: ActManualModalProps) {
  const [activeTab, setActiveTab] = useState<'bot' | 'reader'>('bot');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Greetings, Officer. I am your Legal Metrology AI Assistant. Ask me anything regarding The Legal Metrology (Packaged Commodities) Rules, 2011, numeral height tables, MRP sticker rules, or penalty provisions.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const handleSendMessage = (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText('');

    // Query matching algorithm against Legal Metrology Rules
    setTimeout(() => {
      const lowerQuery = textToSend.toLowerCase();
      let matchedRule = KNOWLEDGE_BASE.find((k) =>
        k.keywords.some((kw) => lowerQuery.includes(kw))
      );

      let botReply = '';
      let ruleRef = '';

      if (matchedRule) {
        botReply = matchedRule.content;
        ruleRef = matchedRule.rule + ' — ' + matchedRule.title;
      } else {
        botReply =
          'Based on The Legal Metrology (Packaged Commodities) Rules, 2011: Mandatory declarations must include Manufacturer Name/Address, Net Quantity, MRP (incl. taxes), Mfg Date, Generic Name, and Customer Care info. Numeral height on PDP must comply with Table I & II under Rule 7.';
        ruleRef = 'General Compliance Guidelines (Rules 2011)';
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botReply,
        ruleReference: ruleRef,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  const quickPrompts = [
    'What are the MRP sticker rules under Rule 6(3)?',
    'What is the minimum numeral height under Rule 7?',
    'Which packages are exempt under Rule 26?',
    'What is the penalty under Rule 32?',
    'Can a retailer charge above printed MRP?',
  ];

  const filteredRules = KNOWLEDGE_BASE.filter(
    (item) =>
      item.rule.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.content.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-0 animate-in fade-in duration-150">
      <div className="relative w-full h-full bg-white shadow-2xl flex flex-col overflow-hidden select-none">
        {/* Top Header Bar */}
        <div className="bg-[#0066cc] text-white px-4 py-3 flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <Scale className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide leading-tight">
                Legal Metrology Rules, 2011
              </h2>
              <p className="text-[10.5px] text-blue-100">
                Official Rulebook & AI Assistant
              </p>
            </div>
          </div>

          {/* Tab Selector & Close */}
          <div className="flex items-center gap-2">
            <div className="flex bg-white/15 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('bot')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'bot'
                    ? 'bg-white text-[#0066cc] shadow-xs font-bold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>AI Bot</span>
              </button>
              <button
                onClick={() => setActiveTab('reader')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'reader'
                    ? 'bg-white text-[#0066cc] shadow-xs font-bold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Manual</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TAB 1: AI ASSISTANT CHATBOT */}
        {activeTab === 'bot' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[88%] ${
                    msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                      msg.sender === 'user'
                        ? 'bg-[#0066cc] text-white'
                        : 'bg-emerald-600 text-white shadow-2xs'
                    }`}
                  >
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className="flex flex-col gap-1">
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#0066cc] text-white rounded-tr-none shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none shadow-2xs'
                      }`}
                    >
                      {msg.ruleReference && (
                        <div className="bg-emerald-50 border border-emerald-200 text-[#059669] font-bold text-[10px] px-2 py-0.5 rounded-md mb-1.5 flex items-center gap-1 w-fit">
                          <Scale className="w-3 h-3" />
                          <span>{msg.ruleReference}</span>
                        </div>
                      )}
                      <p className="whitespace-pre-line">{msg.text}</p>
                    </div>
                    <span className="text-[9.5px] text-slate-400 px-1 font-mono self-end">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pre-configured Quick Prompts */}
            <div className="bg-white border-t border-slate-200/80 px-3 py-2 flex gap-1.5 overflow-x-auto flex-shrink-0">
              <span className="text-[10.5px] font-bold text-slate-400 flex items-center gap-1 whitespace-nowrap pl-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Quick Ask:
              </span>
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#0066cc] border border-slate-200 text-[10.5px] px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Bottom Input Area */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about any rule, font height, MRP stickers, penalties..."
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0066cc]"
              />
              <button
                onClick={() => handleSendMessage()}
                className="bg-[#0066cc] hover:bg-[#0052a3] text-white p-2.5 rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL BOOK READER */}
        {activeTab === 'reader' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* Search Filter Header */}
            <div className="p-3 bg-white border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
              <Search className="w-4 h-4 text-slate-400 ml-1" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search Act rules, definitions, font size tables..."
                className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Manual Chapters List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {filteredRules.map((item) => (
                <div
                  key={item.rule}
                  className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0066cc] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                      {item.rule}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Official Gazette Notification (2011)
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-lg border border-slate-100 font-sans mt-1">
                    {item.content}
                  </p>

                  <div className="flex justify-end mt-1">
                    <button
                      onClick={() => {
                        setActiveTab('bot');
                        handleSendMessage(`Explain ${item.rule} in detail with practical inspection examples.`);
                      }}
                      className="text-[11px] font-bold text-[#0066cc] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ask AI Assistant about this Rule</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
