package project.media;

@:final
class ManagerStatus {

    /** 録音中 */
    public static inline var MANAGER_RECORDING: String = "managerRecording";

    /** 録音した音声を再生中 */
    public static inline var MANAGER_PLAYING: String = "managerPlaying";

    /** マイクアクセス準備中 */
    public static inline var MANAGER_PREPARATION: String = "managerPreparation";

    /** マイクアクセス可能 & 待機中 */
    public static inline var MANAGER_ON_READY: String = "managerOnReady";

    /** マイクアクセスできず & 録音不可 */
    public static inline var MANAGER_SUSPENDED: String = "managerSuspended";

    public function new() {
    }
}
