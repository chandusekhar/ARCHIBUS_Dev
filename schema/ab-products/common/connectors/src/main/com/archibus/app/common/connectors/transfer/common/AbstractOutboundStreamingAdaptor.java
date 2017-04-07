package com.archibus.app.common.connectors.transfer.common;

import java.io.*;

import org.apache.commons.io.IOUtils;

import com.archibus.app.common.connectors.transfer.AdaptorResponse;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.enterprisedt.util.debug.Logger;

/**
 * An adaptor for writing to a stream.
 *
 * @author cole
 *
 */
public abstract class AbstractOutboundStreamingAdaptor extends
        AbstractSingleRequestAdaptor<InputStream, Void> {
    
    /**
     * Request that an InputStream be written to a stream specified when the request referred to the
     * request handle was made. This method is not intended to be called directly.
     *
     * @param requestInstance the input stream to be written.
     * @param requestHandle the request specifying where the stream is to be written.
     * @return response from the request.
     * @throws AdaptorException if the target of the stream isn't found, isn't accessible, or any
     *             other issue occurs when writing to the stream.
     */
    @Override
    public AdaptorResponse<Void> makeRequest(final InputStream requestInstance,
            final String requestHandle) throws AdaptorException {
        OutputStream outputStream = null;
        AdaptorException exception = null;
        try {
            outputStream = getOutputStream(requestHandle);
            IOUtils.copy(requestInstance, outputStream);
        } catch (final FileNotFoundException e) {
            throw new AdaptorException("Missing file: " + getStreamIdentifier(requestHandle), e);
        } catch (final SecurityException e) {
            stopRecieving(requestHandle);
            throw new AdaptorException("Security exception reading file: "
                    + getStreamIdentifier(requestHandle), e);
        } catch (final IOException e) {
            throw new AdaptorException("Error writing to the file: "
                    + getStreamIdentifier(requestHandle), e);
        } finally {
            if (outputStream != null) {
                try {
                    outputStream.flush();
                } catch (final IOException e) {
                    exception =
                            new AdaptorException("Failed to flush outbound stream: "
                                    + getStreamIdentifier(requestHandle), e);
                }
            }
        }
        if (exception != null) {
            throw exception;
        }
        return new AdaptorResponse<Void>(null);
    }
    
    /**
     * @param requestHandle the request specifying where the stream is to be written.
     * @return the output stream to be written to (will not be closed).
     * @throws AdaptorException if the stream cannot be opened.
     */
    protected abstract OutputStream getOutputStream(final String requestHandle)
            throws AdaptorException;
    
    /**
     * @param requestHandle the request specifying where the stream is to be written.
     * @return a description for the stream, for logging.
     */
    protected abstract String getStreamIdentifier(final String requestHandle);
    
    @Override
    public void close() throws AdaptorException {
        try {
            super.close();
        } finally {
            final StringBuilder unclosedStreams = new StringBuilder();
            IOException firstException = null;
            for (final String requestHandle : super.requests.keySet()) {
                try {
                    final OutputStream outputStream = getOutputStream(requestHandle);
                    if (outputStream != null) {
                        outputStream.flush();
                        outputStream.close();
                    }
                } catch (final IOException e) {
                    if (firstException == null) {
                        firstException = e;
                    }
                    unclosedStreams.append(getStreamIdentifier(requestHandle)).append(", ");
                }
            }
            if (unclosedStreams.length() > 0) {
                Logger.getLogger(AbstractOutboundStreamingAdaptor.class).warn(
                    "Unable to close output stream to "
                            + unclosedStreams.substring(0, unclosedStreams.length() - 2),
                    firstException);
            }
        }
    }
}
