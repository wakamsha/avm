import {SWFParams} from './interface';

export class FlashManager {

    private swfObj: any;

    private baseParams: any = {
        quality: 'high',
        bgcolor: '#596075',
        allowscriptaccess: 'sameDomain',
        allowfullscreen: 'true'
    };

    constructor(private swfParams: SWFParams) {
        this.createSWFObject();
    }

    private createSWFObject() {
        const obj: Element = document.createElement('object');
        obj.setAttribute('type', 'application/x-shockwave-flash');
        obj.setAttribute('data', '/avm.swf');
        obj.setAttribute('id', this.swfParams.swfId);
        obj.setAttribute('width', `${this.swfParams.width}`);
        obj.setAttribute('height', `${this.swfParams.height}`);

        Object.keys(this.baseParams).forEach(key => {
            const param = document.createElement('param');
            param.setAttribute('name', key);
            param.setAttribute('value', `${this.baseParams[key]}`);
            obj.appendChild(param);
        });
        const param = document.createElement('param');
        param.setAttribute('name', 'FlashVars');
        param.setAttribute('value', `callbackNamespace=${this.swfParams.callbackNamespace}&debugMode=${this.swfParams.debugMode}`);
        obj.appendChild(param);

        const replaceElement = document.getElementById(this.swfParams.replaceElementId);
        replaceElement.appendChild(obj);

        this.swfObj = (<any>window)[this.swfParams.swfId];
    }

    public borrow(): any {
        return this.swfObj;
    }
}
