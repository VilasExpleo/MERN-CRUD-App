import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    private socket$ = io(environment.apiUrl, { transports: ['websocket'] });

    connectSocket(): void {
        this.socket$.connect();
    }

    disconnectSocket(): void {
        this.socket$.disconnect();
        this.socket$.removeAllListeners();
    }

    get socket(): Socket {
        return this.socket$;
    }
}
