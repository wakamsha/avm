package project.view;

import flash.utils.ByteArray;

interface ISoundWaveDisplay {

    var drawAreaWidth(default, default): Float;
    var drawAreaHeight(default, default): Float;
    function drawSoundWave(byteArray: ByteArray): Void;
}
