import {Observable as O} from 'rxjs';
import {VNode} from '@cycle/dom';
import {DOMSource} from '@cycle/dom/rxjs-typings';

export type Sources = {
    DOM: DOMSource;
    Record: O<RecordOutput>;
}

export type Sinks = {
    DOM: O<VNode>;
    Record: O<RecordInput>;
}

export type RecordInput = {
    type: 'setup' | 'record-start' | 'record-stop' | 'sound-stop';
} | {
    type: 'sound-play';
    id: string;
}

export type RecordOutput = {
    type: 'managerRecording' | 'managerPlaying' | 'managerPreparation' | 'managerOnReady' | 'managerSuspended';
    micStatus: 'micDisable' | 'micDenied' | 'micEnable';
    recordId?: string;
};

export type RecordDriverOptions = {
    replaceElementId: string;
    swfId: string;
    callbackNamespace: string;
    width: number;
    height: number;
    version: number;
    debugMode: boolean;
}
