import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Dashboard() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [calendarData, setCalendarData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch('http://localhost:8000/skincare/calendar/entries', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setCalendarData(data);
      
      // Convert to FullCalendar events format
      const calendarEvents = Object.entries(data).map(([date, entry]) => ({
        id: entry.id,
        title: `${entry.skin_condition || 'Entry'} ${entry.has_image ? '📷' : ''}`,
        date: date,
        backgroundColor: entry.has_image ? '#4F46E5' : '#818CF8',
        borderColor: entry.has_image ? '#4338CA' : '#6366F1',
        extendedProps: {
          ...entry
        }
      }));
      
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const fetchEntryByDate = async (dateStr) => {
    console.log('Fetching entry for date:', dateStr);
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`http://localhost:8000/skincare/entries/${dateStr}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Entry found:', data);
        setSelectedEntry(data);
      } else {
        console.log('No entry found for this date');
        setSelectedEntry(null);
      }
    } catch (error) {
      console.error('Error fetching entry:', error);
      setSelectedEntry(null);
    }
  };

  const handleDateClick = (arg) => {
    console.log('Date clicked:', arg.dateStr);
    setSelectedDate(arg.dateStr);
    setShowEntryModal(true); // Show modal immediately
    fetchEntryByDate(arg.dateStr); // Then fetch data in background
  };

  const handleEventClick = (info) => {
    console.log('Event clicked:', info.event.startStr);
    setSelectedDate(info.event.startStr);
    setShowEntryModal(true); // Show modal immediately
    fetchEntryByDate(info.event.startStr); // Then fetch data
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>Skin Care Tracker - Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Skin Care Tracker</h1>
            <div className="flex gap-4 items-center">
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Debug Info
          <div className="bg-yellow-100 border border-yellow-400 rounded p-4 mb-4">
            <p className="text-sm font-mono">
              showEntryModal: {showEntryModal ? 'TRUE' : 'FALSE'} | 
              selectedDate: {selectedDate || 'null'} | 
              selectedEntry: {selectedEntry ? 'exists' : 'null'}
            </p>
          </div> */}
          
          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              selectable={true}
              selectMirror={true}
              editable={false}
              navLinks={false}
              height="auto"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth'
              }}
              eventDisplay="block"
              dayMaxEvents={true}
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Entries</div>
                  <div className="text-3xl font-bold text-indigo-600">
                    {Object.keys(calendarData).length}
                  </div>
                </div>
                <div className="bg-indigo-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">This Month</div>
                  <div className="text-3xl font-bold text-indigo-600">
                    {Object.keys(calendarData).filter(date => {
                      const entryDate = new Date(date);
                      const now = new Date();
                      return entryDate.getMonth() === now.getMonth() &&
                             entryDate.getFullYear() === now.getFullYear();
                    }).length}
                  </div>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">With Photos</div>
                  <div className="text-3xl font-bold text-indigo-600">
                    {Object.values(calendarData).filter(entry => entry.has_image).length}
                  </div>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                <span className="text-sm text-gray-600">Entry with photo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-400 rounded"></div>
                <span className="text-sm text-gray-600">Entry without photo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Entry Modal */}
        {showEntryModal && (
          <EntryModal
            dateStr={selectedDate}
            entry={selectedEntry}
            onClose={() => {
              setShowEntryModal(false);
              setSelectedDate(null);
              setSelectedEntry(null);
            }}
            onSave={() => {
              fetchCalendarData();
              setShowEntryModal(false);
              setSelectedDate(null);
              setSelectedEntry(null);
            }}
            onUpdateEntry={setSelectedEntry}
          />
        )}
      </div>

      <style jsx global>{`
        .fc {
          font-family: inherit;
        }
        .fc-toolbar-title {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          color: #111827;
        }
        .fc-button {
          background-color: #4F46E5 !important;
          border-color: #4F46E5 !important;
          text-transform: capitalize !important;
        }
        .fc-button:hover {
          background-color: #4338CA !important;
          border-color: #4338CA !important;
        }
        .fc-button-active {
          background-color: #3730A3 !important;
          border-color: #3730A3 !important;
        }
        .fc-day-today {
          background-color: #EEF2FF !important;
        }
        .fc-event {
          cursor: pointer;
          border-radius: 4px;
          padding: 2px 4px;
          font-size: 0.875rem;
        }
        .fc-daygrid-day-number {
          color: #374151;
          font-weight: 500;
          padding: 4px;
        }
        .fc-daygrid-day {
          cursor: pointer !important;
        }
        .fc-daygrid-day:hover {
          background-color: #F9FAFB;
          cursor: pointer;
        }
        .fc-daygrid-day-frame {
          cursor: pointer !important;
          pointer-events: auto !important;
        }
      `}</style>
    </>
  );
}

// Entry Modal Component
function EntryModal({ dateStr, entry, onClose, onSave, onUpdateEntry }) {
  const [localEntry, setLocalEntry] = useState(entry);
  const [notes, setNotes] = useState('');
  const [skinCondition, setSkinCondition] = useState('');
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Track if we're in edit mode
  const [selectedFile, setSelectedFile] = useState(null); // For AI analysis (not saved)
  const [previewUrl, setPreviewUrl] = useState(null); // For preview (not saved)
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState(''); // For showing status messages

  const skinConditions = ['Clear', 'Oily', 'Dry', 'Combination', 'Acne', 'Sensitive', 'Normal'];

  // Sync state when entry data loads or changes
  useEffect(() => {
    if (entry) {
      setLocalEntry(entry);
      setNotes(entry.notes || '');
      setSkinCondition(entry.skin_condition || '');
      
      // Always update products from the entry data
      // When the entry is refetched from the backend, we should display the saved products
      setProducts(entry.products || []);
      
      // If entry exists and has data, start in view mode
      setIsEditMode(!entry.id);
    } else {
      // New entry - start in edit mode
      setIsEditMode(true);
    }
  }, [entry]);

  // Update local entry when it changes
  useEffect(() => {
    setLocalEntry(entry);
  }, [entry]);

  // Cleanup preview URL when file changes
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const handleTakePhoto = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera not supported");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 } 
      });
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera");
    }
  };

  const capturePhoto = () => {
    if (!stream) return;

    const video = document.getElementById('camera-preview');
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Stop camera stream
    stream.getTracks().forEach(track => track.stop());
    setStream(null);
    setShowCamera(false);

    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Immediately send to backend for analysis
      await sendToAIAnalysis(file);
    }, "image/jpeg", 0.9);
  };

  const cancelCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  useEffect(() => {
    // Cleanup camera stream when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    // Attach stream to video element when camera is shown
    if (showCamera && stream) {
      const video = document.getElementById('camera-preview');
      if (video) {
        video.srcObject = stream;
        video.play();
      }
    }
  }, [showCamera, stream]);

  const sendToAIAnalysis = async (file) => {
    setIsLoading(true);
    const token = localStorage.getItem("access_token");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("date", dateStr);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      console.log("Sending image to AI analysis...");
      
      const response = await fetch(
        `http://localhost:8000/skincare/entries/ai-analysis`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log("AI analysis result:", data);
        // Update both local and parent entry state
        const updatedEntry = { ...localEntry, analysis_result: data.result };
        setLocalEntry(updatedEntry);
        onUpdateEntry(updatedEntry);
        setAnalysisStatus('success');
        // Clear status after 3 seconds
        setTimeout(() => setAnalysisStatus(''), 3000);
      } else {
        const errorText = await response.text();
        console.error("AI analysis failed:", errorText);
        // Don't show alert - user can still save their entry
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error("AI analysis timeout");
        // Don't show alert - user can still save their entry
      } else {
        console.error("Error sending to AI:", err);
        // Don't show alert - user can still save their entry
      }
    } finally {
      setIsLoading(false);
      console.log("AI analysis complete, loading set to false");
    }
  };

  const handleAddProduct = () => {
    console.log('handleAddProduct called');
    console.log('newProduct value:', newProduct);
    console.log('Current products state BEFORE adding:', products);
    
    if (newProduct.trim()) {
      const productToAdd = { product_name: newProduct.trim(), product_type: null, time_of_day: null };
      const updatedProducts = [...products, productToAdd];
      console.log('Product to add:', productToAdd);
      console.log('Updated products array:', updatedProducts);
      setProducts(updatedProducts);
      setNewProduct('');
    } else {
      console.log('Cannot add empty product');
    }
  };

  const handleRemoveProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    if (!localEntry?.id) return;
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this entry from ${formattedDate}? This action cannot be undone.`
    );
    
    if (!confirmDelete) return;
    
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`http://localhost:8000/skincare/entries/${localEntry.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        console.log('Entry deleted successfully');
        // Close modal and refresh calendar
        onSave(); // This will refresh the calendar data
      } else {
        throw new Error(`Delete failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert(`❌ Failed to delete entry: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    
    try {
      const payload = {
        date: dateStr,
        notes,
        skin_condition: skinCondition,
        products,
      };

      let savedEntryId = localEntry?.id;
      
      // If we don't have an entry ID, try to fetch the entry first
      // (AI analysis might have created it)
      if (!savedEntryId || typeof savedEntryId !== 'number') {
        try {
          const checkResponse = await fetch(`http://localhost:8000/skincare/entries/${dateStr}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (checkResponse.ok) {
            const existingEntry = await checkResponse.json();
            savedEntryId = existingEntry.id;
          }
        } catch (err) {
        }
      }
      
      let response;
      
      // Update if we have an ID, create if we don't
      if (savedEntryId && typeof savedEntryId === 'number') {
        response = await fetch(`http://localhost:8000/skincare/entries/${savedEntryId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          throw new Error(`Update failed: ${response.status}`);
        }
      } else {
        response = await fetch('http://localhost:8000/skincare/entries', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Create failed: ${response.status} - ${errorData.detail || 'Unknown error'}`);
        }
        
        const savedEntry = await response.json();
        savedEntryId = savedEntry.id;
      }

      // Upload image if we have one - REMOVED: We don't want to save images anymore
      
      // Success - refetch the entry to get updated data with products
      setIsLoading(false);
      
      // Fetch the updated entry to get all data including products
      if (savedEntryId) {
        try {
          const refetchResponse = await fetch(`http://localhost:8000/skincare/entries/${dateStr}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (refetchResponse.ok) {
            const updatedEntry = await refetchResponse.json();
            setLocalEntry(updatedEntry);
            onUpdateEntry(updatedEntry);
          }
        } catch (err) {
          console.error('Error refetching entry:', err);
        }
      }
      
      // Refresh the calendar data
      onSave();
      
      // If this was a new entry, close the modal
      // If editing existing entry, stay open in view mode
      if (!localEntry?.id) {
        // Was a new entry - modal will close via onSave callback
      } else {
        // Was editing - switch back to view mode
        setIsEditMode(false);
      }
      
    } catch (error) {
      console.error('Error saving entry:', error);
      setIsLoading(false);
      alert(`❌ Failed to save entry: ${error.message}`);
    }
  };

  const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ zIndex: 10000 }}>
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{formattedDate}</h2>
              {localEntry?.id && !isEditMode && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                  Saved Entry
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {localEntry?.id && !isEditMode && (
                <>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit entry"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete entry"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Camera Preview or Photo Section - Only in edit mode */}
            {isEditMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📷 Take Photo for AI Analysis
                </label>
              
              {showCamera ? (
                <div className="relative bg-black rounded-lg overflow-hidden">
                  {/* Video Preview */}
                  <video
                    id="camera-preview"
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-auto"
                  />
                  
                  {/* Face Guide Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative">
                      {/* Oval face guide */}
                      <div 
                        className="border-4 border-white border-opacity-60 rounded-full"
                        style={{ 
                          width: '280px', 
                          height: '360px',
                          boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)'
                        }}
                      />
                      <p className="text-white text-center mt-4 text-sm font-medium bg-black bg-opacity-50 px-4 py-2 rounded">
                        Position your face in the oval
                      </p>
                    </div>
                  </div>
                  
                  {/* Camera Controls */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                    <button
                      onClick={cancelCamera}
                      className="px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={capturePhoto}
                      className="px-8 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 font-medium shadow-lg"
                    >
                      📸 Capture
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {!previewUrl && (
                    <button
                      onClick={handleTakePhoto}
                      disabled={isLoading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Processing...' : 'Take Photo'}
                    </button>
                  )}
                  {previewUrl && (
                    <div className="space-y-2">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="rounded-lg max-h-64 w-full object-cover"
                      />
                      {isLoading && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                            <p className="text-sm text-indigo-900">
                              Analyzing your skin with AI... This may take up to 60 seconds.
                            </p>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handleTakePhoto}
                        disabled={isLoading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 w-full"
                      >
                        {isLoading ? 'Processing...' : 'Retake Photo'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            )}


            {/* Skin Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skin Condition
              </label>
              {isEditMode ? (
                <select
                  value={skinCondition}
                  onChange={(e) => setSkinCondition(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select condition...</option>
                  {skinConditions.map((condition) => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              ) : (
                <div className="px-4 py-2 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{skinCondition || 'Not specified'}</p>
                </div>
              )}
            </div>

            {/* Products */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Products Used
              </label>
              {isEditMode ? (
                <>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newProduct}
                      onChange={(e) => setNewProduct(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddProduct()}
                      placeholder="Add product..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleAddProduct}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {products.map((product, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-900">{product.product_name}</span>
                        <button
                          onClick={() => handleRemoveProduct(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg">
                  {products && products.length > 0 ? (
                    <p className="text-gray-900">
                      {products.map(p => p.product_name).join(', ')}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">No products recorded</p>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              {isEditMode ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="How is your skin feeling today? Any changes or concerns?"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg min-h-[100px]">
                  <p className="text-gray-900 whitespace-pre-wrap">{notes || 'No notes added'}</p>
                </div>
              )}
            </div>

            {localEntry?.analysis_result && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🤖 AI Analysis
                </label>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-gray-900">{localEntry.analysis_result}</p>
                </div>
              </div>
            )}
            
            {/* Analysis Status Messages */}
            {analysisStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-800 font-medium">AI analysis complete!</p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 mt-6">
            {isEditMode ? (
              <>
                <button
                  onClick={() => {
                    if (localEntry?.id) {
                      // Cancel edit - revert to view mode
                      setIsEditMode(false);
                      setNotes(localEntry.notes || '');
                      setSkinCondition(localEntry.skin_condition || '');
                      setProducts(localEntry.products || []);
                    } else {
                      // Cancel new entry - close modal
                      onClose();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Entry'}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}