import {SWFParams} from './interface';

export class FlashManager {

    private targetElement: Element;
    private swfObj: any;
    private callbacks: any;

    private baseParams: any = {
        quality: 'high',
        bgcolor: '#596075',
        allowscriptaccess: 'sameDomain',
        allowfullscreen: 'true',
        wmode: 'transparent'
    };

    constructor(private swfParams: SWFParams) {
        this.callbacks = (<any>window)[this.swfParams.callbackNamespace] = {};
        this.createSWFObject();
    }

    public borrow(): any {
        return this.swfObj;
    }

    /**
     * SWF オブジェクト表示 / 非表示をトグルする
     * @param visibility
     */
    public toggleSWFVisibility(visibility: boolean) {
        if (visibility) {
            this.targetElement.classList.add('swf-wrapper--visible');
        } else {
            this.targetElement.classList.remove('swf-wrapper--visible');
        }
    }

    /**
     * Flash からのコールバック関数を登録する
     * @param callback
     */
    public addCallbacks(callback: any) {
        this.callbacks = Object.assign(this.callbacks, callback);
    }

    /**
     * swfParams から SWF オブジェクトを生成する
     */
    private createSWFObject() {
        const obj: Element = document.createElement('object');
        obj.setAttribute('type', 'application/x-shockwave-flash');
        obj.setAttribute('data', this.swfParams.swfUrl);
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

        this.targetElement = document.querySelector(this.swfParams.targetSelector);
        this.targetElement.innerHTML = '';
        this.targetElement.appendChild(obj);

        this.swfObj = (<any>window)[this.swfParams.swfId];
    }
}
