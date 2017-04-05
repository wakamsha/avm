package project.media;

import flash.errors.Error;
import flash.events.Event;
import flash.events.EventDispatcher;
import flash.media.Sound;
import flash.media.SoundChannel;
import flash.utils.ByteArray;

@:meta(Event(name="change", type="flash.event.Event"))

/**
 * 録音された音声を再生するプレイヤー
 **/
class SoundPlayer extends EventDispatcher {

    private var _soundChannel: SoundChannel;
    private var _soundItems: Map<String, Sound> = new Map<String, Sound>();

    public var isPlaying(default, null): Bool;


    public function new() {
        super();
    }

    /**
     * 録音された音声を再生する
     **/
    public function playSound(id: String, time: Float = 0): Void {
        if (id == "undefined") {
            trace("録音されたデータが無いので再生できません");
            return;
        }

        var sound = _soundItems.get(id);

        // サウンド秒数を超える時間から再生させようとするとサウンドチャネルが発生しないため、0秒から再生させる
        if (sound.length <= time) {
            time = 0;
        }

        _soundChannel = sound.play(time);
        _soundChannel.addEventListener(Event.SOUND_COMPLETE, onCompletePlayback);

        isPlaying = true;
        dispatchEvent(new Event(Event.CHANGE));
    }

    /**
     * 録音された音声を一時停止する
     **/
    public function resumeSound(): Void {
        throw new Error("未実装");
    }

    /**
     * 録音された音声を停止する
     **/
    public function stopSound(): Void {
        if (_soundChannel != null) {
            _soundChannel.stop();
        }
        isPlaying = false;
        dispatchEvent(new Event(Event.CHANGE));
    }

    /**
     * 録音データを保存する
     **/
    public function setRecordedData(id: String, bytesRecorded: ByteArray): Bool {
        var isRecordingSuccess: Bool = false;

        if (bytesRecorded == null) {
            trace("データなしのため保存できず");
        } else {
            // 録音した音声データを格納する
            bytesRecorded.position = 0;
            var sound: Sound = new Sound();
            sound.loadPCMFromByteArray(bytesRecorded, cast(bytesRecorded.length / 4, UInt), "float", false);
            _soundItems.set(id, sound);
            isRecordingSuccess = true;
        }
        return isRecordingSuccess;
    }

    /**
     * 録音された音声の再生が完了したことを示す
     **/
    private function onCompletePlayback(event: Event): Void {
        isPlaying = false;
        dispatchEvent(new Event(Event.CHANGE));
    }

}
