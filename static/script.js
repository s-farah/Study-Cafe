// tab switching
function showTab(tabId) {
  const tabs = document.querySelectorAll('.tab-content');
  const buttons = document.querySelectorAll('.tab');

  tabs.forEach(tab => tab.style.display = 'none');
  buttons.forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabId).style.display = 'block';
  document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
}


document.addEventListener('DOMContentLoaded', () => {
// login and signup
  const loginToggle = document.getElementById('loginToggle');
  const loginPanel = document.getElementById('loginPanel');
  const loginForm = document.getElementById('loginForm');
  const loginTitle = document.getElementById('login-title');
  const errorMessage = document.getElementById('errorMessage');
  const signupForm = document.getElementById('signupForm');
  const showSignupBtn = document.getElementById('showSignup');
  const showLoginBtn = document.getElementById('showLogin');
  const signupMessage = document.getElementById('signupMessage');
  const authContainer = document.getElementById('auth-container');
  const loggedInPanel = document.getElementById('loggedInPanel');
  const loggedInUser = document.getElementById('loggedInUser');
  const logoutBtn = document.getElementById('logoutBtn');

  loginToggle.addEventListener('click', () => {
    loginPanel.classList.toggle('open');
  });

  // submit login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const response = await fetch('/login', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (result.success) {
      loginTitle.textContent = `Hello, ${result.username}`;
      loggedInUser.textContent = result.username;
      authContainer.style.display = 'none';
      loggedInPanel.style.display = 'flex';
      loadEntries();
    } else {
      errorMessage.textContent = 'Invalid username or password.';
    }
  });

  // from login to signup
  showSignupBtn.addEventListener('click', () => {
    loginForm.style.display = 'none';
    signupForm.style.display = 'flex';
    document.getElementById('showSignupSection').style.display = 'none';
  });

  // signup to login
  showLoginBtn.addEventListener('click', () => {
    signupForm.style.display = 'none';
    loginForm.style.display = 'flex';
    document.getElementById('showSignupSection').style.display = 'block';
  });

  // submit signup
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(signupForm);
    const response = await fetch('/register', {
      method: 'POST',
      body: new URLSearchParams({
        username: formData.get('newUsername'),
        password: formData.get('newPassword')
      })
    });

    const result = await response.json();
    if (result.success) {
      signupMessage.textContent = "Account created! Please log in.";
      signupMessage.style.color = "green";
      setTimeout(() => {
        signupForm.style.display = 'none';
        loginForm.style.display = 'flex';
        signupMessage.textContent = '';
      }, 1500);
    } else {
      signupMessage.textContent = result.message || "Error creating account.";
      signupMessage.style.color = "red";
    }
  });

  // logout
  logoutBtn.addEventListener('click', async () => {
    await fetch('/logout');
    location.reload();
  });

  // JOURNAL SECTION!!!
  const addEntryBtn = document.querySelector('.submit-entry');
  const journalTextarea = document.querySelector('.journal-textarea');
  const entriesList = document.getElementById('entries');
  const favoriteEntriesList = document.getElementById('favorite-entries');

  // journal entry
  function createEntry(content, timestamp, isFavorite = false, id = null) {
    const li = document.createElement('li');
    li.className = 'entry';
    if (isFavorite) li.classList.add('favorite');
    li.dataset.id = id;

    const entryButtons = document.createElement('div');
    entryButtons.className = 'entry-buttons';

    const starBtn = document.createElement('button');
    starBtn.innerHTML = '⭐';
    starBtn.className = 'star-btn';

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '❌';
    deleteBtn.className = 'delete-btn';

    const dateSpan = document.createElement('span');
    dateSpan.className = 'entry-date';
    dateSpan.textContent = timestamp;

    const textP = document.createElement('p');
    textP.textContent = content;

    // star btn
    starBtn.onclick = async () => {
      const entryId = li.dataset.id;
      const isNowFavorite = !li.classList.contains('favorite');

      await fetch('/entries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id: entryId, favorite: isNowFavorite ? 1 : 0 })
      });

      starBtn.classList.toggle('starred');
      if (isNowFavorite) {
        entriesList.removeChild(li);
        favoriteEntriesList.prepend(li);
        li.classList.add('favorite');
      } else {
        favoriteEntriesList.removeChild(li);
        entriesList.prepend(li);
        li.classList.remove('favorite');
      }
    };

    // deleting
    deleteBtn.onclick = async () => {
      const entryId = li.dataset.id;

      await fetch('/entries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id: entryId })
      });

      li.remove();
    };

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

  async function addEntry() {
    const content = journalTextarea.value.trim();
    if (content === '') return;

    const timestamp = new Date().toLocaleString();

    const response = await fetch('/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ content, timestamp })
    });

    if (response.ok) {
      const result = await response.json();
      createEntry(content, timestamp, false, result.id || null);
      journalTextarea.value = '';
    } else {
      alert('Failed to save entry.');
    }
  }

  // saving the entries
  async function loadEntries() {
    const response = await fetch('/entries');
    if (response.ok) {
      const entries = await response.json();
      entriesList.innerHTML = '';
      favoriteEntriesList.innerHTML = '';
      entries.forEach(entry => {
        createEntry(entry.content, entry.timestamp, entry.favorite === 1, entry.id);
      });
    }
  }

  if (addEntryBtn && journalTextarea) {
    addEntryBtn.addEventListener('click', addEntry);
    journalTextarea.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addEntry();
      }
    });
  }

  // POMODORO!!!
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
    resetTimer();
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
          sessionType.textContent = "Long Break";
          isWork = false;
        } else if (isWork) {
          timeLeft = durations.break;
          sessionType.textContent = "Break";
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

  const toggleSettingsBtn = document.getElementById('toggle-settings-btn');
  const durationSettings = document.getElementById('duration-settings');

  toggleSettingsBtn.addEventListener('click', () => {
    durationSettings.classList.toggle('show-settings');
  });
});
