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

### Basic Usage (Zero Configuration)

You can register the middleware directly without importing the core `zario` library. It will automatically use the default global Zario logger.

```typescript
import express from 'express';
import { expressLogger } from 'zario-express';

const app = express();

// Register the logging middleware
app.use(expressLogger());

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000);
```

### Custom Logger Usage

If you need to configure custom settings (such as JSON formatting or log levels), initialize a Zario `Logger` instance and pass it to the middleware.

```typescript
import express from 'express';
import { Logger } from 'zario';
import { expressLogger } from 'zario-express';

const app = express();

// Initialize custom Zario Logger
const customLogger = new Logger({
  level: 'info',
  json: true,
  timestamp: true
});

// Pass the custom logger to the middleware
app.use(expressLogger({
  logger: customLogger,
  level: 'info',
  excludePaths: ['/health', '/metrics']
}));

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000);
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
