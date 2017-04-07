package com.archibus.app.common.connectors.transfer.file;

import java.io.*;

import com.archibus.app.common.connectors.transfer.common.AbstractOutboundStreamingAdaptor;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;

/**
 * An adaptor for writing to a file.
 *
 * @author cole
 *
 */
public class OutboundFileAdaptor extends AbstractOutboundStreamingAdaptor {

    /**
     * A descriptor for the file.
     */
    private final String fileId;

    /**
     * The file stream to be written to.
     */
    private final FileOutputStream outputStream;

    /**
     * Create an adaptor for writing to a file.
     *
     * @param file the file to be written to.
     */
    public OutboundFileAdaptor(final File file) {
        this(file, false);
    }

    /**
     * Create an adaptor for writing to a file.
     *
     * @param file the file to be written to.
     * @param append whether to append to an existing file.
     * @throws AdaptorException if the file isn't found, isn't accessible, or any other issue occurs
     *             when writing to the file.
     */
    public OutboundFileAdaptor(final File file, final boolean append) throws AdaptorException {
        super();
        this.fileId = file.getAbsolutePath();
        try {
            this.outputStream = new FileOutputStream(file, append);
        } catch (final FileNotFoundException e) {
            throw new AdaptorException("Missing file: " + this.fileId, e);
        } catch (final SecurityException e) {
            throw new AdaptorException("Security exception reading file: " + this.fileId, e);
        }
    }

    @Override
    protected OutputStream getOutputStream(final String requestHandle) throws AdaptorException {
        return this.outputStream;
    }

    @Override
    protected String getStreamIdentifier(final String requestHandle) {
        return this.fileId;
    }

    @Override
    public void close() throws AdaptorException {
        try {
            this.outputStream.flush();
            this.outputStream.close();
        } catch (final IOException e) {
            throw new AdaptorException("Error closing " + this.fileId, e);
        } finally {
            super.close();
        }
    }
}
