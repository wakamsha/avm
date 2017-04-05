package project.media;

import project.view.ISoundWaveDisplay;
import String;
import project.events.RecordManagerEvent;
import flash.display.Stage;
import flash.events.ActivityEvent;
import flash.events.Event;
import flash.events.EventDispatcher;
import flash.events.SampleDataEvent;
import flash.events.StatusEvent;
import flash.media.Microphone;
import flash.media.Sound;
import flash.utils.ByteArray;
import project.security.SecuritySetting;

@:meta(Event(name="change", type="flash.events.Event"))

/**
 * 録音・再生およびセキュリティ設定パネルを管理するクラス
 **/
class RecordManager extends EventDispatcher {

    private var _recordedSound: Sound;
    private var _mic: Microphone;
    private var _bytesRecorded: ByteArray;
    private var _writePoint: Int = 0;
	private var _currentGain: Float = 50;

    private var _isSetupComplete: Bool = false;
    private var _soundWaveDisplay: ISoundWaveDisplay;
    private var _soundPlayer: SoundPlayer;

    private var _status: String;

    private var _recordIndex: Int = 0;
    private var _micStatus: String;

    private var _securitySetting: SecuritySetting;

    public var currentRecordId(default, null): String;
    public var isRecorgingSuccess(default, null): Bool = false;


    public function new() {
        super();
        _soundPlayer = new SoundPlayer();
        _soundPlayer.addEventListener(Event.CHANGE, onCompletePlayingSound);
    }

    /**
     * 録音を開始する
     **/
    public function startRecording(id: String): Void {
        if (!_isSetupComplete) {
            setupMic();
        } else {
            ready();
        }

        _mic.addEventListener(SampleDataEvent.SAMPLE_DATA, onMicSampleData);
        _mic.addEventListener(StatusEvent.STATUS, onChangeMicStatus);
        _mic.addEventListener(ActivityEvent.ACTIVITY, onChangeMicActivity);

        // 音声を再生している状態であれば停止する
        stopSound();

        currentRecordId = id;
        dispatchEvent(new RecordManagerEvent(RecordManagerEvent.RECORDING_STARTED));
    }

    /**
     * 録音をキャンセル ( もしくは停止 ) する
     **/
    public function cancelRecording(): Void {
        closeMic();
    }

    /**
     * サウンド波形の描画コンポーネントを設定する
     **/
    public function setSoundWaveComponent(soundWaveDisplay: ISoundWaveDisplay): Void {
        _soundWaveDisplay = soundWaveDisplay;
    }

    /**
     * 録音した音声を再生する
     **/
    public function playSound(id: String): Void {
        _soundPlayer.playSound(id, 0);
    }

    /**
     * 録音した音声を一時停止する
     **/
    public function resumeSound(): Void {
        _soundPlayer.resumeSound();
    }

    /**
     * 録音した音声を停止する
     **/
    public function stopSound(): Void {
        if (_soundPlayer.isPlaying) {
            _soundPlayer.stopSound();
        }
    }

    /**
     * 現在の Manager の状態を返す
     **/
    public function getStatus(): String {
        return _status;
    }

    /**
     * 現在のマイクの状態を返す
     **/
    public function getMicStatus(): String {
        return _micStatus;
    }

	/**
	 * マイクの入力ボリュームを設定する
	 * @value 0 ~ 100
	 **/
	public function setGain(value: Float): Void {
		_currentGain = value;
		if (_mic != null) {
			_mic.gain = _currentGain;
		}
	}

    /**
     * セキュリティ設定パネルを表示する
     **/
    public function setupSecuritySetting(stage: Stage, enforce: Bool): Void {
        // ステートをマイク準備中に変更する
        _status = ManagerStatus.MANAGER_PREPARATION;

        _securitySetting = new SecuritySetting(stage);
        _securitySetting.addEventListener(Event.CHANGE, onChangeSecuritySetting);
        _securitySetting.setupSecuritySetting(enforce);
    }

