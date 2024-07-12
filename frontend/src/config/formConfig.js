// src/config/formConfig.js
const formConfig = {
    'Drill - Fire': {
      fields: [
        { label: 'Date of Drill', key: 'dateOfDrill', type: 'date' },
        { label: 'Type', key: 'type', type: 'select', options: ['Exercise', 'Training'] },
        { label: 'Details of Drill', key: 'details', type: 'textarea' },
        { label: 'Areas for Improvement', key: 'improvements', type: 'textarea' },
      ],
      requiresSignature: true,
    },
    'Master\'s Annual Review': {
      fields: [
        { label: 'Date of Review', key: 'dateOfReview', type: 'date' },
        { label: 'Reviewed By', key: 'reviewedBy', type: 'text' },
        { label: 'Comments', key: 'comments', type: 'textarea' },
      ],
      requiresSignature: true,
    },
    'Familiarization - General': {
      fields: [
        { label: 'Date of Familiarization', key: 'dateOfFamiliarization', type: 'date' },
        { label: 'Conducted By', key: 'conductedBy', type: 'text' },
        { label: 'Details', key: 'details', type: 'textarea' },
      ],
      requiresSignature: true,
    },
    'New Crew Checklist': {
      fields: [
        { label: 'Date of Checklist', key: 'dateOfChecklist', type: 'date' },
        { label: 'Checked By', key: 'checkedBy', type: 'text' },
        { label: 'Items Covered', key: 'itemsCovered', type: 'textarea' },
      ],
      requiresSignature: true,
    },
    // Add other forms here
  };
  
  export default formConfig;
  