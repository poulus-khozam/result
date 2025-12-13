import React from 'react';
import { Student } from '../types';

interface ResultCardProps {
  student: Student;
  onBack: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ student, onBack }) => {
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">{student.name}</h2>
          <p className="text-indigo-100 text-lg">{student.className}</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center">
              <span className="text-gray-500 text-sm mb-1">الدرجة الأولى</span>
              <span className="text-4xl font-bold text-primary-600">{student.score1}</span>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center">
              <span className="text-gray-500 text-sm mb-1">الدرجة الثانية</span>
              <span className="text-4xl font-bold text-indigo-600">{student.score2}</span>
            </div>
          </div>

          <div className="space-y-4 text-center">
             <div className="inline-block px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
               تم التحقق من البيانات بنجاح
             </div>
          </div>
          
          <button
            onClick={onBack}
            className="w-full mt-8 bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-xl transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            بحث عن طالب آخر
          </button>
        </div>
      </div>
    </div>
  );
};
