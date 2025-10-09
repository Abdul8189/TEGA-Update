import xlsx from 'xlsx';
import Question from '../models/Question.js';
import fs from 'fs';

/**
 * Parse Excel file and extract questions
 * Expected format: sno, question, optionA, optionB, optionC, optionD, correct
 */
export const parseQuestionExcel = async (filePath, examId, createdBy, subject) => {
  try {
    console.log('🔍 parseQuestionExcel: Starting with filePath:', filePath);
    console.log('🔍 parseQuestionExcel: Parameters:', { examId, createdBy, subject });
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Read the Excel file
    console.log('parseQuestionExcel: Reading Excel file...');
    const workbook = xlsx.readFile(filePath);
    console.log('parseQuestionExcel: Workbook loaded, sheet names:', workbook.SheetNames);
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    console.log('parseQuestionExcel: Converting to JSON...');
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('parseQuestionExcel: Data converted, rows:', data.length);
    
    if (data.length < 2) {
      throw new Error('Excel file must contain at least a header row and one data row');
    }
    
    // Get headers (first row)
    const headers = data[0].map(h => h ? h.toString().trim().toLowerCase() : '');
    
    // Expected headers
    const expectedHeaders = ['sno', 'question', 'optiona', 'optionb', 'optionc', 'optiond', 'correct'];
    
    // Validate headers
    const missingHeaders = expectedHeaders.filter(expected => 
      !headers.some(header => header === expected || header.includes(expected))
    );
    
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
    }
    
    // Find column indices
    const getColumnIndex = (headerName) => {
      return headers.findIndex(h => h === headerName || h.includes(headerName));
    };
    
    const snoIndex = getColumnIndex('sno');
    const questionIndex = getColumnIndex('question');
    const optionAIndex = getColumnIndex('optiona');
    const optionBIndex = getColumnIndex('optionb');
    const optionCIndex = getColumnIndex('optionc');
    const optionDIndex = getColumnIndex('optiond');
    const correctIndex = getColumnIndex('correct');
    
    console.log('parseQuestionExcel: Headers found:', headers);
    console.log('parseQuestionExcel: Column indices:', {
      sno: snoIndex,
      question: questionIndex,
      optionA: optionAIndex,
      optionB: optionBIndex,
      optionC: optionCIndex,
      optionD: optionDIndex,
      correct: correctIndex
    });
    
    // Check if all required columns were found
    if (snoIndex === -1 || questionIndex === -1 || optionAIndex === -1 || 
        optionBIndex === -1 || optionCIndex === -1 || optionDIndex === -1 || correctIndex === -1) {
      throw new Error(`Missing required columns. Found headers: ${headers.join(', ')}`);
    }
    
    const questions = [];
    const errors = [];
    
    // Process data rows (skip header row)
    console.log('parseQuestionExcel: Processing data rows...');
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Log first few rows for debugging
      if (i <= 3) {
        console.log(`parseQuestionExcel: Row ${i}:`, row);
      }
      
      try {
        // Skip empty rows
        if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
          if (i <= 3) {
            console.log(`parseQuestionExcel: Row ${i} is empty, skipping`);
          }
          continue;
        }
        
        const sno = parseInt(row[snoIndex]);
        const question = row[questionIndex] ? row[questionIndex].toString().trim() : '';
        const optionA = row[optionAIndex] ? row[optionAIndex].toString().trim() : '';
        const optionB = row[optionBIndex] ? row[optionBIndex].toString().trim() : '';
        const optionC = row[optionCIndex] ? row[optionCIndex].toString().trim() : '';
        const optionD = row[optionDIndex] ? row[optionDIndex].toString().trim() : '';
        const correct = row[correctIndex] ? row[correctIndex].toString().trim().toUpperCase() : '';
        
        if (i <= 3) {
          console.log(`parseQuestionExcel: Row ${i} parsed data:`, {
            sno, question, optionA, optionB, optionC, optionD, correct
          });
        }
        
        // Validate required fields
        if (!sno || !question || !optionA || !optionB || !optionC || !optionD || !correct) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          if (i <= 3) {
            console.log(`parseQuestionExcel: Row ${i} validation failed - missing fields`);
          }
          continue;
        }
        
        // Validate and convert correct answer
        let correctOption = correct;
        
        // If correct answer is not A/B/C/D, try to match it with options
        if (!['A', 'B', 'C', 'D'].includes(correct)) {
          // Try to find which option matches the correct answer
          if (optionA && optionA.toLowerCase() === correct.toLowerCase()) {
            correctOption = 'A';
          } else if (optionB && optionB.toLowerCase() === correct.toLowerCase()) {
            correctOption = 'B';
          } else if (optionC && optionC.toLowerCase() === correct.toLowerCase()) {
            correctOption = 'C';
          } else if (optionD && optionD.toLowerCase() === correct.toLowerCase()) {
            correctOption = 'D';
          } else {
            errors.push(`Row ${i + 1}: Correct answer "${correct}" does not match any option`);
            if (i <= 3) {
              console.log(`parseQuestionExcel: Row ${i} validation failed - correct answer "${correct}" doesn't match any option`);
            }
            continue;
          }
          
          if (i <= 3) {
            console.log(`parseQuestionExcel: Row ${i} converted correct answer from "${correct}" to "${correctOption}"`);
          }
        }
        
        // Determine the correct answer text based on the option
        let correctAnswerText = '';
        const options = [optionA, optionB, optionC, optionD];
        
        switch(correctOption) {
          case 'A':
            correctAnswerText = optionA;
            break;
          case 'B':
            correctAnswerText = optionB;
            break;
          case 'C':
            correctAnswerText = optionC;
            break;
          case 'D':
            correctAnswerText = optionD;
            break;
        }

        // Create question object
        const questionData = {
          sno,
          question,
          optionA,
          optionB,
          optionC,
          optionD,
          correct: correctOption,
          options: [optionA, optionB, optionC, optionD], // Manually set options array
          correctAnswer: correctAnswerText, // Manually set correctAnswer
          subject: subject || 'General', // Provide default subject if none provided
          examId,
          createdBy,
          marks: 1,
          negativeMarks: 0,
          difficulty: 'medium'
        };
        
        questions.push(questionData);
        if (i <= 3) {
          console.log(`parseQuestionExcel: Row ${i} question added successfully. Total questions: ${questions.length}`);
          console.log(`parseQuestionExcel: Row ${i} correctAnswer set to: "${correctAnswerText}"`);
        }
        
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }
    
    if (questions.length === 0) {
      throw new Error('No valid questions found in the Excel file');
    }
    
    // Save questions to database
    const savedQuestions = await Question.insertMany(questions);
    
    return {
      success: true,
      questions: savedQuestions,
      totalQuestions: questions.length,
      errors: errors.length > 0 ? errors : null
    };
    
  } catch (error) {
    console.error('❌ Error parsing Excel file:', error);
    console.error('❌ Error stack:', error.stack);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Validate Excel file format before parsing
 */
export const validateQuestionExcel = (filePath) => {
  try {
    console.log('validateQuestionExcel: Starting with filePath:', filePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return { valid: false, error: `File not found: ${filePath}` };
    }
    
    console.log('validateQuestionExcel: Reading Excel file...');
    const workbook = xlsx.readFile(filePath);
    console.log('validateQuestionExcel: Workbook loaded, sheet names:', workbook.SheetNames);
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log('validateQuestionExcel: Converting to JSON...');
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('validateQuestionExcel: Data converted, rows:', data.length);
    
    if (data.length < 2) {
      return { valid: false, error: 'File must contain at least a header row and one data row' };
    }
    
    const headers = data[0].map(h => h ? h.toString().trim().toLowerCase() : '');
    const expectedHeaders = ['sno', 'question', 'optiona', 'optionb', 'optionc', 'optiond', 'correct'];
    
    const missingHeaders = expectedHeaders.filter(expected => 
      !headers.some(header => header === expected || header.includes(expected))
    );
    
    if (missingHeaders.length > 0) {
      return { 
        valid: false, 
        error: `Missing required columns: ${missingHeaders.join(', ')}` 
      };
    }
    
    return { valid: true };
    
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Generate sample Excel template with proper formatting and examples
 */
export const generateQuestionTemplate = () => {
  const templateData = [
    // Header row with exact column names required
    ['sno', 'question', 'optionA', 'optionB', 'optionC', 'optionD', 'correct'],
    
    // Example questions with clear formatting
    [
      1, 
      'What is the capital of India?', 
      'Mumbai', 
      'Delhi', 
      'Kolkata', 
      'Chennai', 
      'B'
    ],
    [
      2, 
      'Which programming language is known for its simplicity?', 
      'Java', 
      'Python', 
      'C++', 
      'Assembly', 
      'B'
    ],
    [
      3, 
      'What is the result of 5 + 3?', 
      '6', 
      '7', 
      '8', 
      '9', 
      'C'
    ],
    [
      4, 
      'Which is the largest planet in our solar system?', 
      'Earth', 
      'Jupiter', 
      'Saturn', 
      'Neptune', 
      'B'
    ],
    [
      5, 
      'What does HTML stand for?', 
      'HyperText Markup Language', 
      'High Tech Modern Language', 
      'Home Tool Markup Language', 
      'Hyperlink and Text Markup Language', 
      'A'
    ]
  ];
  
  const worksheet = xlsx.utils.aoa_to_sheet(templateData);
  
  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 5 },   // sno column
    { wch: 50 },  // question column
    { wch: 30 },  // optionA column
    { wch: 30 },  // optionB column
    { wch: 30 },  // optionC column
    { wch: 30 },  // optionD column
    { wch: 10 }   // correct column
  ];
  
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Question Template');
  
  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
};
