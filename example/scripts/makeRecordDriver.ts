import {Subject, Subscriber, Observable as O} from 'rxjs';
import {Observable as XObservable} from 'xstream';
import {RecordInput} from './interface';
import {FlashManager} from './FlashManager';

export function makeRecordDriver(manager: FlashManager) {
    return function RecordDriver(sink$: XObservable<RecordInput>) {
        const source = new Subject();
        const swf$ = new O<any>(
            (observer: Subscriber<any>) => {
                if (!(<any>window)['soundRecorder']) {
                    (<any>window)['soundRecorder'] = {};
                }
                (<any>window)['soundRecorder'] = Object.assign((<any>window)['soundRecorder'], {
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
                });
                observer.next(manager.borrow());
            }
        );
        O.from(sink$)
            .withLatestFrom(swf$)
            .subscribe(
                ([recordInput, swfObj]: [RecordInput, any]) => {
                    switch (recordInput.type) {
                        case 'setup':
                            swfObj.setupSecuritySetting();
                            // const swfWrapper = document.querySelector('.swf-wrapper');
                            // swfWrapper.classList.add('swf-wrapper--visible');
                            break;
                        case 'record-start':
                            const recordId = new Date().toLocaleString();
                            swfObj.startRecording(recordId);
                            break;
                        case 'record-stop':
                            swfObj.cancelRecording();
                            break;
                    }
                }
            );

        return source;
    }
}
