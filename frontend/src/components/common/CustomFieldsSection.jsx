// src/components/events/CustomFieldsSection.jsx

import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, PlusCircle, Settings } from 'lucide-react';

const FieldTypeOptions = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Yes/No' },
  { value: 'url', label: 'URL' },
  { value: 'email', label: 'Email' },
  { value: 'select', label: 'Dropdown' },
];

const CustomFieldsSection = ({ customFields, setCustomFields }) => {
  const [expanded, setExpanded] = useState(false);
  const [templateMode, setTemplateMode] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  // Generate a safe key from a label
  const generateKey = (label) => {
    return label.toLowerCase().replace(/[^a-z0-9]/gi, '_');
  };
  
  // Add a new custom field
  const addField = () => {
    const newField = {
      key: `field_${customFields.length + 1}`,
      label: '',
      type: 'text',
      value: '',
      isRequired: false,
      isPublic: true,
      options: []
    };
    
    setCustomFields([...customFields, newField]);
  };
  
  // Remove a field at the specified index
  const removeField = (index) => {
    const updatedFields = [...customFields];
    updatedFields.splice(index, 1);
    setCustomFields(updatedFields);
  };
  
  // Update a field property
  const updateField = (index, property, value) => {
    const updatedFields = [...customFields];
    updatedFields[index][property] = value;
    
    // Special handling for label updates - generate a key
    if (property === 'label' && value) {
      updatedFields[index].key = generateKey(value);
    }
    
    // Special handling for type changes
    if (property === 'type') {
      // Reset value based on new type
      switch (value) {
        case 'text':
        case 'url':
        case 'email':
          updatedFields[index].value = '';
          break;
        case 'number':
          updatedFields[index].value = 0;
          break;
        case 'date':
          updatedFields[index].value = '';
          break;
        case 'boolean':
          updatedFields[index].value = false;
          break;
        case 'select':
          if (!updatedFields[index].options || !updatedFields[index].options.length) {
            updatedFields[index].options = [{ value: '', label: '' }];
          }
          updatedFields[index].value = '';
          break;
        default:
          break;
      }
    }
    
    setCustomFields(updatedFields);
  };
  
  // Add an option to a select field
  const addOption = (fieldIndex) => {
    const updatedFields = [...customFields];
    if (!updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options = [];
    }
    
    updatedFields[fieldIndex].options.push({ value: '', label: '' });
    setCustomFields(updatedFields);
  };
  
  // Update a select option
  const updateOption = (fieldIndex, optionIndex, property, value) => {
    const updatedFields = [...customFields];
    
    if (!updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options = [];
    }
    
    updatedFields[fieldIndex].options[optionIndex][property] = value;
    
    // If updating option value and it's empty, generate from label
    if (property === 'label' && !updatedFields[fieldIndex].options[optionIndex].value) {
      updatedFields[fieldIndex].options[optionIndex].value = generateKey(value);
    }
    
    setCustomFields(updatedFields);
  };
  
  // Remove an option from a select field
  const removeOption = (fieldIndex, optionIndex) => {
    const updatedFields = [...customFields];
    updatedFields[fieldIndex].options.splice(optionIndex, 1);
    setCustomFields(updatedFields);
  };
  
  // Save fields as a template
  const saveAsTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    // In a real implementation, this would call an API to save the template
    // For now, just simulate saving to localStorage
    const templates = JSON.parse(localStorage.getItem('customFieldTemplates') || '[]');
    templates.push({
      id: Date.now().toString(),
      name: templateName,
      fields: customFields
    });
    localStorage.setItem('customFieldTemplates', JSON.stringify(templates));
    
    alert('Template saved successfully!');
    setTemplateMode(false);
    setTemplateName('');
  };
  
  // Load a template
  const loadTemplate = (templateId) => {
    // In a real implementation, this would call an API to load the template
    // For now, just simulate loading from localStorage
    const templates = JSON.parse(localStorage.getItem('customFieldTemplates') || '[]');
    const template = templates.find(t => t.id === templateId);
    
    if (template) {
      setCustomFields(template.fields);
    }
  };
  
  // Clear all fields
  const clearAllFields = () => {
    if (window.confirm('Are you sure you want to remove all custom fields?')) {
      setCustomFields([]);
    }
  };
  
  // Render field input based on type
  const renderFieldInput = (field, index) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={field.value || ''}
            onChange={(e) => updateField(index, 'value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Text value"
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            value={field.value || 0}
            onChange={(e) => updateField(index, 'value', e.target.value !== '' ? parseFloat(e.target.value) : '')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="0"
          />
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={field.value || ''}
            onChange={(e) => updateField(index, 'value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        );
        
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={field.value || false}
              onChange={(e) => updateField(index, 'value', e.target.checked)}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700">Yes/No</span>
          </div>
        );
        
      case 'url':
        return (
          <input
            type="url"
            value={field.value || ''}
            onChange={(e) => updateField(index, 'value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="https://example.com"
          />
        );
        
      case 'email':
        return (
          <input
            type="email"
            value={field.value || ''}
            onChange={(e) => updateField(index, 'value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="user@example.com"
          />
        );
        
      case 'select':
        return (
          <div>
            <select
              value={field.value || ''}
              onChange={(e) => updateField(index, 'value', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">-- Select an option --</option>
              {field.options && field.options.map((option, optIndex) => (
                <option key={optIndex} value={option.value}>
                  {option.label || option.value}
                </option>
              ))}
            </select>
            
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-600 font-medium">Options:</p>
              
              {field.options && field.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option.label || ''}
                    onChange={(e) => updateOption(index, optIndex, 'label', e.target.value)}
                    placeholder="Option label"
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index, optIndex)}
                    className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => addOption(index)}
                className="text-sm py-1 px-2 text-orange-600 hover:text-orange-700 flex items-center rounded hover:bg-orange-100"
              >
                <Plus size={16} className="mr-1" />
                Add Option
              </button>
            </div>
          </div>
        );
        
      default:
        return (
          <input
            type="text"
            value={field.value || ''}
            onChange={(e) => updateField(index, 'value', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        );
    }
  };
  
  // List of templates (would normally be fetched from API)
  const templates = JSON.parse(localStorage.getItem('customFieldTemplates') || '[]');
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6">
      <div 
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Settings className="mr-2 h-5 w-5 text-orange-500" />
          Custom Fields
          {customFields.length > 0 && (
            <span className="ml-2 bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
              {customFields.length}
            </span>
          )}
        </h2>
        <button className="text-gray-500 hover:text-gray-700">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {expanded && (
        <div className="p-4 border-t border-gray-200">
          {/* Template controls */}
          <div className="mb-4 flex flex-wrap gap-2">
            {templates.length > 0 && (
              <select
                onChange={(e) => e.target.value && loadTemplate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                value=""
              >
                <option value="">-- Load Template --</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            )}
            
            {templateMode ? (
              <div className="flex flex-1 items-center space-x-2">
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={saveAsTemplate}
                  className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateMode(false)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setTemplateMode(true)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
                >
                  <PlusCircle size={16} className="mr-2" />
                  Save as Template
                </button>
                
                <button
                  type="button"
                  onClick={clearAllFields}
                  className="px-3 py-2 bg-gray-100 text-red-600 rounded-md hover:bg-gray-200 flex items-center ml-auto"
                  disabled={customFields.length === 0}
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear All
                </button>
              </>
            )}
          </div>
          
          {/* Custom fields list */}
          {customFields.length > 0 ? (
            <div className="space-y-4">
              {customFields.map((field, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Custom Field #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Label <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(index, 'label', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="e.g., T-shirt Size"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field Type
                      </label>
                      <select
                        value={field.type}
                        onChange={(e) => updateField(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        {FieldTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Default Value
                    </label>
                    {renderFieldInput(field, index)}
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.isRequired}
                        onChange={(e) => updateField(index, 'isRequired', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Required field</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.isPublic}
                        onChange={(e) => updateField(index, 'isPublic', e.target.checked)}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Visible to attendees</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 mb-2">No custom fields added yet</p>
              <p className="text-gray-400 text-sm mb-4">Custom fields allow you to collect additional information from attendees</p>
            </div>
          )}
          
          <button
            type="button"
            onClick={addField}
            className="mt-4 w-full py-2 flex justify-center items-center bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium rounded-md transition"
          >
            <Plus size={18} className="mr-2" />
            Add Custom Field
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomFieldsSection;
