import React from 'react';

const MetadataComponent = ({ completedBy, completedAt }) => (
  <div className="metadata">
    <p><strong>Completed By:</strong> {completedBy}</p>
    <p><strong>Completed At:</strong> {completedAt}</p>
  </div>
);

export default MetadataComponent;
