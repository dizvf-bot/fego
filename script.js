    document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const menuBtn = document.getElementById('menu-btn');
  const menuDropdown = document.getElementById('menu-dropdown');
  const uploadBtn = document.getElementById('upload-btn');
  const screenShareBtn = document.getElementById('screen-share-btn');
  const cameraShareBtn = document.getElementById('camera-share-btn');
  const stopBtn = document.getElementById('stop-btn');
  const videoPlayer = document.getElementById('video-player');
  const videoPlaceholder = document.getElementById('video-placeholder');
  const videoTitle = document.getElementById('video-title');
  const viewCount = document.getElementById('view-count');
  const coinCount = document.getElementById('coin-count');
  const streamIndicator = document.getElementById('stream-indicator');
  const uploadModal = document.getElementById('upload-modal');
  const closeModal = document.querySelector('.close');
  const uploadForm = document.getElementById('upload-form');
  const videoTitleInput = document.getElementById('video-title-input');
  const videoFileInput = document.getElementById('video-file');
  const hiddenFileInput = document.getElementById('hidden-file-input');
  const chatMessages = document.getElementById('chat-messages');
  const chatRateSlider = document.getElementById('chat-rate');
  const chatRateValue = document.getElementById('chat-rate-value');
  const popoutChatBtn = document.getElementById('popout-chat-btn');
  const mainChatContainer = document.getElementById('main-chat-container');
  const themeToggleBtn = document.getElementById('theme-toggle');

  // State
  let isScreenSharing = false;
  let isCameraSharing = false;
  let isPlaying = false;
  let chatInterval;
  let chatRate = 5; // Default rate (messages per minute)
  let viewerCount = 0;
  let totalCoins = 0;
  let isPoppedOut = false;
  let poppedOutWindow = null;
  let usedNames = new Set(); // Keep track of used names
  let videoFrameCanvas = document.createElement('canvas');
  let videoFrameContext = videoFrameCanvas.getContext('2d');
  let lastAnalysisTime = 0;
  let analysisInterval = 10000; // Analyze video every 10 seconds
  let videoAnalysisInterval;
  let isDarkMode = localStorage.getItem('darkMode') === 'true';
  let isMenuOpen = false;

  // Gemini API configuration
  const GEMINI_API_KEY = 'AIzaSyDzEOzLmoojB88PUwpXfGN4_IE1hFJqTDQ';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  // Apply dark mode on load if it's saved in localStorage
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    updateThemeToggleIcon();
  }

  // Response templates based on what the AI identifies
  const responseTemplates = {
    // Objects and items
    computer: ["Nice setup!", "That computer looks powerful!", "Sweet tech setup there!", "Love that setup!"],
    phone: ["Is that the new phone?", "Nice phone!", "That phone camera quality looks great!"],
    game: ["What game is that?", "This game looks fun!", "I love this game!", "Never played this one before!"],
    code: ["Nice code!", "That's some clean coding!", "Programming stream! Love it!", "What language is that?"],
    browser: ["Which browser do you prefer?", "Browser looks clean!", "Nice browser setup!"],
    music: ["Great music choice!", "This song is fire!", "Love this track!", "What's this song?"],
    
    // Actions
    typing: ["Fast typing!", "Those fingers are flying!", "Speed typing master!", "Impressive typing speed!"],
    clicking: ["Nice clicks!", "Smooth navigation!", "Quick with the mouse!", "Good mouse control!"],
    scrolling: ["Scrolling through like a pro!", "Fast scrolling!", "Smooth scrolling there!"],
    streaming: ["Stream quality is great!", "This stream is smooth!", "Great stream setup!", "Professional streaming!"],
    gaming: ["Nice gameplay!", "Good moves!", "That was smooth!", "Great gaming skills!"],
    coding: ["Clean code!", "Nice programming!", "That logic looks solid!", "Good coding style!"],
    
    // Screen/Interface elements
    screen: ["Screen looks crisp!", "Nice display quality!", "Clear screen!", "Good resolution!"],
    window: ["Clean window layout!", "Nice window management!", "Organized desktop!", "Tidy workspace!"],
    menu: ["Nice menu navigation!", "Smooth menu usage!", "Good interface!", "Clean UI!"],
    chat: ["Chat is active!", "Love the interaction!", "Great community!", "Active chat today!"],
    
    // Colors (simplified responses)
    blue: ["Love the blue theme!", "Blue looks clean!", "Nice blue colors!", "Blue is my favorite!"],
    red: ["That red pops!", "Red looks great!", "Nice red accent!", "Bold red choice!"],
    green: ["Green looks fresh!", "Love the green!", "Nice green theme!", "Green is calming!"],
    purple: ["Purple looks royal!", "Love that purple!", "Nice purple theme!", "Purple is cool!"],
    
    // Moods/Atmosphere
    professional: ["Very professional!", "Clean and professional!", "Business vibes!", "Professional setup!"],
    casual: ["Chill vibes!", "Relaxed atmosphere!", "Casual and cool!", "Nice and easy!"],
    technical: ["Tech vibes!", "Getting technical!", "Nerdy and I love it!", "Tech stuff is cool!"],
    creative: ["Creative energy!", "Artistic vibes!", "Love the creativity!", "So creative!"],
    
    // Fallback responses for unknown items
    default: [
      "Interesting!", "Cool stuff!", "Nice!", "That's neat!", "Looking good!",
      "I see that!", "Neat setup!", "Nice work!", "That's cool!", "Interesting choice!",
      "Good stuff!", "That looks good!", "Nice touch!", "Cool feature!", "That's handy!"
    ]
  };

  // Chat usernames and profile pictures
  const chatUsernames = [
    'GamerPro99', 'PixelWarrior', 'StreamQueen', 'NightOwlGaming', 'EpicViewerXX',
    'SilverArrow', 'CosmicGamer', 'MoonlightPlayer', 'SunriseStreamer', 'StardustViewer',
    'TechSavvy', 'GameMaster64', 'DigitalNomad', 'CyberNinja', 'ElectricDreamer',
    'PhoenixRising', 'OceanWave', 'MountainClimber', 'DesertWanderer', 'ForestExplorer',
    'CrystalCollector', 'EmberFlame', 'FrostBite', 'ThunderStrike', 'WindWhisperer',
    'EarthShaker', 'WaterBender', 'FireBreather', 'AirGlider', 'MetalForger',
    'CodeBreaker', 'PuzzleSolver', 'StrategyMaster', 'QuestSeeker', 'LoreKeeper',
    'MythHunter', 'LegendTeller', 'StoryWeaver', 'DreamCatcher', 'NightWatcher',
    'DawnBreaker', 'TwilightWalker', 'SunsetGazer', 'MoonlitSky', 'StarryNight'
  ];

  // Chat message templates
  const chatMessageTemplates = [
    "This is so interesting to watch!",
    "I've never seen anything like this before.",
    "Wow, look at that!",
    "What's that in the background?",
    "I wonder what will happen next?",
    "This is great content!",
    "I'm learning so much from this stream.",
    "This is exactly what I was looking for!",
    "The quality of this stream is amazing!",
    "Does anyone else find this fascinating?",
    "I could watch this all day.",
    "This is incredibly well done.",
    "I have a question about what you just showed!",
    "That part was really impressive.",
    "How did you learn to do that?",
    "This is my first time watching your stream, and I'm impressed!",
    "The way you explained that was really clear.",
    "I'm sharing this with my friends right now.",
    "I didn't expect to see that!",
    "Can you go into more detail about that last part?",
    "That's a really unique approach.",
    "I appreciate how thorough this is.",
    "This is much better than other streams I've watched.",
    "Your presentation style is engaging.",
    "I'm taking notes on everything you're showing.",
    "That's a clever solution to that problem.",
    "I never thought of it that way before.",
    "The visuals here are stunning!",
    "You make this look so easy!",
    "That's a helpful tip, thanks for sharing!",
    "I'm definitely coming back for more streams.",
    "This content is so valuable.",
    "You've got a new follower today!",
    "I've been waiting for someone to cover this topic.",
    "The pace of this stream is perfect.",
    "I like how you're explaining as you go.",
    "This is exactly what I needed to see today.",
    "Your passion for this subject really shows.",
    "I'm impressed by your knowledge on this.",
    "Looking forward to your next stream already!"
  ];

  const reactions = [
    "Did you see that? Amazing!",
    "Woah! That just happened!",
    "I'm seeing something right now!",
    "That's incredible technique!",
    "Look at those skills on display!",
    "That's one way to do it!",
    "Never would have thought of that approach!",
    "That's actually genius!",
    "I'm taking notes on that technique.",
    "Mind. Blown.",
    "That's so creative!",
    "That move was perfectly executed!",
    "I need to try that sometime.",
    "What a brilliant solution!",
    "I'm impressed by how smooth that was."
  ];

  const questions = [
    "How long have you been doing this?",
    "What made you start streaming?",
    "Do you have any tips for beginners?",
    "What equipment are you using?",
    "Where did you learn these techniques?",
    "Will you be covering more advanced topics in future streams?",
    "Have you tried the alternative approach?",
    "What's your opinion on the latest developments in this field?",
    "Could you explain that last part again?",
    "Are there any resources you recommend for learning more?",
    "How often do you stream?",
    "What's the biggest challenge you've faced with this?",
    "Do you collaborate with other streamers?",
    "What's your favorite part about streaming?",
    "How do you stay motivated to keep improving?"
  ];

  // Event listeners
  menuBtn.addEventListener('click', toggleMenu);
  uploadBtn.addEventListener('click', openUploadModal);
  screenShareBtn.addEventListener('click', startScreenShare);
  cameraShareBtn.addEventListener('click', startCameraShare);
  stopBtn.addEventListener('click', stopSession);
  closeModal.addEventListener('click', closeUploadModal);
  uploadForm.addEventListener('submit', handleVideoUpload);
  chatRateSlider.addEventListener('input', updateChatRate);
  popoutChatBtn.addEventListener('click', togglePopoutChat);
  themeToggleBtn.addEventListener('click', toggleDarkMode);
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!menuBtn.contains(e.target) && !menuDropdown.contains(e.target)) {
      closeMenu();
    }
  });

  // Menu functions
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
      openMenu();
    } else {
      closeMenu();
    }
  }
  
  function openMenu() {
    isMenuOpen = true;
    menuDropdown.classList.remove('hidden');
    menuBtn.setAttribute('aria-expanded', 'true');
  }
  
  function closeMenu() {
    isMenuOpen = false;
    menuDropdown.classList.add('hidden');
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  // Add new functions for theme toggling
  function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
    updateThemeToggleIcon();
    
    // Update popped out window if it exists
    if (isPoppedOut && poppedOutWindow && !poppedOutWindow.closed) {
      if (isDarkMode) {
        poppedOutWindow.document.body.classList.add('dark-mode');
      } else {
        poppedOutWindow.document.body.classList.remove('dark-mode');
      }
    }
  }
  
  function updateThemeToggleIcon() {
    if (isDarkMode) {
      themeToggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
      themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
    } else {
      themeToggleBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
      themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
    }
  }

  function openUploadModal() {
    uploadModal.style.display = 'block';
  }

  function closeUploadModal() {
    uploadModal.style.display = 'none';
  }

  function handleVideoUpload(e) {
    e.preventDefault();
    const title = videoTitleInput.value;
    const file = videoFileInput.files[0];
    
    if (file) {
      startVideo(file, title);
      closeUploadModal();
      videoTitleInput.value = '';
      videoFileInput.value = '';
    }
  }

  function startVideo(file, title) {
    const videoURL = URL.createObjectURL(file);
    videoPlayer.src = videoURL;
    videoPlayer.style.display = 'block';
    videoPlaceholder.style.display = 'none';
    
    videoTitle.textContent = title || 'Untitled Video';
    videoPlayer.play();
    
    isPlaying = true;
    isScreenSharing = false;
    isCameraSharing = false;
    stopBtn.disabled = false;
    stopBtn.textContent = 'Stop Session';
    
    // Show view count, hide stream indicator
    viewCount.style.display = 'flex';
    streamIndicator.classList.add('hidden');
    
    // Close menu after action
    closeMenu();
    
    // Start generating chat
    startChat();
    startViewerCount();
    
    // Set up video analysis
    setupVideoAnalysis();
  }

  function startScreenShare() {
    if (isPlaying) {
      stopSession();
    }
    
    // Request screen capture
    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
      .then(function(stream) {
        videoPlayer.srcObject = stream;
        videoPlayer.style.display = 'block';
        videoPlaceholder.style.display = 'none';
        
        videoTitle.textContent = 'Screen Sharing';
        videoPlayer.play();
        
        isPlaying = true;
        isScreenSharing = true;
        isCameraSharing = false;
        stopBtn.disabled = false;
        stopBtn.textContent = 'Stop Sharing';
        
        // Hide view count, show stream indicator
        viewCount.style.display = 'none';
        streamIndicator.classList.remove('hidden');
        
        // Close menu after action
        closeMenu();
        
        // Start generating chat
        startChat();
        startViewerCount();
        
        // Set up video analysis
        setupVideoAnalysis();
        
        // Handle stream end (when user stops sharing)
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          stopSession();
        });
      })
      .catch(function(err) {
        console.error('Error accessing screen:', err);
        alert('Could not access screen. Please check your permissions and try again.');
      });
  }

  function startCameraShare() {
    if (isPlaying) {
      stopSession();
    }
    
    // Request camera access
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(function(stream) {
        videoPlayer.srcObject = stream;
        videoPlayer.style.display = 'block';
        videoPlaceholder.style.display = 'none';
        
        videoTitle.textContent = 'Camera Feed';
        videoPlayer.play();
        
        isPlaying = true;
        isScreenSharing = false;
        isCameraSharing = true;
        stopBtn.disabled = false;
        stopBtn.textContent = 'Stop Camera';
        
        // Hide view count, show stream indicator
        viewCount.style.display = 'none';
        streamIndicator.classList.remove('hidden');
        
        // Close menu after action
        closeMenu();
        
        // Start generating chat
        startChat();
        startViewerCount();
        
        // Set up video analysis
        setupVideoAnalysis();
      })
      .catch(function(err) {
        console.error('Error accessing camera:', err);
        alert('Could not access camera. Please check your permissions and try again.');
      });
  }

  function stopSession() {
    // Stop any active streams
    if (videoPlayer.srcObject) {
      const tracks = videoPlayer.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoPlayer.srcObject = null;
    }
    
    // Stop video file playback
    if (videoPlayer.src && !videoPlayer.srcObject) {
      videoPlayer.pause();
      videoPlayer.src = '';
    }
    
    // Reset UI
    videoPlayer.style.display = 'none';
    videoPlaceholder.style.display = 'flex';
    videoTitle.textContent = 'No video playing';
    
    isPlaying = false;
    isScreenSharing = false;
    isCameraSharing = false;
    stopBtn.disabled = true;
    
    // Reset UI elements
    viewCount.style.display = 'flex';
    streamIndicator.classList.add('hidden');
    viewCount.querySelector('span').textContent = '0 viewers';
    coinCount.querySelector('span').textContent = '0 BabaCoins';
    
    // Stop chat and viewer count
    stopChat();
    stopViewerCount();
    
    // Stop video analysis
    if (videoAnalysisInterval) {
      clearInterval(videoAnalysisInterval);
      videoAnalysisInterval = null;
    }
  }

  function startChat() {
    stopChat(); // Clear any existing interval
    
    // Calculate interval based on chat rate (messages per minute)
    const intervalMs = (60 * 1000) / chatRate;
    
    chatInterval = setInterval(generateChatMessage, intervalMs);
    // Generate initial messages right away
    for (let i = 0; i < 3; i++) {
      setTimeout(() => generateChatMessage(), i * 500);
    }

    // Reset BabaCoins counter
    totalCoins = 0;
    updateCoinCount();
  }

  function stopChat() {
    if (chatInterval) {
      clearInterval(chatInterval);
      chatInterval = null;
    }
    
    // Clear chat messages
    chatMessages.innerHTML = '';
  }

  function updateChatRate() {
    chatRate = parseInt(chatRateSlider.value);
    chatRateValue.textContent = chatRate;
    
    if (isPlaying) {
      startChat(); // Restart chat with new rate
    }
  }

  function startViewerCount() {
    // Reset viewer count
    viewerCount = Math.floor(Math.random() * 50) + 10;
    updateViewerCount();
    
    // Simulate viewer count changes
    viewerCountInterval = setInterval(() => {
      const change = Math.floor(Math.random() * 5) - 2; // -2 to +2 viewers
      viewerCount = Math.max(1, viewerCount + change);
      updateViewerCount();
    }, 5000);
  }

  function stopViewerCount() {
    if (viewerCountInterval) {
      clearInterval(viewerCountInterval);
      viewerCountInterval = null;
    }
    
    viewerCount = 0;
    updateViewerCount();
  }

  function updateViewerCount() {
    viewCount.querySelector('span').textContent = `${viewerCount} viewers`;
  }

  function generateChatMessage() {
    // Determine message type with probabilities
    const rand = Math.random();
    let messageType, messageContent;
    
    if (rand < 0.10) { // 10% chance for donation
      messageType = 'donation';
      const amount = Math.floor(Math.random() * 500) + 10; // 10-500 BabaCoins
      messageContent = `Thank you for the content! Keep it up!`;
      const donationAmount = amount;
      totalCoins += donationAmount;
      updateCoinCount();
    } else if (rand < 0.30) { // 20% chance for question
      messageType = 'question';
      messageContent = questions[Math.floor(Math.random() * questions.length)];
    } else if (rand < 0.50) { // 20% chance for reaction
      messageType = 'reaction';
      messageContent = reactions[Math.floor(Math.random() * reactions.length)];
    } else { // 50% chance for regular message
      messageType = 'regular';
      messageContent = chatMessageTemplates[Math.floor(Math.random() * chatMessageTemplates.<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fego Streaming</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary-color: #7c3aed;
  --primary-hover: #6d28d9;
  --secondary-color: #a855f7;
  --accent-color: #06b6d4;
  --success-color: #10b981;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  
  /* Neutral colors */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
  --gradient-secondary: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  --gradient-accent: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  /* Borders */
  --border-radius-sm: 0.375rem;
  --border-radius: 0.5rem;
  --border-radius-md: 0.75rem;
  --border-radius-lg: 1rem;
  --border-radius-xl: 1.5rem;
  
  /* Light mode variables */
  --bg-color: #ffffff;
  --bg-secondary: var(--gray-50);
  --text-color: var(--gray-900);
  --text-secondary: var(--gray-600);
  --text-muted: var(--gray-500);
  --border-color: var(--gray-200);
  --card-bg: #ffffff;
  --chat-bg: #ffffff;
  --placeholder-bg: var(--gray-100);
  --placeholder-text: var(--gray-500);
  --input-bg: #ffffff;
  --hover-bg: var(--gray-50);
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: var(--text-color);
  line-height: 1.6;
  min-height: 100vh;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
}

/* Dark mode */
body.dark-mode {
  --bg-color: #0f0f23;
  --bg-secondary: #1a1a2e;
  --text-color: #e2e8f0;
  --text-secondary: #cbd5e0;
  --text-muted: #a0aec0;
  --border-color: #2d3748;
  --card-bg: #16213e;
  --chat-bg: #0f3460;
  --placeholder-bg: #2d3748;
  --placeholder-text: #718096;
  --input-bg: #1a202c;
  --hover-bg: #2d3748;
  background: linear-gradient(135deg, #0f0f23 0%, #16213e 50%, #0f3460 100%);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius-lg);
  padding: 1.5rem 2rem;
  box-shadow: var(--shadow-lg);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.025em;
}

nav {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  position: relative;
}

/* Menu button and dropdown */
.menu-container {
  position: relative;
  display: inline-block;
}

.menu-btn {
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  box-shadow: var(--shadow);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.menu-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.menu-btn:active {
  transform: translateY(0);
  box-shadow: var(--shadow);
}

.menu-btn svg {
  width: 1rem;
  height: 1rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-btn[aria-expanded="true"] svg {
  transform: rotate(180deg);
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 200px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  z-index: 1000;
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.menu-dropdown:not(.hidden) {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.menu-dropdown::before {
  content: '';
  position: absolute;
  top: -6px;
  right: 1rem;
  width: 12px;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: none;
  border-right: none;
  transform: rotate(45deg);
  border-radius: 2px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  color: var(--text-color);
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0;
}

.menu-item:first-child {
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--primary-color);
  transform: translateX(4px);
}

.menu-item:active {
  background: rgba(255, 255, 255, 0.15);
}

.menu-item svg {
  width: 1.125rem;
  height: 1.125rem;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.menu-item:hover svg {
  opacity: 1;
}

/* Separator line between menu items */
.menu-item:not(:last-child)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 1.25rem;
  right: 1.25rem;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
}

/* Dark mode specific adjustments */
body.dark-mode .menu-dropdown {
  background: rgba(15, 15, 35, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

body.dark-mode .menu-dropdown::before {
  background: rgba(15, 15, 35, 0.9);
  border-color: rgba(255, 255, 255, 0.1);
}

body.dark-mode .menu-item:hover {
  background: rgba(124, 58, 237, 0.2);
  color: var(--secondary-color);
}

body.dark-mode .menu-item:active {
  background: rgba(124, 58, 237, 0.3);
}

/* Enhanced menu item icons for different actions */
.menu-item.upload-action svg {
  color: var(--accent-color);
}

.menu-item.screen-share-action svg {
  color: var(--success-color);
}

.menu-item.camera-action svg {
  color: var(--warning-color);
}

/* Subtle glow effect on menu hover */
.menu-dropdown:hover {
  box-shadow: var(--shadow-xl), 0 0 20px rgba(124, 58, 237, 0.1);
}

body.dark-mode .menu-dropdown:hover {
  box-shadow: var(--shadow-xl), 0 0 30px rgba(124, 58, 237, 0.2);
}

/* Enhanced button styles */
button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  box-shadow: var(--shadow);
}

button:not(:disabled) {
  background: var(--gradient-primary);
  color: white;
}

button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

button:not(:disabled):active {
  transform: translateY(0);
  box-shadow: var(--shadow);
}

button:disabled {
  background-color: var(--gray-300);
  color: var(--gray-500);
  cursor: not-allowed;
  box-shadow: none;
}

body.dark-mode button:disabled {
  background-color: var(--gray-700);
  color: var(--gray-500);
}

/* Theme toggle button */
.theme-toggle {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--text-color);
  padding: 0.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow);
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(180deg);
}

.theme-toggle svg {
  width: 1.25rem;
  height: 1.25rem;
}

main {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

/* Video section with glassmorphism */
.video-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-xl);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-section:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}

.video-container {
  position: relative;
  overflow: hidden;
}

#video-placeholder {
  height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, var(--gray-100) 0%, var(--gray-200) 100%);
  color: var(--text-muted);
  text-align: center;
  padding: 3rem;
  position: relative;
}

body.dark-mode #video-placeholder {
  background: linear-gradient(135deg, var(--gray-800) 0%, var(--gray-700) 100%);
}

#video-placeholder::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(124, 58, 237, 0.1) 0%, transparent 70%);
}

#video-placeholder > * {
  position: relative;
  z-index: 1;
}

