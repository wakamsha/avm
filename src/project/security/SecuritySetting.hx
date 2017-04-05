package project.security;

import flash.display.Stage;
import flash.events.Event;
import flash.events.EventDispatcher;
import flash.events.FocusEvent;
import flash.media.Microphone;
import flash.system.Security;
import flash.system.SecurityPanel;
import project.media.MicStatus;

@:meta(Event(name="change", type="flash.events.Event"))
@:final
class SecuritySetting extends EventDispatcher {

    private static inline var API_SETUP_MIC: String = "setupMic";
    private static inline var API_ON_CHANGE: String = "sample.step1.onChange";

    private var _mic: Microphone;
    private var _stage: Stage;
    private var _micStatus: String;

    public function new(stage: Stage) {
        super();
        _stage = stage;
    }

    public function setupSecuritySetting(enforce: Bool = false): Void {
        _mic = Microphone.getMicrophone();

        if (_mic == null) {
            _micStatus = MicStatus.MIC_DISABLE;
            dispatchEvent(new Event(Event.CHANGE));
            return;
        }

        if (_mic.muted || enforce) {
            _stage.focus = _stage;
            _stage.addEventListener(FocusEvent.FOCUS_IN, onFocusInStage);
            Security.showSettings(SecurityPanel.PRIVACY);
        } else {
            _micStatus = MicStatus.MIC_ENABLE;
            dispatchEvent(new Event(Event.CHANGE));
        }
    }

    /**
     * マイクの状態を返す
     **/
    public function getMicStatus(): String {
        return _micStatus;
    }

    private function onFocusInStage(event: FocusEvent): Void {
        _stage.removeEventListener(FocusEvent.FOCUS_IN, onFocusInStage);
        _micStatus = !_mic.muted ? MicStatus.MIC_ENABLE : MicStatus.MIC_DENIED;
        dispatchEvent(new Event(Event.CHANGE));
    }
}
