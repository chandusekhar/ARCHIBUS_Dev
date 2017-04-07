package com.archibus.app.common.connectors.transfer.file;

import java.io.*;
import java.util.*;

import com.archibus.app.common.connectors.transfer.common.AbstractInboundStreamingAdaptor;
import com.archibus.app.common.connectors.transfer.exception.AdaptorException;

/**
 * Adaptor for reading files from a local file system.
 * 
 * @author cole
 * 
 */
public class InboundFileSystemAdaptor extends AbstractInboundStreamingAdaptor<String, File> {
    
    /**
     * "Which files to process" is determined when the request is made. Files can be deleted before
     * they are received. This indicates whether those missing files should be ignored, or to the
     * contrary, that their absence is an error.
     */
    private final boolean ignoreMissingFiles;
    
    /**
     * Create an adaptor that processes all files (and only files) in the folder.
     */
    public InboundFileSystemAdaptor() {
        this(false);
    }
    
    /**
     * Create an adaptor that processes all files in a given folder matching the filter criteria.
     * 
     * @param ignoreMissingFiles "which files to process" is determined when the request is made.
     *            Files can be deleted before they are received. This indicates whether those
     *            missing files should be ignored, or to the contrary, that their absence is an
     *            error.
     */
    public InboundFileSystemAdaptor(final boolean ignoreMissingFiles) {
        super();
        this.ignoreMissingFiles = ignoreMissingFiles;
    }
    
    /**
     * Request the content of a particular file or files from a particular folder.
     * 
     * @param pathname the file from which to retrieve content.
     * @param requestHandle the handle for the request being processed.
     * @return a singleton list with the provided file.
     * @throws AdaptorException when security prohibits access to Queue a directory's content (cause
     *             = SecurityException)
     */
    @Override
    protected Collection<File> getRequestInstances(final String pathname, final String requestHandle)
            throws AdaptorException {
        return Collections.singletonList(new File(pathname));
    }
    
    @Override
    protected InputStream getInputStream(final File file, final String requestHandle)
            throws AdaptorException {
        InputStream inputStream = null;
        try {
            inputStream = new FileInputStream(file);
        } catch (final FileNotFoundException e) {
            /*
             * Files may go missing between Queueing them and retrieving them, so the developer has
             * the option of skipping them. Alternatively they could catch the exception and start
             * over or abort.
             */
            if (!this.ignoreMissingFiles) {
                throw new AdaptorException("Missing file: " + file.getAbsolutePath(), e);
            }
        }
        return inputStream;
    }
    
    @Override
    protected String getStreamIdentifier(final File file, final String requestHandle) {
        return null;
    }
}
