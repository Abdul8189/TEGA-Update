import Resume from '../models/Resume.js';
import Student from '../models/Student.js';
import Template from '../models/Template.js';
import { buildResumePdf } from '../utils/resumeGenerator.js';

const getResume = async (req, res) => {
  try {
    // Try to find existing resume, but don't require it
    let resume = await Resume.findOne({ student: req.user?.id });
    
    if (!resume) {
      // Return a clean default resume structure
      return res.json({
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
        projects: [],
        skills: [],
        certifications: [],
        achievements: [],
        extraCurricularActivities: [],
        languages: [],
        volunteerExperience: [],
        hobbies: []
      });
    }
    
    res.json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const saveResume = async (req, res) => {
  try {
    console.log('=== RESUME SAVE REQUEST ===');
    console.log('User ID:', req.user?.id);
    console.log('Student ID:', req.studentId);
    console.log('Body keys:', Object.keys(req.body || {}));
    
    const resumeData = req.body;
    const studentId = req.user?.id || req.studentId;

    if (!studentId) {
      console.log('❌ No student ID found in request');
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required - no student ID found' 
      });
    }

    // If we have a user ID, save with it, otherwise save without
    const query = { student: studentId };
    
    // Update or create resume
    const options = { 
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    };
    
    console.log('Saving resume with query:', query);
    console.log('Resume data structure:', {
      personalInfo: !!resumeData.personalInfo,
      experience: resumeData.experience?.length || 0,
      education: resumeData.education?.length || 0,
      projects: resumeData.projects?.length || 0,
      skills: resumeData.skills?.length || 0,
      sections: resumeData.sections?.length || 0,
      template: resumeData.template,
      selectedFont: resumeData.selectedFont
    });
    
    // Clean the data to match schema
    const cleanedData = {
      ...resumeData,
      student: studentId,
      // Ensure arrays are properly formatted with id fields
      experience: (resumeData.experience || []).map((item, index) => ({
        id: item.id || index + 1,
        company: item.company || '',
        position: item.position || '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        current: item.current || false,
        description: item.description || ''
      })),
      education: (resumeData.education || []).map((item, index) => ({
        id: item.id || index + 1,
        institution: item.institution || '',
        degree: item.degree || '',
        field: item.field || '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        current: item.current || false,
        gpa: item.gpa || ''
      })),
      projects: (resumeData.projects || []).map((item, index) => ({
        id: item.id || index + 1,
        name: item.name || '',
        description: item.description || '',
        technologies: item.technologies || '',
        link: item.link || ''
      })),
      skills: (resumeData.skills || []).map((item, index) => ({
        id: item.id || index + 1,
        name: item.name || ''
      })),
      certifications: (resumeData.certifications || []).map((item, index) => ({
        id: item.id || index + 1,
        name: item.name || '',
        issuer: item.issuer || '',
        date: item.date || '',
        link: item.link || ''
      })),
      achievements: (resumeData.achievements || []).map((item, index) => ({
        id: item.id || index + 1,
        title: item.title || '',
        description: item.description || ''
      })),
      extracurricularActivities: (resumeData.extracurricularActivities || []).map((item, index) => ({
        id: item.id || index + 1,
        organization: item.organization || '',
        role: item.role || '',
        description: item.description || ''
      })),
      languages: (resumeData.languages || []).map((item, index) => ({
        id: item.id || index + 1,
        name: item.name || '',
        proficiency: item.proficiency || ''
      })),
      volunteerExperience: (resumeData.volunteerExperience || []).map((item, index) => ({
        id: item.id || index + 1,
        organization: item.organization || '',
        role: item.role || '',
        description: item.description || ''
      })),
      hobbies: (resumeData.hobbies || []).map((item, index) => ({
        id: item.id || index + 1,
        name: item.name || ''
      })),
      sections: resumeData.sections || [],
      // Ensure personalInfo has all required fields
      personalInfo: {
        fullName: resumeData.personalInfo?.fullName || '',
        email: resumeData.personalInfo?.email || '',
        phone: resumeData.personalInfo?.phone || '',
        location: resumeData.personalInfo?.location || '',
        linkedin: resumeData.personalInfo?.linkedin || '',
        summary: resumeData.personalInfo?.summary || '',
        title: resumeData.personalInfo?.title || ''
      }
    };
    
    console.log('Cleaned data keys:', Object.keys(cleanedData));
    
    const updatedResume = await Resume.findOneAndUpdate(
      query,
      cleanedData,
      options
    );

    console.log('✅ Resume saved successfully');
    res.status(200).json({ 
      success: true,
      message: 'Resume saved successfully', 
      resume: updatedResume 
    });
  } catch (error) {
    console.error('❌ Error saving resume:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Error saving resume',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const getTemplates = async (req, res) => {
  try {
    // Get all templates without checking student enrollment
    const allTemplates = await Template.find({}).lean();

    // Process templates for the client
    const templates = allTemplates.map(template => {
      // Ensure template has a URL-friendly name (lowercase, no spaces)
      const templateName = template.name?.toLowerCase().replace(/\s+/g, '-') || 'default';
      
      return {
        ...template,
        id: template._id, // Keep original ID for reference
        name: templateName, // URL-friendly name
        isLocked: false, // All templates are unlocked
        // Ensure we have all required fields with defaults
        isPremium: template.isPremium || false,
        thumbnail: template.thumbnail || '',
        description: template.description || ''
      };
    });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ 
      message: 'Error fetching templates',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const downloadResume = async (req, res) => {
  try {
    const { templateName } = req.params;
    const resumeData = req.body;
    
    console.log('=== RESUME DOWNLOAD REQUEST ===');
    console.log('Template name:', templateName);
    console.log('Resume data keys:', Object.keys(resumeData || {}));
    console.log('Personal info:', resumeData?.personalInfo);
    
    // Validate required data
    if (!resumeData) {
      return res.status(400).json({ 
        success: false,
        message: 'Resume data is required' 
      });
    }

    // Default to classic template if none specified
    const templateToUse = templateName || 'classic';
    console.log('Using template:', templateToUse);
    
    try {
      // Generate PDF with the specified template
      console.log('Generating PDF...');
      const pdfBuffer = await buildResumePdf(resumeData, templateToUse, false);
      console.log('PDF generated successfully, buffer size:', pdfBuffer.length);
      
      // Set response headers for file download
      const filename = `${resumeData.personalInfo?.fullName?.replace(/[^\w\s.-]/gi, '').replace(/\s+/g, '_') || 'resume'}.pdf`;
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      console.log('Sending PDF response...');
      return res.send(pdfBuffer);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Error generating PDF',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } catch (error) {
    console.error('Error in downloadResume:', error);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Server error while generating resume';
    return res.status(statusCode).json({ 
      success: false,
      message: message || 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export {
  getResume,
  saveResume,
  getTemplates,
  downloadResume
};