    /**
     * マイクの状態が変化した時のイベント
     * ミュート状態だったらイベントリスナーを削除する
     **/
    private function onChangeMicStatus(event: StatusEvent): Void {
        trace("_mic.muted : " + _mic.muted);
        if (_mic.muted) {
            _mic.removeEventListener(StatusEvent.STATUS, onChangeMicStatus);
            _mic.removeEventListener(ActivityEvent.ACTIVITY, onChangeMicActivity);

            _micStatus = MicStatus.MIC_DENIED;

            _status = ManagerStatus.MANAGER_SUSPENDED;

            dispatchEvent(new Event(Event.CHANGE));
            dispatchEvent(new RecordManagerEvent(RecordManagerEvent.MIC_STATUS_CHANGE));
        }
    }

    private function onChangeMicActivity(event: ActivityEvent): Void {
//        trace("onChangeMicActivity(event) : " + event.activating);
        if (event.activating) {
            _micStatus = MicStatus.MIC_ENABLE;
            ready();
            _mic.removeEventListener(StatusEvent.STATUS, onChangeMicStatus);
            _mic.removeEventListener(ActivityEvent.ACTIVITY, onChangeMicActivity);
            _isSetupComplete = true;

            dispatchEvent(new RecordManagerEvent(RecordManagerEvent.MIC_STATUS_CHANGE));
        }
    }

    /**
     * マイクからの録音を終了する
     **/
    private function closeMic(): Void {
        // 録音データを保存する
        isRecorgingSuccess = _soundPlayer.setRecordedData(currentRecordId, _bytesRecorded);
        _status = ManagerStatus.MANAGER_ON_READY;

        _mic.removeEventListener(SampleDataEvent.SAMPLE_DATA, onMicSampleData);
        _mic.removeEventListener(StatusEvent.STATUS, onChangeMicStatus);
        _mic.removeEventListener(ActivityEvent.ACTIVITY, onChangeMicActivity);

        dispatchEvent(new Event(Event.CHANGE));
        dispatchEvent(new Event(Event.COMPLETE));
    }

    /**
     * マイクの初期化
     **/
    private function setupMic(): Void {
        _mic = Microphone.getMicrophone();

        if (_mic == null) {
            trace("[Error] マイクの取得に失敗しました");
            _micStatus = MicStatus.MIC_DISABLE;
            _status = ManagerStatus.MANAGER_SUSPENDED;
            dispatchEvent(new Event(Event.CHANGE));
            return;
        }

        _mic.setSilenceLevel(0, 4000);
        _mic.gain = _currentGain;
        _mic.rate = 44;
        _mic.setUseEchoSuppression(false);
        _mic.setLoopBack(false);

        dispatchEvent(new Event(Event.CHANGE));
    }

    /**
     * マイクから拾った音声データの格納先をリセットする
     **/
    private function ready(): Void {
        _recordedSound = new Sound();
        _bytesRecorded = new ByteArray();
        _writePoint = 0;

        _status = ManagerStatus.MANAGER_RECORDING;
        dispatchEvent(new Event(Event.CHANGE));
    }

    /**
     * マイクから拾った音声データを格納する
     **/
    private function onMicSampleData(event: SampleDataEvent): Void {
        while (event.data.bytesAvailable > 0) {
            var sample: Float = event.data.readFloat();
            _bytesRecorded.writeFloat(sample);
        }
        // サウンド波形を描画
        if (_soundWaveDisplay != null) {
            _soundWaveDisplay.drawSoundWave(_bytesRecorded);
        }
    }

    private function onCompletePlayingSound(event: Event): Void {
        _status = _soundPlayer.isPlaying ? ManagerStatus.MANAGER_PLAYING : ManagerStatus.MANAGER_ON_READY;

        dispatchEvent(new Event(Event.CHANGE));
    }

    private function onChangeSecuritySetting(event: Event): Void {
        _micStatus = _securitySetting.getMicStatus();
        // ステートを待機中に変更する
        _status = ManagerStatus.MANAGER_ON_READY;

        dispatchEvent(new RecordManagerEvent(RecordManagerEvent.MIC_STATUS_CHANGE));
        dispatchEvent(new Event(Event.CHANGE));
    }
}
