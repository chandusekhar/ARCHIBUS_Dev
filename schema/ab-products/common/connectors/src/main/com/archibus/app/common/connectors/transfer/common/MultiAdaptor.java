package com.archibus.app.common.connectors.transfer.common;

import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.app.common.connectors.transfer.*;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;

/**
 * An adaptor for making the same request to multiple similar adaptors, where reading the message is
 * not destructive.
 *
 * @author cole
 * @since 21.4
 *
 * @param <RequestType> the type of request to be made.
 * @param <ResponseType> the type of response to expect.
 */
public class MultiAdaptor<RequestType, ResponseType>
        extends
        // CHECKSTYLE:OFF checkstyle doesn't like internal classes to a generic class.
        AbstractHandleGeneratingAdaptor<RequestType, List<MultiAdaptorResponse<ResponseType>>, ResponseType> {
    // CHECKSTYLE:ON
    
    /**
     * A log, in case of multiple exceptions.
     */
    private final Logger log = Logger.getLogger(MultiAdaptor.class);

    /**
     * Adaptors to send requests to.
     */
    private final List<IAdaptor<RequestType, ResponseType>> adaptors;

    /**
     * Constructor accepting adaptors to send responses to.
     *
     * @param adaptors list of adaptors in the order messages should be sent to them.
     */
    public MultiAdaptor(final List<IAdaptor<RequestType, ResponseType>> adaptors) {
        super();
        this.adaptors = new ArrayList<IAdaptor<RequestType, ResponseType>>(adaptors);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public String request(final RequestType message) throws AdaptorException {
        final String handle = getNextHandle();
        final List<MultiAdaptorResponse<ResponseType>> responseHandles =
                new ArrayList<MultiAdaptorResponse<ResponseType>>();
        for (final IAdaptor<RequestType, ResponseType> adaptor : this.adaptors) {
            responseHandles.add(new MultiAdaptorResponse<ResponseType>(adaptor, makeRequest(
                adaptor, message)));
        }
        synchronized (this.requests) {
            this.requests.put(handle, responseHandles);
        }
        return handle;
    }
    
    /**
     * Makes a request to an adaptor. Can be overridden to buffer destructively read messages.
     *
     * @param adaptor adaptor to send the message to.
     * @param message the message to send.
     * @return the request handle for the response.
     * @throws AdaptorException if there is an issue communicating with the foreign system
     *             (including if the message is unsupported), or buffering the message.
     */
    protected String makeRequest(final IAdaptor<RequestType, ResponseType> adaptor,
            final RequestType message) throws AdaptorException {
        return adaptor.request(message);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public AdaptorResponse<ResponseType> receive(final String requestHandle)
            throws AdaptorException {
        AdaptorResponse<ResponseType> adaptorResponse = null;
        synchronized (this.requests) {
            if (this.requests.containsKey(requestHandle)) {
                final List<MultiAdaptorResponse<ResponseType>> responses =
                        this.requests.get(requestHandle);
                final MultiAdaptorResponse<ResponseType> response = responses.get(0);
                adaptorResponse = response.getAdaptor().receive(response.getRequestHandle());
                if (!response.getAdaptor().expectsResponses(response.getRequestHandle())) {
                    this.requests.remove(response.getRequestHandle());
                }
            }
        }
        return adaptorResponse;
    }

    @Override
    public void close() throws AdaptorException {
        final List<AdaptorException> exceptions = new ArrayList<AdaptorException>();
        for (final IAdaptor<RequestType, ResponseType> adaptor : this.adaptors) {
            try {
                adaptor.close();
            } catch (final AdaptorException e) {
                exceptions.add(e);
                this.log.error("Error closing connector adaptor", e);
            }
        }
        if (!exceptions.isEmpty()) {
            throw new AdaptorException("Exception closing one or more adaptor.  First one nested.",
                exceptions.get(0));
        }
    }
}
