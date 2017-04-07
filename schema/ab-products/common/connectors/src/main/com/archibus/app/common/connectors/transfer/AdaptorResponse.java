package com.archibus.app.common.connectors.transfer;

import java.util.Date;

/**
 * The response to a request to an Adaptor.
 *
 * @author cole
 *
 * @param <MessageType> the type of message in the response.
 */
public class AdaptorResponse<MessageType> {
    /**
     * The time the message was received or as close as possible.
     */
    private final Date responseTime;

    /**
     * The message that was received in it's raw form.
     */
    private final MessageType message;

    /**
     * Package a response to a request sent to an Adaptor.
     *
     * @param message the message that was received in it's raw form.
     */
    public AdaptorResponse(final MessageType message) {
        this.responseTime = new Date();
        this.message = message;
    }

    /**
     * Package a response to a request sent to an Adaptor.
     *
     * @param responseTime the time the message was received or as close as possible.
     * @param message the message that was received in it's raw form.
     */
    public AdaptorResponse(final Date responseTime, final MessageType message) {
        this.responseTime = responseTime;
        this.message = message;
    }

    /**
     * @return the time the message was received or as close as possible.
     */
    public Date getResponseTime() {
        return this.responseTime;
    }

    /**
     * @return the message that was received in it's raw form.
     */
    public MessageType getMessage() {
        return this.message;
    }
}
