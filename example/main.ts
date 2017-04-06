/// <reference path="../node_modules/@types/swfobject/index.d.ts" />
import {Observable as O, Subject} from 'rxjs';
import {Observable as XObservable} from 'xstream';
import {DOMSource} from '@cycle/dom/rxjs-typings';
import {VNode, div, button, makeDOMDriver, span, i, footer, hr} from '@cycle/dom';
import {run} from '@cycle/rxjs-run';

type Sources = {
    DOM: DOMSource;
    Record: O<RecordOutput>;
}

type Sinks = {
    DOM: O<VNode>;
    Record: O<RecordInput>;
}

type RecordInput = {
    type: 'setup' | 'record-start' | 'record-stop' | 'sound-stop';
    category: string;
} | {
    type: 'sound-play';
    id: string;
}

type RecordOutput = {
    type: 'managerRecording' | 'managerPlaying' | 'managerPreparation' | 'managerOnReady' | 'managerSuspended';
    recordId?: string;
};

type RecordDriverOptions = {
    replaceElementId: string;
    swfId: string;
    callbackNamespace: string;
    width: number;
    height: number;
    version: number;
    debugMode: boolean;
}


function main(so: Sources): Sinks {
    const setupAction$ = so.DOM.select('#setup').events('click').map((): RecordInput => {
        return {
            type: 'setup',
            category: 'example'
        };
    });
    const recordStartAction$ = so.DOM.select('#record-start').events('click').map((): RecordInput => {
        return {
            type: 'record-start',
            category: 'example'
        }
    });
    const recordStopActions$ = so.DOM.select('#record-stop').events('click').map((): RecordInput => {
        return {
            type: 'record-stop',
            category: 'example'
        }
    });
    const soundPlayAction$ = so.DOM.select('#sound-play').events('click').map((): RecordInput => {
        return {
            type: 'sound-play',
            id: 'hoge'
        }
    });
    const soundStopAction$ = so.DOM.select('#sound-stop').events('click').map((): RecordInput => {
        return {
            type: 'sound-stop',
            category: 'example'
        }
    });

    const vdom$ = so.Record.startWith({type: 'preparation'}).map(output => {
        return div('.row', [
            div('.col-sm-6', [
                div('.panel.panel-default', [
                    div('.panel-body', [
                        span(output.type)
                    ]),
                    footer('.panel-footer', [
                        button('#setup.btn.btn-default', [
                            i('.fa.fa-cog'),
                            ' Setup'
                        ]),
                        div('.btn-group', [
                            button('#record-start.btn.btn-default', [
                                i('.fa.fa-circle.text-danger'),
                                ' Rec'
                            ]),
                            button('#record-stop.btn.btn-default', [
                                i('.fa.fa-square'),
                                ' Stop'
                            ]),
                        ]),
                        hr(),
                        div('.player', [
                            div('.player__col', [
                                div('.btn-group', [
                                    button('#sound-play.btn.btn-default', [
                                        i('.fa.fa-play.text-primary'),
                                        ' Play'
                                    ]),
                                    button('#sound-stop.btn.btn-default', [
                                        i('.fa.fa-square'),
                                        ' stop'
                                    ]),
                                ]),
                            ])
                        ])
                    ])
                ])
            ]),
        ])
    });

    return {
        DOM: vdom$,
        Record: O.merge(setupAction$, recordStartAction$, recordStopActions$, soundPlayAction$, soundStopAction$)
    };
}

function makeRecordDriver(driverOptions: RecordDriverOptions) {
    return function RecordDriver(sink$: XObservable<any>) {
        const source = new Subject();

        const flashVars = {
            callbackNamespace: driverOptions.callbackNamespace,
            debugMode: driverOptions.debugMode
        };
        const params = {
            quality: 'high',
            bgcolor: '#596075',
            allowscriptaccess: 'sameDomain',
            allowfullscreen: 'true'
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
                    // console.log(success);
                    // console.log(ref);
                    // TODO subject.next(ref)
                } else {
                    console.log('NG');
                    // TODO subject.error(new Error('swf_unavailable'))
                }
            }
        );

        (<any>window)[driverOptions.callbackNamespace] = {
            onChangeMicStatus(status: string) {
                switch (status) {
                    // マイクが利用できない場合
                    case 'micDisable':
                        break;
                    // マイク利用可否のダイアログで「拒否」を選択された場合
                    case 'micDenied':
                        break;
                    // マイク利用可否のダイアログで「許可」を選択された場合
                    case 'micEnable':
                        break;
                }
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

        O.from(sink$)
            .subscribe(
                (recordInput: RecordInput) => {
                    const swfObj = (<any>window)[driverOptions.swfId];
                    switch (recordInput.type) {
                        case 'setup':
                            swfObj.setupSecuritySetting();
                            break;
                        case 'record-start':
                            swfObj.startRecording('hoge');
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

const recordDriverOptions: RecordDriverOptions = {
    replaceElementId: 'swf',
    swfId: 'avm',
    callbackNamespace: 'soundRecorder',
    width: 300,
    height: 240,
    version: 24,
    debugMode: true,
};

const drivers = {
    DOM: makeDOMDriver('#app'),
    Record: makeRecordDriver(recordDriverOptions)
};

run(main, drivers);
