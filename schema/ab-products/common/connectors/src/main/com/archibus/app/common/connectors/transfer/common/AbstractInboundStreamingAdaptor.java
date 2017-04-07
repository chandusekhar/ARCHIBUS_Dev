package com.archibus.app.common.connectors.transfer.common;

import java.io.InputStream;

import com.archibus.app.common.connectors.transfer.AdaptorResponse;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;

/**
 * Adaptor for reading streamed data.
 *
 * @author cole
 *
 * @param <RequestType> the type of the request being made.
 * @param <RequestInstanceType> the type of the specific requests being queued to be sent to the
 *            foreign system.
 */
public abstract class AbstractInboundStreamingAdaptor<RequestType, RequestInstanceType> extends
        AbstractQueuedRequestAdaptor<RequestType, RequestInstanceType, InputStream> {

    /**
     * Request the content of a particular resource.
     *
     * @param request the request for content.
     * @param requestHandle the handle for the request being processed.
     * @return an input stream for the resource or null if there is no data to be read.
     * @throws AdaptorException when security prohibits access to resource's content.
     */
    @Override
    public AdaptorResponse<InputStream> makeRequest(final RequestInstanceType request,
            final String requestHandle) throws AdaptorException {
        AdaptorResponse<InputStream> response = null;
        try {
            final AdaptorResponse<InputStream> implResponse =
                    new AdaptorResponse<InputStream>(getInputStream(request, requestHandle));
            if (implResponse.getMessage() != null) {
                response = implResponse;
            }
        } catch (final SecurityException e) {
            /*
             * Data should be accessible. Being unable to access any of them is a violation of an
             * assumption. Behavior after this point is undefined, so the process should abort.
             */
            stopRecieving(requestHandle);
            throw new AdaptorException("Security exception reading stream: "
                    + getStreamIdentifier(request, requestHandle), e);
        }
        return response;
    }

    /**
     * @param request the request for content.
     * @param requestHandle the request specifying where the stream is to be read.
     * @return the input stream to be read from, or null if there is no data to be read.
     * @throws AdaptorException if the stream cannot be opened.
     */
    protected abstract InputStream getInputStream(final RequestInstanceType request,
            final String requestHandle) throws AdaptorException;

    /**
     * @param request the request for content.
     * @param requestHandle the request specifying where the stream is to be read.
     * @return a description for the stream, for logging.
     */
    protected abstract String getStreamIdentifier(final RequestInstanceType request,
            final String requestHandle);
}
