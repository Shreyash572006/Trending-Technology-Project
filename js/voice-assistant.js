// ============================================================
// VENDRIXA IQ — Voice Assistant Module v2
// FIXED: Browser autoplay policy, voice loading, language fallback
// ============================================================

const VoiceAssistant = {
    recognition: null,
    synth: window.speechSynthesis,
    isListening: false,
    isMuted: false,
    currentUtterance: null,
    voicesReady: false,
    cachedVoices: [],
    detectedLang: 'en-IN', // Default spoken language

    // UI Elements
    micBtn: null,
    waveContainer: null,
    chatInput: null,
    sendBtn: null,
    panel: null,
    langSelect: null,
    langLabel: null,
    muteBtn: null,
    stopBtn: null,

    // ─── Load voices immediately and cache them ───────────────
    loadVoices() {
        const load = () => {
            this.cachedVoices = this.synth.getVoices();
            if (this.cachedVoices.length > 0) {
                this.voicesReady = true;
            }
        };
        load();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = load;
        }
    },

    init() {
        // Load TTS voices right away
        if (window.speechSynthesis) {
            this.loadVoices();
        }

        // Cache DOM
        this.micBtn       = document.getElementById('aiMicBtn');
        this.waveContainer = document.getElementById('voiceWave');
        this.chatInput    = document.getElementById('aiChatInput');
        this.sendBtn      = document.getElementById('aiChatSend');
        this.panel        = document.getElementById('voiceControlPanel');
        this.langSelect   = document.getElementById('manualLangToggle');
        this.langLabel    = document.getElementById('detectedLangLabel');
        this.muteBtn      = document.getElementById('voiceMuteToggle');
        this.stopBtn      = document.getElementById('voiceStopBtn');

        if (!this.micBtn) return;

        // Init Speech Recognition if supported
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SR();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-IN'; // default
        }

        this.bindEvents();
    },

    bindEvents() {
        if (!this.micBtn) return;

        // ── Mic Button (user gesture — SAFE for autoplay) ────
        this.micBtn.addEventListener('click', () => {
            // Unlock audio on EVERY mic click (satisfies browser gesture requirement)
            this._unlockAudio();

            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
        });

        // ── Language Toggle ──────────────────────────────────
        if (this.langSelect) {
            this.langSelect.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'auto') {
                    if (this.recognition) this.recognition.lang = 'en-IN';
                    this.detectedLang = 'en-IN';
                    if (this.langLabel) this.langLabel.textContent = '🗣 Auto';
                } else {
                    if (this.recognition) this.recognition.lang = val;
                    this.detectedLang = val;
                    const txt = e.target.options[e.target.selectedIndex].text;
                    if (this.langLabel) this.langLabel.textContent = '🌐 ' + txt;
                }
            });
        }

        // ── Mute Toggle ──────────────────────────────────────
        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => {
                this.isMuted = !this.isMuted;
                this.muteBtn.innerHTML = this.isMuted ? '🔇 Unmute' : '🔊 Mute';
                this.muteBtn.style.color = this.isMuted ? 'var(--danger)' : '';
                if (this.isMuted) this.stopSpeaking();
            });
        }

        // ── Stop Button ──────────────────────────────────────
        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', () => this.stopSpeaking());
        }

        if (!this.recognition) return;

        // ── Recognition Events ───────────────────────────────
        this.recognition.onstart = () => {
            this.isListening = true;
            this.micBtn.classList.add('listening');
            if (this.waveContainer) this.waveContainer.classList.add('active');
            if (this.panel) this.panel.style.display = 'flex';
            if (this.chatInput) this.chatInput.placeholder = '🎤 Listening...';
        };

        this.recognition.onresult = (event) => {
            let interim = '';
            let final   = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) final   += event.results[i][0].transcript;
                else                           interim += event.results[i][0].transcript;
            }
            if (this.chatInput) this.chatInput.value = final || interim;
        };

        this.recognition.onerror = (event) => {
            console.warn('Speech recognition error:', event.error);
            this.stopListening();
            if (event.error === 'no-speech' && this.chatInput) {
                this.chatInput.placeholder = "Didn't catch that — tap mic and try again";
                setTimeout(() => { if (this.chatInput) this.chatInput.placeholder = 'Ask me anything about your business…'; }, 3000);
            }
        };

        this.recognition.onend = () => {
            this.stopListening();
            const text = this.chatInput ? this.chatInput.value.trim() : '';
            if (text !== '') {
                if (!this.handleVoiceCommand(text)) {
                    // ⚡ sendBtn.click() IS a user gesture — keeps audio unlocked
                    setTimeout(() => {
                        if (this.chatInput && this.chatInput.value.trim() !== '' && this.sendBtn) {
                            this.sendBtn.click();
                        }
                    }, 400);
                } else {
                    if (this.chatInput) this.chatInput.value = '';
                }
            }
        };
    },

    // ── Unlock audio context (required by browsers for TTS after page load) ─
    _unlockAudio() {
        if (!this.synth) return;
        // Speak an empty utterance to unlock the audio context
        const unlock = new SpeechSynthesisUtterance('');
        unlock.volume = 0;
        this.synth.speak(unlock);
    },

    startListening() {
        if (!this.recognition) {
            alert('Voice input is not supported in this browser. Please use Chrome.');
            return;
        }
        this.stopSpeaking();
        try { this.recognition.start(); } catch (e) { console.warn('Recognition start error:', e); }
    },

    stopListening() {
        this.isListening = false;
        if (this.micBtn) this.micBtn.classList.remove('listening');
        if (this.waveContainer) this.waveContainer.classList.remove('active');
        if (this.chatInput) this.chatInput.placeholder = 'Ask me anything about your business…';
        try { if (this.recognition) this.recognition.stop(); } catch (e) {}
    },

    handleVoiceCommand(text) {
        const cmd = text.toLowerCase();
        if (cmd.includes('open dashboard') || cmd.match(/^home$/)) {
            document.querySelector('.nav-item[data-target="overview"]')?.click();
            this.speak('Opening your dashboard overview');
            return true;
        }
        if (cmd.includes('show low stock') || cmd.includes('open inventory') || cmd.includes('inventory')) {
            document.querySelector('.nav-item[data-target="inventory"]')?.click();
            this.speak('Opening inventory module');
            return true;
        }
        if (cmd.includes('upload data') || cmd.includes('upload file')) {
            document.querySelector('.nav-item[data-target="upload"]')?.click();
            this.speak('Opening upload and analyse section');
            return true;
        }
        if (cmd.includes('show expenses') || cmd.includes('expense')) {
            document.querySelector('.nav-item[data-target="expenses"]')?.click();
            this.speak('Opening expense tracker');
            return true;
        }
        return false;
    },

    // ──────────────────────────────────────────────────────────
    // SPEAK — the fixed version that actually plays sound
    // ──────────────────────────────────────────────────────────
    speak(text, lang = null) {
        if (this.isMuted) return;
        if (!this.synth) return;

        // Cancel any ongoing speech
        this.synth.cancel();

        // Clean markdown/symbols for natural TTS
        const clean = text
            .replace(/#{1,6}\s/g, '')        // remove headings
            .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold
            .replace(/\*(.*?)\*/g, '$1')     // remove italic
            .replace(/`[^`]+`/g, '')         // remove code
            .replace(/\|[^|\n]*\|/g, '')     // remove table lines
            .replace(/[-—]{2,}/g, '. ')      // dashes to pause
            .replace(/₹/g, 'rupees ')
            .replace(/%/g, ' percent')
            .replace(/\n+/g, '. ')
            .replace(/<[^>]*>/g, '')         // strip html
            .replace(/\s{2,}/g, ' ')
            .trim();

        if (!clean) return;

        // Use detected language
        const targetLang = lang || this.detectedLang || 'en-IN';

        // Build the utterance
        const utter = new SpeechSynthesisUtterance(clean);
        utter.lang   = targetLang;
        utter.rate   = 1.0;
        utter.pitch  = 0.9;
        utter.volume = 1.0;

        // Pick best voice
        const voices = this.synth.getVoices().length > 0
            ? this.synth.getVoices()
            : this.cachedVoices;

        if (voices.length > 0) {
            const langCode = targetLang.split('-')[0]; // e.g. 'en', 'hi', 'mr'

            // 1) Exact lang match + male preference
            let voice = voices.find(v =>
                (v.lang === targetLang || v.lang.startsWith(langCode)) &&
                /male|rishi|david|google/i.test(v.name)
            );
            // 2) Any match for the language
            if (!voice) voice = voices.find(v => v.lang === targetLang || v.lang.startsWith(langCode));
            // 3) Any English voice
            if (!voice) voice = voices.find(v => v.lang.startsWith('en'));
            // 4) Just use first available
            if (!voice && voices.length > 0) voice = voices[0];

            if (voice) utter.voice = voice;
        }

        utter.onstart = () => {
            if (this.stopBtn) this.stopBtn.style.display = 'inline-block';
        };
        utter.onend = () => {
            if (this.stopBtn) this.stopBtn.style.display = 'none';
        };
        utter.onerror = (e) => {
            console.warn('TTS error:', e.error);
            if (this.stopBtn) this.stopBtn.style.display = 'none';
        };

        this.currentUtterance = utter;

        // ⚡ KEY FIX: Chrome has a bug where synth gets stuck after ~15s
        // Use a small delay to let cancel() clear, THEN speak
        setTimeout(() => {
            this.synth.speak(utter);
        }, 50);
    },

    stopSpeaking() {
        if (this.synth) this.synth.cancel();
        if (this.stopBtn) this.stopBtn.style.display = 'none';
    },

    // Add 🔊 replay button to AI message bubbles
    addReplayButton(messageElement, text) {
        if (!messageElement) return;
        const contentWrap = messageElement.querySelector('.msg-content-wrap');
        const sender      = contentWrap?.querySelector('.msg-sender');
        if (!sender) return;

        // Remove any existing replay button first
        sender.querySelectorAll('.msg-replay-btn').forEach(b => b.remove());

        const btn = document.createElement('button');
        btn.className = 'msg-replay-btn';
        btn.innerHTML = '🔊';
        btn.title     = 'Replay voice response';
        btn.onclick   = (e) => {
            e.stopPropagation();
            this._unlockAudio();
            this.speak(text);
        };
        sender.appendChild(btn);
    }
};

// ── Boot ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => VoiceAssistant.init(), 300);
});
