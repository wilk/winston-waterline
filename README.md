winston-waterline
=================

[**Winston**](https://github.com/flatiron/winston) transport for [**Waterline**](https://github.com/balderdashy/waterline)

## Installation
First of all, install [**NPM**](https://www.npmjs.org/)

Then, use it to install Winston Waterline transport:

```bash
$ npm install winston-waterline
```

## Usage
```javascript
var winston = require('winston'),
    waterline = require('winston-waterline').Waterline,
    options = {...};

// It exposes the transport to the winston transports list
winston.add(winston.trasports.Waterline, options);
// or
winston.add(waterline, options);
```

## Options
  - **collection** {*WaterlineCollection*} (**required**): a Waterline Collection that reflects a database table or a document. It must have the following fields: id, message and timestamp.
  - **fields** {*Object*}: a field mapping object. By default, it has the following data:

    ```
    {
      id: 'id',
      message: 'message',
      timestamp: 'timestamp'
    }
    ```

    It can be override with a new map. For instance:

    ```
    {
      id: 'LOG_ID',
      message: 'LOG_MESSAGE',
      timestamp: 'LOG_TIMESTAMP',
      metadata: 'LOG_METADATA',
      userId: 'LOG_USERID'
    }
    ```

  - **level** {*String*}: the level of the transport. Default: info
  - **silent** {*Boolean*}: a flag to tell the transport to log even on the console
  - **safe** {*Boolean*}: a flag to tell the transport to check the consistency of the saved log

## License
The MIT License (MIT)

Copyright (c) 2014 Vincenzo Ferrari <wilk3ert@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
