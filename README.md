# axios-rest-and-events

## Installation

Using npm:
```
npm install --save axios-rest-and-events
```
Using cdn:
```html
<script src="https://unpkg.com/axios-rest-and-events"></script>
```

## Example

```js
const net = new AxiosRestAndEvents();

console.log(await net.get('http://httpbin.org/get'));

let i = 0;

net.addEventListener('beforeReq', ({ data, next }) => {
    console.log(i);
    if (i > 5) next();
    else {
        i++;
        next(data);
    }
});
```

```js
const net = new AxiosRestAndEvents({
    baseURL: 'http://httpbin.org',
}, [
    {
        listener: 'beforeReq',
        handler: ({ data, next }) => {
            console.log(data);
            next();
        }
    }
])
```

## Constructor params

```js
new AxiosRestAndEvents(axiosCreateConfig, handlers);
```

#### axiosCreateConfig
- type: `Object`
- default: `{}`
- usage: if you need configurate axios, you can do it in this object, this object transmitted in `axios.create`

#### handlers

- type `Array`
- default: `[]`
- usage: add handlers after creating instance
- example:
```js
[{
    listener: 'beforeReq',
    handler: ({ data, next }) => {
        next();
    }
}]
```

## Events
### next
From all handlers you need to call `next` function to continue handlers queue
#### args
##### undefined
Queue don't stop and call next handler
```js
[{
    listener: 'beforeReq',
    handler: ({ data, next }) => {
        console.log(1);
        next();
    }
},
{
    listener: 'beforeReq',
    handler: ({ data, next }) => {
        console.log(2);
        next();
    }
}]
```
##### { config }
Queue stopping and creating new request with this config
```js
[{
    listener: 'beforeReq',
    handler: ({ data, next }) => {
        console.log(1);
        const myUrl = 'https://google.com';
        if (data.config.url !== myUrl) next({ config: { url: myUrl } });
        else next();
    }
},
{
    listener: 'beforeReq',
    handler: ({ data, next }) => {
        console.log(2); // we reach this, only if requsted url https://google.com
        next();
    }
}]
```
##### { response }
Queue stopping and response imitated by arg response
```js
[{
    listener: 'beforeReq',
    handler: ({ data, next }) => {
        console.log(1);
        next({ response: { data: 1 } }) // result { data: 1 }
    }
},
{
    listener: 'afterReq',
    handler: ({ data, next }) => {
        console.log(2); // we never reach this
        next();
    }
}]
```
##### { err }
Queue stopping and create promise reject
```js
[{
    listener: 'beforeReq',
    handler: ({ data, next }) => {
        console.log(1);
        next({ err: new Error('error') })
    }
},
{
    listener: 'beforeReq',
    handler: ({ data, next }) => {
        console.log(2); // we never reach this
        next();
    }
}]
```
##### false
Queue stoppint and reject promise, reject { data: 'ErrorText' }

### `beforeReq`
This event is happening before any requests
#### handler params
```js
({ data = { config: {} }, next }) => {
    console.log(data.config);
    next();
}
```
`config` - contain information about request
### `afterReq`
```js
({ data = { config: {}, response: {}, err: {} }, next  }) => {
    console.log(data);
    next();
}
```
`config` - contain information about request
`response` - defined if good request, contain response information
`err` - defined if err request
### `afterReqGood`
```js
({ data = { config: {}, response: {} }, next  }) => {
    console.log(data);
    next();
}
```
`config` - contain information about request
`response` - contain response information
### `afterReqErrorBadData`
```js
({ data = { config: {}, err: {} }, next  }) => {
    console.log(data);
    next();
}
```
`config` - contain information about request
`err` - defined if err request