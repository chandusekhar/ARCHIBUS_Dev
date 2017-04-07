package com.archibus.app.common.connectors.transfer.common;

import com.archibus.app.common.connectors.transfer.*;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;

/**
 * A class of adaptor that queues requests to be sent to the foreign system when a request is made
 * to the adaptor.
 * 
 * @author cole
 * 
 * @param <RequestType> the type of the request being made.
 * @param <ResponseMessageType> the type of response to be returned from the foreign system.
 */
public abstract class AbstractSingleRequestAdaptor<RequestType, ResponseMessageType>
        extends
        AbstractHandleGeneratingAdaptor<RequestType, AdaptorResponse<ResponseMessageType>, ResponseMessageType>
        implements IRequestProxyAdaptor<RequestType, ResponseMessageType> {
    
    /**
     * Create an adaptor that makes a single request to an adaptor and receives a single response.
     */
    protected AbstractSingleRequestAdaptor() {
        super();
    }
    
    /**
     * Enqueue generated requests to the foreign system.
     * 
     * @param message a message to the foreign system in a format supported by this adaptor.
     * @return request handle used to retrieve responses from the adaptor.
     * @throws AdaptorException if there is an issue communicating with the foreign system
     *             (including if the message is unsupported)
     */
    public String request(final RequestType message) throws AdaptorException {
        final String requestHandle = getNextHandle();
        synchronized (this.requests) {
            this.requests.put(requestHandle, makeRequest(message, requestHandle));
        }
        return requestHandle;
    }
    
    /**
     * Make the next queued request to the foreign system and return a response from the foreign
     * system for a request. This method may block indefinitely.
     * 
     * @param requestHandle a handle returned from the request method to identify which received
     *            messages to return.
     * @return a message from the foreign system.
     */
    public AdaptorResponse<ResponseMessageType> receive(final String requestHandle) {
        synchronized (this.requests) {
            return this.requests.remove(requestHandle);
        }
    }
}
