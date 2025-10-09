import { ClassicTemplate, ModernTemplate, ProfessionalTemplate, MinimalTemplate, SimpleTemplate, BoldTemplate, CleanTemplate, TechnicalTemplate, ElegantTemplate, ExecutiveTemplate, CreativeTemplate, ContemporaryTemplate, TraditionalTemplate, ChronologicalTemplate, FunctionalTemplate, CompactTemplate, ATSClassicTemplate, ATSModernTemplate, ATSProfessionalTemplate, ATSSimpleTemplate, ATSTechnicalTemplate, ATSITTemplate, ATSEngineeringTemplate, TechnicalFresherTemplate, CSFresherTemplate, ITFresherTemplate } from './templates';
import { templatePreviews } from './previewImages/templatePreviews';

const templateConfig = {
  // Fresher-Focused Templates (Primary)
  technicalfresher: {
    name: 'Technical Fresher',
    component: TechnicalFresherTemplate,
    thumbnail: templatePreviews.technical,
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    colorName: 'Blue',
    description: 'Perfect for CS/IT graduates with projects and internships'
  },
  csfresher: {
    name: 'CS Fresher',
    component: CSFresherTemplate,
    thumbnail: templatePreviews.modern,
    primaryColor: '#059669',
    secondaryColor: '#6b7280',
    colorName: 'Green',
    description: 'Ideal for Computer Science graduates with strong project portfolio'
  },
  itfresher: {
    name: 'IT Fresher',
    component: ITFresherTemplate,
    thumbnail: templatePreviews.professional,
    primaryColor: '#ea580c',
    secondaryColor: '#6b7280',
    colorName: 'Orange',
    description: 'Designed for IT graduates with system admin and networking skills'
  },
  
  // ATS-Optimized Templates for Freshers
  atstechnical: {
    name: 'ATS Technical',
    component: ATSTechnicalTemplate,
    thumbnail: templatePreviews.technical,
    primaryColor: '#374151',
    secondaryColor: '#9ca3af',
    colorName: 'Gray',
    description: 'ATS-friendly template for technical roles'
  },
  atsit: {
    name: 'ATS IT',
    component: ATSITTemplate,
    thumbnail: templatePreviews.professional,
    primaryColor: '#1f2937',
    secondaryColor: '#9ca3af',
    colorName: 'Dark Gray',
    description: 'ATS-optimized for IT support and system admin roles'
  },
  atsengineering: {
    name: 'ATS Engineering',
    component: ATSEngineeringTemplate,
    thumbnail: templatePreviews.classic,
    primaryColor: '#1e40af',
    secondaryColor: '#9ca3af',
    colorName: 'Blue',
    description: 'ATS-friendly for engineering positions'
  },
  
  // Clean Professional Templates
  classic: {
    name: 'Classic',
    component: ClassicTemplate,
    thumbnail: templatePreviews.classic,
    primaryColor: '#2c3e50',
    secondaryColor: '#7f8c8d',
    colorName: 'Dark Blue',
    description: 'Traditional and professional layout'
  },
  modern: {
    name: 'Modern',
    component: ModernTemplate,
    thumbnail: templatePreviews.modern,
    primaryColor: '#3498db',
    secondaryColor: '#95a5a6',
    colorName: 'Blue',
    description: 'Contemporary design with clean aesthetics'
  },
  minimal: {
    name: 'Minimal',
    component: MinimalTemplate,
    thumbnail: templatePreviews.minimal,
    primaryColor: '#000000',
    secondaryColor: '#666666',
    colorName: 'Black',
    description: 'Clean and minimalist design'
  },
  simple: {
    name: 'Simple',
    component: SimpleTemplate,
    thumbnail: templatePreviews.simple,
    primaryColor: '#4a5568',
    secondaryColor: '#a0aec0',
    colorName: 'Gray',
    description: 'Straightforward and easy to read'
  },
  
  // Additional Professional Templates
  professional: {
    name: 'Professional',
    component: ProfessionalTemplate,
    thumbnail: templatePreviews.professional,
    primaryColor: '#2c3e50',
    secondaryColor: '#7f8c8d',
    colorName: 'Dark Blue',
    description: 'Professional layout suitable for various roles'
  },
  bold: {
    name: 'Bold',
    component: BoldTemplate,
    thumbnail: templatePreviews.bold,
    primaryColor: '#2d3748',
    secondaryColor: '#718096',
    colorName: 'Dark Gray',
    description: 'Bold design with strong visual impact'
  },
  clean: {
    name: 'Clean',
    component: CleanTemplate,
    thumbnail: templatePreviews.clean,
    primaryColor: '#4a5568',
    secondaryColor: '#a0aec0',
    colorName: 'Gray',
    description: 'Clean and organized layout'
  },
  technical: {
    name: 'Technical',
    component: TechnicalTemplate,
    thumbnail: templatePreviews.technical,
    primaryColor: '#2d3748',
    secondaryColor: '#718096',
    colorName: 'Dark Gray',
    description: 'Technical-focused design for engineering roles'
  },
  
  // Additional Professional Templates
  elegant: {
    name: 'Elegant',
    component: ElegantTemplate,
    thumbnail: templatePreviews.elegant,
    primaryColor: '#8b5cf6',
    secondaryColor: '#a78bfa',
    colorName: 'Purple',
    description: 'Elegant and sophisticated design'
  },
  executive: {
    name: 'Executive',
    component: ExecutiveTemplate,
    thumbnail: templatePreviews.executive,
    primaryColor: '#1f2937',
    secondaryColor: '#6b7280',
    colorName: 'Dark Gray',
    description: 'Executive-level professional template'
  },
  creative: {
    name: 'Creative',
    component: CreativeTemplate,
    thumbnail: templatePreviews.creative,
    primaryColor: '#f59e0b',
    secondaryColor: '#fbbf24',
    colorName: 'Orange',
    description: 'Creative and artistic design for creative professionals'
  },
  contemporary: {
    name: 'Contemporary',
    component: ContemporaryTemplate,
    thumbnail: templatePreviews.contemporary,
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    colorName: 'Green',
    description: 'Contemporary and modern design'
  },
  traditional: {
    name: 'Traditional',
    component: TraditionalTemplate,
    thumbnail: templatePreviews.traditional,
    primaryColor: '#7c2d12',
    secondaryColor: '#a16207',
    colorName: 'Brown',
    description: 'Traditional and conservative design'
  },
  chronological: {
    name: 'Chronological',
    component: ChronologicalTemplate,
    thumbnail: templatePreviews.chronological,
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    colorName: 'Blue',
    description: 'Chronological timeline-based layout'
  },
  functional: {
    name: 'Functional',
    component: FunctionalTemplate,
    thumbnail: templatePreviews.functional,
    primaryColor: '#dc2626',
    secondaryColor: '#ef4444',
    colorName: 'Red',
    description: 'Skills-focused functional resume format'
  },
  compact: {
    name: 'Compact',
    component: CompactTemplate,
    thumbnail: templatePreviews.compact,
    primaryColor: '#374151',
    secondaryColor: '#6b7280',
    colorName: 'Gray',
    description: 'Compact design for maximum content density'
  },
  
  // ATS-Optimized Professional Templates
  atsclassic: {
    name: 'ATS Classic',
    component: ATSClassicTemplate,
    thumbnail: templatePreviews.atsclassic,
    primaryColor: '#2c3e50',
    secondaryColor: '#7f8c8d',
    colorName: 'Dark Blue',
    description: 'ATS-friendly classic design'
  },
  atsmodern: {
    name: 'ATS Modern',
    component: ATSModernTemplate,
    thumbnail: templatePreviews.atsmodern,
    primaryColor: '#3498db',
    secondaryColor: '#95a5a6',
    colorName: 'Blue',
    description: 'Modern ATS-optimized template'
  },
  atsprofessional: {
    name: 'ATS Professional',
    component: ATSProfessionalTemplate,
    thumbnail: templatePreviews.atsprofessional,
    primaryColor: '#2c3e50',
    secondaryColor: '#7f8c8d',
    colorName: 'Dark Blue',
    description: 'Professional ATS-friendly layout'
  },
  atssimple: {
    name: 'ATS Simple',
    component: ATSSimpleTemplate,
    thumbnail: templatePreviews.atssimple,
    primaryColor: '#4a5568',
    secondaryColor: '#a0aec0',
    colorName: 'Gray',
    description: 'Simple ATS-optimized design'
  }
};

export default templateConfig;