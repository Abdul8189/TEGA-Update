import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

const ResumeSection = ({ id, sectionDetails, children }) => {
  const Icon = sectionDetails.icon;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-gray-200 rounded-lg p-6 mb-4 bg-white transition-shadow ${isDragging ? 'shadow-2xl opacity-50' : 'shadow-md'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab mr-4 text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            {Icon && <Icon className="w-6 h-6 mr-3 text-blue-600" />}
            {sectionDetails.title}
          </h2>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default ResumeSection;
