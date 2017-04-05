package project.connector;

import project.view.ISoundWaveDisplay;
import project.events.RecordManagerEvent;
import flash.events.Event;
import flash.display.Stage;
import flash.external.ExternalInterface;
import project.media.RecordManager;

/**
 * JavaSctipt と 録音モジュールを接続するためのコネクタクラス
 **/
class JavaScriptConnector {

    // Static properties
    private static inline var API_SETUP_SECURITY_SETTING: String = "setupSecuritySetting";
	private static inline var API_SET_GAIN: String = "setGain";
    private static inline var API_START_RECORDING: String = "startRecording";
    private static inline var API_CANCEL_RECORDING: String = "cancelRecording";
    private static inline var API_PLAY_SOUND: String = "playSound";
    private static inline var API_RESUME_SOUND: String = "resumeSound";
    private static inline var API_STOP_SOUND: String = "stopSound";

    private static inline var API_ON_MIC_STATUS_CHANGE: String = "onChangeMicStatus";
    private static inline var API_ON_START_RECORDING: String = "onStartRecording";
    private static inline var API_ON_RESULT: String = "onResult";
    private static inline var API_ON_RECORD_MANAGER_STATUS_CHANGE: String = "onChangeRecorderStatus";

    // propeties
    private var _recordManager: RecordManager;
    private var _callbackNamespace: String;
    private var _stage: Stage;


    public function new(params: Dynamic<String>, stage: Stage) {
        _stage = stage;

        // コールバック先の指定
        _callbackNamespace = params.callbackNamespace;

        ExternalInterface.addCallback(API_SETUP_SECURITY_SETTING, setupSecuritySetting);
		ExternalInterface.addCallback(API_SET_GAIN, setGain);
        ExternalInterface.addCallback(API_START_RECORDING, startRecording);
        ExternalInterface.addCallback(API_CANCEL_RECORDING, cancelRecording);
        ExternalInterface.addCallback(API_PLAY_SOUND, playSound);
        ExternalInterface.addCallback(API_RESUME_SOUND, resumeSound);
        ExternalInterface.addCallback(API_STOP_SOUND, stopSound);

        // recordManager 初期化
        _recordManager = new RecordManager();
        _recordManager.addEventListener(Event.CHANGE, onChangeRecordManagerStatus);
        _recordManager.addEventListener(Event.COMPLETE, onCompleteRecordManagerStatus);
        _recordManager.addEventListener(RecordManagerEvent.MIC_STATUS_CHANGE, onChangeMicStatus);
        _recordManager.addEventListener(RecordManagerEvent.RECORDING_STARTED, onStartRecording);
    }

    /**
     * 破棄する
     **/
    public function dispose(): Void {
        _callbackNamespace = null;
        _recordManager.removeEventListener(Event.CHANGE, onChangeRecordManagerStatus);
        _recordManager.removeEventListener(Event.COMPLETE, onCompleteRecordManagerStatus);
    }

    /**
     * サウンド波形を設定する
     **/
    public function setSoundWaveComponent(soundWaveDisplay: ISoundWaveDisplay): Void {
        _recordManager.setSoundWaveComponent(soundWaveDisplay);
    }

    /**
     * [Flash -> JS] マイクの状態が変化したときのイベント
     **/
    private function onChangeMicStatus(event: Event): Void {
        ExternalInterface.call('${getJavaSctiptNamespace()}${API_ON_MIC_STATUS_CHANGE}', _recordManager.getMicStatus());
    }

    /**
     * [Flash -> JS] RecordManager で録音開始した時のイベント
     **/
    private function onStartRecording(event: RecordManagerEvent): Void {
        ExternalInterface.call('${getJavaSctiptNamespace()}${API_ON_START_RECORDING}');
    }

    /**
     * [Flash -> JS] RecordManager の状態が変化した時のイベント
     **/
    private function onChangeRecordManagerStatus(event: Event): Void {
        var status: String = _recordManager.getStatus();
        ExternalInterface.call('${getJavaSctiptNamespace()}${API_ON_RECORD_MANAGER_STATUS_CHANGE}', status);
    }

    /**
     * [Flash -> JS] RecordManager で録音が終了した時のイベント
     **/
    private function onCompleteRecordManagerStatus(event: Event): Void {
        var recordId: String = _recordManager.isRecorgingSuccess ? _recordManager.currentRecordId : null;
        ExternalInterface.call('${getJavaSctiptNamespace()}${API_ON_RESULT}', recordId);
    }

    /**
     * JS の名前空間を正規化する
     **/
    private function getJavaSctiptNamespace(): String {
        if (_callbackNamespace == null || _callbackNamespace == "") {
            return "";
        } else if (_callbackNamespace.substr(-1, 1) == "") {
            return _callbackNamespace;
        } else {
            return _callbackNamespace + ".";
        }
    }

    /**
     * [JS -> Flash] セキュリティ設定パネルを開く
     **/
    private function setupSecuritySetting(enforce: Bool = false): Void {
        _recordManager.setupSecuritySetting(_stage, enforce);
    }

	/**
     * [JS -> Flash] マイクの入力ボリュームを設定する
     **/
	private function setGain(value: Float): Void {
		_recordManager.setGain(value);
	}

    /**
     * [JS -> Flash] 録音を開始する
     **/
    private function startRecording(recordId: String): Void {
        _recordManager.startRecording(recordId);
    }

    /**
     * [JS -> Flash] 録音中にキャンセル ( もしくは停止 ) する
     **/
    private function cancelRecording(): Void {
        _recordManager.cancelRecording();
    }

    /**
     * [JS -> Flash] 録音した音声を再生する
     **/
    private function playSound(recordId: String): Void {
        _recordManager.playSound(recordId);
    }

    /**
     * [JS -> Flash] 録音した音声の再生を一時停止する
     **/
    private function resumeSound(): Void {
        _recordManager.resumeSound();
    }

    /**
     * [JS -> Flash] 録音した音声の再生を停止する
     **/
    private function stopSound(): Void {
        _recordManager.stopSound();
    }
}
