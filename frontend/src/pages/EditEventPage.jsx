import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import eventService from '../services/eventService';

const EditEventForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [event, setEvent] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [customFields, setCustomFields] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [keepExistingImage, setKeepExistingImage] = useState(true);
  const [updateSeries, setUpdateSeries] = useState(false);
  
  // Fetch event data on component mount
  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const response = await eventService.getEvent(eventId);
        
        if (response.success && response.data) {
          setEvent(response.data);
          
          // Populate form with event data
          setValue('title', response.data.name);
          setValue('description', response.data.description);
          setValue('category', response.data.category);
          setValue('isPrivate', response.data.visibility === 'private');
          setValue('isOnline', response.data.virtual);
          setIsOnline(response.data.virtual);
          
          if (response.data.location) {
            setValue('location', response.data.location.name);
            
            if (response.data.location.address) {
              setValue('locationDetails.address', response.data.location.address);
              setValue('locationDetails.city', response.data.location.city);
              setValue('locationDetails.state', response.data.location.state);
              setValue('locationDetails.country', response.data.location.country);
              setValue('locationDetails.postalCode', response.data.location.postalCode);
            }
          }
          
          if (response.data.startDateTime) {
            const start = new Date(response.data.startDateTime);
            setStartDate(start);
            setValue('startDate', start);
          }
          
          if (response.data.endDateTime) {
            const end = new Date(response.data.endDateTime);
            setEndDate(end);
            setValue('endDate', end);
          }
          
          if (response.data.capacity) {
            setValue('maxAttendees', response.data.capacity);
          }
          
          if (response.data.coverImage && response.data.coverImage.url) {
            setCoverImagePreview(response.data.coverImage.url);
          }
          
          if (response.data.customFields && response.data.customFields.length > 0) {
            setCustomFields(response.data.customFields);
          }
          
          setLoading(false);
        } else {
          toast.error('Failed to load event details');
          navigate('/my-events');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Error loading event details');
        navigate('/my-events');
      }
    };
    
    fetchEvent();
  }, [eventId, setValue, navigate]);
  // Handle form submission
  const onSubmit = async (data) => {
    setSubmitting(true);
    
    try {
      // Prepare the data for submission
      const eventData = {
        ...data,
        startDate,
        endDate,
        customFields,
        keepExistingImage,
        updateSeries: updateSeries ? 'true' : 'false'
      };
      
      // Add cover image if a new one is selected
      if (coverImage) {
        eventData.coverImage = coverImage;
      }
      
      // Call the API to update the event
      const response = await eventService.updateEvent(eventId, eventData);
      
      if (response.success) {
        toast.success('Event updated successfully');
        navigate(`/events/${eventId}`);
      } else {
        toast.error(response.error || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('An error occurred while updating the event');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Handle image upload
  const handleImageChange = (file) => {
    setCoverImage(file);
    setKeepExistingImage(false);
    
    // Create a preview URL
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverImagePreview('');
    }
  };
  
  // Handle removing the image
  const handleRemoveImage = () => {
    setCoverImage(null);
    setCoverImagePreview('');
    setKeepExistingImage(false);
  };
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading event details...</div>;
  }
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Event Title */}
        <div className="form-group">
          <label htmlFor="title" className="font-medium block mb-1">Event Title *</label>
          <input
            id="title"
            type="text"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter event title"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && <span className="text-red-500 text-sm">{errors.title.message}</span>}
        </div>
        
        {/* Event Description */}
        <div className="form-group">
          <label htmlFor="description" className="font-medium block mb-1">Description</label>
          <textarea
            id="description"
            rows="4"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Describe your event"
            {...register('description')}
          ></textarea>
        </div>
        
        {/* Event Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="startDate" className="font-medium block mb-1">Start Date and Time *</label>
            <DatePicker
              id="startDate"
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
                setValue('startDate', date);
              }}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full px-3 py-2 border rounded-md"
              minDate={new Date()}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate" className="font-medium block mb-1">End Date and Time</label>
            <DatePicker
              id="endDate"
              selected={endDate}
              onChange={(date) => {
                setEndDate(date);
                setValue('endDate', date);
              }}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full px-3 py-2 border rounded-md"
              minDate={startDate}
            />
          </div>
        </div>
        {/* Event Type */}
        <div className="form-group">
          <label className="font-medium block mb-1">Event Type</label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                {...register('isOnline')}
                onChange={(e) => {
                  setValue('isOnline', e.target.checked);
                  setIsOnline(e.target.checked);
                }}
              />
              <span className="ml-2">Online Event</span>
            </label>
          </div>
        </div>
        
        {/* Location (if not online) */}
        {!isOnline && (
          <div className="form-group">
            <label htmlFor="location" className="font-medium block mb-1">Location</label>
            <input
              id="location"
              type="text"
              className="w-full px-3 py-2 border rounded-md mb-2"
              placeholder="Enter location name"
              {...register('location')}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label htmlFor="locationDetails.address" className="text-sm block mb-1">Address</label>
                <input
                  id="locationDetails.address"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Street address"
                  {...register('locationDetails.address')}
                />
              </div>
              
              <div>
                <label htmlFor="locationDetails.city" className="text-sm block mb-1">City</label>
                <input
                  id="locationDetails.city"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="City"
                  {...register('locationDetails.city')}
                />
              </div>
              
              <div>
                <label htmlFor="locationDetails.state" className="text-sm block mb-1">State/Province</label>
                <input
                  id="locationDetails.state"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="State or province"
                  {...register('locationDetails.state')}
                />
              </div>
              
              <div>
                <label htmlFor="locationDetails.country" className="text-sm block mb-1">Country</label>
                <input
                  id="locationDetails.country"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Country"
                  {...register('locationDetails.country')}
                />
              </div>
              
              <div>
                <label htmlFor="locationDetails.postalCode" className="text-sm block mb-1">Postal Code</label>
                <input
                  id="locationDetails.postalCode"
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Postal code"
                  {...register('locationDetails.postalCode')}
                />
              </div>
            </div>
          </div>
        )}
        {/* Category */}
        <div className="form-group">
          <label htmlFor="category" className="font-medium block mb-1">Category</label>
          <select
            id="category"
            className="w-full px-3 py-2 border rounded-md"
            {...register('category')}
          >
            <option value="social">Social</option>
            <option value="networking">Networking</option>
            <option value="educational">Educational</option>
            <option value="business">Business</option>
            <option value="tech">Technology</option>
            <option value="arts">Arts & Culture</option>
            <option value="health">Health & Wellness</option>
            <option value="sports">Sports & Fitness</option>
            <option value="food">Food & Drink</option>
            <option value="charity">Charity & Causes</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {/* Visibility */}
        <div className="form-group">
          <label className="font-medium block mb-1">Visibility</label>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                {...register('isPrivate')}
              />
              <span className="ml-2">Private Event</span>
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Private events are only visible to invited users.
          </p>
        </div>
        
        {/* Max Attendees */}
        <div className="form-group">
          <label htmlFor="maxAttendees" className="font-medium block mb-1">Max Attendees</label>
          <input
            id="maxAttendees"
            type="number"
            min="1"
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Leave empty for unlimited"
            {...register('maxAttendees', {
              min: { value: 1, message: 'Minimum 1 attendee allowed' },
              valueAsNumber: true
            })}
          />
          {errors.maxAttendees && <span className="text-red-500 text-sm">{errors.maxAttendees.message}</span>}
        </div>
        {/* Cover Image */}
        <div className="form-group">
          <label className="font-medium block mb-2">Cover Image</label>
          
          {coverImagePreview ? (
            <div className="relative mb-3">
              <img 
                src={coverImagePreview} 
                alt="Event cover" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="mb-3">
              <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
                <p className="text-gray-500">No cover image</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Image
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files[0])}
              />
            </label>
            
            {event?.coverImage?.url && (
              <button
                type="button"
                className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setCoverImagePreview(event.coverImage.url);
                  setKeepExistingImage(true);
                  setCoverImage(null);
                }}
              >
                Restore Original
              </button>
            )}
          </div>
        </div>
        
        {/* Series Update Option */}
        {event?.eventSeries && (
          <div className="form-group">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={updateSeries}
                onChange={(e) => setUpdateSeries(e.target.checked)}
              />
              <span className="ml-2">Update all future events in this series</span>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              If checked, these changes will apply to all future events in this series.
            </p>
          </div>
        )}
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 mt-8">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            onClick={() => navigate(`/events/${eventId}`)}
            disabled={submitting}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEventForm;