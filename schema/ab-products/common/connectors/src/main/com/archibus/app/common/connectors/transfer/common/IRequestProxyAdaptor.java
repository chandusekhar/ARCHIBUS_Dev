package com.archibus.app.common.connectors.transfer.common;

import com.archibus.app.common.connectors.transfer.*;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;

/**
 * An adaptor that makes a request on behalf of the request() method, but may perform additional
 * processing before or after making the request.
 * 
 * @author cole
 * 
 * @param <RequestInstanceType> the type of the specific requests being queued to be sent to the
 *            foreign system.
 * @param <ResponseMessageType> the type of response to be returned from the foreign system.
 */
public interface IRequestProxyAdaptor<RequestInstanceType, ResponseMessageType> {
    /**
     * Make this instance of the request to the foreign system.
     * 
     * @param requestInstance the current instance of the request to be made to the foreign system.
     * @param requestHandle the handle for the current call to request.
     * @return the response from the foreign system, or null if there is no response. if the
     *         response is null this is a response and should be returned in an AdaptorResponse.
     * @throws AdaptorException if a response cannot be obtained.
     */
    AdaptorResponse<ResponseMessageType> makeRequest(final RequestInstanceType requestInstance,
            final String requestHandle) throws AdaptorException;
}
