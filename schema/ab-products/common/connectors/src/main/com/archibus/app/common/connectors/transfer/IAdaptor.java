package com.archibus.app.common.connectors.transfer;

import java.io.Closeable;

import com.archibus.app.common.connectors.transfer.exception.AdaptorException;

/**
 * An interface to a foreign system.
 *
 * @author cole
 *
 * @param <RequestType> the type of request that can be sent to this adaptor.
 * @param <ResponseType> the type of response that can be received from this adaptor.
 */
public interface IAdaptor<RequestType, ResponseType> extends Closeable {
    /**
     * Provide a message to be sent to the foreign system.
     *
     * @param message a message to the foreign system in a format supported by this adaptor.
     * @return requestHandle handle used to retrieve responses from the adaptor.
     * @throws AdaptorException if there is an issue communicating with the foreign system
     *             (including if the message is unsupported)
     */
    String request(final RequestType message) throws AdaptorException;
    
    /**
     * Receive a response from the foreign system for a request. This method may block indefinitely.
     *
     * @param requestHandle a handle returned from the request method to identify which received
     *            messages to return.
     * @return a message from the foreign system or null if there isn't one.
     * @throws AdaptorException if an eror occurs while receiving a message from the foreign source.
     */
    AdaptorResponse<ResponseType> receive(final String requestHandle) throws AdaptorException;
    
    /**
     * @param requestHandle a handle returned from the request method to identify which received
     *            messages to check for.
     * @return true, if and only if there are responses available.
     */
    boolean expectsResponses(final String requestHandle);
    
    /**
     * Closes the adaptor, including but not limited to closing any connections, releasing dedicated
     * resources and stopping any listeners. After this operation is called, this instance of the
     * adaptor should be considered inoperable.
     *
     * @throws AdaptorException if this adaptor's resources could not be freed.
     */
    @Override
    void close() throws AdaptorException;
}
