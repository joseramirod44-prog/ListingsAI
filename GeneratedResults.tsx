import { useState } from 'react';
import { Copy, Check, Tag, RotateCcw } from 'lucide-react';
import { AIGeneratedContent } from '../types';

interface GeneratedResultsProps {
  content: AIGeneratedContent;
  onContentChange: (content: AIGeneratedContent) => void;
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

export default function GeneratedResults({
  content,
  onContentChange,
  onRegenerate,
  isRegenerating = false,
}: GeneratedResultsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !content.tags.includes(newTag.trim())) {
      onContentChange({
        ...content,
        tags: [...content.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onContentChange({
      ...content,
      tags: content.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Generated Listing</h2>
        <button
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <RotateCcw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <button
              onClick={() => copyToClipboard(content.title, 'title')}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              {copiedField === 'title' ? (
                <>
                  <Check className="w-3 h-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>
          </div>
          <input
            type="text"
            id="title"
            value={content.title}
            onChange={(e) => onContentChange({ ...content, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
          />
          <p className="text-xs text-gray-500 mt-1">{content.title.length} characters</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <button
              onClick={() => copyToClipboard(content.description, 'description')}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              {copiedField === 'description' ? (
                <>
                  <Check className="w-3 h-3" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>
          </div>
          <textarea
            id="description"
            value={content.description}
            onChange={(e) => onContentChange({ ...content, description: e.target.value })}
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
        </div>

        {content.suggestedPrice && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">AI Suggested Price:</span> ${content.suggestedPrice.toFixed(2)}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags & Keywords
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {content.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                <Tag className="w-3 h-3" />
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-gray-500 hover:text-red-600"
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              placeholder="Add custom tag..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
            />
            <button
              onClick={addTag}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Add
            </button>
          </div>
        </div>

        {content.analysis && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-700 mb-1">AI Analysis:</p>
            <p className="text-sm text-gray-600">{content.analysis}</p>
          </div>
        )}
      </div>
    </div>
  );
}
