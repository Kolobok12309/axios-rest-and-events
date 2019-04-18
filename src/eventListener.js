// Список ошибок
const Errors = {
    prefix: '[Listener]',
    get nameNotFound() {
        return `${this.prefix} This name not found in allowed events`;
    },
};

export default class Listener {
    constructor(events = [], handlers = []) {
        this.events = events;
        this._handlers = {};
        this._initHandleStore();
    }

    // Инициализация хранилища событий
    _initHandleStore() {
        this.events.forEach((event) => {
            this._handlers[event] = [];
        });
    }

    // Добавление хука на событие
    addEventListener(name, callback) {
        if (~this.events.indexOf(name)) {
            this._handlers[name].push(callback);
        } else {
            // В случае если такое событие не предусмотрено выбросить ошибку
            throw new Error(Errors.nameNotFound);
        }
    }

    removeEventListener(name, callback) {
        if (~this.events.indexOf(name)) {
            const index = this._handlers[name].indexOf(callback);
            if (~index) this._handlers[name].splice(index, 1);
        } else {
            // В случае если такое событие не предусмотрено выбросить ошибку
            throw new Error(Errors.nameNotFound);
        }
    }

    // Асинхронный запуск всех обработчиков
    async initHandlers(name, event) {
        if (~this.events.indexOf(name)) {
            const arr = this._handlers[name];
            // Запуск обработчиков конкретного события в очереди(очередь за счет for)
            for (const handler of arr) {
                // Асинхронное ожидание завершение обработчик
                const callbackResult = await new Promise((res) => {
                    handler({ data: event, next: res });
                });
                // В случае если обработчик вернул что-то кроме undefined вернуть это значение
                if (callbackResult !== undefined) return callbackResult;
            }
        } else {
            // В случае если такое событие не предусмотрено выбросить ошибку
            throw new Error(Errors.nameNotFound);
        }
    }
}