#video-player {
  width: 100%;
  display: none;
  background-color: #000;
  height: 450px;
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
}

.video-info {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.05);
}

.video-stats {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

#view-count, #coin-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  backdrop-filter: blur(10px);
}

#stream-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--danger-color);
  font-weight: 600;
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--border-radius);
  backdrop-filter: blur(10px);
}

#stream-indicator.hidden {
  display: none;
}

.pulse {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: var(--danger-color);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.video-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
}

.chat-rate-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--border-radius);
  backdrop-filter: blur(10px);
}

/* Enhanced chat section */
.chat-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  height: 600px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-section:hover {
  transform: translateY(-4px);
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}

.chat-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
}

.chat-header h3 {
  font-weight: 600;
  color: var(--text-color);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(124, 58, 237, 0.3) transparent;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(124, 58, 237, 0.3);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(124, 58, 237, 0.5);
}

.chat-message {
  margin-bottom: 1rem;
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-message:hover {
  background: rgba(255, 255, 255, 0.05);
}

.chat-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  margin-right: 0.75rem;
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.chat-avatar img, .chat-avatar svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chat-content {
  flex: 1;
  min-width: 0;
}

.chat-username {
  font-weight: 600;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-right: 0.5rem;
}

.chat-donation {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: var(--border-radius);
  padding: 0.75rem;
  margin-top: 0.5rem;
  backdrop-filter: blur(10px);
}

.donation-amount {
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.chat-input {
  display: flex;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0 0 var(--border-radius-xl) var(--border-radius-xl);
}

.chat-input input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius) 0 0 var(--border-radius);
  outline: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.chat-input input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.chat-input button {
  border-radius: 0 var(--border-radius) var(--border-radius) 0;
  padding: 0.75rem 1rem;
  margin: 0;
}

/* Enhanced modal */
.modal {
  display: none;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin: 10% auto;
  padding: 2rem;
  border-radius: var(--border-radius-xl);
  width: 500px;
  max-width: 90%;
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.close {
  color: var(--text-muted);
  float: right;
  font-size: 1.75rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--border-radius);
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-color);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.hidden {
  display: none;
}

/* Enhanced responsive design */
@media (max-width: 1024px) {
  main {
    grid-template-columns: 1fr;
  }
  
  .chat-section {
    height: 400px;
  }
  
  .container {
    padding: 1.5rem;
  }
}

@media (max-width: 768px) {
  header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  nav {
    width: 100%;
    justify-content: space-between;
  }
  
  #video-player, #video-placeholder {
    height: 250px;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  .container {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .video-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .chat-rate-control {
    justify-content: space-between;
  }
  
  nav {
    flex-direction: column;
    gap: 0.5rem;
  }
}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="8" fill="#7c3aed"/>
          <path d="M28 16.5L25 13H15L12 16.5V27H17V30L20 27H24L28 23V16.5ZM26 22L23 25H19L16 28V25H13V17.5L15 15H25L26 16.5V22Z" fill="white"/>
          <path d="M24 18H22V22H24V18Z" fill="white"/>
          <path d="M19 18H17V22H19V18Z" fill="white"/>
        </svg>
        <h1>Fego Streaming</h1>
      </div>
      <nav>
        <button id="theme-toggle" class="theme-toggle" title="Switch to Dark Mode">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
        
        <div class="menu-container">
          <button id="menu-btn" class="menu-btn" aria-expanded="false">
            <span>Menu</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6,9 12,15 18,9"></polyline>
