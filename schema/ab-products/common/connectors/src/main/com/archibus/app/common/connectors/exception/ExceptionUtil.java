package com.archibus.app.common.connectors.exception;

import java.util.*;
import java.util.regex.*;

import com.archibus.utility.ExceptionBase;

/**
 * Utilities for formatting exceptions.
 *
 * @author cole
 * @since 22.1
 *
 */
public final class ExceptionUtil {
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private ExceptionUtil() {
    }

    /**
     * @param exception the exception.
     * @return string to log for exception.
     */
    public static String getExceptionBaseMessage(final ExceptionBase exception) {
        String message = exception.toStringForLogging();
        final Pattern pattern = Pattern.compile("(\\|\\d+|\\r?\\n\\s+at)");
        final Matcher traceMatcher = pattern.matcher(message);
        if (traceMatcher.find()) {
            message = message.substring(0, traceMatcher.start());
        }
        if (exception instanceof StepException && exception.getLocalizedMessage() != null) {
            String stepMessage = exception.getLocalizedMessage();
            final Matcher messageMatcher = pattern.matcher(stepMessage);
            if (messageMatcher.find() && messageMatcher.end() == stepMessage.length()) {
                stepMessage = stepMessage.substring(0, messageMatcher.start());
            }
            message = stepMessage + '\n' + message;
        }
        return message;
    }

    /**
     * @param exception a runtime exception.
     * @return the message from the runtime exception.
     */
    public static Object getRuntimeExceptionMessage(final RuntimeException exception) {
        String message;
        if (exception instanceof ExceptionBase) {
            message = getExceptionBaseMessage((ExceptionBase) exception);
        } else if (exception.getLocalizedMessage() == null) {
            if (exception.getMessage() == null) {
                message = exception.toString();
            } else {
                message = exception.getMessage();
            }
        } else {
            message = exception.getLocalizedMessage();
        }
        return message;
    }

    /**
     * @param exception the exception.
     * @param packagePrefix the prefix to filter for.
     * @return the stack trace up to the give prefix.
     */
    public static String getFilteredStackTrace(final Throwable exception, final String packagePrefix) {
        final StringBuilder messageBuilder = new StringBuilder();
        final Set<Throwable> causes = new HashSet<Throwable>();
        Throwable cause = exception;
        while (cause != null && !causes.contains(cause)) {
            if (!cause.equals(exception)) {
                messageBuilder.append("\nCaused By: ");
            }
            if (exception instanceof RuntimeException) {
                messageBuilder.append(getRuntimeExceptionMessage((RuntimeException) exception));
            } else {
                messageBuilder.append(exception);
            }
            appendFilteredTrace(exception, packagePrefix, messageBuilder);
            causes.add(cause);
            cause = cause.getCause();
        }
        return messageBuilder.toString();
    }
    
    /**
     * @param exception the exception.
     * @param packagePrefix the prefix to filter up to.
     * @param messageBuilder where to append the trace.
     */
    private static void appendFilteredTrace(final Throwable exception, final String packagePrefix,
            final StringBuilder messageBuilder) {
        boolean connectorPackageFound = false;
        final int messageIndex = messageBuilder.length();
        final StackTraceElement[] trace = exception.getStackTrace();
        for (int traceIndex = trace.length - 1; traceIndex >= 0; traceIndex--) {
            final StackTraceElement traceElement = trace[traceIndex];
            if (traceElement.getClassName().startsWith(packagePrefix)) {
                connectorPackageFound = true;
            }
            if (connectorPackageFound) {
                messageBuilder.insert(messageIndex, traceElement.toString()).insert(messageIndex,
                    "\n at ");
            }
        }
    }
}
