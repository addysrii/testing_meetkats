import React, { useState, useRef, useCallback } from 'react';
import { Download, Award, QrCode, Eye, RefreshCw, Upload, Image, Move, RotateCcw, Trash2 } from 'lucide-react';
import QRCode from 'react-qr-code';

const QRCertificateGenerator = () => {
  const [formData, setFormData] = useState({
    recipientName: '',
    courseName: '',
    completionDate: '',
    issuerName: '',
    certificateId: '',
    description: ''
  });

  const [designImage, setDesignImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [textElements, setTextElements] = useState([
    { id: 'recipient', label: 'Recipient Name', x: 50, y: 40, fontSize: 24, color: '#1f2937', fontWeight: 'bold', textAlign: 'center' },
    { id: 'course', label: 'Course Name', x: 50, y: 55, fontSize: 18, color: '#374151', fontWeight: 'normal', textAlign: 'center' },
    { id: 'date', label: 'Date', x: 20, y: 80, fontSize: 14, color: '#6b7280', fontWeight: 'normal', textAlign: 'left' },
    { id: 'issuer', label: 'Issuer', x: 80, y: 80, fontSize: 14, color: '#6b7280', fontWeight: 'normal', textAlign: 'right' },
    { id: 'certId', label: 'Certificate ID', x: 20, y: 85, fontSize: 12, color: '#9ca3af', fontWeight: 'normal', textAlign: 'left' }
  ]);

  const [qrSettings, setQrSettings] = useState({
    x: 85,
    y: 15,
    size: 80,
    color: '#000000'
  });

  const [showPreview, setShowPreview] = useState(false);
  const [qrData, setQrData] = useState('');
  const [dragElement, setDragElement] = useState(null);
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef(null);
  const certificateRef = useRef(null);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setDesignImage(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid image file (PNG, JPG, JPEG, SVG)');
    }
  }, []);

  // Generate random certificate ID
  const generateCertificateId = () => {
    const id = 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setFormData({ ...formData, certificateId: id });
  };

  // Generate certificate and QR code data
  const generateCertificate = () => {
    if (!formData.recipientName) {
      alert('Please fill in recipient name');
      return;
    }

    if (!designImage) {
      alert('Please upload your certificate design first');
      return;
    }

    const certificateId = formData.certificateId || 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    if (!formData.certificateId) {
      setFormData({ ...formData, certificateId: certificateId });
    }

    const certificateData = {
      id: certificateId,
      recipient: formData.recipientName,
      course: formData.courseName,
      date: formData.completionDate,
      issuer: formData.issuerName,
      description: formData.description,
      verifyUrl: `https://verify.certificates.com/${certificateId}`,
      timestamp: new Date().toISOString()
    };

    setQrData(JSON.stringify(certificateData));
    setShowPreview(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Update text element properties
  const updateTextElement = (id, property, value) => {
    setTextElements(prev => 
      prev.map(element => 
        element.id === id ? { ...element, [property]: value } : element
      )
    );
  };

  // Update QR settings
  const updateQRSettings = (property, value) => {
    setQrSettings(prev => ({ ...prev, [property]: value }));
  };

  // Get text content for each element
  const getTextContent = (elementId) => {
    switch(elementId) {
      case 'recipient': return formData.recipientName || 'John Doe';
      case 'course': return formData.courseName || '';
      case 'date': return formData.completionDate || '';
      case 'issuer': return formData.issuerName || '';
      case 'certId': return formData.certificateId || '';
      default: return '';
    }
  };

  const downloadCertificate = () => {
    alert('Certificate download feature would be implemented with html2canvas or fabric.js for production use');
  };

  const resetDesign = () => {
    setDesignImage(null);
    setImagePreview(null);
    setShowPreview(false);
    setQrData('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Upload className="w-12 h-12 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">Custom Design Certificate Generator</h1>
          </div>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Upload your own certificate design and automatically place content with QR codes
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-xl p-2 shadow-lg">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'upload' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Design
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'content' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Award className="w-4 h-4 mr-2" />
            Certificate Content
          </button>
          <button
            onClick={() => setActiveTab('position')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'position' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Move className="w-4 h-4 mr-2" />
            Position Elements
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'preview' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview & Download
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Upload Design */}
            {activeTab === 'upload' && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <Image className="w-8 h-8 text-blue-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-800">Upload Certificate Design</h2>
                  </div>
                  <button
                    onClick={resetDesign}
                    className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors text-sm flex items-center"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </button>
                </div>

                <div className="space-y-6">
                  {/* File Upload Area */}
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Upload Your Certificate Design
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Click to upload or drag and drop your certificate template
                    </p>
                    <p className="text-sm text-gray-400">
                      Supports PNG, JPG, JPEG, SVG • Max 10MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Design Tips */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <h4 className="font-semibold text-blue-800 mb-3">Design Tips:</h4>
                    <ul className="space-y-2 text-blue-700 text-sm">
                      <li>• Use high-resolution images (300 DPI recommended)</li>
                      <li>• Leave space for recipient name, course name, and other details</li>
                      <li>• Consider QR code placement (usually bottom-right corner)</li>
                      <li>• Ensure good contrast for text readability</li>
                      <li>• Recommended size: 1920x1080 pixels or larger</li>
                    </ul>
                  </div>

                  {/* Sample Templates */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Need a template?</h4>
                    <p className="text-gray-600 text-sm mb-4">
                      You can download free certificate templates from these sources:
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <a href="#" className="text-blue-600 hover:text-blue-800">• Canva Templates</a>
                      <a href="#" className="text-blue-600 hover:text-blue-800">• Adobe Stock</a>
                      <a href="#" className="text-blue-600 hover:text-blue-800">• Freepik</a>
                      <a href="#" className="text-blue-600 hover:text-blue-800">• Template.net</a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Certificate Content */}
            {activeTab === 'content' && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center mb-8">
                  <Award className="w-8 h-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-800">Certificate Content</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Enter recipient's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Course/Achievement Name
                    </label>
                    <input
                      type="text"
                      name="courseName"
                      value={formData.courseName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="e.g., React Development Bootcamp (Optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Completion Date
                    </label>
                    <input
                      type="date"
                      name="completionDate"
                      value={formData.completionDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Issuing Organization
                    </label>
                    <input
                      type="text"
                      name="issuerName"
                      value={formData.issuerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Your organization name (Optional)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Certificate ID
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        name="certificateId"
                        value={formData.certificateId}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Auto-generated if empty"
                      />
                      <button
                        onClick={generateCertificateId}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        title="Generate Random ID"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
                      placeholder="Additional details about the achievement..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Position Elements */}
            {activeTab === 'position' && (
              <div className="space-y-6">
                {/* Text Elements Positioning */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                  <div className="flex items-center mb-6">
                    <Move className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-800">Text Positioning</h3>
                  </div>
                  
                  <div className="space-y-6">
                    {textElements.map((element) => (
                      <div key={element.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-700 mb-3">{element.label}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">X Position (%)</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={element.x}
                              onChange={(e) => updateTextElement(element.id, 'x', parseInt(e.target.value))}
                              className="w-full"
                            />
                            <span className="text-xs text-gray-500">{element.x}%</span>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Y Position (%)</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={element.y}
                              onChange={(e) => updateTextElement(element.id, 'y', parseInt(e.target.value))}
                              className="w-full"
                            />
                            <span className="text-xs text-gray-500">{element.y}%</span>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
                            <input
                              type="range"
                              min="8"
                              max="48"
                              value={element.fontSize}
                              onChange={(e) => updateTextElement(element.id, 'fontSize', parseInt(e.target.value))}
                              className="w-full"
                            />
                            <span className="text-xs text-gray-500">{element.fontSize}px</span>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                            <input
                              type="color"
                              value={element.color}
                              onChange={(e) => updateTextElement(element.id, 'color', e.target.value)}
                              className="w-full h-8 border border-gray-300 rounded"
                            />
                          </div>
                        </div>
                        <div className="flex gap-4 mt-3">
                          <select
                            value={element.textAlign}
                            onChange={(e) => updateTextElement(element.id, 'textAlign', e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                          <select
                            value={element.fontWeight}
                            onChange={(e) => updateTextElement(element.id, 'fontWeight', e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Code Positioning */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                  <div className="flex items-center mb-6">
                    <QrCode className="w-6 h-6 text-blue-600 mr-3" />
                    <h3 className="text-xl font-bold text-gray-800">QR Code Positioning</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">X Position (%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={qrSettings.x}
                        onChange={(e) => updateQRSettings('x', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-500">{qrSettings.x}%</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Y Position (%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={qrSettings.y}
                        onChange={(e) => updateQRSettings('y', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-500">{qrSettings.y}%</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Size (px)</label>
                      <input
                        type="range"
                        min="40"
                        max="150"
                        value={qrSettings.size}
                        onChange={(e) => updateQRSettings('size', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-sm text-gray-500">{qrSettings.size}px</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Color</label>
                      <input
                        type="color"
                        value={qrSettings.color}
                        onChange={(e) => updateQRSettings('color', e.target.value)}
                        className="w-full h-10 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Live Preview</h2>
                <div className="flex gap-2">
                  <button
                    onClick={generateCertificate}
                    disabled={!designImage}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Update
                  </button>
                  {showPreview && (
                    <button
                      onClick={downloadCertificate}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors text-sm"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Save
                    </button>
                  )}
                </div>
              </div>

              {imagePreview ? (
                <div className="w-full">
                  <div 
                    ref={certificateRef}
                    className="w-full relative overflow-hidden rounded-lg shadow-lg"
                    style={{ aspectRatio: '4/3' }}
                  >
                    {/* Background Image */}
                    <img 
                      src={imagePreview} 
                      alt="Certificate Design"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Text Overlays */}
                    {showPreview && textElements.map((element) => (
                      <div
                        key={element.id}
                        className="absolute"
                        style={{
                          left: `${element.x}%`,
                          top: `${element.y}%`,
                          transform: 'translate(-50%, -50%)',
                          fontSize: `${element.fontSize}px`,
                          color: element.color,
                          fontWeight: element.fontWeight,
                          textAlign: element.textAlign,
                          whiteSpace: 'nowrap',
                          maxWidth: '90%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {getTextContent(element.id)}
                      </div>
                    ))}

                    {/* QR Code Overlay */}
                    {showPreview && qrData && (
                      <div
                        className="absolute"
                        style={{
                          left: `${qrSettings.x}%`,
                          top: `${qrSettings.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className="bg-white p-2 rounded shadow-lg">
                          <QRCode
                            value={qrData}
                            size={qrSettings.size}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox="0 0 256 256"
                            bgColor="#ffffff"
                            fgColor={qrSettings.color}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Design Info */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Design Status:</strong> {designImage ? 'Uploaded ✓' : 'Not uploaded'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>QR Code:</strong> {qrData ? 'Generated ✓' : 'Click Update to generate'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <Image className="w-16 h-16 mb-4 opacity-20" />
                  <p className="text-lg mb-2">No Design Uploaded</p>
                  <p className="text-sm text-center max-w-xs">
                    Upload your certificate design to see the preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <Upload className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Custom Design Upload</h3>
            <p className="text-gray-600">Upload your own certificate design and automatically place content with precise positioning controls.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <Move className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Drag & Position</h3>
            <p className="text-gray-600">Easily position text elements and QR codes anywhere on your design with intuitive controls.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <QrCode className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart QR Integration</h3>
            <p className="text-gray-600">Automatically generate QR codes with certificate data and position them perfectly on your design.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCertificateGenerator;
