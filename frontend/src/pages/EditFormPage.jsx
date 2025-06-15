import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useToast } from './Toast';
import { 
  PlusCircle, MinusCircle, Trash2, MoveUp, MoveDown, 
  Save, ArrowLeft, FileText, Eye
} from 'lucide-react';

import customEventService from '../services/customeventService';
import eventService from '../services/eventService';

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'file', label: 'File Upload' },
  { value: 'url', label: 'URL' },
  { value: 'header', label: 'Section Header' },
  { value: 'paragraph', label: 'Paragraph Text' }
];

const EditFormPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState(null);
  const [formExists, setFormExists] = useState(false);
  const [formId, setFormId] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  
  const { register, control, handleSubmit, setValue, watch, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      title: '',
      description: '',
      instructions: '',
      sections: [
        {
          title: 'Basic Information',
          description: '',
          fields: [
            {
              label: 'Name',
              type: 'text',
              required: true,
              placeholder: 'Your name',
              options: [],
              helpText: ''
            }
          ]
        }
      ],
      settings: {
        allowMultipleSubmissions: false,
        requireApproval: true,
        notifyOnSubmission: true,
        autoClose: false,
        autoCloseDate: '',
        thankYouMessage: 'Thank you for your submission!'
      }
    }
  });
  const { fields: sectionFields, append: appendSection, remove: removeSection, move: moveSection } = useFieldArray({
    control,
    name: 'sections'
  });
  
  // Watch all form values for preview mode
  const formValues = watch();
  
  // Fetch event and form data
  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);
      try {
        const response = await customEventService.getCustomForm(eventId);
        
        if (response.success && response.data) {
          setFormExists(true);
          setFormId(response.data._id);  // ✅ Ensure this is set
          reset(response.data); // Load form data into react-hook-form
        } else {
          setFormExists(false);
          setFormId(null); // Clear if no form exists
        }
      } catch (error) {
        toast.error("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchFormData();
  }, [eventId, reset]);
  
// EditFormPage.jsx
const onSubmit = async (data) => {
    setSubmitting(true);
  
    try {
      // Validate formId exists and is not "undefined"
      if (!formId || formId === "undefined") {
        throw new Error("Form ID is missing. Cannot update form.");
      }
  
      // Prepare form data
      const formData = {
        title: data.title,
        description: data.description,
        sections: data.sections.map(section => ({
          ...section,
          fields: section.fields.map(field => ({
            ...field,
            options: ['select', 'radio', 'checkbox'].includes(field.type) 
              ? field.options || [] 
              : undefined,
          })),
        })),
        settings: data.settings,
      };
  
      // Call update API
      const response = await customEventService.updateCustomForm(
        eventId, 
        formId,  // Ensure this is a valid ID
        formData
      );
  
      if (!response.success) {
        throw new Error(response.error || "Failed to update form");
      }
  
      toast.success("Form updated successfully!");
  
    } catch (error) {
      toast.error(error.message || "Failed to save changes");
      console.error("Update error:", error);
    } finally {
      setSubmitting(false);
    }
  };
  
// Function to add a field to a section
const addField = (sectionIndex) => {
    // Get current form values
    const currentValues = watch();
    
    // Get the current fields for this section or initialize an empty array
    const currentFields = currentValues.sections?.[sectionIndex]?.fields || [];
    
    // Create a new array with the existing fields plus the new one
    const updatedFields = [
      ...currentFields,
      {
        label: 'New Field',
        type: 'text',
        required: false,
        placeholder: '',
        fieldId: `field_${sectionIndex}_${currentFields.length}_${Date.now()}`,
        options: [],
        helpText: ''
      }
    ];
    
    // Update the form state
    setValue(`sections.${sectionIndex}.fields`, updatedFields);
  };
  
  // Function to remove a field from a section
 // Function to remove a field from a section
const removeField = (sectionIndex, fieldIndex) => {
    // Get current form values
    const currentValues = watch();
    
    // Get the current fields for this section
    const currentFields = currentValues.sections?.[sectionIndex]?.fields || [];
    
    // Create a new array without the field to remove
    const updatedFields = [
      ...currentFields.slice(0, fieldIndex),
      ...currentFields.slice(fieldIndex + 1)
    ];
    
    // Update the form state
    setValue(`sections.${sectionIndex}.fields`, updatedFields);
  };
  // Function to move a field up or down
  // Function to move a field up or down
const moveField = (sectionIndex, fieldIndex, direction) => {
    if (direction === 'up' && fieldIndex === 0) return;
    
    // Get current form values
    const currentValues = watch();
    
    // Get the current fields for this section
    const currentFields = currentValues.sections?.[sectionIndex]?.fields || [];
    
    const newIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
    
    if (newIndex >= currentFields.length) return;
    
    // Create a new array with the fields reordered
    const updatedFields = [...currentFields];
    const temp = updatedFields[fieldIndex];
    updatedFields[fieldIndex] = updatedFields[newIndex];
    updatedFields[newIndex] = temp;
    
    // Update the form state
    setValue(`sections.${sectionIndex}.fields`, updatedFields);
  };
  // Function to add an option to a multi-choice field
const addOption = (sectionIndex, fieldIndex) => {
    // Get current form values
    const currentValues = watch();
    
    // Get current options for this field
    const currentOptions = currentValues.sections?.[sectionIndex]?.fields?.[fieldIndex]?.options || [];
    
    // Create a new array with the existing options plus the new one
    const updatedOptions = [...currentOptions, 'New Option'];
    
    // Update the form state
    setValue(`sections.${sectionIndex}.fields.${fieldIndex}.options`, updatedOptions);
  };
  // Function to add an option to a multi-choice field
  
  
  // Function to remove an option from a multi-choice field
 // Function to remove an option from a multi-choice field
