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
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`http://localhost:8000/skincare/entries/${dateStr}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedEntry(data);
      } else {
        setSelectedEntry(null);
      }
      setShowEntryModal(true);
    } catch (error) {
      console.error('Error fetching entry:', error);
      setSelectedEntry(null);
      setShowEntryModal(true);
    }
  };

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    fetchEntryByDate(arg.dateStr);
  };

  const handleEventClick = (info) => {
    setSelectedDate(info.event.startStr);
    fetchEntryByDate(info.event.startStr);
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
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
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
        .fc-daygrid-day:hover {
          background-color: #F9FAFB;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}

// Entry Modal Component (same as before)
function EntryModal({ dateStr, entry, onClose, onSave }) {
  const [notes, setNotes] = useState(entry?.notes || '');
  const [skinCondition, setSkinCondition] = useState(entry?.skin_condition || '');
  const [products, setProducts] = useState(entry?.products || []);
  const [newProduct, setNewProduct] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const skinConditions = ['Clear', 'Oily', 'Dry', 'Combination', 'Acne', 'Sensitive', 'Normal'];

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const handleAddProduct = () => {
    if (newProduct.trim()) {
      setProducts([...products, { product_name: newProduct, product_type: null, time_of_day: null }]);
      setNewProduct('');
    }
  };

  const handleRemoveProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
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

      let response;
      if (entry) {
        response = await fetch(`http://localhost:8000/skincare/entries/${entry.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
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
        
        if (selectedFile) {
          const formData = new FormData();
          formData.append('file', selectedFile);
          
          await fetch(`http://localhost:8000/skincare/entries/${savedEntry.id}/upload-image`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });
        }
        
        onSave();
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{formattedDate}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📷 Upload Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              {(previewUrl || entry?.image_path) && (
                <img
                  src={previewUrl || `http://localhost:8000/${entry.image_path}`}
                  alt="Preview"
                  className="mt-3 rounded-lg max-h-64 w-full object-cover"
                />
              )}
            </div>

            {/* Skin Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skin Condition
              </label>
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
            </div>

            {/* Products */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Products Used
              </label>
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
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="How is your skin feeling today? Any changes or concerns?"
              />
            </div>

            {entry?.analysis_result && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🤖 AI Analysis
                </label>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="text-gray-900">{entry.analysis_result}</p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
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
          </div>
        </div>
      </div>
    </div>
  );
}