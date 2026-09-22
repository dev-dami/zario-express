# zario-express

Request-scoped Zario logging for Express 4/5, tested on Bun.

```bash
bun add zario-express zario express
```

```ts
import express from 'express';
import { expressLogger } from 'zario-express';
import { zario } from 'zario';

const log = zario({ json: true });
const app = express();
app.use(expressLogger({ logger: log, excludePaths: ['/health'] }));
app.get('/', (req, res) => {
  req.log.info('handled');
  res.json({ requestId: req.requestId });
});
app.listen(3000);
// Stop accepting requests and drain the server before await log.close().
```

Register middleware before handlers that use `req.log` or `req.requestId`.
An omitted logger creates a console-only Zario factory instance. Supply a logger
when you need explicit flush/close ownership.

| Option | Default / behavior |
|---|---|
| `logger` | A new `zario()` instance |
| `level` | `info` for success, `warn` for 4xx, `error` for 5xx/aborted responses |
| `excludePaths` | Exact pathnames excluded from automatic completion logging |
| `requestId(req)` | Defaults to `crypto.randomUUID()`; headers are not trusted automatically |

Completion logs include `requestId`, `method`, `path`, `status`,
`responseTimeMs`, and `aborted`. Completion and connection-close events produce
at most one record. Excluded paths still receive a request logger. Custom log
levels use Zario's `logWithLevel()`.

## Changes from 1.0

The default no longer uses the process-wide `Logger.global`. Request logs now
use a pathname rather than the raw URL with query parameters, and do not emit
IP addresses or user-agent headers automatically. Update downstream schema
consumers from `url` to `path`; add any explicitly required fields through
`req.log`. Applications may supply a fixed `level` to retain uniform severity.

## Development

Bun is the package manager and test runner. Keep the core checkout at `../../zario`:

```text
workspace/
  zario/
  zario-adapters/
    zario-express/
```

Build the core first with `bun install --frozen-lockfile && bun run build` in
`workspace/zario`. Then in this adapter:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun test
bun run build
```

CI checks out and builds the pinned core revision before testing the adapter.
The relative development dependency stays out of the published runtime contract;
applications install the `zario` peer dependency normally. These changes require
Zario 0.9.0; publish the core before releasing this adapter.

## License

MIT
