function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab');
  
    tabs.forEach(tab => tab.style.display = 'none');
    buttons.forEach(btn => btn.classList.remove('active'));
  
    document.getElementById(tabId).style.display = 'block';
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const addEntryBtn = document.querySelector('.submit-entry');
    const journalTextarea = document.querySelector('.journal-textarea');
    const entriesList = document.getElementById('entries');
    const favoriteEntriesList = document.getElementById('favorite-entries');
  
    function addEntry() {
      const content = journalTextarea.value.trim();
      if (content !== '') {
        const timestamp = new Date().toLocaleString();
        createEntry(content, timestamp, false);
        journalTextarea.value = '';
      }
    }
  
    addEntryBtn.addEventListener('click', addEntry);
  
    journalTextarea.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addEntry();
      }
    });
  
    function createEntry(content, timestamp, isFavorite) {
      const li = document.createElement('li');
      li.className = 'entry';
      if (isFavorite) {
        li.classList.add('favorite');
      }
  
      const entryButtons = document.createElement('div');
      entryButtons.className = 'entry-buttons';
  
      const starBtn = document.createElement('button');
      starBtn.innerHTML = '⭐';
      starBtn.className = 'star-btn';
      if (isFavorite) {
        starBtn.classList.add('starred');
      }
  
      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '❌';
      deleteBtn.className = 'delete-btn';
  
      const dateSpan = document.createElement('span');
      dateSpan.className = 'entry-date';
      dateSpan.textContent = timestamp;
  
      const textP = document.createElement('p');
      textP.textContent = content;
      textP.style.textAlign = 'left';
      textP.style.fontWeight = 'normal';
  
      // clicking star
      starBtn.onclick = () => {
        starBtn.classList.toggle('starred');
  
        if (li.parentElement.id === 'entries') {
          entriesList.removeChild(li);
          favoriteEntriesList.prepend(li);
          li.classList.add('favorite');
        } else {
          favoriteEntriesList.removeChild(li);
          entriesList.prepend(li);
          li.classList.remove('favorite');
        }
      };
  
      deleteBtn.onclick = () => li.remove();
  
      entryButtons.appendChild(starBtn);
      entryButtons.appendChild(deleteBtn);
  
      li.appendChild(entryButtons);
      li.appendChild(dateSpan);
      li.appendChild(textP);
  
      if (isFavorite) {
        favoriteEntriesList.prepend(li);
      } else {
        entriesList.prepend(li);
      }
    }
  });
  