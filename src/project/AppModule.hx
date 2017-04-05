package project;

import project.view.SoundWaveDisplay;
import project.connector.JavaScriptConnector;
import flash.system.Security;
import flash.Lib;
import flash.display.Stage;
import flash.display.Sprite;

class AppModule extends Sprite {

    private var _stage: Stage;

    public function new() {
        super();
        _stage = Lib.current.stage;

        // JavaScript コールバック用のドメイン
        Security.allowDomain("*");

        var flashVars = Lib.current.loaderInfo.parameters;

        var javascriptConnector = new JavaScriptConnector(flashVars, _stage);

        // debugMode が true の時は波形を表示する
        if (flashVars.debugMode == "true") {
            var soundWaveDisplay: SoundWaveDisplay = new SoundWaveDisplay();
            soundWaveDisplay.drawAreaWidth = _stage.stageWidth;
            soundWaveDisplay.drawAreaHeight = _stage.stageHeight;
            soundWaveDisplay.updateBackground();
            _stage.addChild(soundWaveDisplay);
            javascriptConnector.setSoundWaveComponent(soundWaveDisplay);
        }
    }
}
