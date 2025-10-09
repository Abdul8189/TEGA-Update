import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User, Briefcase, GraduationCap, Plus, Trash2, Download, Layout, Award, BookOpenCheck, Users, Save, GripVertical, Eye } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import UserDashboardLayout from '../components/UserDashboardLayout';
import TemplateSelector from '../components/resumeTemplates/TemplateSelector';
import TemplateRegistry from '../components/resumeTemplates/TemplateRegistry';
import templateConfig from '../components/resumeTemplates/templateConfig';
import FontSelector from '../components/resumeTemplates/FontSelector';
import { defaultFont } from '../components/resumeTemplates/fontConfig';
import ResumeSection from '../components/ResumeSection';
// PDF libraries will be loaded dynamically to avoid Vite issues
// PDF export functionality will be handled inline

const ResumePreview = ({ previewRef, template, formData, sections, previewMode, getSampleData, hasUserData, selectedFont }) => {
  // Memoized smart preview data for better performance
  const displayData = useMemo(() => {
    const sampleData = getSampleData();
    
    // Helper function to merge user data with sample data
    const mergeWithSample = (userData, sampleData, isArray = false) => {
      if (isArray) {
        // For arrays, if user has data, use it; otherwise use sample
        return userData.length > 0 ? userData : sampleData;
      } else {
        // For objects, merge field by field
        const merged = { ...sampleData };
        Object.keys(userData).forEach(key => {
          if (userData[key] && userData[key].toString().trim() !== '') {
            merged[key] = userData[key];
          }
        });
        return merged;
      }
    };

    return {
      personalInfo: mergeWithSample(formData.personalInfo, sampleData.personalInfo),
      experience: mergeWithSample(formData.experience, sampleData.experience, true),
      education: mergeWithSample(formData.education, sampleData.education, true),
      skills: mergeWithSample(formData.skills, sampleData.skills, true),
      projects: mergeWithSample(formData.projects, sampleData.projects, true),
      certifications: mergeWithSample(formData.certifications, sampleData.certifications, true),
      achievements: mergeWithSample(formData.achievements, sampleData.achievements, true),
      extracurricularActivities: mergeWithSample(formData.extracurricularActivities, sampleData.extracurricularActivities, true),
      languages: mergeWithSample(formData.languages, sampleData.languages, true),
      volunteerExperience: mergeWithSample(formData.volunteerExperience, sampleData.volunteerExperience, true),
      hobbies: mergeWithSample(formData.hobbies, sampleData.hobbies, true)
    };
  }, [formData, getSampleData]);
  
  // Debug logging for live preview
  console.log('ResumePreview render:', {
    template,
    sections,
    hasDisplayData: !!displayData,
    personalInfo: displayData.personalInfo
  });
  
  return (
    <div className="w-full">
      {/* Preview Container */}
      <div 
        ref={previewRef} 
        id="resume-preview"
            className="w-full bg-white mx-auto"
            style={{ 
              minHeight: '600px',
              maxWidth: '100%',
              overflow: 'visible',
              padding: '0'
            }}
          >
        {/* Template Content */}
        <div style={{ transform: 'scale(0.75)', transformOrigin: 'top left', width: '133%', minHeight: 'auto' }}>
        <TemplateRegistry 
          templateId={template} 
          formData={displayData} 
          sectionOrder={sections} 
          selectedFont={selectedFont} 
        />
        </div>
        
      </div>
  </div>
);
};

const ResumeBuilderPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({
    personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', summary: '', title: '' },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    extracurricularActivities: [],
    languages: [],
    volunteerExperience: [],
    hobbies: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newHobby, setNewHobby] = useState('');
  
  // Local state for immediate UI updates (debounced to formData)
  const [localPersonalInfo, setLocalPersonalInfo] = useState({
    fullName: '', email: '', phone: '', location: '', linkedin: '', summary: '', title: ''
  });
  const [template, setTemplate] = useState('classic');
  const [selectedFont, setSelectedFont] = useState(defaultFont);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [previewMode, setPreviewMode] = useState(false); // Show live preview by default
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasPaidForTegaExam, setHasPaidForTegaExam] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);
  const previewRef = useRef(null);

  // Memoized progress calculation for better performance
  const resumeProgress = useMemo(() => {
    const personalInfoProgress = Object.values(localPersonalInfo).filter(v => v && v.trim()).length / 7;
    const sectionsProgress = [
      formData.experience.length > 0 ? 1 : 0,
      formData.education.length > 0 ? 1 : 0,
      formData.skills.length > 0 ? 1 : 0,
      formData.projects.length > 0 ? 1 : 0,
      formData.certifications.length > 0 ? 1 : 0
    ].reduce((a, b) => a + b, 0) / 5;
    const totalProgress = (personalInfoProgress + sectionsProgress) / 2;
    return Math.round(totalProgress * 100);
  }, [localPersonalInfo, formData.experience, formData.education, formData.skills, formData.projects, formData.certifications]);
  
  // PDF Export functionality - using browser print method

  // Check if user has entered meaningful data (not just gibberish)
  const hasUserData = () => {
    // Check for meaningful personal info (not just random characters)
    const hasPersonalInfo = Object.values(formData.personalInfo).some(value => {
      if (!value || value.trim() === '') return false;
      // Check if it's not just random characters (basic validation)
      const meaningfulWords = value.trim().split(' ').filter(word => word.length > 2);
      return meaningfulWords.length > 0;
    });
    
    // Check for meaningful experience entries
    const hasExperience = formData.experience.some(exp => 
      exp.position && exp.position.trim().length > 2 && 
      exp.company && exp.company.trim().length > 2
    );
    
    // Check for meaningful education entries
    const hasEducation = formData.education.some(edu => 
      edu.degree && edu.degree.trim().length > 2 && 
      edu.institution && edu.institution.trim().length > 2
    );
    
    // Check for meaningful skills (not just random characters)
    const hasSkills = formData.skills.some(skill => 
      skill.name && skill.name.trim().length > 2 && 
      !/^[^a-zA-Z]*$/.test(skill.name) // Not just special characters
    );
    
    const hasProjects = formData.projects.length > 0;
    const hasCertifications = formData.certifications.length > 0;
    const hasAchievements = formData.achievements.length > 0;
    const hasExtracurricular = formData.extracurricularActivities.length > 0;
    const hasLanguages = formData.languages.length > 0;
    const hasVolunteer = formData.volunteerExperience.length > 0;
    const hasHobbies = formData.hobbies.length > 0;
    
    return hasPersonalInfo || hasExperience || hasEducation || hasSkills || hasProjects || 
           hasCertifications || hasAchievements || hasExtracurricular || hasLanguages || 
           hasVolunteer || hasHobbies;
  };

  // Sample data for template preview - returns realistic placeholder data
  const getSampleData = () => {
        return {
          personalInfo: {
        fullName: 'John Smith',
        title: 'Software Engineer',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/johnsmith',
        summary: 'Experienced software engineer with expertise in full-stack development. Passionate about creating innovative solutions and leading development teams to deliver high-quality products.'
          },
          experience: [
            {
          id: 1,
          position: 'Senior Software Engineer',
          company: 'Tech Solutions Inc.',
          startDate: '2022-01-01',
              endDate: '',
              current: true,
          description: 'Lead development of web applications using modern technologies\nMentor junior developers and conduct code reviews\nCollaborate with cross-functional teams to deliver projects on time'
            }
          ],
          education: [
            {
          id: 1,
              degree: 'Bachelor of Science',
              field: 'Computer Science',
          institution: 'University of California',
          startDate: '2018-09-01',
          endDate: '2022-05-01',
              current: false,
              gpa: '3.8'
            }
          ],
          skills: [
        { id: 1, name: 'JavaScript' },
        { id: 2, name: 'React' },
        { id: 3, name: 'Node.js' },
        { id: 4, name: 'Python' },
        { id: 5, name: 'AWS' }
          ],
          projects: [
            {
          id: 1,
          name: 'E-Commerce Platform',
          description: 'Built a full-stack e-commerce platform with user authentication and payment processing.',
          technologies: 'React, Node.js, MongoDB, Stripe',
          link: 'https://github.com/johnsmith/ecommerce'
            }
          ],
          certifications: [
            {
          id: 1,
          name: 'AWS Certified Developer',
              issuer: 'Amazon Web Services',
          date: '2023-01-15'
            }
          ],
          achievements: [
            {
          id: 1,
          description: 'Led team that improved application performance by 40%'
            }
          ],
          extracurricularActivities: [],
      languages: [
        { id: 1, name: 'English (Native)' },
        { id: 2, name: 'Spanish (Conversational)' }
      ],
          volunteerExperience: [],
      hobbies: [
        { id: 1, name: 'Photography' },
        { id: 2, name: 'Hiking' }
      ]
        };
  };

  const sectionDetails = {
    personalInfo: { title: 'Personal Information', icon: User },
    experience: { title: 'Work Experience', icon: Briefcase },
    education: { title: 'Education', icon: GraduationCap },
    skills: { title: 'Skills', icon: Award },
    projects: { title: 'Projects', icon: BookOpenCheck },
    certifications: { title: 'Certifications', icon: Award },
    achievements: { title: 'Achievements', icon: Award },
    extracurricularActivities: { title: 'Extracurricular Activities', icon: Users },
    volunteerExperience: { title: 'Volunteer Experience', icon: Users },
    languages: { title: 'Languages', icon: Award },
    hobbies: { title: 'Hobbies', icon: Award },
  };

  const [sections, setSections] = useState(Object.keys(sectionDetails));

  useEffect(() => {
    if (location.state?.templateId) {
      setTemplate(location.state.templateId);
    }
  }, [location.state]);

  // Check Tega exam payment status
  useEffect(() => {
    const checkTegaExamPayment = async () => {
      try {
        setIsCheckingPayment(true);
        console.log('🔍 Starting TEGA exam payment check...');
        console.log('🔍 Current user:', user);
        console.log('🔍 User ID:', user?.id);
        console.log('🔍 User email:', user?.email);
        
        const response = await api('/api/payments/check-tega-exam-payment');
        console.log('🔍 API Response:', response);
        
        if (response && response.success) {
          setHasPaidForTegaExam(response.hasPaidForTegaExam);
          console.log('✅ Tega exam payment status:', response.hasPaidForTegaExam);
          console.log('🔍 Payment source:', response.paymentSource);
          console.log('🔍 Payment details:', response.paymentDetails);
        } else {
          console.log('❌ Failed to check Tega exam payment status');
          console.log('❌ Response:', response);
          setHasPaidForTegaExam(false);
        }
      } catch (error) {
        console.error('❌ Error checking Tega exam payment:', error);
        console.error('❌ Error details:', error.message);
        setHasPaidForTegaExam(false);
      } finally {
        setIsCheckingPayment(false);
      }
    };

    if (user && user.id) {
      checkTegaExamPayment();
    } else {
      console.log('❌ No user found, skipping payment check');
      setHasPaidForTegaExam(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchResumeData = async () => {
      try {
        const response = await api('/api/resume');
        if (response && response.success && response.data) {
          const fetchedData = {
            personalInfo: response.data.personalInfo || formData.personalInfo,
            experience: response.data.experience || [],
            education: response.data.education || [],
            skills: response.data.skills || [],
            projects: response.data.projects || [],
            certifications: response.data.certifications || [],
            achievements: response.data.achievements || [],
            extracurricularActivities: response.data.extracurricularActivities || [],
            languages: response.data.languages || [],
            volunteerExperience: response.data.volunteerExperience || [],
            hobbies: response.data.hobbies || []
          };
          setFormData(fetchedData);
          if (response.data.sections) {
            setSections(response.data.sections);
          }
        } else {
          // If no data exists, start with empty form for better UX
          const defaultData = {
            personalInfo: {
              fullName: '',
              email: '',
              phone: '',
              location: '',
              linkedin: '',
              summary: '',
              title: ''
            },
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            achievements: [],
            extracurricularActivities: [],
            volunteerExperience: [],
            languages: [],
            hobbies: []
          };
          setFormData(defaultData);
        }
      } catch (error) {
        console.error('Failed to fetch resume data:', error);
        // Use empty data even if fetch fails
        const defaultData = {
          personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            summary: '',
            title: ''
          },
          experience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
          achievements: [],
          extracurricularActivities: [],
          volunteerExperience: [],
          languages: [],
          hobbies: []
        };
        setFormData(defaultData);
      }
    };
    fetchResumeData();
  }, []);

  // Sync local state with formData when component loads
  useEffect(() => {
    setLocalPersonalInfo(formData.personalInfo);
  }, []);

  // Auto-switch to live mode when user starts entering data
  useEffect(() => {
    if (hasUserData()) {
      setPreviewMode(false);
    }
  }, [formData]);

  const handleSaveResume = async () => {
    try {
      const payload = { ...formData, sections };
      const response = await api('/api/resume', { method: 'POST', body: payload });
      if (response && response.message) {
      toast.success('Resume saved successfully!');
      } else {
      toast.success('Resume saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save resume:', error);
      toast.error('Failed to save resume. Please try again.');
    }
  };

  const handleClearData = () => {
    setFormData({
      personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', summary: '', title: '' },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      achievements: [],
      extracurricularActivities: [],
      languages: [],
      volunteerExperience: [],
      hobbies: []
    });
    setPreviewMode(true);
    toast.success('Data cleared! Now showing sample data.');
  };

  const handleGenericChange = (section, id, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // Debounced version for better performance
  const debouncedUpdateRef = useRef({});
  
  const handlePersonalInfoChange = useCallback((field, value) => {
    // Update local state immediately for responsive UI
    setLocalPersonalInfo(prev => ({ ...prev, [field]: value }));
    
    // Clear existing timeout for this field
    if (debouncedUpdateRef.current[field]) {
      clearTimeout(debouncedUpdateRef.current[field]);
    }
    
    // Set new timeout for formData update
    debouncedUpdateRef.current[field] = setTimeout(() => {
      setFormData(prev => ({ 
        ...prev, 
        personalInfo: { ...prev.personalInfo, [field]: value } 
      }));
    }, 300); // 300ms delay for better performance
  }, []);

  const addGenericItem = (section, newItem) => {
    const newId = formData[section].length > 0 ? Math.max(...formData[section].map(item => item.id)) + 1 : 1;
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], { id: newId, ...newItem }]
    }));
  };

  const removeGenericItem = (section, id) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== id)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      addGenericItem('skills', { name: newSkill.trim() });
      setNewSkill('');
    }
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      addGenericItem('languages', { name: newLanguage.trim() });
      setNewLanguage('');
    }
  };

  const addHobby = () => {
    if (newHobby.trim()) {
      addGenericItem('hobbies', { name: newHobby.trim() });
      setNewHobby('');
    }
  };



  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  /**
   * Download PDF directly to device using CDN-loaded libraries
   */
  const downloadPdf = async () => {
    let originalStyles = null;
    let element = null;
    
    try {
      // Get the resume element - try multiple selectors
      element = previewRef?.current || 
                document.getElementById('resume-preview') ||
                document.querySelector('.classic-template') ||
                document.querySelector('[id*="resume"]') ||
                document.querySelector('.resume-template');
      
      console.log('Element found:', element);
      console.log('Element dimensions:', element ? {
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight
      } : 'No element');
      
      if (!element) {
        toast.error('Resume preview not found. Please try again.');
        return;
      }
      
      // Ensure element is visible and has content
      if (element.offsetWidth === 0 || element.offsetHeight === 0) {
        toast.error('Resume preview has no content. Please check the preview.');
        return;
      }

      // Get the personal name for filename
      const personalName = formData.personalInfo?.fullName || 'resume';
      const templateName = templateConfig[template]?.name || template;
      const filename = `${personalName}_${templateName}.pdf`;
      
      setIsExporting(true);
      toast.info('Loading PDF libraries...', { autoClose: 2000 });
      
      // Load libraries from CDN to avoid Vite issues
      const loadScript = (src) => {
        return new Promise((resolve, reject) => {
          if (window.html2canvas && window.jsPDF) {
            resolve();
            return;
          }
          
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      };
      
      // Load html2canvas and jsPDF from CDN
      await Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
      ]);
      
      toast.info('Generating PDF...', { autoClose: 2000 });
      
      // Temporarily modify styles to remove padding/margins for PDF
      originalStyles = {
        padding: element.style.padding,
        margin: element.style.margin,
        border: element.style.border,
        boxShadow: element.style.boxShadow
      };
      
      // Apply minimal styling for PDF
      element.style.padding = '0';
      element.style.margin = '0';
      element.style.border = 'none';
      element.style.boxShadow = 'none';
      
      // Create canvas from the resume element with minimal padding
      console.log('Creating canvas with html2canvas...');
      const canvas = await window.html2canvas(element, {
        scale: 2, // Good quality without being too large
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.offsetWidth || element.scrollWidth,
        height: element.offsetHeight || element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        removeContainer: false,
        imageTimeout: 15000,
        logging: true, // Enable logging for debugging
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          // Ensure cloned document has proper styling
          const clonedElement = clonedDoc.querySelector('#resume-preview') || 
                               clonedDoc.querySelector('.classic-template') ||
                               clonedDoc.querySelector('.resume-template');
          if (clonedElement) {
            clonedElement.style.padding = '0';
            clonedElement.style.margin = '0';
            clonedElement.style.border = 'none';
            clonedElement.style.boxShadow = 'none';
          }
        }
      });
      
      console.log('Canvas created:', canvas);
      console.log('Canvas dimensions:', {
        width: canvas.width,
        height: canvas.height
      });
      
      // Create PDF with minimal margins
      const imgData = canvas.toDataURL('image/png');
      console.log('Image data length:', imgData.length);
      
      if (!imgData || imgData === 'data:,') {
        throw new Error('Canvas is empty - no image data generated');
      }
      
      const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
      console.log('PDF created:', pdf);
      
      // Get A4 page dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Remove all margins to fill complete page
      const margin = 0; // No margins - fill entire page
      const contentWidth = pdfWidth;
      const contentHeight = pdfHeight;
      
      // Calculate scaling to fill the entire page
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Scale to fill the entire page (both width and height)
      const widthRatio = contentWidth / imgWidth;
      const heightRatio = contentHeight / imgHeight;
      
      // Use the larger ratio to fill the entire page (may crop slightly)
      const ratio = Math.max(widthRatio, heightRatio);
      const scaledWidth = imgWidth * ratio;
      const scaledHeight = imgHeight * ratio;
      
      // Position at top-left to fill page from corner
      const x = 0;
      const y = 0;
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight);
      
      // Download the PDF
      pdf.save(filename);
      
      // Restore original styles
      element.style.padding = originalStyles.padding;
      element.style.margin = originalStyles.margin;
      element.style.border = originalStyles.border;
      element.style.boxShadow = originalStyles.boxShadow;
      
      console.log('PDF saved successfully');
      toast.success('PDF downloaded successfully!');
      
    } catch (error) {
      console.error('PDF download failed:', error);
      
      // Restore original styles in case of error
      if (element && originalStyles) {
        element.style.padding = originalStyles.padding;
        element.style.margin = originalStyles.margin;
        element.style.border = originalStyles.border;
        element.style.boxShadow = originalStyles.boxShadow;
      }
      
      console.error('Primary PDF method failed, trying fallback...');
      
      // Fallback: Use browser print functionality
      try {
        const printWindow = window.open('', '_blank');
        const resumeHTML = element.outerHTML;
        
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>Resume PDF</title>
            <style>
              @page { size: A4; margin: 0; }
              body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
              * { -webkit-print-color-adjust: exact; }
          </style>
        </head>
        <body>
          ${resumeHTML}
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
          printWindow.print();
          printWindow.close();
      
        toast.success('PDF print dialog opened as fallback!');
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      toast.error(`Failed to generate PDF: ${error.message}`);
      }
    } finally {
      setIsExporting(false);
    }
  };

  // PDF test functionality removed - using simple browser print method

  // Template testing functionality removed - using simple browser print method


  
  return (
    <UserDashboardLayout>
      <ToastContainer />
      
      {/* Simplified Main Content */}
      <div className="relative">
        {/* Simple Hero Section */}
        <section className="bg-blue-900 text-white py-12">
          
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="mb-6">
              <svg className="w-12 h-12 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
            
            <h1 className="text-4xl font-bold mb-6 text-white">
                Professional Resume Builder
              </h1>
            
            <p className="text-lg text-blue-100 mb-8">
                Create ATS-friendly, professional resumes tailored for technical students and freshers. 
                Choose from 22+ templates and generate high-quality PDFs in minutes.
              </p>
            
              <div className="flex items-center justify-center space-x-8 text-sm text-blue-200">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>22+ Professional Templates</span>
              </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>ATS-Friendly Design</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>High-Quality PDF Export</span>
              </div>
            </div>
          </div>
        </section>


        {/* Main Content Section */}
        <section className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            {/* Header Controls */}
            <div className="mb-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-600 rounded-xl">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Resume Builder</h2>
                      <p className="text-sm text-gray-500">Create your professional resume</p>
                    </div>
                    </div>
                    
                  <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => setShowTemplateSelector(true)}
                      className='flex items-center px-4 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm'
                    >
                      <Layout className="w-4 h-4 mr-2" />
                      Change Template
                      </button>
                      
                      <button
                        onClick={() => setPreviewMode(!previewMode)}
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                          previewMode 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {previewMode ? 'Preview Mode' : 'Live Mode'}
                      </button>
                      
                <button
                  onClick={handleSaveResume}
                      className='flex items-center px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700 transition-colors text-sm'
                >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                </button>
                    
                <button
                        onClick={() => {
                          if (!hasPaidForTegaExam) {
                            toast.error('Please pay for Tega exam to access this resource');
                            return;
                          }
                          downloadPdf();
                        }}
                  disabled={isExporting || isCheckingPayment || !hasPaidForTegaExam}
                      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors text-sm relative group ${
                        hasPaidForTegaExam 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      } ${isExporting || isCheckingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={!hasPaidForTegaExam ? 'Pay for Tega exam to access this resource' : ''}
                >
                      <Download className="w-4 h-4 mr-2" />
                        {isCheckingPayment ? 'Checking...' : isExporting ? 'Generating...' : 'Download PDF'}
                      
                      {/* Hover message for disabled state */}
                      {!hasPaidForTegaExam && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                          Pay for Tega exam to access this resource
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      )}
                </button>
                      
                    <div className="w-48">
                          <FontSelector 
                            selectedFont={selectedFont}
                            onFontChange={setSelectedFont}
                        className="w-full"
                          />
                        </div>
                      </div>
              </div>
            </div>
          </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: 'auto', height: 'auto' }}>
              {/* Left Column: Form Editor */}
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Resume Details</h3>
                  <p className="text-sm text-gray-500">Fill in your information below</p>
                </div>
                <div className="p-6">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={sections} strategy={verticalListSortingStrategy}>
                    {sections.map((sectionKey) => (
                      <ResumeSection key={sectionKey} id={sectionKey} sectionDetails={sectionDetails[sectionKey]}>
                            {sectionKey === 'personalInfo' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
                                    <User className="w-4 h-4 mr-2 text-blue-600" />
                                    Full Name
                                  </label>
                                  <input 
                                    type="text" 
                                    value={localPersonalInfo.fullName} 
                                    onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)} 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    placeholder="Enter your full name" 
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Email
                                  </label>
                                  <input 
                                    type="email" 
                                    value={localPersonalInfo.email} 
                                    onChange={(e) => handlePersonalInfoChange('email', e.target.value)} 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    placeholder="your.email@example.com" 
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Phone
                                  </label>
                                  <input 
                                    type="tel" 
                                    value={localPersonalInfo.phone} 
                                    onChange={(e) => handlePersonalInfoChange('phone', e.target.value)} 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    placeholder="+1 (555) 123-4567" 
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Location
                                  </label>
                                  <input 
                                    type="text" 
                                    value={localPersonalInfo.location} 
                                    onChange={(e) => handlePersonalInfoChange('location', e.target.value)} 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    placeholder="City, State, Country" 
                                  />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                    LinkedIn Profile
                                  </label>
                                  <input 
                                    type="url" 
                                    value={localPersonalInfo.linkedin} 
                                    onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)} 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                    placeholder="https://linkedin.com/in/yourprofile" 
                                  />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                  <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Professional Summary
                                  </label>
                                  <textarea 
                                    value={localPersonalInfo.summary} 
                                    onChange={(e) => handlePersonalInfoChange('summary', e.target.value)} 
                                    rows={4} 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" 
                                    placeholder="Write a compelling summary of your professional background, key skills, and career objectives..." 
                                  />
                                </div>
                              </div>
                            )}
                            {sectionKey === 'experience' && (
                              <div>
                                <button onClick={() => addGenericItem('experience', { company: '', position: '', startDate: '', endDate: '', current: false, description: '' })} className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mb-6 font-semibold">
                                  <Plus className="w-5 h-5 mr-2" /> Add Work Experience
                                </button>
                                {formData.experience.map((exp, index) => (
                                  <div key={exp.id} className="border-2 border-gray-200 bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-blue-300">
                                    <div className="flex items-center justify-between mb-6">
                                      <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                                          <Briefcase className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">Work Experience #{index + 1}</h3>
                                      </div>
                                      <button onClick={() => removeGenericItem('experience', exp.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200">
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Company Name</label>
                                        <input 
                                          type="text" 
                                          value={exp.company} 
                                          onChange={(e) => handleGenericChange('experience', exp.id, 'company', e.target.value)} 
                                          placeholder="e.g., Google, Microsoft, Apple" 
                                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Job Title</label>
                                        <input 
                                          type="text" 
                                          value={exp.position} 
                                          onChange={(e) => handleGenericChange('experience', exp.id, 'position', e.target.value)} 
                                          placeholder="e.g., Software Engineer, Product Manager" 
                                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Start Date</label>
                                        <input 
                                          type="date" 
                                          value={exp.startDate} 
                                          onChange={(e) => handleGenericChange('experience', exp.id, 'startDate', e.target.value)} 
                                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">End Date</label>
                                        <input 
                                          type="date" 
                                          value={exp.endDate} 
                                          onChange={(e) => handleGenericChange('experience', exp.id, 'endDate', e.target.value)} 
                                          disabled={exp.current} 
                                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm hover:border-gray-300 disabled:bg-gray-100 disabled:opacity-60" 
                                        />
                                      </div>
                                      <div className="md:col-span-2">
                                        <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border-2 border-blue-100 hover:border-blue-200 transition-all duration-200 cursor-pointer">
                                          <input 
                                            type="checkbox" 
                                            checked={exp.current} 
                                            onChange={(e) => handleGenericChange('experience', exp.id, 'current', e.target.checked)} 
                                            className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500" 
                                          />
                                          <span className="text-sm font-semibold text-blue-800">I currently work here</span>
                                        </label>
                                      </div>
                                      <div className="md:col-span-2 space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Job Description & Achievements</label>
                                        <textarea 
                                          value={exp.description} 
                                          onChange={(e) => handleGenericChange('experience', exp.id, 'description', e.target.value)} 
                                          placeholder="Describe your key responsibilities, achievements, and impact in this role..." 
                                          rows={4} 
                                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" 
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {sectionKey === 'education' && (
                              <div>
                                <button onClick={() => addGenericItem('education', { institution: '', degree: '', field: '', gpa: '', startDate: '', endDate: '', current: false })} className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 mb-6 font-semibold">
                                  <Plus className="w-5 h-5 mr-2" /> Add Education
                                </button>
                                {formData.education.map((edu, index) => (
                                  <div key={edu.id} className="border-2 border-gray-200 bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-green-300">
                                    <div className="flex items-center justify-between mb-6">
                                      <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                                          <GraduationCap className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">Education #{index + 1}</h3>
                                      </div>
                                      <button onClick={() => removeGenericItem('education', edu.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200">
                                        <Trash2 className="w-5 h-5" />
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <input type="text" value={edu.institution} onChange={(e) => handleGenericChange('education', edu.id, 'institution', e.target.value)} placeholder="Institution" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <input type="text" value={edu.degree} onChange={(e) => handleGenericChange('education', edu.id, 'degree', e.target.value)} placeholder="Degree" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <input type="text" value={edu.field} onChange={(e) => handleGenericChange('education', edu.id, 'field', e.target.value)} placeholder="Field of Study" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <input type="text" value={edu.gpa} onChange={(e) => handleGenericChange('education', edu.id, 'gpa', e.target.value)} placeholder="GPA" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <input type="date" value={edu.startDate} onChange={(e) => handleGenericChange('education', edu.id, 'startDate', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <input type="date" value={edu.endDate} onChange={(e) => handleGenericChange('education', edu.id, 'endDate', e.target.value)} disabled={edu.current} className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100" />
                                      <div className="md:col-span-2"><label className="flex items-center"><input type="checkbox" checked={edu.current} onChange={(e) => handleGenericChange('education', edu.id, 'current', e.target.checked)} className="mr-2" /> Currently studying here</label></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {sectionKey === 'projects' && (
                              <div>
                                <button onClick={() => addGenericItem('projects', { name: '', description: '', technologies: '', link: '' })} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4">
                                  <Plus className="w-4 h-4 mr-2" /> Add Project
                                </button>
                                {formData.projects.map((proj, index) => (
                                  <div key={proj.id} className="border border-gray-300 bg-white rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-4">
                                      <h3 className="text-lg font-semibold text-gray-800">Project #{index + 1}</h3>
                                      <button onClick={() => removeGenericItem('projects', proj.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                      <input type="text" value={proj.name} onChange={(e) => handleGenericChange('projects', proj.id, 'name', e.target.value)} placeholder="Project Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <textarea value={proj.description} onChange={(e) => handleGenericChange('projects', proj.id, 'description', e.target.value)} placeholder="Description" rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <input type="text" value={proj.technologies} onChange={(e) => handleGenericChange('projects', proj.id, 'technologies', e.target.value)} placeholder="Technologies Used" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <input type="url" value={proj.link} onChange={(e) => handleGenericChange('projects', proj.id, 'link', e.target.value)} placeholder="Project Link" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {sectionKey === 'skills' && (
                              <div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {formData.skills.map((skill) => (
                                    <span key={skill.id} className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                      {skill.name}
                                      <button onClick={() => removeGenericItem('skills', skill.id)} className="ml-2 text-blue-600 hover:text-blue-800">×</button>
                                    </span>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addSkill()} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg" placeholder="Add a skill..." />
                                  <button onClick={addSkill} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
                                </div>
                              </div>
                            )}
                            {sectionKey === 'certifications' && (
                              <div>
                                <button onClick={() => addGenericItem('certifications', { name: '', issuer: '', date: '' })} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4">
                                  <Plus className="w-4 h-4 mr-2" /> Add Certification
                                </button>
                                {formData.certifications.map((cert, index) => (
                                  <div key={cert.id} className="border border-gray-300 bg-white rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-4">
                                      <h3 className="text-lg font-semibold text-gray-800">Certification #{index + 1}</h3>
                                      <button onClick={() => removeGenericItem('certifications', cert.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <input type="text" value={cert.name} onChange={(e) => handleGenericChange('certifications', cert.id, 'name', e.target.value)} placeholder="Certification Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <input type="text" value={cert.issuer} onChange={(e) => handleGenericChange('certifications', cert.id, 'issuer', e.target.value)} placeholder="Issuing Organization" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <input type="date" value={cert.date} onChange={(e) => handleGenericChange('certifications', cert.id, 'date', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {sectionKey === 'achievements' && (
                              <div>
                                <button onClick={() => addGenericItem('achievements', { description: '' })} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4">
                                  <Plus className="w-4 h-4 mr-2" /> Add Achievement
                                </button>
                                {formData.achievements.map((ach, index) => (
                                  <div key={ach.id} className="border border-gray-300 bg-white rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-4">
                                      <h3 className="text-lg font-semibold text-gray-800">Achievement #{index + 1}</h3>
                                      <button onClick={() => removeGenericItem('achievements', ach.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                    <textarea value={ach.description} onChange={(e) => handleGenericChange('achievements', ach.id, 'description', e.target.value)} placeholder="Describe your achievement" rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                  </div>
                                ))}
                              </div>
                            )}
                            {sectionKey === 'extracurricularActivities' && (
                              <div>
                                <button onClick={() => addGenericItem('extracurricularActivities', { name: '', role: '', startDate: '', endDate: '', current: false, description: '' })} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4">
                                  <Plus className="w-4 h-4 mr-2" /> Add Activity
                                </button>
                                {formData.extracurricularActivities.map((activity, index) => (
                                  <div key={activity.id} className="border border-gray-300 bg-white rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-4">
                                      <h3 className="text-lg font-semibold text-gray-800">Activity #{index + 1}</h3>
                                      <button onClick={() => removeGenericItem('extracurricularActivities', activity.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <input type="text" value={activity.name} onChange={(e) => handleGenericChange('extracurricularActivities', activity.id, 'name', e.target.value)} placeholder="Activity/Organization Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <input type="text" value={activity.role} onChange={(e) => handleGenericChange('extracurricularActivities', activity.id, 'role', e.target.value)} placeholder="Your Role" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <input type="date" value={activity.startDate} onChange={(e) => handleGenericChange('extracurricularActivities', activity.id, 'startDate', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <input type="date" value={activity.endDate} onChange={(e) => handleGenericChange('extracurricularActivities', activity.id, 'endDate', e.target.value)} disabled={activity.current} className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100" />
                                      <div className="md:col-span-2"><label className="flex items-center"><input type="checkbox" checked={activity.current} onChange={(e) => handleGenericChange('extracurricularActivities', activity.id, 'current', e.target.checked)} className="mr-2" /> Currently involved</label></div>
                                      <textarea value={activity.description} onChange={(e) => handleGenericChange('extracurricularActivities', activity.id, 'description', e.target.value)} placeholder="Description" rows={3} className="md:col-span-2 w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {sectionKey === 'volunteerExperience' && (
                              <div>
                                <button onClick={() => addGenericItem('volunteerExperience', { organization: '', role: '', startDate: '', endDate: '', current: false, description: '' })} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4">
                                  <Plus className="w-4 h-4 mr-2" /> Add Volunteer Experience
                                </button>
                                {formData.volunteerExperience.map((vol, index) => (
                                  <div key={vol.id} className="border border-gray-300 bg-white rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between mb-4">
                                      <h3 className="text-lg font-semibold text-gray-800">Experience #{index + 1}</h3>
                                      <button onClick={() => removeGenericItem('volunteerExperience', vol.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <input type="text" value={vol.organization} onChange={(e) => handleGenericChange('volunteerExperience', vol.id, 'organization', e.target.value)} placeholder="Organization" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <input type="text" value={vol.role} onChange={(e) => handleGenericChange('volunteerExperience', vol.id, 'role', e.target.value)} placeholder="Role" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <input type="date" value={vol.startDate} onChange={(e) => handleGenericChange('volunteerExperience', vol.id, 'startDate', e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                      <input type="date" value={vol.endDate} onChange={(e) => handleGenericChange('volunteerExperience', vol.id, 'endDate', e.target.value)} disabled={vol.current} className="w-full px-4 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100" />
                                      <div className="md:col-span-2"><label className="flex items-center"><input type="checkbox" checked={vol.current} onChange={(e) => handleGenericChange('volunteerExperience', vol.id, 'current', e.target.checked)} className="mr-2" /> Currently volunteering</label></div>
                                      <textarea value={vol.description} onChange={(e) => handleGenericChange('volunteerExperience', vol.id, 'description', e.target.value)} placeholder="Description" rows={3} className="md:col-span-2 w-full px-4 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            {sectionKey === 'languages' && (
                              <div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {formData.languages.map((lang) => (
                                    <span key={lang.id} className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                      {lang.name}
                                      <button onClick={() => removeGenericItem('languages', lang.id)} className="ml-2 text-blue-600 hover:text-blue-800">×</button>
                                    </span>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <input type="text" value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addLanguage()} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg" placeholder="Add a language..." />
                                  <button onClick={addLanguage} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
                                </div>
                              </div>
                            )}
                            {sectionKey === 'hobbies' && (
                              <div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {formData.hobbies.map((hobby) => (
                                    <span key={hobby.id} className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                      {hobby.name}
                                      <button onClick={() => removeGenericItem('hobbies', hobby.id)} className="ml-2 text-blue-600 hover:text-blue-800">×</button>
                                    </span>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <input type="text" value={newHobby} onChange={(e) => setNewHobby(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addHobby()} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg" placeholder="Add a hobby..." />
                                  <button onClick={addHobby} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
                                </div>
                              </div>
                            )}
                          </ResumeSection>
                        ))}
                  </SortableContext>
                </DndContext>
                </div>
              </div>

              {/* Right Column: Live Preview */}
              <div className="bg-white rounded-xl shadow-sm border" style={{ minHeight: 'auto', height: 'auto' }}>
                <div className="bg-blue-50 px-2 py-1 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-blue-600 rounded-lg">
                        <Eye className="w-4 h-4 text-white" />
                        </div>
                        <div>
                        <h3 className="text-base font-semibold text-gray-900">Live Preview</h3>
                        <p className="text-xs text-gray-500">
                          {hasUserData() ? 'Real-time updates' : 'Sample data shown'}
                        </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowFullPreview(true)}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-xs"
                        >
                        <Eye className="w-3 h-3" />
                          Full Screen
                        </button>
                      <span className="px-2 py-1 bg-white text-gray-700 rounded-lg text-xs font-medium border">
                        {templateConfig[template]?.name || template}
                      </span>
                      </div>
                    </div>
                    
                  {/* Progress Bar */}
                  <div className="mt-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">Progress</span>
                      <span className="text-xs text-gray-500">{resumeProgress}%</span>
                  </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${resumeProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                {/* Preview Content */}
                <div className="p-0" style={{ overflow: 'visible', minHeight: 'auto' }}>
                  
                    <ResumePreview 
                      previewRef={previewRef} 
                      template={template} 
                      formData={formData} 
                      sections={sections}
                      previewMode={previewMode}
                      getSampleData={getSampleData}
                      hasUserData={hasUserData}
                        selectedFont={selectedFont}
                    />
                  
              </div>
            </div>
          </div>
        </div>
        </section>
      </div>

      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          
          <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-7xl h-full max-h-[95vh] flex flex-col overflow-hidden border border-white/30">
            {/* Enhanced Modal Header */}
            <div className="relative flex justify-between items-center border-b border-gray-200/50 p-8 flex-shrink-0 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-sm">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                  <Layout className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Choose Your Resume Template</h2>
                  <p className="text-gray-600 mt-2 text-base">Select from our collection of extraordinary ATS-friendly professional templates</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTemplateSelector(false)} 
                className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100/80 transition-all duration-300 hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <TemplateSelector
                selectedTemplate={template}
                formData={formData}
                onSelectTemplate={(templateId) => {
                  console.log('=== TEMPLATE SELECTION DEBUG ===');
                  console.log('Selected template ID:', templateId);
                  console.log('Template config:', templateConfig[templateId]);
                  console.log('Template name:', templateConfig[templateId]?.name);
                  setTemplate(templateId);
                  setShowTemplateSelector(false);
                  toast.success(`Switched to ${templateConfig[templateId]?.name} template`);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Full Resume Preview</h2>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                  {templateConfig[template]?.name || 'Classic'} Template
                </div>
                <button
                  onClick={() => setShowFullPreview(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
              <div className="bg-white shadow-lg rounded-lg overflow-hidden max-w-3xl mx-auto">
                <ResumePreview 
                  previewRef={previewRef} 
                  template={template} 
                  formData={formData} 
                  sections={sections}
                  previewMode={previewMode}
                  getSampleData={getSampleData}
                  hasUserData={hasUserData}
                  selectedFont={selectedFont}
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                {previewMode && !hasUserData() 
                  ? 'This is a preview with sample data. Start entering your information to see your actual resume.' 
                  : 'This is your live resume preview.'
                }
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (!hasPaidForTegaExam) {
                      toast.error('Please pay for Tega exam to access this resource');
                      return;
                    }
                    downloadPdf();
                  }}
                  disabled={isExporting || isCheckingPayment || !hasPaidForTegaExam}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors duration-200 relative group ${
                    hasPaidForTegaExam 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700' 
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  } ${isExporting || isCheckingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={!hasPaidForTegaExam ? 'Pay for Tega exam to access this resource' : ''}
                >
                  <Download className="w-5 h-5" />
                  {isCheckingPayment ? 'Checking...' : isExporting ? 'Generating...' : '💎 Download Premium PDF'}
                  
                  {/* Hover message for disabled state */}
                  {!hasPaidForTegaExam && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                      Pay for Tega exam to access this resource
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setShowFullPreview(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </UserDashboardLayout>
  );
};


export default ResumeBuilderPage;
