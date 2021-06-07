// move this declarations somewhere else
export interface Action {
    // so far a marker interface
}

export interface ActionReceiver {
    receive(action: Action): void
}

export interface NotifyStateChanged {
    register(callback: () => void): void
}

class Dispatcher {
    private receivers: ActionReceiver[] = []

    constructor() {}

    public dispatch(action: Action) {
        this.receivers.forEach(receiver => receiver.receive(action))
    }

    public register(receiver: ActionReceiver) {
        this.receivers.push(receiver)
    }

    public clear() {
        this.receivers = []
    }
}

export default new Dispatcher()
