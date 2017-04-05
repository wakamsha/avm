interface Window {
    [propName: string]: any;
}

class MicStatus {
    /** マイクが利用できない環境の場合 */
    static MIC_DISABLE = "micDisable";
    /**マイク利用可否のダイアログで「拒否」を選択された場合 */
    static MIC_DENIED = "micDenied";
    /** マイク利用可否のダイアログで「許可」を選択された場合 */
    static MIC_ENABLE =  "micEnable";
}

class ManagerStatus {
    /** 録音中 */
    static MANAGER_RECORDING = "managerRecording";
    /** 録音した音声を再生中 */
    static MANAGER_PLAYING = "managerPlaying";
    /** マイクアクセス準備中 */
    static MANAGER_PREPARATION = "managerPreparation";
    /** マイクアクセス可能 & 待機中 */
    static MANAGER_ON_READY = "managerOnReady";
    /** マイクアクセスできず & 録音不可 */
    static MANAGER_SUSPENDED = "managerSuspended";
}


const FLASH_CONTENT_NAME = 'sound-recorder';

/**
 * 埋め込み済みの swf オブジェクトを取得する
 * @param movieName
 * @returns any
 */
const getFlashMovie = (movieName: string): any => {
    return <any>window[movieName];
};

/**
 * セキュリティ設定パネルを表示する
 */
const setupSecuritySetting = () => {
    const swfObj = getFlashMovie(FLASH_CONTENT_NAME);
    swfObj.setupSecuritySetting();
};

/**
 * 録音を開始する
 */
const startRecording = () => {
    // ログをリセットする
    logArea.innerHTML = '';

    const swfObj = getFlashMovie(FLASH_CONTENT_NAME);
    const recordId = new Date().toLocaleString();
    swfObj.setGain(70);
    swfObj.startRecording(recordId);
};

/**
 * 録音を停止する
 */
const stopRecording = () => {
    const swfObj = getFlashMovie(FLASH_CONTENT_NAME);
    swfObj.cancelRecording();
};

/**
 * 録音した音声を再生する
 */
const playSound = () => {
    const swfObj = getFlashMovie(FLASH_CONTENT_NAME);

    const recordId = recordedList.value;

    swfObj.playSound(recordId);
};

/**
 * 録音した音声の再生を停止する
 */
const stopSound = () => {
    const swfObj = getFlashMovie(FLASH_CONTENT_NAME);
    swfObj.stopSound();
};

namespace soundRecorder {

    /**
     * マイクの状態が変化したときのイベント
     * @param status
     */
    export function onChangeMicStatus(status: string) {
        logArea.innerHTML += `[onMicStatusChange] マイクの状態は ${status} \n`;

        switch (status) {
            // マイクが利用できない環境の場合
            case MicStatus.MIC_DISABLE:
                alert("マイクが使えないので、マイク機器がお使いの PC に接続されているかご確認ください。");
                break;
            // マイク利用可否のダイアログで「拒否」を選択された場合
            case MicStatus.MIC_DENIED:
                alert("録音を試すには「許可」を選択ください。");
                // 再度呼び出すだけでセキュリティーパネルを表示できる
                setupSecuritySetting();
                break;
            // マイク利用可否のダイアログで「許可」を選択された場合
            case MicStatus.MIC_ENABLE:
                logArea.innerHTML += `録音可能な状態 \n`;
            default:
            // 何もしない
        }
    }

    /**
     * 録音が開始されたときのイベント
     */
    export function onStartRecording() {
        logArea.innerHTML += `[onStartRecording] 録音を開始しました \n`;
    }

    /**
     * レコーダーの状態が変更したときのイベント
     * @param status
     */
    export function onChangeRecorderStatus(status: string) {
        logArea.innerHTML += `[STATUS CHANGE EVENT] ${status} \n`;
    }

    /**
     * 録音が終了した時のイベント
     * recordId に値が入っていれば録音成功とみなす
     * @param recordId
     */
    export function onResult(recordId: string) {
        if (recordId) {
            const optionElement = document.createElement('option');
            optionElement.innerHTML = recordId;
            optionElement.setAttribute('value', recordId);
            recordedList.add(optionElement);
            recordedList.selectedIndex = recordedList.length - 1;

            logArea.innerHTML += `[STATUS COMPLETE EVENT] 録音に成功しました : ${recordId} \n`;
        } else {
            logArea.innerHTML += `[STATUS COMPLETE EVENT] 録音に失敗しました : ${recordId} \n`;
        }
    }
}

const setupButton     = <HTMLButtonElement>document.getElementById('setup');
const recStartButton  = <HTMLButtonElement>document.getElementById('record-start');
const recStopButton   = <HTMLButtonElement>document.getElementById('record-stop');
const soundPlayButton = <HTMLButtonElement>document.getElementById('sound-play');
const soundStopButton = <HTMLButtonElement>document.getElementById('sound-stop');
const recordedList    = <HTMLSelectElement>document.getElementById('recorded-list');
const logArea         = <HTMLPreElement>document.getElementById('log');

setupButton.addEventListener('click', () => setupSecuritySetting());
recStartButton.addEventListener('click',() => startRecording());
recStopButton.addEventListener('click', () => stopRecording());
soundPlayButton.addEventListener('click', () => playSound());
soundStopButton.addEventListener('click', () => stopSound());
