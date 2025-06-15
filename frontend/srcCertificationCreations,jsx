import React, { useState, useRef } from 'react';
import { Download, Award, QrCode, Eye, RefreshCw } from 'lucide-react';

const QRCertificateGenerator = () => {
  const [formData, setFormData] = useState({
    recipientName: '',
    courseName: '',
    completionDate: '',
    issuerName: 'Your Organization',
    certificateId: '',
    description: ''
  });
  
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const certificateRef = useRef(null);

  // Generate random certificate ID
  const generateCertificateId = () => {
    const id = 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    setFormData({ ...formData, certificateId: id });
  };

  // Generate QR Code
  const generateQRCode = async () => {
    if (!formData.recipientName || !formData.courseName) {
      alert('Please fill in recipient name and course name');
      return;
    }

    const certificateData = {
      id: formData.certificateId || 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      recipient: formData.recipientName,
      course: formData.courseName,
      date: formData.completionDate,
      issuer: formData.issuerName,
      verifyUrl: `https://verify.certificates.com/${formData.certificateId || 'demo'}`
    };

    // Update certificate ID if not set
    if (!formData.certificateId) {
      setFormData({ ...formData, certificateId: certificateData.id });
    }

    try {
      const QRCode = await import('qrcode');
      const qrDataUrl = await QRCode.toDataURL(JSON.stringify(certificateData), {
        width: 200,
        margin: 2,
        color: {
          dark: '#2563eb',
          light: '#ffffff'
        }
      });
      setQrCodeDataURL(qrDataUrl);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const downloadCertificate = () => {
    if (certificateRef.current) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const cert = certificateRef.current;
      
      canvas.width = cert.offsetWidth * 2;
      canvas.height = cert.offsetHeight * 2;
      
      // Create a simple certificate download (in a real app, you'd use html2canvas or similar)
      alert('Certificate download feature would be implemented with html2canvas or similar library');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <Award className="w-12 h-12 mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold">QR Certificate Generator</h1>
          </div>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Create professional certificates with embedded QR codes for instant verification
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center mb-8">
              <QrCode className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-800">Certificate Details</h2>
            </div>

            <div className="space-y-6">
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
                  Course/Achievement Name *
                </label>
                <input
                  type="text"
                  name="courseName"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="e.g., React Development Bootcamp"
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
                  placeholder="Your organization name"
                />
              </div>

              <div>
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

              <div>
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

              <div className="flex gap-4">
                <button
                  onClick={generateQRCode}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  Generate & Preview
                </button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Certificate Preview</h2>
              {showPreview && (
                <button
                  onClick={downloadCertificate}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              )}
            </div>

            {showPreview ? (
              <div 
                ref={certificateRef}
                className="bg-gradient-to-br from-blue-50 to-indigo-100 border-8 border-blue-600 rounded-2xl p-12 text-center relative overflow-hidden"
              >
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 w-16 h-16 border-4 border-blue-300 rounded-full opacity-20"></div>
                <div className="absolute bottom-4 right-4 w-20 h-20 border-4 border-purple-300 rounded-full opacity-20"></div>
                
                <div className="relative z-10">
                  <div className="mb-6">
                    <Award className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">CERTIFICATE</h1>
                    <p className="text-lg text-gray-600">OF ACHIEVEMENT</p>
                  </div>

                  <div className="mb-8 space-y-4">
                    <p className="text-lg text-gray-700">This is to certify that</p>
                    <h2 className="text-4xl font-bold text-blue-800 py-2 border-b-2 border-blue-200">
                      {formData.recipientName || 'Recipient Name'}
                    </h2>
                    <p className="text-lg text-gray-700">has successfully completed</p>
                    <h3 className="text-2xl font-semibold text-gray-800">
                      {formData.courseName || 'Course Name'}
                    </h3>
                    {formData.description && (
                      <p className="text-gray-600 mt-4">{formData.description}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-left">
                      <p className="text-sm text-gray-600">Date of Completion</p>
                      <p className="font-semibold text-gray-800">
                        {formData.completionDate || 'Not specified'}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">Certificate ID</p>
                      <p className="font-mono text-sm text-gray-800">
                        {formData.certificateId || 'Auto-generated'}
                      </p>
                    </div>

                    <div className="text-center">
                      {qrCodeDataURL && (
                        <div>
                          <img 
                            src={qrCodeDataURL} 
                            alt="QR Code" 
                            className="w-24 h-24 mx-auto mb-2 border-2 border-gray-200 rounded-lg"
                          />
                          <p className="text-xs text-gray-600">Scan to verify</p>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="border-t-2 border-gray-400 pt-2 mt-8">
                        <p className="font-semibold text-gray-800">
                          {formData.issuerName}
                        </p>
                        <p className="text-sm text-gray-600">Authorized Signature</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <Award className="w-24 h-24 mb-4 opacity-20" />
                <p className="text-lg mb-2">Certificate Preview</p>
                <p className="text-sm text-center">Fill in the details and click "Generate & Preview" to see your certificate</p>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <QrCode className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">QR Code Verification</h3>
            <p className="text-gray-600">Each certificate includes a unique QR code for instant verification and authenticity.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <Award className="w-12 h-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Professional Design</h3>
            <p className="text-gray-600">Beautiful, customizable certificate templates that look professional and impressive.</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <Download className="w-12 h-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Easy Download</h3>
            <p className="text-gray-600">Download certificates in high-quality format, ready for printing or digital sharing.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCertificateGenerator;