const removeOption = (sectionIndex, fieldIndex, optionIndex) => {
    // Get current form values
    const currentValues = watch();
    
    // Get current options for this field
    const currentOptions = currentValues.sections?.[sectionIndex]?.fields?.[fieldIndex]?.options || [];
    
    // Create a new array without the option to remove
    const updatedOptions = [
      ...currentOptions.slice(0, optionIndex),
      ...currentOptions.slice(optionIndex + 1)
    ];
    
    // Update the form state
    setValue(`sections.${sectionIndex}.fields.${fieldIndex}.options`, updatedOptions);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[300px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading form builder...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => navigate(`/events/${eventId}`)}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Event
          </button>
          <h1 className="text-2xl font-bold mt-2">
            {formExists ? 'Edit Form' : 'Create Form'}: {event?.name}
          </h1>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {previewMode ? <FileText className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {previewMode ? 'Edit Mode' : 'Preview'}
          </button>
        </div>
      </div>
      
      {previewMode ? (
        // Preview Mode
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-2">{formValues.title}</h2>
            {formValues.description && (
              <p className="text-gray-600 text-center mb-6">{formValues.description}</p>
            )}
            {formValues.instructions && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <h3 className="text-lg font-medium text-blue-800">Instructions</h3>
                <p className="text-blue-700">{formValues.instructions}</p>
              </div>
            )}
            
            {formValues.sections.map((section, sIndex) => (
              <div key={sIndex} className="mb-8">
                <h3 className="text-xl font-semibold mb-2 pb-2 border-b">{section.title}</h3>
                {section.description && (
                  <p className="text-gray-600 mb-4">{section.description}</p>
                )}
                
                <div className="space-y-4">
                  {section.fields.map((field, fIndex) => {
                    // Skip rendering layout elements in preview
                    if (field.type === 'header') {
                      return (
                        <div key={fIndex} className="pt-4">
                          <h4 className="text-lg font-medium">{field.label}</h4>
                        </div>
                      );
                    }
                    
                    if (field.type === 'paragraph') {
                      return (
                        <div key={fIndex} className="text-gray-700">
                          <p>{field.label}</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={fIndex} className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        
                        {field.helpText && (
                          <p className="text-xs text-gray-500 mb-1">{field.helpText}</p>
                        )}
                        
                        {field.type === 'text' && (
                          <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder={field.placeholder}
                            disabled
                          />
                        )}
                        
                        {field.type === 'textarea' && (
                          <textarea
                            rows="3"
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder={field.placeholder}
                            disabled
                          ></textarea>
                        )}
                        
                        {field.type === 'number' && (
                          <input
                            type="number"
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder={field.placeholder}
                            disabled
                          />
                        )}
                        
                        {field.type === 'email' && (
                          <input
                            type="email"
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder={field.placeholder || 'Email address'}
                            disabled
                          />
                        )}
                        
                        {field.type === 'select' && (
                          <select className="w-full px-3 py-2 border rounded-md" disabled>
                            <option value="">Select an option</option>
                            {field.options && field.options.map((option, i) => (
                              <option key={i} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                        
                        {field.type === 'radio' && field.options && (
                          <div className="space-y-2">
                            {field.options.map((option, i) => (
                              <label key={i} className="flex items-center">
                                <input 
                                  type="radio" 
                                  className="mr-2" 
                                  name={`section_${sIndex}_field_${fIndex}`} 
                                  disabled 
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {field.type === 'checkbox' && field.options && (
                          <div className="space-y-2">
                            {field.options.map((option, i) => (
                              <label key={i} className="flex items-center">
                                <input type="checkbox" className="mr-2" disabled />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        
                        {field.type === 'date' && (
                          <input
                            type="date"
                            className="w-full px-3 py-2 border rounded-md"
                            disabled
                          />
                        )}
                        
                        {field.type === 'time' && (
                          <input
                            type="time"
                            className="w-full px-3 py-2 border rounded-md"
                            disabled
                          />
                        )}
                        
                        {field.type === 'file' && (
                          <input
                            type="file"
                            className="w-full px-3 py-2 border rounded-md"
                            disabled
                          />
                        )}
                        
                        {field.type === 'url' && (
                          <input
                            type="url"
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder={field.placeholder || 'https://example.com'}
                            disabled
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            
            <div className="mt-8 pt-4 border-t">
              <button
                type="button"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                disabled
              >
                Submit Form
              </button>
              
              {formValues.settings.thankYouMessage && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <h3 className="text-green-800 font-medium">Success Message:</h3>
                  <p className="text-green-700">{formValues.settings.thankYouMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Edit Mode
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="space-y-6">
            {/* Form Basic Info */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Form Title *</label>
                <input
                  id="title"
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter form title"
                  {...register('title', { required: 'Form title is required' })}
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
              </div>
              
              <div className="col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Form Description</label>
                <textarea
                  id="description"
                  rows="2"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Brief description of this form"
                  {...register('description')}
                ></textarea>
              </div>
              
              <div className="col-span-2">
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instructions for Participants</label>
                <textarea
                  id="instructions"
                  rows="3"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Provide instructions for filling out this form"
                  {...register('instructions')}
                ></textarea>
              </div>
            </div>
            
            <hr className="my-8" />
            
            {/* Form Sections */}
            <div>
              <h3 className="text-lg font-medium mb-4">Form Sections</h3>
              
              {sectionFields.map((section, sectionIndex) => (
                <div key={section.id} className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium flex items-center">
                      <span>Section {sectionIndex + 1}</span>
                    </h4>
                    
                    <div className="flex space-x-2">
                      {sectionFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSection(sectionIndex)}
                          className="text-red-600 hover:text-red-800"
                          title="Remove Section"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                      
                      {sectionIndex > 0 && (
                        <button
                          type="button"
                          onClick={() => moveSection(sectionIndex, sectionIndex - 1)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Move Section Up"
                        >
                          <MoveUp className="w-5 h-5" />
                        </button>
                      )}
                      
                      {sectionIndex < sectionFields.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveSection(sectionIndex, sectionIndex + 1)}
                          className="text-gray-600 hover:text-gray-800"
                          title="Move Section Down"
                        >
                          <MoveDown className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Section Title *</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Section title"
                        {...register(`sections.${sectionIndex}.title`, { required: 'Section title is required' })}
                      />
                      {errors.sections?.[sectionIndex]?.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.sections[sectionIndex].title.message}</p>
                      )}
                    </div>
                    
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Section Description</label>
                      <textarea
                        rows="2"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Optional description for this section"
                        {...register(`sections.${sectionIndex}.description`)}
                      ></textarea>
                    </div>
                  </div>
                  
                  {/* Fields for this section */}
                  <div className="mt-6">
                    <h5 className="text-sm font-medium mb-4">Fields</h5>
                    
                    {watch(`sections.${sectionIndex}.fields`)?.map((field, fieldIndex) => (
                      <div key={fieldIndex} className="mb-4 p-3 bg-white border border-gray-200 rounded-md">
                        <div className="flex justify-between items-center mb-3">
                          <h6 className="text-sm font-medium">Field {fieldIndex + 1}</h6>
                          
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => removeField(sectionIndex, fieldIndex)}
                              className="text-red-600 hover:text-red-800"
                              title="Remove Field"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            
                            {fieldIndex > 0 && (
                              <button
                                type="button"
                                onClick={() => moveField(sectionIndex, fieldIndex, 'up')}
                                className="text-gray-600 hover:text-gray-800"
                                title="Move Field Up"
                              >
                                <MoveUp className="w-4 h-4" />
                              </button>
                            )}
                            
                            {fieldIndex < watch(`sections.${sectionIndex}.fields`).length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveField(sectionIndex, fieldIndex, 'down')}
                                className="text-gray-600 hover:text-gray-800"
                                title="Move Field Down"
                              >
                                <MoveDown className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className={field.type === 'header' || field.type === 'paragraph' ? 'md:col-span-2' : ''}>
                            <label className="block text-xs font-medium text-gray-700">Field Label *</label>
                            <input
                              type="text"
                              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Field label"
                              {...register(`sections.${sectionIndex}.fields.${fieldIndex}.label`, { required: 'Label is required' })}
                            />
                          </div>
                          
                          {field.type !== 'header' && field.type !== 'paragraph' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Field Type *</label>
                              <select
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                {...register(`sections.${sectionIndex}.fields.${fieldIndex}.type`)}
                              >
                                {FIELD_TYPES.map((type) => (
                                  <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                        
                        {/* Additional field options based on field type */}
                        {field.type !== 'header' && field.type !== 'paragraph' && (
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                  {...register(`sections.${sectionIndex}.fields.${fieldIndex}.required`)}
                                />
                                <span className="ml-2 text-xs font-medium text-gray-700">Required Field</span>
                              </label>
                            </div>
                            
                            {['text', 'textarea', 'number', 'email', 'url'].includes(field.type) && (
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Placeholder Text</label>
                                <input
                                  type="text"
                                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  placeholder="Placeholder text"
                                  {...register(`sections.${sectionIndex}.fields.${fieldIndex}.placeholder`)}
                                />
                              </div>
                            )}
                            
                            {['select', 'radio', 'checkbox'].includes(field.type) && (
                              <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Options</label>
                                
                                {watch(`sections.${sectionIndex}.fields.${fieldIndex}.options`)?.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center mb-1">
                                    <input
                                      type="text"
                                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                      placeholder={`Option ${optionIndex + 1}`}
                                      {...register(`sections.${sectionIndex}.fields.${fieldIndex}.options.${optionIndex}`)}
                                    />
                                    
                                    <button
                                      type="button"
                                      onClick={() => removeOption(sectionIndex, fieldIndex, optionIndex)}
                                      className="ml-2 text-red-600 hover:text-red-800"
                                      title="Remove Option"
                                    >
                                      <MinusCircle className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                
                                <button
                                  type="button"
                                  onClick={() => addOption(sectionIndex, fieldIndex)}
                                  className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                  <PlusCircle className="w-4 h-4 mr-1" />
                                  Add Option
                                </button>
                              </div>
                            )}
                            
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-700">Help Text</label>
                              <input
                                type="text"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Additional instructions for this field"
                                {...register(`sections.${sectionIndex}.fields.${fieldIndex}.helpText`)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => addField(sectionIndex)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <PlusCircle className="w-4 h-4 mr-1" />
                      Add Field
                    </button>
                  </div>
                </div>
              ))}
              
              <button
  type="button"
  onClick={() => appendSection({
    title: `Section ${sectionFields.length + 1}`,
    description: '',
    sectionId: `section_${sectionFields.length}_${Date.now()}`,
    fields: [
      {
        label: 'New Field',
        type: 'text',
        required: false,
        placeholder: '',
        fieldId: `field_${sectionFields.length}_0_${Date.now()}`,
        options: [],
        helpText: ''
      }
    ]
  })}
  className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
>
  <PlusCircle className="w-4 h-4 mr-1" />
  Add Section
</button>
            </div>
            
            <hr className="my-8" />
            {/* Form Settings */}
            <div>
              <h3 className="text-lg font-medium mb-4">Form Settings</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      {...register('settings.allowMultipleSubmissions')}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Allow Multiple Submissions</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    When enabled, users can submit the form multiple times
                  </p>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      {...register('settings.requireApproval')}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Require Approval</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    When enabled, submissions require approval before users can attend
                  </p>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      {...register('settings.notifyOnSubmission')}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Notify On Submission</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Receive email notifications when users submit the form
                  </p>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      {...register('settings.autoClose')}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Auto Close Form</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-6">
                    Automatically close the form on a specific date
                  </p>
                </div>
                
                {watch('settings.autoClose') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Auto Close Date</label>
                    <input
                      type="date"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      min={new Date().toISOString().split('T')[0]}
                      {...register('settings.autoCloseDate', {
                        required: watch('settings.autoClose') ? 'Close date is required when auto-close is enabled' : false
                      })}
                    />
                    {errors.settings?.autoCloseDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.settings.autoCloseDate.message}</p>
                    )}
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Thank You Message</label>
                  <textarea
                    rows="2"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Message displayed after successful submission"
                    {...register('settings.thankYouMessage')}
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate(`/events/${eventId}`)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={submitting}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={submitting || (!isDirty && formExists)}
              >
                <Save className="w-4 h-4 mr-2" />
                {submitting 
                  ? 'Saving...' 
                  : formExists 
                    ? 'Save Changes' 
                    : 'Create Form'}
              </button>
              
              <button
                type="submit"
                onClick={() => {
                  // Set flag to redirect after save
                  // setSaveAndExit(true);
                }}
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                disabled={submitting || (!isDirty && formExists)}
              >
                Save & Exit
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditFormPage;