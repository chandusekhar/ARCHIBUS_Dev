package com.archibus.app.common.connectors.transfer.ftp;

import java.io.*;

import com.archibus.app.common.connectors.exception.ConfigurationException;
import com.archibus.app.common.connectors.transfer.common.AbstractOutboundStreamingAdaptor;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;
import com.archibus.app.common.fileaccess.AbstractFtpTemplate;
import com.archibus.utility.ExceptionBase;

/**
 *
 * Adaptor for writing files to a FTP server.
 * <p>
 *
 * @author Catalin Purice
 * @author cole
 * @since 21.3
 *
 * @param <ClientType> the subclass of AbstractFtpClientFascade that implements the variety of FTP
 *            used.
 */
public class OutboundFtpAdaptor<ClientType extends AbstractFtpTemplate<?>> extends
        AbstractOutboundStreamingAdaptor {

    /**
     * The file to be written to.
     */
    private final String pathname;

    /**
     * An output stream to the remote file.
     */
    private final OutputStream outputStream;

    /**
     * Create an adaptor for writing to a file over FTP.
     *
     * @param client the AbstractFtpClientFascade that implements the variety of FTP used.
     * @param pathname the file to be written to the FTP server.
     * @param append whether to append to an existing file.
     * @throws ConfigurationException if the client is unable to connect to the remote host.
     */
    public OutboundFtpAdaptor(final ClientType client, final String pathname, final boolean append)
            throws ConfigurationException {
        super();
        this.pathname = pathname;
        try {
            this.outputStream = client.createOutputStream(pathname, append);
        } catch (final ExceptionBase e) {
            throw new ConfigurationException("Unable to connect to remote FTP server.", e);
        }
    }

    @Override
    protected OutputStream getOutputStream(final String requestHandle) throws AdaptorException {
        return this.outputStream;
    }

    @Override
    protected String getStreamIdentifier(final String requestHandle) {
        return this.pathname;
    }

    @Override
    public void close() throws AdaptorException {
        try {
            this.outputStream.flush();
            this.outputStream.close();
        } catch (final IOException e) {
            throw new AdaptorException("Error closing " + this.pathname, e);
        } finally {
            super.close();
        }
    }
}
