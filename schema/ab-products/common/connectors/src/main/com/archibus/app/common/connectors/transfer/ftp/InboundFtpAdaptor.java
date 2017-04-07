package com.archibus.app.common.connectors.transfer.ftp;

import java.io.InputStream;
import java.util.*;

import com.archibus.app.common.connectors.transfer.common.AbstractInboundStreamingAdaptor;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.archibus.app.common.fileaccess.AbstractFtpTemplate;

/**
 *
 * Adaptor for reading files from a FTP server.
 * <p>
 *
 * @author Catalin Purice
 * @author cole
 * @since 21.3
 *
 * @param <ClientType> the AbstractFtpClientFascade that implements the variety of FTP used.
 */
public class InboundFtpAdaptor<ClientType extends AbstractFtpTemplate<?>> extends
        AbstractInboundStreamingAdaptor<String, String> {

    /**
     * FTP client object.
     */
    private final ClientType client;

    /**
     *
     * Constructor.
     *
     * @param client the AbstractFtpClientFascade that implements the variety of FTP used.
     */
    public InboundFtpAdaptor(final ClientType client) {
        super();
        this.client = client;
    }

    @Override
    protected List<String> getRequestInstances(final String pathname, final String requestHandle)
            throws AdaptorException {
        return Collections.singletonList(pathname);
    }

    @Override
    protected InputStream getInputStream(final String pathname, final String requestHandle)
            throws AdaptorException {
        return this.client.createInputStream(pathname);
    }

    @Override
    protected String getStreamIdentifier(final String pathname, final String requestHandle) {
        return pathname;
    }
}
