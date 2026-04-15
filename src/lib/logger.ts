type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
    };
  }

  return error;
}

function writeLog(level: LogLevel, event: string, context: LogContext = {}) {
  const payload = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...context,
    error: context.error ? normalizeError(context.error) : undefined,
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  if (level === "debug") {
    console.debug(line);
    return;
  }

  console.info(line);
}

export const logger = {
  debug: (event: string, context?: LogContext) =>
    writeLog("debug", event, context),
  info: (event: string, context?: LogContext) =>
    writeLog("info", event, context),
  warn: (event: string, context?: LogContext) =>
    writeLog("warn", event, context),
  error: (event: string, context?: LogContext) =>
    writeLog("error", event, context),
};
