"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Publisher = exports.Subscriber = void 0;
class Subscriber {
}
exports.Subscriber = Subscriber;
class Publisher {
    subscribers = [];
    addSubscriber(subscriber) {
        this.subscribers.push(subscriber);
    }
    removeSubscriber(subscriber) {
        this.subscribers = this.subscribers.filter(sub => sub !== subscriber);
    }
    notifySubscribers(data, userName) {
        for (const subscriber of this.subscribers) {
            subscriber.update(data, userName);
        }
    }
}
exports.Publisher = Publisher;
