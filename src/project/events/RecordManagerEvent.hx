package project.events;

import flash.events.DataEvent;

@:final
class RecordManagerEvent extends DataEvent {

    /**
	 * 録音を開始したときのイベントです。
	 */
    public inline static var RECORDING_STARTED: String = "recordingStarted";

    /**
	 * 発話を開始したときのイベントです。
	 */
    public inline static var UTTERANCE_STARTED: String = "utteranceStarted";

    /**
	 * 発話終了時の声が大きすぎたとみなされた場合のイベントです。
	 */
    public inline static var UTTERANCE_TOOLOUD: String = "utteranceTooLoud";


    /**
	 * マイク音量が検知されたタイミングで発生するイベントです。
	 */
    public inline static var UPDATE_MIC_LEVEL: String = "updateMicLevel";

    /** マイクの状態が変化したときのイベントです。 */
    public inline static var MIC_STATUS_CHANGE: String = "micStatusChange";

    /** 例外エラーが発生したときのイベントです。 */
    public inline static var ERROR: String = "error";

    public function new(type: String,
                        bubbles: Bool = false,
                        cancelable: Bool = false,
                        data: String = null) {
        super(type, bubbles, cancelable, data);
    }
}
