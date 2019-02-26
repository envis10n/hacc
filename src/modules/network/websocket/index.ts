import * as WS from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter as EE } from 'ee-ts';

interface InternalData {
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
    error(err: Error): void;
    close(code?: number, reason?: string): void;
}

class WebSocket extends EE<ClientEvents> {
    readonly uuid: string = uuidv4();
    private socket: WS;
    private internal: InternalData = {};
    public authenticated: boolean = false;
    constructor(socket: WS){
        super();
        this.socket = socket;
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
        this.socket.on('error', (err) => {
            this.emit('error', err);
        });
        this.socket.on('close', (code, reason) => {
            this.emit('close', code, reason);
        });
    }
    send(...args: string[]) {
        this.socket.send(args.join(' '));
    }
    json(obj: JSONObject) {
        this.socket.send(JSON.stringify(Object.assign({ts: Date.now()}, obj)));
    }
}

interface ServerEvents {
    connection(socket: WebSocket): void;
    listening(port?: number): void;
    close(): void;
    error(err: Error): void;
}

namespace WebSocket {
    export class Server extends EE<ServerEvents> {
        private server: WS.Server;
        private clients: Map<string, WebSocket> = new Map();
        constructor(options: WS.ServerOptions) {
            super();
            this.server = new WS.Server(options, () => {
                this.emit('listening', options.port);
            });
            this.server.on('connection', (socket) => {
                let client: WebSocket = new WebSocket(socket as WS);
                client.on('close', (code, reason) => {
                    console.log(`Disconnect from client ${client.uuid}`);
                    this.clients.delete(client.uuid);
                });
                this.clients.set(client.uuid, client);
                this.emit('connection', client);
            });
            this.server.on('close', () => {
                this.emit('close');
            });
            this.server.on('error', (error) => {
                this.emit('error', error);
            });
        }
        GetClient(id: string): WebSocket | undefined {
            return this.clients.get(id);
        }
        Broadcast(message: string) {
            for(let d of this.clients){
                d[1].send(message);
            }
        }
        BroadcastJSON(obj: JSONObject) {
            let message = JSON.stringify(Object.assign({ts: Date.now()}, obj));
            this.Broadcast(message);
        }
    }
}

export = WebSocket;