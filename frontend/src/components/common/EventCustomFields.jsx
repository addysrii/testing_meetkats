// src/components/events/EventCustomFields.jsx

import React from 'react';
import { 
  Calendar, 
  Clock, 
  Link as LinkIcon, 
  Mail, 
  Check, 
  X 
} from 'lucide-react';

const EventCustomFields = ({ customFields }) => {
  if (!customFields || customFields.length === 0) {
    return null;
  }
  
  // Only show public fields
  const publicFields = customFields.filter(field => field.isPublic !== false);
  
  if (publicFields.length === 0) {
    return null;
  }
  
  // Format field value based on type
  const formatValue = (field) => {
    if (field.value === null || field.value === undefined || field.value === '') {
      return '-';
    }
    
    switch (field.type) {
      case 'text':
        return field.value;
        
      case 'number':
        return field.value.toString();
        
      case 'date':
        try {
          return new Date(field.value).toLocaleDateString();
        } catch (error) {
          return field.value;
        }
        
      case 'boolean':
        return field.value ? 'Yes' : 'No';
        
      case 'url':
        return (
          <a 
            href={field.value} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-orange-600 hover:text-orange-800 hover:underline flex items-center"
          >
            <LinkIcon size={14} className="mr-1" />
            {field.value}
          </a>
        );
        
      case 'email':
        return (
          <a 
            href={`mailto:${field.value}`} 
            className="text-orange-600 hover:text-orange-800 hover:underline flex items-center"
          >
            <Mail size={14} className="mr-1" />
            {field.value}
          </a>
        );
        
      case 'select':
        // Try to find label from options
        if (field.options && Array.isArray(field.options)) {
          const option = field.options.find(opt => opt.value === field.value);
          if (option) {
            return option.label || option.value;
          }
        }
        return field.value;
        
      default:
        return field.value.toString();
    }
  };
  
  // Get icon for field type
  const getFieldIcon = (fieldType) => {
    switch (fieldType) {
      case 'date':
        return <Calendar size={18} className="text-orange-500" />;
      case 'boolean':
        return <Check size={18} className="text-orange-500" />;
      case 'url':
        return <LinkIcon size={18} className="text-orange-500" />;
      case 'email':
        return <Mail size={18} className="text-orange-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-orange-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Additional Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {publicFields.map((field, index) => (
          <div key={index} className="flex">
            <div className="mr-3 mt-0.5">
              {getFieldIcon(field.type)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{field.label}</h3>
              <div className="text-gray-700 mt-1">
                {formatValue(field)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventCustomFields;
