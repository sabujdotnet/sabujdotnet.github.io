// PWA Install Prompt Handler
class PWAInstallHandler {
  constructor() {
    this.deferredPrompt = null;
    this.installButton = null;
    this.isInstalled = false;
    
    this.init();
  }
  
  init() {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      this.hideInstallButton();
    }
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallButton();
    });
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.hideInstallButton();
      this.showInstallSuccess();
    });
    
    // Check if the page is loaded in standalone mode
    window.addEventListener('load', () => {
      if (window.navigator.standalone) {
        this.isInstalled = true;
        this.hideInstallButton();
      }
    });
  }
  
  createInstallButton() {
    if (this.installButton) return;
    
    this.installButton = document.createElement('button');
    this.installButton.innerHTML = `
      <i class="fas fa-download"></i>
      Install App
    `;
    this.installButton.className = 'pwa-install-btn btn-success';
    this.installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
      padding: 12px 20px;
      border-radius: 25px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: none;
      font-weight: bold;
      cursor: pointer;
      display: none;
      animation: bounce 2s infinite;
    `;
    
    // Add bounce animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
        40% {transform: translateY(-10px);}
        60% {transform: translateY(-5px);}
      }
    `;
    document.head.appendChild(style);
    
    this.installButton.addEventListener('click', () => {
      this.installApp();
    });
    
    document.body.appendChild(this.installButton);
  }
  
  showInstallButton() {
    if (this.isInstalled) return;
    
    if (!this.installButton) {
      this.createInstallButton();
    }
    
    this.installButton.style.display = 'block';
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
      this.hideInstallButton();
    }, 10000);
  }
  
  hideInstallButton() {
    if (this.installButton) {
      this.installButton.style.display = 'none';
    }
  }
  
  async installApp() {
    if (!this.deferredPrompt) {
      this.showInstallInstructions();
      return;
    }
    
    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        this.hideInstallButton();
      } else {
        console.log('User dismissed the install prompt');
      }
      
      this.deferredPrompt = null;
    } catch (error) {
      console.error('Installation failed:', error);
      this.showInstallInstructions();
    }
  }
  
  showInstallInstructions() {
    const instructions = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      ">
        <div style="
          background: white;
          padding: 30px;
          border-radius: 10px;
          max-width: 400px;
          text-align: center;
        ">
          <h3>Install Shuttering Pro</h3>
          <p>To install this app:</p>
          <div style="text-align: left; margin: 20px 0;">
            <p><strong>Chrome/Edge:</strong> Click the install icon in address bar</p>
            <p><strong>Safari:</strong> Tap Share → Add to Home Screen</p>
            <p><strong>Firefox:</strong> Menu → Install</p>
            <p><strong>Android Chrome:</strong> Menu → Add to Home Screen</p>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" style="
            padding: 10px 20px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          ">Close</button>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', instructions);
  }
  
  showInstallSuccess() {
    const successMsg = document.createElement('div');
    successMsg.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 1000;
        animation: slideIn 0.5s ease-out;
      ">
        <i class="fas fa-check-circle"></i>
        App installed successfully!
      </div>
    `;
    
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
      successMsg.remove();
    }, 3000);
  }
}

// Initialize PWA install handler
let pwaHandler;

if ('serviceWorker' in navigator) {
  pwaHandler = new PWAInstallHandler();
}
