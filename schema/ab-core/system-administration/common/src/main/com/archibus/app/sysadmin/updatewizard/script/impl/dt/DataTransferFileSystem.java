package com.archibus.app.sysadmin.updatewizard.script.impl.dt;

import java.io.*;

import com.archibus.app.sysadmin.updatewizard.script.file.InboundFileSystem;
import com.archibus.ext.report.xls.XlsBuilder;

/**
 *
 * Data Transfer supported files.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class DataTransferFileSystem {
    
    /**
     * Inbound File System.
     */
    private final InboundFileSystem inboundFileSystem;
    
    /**
     * file type.
     */
    private final XlsBuilder.FileFormatType fileType;

    /**
     * Constructor.
     *
     * @param pathfile path file
     */
    public DataTransferFileSystem(final String pathfile) {
        this.inboundFileSystem = new InboundFileSystem(pathfile);
        this.fileType = XlsBuilder.FileFormatType.fromString(this.inboundFileSystem.getExtension());
    }
    
    /**
     *
     * Return the input stream.
     *
     * @param dtFile file
     * @return InputStream
     */
    public InputStream getInputStream(final File dtFile) {
        return this.inboundFileSystem.getInputStream();
    }

    /**
     *
     * Transfer folder.
     *
     * @return the folder
     */
    public String getTransferFolder() {
        return this.inboundFileSystem.getFile().getParent();
    }

    /**
     * Getter for the fileType property.
     *
     * @see fileType
     * @return the fileType property.
     */
    public XlsBuilder.FileFormatType getFileType() {
        return this.fileType;
    }
    
    /**
     *
     * Get File Instance.
     *
     * @return File object
     */
    public File getFileInstance() {
        return this.inboundFileSystem.getFile();
    }
    
}
