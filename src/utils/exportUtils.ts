export const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportMeetingData = async (meetingId: string) => {
  // This would fetch data from Supabase and create export files
  const transcripts = [
    { speaker: 'John Doe', timestamp: '10:00', content: 'Let me start by reviewing our Q4 objectives...' },
    { speaker: 'Jane Smith', timestamp: '10:02', content: 'I agree with the proposed timeline.' },
    { speaker: 'John Doe', timestamp: '10:05', content: 'We need to prioritize the customer feedback integration.' }
  ];

  const actionItems = [
    { title: 'Review customer feedback integration', assignee: 'Jane Smith', dueDate: '2024-02-15', status: 'pending' },
    { title: 'Prepare Q1 budget proposal', assignee: 'John Doe', dueDate: '2024-02-10', status: 'in-progress' },
    { title: 'Schedule follow-up meeting', assignee: 'Team Lead', dueDate: '2024-02-08', status: 'completed' }
  ];

  const mindMapData = {
    centralTopic: 'Q4 Planning Meeting',
    nodes: [
      { id: '1', text: 'Budget Planning', x: 100, y: 100 },
      { id: '2', text: 'Customer Feedback', x: 200, y: 150 },
      { id: '3', text: 'Timeline Review', x: 150, y: 200 }
    ]
  };

  // Create transcript file
  const transcriptContent = transcripts.map(t => 
    `[${t.timestamp}] ${t.speaker}: ${t.content}`
  ).join('\n\n');
  downloadFile(transcriptContent, `meeting-transcript-${meetingId}.txt`);

  // Create action items file
  const actionItemsContent = actionItems.map(item =>
    `□ ${item.title}\n  Assigned to: ${item.assignee}\n  Due: ${item.dueDate}\n  Status: ${item.status}\n`
  ).join('\n');
  downloadFile(actionItemsContent, `action-items-${meetingId}.txt`);

  // Create mind map file
  const mindMapContent = JSON.stringify(mindMapData, null, 2);
  downloadFile(mindMapContent, `mind-map-${meetingId}.json`, 'application/json');
};