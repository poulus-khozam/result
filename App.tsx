import React, { useEffect, useState, useMemo } from 'react';
import { Spinner } from './components/Spinner';
import { ResultCard } from './components/ResultCard';
import { fetchAndParseCSV } from './utils/csvParser';
import { Student, AppState } from './types';
import { User, Calendar, Phone, Search, AlertCircle, CheckCircle, X } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOADING);
  const [students, setStudents] = useState<Student[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Notification State
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Search State
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedStudentName, setSelectedStudentName] = useState<string>('');
  const [birthDateInput, setBirthDateInput] = useState<string>('');
  const [mobileInput, setMobileInput] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  const [foundStudent, setFoundStudent] = useState<Student | null>(null);

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchAndParseCSV('/result.csv');
        setStudents(data);
        setAppState(AppState.SEARCH);
        setNotification({ type: 'success', message: 'تم تحميل قاعدة البيانات بنجاح' });
        // Auto dismiss success message after 3 seconds
        setTimeout(() => {
          setNotification(prev => prev?.type === 'success' ? null : prev);
        }, 3000);
      } catch (err) {
        console.error(err);
        setErrorMsg('تعذر تحميل ملف البيانات. يرجى التأكد من وجود ملف result.csv');
        setAppState(AppState.ERROR);
        setNotification({ type: 'error', message: 'فشل تحميل ملف البيانات' });
      }
    };
    loadData();
  }, []);

  // Derived Lists
  const classes = useMemo(() => {
    const uniqueClasses = new Set(students.map(s => s.className).filter(Boolean));
    return Array.from(uniqueClasses).sort();
  }, [students]);

  const studentsInClass = useMemo(() => {
    if (!selectedClass) return [];
    return students.filter(s => s.className === selectedClass);
  }, [selectedClass, students]);

  // Handlers
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
    setSelectedStudentName('');
    setBirthDateInput('');
    setMobileInput('');
    setValidationError('');
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStudentName(e.target.value);
    setBirthDateInput('');
    setMobileInput('');
    setValidationError('');
  };

  const handleViewResult = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const targetStudent = studentsInClass.find(s => s.name === selectedStudentName);

    if (!targetStudent) {
      setValidationError('حدث خطأ غير متوقع. لم يتم العثور على الطالب.');
      return;
    }

    // Validation Logic
    // 1. Birth Date Match
    // Note: Assuming format YYYY-MM-DD from parser and input
    const isDateMatch = targetStudent.birthDate === birthDateInput;

    // 2. Mobile Match (Partial or Full)
    // Remove whitespace
    const cleanInputMobile = mobileInput.replace(/\s/g, '');
    const cleanStoredMobile = String(targetStudent.mobile1).replace(/\s/g, '');
    
    // Check if input is at least 6 digits to avoid false positives with very short matches
    const isMobileMatch = cleanInputMobile.length >= 6 && cleanStoredMobile.includes(cleanInputMobile);

    if (isDateMatch && isMobileMatch) {
      setFoundStudent(targetStudent);
      setAppState(AppState.RESULT);
    } else {
      setValidationError('البيانات المدخلة غير صحيحة. يرجى التأكد من تاريخ الميلاد ورقم الموبايل المسجل.');
    }
  };

  const handleBack = () => {
    setFoundStudent(null);
    setAppState(AppState.SEARCH);
    // Optional: Reset sensitive inputs
    setBirthDateInput('');
    setMobileInput('');
    setValidationError('');
  };

  const closeNotification = () => setNotification(null);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 relative">
      
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-6 right-1/2 translate-x-1/2 md:translate-x-0 md:right-6 md:left-auto z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 transform ${
          notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <span className="font-bold text-lg whitespace-nowrap">{notification.message}</span>
          <button onClick={closeNotification} className="mr-4 hover:bg-white/20 rounded-full p-1 transition">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">بوابة النتائج</h1>
        <p className="text-gray-500 text-lg">استعرض نتائجك الدراسية بسهولة وأمان</p>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-2xl">
        
        {appState === AppState.LOADING && <Spinner />}

        {appState === AppState.ERROR && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
             <AlertCircle size={24} />
             <p>{errorMsg}</p>
          </div>
        )}

        {appState === AppState.SEARCH && (
          <form onSubmit={handleViewResult} className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 space-y-6">
            
            {/* Class Selection */}
            <div className="space-y-2">
              <label className="text-gray-700 font-bold block flex items-center gap-2">
                <Search size={18} className="text-primary-500" />
                اختر المرحلة الدراسية
              </label>
              <select
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                value={selectedClass}
                onChange={handleClassChange}
                required
              >
                <option value="">-- اختر المرحلة --</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Student Selection (Conditional) */}
            <div className={`space-y-2 transition-opacity duration-300 ${selectedClass ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <label className="text-gray-700 font-bold block flex items-center gap-2">
                <User size={18} className="text-primary-500" />
                اسم الطالب
              </label>
              <select
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                value={selectedStudentName}
                onChange={handleStudentChange}
                disabled={!selectedClass}
                required
              >
                <option value="">-- اختر الطالب --</option>
                {studentsInClass.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            {/* Validation Inputs (Conditional) */}
            {selectedStudentName && (
              <div className="pt-6 border-t border-gray-100 space-y-6 animate-fade-in">
                <h3 className="text-lg font-bold text-gray-900">التحقق من الهوية</h3>
                
                <div className="space-y-2">
                  <label className="text-gray-700 font-medium block flex items-center gap-2">
                    <Calendar size={18} className="text-gray-400" />
                    تاريخ الميلاد
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={birthDateInput}
                    onChange={(e) => setBirthDateInput(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-700 font-medium block flex items-center gap-2">
                    <Phone size={18} className="text-gray-400" />
                    رقم الموبايل
                  </label>
                  <input
                    type="tel"
                    placeholder="ادخل رقم الموبايل المسجل"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 outline-none text-right"
                    dir="ltr"
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-400">يكفي ادخال جزء من الرقم للتطابق</p>
                </div>

                {validationError && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                    <AlertCircle size={16} className="mt-1 flex-shrink-0" />
                    {validationError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition duration-200"
                >
                  عرض النتيجة
                </button>
              </div>
            )}
          </form>
        )}

        {appState === AppState.RESULT && foundStudent && (
          <ResultCard student={foundStudent} onBack={handleBack} />
        )}
      </main>
      
      <footer className="mt-12 text-gray-400 text-sm text-center">
        &copy; {new Date().getFullYear()} بوابة نتائج الطلاب. جميع الحقوق محفوظة.
      </footer>
    </div>
  );
};

export default App;