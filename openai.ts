import OpenAI from 'openai';
import { AIGeneratedContent, ListingFormData } from '../types';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('Missing OpenAI API key. Please add VITE_OPENAI_API_KEY to your .env file');
}

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

async function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function generateListingContent(
  images: File[],
  formData: ListingFormData
): Promise<AIGeneratedContent> {
  const imageContents = await Promise.all(
    images.map(async (file) => {
      const base64 = await imageToBase64(file);
      return {
        type: 'image_url' as const,
        image_url: {
          url: base64,
        },
      };
    })
  );

  const prompt = `You are an expert marketplace listing writer. Analyze the provided product images and create a compelling, professional listing.

Item Details:
${formData.item_type ? `- Type: ${formData.item_type}` : ''}
${formData.brand ? `- Brand: ${formData.brand}` : ''}
${formData.condition ? `- Condition: ${formData.condition}` : ''}
${formData.price ? `- Price: $${formData.price}` : ''}
${formData.additionalInfo ? `- Additional Info: ${formData.additionalInfo}` : ''}

Please provide a JSON response with the following structure:
{
  "title": "A concise, compelling title (max 80 characters)",
  "description": "A detailed, persuasive description highlighting key features, condition, and benefits (3-5 paragraphs)",
  "tags": ["array", "of", "relevant", "searchable", "keywords"],
  "suggestedPrice": null or a number if you can estimate value,
  "analysis": "Brief analysis of what you see in the images"
}

Make the title catchy and include key search terms. The description should be well-formatted with line breaks, bullet points for features, and a friendly but professional tone. Include 8-12 relevant tags.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt,
          },
          ...imageContents,
        ],
      },
    ],
    max_tokens: 1500,
    temperature: 0.7,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No response from OpenAI');
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format from OpenAI');
  }

  const result = JSON.parse(jsonMatch[0]);

  return {
    title: result.title || 'Untitled Item',
    description: result.description || '',
    tags: result.tags || [],
    suggestedPrice: result.suggestedPrice,
    analysis: result.analysis || 'No analysis provided',
  };
}
