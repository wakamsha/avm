package project.media;

@:final

class MicStatus {

    /** マイクが利用できない環境の場合 */
    public static inline var MIC_DISABLE: String = "micDiable";

    /**マイク利用可否のダイアログで「拒否」を選択された場合 */
    public static inline var MIC_DENIED: String = "micDenied";

    /** マイク利用可否のダイアログで「許可」を選択された場合 */
    public static inline var MIC_ENABLE: String = "micEnable";

    public function new() {
    }
}
