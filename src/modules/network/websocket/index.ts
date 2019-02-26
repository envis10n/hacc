import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter as EE } from 'ee-ts';

export interface InternalData {
    [key: string]: any;
    [key: number]: any;
}

type ContextObject = InternalData;

type JSONValue = Exclude<any, Function | undefined>;

interface JSONObject {
    [key: string]: JSONValue;
}

interface ClientEvents {
    open(): void;
    message(message: string, context: ContextObject): void;
    json(dobj: JSONObject, context: ContextObject): void;
    close(code?: number, reason?: string): void;
}

export class WClient extends EE<ClientEvents> {
    readonly uuid: string = uuidv4();
    private socket: WebSocket;
    private internal: InternalData = {};
    public authenticated: boolean = false;
    constructor(uri: string){
        super();
        this.socket = new WebSocket(uri);
        this.socket.on('open', () => {
            this.emit('open');
        });
        this.socket.on('message', (message) => {
            message = message.toString();
            if(this.authenticated){
                this.emit('message', message, {
                    socket: this
                });
                try {
                    let dobj: JSONObject = JSON.parse(message);
                    if(Object.keys(dobj).length > 0) {
                        this.emit('json', dobj, {
                            socket: this
                        });
                    }
                } catch(e) {

                }
            }
        });
    }
    send(...args: string[]) {
        this.socket.send(args.join(' '));
    }
    json(obj: JSONObject) {
        this.socket.send(JSON.stringify(Object.assign({ts: Date.now()}, obj)));
    }
}