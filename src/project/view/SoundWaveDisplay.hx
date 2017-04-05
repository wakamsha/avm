package project.view;

import flash.utils.ByteArray;
import flash.Lib;
import flash.display.Stage;
import flash.display.Shape;
import flash.display.Sprite;

@:final
class SoundWaveDisplay extends Sprite implements ISoundWaveDisplay {

    public var drawAreaWidth(default, default): Float;
    public var drawAreaHeight(default, default): Float;

    private var _stage: Stage;
    private var _bg: Shape;
    private var _line: Shape;

    public function new() {
        super();

        _stage = Lib.current.stage;
        _bg = new Shape();
        _stage.addChild(_bg);
        _line = new Shape();
        _stage.addChild(_line);
    }

    public function drawSoundWave(byteArray: ByteArray): Void {
        var w: Float = drawAreaWidth;
        var h: Float = drawAreaHeight;

        byteArray.position = 0;
        _line.graphics.clear();
        _line.graphics.lineStyle(1, 0xff0000);
        _line.graphics.moveTo(0, h / 2);
        var len: Int = cast(byteArray.length / 4, Int);
        var max: Float = 0;
        for(i in 0...len) {
            var volume: Float = byteArray.readFloat();
            max = Math.max(max, volume);
            _line.graphics.lineTo(i / len * w, volume * h / 2 + h / 2);
        }
    }

    public function updateBackground(): Void {
        _bg.graphics.clear();
        _bg.graphics.beginFill(0xcccccc);
        _bg.graphics.drawRect(0, 0, drawAreaWidth, drawAreaHeight);
    }
}
