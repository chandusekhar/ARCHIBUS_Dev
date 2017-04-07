package com.archibus.app.common.connectors.transfer.common;

import java.io.*;
import java.util.List;

import com.archibus.app.common.connectors.transfer.IAdaptor;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;

/**
 * Provides a method for sending a data on a stream to multiple adaptors. The stream must support
 * marking.
 *
 * @param <ResponseType> the response expected from the adaptor.
 */
public class InputStreamMultiAdaptor<ResponseType> extends MultiAdaptor<InputStream, ResponseType> {
    
    /**
     * The message to use for the current request.
     */
    private InputStream message;

    /**
     * @param adaptors adaptors to forward messages to.
     */
    public InputStreamMultiAdaptor(final List<IAdaptor<InputStream, ResponseType>> adaptors) {
        super(adaptors);
    }

    @Override
    public String request(final InputStream originalMessage) throws AdaptorException {
        if (originalMessage.markSupported()) {
            this.message = originalMessage;
        } else {
            this.message = new BufferedInputStream(this.message);
        }
        this.message.mark(Integer.MAX_VALUE);
        return super.request(this.message);
    }

    @Override
    protected String makeRequest(final IAdaptor<InputStream, ResponseType> adaptor,
            final InputStream originalMessage) throws AdaptorException {
        try {
            this.message.reset();
        } catch (final IOException e) {
            throw new AdaptorException(
                "Attempt to write to multiple destinations from read-once stream, or size exceeds 2GB.",
                e);
        }
        return super.makeRequest(adaptor, this.message);
    }
}
