import * as XLSX from 'xlsx';
import { Student } from '../types';

export const normalizeKey = (key: string): string => {
  // Remove BOM (Byte Order Mark) \uFEFF and trim whitespace
  const k = key.replace(/[\uFEFF]/g, '').trim();
  
  if (k === 'الاسم' || k === 'name') return 'name';
  if (k === 'المرحله' || k === 'المرحلة' || k === 'className') return 'className';
  if (k === 'تاريخ الميلاد' || k === 'br-date') return 'birthDate';
  if (k === 'رقم الموبايل' || k === 'mobile1') return 'mobile1';
  if (k === 'الدرجة 1' || k === 'Score 1') return 'score1';
  if (k === 'الدرجة 2' || k === 'Score 2') return 'score2';
  
  return k;
};

// Helper to standardise date format to YYYY-MM-DD
const parseDate = (value: any): string => {
  if (!value) return '';
  
  // If Excel serial date
  if (typeof value === 'number') {
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
  }
  
  // If string, try to normalize
  const str = String(value).trim();
  // Assume simple format or standard ISO
  return str;
};

export const fetchAndParseCSV = async (url: string): Promise<Student[]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    
    // Read the workbook. 
    // codepage: 65001 forces UTF-8 which helps with Arabic CSVs in some environments
    const workbook = XLSX.read(arrayBuffer, { type: 'array', codepage: 65001 });
    
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Parse to JSON with raw values first
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length > 0) {
      console.log("Raw CSV Keys:", Object.keys(jsonData[0] as object));
    }

    // Map keys
    const students: Student[] = jsonData.map((row: any) => {
      const student: any = {};
      Object.keys(row).forEach((key) => {
        const normalizedKey = normalizeKey(key);
        let value = row[key];

        if (normalizedKey === 'birthDate') {
            value = parseDate(value);
        }
        if (normalizedKey === 'mobile1') {
            value = String(value).trim();
        }

        student[normalizedKey] = value;
      });
      return student;
    });

    console.log("Parsed Students:", students.slice(0, 2)); // Log first 2 for debugging
    return students;
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw error;
  }
};
