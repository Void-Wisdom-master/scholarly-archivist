const API_BASE = 'http://localhost:3001/api';
const TEST_NOTEBOOK_ID = '758302c3-8b3d-497a-b0f1-f6f4eece7f82'; // Valid notebook ID for testing

async function testUpload() {
  console.log('--- Starting Upload Test ---');
  
  const formData = new FormData();
  formData.append('notebookId', TEST_NOTEBOOK_ID);
  formData.append('title', 'test_parsing.md');
  formData.append('type', 'Markdown');
  formData.append('icon', 'notes');
  
  const blob = new Blob(['# 研史明智研究报告\n这是一个测试文档'], { type: 'text/markdown' });
  formData.append('file', blob, 'test_parsing.md');

  try {
    const response = await fetch(`${API_BASE}/sources`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    console.log('Upload Status:', response.status);
    // console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('Summary:', data.data.summary || ' (None - Generation might have failed or skip)');
      console.log('Content Text length:', data.data.contentText?.length || 0);

      const sourceId = data.data.id;
      console.log('\n--- Starting Delete Test ---');
      const deleteRes = await fetch(`${API_BASE}/sources/${sourceId}`, {
        method: 'DELETE',
      });
      const deleteData = await deleteRes.json();
      console.log('Delete Status:', deleteRes.status);
    } else {
      console.error('Upload failed:', data.message);
    }

  } catch (err) {
    console.error('Test Failed:', err.message);
  }
}

testUpload();
