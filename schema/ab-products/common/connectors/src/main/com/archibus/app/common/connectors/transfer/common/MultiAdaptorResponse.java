package com.archibus.app.common.connectors.transfer.common;

import com.archibus.app.common.connectors.transfer.IAdaptor;

/**
 * Represents information necessary to retrieve responses from a nested adaptor. Used to aggregate
 * adaptor responses.
 *
 * @author cole
 *
 * @param <ResponseType> the type of responses to expect.
 */
public class MultiAdaptorResponse<ResponseType> {
    /**
     * The adaptor to query for responses.
     */
    private final IAdaptor<?, ResponseType> adaptor;
    
    /**
     * The handle for the request that elicited the responses.
     */
    private final String requestHandle;

    /**
     * Create a representation of the responses to a request to an adaptor.
     *
     * @param adaptor the adaptor to query for responses.
     * @param requestHandle the handle for the request that elicited the responses.
     */
    public MultiAdaptorResponse(final IAdaptor<?, ResponseType> adaptor, final String requestHandle) {
        this.adaptor = adaptor;
        this.requestHandle = requestHandle;
    }
    
    /**
     * @return the adaptor to query for responses.
     */
    public IAdaptor<?, ResponseType> getAdaptor() {
        return this.adaptor;
    }

    /**
     * @return the handle for the request that elicited the responses.
     */
    public String getRequestHandle() {
        return this.requestHandle;
    }
}
