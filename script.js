const sendBtn = document.getElementById('sendBtn');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
const statusDiv = document.getElementById('status');

let lastMessageId = null;

function setStatus(msg, isError = false) {
  statusDiv.textContent = msg;
  statusDiv.style.color = isError ? '#ff5555' : '#55ff55';
}

async function sendMessage() {
  const webhookUrl = document.getElementById('webhookUrl').value.trim();
  const content = document.getElementById('messageContent').value.trim();

  if (!webhookUrl || !content) {
    setStatus('Please enter webhook URL and message content.', true);
    return;
  }

  try {
    const res = await fetch(webhookUrl + '?wait=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      const err = await res.text();
      setStatus(`Failed to send message: ${res.status} ${err}`, true);
      return;
    }

    const data = await res.json();
    lastMessageId = data.id;
    setStatus('Message sent successfully!');
    editBtn.disabled = false;
    deleteBtn.disabled = false;
  } catch (error) {
    setStatus('Error sending message: ' + error.message, true);
  }
}

async function editMessage() {
  const webhookUrl = document.getElementById('webhookUrl').value.trim();
  const newContent = document.getElementById('editContent').value.trim();

  if (!webhookUrl || !newContent) {
    setStatus('Please enter webhook URL and new content.', true);
    return;
  }
  if (!lastMessageId) {
    setStatus('No message to edit.', true);
    return;
  }

  try {
    const editUrl = `${webhookUrl}/messages/${lastMessageId}`;
    const res = await fetch(editUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent }),
    });

    if (!res.ok) {
      const err = await res.text();
      setStatus(`Failed to edit message: ${res.status} ${err}`, true);
      return;
    }

    setStatus('Message edited successfully!');
  } catch (error) {
    setStatus('Error editing message: ' + error.message, true);
  }
}

async function deleteMessage() {
  const webhookUrl = document.getElementById('webhookUrl').value.trim();

  if (!webhookUrl) {
    setStatus('Please enter webhook URL.', true);
    return;
  }
  if (!lastMessageId) {
    setStatus('No message to delete.', true);
    return;
  }

  try {
    const deleteUrl = `${webhookUrl}/messages/${lastMessageId}`;
    const res = await fetch(deleteUrl, {
      method: 'DELETE',
    });

    if (res.status === 204) {
      setStatus('Message deleted successfully!');
      lastMessageId = null;
      editBtn.disabled = true;
      deleteBtn.disabled = true;
    } else {
      const err = await res.text();
      setStatus(`Failed to delete message: ${res.status} ${err}`, true);
    }
  } catch (error) {
    setStatus('Error deleting message: ' + error.message, true);
  }
}

sendBtn.addEventListener('click', sendMessage);
editBtn.addEventListener('click', editMessage);
deleteBtn.addEventListener('click', deleteMessage);
