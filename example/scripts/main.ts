/// <reference path="../../node_modules/@types/swfobject/index.d.ts" />
import {Observable as O} from 'rxjs';
import {div, button, makeDOMDriver, i, footer, hr, select, option, pre, header, h3, VNode} from '@cycle/dom';
import {run} from '@cycle/rxjs-run';
import {Sources, Sinks, RecordInput, RecordDriverOptions, RecordOutput} from './interface';
import {DOMSource} from '@cycle/dom/rxjs-typings';
import {makeRecordDriver} from './makeRecordDriver';


function intent(DOM: DOMSource) {
    const setup$ = DOM.select('#setup').events('click').map((): RecordInput => {
        return { type: 'setup' };
    });
    const recordStart$ = DOM.select('#record-start').events('click').map((): RecordInput => {
        return { type: 'record-start' }
    });
    const recordStop$ = DOM.select('#record-stop').events('click').map((): RecordInput => {
        return { type: 'record-stop' }
    });
    const soundPlay$ = DOM.select('#sound-play').events('click').map((): RecordInput => {
        return { type: 'sound-play', id: (document.querySelector('#recorded-list') as HTMLSelectElement).value }
    });
    const soundStop$ = DOM.select('#sound-stop').events('click').map((): RecordInput => {
        return { type: 'sound-stop' }
    });

    return {
        setup$,
        recordStart$,
        recordStop$,
        soundPlay$,
        soundStop$
    };
}

function view(recordOutput: RecordOutput, recordIds: string[]): VNode {
    return div('.row', [
        div('.col-sm-6.col-sm-offset-3', [
            div('.panel.panel-default', [
                header('.panel-heading', [
                    h3('.panel-title', [
                        i('.fa.fa-microphone'),
                        ' Sound Recorder'
                    ])
                ]),
                div('.panel-body', [
                    div('.card.card-block', [
                        pre('#log.log', recordOutput.type)
                    ])
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
                        div('.player__col.player__col--recorded-list', [
                            select(
                                '#recorded-list.form-control.recorded-list',
                                recordIds.length ? recordIds.map(id => option({attrs: {value: id}}, id)) : option()
                            )
                        ]),
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
        ])
    ])
}


function main(so: Sources): Sinks {

    const recordIds: string[] = [];
    so.Record.forEach((output: RecordOutput) => {
        output.recordId && recordIds.push(output.recordId);
    });

    const actions = intent(so.DOM);
    const record$ = O.merge(
        actions.setup$,
        actions.recordStart$,
        actions.recordStop$,
        actions.soundPlay$,
        actions.soundStop$,
        so.Record.filter(output => output.micStatus === 'micDenied').mapTo({type: 'setup'})
    );

    const vdom$ = so.Record.startWith({type: 'managerPreparation'}).map((output: RecordOutput) => view(output, recordIds));

    return {
        DOM: vdom$,
        Record: record$
    };
}


const recordDriverOptions: RecordDriverOptions = {
    replaceElementId: 'swf',
    swfId: 'avm',
    callbackNamespace: 'soundRecorder',
    width: 280,
    height: 200,
    version: 24,
    debugMode: false,
};

const drivers = {
    DOM: makeDOMDriver('#app'),
    Record: makeRecordDriver(recordDriverOptions)
};

run(main, drivers);
