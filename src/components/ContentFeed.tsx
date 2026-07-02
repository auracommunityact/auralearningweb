import { useState } from 'react';
import { motion } from 'motion/react';
import { Play, BookOpen, Lock } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface ContentItem {
  id: string;
  title: string;
  type: 'book' | 'video';
  thumbnail: string;
  description: string;
}

const mockContent: ContentItem[] = [
  {
    id: 'v1',
    title: 'The Art of Distraction-Free Learning',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    description: 'Master the art of deep focus in an age of constant interruptions.'
  },
  {
    id: 'b1',
    title: 'Minimalist Mindset',
    type: 'book',
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
    description: 'A practical guide to clearing the clutter from your workspace and mind.'
  },
  {
    id: 'v2',
    title: 'Understanding Flow States',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?w=800&q=80',
    description: 'Learn how to enter and maintain peak productivity and creative states.'
  },
  {
    id: 'b2',
    title: 'Focus Algorithms',
    type: 'book',
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
    description: 'Optimize your daily routines with systematic approaches to complex tasks.'
  }
];

interface ContentFeedProps {
  user: User | null;
  onRequireAuth: (action: () => void) => void;
  onShowToast: (msg: string) => void;
}

export function ContentFeed({ user, onRequireAuth, onShowToast }: ContentFeedProps) {
  const handleContentClick = (item: ContentItem) => {
    if (!user) {
      onRequireAuth(() => openContent(item));
    } else {
      openContent(item);
    }
  };

  const openContent = (item: ContentItem) => {
    // In a real app, this would route to a player or reader view
    onShowToast(`Opened ${item.type}: ${item.title}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto pt-16 pb-24">
      <div className="flex items-center justify-between mb-8 px-4">
        <h2 className="text-2xl font-medium text-slate-900">Explore Content</h2>
        {!user && (
          <span className="text-sm font-medium text-teal-600 flex items-center space-x-1 bg-teal-50 px-3 py-1 rounded-full">
            <Lock size={14} />
            <span>Login to access</span>
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {mockContent.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => handleContentClick(item)}
            className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img 
                src={item.thumbnail} 
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
                <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-900 shadow-lg">
                  {item.type === 'video' ? <Play size={20} className="ml-1" /> : <BookOpen size={20} />}
                </div>
              </div>
              {!user && (
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md flex items-center justify-center text-white">
                  <Lock size={14} />
                </div>
              )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-center space-x-2 mb-2 text-xs font-medium text-teal-600 uppercase tracking-wider">
                {item.type === 'video' ? <Play size={12} /> : <BookOpen size={12} />}
                <span>{item.type}</span>
              </div>
              <h3 className="font-medium text-slate-900 mb-2 line-clamp-2 leading-tight">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2 mt-auto">
                {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
