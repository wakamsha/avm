import {Subject, Subscriber, Observable as O} from 'rxjs';
import {Observable as XObservable} from 'xstream';
import {RecordDriverOptions, RecordInput} from './interface';

export function makeRecordDriver(driverOptions: RecordDriverOptions) {
    return function RecordDriver(sink$: XObservable<RecordInput>) {
        const source = new Subject();
        const swf$ = new O<any>(
            (observer: Subscriber<any>) => {
                (<any>window)[driverOptions.callbackNamespace] = {
                    onChangeMicStatus(status: string) {
                        switch (status) {
                            // マイクが利用できない場合
                            case 'micDisable':
                                alert('マイクが使えないので、マイク機器がお使いの PC に接続されているかご確認ください。');
                                break;
                            // マイク利用可否のダイアログで「拒否」を選択された場合
                            case 'micDenied':
                                alert('録音を試すには「許可」を選択してください');
                                break;
                            // マイク利用可否のダイアログで「許可」を選択された場合
                            case 'micEnable':
                                setTimeout(() => {
                                    const swfWrapper = document.querySelector('.swf-wrapper');
                                    swfWrapper.classList.remove('swf-wrapper--visible');
                                }, 0);
                                break;
                        }
                        const output = {
                            type: 'managerPreparation',
                            micStatus: status
                        };
                        source.next(output);
                    },
                    onStartRecording() {
                        const output = {
                            type: 'recording'
                        };
                        source.next(output);
                    },
                    onChangeRecorderStatus(status: string) {
                        const output = {
                            type: status
                        };
                        source.next(output);
                    },
                    onResult(recordId: string) {
                        const output = {
                            type: 'managerPreparation',
                            recordId
                        };
                        source.next(output);
                    }
                };

                const flashVars = {
                    callbackNamespace: driverOptions.callbackNamespace,
                    debugMode: driverOptions.debugMode
                };
                const params = {
                    quality: 'high',
                    bgcolor: '#596075',
                    allowscriptaccess: 'sameDomain',
                    allowfullscreen: 'true',
                    wmode: 'transparent'
                };
                const attributes = {
                    id: driverOptions.swfId,
                    name: driverOptions.swfId,
                    aligin: "middle"
                };
                swfobject.embedSWF(
                    "/avm.swf",
                    driverOptions.replaceElementId,
                    `${driverOptions.width}`,
                    `${driverOptions.height}`,
                    `${driverOptions.version}`,
                    "",// fallback swf url not set
                    flashVars,
                    params,
                    attributes,
                    ({success, ref}) => {
                        if (success && ref) {
                            observer.next(ref);
                        } else {
                            observer.error(new Error('swf_unavailable'));
                        }
                    }
                );
                return () => swfobject.removeSWF(driverOptions.replaceElementId);
            }
        );

        O.from(sink$)
            .withLatestFrom(swf$)
            .subscribe(
                ([recordInput, swfObj]: [RecordInput, any]) => {
                    switch (recordInput.type) {
                        case 'setup':
                            swfObj.setupSecuritySetting();
                            const swfWrapper = document.querySelector('.swf-wrapper');
                            swfWrapper.classList.add('swf-wrapper--visible');
                            break;
                        case 'record-start':
                            const recordId = new Date().toLocaleString();
                            swfObj.startRecording(recordId);
                            break;
                        case 'record-stop':
                            swfObj.cancelRecording();
                            break;
                        case 'sound-play':
                            swfObj.playSound(recordInput.id);
                            break;
                        case 'sound-stop':
                            swfObj.stopSound();
                            break;
                    }
                }
            );

        return source;
    }
}
