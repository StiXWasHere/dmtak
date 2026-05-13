type LogLevel = "info" | "warn" | "error";

interface LogContext {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
}

function formatLog(logContext: LogContext): string {
  const { timestamp, level, context, message, data, error } = logContext;
  const levelUpper = level.toUpperCase().padEnd(5);
  const parts = [`[${timestamp}] ${levelUpper} [${context}] ${message}`];

  if (data && Object.keys(data).length > 0) {
    parts.push(`Data: ${JSON.stringify(data)}`);
  }

  if (error) {
    parts.push(`Error: ${error.message}`);
    if (error.stack) {
      parts.push(`Stack: ${error.stack}`);
    }
  }

  return parts.join(" | ");
}

export const logger = {
  info: (context: string, message: string, data?: Record<string, any>) => {
    const logContext: LogContext = {
      timestamp: new Date().toISOString(),
      level: "info",
      context,
      message,
      data,
    };
    console.log(formatLog(logContext));
  },

  warn: (context: string, message: string, data?: Record<string, any>) => {
    const logContext: LogContext = {
      timestamp: new Date().toISOString(),
      level: "warn",
      context,
      message,
      data,
    };
    console.warn(formatLog(logContext));
  },

  error: (context: string, message: string, errorOrData?: Error | Record<string, any>, additionalData?: Record<string, any>) => {
    const isError = errorOrData instanceof Error;
    const logContext: LogContext = {
      timestamp: new Date().toISOString(),
      level: "error",
      context,
      message,
      data: !isError ? errorOrData : additionalData,
      error: isError
        ? {
            message: errorOrData.message,
            stack: errorOrData.stack,
          }
        : undefined,
    };
    console.error(formatLog(logContext));
  },
};
