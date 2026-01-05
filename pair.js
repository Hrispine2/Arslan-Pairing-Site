<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terminal | Pairing Protocol</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.4.0/axios.min.js"></script>
  <style>
    :root {
      --term-green: #0aff00;
      --term-bg: #0a0a0a;
      --term-glass: rgba(10, 20, 10, 0.9);
      --error: #ff0055;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      background: #000;
      color: var(--term-green);
      font-family: 'Share Tech Mono', monospace;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-image: radial-gradient(circle at center, #112211 0%, #000 100%);
    }

    /* CRT Scanline Effect */
    body::after {
      content: "";
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.15),
        rgba(0, 0, 0, 0.15) 1px,
        transparent 1px,
        transparent 2px
      );
      pointer-events: none;
      z-index: 999;
    }

    .terminal-window {
      width: 100%;
      max-width: 500px;
      background: var(--term-glass);
      border: 2px solid var(--term-green);
      border-radius: 5px;
      box-shadow: 0 0 20px rgba(10, 255, 0, 0.2);
      padding: 2px;
      position: relative;
    }

    .term-header {
      background: var(--term-green);
      color: #000;
      padding: 5px 10px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      text-transform: uppercase;
    }

    .term-body {
      padding: 20px;
    }

    .logo-area {
      text-align: center;
      margin-bottom: 20px;
      border-bottom: 1px dashed var(--term-green);
      padding-bottom: 15px;
    }

    h2 {
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 2px;
      margin-bottom: 5px;
    }

    .status-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      font-size: 0.8rem;
      opacity: 0.8;
    }

    /* Input Styling */
    .input-group {
      position: relative;
      margin-bottom: 20px;
    }

    .input-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    .prefix {
      position: absolute;
      top: 32px;
      left: 10px;
      color: var(--term-green);
      z-index: 2;
    }

    input[type="number"] {
      width: 100%;
      background: rgba(0, 20, 0, 0.5);
      border: 1px solid var(--term-green);
      color: var(--term-green);
      padding: 10px 10px 10px 25px;
      font-family: 'Share Tech Mono', monospace;
      font-size: 1.1rem;
      outline: none;
    }

    input[type="number"]:focus {
      box-shadow: 0 0 10px rgba(10, 255, 0, 0.3);
    }

    /* Buttons */
    .btn {
      width: 100%;
      background: transparent;
      border: 1px solid var(--term-green);
      color: var(--term-green);
      padding: 12px;
      cursor: pointer;
      font-family: 'Orbitron', sans-serif;
      text-transform: uppercase;
      font-weight: bold;
      transition: all 0.2s;
    }

    .btn:hover {
      background: var(--term-green);
      color: #000;
      box-shadow: 0 0 15px var(--term-green);
    }

    .btn:disabled {
      border-color: #555;
      color: #555;
      cursor: not-allowed;
      box-shadow: none;
    }

    /* Output Area */
    .output-area {
      margin-top: 20px;
      min-height: 100px;
      border: 1px solid #333;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #000;
    }

    .code-display {
      font-family: 'Orbitron', sans-serif;
      font-size: 2rem;
      letter-spacing: 5px;
      color: #fff;
      text-shadow: 0 0 10px #fff;
    }

    .loading-bar {
      width: 100%;
      height: 20px;
      background: #111;
      display: none;
      position: relative;
      overflow: hidden;
    }

    .loading-bar::after {
      content: '';
      position: absolute;
      top: 0; left: 0; bottom: 0; width: 50%;
      background: var(--term-green);
      animation: load 1s infinite ease-in-out;
    }

    @keyframes load {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(200%); }
    }

    /* Footer */
    .footer-links {
      margin-top: 1rem;
      text-align: center;
    }
    .footer-links a {
      color: #555;
      margin: 0 10px;
      text-decoration: none;
    }
    .footer-links a:hover { color: var(--term-green); }

    /* Ping Animation */
    .ping {
      width: 10px; height: 10px;
      background: var(--term-green);
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 5px var(--term-green);
      animation: blink 2s infinite;
    }
    @keyframes blink { 50% { opacity: 0.3; } }
  </style>
</head>
<body>

  <div class="terminal-window">
    <div class="term-header">
      <span>Arslan-MD.exe</span>
      <span>v2.0.4 [SECURE]</span>
    </div>
    
    <div class="term-body">
      <div class="logo-area">
        <h2>PAIRING PROTOCOL</h2>
        <div class="status-line">
          <span>SERVER: <span class="ping"></span> ONLINE</span>
          <span>LATENCY: 42ms</span>
        </div>
      </div>

      <form id="pairForm">
        <div class="input-group">
          <label>> ENTER TARGET MSISDN (With Country Code)</label>
          <span class="prefix">+</span>
          <input type="number" id="number" placeholder="923001234567" required>
        </div>

        <button type="submit" id="submitBtn" class="btn">INITIALIZE PAIRING</button>
      </form>

      <div class="output-area" id="output">
        <span style="color: #444;">[ WAITING FOR INPUT ]</span>
      </div>

      <div class="loading-bar" id="loader"></div>
      
      <button id="copyBtn" class="btn" style="margin-top:10px; display:none;">COPY KEY</button>
    </div>
  </div>

  <div class="footer-links">
    <a href="/"><i class="fas fa-home"></i> HOME</a>
    <a href="https://github.com/Arslan-MD"><i class="fab fa-github"></i> GITHUB</a>
    <a href="https://t.me/arslanmd"><i class="fab fa-telegram"></i> SUPPORT</a>
  </div>

  <script>
    const form = document.getElementById('pairForm');
    const input = document.getElementById('number');
    const output = document.getElementById('output');
    const loader = document.getElementById('loader');
    const submitBtn = document.getElementById('submitBtn');
    const copyBtn = document.getElementById('copyBtn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const number = input.value.replace(/[^0-9]/g, '');
      if (number.length < 10) {
        output.innerHTML = '<span style="color: var(--error)">>> ERROR: INVALID MSISDN LENGTH</span>';
        return;
      }

      // UI State: Loading
      submitBtn.disabled = true;
      submitBtn.innerText = "ESTABLISHING CONNECTION...";
      loader.style.display = "block";
      output.style.display = "none";
      copyBtn.style.display = "none";

      try {
        // API Call
        const response = await axios.get(`/code?number=${number}`);
        const code = response.data.code;

        if (!code || code === "Service Currently Unavailable") {
            throw new Error("Service Unavailable");
        }

        // Success State
        loader.style.display = "none";
        output.style.display = "flex";
        output.innerHTML = `<div class="code-display">${code}</div>`;
        copyBtn.style.display = "block";
        submitBtn.innerText = "RETRY PAIRING";
        
        // Copy functionality
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(code);
          copyBtn.innerText = "COPIED TO CLIPBOARD";
          setTimeout(() => copyBtn.innerText = "COPY KEY", 2000);
        };

      } catch (error) {
        // Error State
        loader.style.display = "none";
        output.style.display = "flex";
        output.innerHTML = '<span style="color: var(--error)">>> CONNECTION FAILED. TRY AGAIN.</span>';
        submitBtn.innerText = "INITIALIZE PAIRING";
      } finally {
        submitBtn.disabled = false;
      }
    });

    // Simple "Matrix" background logs (console effect)
    setInterval(() => {
        const consoleLog = document.createElement('div');
        // This is purely visual, no actual logs
    }, 2000);
  </script>
</body>
</html>
