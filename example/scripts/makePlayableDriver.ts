import {Subject, Subscriber, Observable as O} from 'rxjs';
import {FlashManager} from './FlashManager';
import {PlayInput} from './interface';

export function makePlayableDriver(manager: FlashManager) {
    return function PlayableDriver(sink$: O<PlayInput>) {
        const source = new Subject();
        const swf$ = new O<any>(
            (observer: Subscriber<any>) => {
                manager.addCallbacks({
                    onChangeRecorderStatus: (status: string) => {
                        const output = {
                            type: status
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
                ([playInput, swfObj]: [PlayInput, any]) => {
                    switch (playInput.type) {
                        case 'sound-play':
                            swfObj.playSound(playInput.id);
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
