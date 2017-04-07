package com.archibus.app.common.connectors.transfer.common;

import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;

import com.archibus.app.common.connectors.transfer.AdaptorResponse;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;

/**
 * A class of adaptor that queues requests to be sent to the foreign system when a request is made
 * to the adaptor.
 *
 * @author cole
 *
 * @param <RequestType> the type of the request being made.
 * @param <RequestInstanceType> the type of the specific requests being queued to be sent to the
 *            foreign system.
 * @param <ResponseMessageType> the type of response to be returned from the foreign system.
 */
public abstract class AbstractQueuedRequestAdaptor<RequestType, RequestInstanceType, ResponseMessageType>
        extends
        AbstractHandleGeneratingAdaptor<RequestType, Queue<RequestInstanceType>, ResponseMessageType>
        implements IRequestProxyAdaptor<RequestInstanceType, ResponseMessageType> {

    /**
     *
     */
    protected AbstractQueuedRequestAdaptor() {
        super();
    }

    /**
     * Enqueue generated requests to the foreign system (request becomes open).
     *
     * @param message a message to the foreign system in a format supported by this adaptor.
     * @return request handle used to retrieve responses from the adaptor.
     * @throws AdaptorException if there is an issue communicating with the foreign system
     *             (including if the message is unsupported)
     */
    @Override
    public String request(final RequestType message) throws AdaptorException {
        final String requestHandle = getNextHandle();
        synchronized (this.requests) {
            final Collection<? extends RequestInstanceType> requestInstances =
                    getRequestInstances(message, requestHandle);
            if (requestInstances != null) {
                this.requests.put(requestHandle, new ConcurrentLinkedQueue<RequestInstanceType>(
                    requestInstances));
            }
        }
        return requestHandle;
    }

    /**
     * Generate requests to a foreign system based on the message provided to the request method.
     *
     * @param message the message to be sent to the foreign system, the one passed to the request
     *            method.
     * @param requestHandle the handle generated for the call to the request method.
     * @return a collection of requests to a foreign system.
     * @throws AdaptorException if the adaptor is unable to generate the requests.
     */
    protected abstract Collection<? extends RequestInstanceType> getRequestInstances(
            final RequestType message, final String requestHandle) throws AdaptorException;

    /**
     * Make the next queued request to the foreign system and return a response from the foreign
     * system for a request. This method may block indefinitely.
     *
     * @param requestHandle a handle returned from the request method to identify which received
     *            messages to return.
     * @return a message from the foreign system or null if there are no responses left for an open
     *         request (request becomes closed).
     * @throws AdaptorException when an attempt has been made to retrieve a response for a request
     *             that isn't open.
     */
    @Override
    public AdaptorResponse<ResponseMessageType> receive(final String requestHandle)
            throws AdaptorException {
        AdaptorResponse<ResponseMessageType> response = null;
        Queue<RequestInstanceType> requestInstances = null;
        synchronized (this.requests) {
            requestInstances = this.requests.get(requestHandle);
        }
        if (requestInstances == null) {
            throw new AdaptorException(
                "Attempt to retrieve a response from a foreign system when there is no open request.",
                null);
        } else {
            synchronized (requestInstances) {
                /*
                 * While there are more request instances Queued, but none have been processed
                 * successfully, try to find one.
                 */
                while (response == null && !requestInstances.isEmpty()) {
                    try {
                        response = makeRequest(requestInstances.remove(), requestHandle);
                    } catch (final AdaptorException e) {
                        synchronized (this.requests) {
                            if (this.requests.containsKey(requestHandle)) {
                                this.requests.remove(requestHandle);
                            }
                        }
                        throw new AdaptorException("Error making request to "
                                + getClass().getSimpleName() + ":" + e.getLocalizedMessage(), e);
                    }
                }
                /*
                 * Cleanup the queue if it's empty.
                 */
                if (requestInstances.isEmpty()) {
                    synchronized (this.requests) {
                        this.requests.remove(requestHandle);
                    }
                }
            }
        }
        return response;
    }
}
