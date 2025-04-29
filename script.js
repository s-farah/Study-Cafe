function showTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab');
  
    tabs.forEach(tab => tab.style.display = 'none');
    buttons.forEach(btn => btn.classList.remove('active'));
  
    document.getElementById(tabId).style.display = 'block';
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    // how the journal works
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
  
    // how pomodoro works
    const timerDisplay = document.getElementById('timer');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const setDurationsBtn = document.getElementById('set-durations-btn');
    const workInput = document.getElementById('work-duration');
    const breakInput = document.getElementById('break-duration');
    const longBreakInput = document.getElementById('long-break-duration');
    const sessionType = document.getElementById('session-type');
  
    let timerInterval = null;
    let isWork = true;
    let sessionCount = 0;
    let durations = {
      work: 25 * 60,
      break: 5 * 60,
      longBreak: 15 * 60
    };
    let timeLeft = durations.work;
  
    function updateTimerDisplay() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  
    setDurationsBtn.addEventListener('click', () => {
      durations.work = (parseInt(workInput.value) || 25) * 60;
      durations.break = (parseInt(breakInput.value) || 5) * 60;
      durations.longBreak = (parseInt(longBreakInput.value) || 15) * 60;
      resetTimer(); // reset after the duration
    });
  
    function startTimer() {
      if (timerInterval) return; 
  
      timerInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updateTimerDisplay();
        } else {
          clearInterval(timerInterval);
          timerInterval = null;
          sessionCount++;
  
          if (sessionCount % 8 === 0) {
            timeLeft = durations.longBreak;
            sessionType.textContent = "Long Break 🌟";
            isWork = false;
          } else if (isWork) {
            timeLeft = durations.break;
            sessionType.textContent = "Break ☕";
            isWork = false;
          } else {
            timeLeft = durations.work;
            sessionType.textContent = `Session ${Math.floor(sessionCount / 2) + 1}`;
            isWork = true;
          }
  
          updateTimerDisplay();
          startTimer();
        }
      }, 1000);
    }
  
    function pauseTimer() {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  
    function resetTimer() {
      pauseTimer();
      timeLeft = durations.work;
      sessionType.textContent = "Session 1";
      sessionCount = 0;
      isWork = true;
      updateTimerDisplay();
    }
  
    startBtn.addEventListener('click', () => {
      pauseTimer();
      timeLeft = isWork ? durations.work : durations.break;
      updateTimerDisplay();
      startTimer();
    });
  
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
  
    updateTimerDisplay();
    
    // duration animation?
    const toggleSettingsBtn = document.getElementById('toggle-settings-btn');
    const durationSettings = document.getElementById('duration-settings');

    toggleSettingsBtn.addEventListener('click', () => {
    durationSettings.classList.toggle('show-settings');
});

});
  