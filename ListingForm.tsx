import { ListingFormData } from '../types';

interface ListingFormProps {
  formData: ListingFormData;
  onFormChange: (data: ListingFormData) => void;
}

const ITEM_TYPES = [
  'Electronics',
  'Clothing',
  'Furniture',
  'Books',
  'Toys',
  'Sports Equipment',
  'Home Decor',
  'Jewelry',
  'Collectibles',
  'Other',
];

const CONDITIONS = [
  'New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
  'For Parts',
];

export default function ListingForm({ formData, onFormChange }: ListingFormProps) {
  const handleChange = (field: keyof ListingFormData, value: string) => {
    onFormChange({
      ...formData,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="item_type" className="block text-sm font-medium text-gray-700 mb-1">
            Item Type
          </label>
          <select
            id="item_type"
            value={formData.item_type}
            onChange={(e) => handleChange('item_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Select type...</option>
            {ITEM_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
            Condition
          </label>
          <select
            id="condition"
            value={formData.condition}
            onChange={(e) => handleChange('condition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Select condition...</option>
            {CONDITIONS.map((condition) => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
            Brand <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <input
            type="text"
            id="brand"
            value={formData.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="e.g., Apple, Nike, IKEA"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
          Additional Details <span className="text-gray-400 text-xs">(optional)</span>
        </label>
        <textarea
          id="additionalInfo"
          value={formData.additionalInfo}
          onChange={(e) => handleChange('additionalInfo', e.target.value)}
          placeholder="Any specific features, defects, or details you want the AI to include..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
      </div>
    </div>
  );
}
