package com.archibus.app.solution.common.servlet;

import java.io.*;

import javax.servlet.*;
import javax.servlet.http.*;

/**
 * Notifies the client about server events, such as session expiration, using SSE.
 * <p>
 *
 * @author Sergey
 * @since 23.1
 */
public class ServerEventsServlet extends HttpServlet {

    /**
     * Property: serialVersionUID.
     */
    private static final long serialVersionUID = 3299407202775963984L;

    /**
     * The time interval, in seconds, to send timeout notifications to the client.
     */
    private static final int NOTIFICATION_PUSH_INTERVAL = 10;

    /**
     * Number of seconds in a minute.
     */
    private static final int SECONDS_IN_MINUTE = 60;

    /**
     * Number of milliseconds in a second.
     */
    private static final int MILLISECONDS_IN_SECOND = 1000;

    /**
     * Different states of the user session.
     */
    enum UserSessionState {
        /**
         * Session does not exist.
         */
        NONE,

        /**
         * Session has been created.
         */
        CREATED,

        /**
         * Session will expire soon.
         */
        ABOUT_TO_EXPIRE,

        /**
         * Session has expired.
         */
        EXPIRED
    }

    /**
     * The time interval, in minutes, before the session times out, to display the notification
     * about the upcoming session timeout.
     */
    private int notifyIntervalBeforeSessionTimeout = 1;

    @Override
    public void init(final ServletConfig servletConfig) throws ServletException {
        this.notifyIntervalBeforeSessionTimeout =
                Integer.parseInt(servletConfig
                    .getInitParameter("notifyIntervalBeforeSessionTimeout"));
    }

    // CHECKSTYLE:OFF Justifications: 1. Overridden method throws two exceptions. 2. Catch block
    // should ignore InterruptedException.
    @Override
    protected void doGet(final HttpServletRequest request, final HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/event-stream");
        response.setCharacterEncoding("UTF-8");

        if (this.notifyIntervalBeforeSessionTimeout > 0) {
            final PrintWriter out = response.getWriter();
            while (true) {
                // push the session state notification to the client...
                final UserSessionState state = getUserSessionState(request);
                out.print("event: user-session-state\n");
                out.print("data: " + state + "\n\n");
                out.flush();

                if (state == UserSessionState.EXPIRED) {
                    // close the request
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    // exist the loop, allow the app server to re-use this thread
                    break;
                }

                // ... every N seconds
                try {
                    Thread.sleep(NOTIFICATION_PUSH_INTERVAL * MILLISECONDS_IN_SECOND);
                } catch (final InterruptedException e) {
                    // should not happen, ignore
                }
            }
        }
    }

    // CHECKSTYLE:ON

    /**
     * Returns the user session state.
     *
     * @param request The HTTP request.
     * @return The state.
     */
    private UserSessionState getUserSessionState(final HttpServletRequest request) {
        UserSessionState state = UserSessionState.NONE;

        final HttpSession session = request.getSession();
        final long lastAccessedTime = session.getLastAccessedTime();
        final int maxInactiveInterval = session.getMaxInactiveInterval();
        final long expirationTime = lastAccessedTime + maxInactiveInterval * MILLISECONDS_IN_SECOND;

        if (expirationTime < System.currentTimeMillis()) {
            state = UserSessionState.EXPIRED;
        } else if (expirationTime - (long) this.notifyIntervalBeforeSessionTimeout
                * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND < System.currentTimeMillis()) {
            state = UserSessionState.ABOUT_TO_EXPIRE;
        } else {
            state = UserSessionState.CREATED;
        }

        return state;
    }
}
