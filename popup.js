document.getElementById('saveBtn').addEventListener('click', () => {
  let sessionName = document.getElementById('sessionName').value;
  if (sessionName) {
    chrome.storage.local.get('sessions', (data) => {
      let sessions = data.sessions || [];
      let sessionExists = sessions.some(session => session.name === sessionName);

      if (sessionExists) {
        alert('Session name already exists. Please choose a different name.');
      } else {
        chrome.runtime.sendMessage({ action: 'save', sessionName }, (response) => {
          console.log(response.status);
          loadSessions();
        });
      }
    });
  } else {
    alert('Please enter a session name.');
  }
});

function loadSessions() {
  chrome.runtime.sendMessage({ action: 'getSessions' }, (response) => {
    let sessionsList = document.getElementById('sessionsList');
    sessionsList.innerHTML = '';
    if (response.sessions && response.sessions.length > 0) {
      response.sessions.forEach((session, index) => {
        let listItem = document.createElement('li');
        let sessionSpan = document.createElement('span');
        sessionSpan.textContent = session.name;
        sessionSpan.addEventListener('click', () => restoreSession(session.tabs));
        
        let deleteBtn = document.createElement('button');
        let deleteIcon = document.createElement('img');
        deleteIcon.src = 'images/trash_icon.png'; 
        deleteBtn.appendChild(deleteIcon);
        deleteBtn.addEventListener('click', () => deleteSession(index));
        
        listItem.appendChild(sessionSpan);
        listItem.appendChild(deleteBtn);
        sessionsList.appendChild(listItem);
      });
    } else {
      sessionsList.innerHTML = '<li>No sessions saved.</li>';
    }
  });
}

function restoreSession(tabs) {
  chrome.runtime.sendMessage({ action: 'restore', sessionTabs: tabs }, (response) => {
    console.log(response.status);
  });
}

function deleteSession(index) {
  chrome.storage.local.get('sessions', (data) => {
    let sessions = data.sessions || [];
    sessions.splice(index, 1);
    chrome.storage.local.set({ sessions }, () => {
      loadSessions();
    });
  });
}

loadSessions();
