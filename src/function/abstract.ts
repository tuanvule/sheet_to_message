
export abstract class Subscriber {
    abstract update(data: any, userName: string): void;
}

export class Publisher {
    private subscribers: Subscriber[] = [];
    addSubscriber(subscriber: Subscriber): void {
        this.subscribers.push(subscriber);
    }
    removeSubscriber(subscriber: Subscriber): void {
        this.subscribers = this.subscribers.filter(sub => sub !== subscriber);
    }
    public notifySubscribers(data: any, userName: string): void {
        for (const subscriber of this.subscribers) {
            subscriber.update(data, userName);
        }
    }
}