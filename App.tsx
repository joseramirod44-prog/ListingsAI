import { useState } from 'react';
import { Sparkles, Save, Loader2 } from 'lucide-react';
import PhotoUpload from "./PhotoUpload";
import ListingForm from "./ListingForm";
import GeneratedResults from "./GeneratedResults";
import ListingHistory from "./ListingHistory";
import { ImageFile, ListingFormData, AIGeneratedContent } from './types';
import { generateListing } from "./openai";
import { supabase } from './supabase';

function App() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [formData, setFormData] = useState<ListingFormData>({
    item_type: '',
    brand: '',
    condition: '',
    price: '',
    additionalInfo: '',
  });
  const [generatedContent, setGeneratedContent] = useState<AIGeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshHistory, setRefreshHistory] = useState(0);

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (const image of images) {
      if (image.uploaded && image.url) {
        uploadedUrls.push(image.url);
        continue;
      }

      const fileName = `${Date.now()}-${image.id}-${image.file.name}`;
      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, image.file);

      if (error) {
        console.error('Upload error:', error);
        throw new Error(`Failed to upload ${image.file.name}`);
      }

      const { data: urlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(data.path);

      uploadedUrls.push(urlData.publicUrl);
    }

    return uploadedUrls;
  };

  const handleGenerate = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const imageFiles = images.map((img) => img.file);
      const content = await generateListingContent(imageFiles, formData);
      setGeneratedContent(content);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate listing');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) return;

    setIsSaving(true);
    setError(null);

    try {
      const imageUrls = await uploadImages();

      const { error: dbError } = await supabase.from('listings').insert({
        title: generatedContent.title,
        description: generatedContent.description,
        item_type: formData.item_type || null,
        brand: formData.brand || null,
        condition: formData.condition || null,
        price: formData.price ? parseFloat(formData.price) : null,
        tags: generatedContent.tags,
        image_urls: imageUrls,
        ai_metadata: {
          analysis: generatedContent.analysis,
          generatedAt: new Date().toISOString(),
        },
      });

      if (dbError) throw dbError;

      alert('Listing saved successfully!');
      setRefreshHistory(prev => prev + 1);

      setImages([]);
      setFormData({
        item_type: '',
        brand: '',
        condition: '',
        price: '',
        additionalInfo: '',
      });
      setGeneratedContent(null);
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save listing');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              AI Listing Generator
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Upload photos and let AI create perfect marketplace listings
          </p>
        </header>

        {error && (
          <div className="max-w-3xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Photos</h2>
              <PhotoUpload images={images} onImagesChange={setImages} />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Item Details</h2>
              <ListingForm formData={formData} onFormChange={setFormData} />
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || images.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Listing
                </>
              )}
            </button>

            {generatedContent && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <GeneratedResults
                  content={generatedContent}
                  onContentChange={setGeneratedContent}
                  onRegenerate={handleRegenerate}
                  isRegenerating={isGenerating}
                />

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Listing
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <ListingHistory refreshTrigger={refreshHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
