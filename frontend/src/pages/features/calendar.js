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
      
      // Convert to FullCalendar events format (single color for all entries)
      const calendarEvents = Object.entries(data).map(([date, entry]) => ({
        id: entry.id,
        title: entry.skin_condition || 'Entry',
        date: date,
        backgroundColor: '#B8C6E6',
        borderColor: '#A8B5D5',
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
        console.log('Analysis result in fetched data:', data.analysis_result);
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

  return (
    <>
      <Head>
        <title>Skin Care Tracker - Dashboard</title>
      </Head>

      <div className="min-h-screen" style={{ background: '#fef2f9' }}>
        {/* Header - Match products page style */}
        <header
          className="sticky top-0 z-10 border-b"
          style={{
            background: 'rgba(255,255,255,0.9)',
            borderColor: '#E8D4DC',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => router.push('/home')}
              className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
              style={{
                background: '#F5E6DC',
                border: '2px solid #D4A5B8',
                color: '#8B4367',
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold" style={{ color: '#8B4367' }}>Skin Care Tracker</h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Debug Info
          <div className="bg-yellow-100 border border-yellow-400 rounded p-4 mb-4">
            <p className="text-sm font-mono">
              showEntryModal: {showEntryModal ? 'TRUE' : 'FALSE'} | 
              selectedDate: {selectedDate || 'null'} | 
              selectedEntry: {selectedEntry ? 'exists' : 'null'}
            </p>
          </div> */}

          {/* Quick Stats */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="rounded-xl p-6"
              style={{
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid #E8D4DC',
                boxShadow: '0 2px 12px rgba(212,165,184,0.12)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm mb-1" style={{ color: '#A67B8B' }}>Total Entries</div>
                  <div className="text-3xl font-bold" style={{ color: '#8B4367' }}>
                    {Object.keys(calendarData).length}
                  </div>
                </div>
                <div className="rounded-full p-3" style={{ background: '#F0E4E8' }}>
                  <svg className="w-8 h-8" style={{ color: '#8B6B7B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div
              className="rounded-xl p-6"
              style={{
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid #E8D4DC',
                boxShadow: '0 2px 12px rgba(212,165,184,0.12)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm mb-1" style={{ color: '#A67B8B' }}>This Month</div>
                  <div className="text-3xl font-bold" style={{ color: '#8B4367' }}>
                    {Object.keys(calendarData).filter(date => {
                      const entryDate = new Date(date);
                      const now = new Date();
                      return entryDate.getMonth() === now.getMonth() &&
                             entryDate.getFullYear() === now.getFullYear();
                    }).length}
                  </div>
                </div>
                <div className="rounded-full p-3" style={{ background: '#D4E8D4' }}>
                  <svg className="w-8 h-8" style={{ color: '#5A8B5A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div
              className="rounded-xl p-6"
              style={{
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid #E8D4DC',
                boxShadow: '0 2px 12px rgba(212,165,184,0.12)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm mb-1" style={{ color: '#A67B8B' }}>Current Streak</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold" style={{ color: '#8B4367' }}>
                      {(() => {
                        // Calculate streak: consecutive days with entries
                        // Like Duolingo - if you did it yesterday, streak continues until end of today
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const todayStr = today.toISOString().split('T')[0];
                        
                        // Start from yesterday if no entry today, otherwise start from today
                        let currentDate = new Date(today);
                        if (!calendarData[todayStr]) {
                          currentDate.setDate(currentDate.getDate() - 1);
                        }
                        
                        let streak = 0;
                        
                        // Check each day backwards
                        while (true) {
                          const dateStr = currentDate.toISOString().split('T')[0];
                          if (calendarData[dateStr]) {
                            streak++;
                            currentDate.setDate(currentDate.getDate() - 1);
                          } else {
                            break;
                          }
                        }
                        
                        return streak;
                      })()}
                    </div>
                    <div className="text-sm" style={{ color: '#A67B8B' }}>days</div>
                  </div>
                </div>
                <div className="rounded-full p-3" style={{ background: '#FFE8D4' }}>
                  <svg className="w-8 h-8" style={{ color: '#D97F3E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Calendar */}
          <div
            className="rounded-2xl p-6 mt-6 mb-6"
            style={{
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid #E8D4DC',
              boxShadow: '0 2px 12px rgba(212,165,184,0.15)',
            }}
          >
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
                right: ''
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
          color: #8B4367 !important;
        }
        .fc-button {
          background: linear-gradient(135deg, #D4A5B8 0%, #C495A8 100%) !important;
          border-color: #D4A5B8 !important;
          text-transform: capitalize !important;
          color: white !important;
        }
        .fc-button:hover {
          background: linear-gradient(135deg, #C495A8 0%, #B48598 100%) !important;
          border-color: #C495A8 !important;
        }
        .fc-button-active {
          background: linear-gradient(135deg, #B48598 0%, #A47588 100%) !important;
          border-color: #B48598 !important;
        }
        .fc-day-today {
          background-color: #F5F0F2 !important;
        }
        .fc-event {
          cursor: pointer;
          border-radius: 8px;
          padding: 2px 4px;
          font-size: 0.875rem;
        }
        .fc-daygrid-day-number {
          color: #8B4367;
          font-weight: 500;
          padding: 4px;
        }
        .fc-daygrid-day {
          cursor: pointer !important;
        }
        .fc-daygrid-day:hover {
          background-color: #FDF8FA;
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
    console.log('Entry prop changed:', entry);
    if (entry) {
      console.log('Entry has analysis_result:', entry.analysis_result);
      setLocalEntry(entry);
      setNotes(entry.notes || '');
      setSkinCondition(entry.skin_condition || '');
      
      // Always update products from the entry data
      // When the entry is refetched from the backend, we should display the saved products
      setProducts(entry.products || []);
      
      // If entry exists and has data, start in view mode
      setIsEditMode(!entry.id);
    } else {
      console.log('No entry - starting in edit mode');
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
        
        // Update local state immediately
        const updatedEntry = { ...localEntry, analysis_result: data.result };
        setLocalEntry(updatedEntry);
        onUpdateEntry(updatedEntry);
        
        // Immediately save the analysis result to backend
        await saveAnalysisToBackend(data.result, token);
        
        setAnalysisStatus('success');
        // Clear status after 3 seconds
        setTimeout(() => setAnalysisStatus(''), 3000);
      } else {
        const errorText = await response.text();
        console.error("AI analysis failed:", errorText);
        setAnalysisStatus('error');
        setTimeout(() => setAnalysisStatus(''), 3000);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error("AI analysis timeout");
        setAnalysisStatus('timeout');
      } else {
        console.error("Error sending to AI:", err);
        setAnalysisStatus('error');
      }
      setTimeout(() => setAnalysisStatus(''), 3000);
    } finally {
      setIsLoading(false);
      console.log("AI analysis complete, loading set to false");
    }
  };

  const saveAnalysisToBackend = async (analysisResult, token) => {
    try {
      console.log("Saving analysis result to backend...");
      
      // First check if entry exists
      let entryId = localEntry?.id;
      
      if (!entryId || typeof entryId !== 'number') {
        // Try to fetch existing entry
        try {
          const checkResponse = await fetch(`http://localhost:8000/skincare/entries/${dateStr}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (checkResponse.ok) {
            const existingEntry = await checkResponse.json();
            entryId = existingEntry.id;
          }
        } catch (err) {
          // Entry doesn't exist yet
        }
      }
      
      const payload = {
        date: dateStr,
        notes: notes || '',
        skin_condition: skinCondition || null,
        products: products || [],
        analysis_result: analysisResult,
      };
      
      let response;
      
      if (entryId && typeof entryId === 'number') {
        // Update existing entry
        response = await fetch(`http://localhost:8000/skincare/entries/${entryId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new entry
        response = await fetch('http://localhost:8000/skincare/entries', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }
      
      if (response.ok) {
        const savedEntry = await response.json();
        console.log("Analysis saved successfully:", savedEntry);
        // Update local entry with the saved entry data (including ID if it was newly created)
        setLocalEntry(savedEntry);
        onUpdateEntry(savedEntry);
      } else {
        console.error("Failed to save analysis:", response.status);
      }
    } catch (error) {
      console.error("Error saving analysis to backend:", error);
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
      // Include analysis_result in the payload to be saved
      const payload = {
        date: dateStr,
        notes,
        skin_condition: skinCondition,
        products,
        analysis_result: localEntry?.analysis_result || null,
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
          // Entry doesn't exist yet, will create below
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

      // Success - refetch the entry to get updated data with products and analysis
      setIsLoading(false);
      
      // Fetch the updated entry to get all data including products and analysis_result
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
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999, background: 'rgba(139,67,103,0.15)' }}>
      <div
        className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          zIndex: 10000,
          background: '#fefcfe',
          border: '1px solid #E8D4DC',
          boxShadow: '0 8px 32px rgba(212,165,184,0.2)',
        }}
      >
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold" style={{ color: '#8B4367' }}>{formattedDate}</h2>
              {localEntry?.id && !isEditMode && (
                <span
                  className="px-3 py-1 text-sm font-medium rounded-full"
                  style={{ background: '#F0E4E8', color: '#8B6B7B' }}
                >
                  Saved Entry
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {localEntry?.id && !isEditMode && (
                <>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: '#8B4367' }}
                    title="Edit entry"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: '#8B4A4A' }}
                    title="Delete entry"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </>
              )}
              <button onClick={onClose} style={{ color: '#8B4367' }}>
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
                <label className="block text-sm font-medium mb-2" style={{ color: '#8B4367' }}>
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
                      className="px-8 py-3 text-white rounded-full font-medium shadow-lg"
                      style={{ background: 'linear-gradient(135deg, #D4A5B8 0%, #C495A8 100%)' }}
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
                      className="px-4 py-2 text-white rounded-xl disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #D4A5B8 0%, #C495A8 100%)' }}
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
                        <div className="rounded-lg p-4" style={{ background: '#F5F0F2', border: '1px solid #E8D4DC' }}>
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: '#D4A5B8' }}></div>
                            <p className="text-sm" style={{ color: '#8B4367' }}>
                              Analyzing your skin with AI... This may take up to 60 seconds.
                            </p>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handleTakePhoto}
                        disabled={isLoading}
                        className="px-4 py-2 text-white rounded-xl disabled:opacity-50 w-full"
                        style={{ background: 'linear-gradient(135deg, #D4A5B8 0%, #C495A8 100%)' }}
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#8B4367' }}>
                Skin Condition
              </label>
              {isEditMode ? (
                <select
                  value={skinCondition}
                  onChange={(e) => setSkinCondition(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl"
                  style={{ border: '1px solid #E8D4DC' }}
                >
                  <option value="">Select condition...</option>
                  {skinConditions.map((condition) => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              ) : (
                <div className="px-4 py-2 rounded-xl" style={{ background: '#F5F0F2' }}>
                  <p style={{ color: '#8B4367' }}>{skinCondition || 'Not specified'}</p>
                </div>
              )}
            </div>

            {/* Products */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#8B4367' }}>
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
                      className="flex-1 px-4 py-2 rounded-xl"
                      style={{ border: '1px solid #E8D4DC' }}
                    />
                    <button
                      onClick={handleAddProduct}
                      className="px-4 py-2 text-white rounded-xl"
                      style={{ background: 'linear-gradient(135deg, #D4A5B8 0%, #C495A8 100%)' }}
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {products.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#F5F0F2' }}>
                        <span style={{ color: '#8B4367' }}>{product.product_name}</span>
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
                <div className="px-4 py-3 rounded-xl" style={{ background: '#F5F0F2' }}>
                  {products && products.length > 0 ? (
                    <p style={{ color: '#8B4367' }}>
                      {products.map(p => p.product_name).join(', ')}
                    </p>
                  ) : (
                    <p className="text-sm" style={{ color: '#A67B8B' }}>No products recorded</p>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#8B4367' }}>
                Notes
              </label>
              {isEditMode ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 rounded-xl"
                  style={{ border: '1px solid #E8D4DC' }}
                  placeholder="How is your skin feeling today? Any changes or concerns?"
                />
              ) : (
                <div className="px-4 py-3 rounded-xl min-h-[100px]" style={{ background: '#F5F0F2' }}>
                  <p className="whitespace-pre-wrap" style={{ color: '#8B4367' }}>{notes || 'No notes added'}</p>
                </div>
              )}
            </div>

            {/* AI Analysis Result - Always show if available */}
            {localEntry?.analysis_result && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#8B4367' }}>
                  🤖 AI Analysis
                </label>
                <div className="p-4 rounded-xl" style={{ background: '#F0E4E8' }}>
                  <p className="whitespace-pre-wrap" style={{ color: '#8B4367' }}>{localEntry.analysis_result}</p>
                </div>
              </div>
            )}
            
            {/* Analysis Status Messages */}
            {analysisStatus === 'success' && (
              <div className="rounded-xl p-3" style={{ background: '#E8F4E8', border: '1px solid #C8E0C8' }}>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: '#5A8B5A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm font-medium" style={{ color: '#5A8B5A' }}>AI analysis complete! The analysis will be saved with your entry.</p>
                </div>
              </div>
            )}
            {analysisStatus === 'error' && (
              <div className="rounded-xl p-3" style={{ background: '#F4E8E8', border: '1px solid #E0C8C8' }}>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: '#8B5A5A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-sm font-medium" style={{ color: '#8B5A5A' }}>AI analysis failed. You can still save your entry.</p>
                </div>
              </div>
            )}
            {analysisStatus === 'timeout' && (
              <div className="rounded-xl p-3" style={{ background: '#F4F0E8', border: '1px solid #E0DCC8' }}>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: '#8B7B5A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium" style={{ color: '#8B7B5A' }}>AI analysis timed out. You can still save your entry.</p>
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
                  className="flex-1 px-4 py-2 rounded-xl"
                  style={{ border: '1px solid #E8D4DC', color: '#8B4367' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-white rounded-xl disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #D4A5B8 0%, #C495A8 100%)' }}
                >
                  {isLoading ? 'Saving...' : 'Save Entry'}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-white rounded-xl"
                style={{ background: 'linear-gradient(135deg, #D4A5B8 0%, #C495A8 100%)' }}
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