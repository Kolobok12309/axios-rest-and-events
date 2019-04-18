import axios from 'axios';
import Listener from './eventListener';
import consts from './consts';

const events = ['beforeReq', 'afterReq', 'afterReqGood', 'afterReqErrorNormal', 'afterReqErrorBadData'];

class Network {
    constructor(axiosCreateOptions = {}, handlers = []) {
        this._net = axios.create(axiosCreateOptions);

        this._listener = new Listener(events);

        handlers.forEach(({ listener, handler }) => {
            this.addEventListener(listener, handler);
        });
    }

    // Первая фаза отправки запроса
    _send(config = { method: 'get', url: '/ping', data: {} }) {
        return new Promise(async (res, rej) => {
            // Запуск обработчиков 'beforeReq'
            const beforeReqHandler = await this._listener.initHandlers('beforeReq', { config });
            // Обработки результатов обработиков
            this._handlerForHandlersResponses(beforeReqHandler, res, rej, () => {
                // Переход к следующей фазе отправки запроса
                this._send2(config)
                    .then(inResp => res(inResp))
                    .catch(inErr => rej(inErr));
            });
        });
    }

    // Вторая фаза отправки запроса
    _send2(config) {
        return new Promise((res, rej) => {
            this._net(config)
                .then(async (response) => {
                    // Запуск обработчиков 'afterReq'
                    const afterReqHandler = await this._listener.initHandlers('afterReq', { config, response });
                    // Обработки результатов обработиков
                    this._handlerForHandlersResponses(afterReqHandler, res, rej, async () => {
                        // Запуск обработчиков 'afterReqGood'
                        const afterReqGoodHandler = await this._listener.initHandlers('afterReqGood', { config, response });
                        // Обработки результатов обработиков
                        this._handlerForHandlersResponses(afterReqGoodHandler, res, rej, () => {
                            res(response);
                        });
                    });
                })
                .catch(async (err) => {
                    // Запуск обработчиков 'afterReq'
                    const afterReqHandler = await this._listener.initHandlers('afterReq', { config, err });
                    // Обработки результатов обработиков
                    this._handlerForHandlersResponses(afterReqHandler, res, rej, async () => {
                        // Запуск обработчиков 'afterReqErrorBadData'
                        const afterReqErrorBadDataHandler = await this._listener.initHandlers('afterReqErrorBadData', { config, err });
                        // Обработки результатов обработиков
                        this._handlerForHandlersResponses(afterReqErrorBadDataHandler, res, rej, () => {
                            rej(err);
                        });
                    });
                });
        });
    }

    // Приватная функция для обработки результатов событий
    _handlerForHandlersResponses(handlersResponse, res, rej, goodCall) {
        // Проверка возвращали-ли что-то обработчики
        if (handlersResponse) {
            // Если В ответе был config, отправляется еще один запрос
            if (handlersResponse.config) {
                this._send(handlersResponse.config)
                    .then(handlersResponseSend => res(handlersResponseSend))
                    .catch(handlersResponseSend => rej(handlersResponseSend));
                // Если есть response, сымитировать удачный ответ
            } else if (handlersResponse.response) {
                res(handlersResponse.response);
                // Если есть err, сымитировать неудачный ответ
            } else if (handlersResponse.err) {
                rej(handlersResponse.err);
                console.log(handlersResponse.err);
            } else {
                // Фатальная ошибка неизвестный ответ
                rej({ data: consts.Errors.fatalError });
            }
            // Закончить цепочку обработчиков и выдать ошибку
        } else if (handlersResponse === false) {
            rej({ data: consts.Errors.falseHandler });
            // Если ответа не было пойти дальше по цепочен запроса
        } else if (handlersResponse === undefined) {
            goodCall();
        } else {
            throw new Error(consts.Errors.fatalError);
        }
    }

    // Геттер получение токена авторизации
    get authToken() {
        return this._net.defaults.headers.common.auth;
    }

    // Установка токена авторизации
    set authToken(newToken) {
        const commonHeaders = this._net.defaults.headers.common;
        if (newToken && newToken !== '') {
            commonHeaders.authorization = newToken;
        } else {
            delete commonHeaders.authorization;
        }
    }

    // Добавление обработчика
    addEventListener(name, callback) {
        this._listener.addEventListener(name, callback);
    }

    // Удаление обработчика
    removeEventListener(name, callback) {
        this._listener.removeEventListener(name, callback);
    }

    // REST методы для апи

    get(url, data, options) {
        return this._send({
            method: 'get',
            data,
            url,
            ...options,
        });
    }

    patch(url, data, options) {
        return this._send({
            method: 'patch',
            data,
            url,
            ...options,
        });
    }

    delete(url, data, options) {
        return this._send({
            method: 'delete',
            data,
            url,
            ...options,
        });
    }

    post(url, data, options) {
        return this._send({
            method: 'post',
            data,
            url,
            ...options,
        });
    }

    put(url, data, options) {
        return this._send({
            method: 'put',
            data,
            url,
            ...options,
        });
    }
}

window.AxiosRestAndEvents = Network;

export default Network;
