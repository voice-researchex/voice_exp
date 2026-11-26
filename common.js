 // WebアプリURL
        const GAS_URL = "https://script.google.com/macros/s/AKfycbzdjS0r_ZojE9d--ZWcnlsiXAOsIaUDTwNVDoDwIjKUs9NVJYvcY8zNrTdsJ3foN8g/exec";

        // フレーミング (8条件)
        const TRIAL_CONFIG = [
    	{ id: 'ex_01', audioFile: 'audio/ex_01.wav', framing: 'positive', pitch: 'High', intonation: 'emotional', 
    		text: '1番のプランは 40人のうち20人が合格しました' },
    		
    	{ id: 'ex_02', audioFile: 'audio/ex_02.wav', framing: 'negative', pitch: 'High', intonation: 'emotional', 
    		text: '2番のプランは 40人のうち20人が不合格でした' },
    		
    	{ id: 'ex_03', audioFile: 'audio/ex_03.wav', framing: 'positive', pitch: 'High', intonation: 'Flat',      
    		text: '3番のプランは 40人のうち20人が合格しました' },
    	
    	{ id: 'ex_04', audioFile: 'audio/ex_04.wav', framing: 'negative', pitch: 'High', intonation: 'Flat',      
    		text: '4番のプランは 40人のうち20人が不合格でした' },
    	
    	{ id: 'ex_05', audioFile: 'audio/ex_05.wav', framing: 'positive', pitch: 'Low',  intonation: 'emotional', 
    		text: '5番のプランは 40人のうち20人が合格しました' },
    	
    	{ id: 'ex_06', audioFile: 'audio/ex_06.wav', framing: 'negative', pitch: 'Low',  intonation: 'emotional', 
    		text: '6番のプランは 40人のうち20人が不合格でした' },
    	
    	{ id: 'ex_07', audioFile: 'audio/ex_07.wav', framing: 'positive', pitch: 'Low',  intonation: 'Flat',      
    		text: '7番のプランは 40人のうち20人が合格しました' },
    	
    	{ id: 'ex_08', audioFile: 'audio/ex_08.wav', framing: 'negative', pitch: 'Low',  intonation: 'Flat',      
    		text: '8番のプランは 40人のうち20人が不合格でした' }
		];

		const STORAGE_KEY = 'ai_voice_exp_state';

	// 状態（participant情報・results）をsessionStorageから取得
		function loadExpState() {
    	const raw = sessionStorage.getItem(STORAGE_KEY);
    	if (!raw) {
        	return {
            	participant: { id: '', age: '', gender: '' },
            	results: []
        	};
    	}
    		return JSON.parse(raw);
		}

	// 状態をsessionStorageへ保存
	function saveExpState(stateObj) {
    	sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateObj));
	}

	// 音声再生共通処理（wav優先・なければブラウザ音声で代替）
let currentAudio = null;

function playAudioFile(audioPath, fallbackText, pitch = 1.0, rate = 1.0, onEndedCallback = null) {
    // すでに再生中の音声があれば停止
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }

    const audio = new Audio(audioPath);
    currentAudio = audio;

    // WAVファイルが最後まで再生し終わったときに実行
    audio.onended = () => {
        currentAudio = null;
        if (typeof onEndedCallback === 'function') {
            onEndedCallback();
        }
    };

    // WAVファイルが存在しない・読み込めない場合はブラウザ音声合成へフォールバック
    audio.onerror = () => {
        currentAudio = null;
        playSpeechFallback(fallbackText, pitch, rate, onEndedCallback);
    };

    audio.play().catch(() => {
        currentAudio = null;
        playSpeechFallback(fallbackText, pitch, rate, onEndedCallback);
    });
}

function playSpeechFallback(text, pitch, rate, onEndedCallback) {
    if (!('speechSynthesis' in window)) {
        if (typeof onEndedCallback === 'function') onEndedCallback();
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.pitch = pitch;
    utterance.rate = rate;

    // ブラウザ音声合成が最後まで喋り終わったときに実行
    utterance.onend = () => {
        if (typeof onEndedCallback === 'function') {
            onEndedCallback();
        }
    };

    utterance.onerror = () => {
        if (typeof onEndedCallback === 'function') {
            onEndedCallback();
        }
    };

    window.speechSynthesis.speak(utterance);
}
	function speakFallbackText(text, pitch = 1.0, rate = 1.0, onEndCallback = null) {
    	if (!('speechSynthesis' in window)) {
        	if (onEndCallback) onEndCallback();
        	return;
    	}

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.pitch = pitch;
    utterance.rate = rate;

    let callbackCalled = false;
    const safeCallback = () => {
        if (!callbackCalled) {
            callbackCalled = true;
            if (onEndCallback) onEndCallback();
        }
    };

    utterance.onend = safeCallback;
    utterance.onerror = safeCallback;

    const fallbackMs = Math.max(3000, text.length * 200 + 2000);
    setTimeout(safeCallback, fallbackMs);

    window.speechSynthesis.speak(utterance);
	}