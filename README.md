# zario-express

Express request logging middleware for Zario.

## Installation

```bash
npm install zario-express
```

Make sure you also have `zario` and `express` installed.

## Usage

```typescript
import express from 'express';
import { Logger } from 'zario';
import { expressLogger } from 'zario-express';

const app = express();
const logger = new Logger();

// Register the logging middleware
app.use(expressLogger({ logger }));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000);
```

## Options

- `logger`: The Zario `Logger` instance to use (defaults to `Logger.global`).
- `level`: The log level to log requests at (defaults to `'info'`).
- `excludePaths`: Array of string paths to exclude from logging.
