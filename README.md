# zario-express

Express request logging middleware for the Zario logger library.

## Installation

Install `zario-express` along with its peer dependencies `zario` and `express` in your application:

```bash
# Using npm
npm install zario-express zario express

# Using bun
bun add zario-express zario express

# Using pnpm
pnpm add zario-express zario express
```

### Local Development / Linking

To link a local clone of `zario-express` to your application during development, reference its absolute path:

```bash
bun add file:/path/to/zario-express
```

## Usage

Register `expressLogger` as a middleware in your Express application.

```typescript
import express from 'express';
import { Logger } from 'zario';
import { expressLogger } from 'zario-express';

const app = express();

// Initialize the Zario Logger
const logger = new Logger({
  level: 'info',
  json: true,
  timestamp: true
});

// Register the logging middleware
app.use(expressLogger({
  logger,
  level: 'info',
  excludePaths: ['/health', '/metrics']
}));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => {
  logger.info('Server started on port 3000');
});
```

## Configuration Options

The `expressLogger` function accepts an optional configuration object:

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `logger` | `Logger` | `Logger.global` | The Zario Logger instance to pipe logs to. |
| `level` | `string` | `'info'` | The log level used for request completion logs. |
| `excludePaths` | `string[]` | `[]` | List of routes/paths to skip logging entirely (e.g. health checks). |

## Log Output Format

When a request completes, a structured log entry is recorded with the following metadata:

```json
{
  "level": "info",
  "message": "GET /api/users 200 - 4.2ms",
  "timestamp": "2026-06-23T09:00:00.000Z",
  "method": "GET",
  "url": "/api/users",
  "status": 200,
  "responseTimeMs": 4.2,
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0..."
}
```

## License

MIT
