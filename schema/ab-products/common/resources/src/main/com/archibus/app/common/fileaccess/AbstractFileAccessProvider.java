package com.archibus.app.common.fileaccess;

import java.io.*;
import java.util.Date;

import org.apache.log4j.Logger;

import com.archibus.ext.fileaccess.FileAccessProvider;
import com.archibus.utility.ExceptionBase;

/**
 * Provides functionality common to all classes implementing FileAccessProvider.
 *
 * @author Valery Tydykov
 * @author Yong Shao
 *
 */
public abstract class AbstractFileAccessProvider implements FileAccessProvider {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * The folder where the accessed file is located. If file system is used as implementation, than
     * it must contain absolute folder path.
     */
    private String folder;
    
    /**
     * Create an output stream to a file on the file system. This will enable a user to append to an
     * existing file, or to use the OutputStream with another library.
     *
     * @param filePath a path to the file on the server.
     * @param appendFirstWrite if the file should be appended to.
     * @return an OutputStream to write content directly to the file on the file system.
     * @throws ExceptionBase if an error occurs accessing the file.
     */
    public OutputStream createOutputStream(final String filePath, final boolean appendFirstWrite)
            throws ExceptionBase {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("getOutputStream to [" + this.folder + "][" + filePath
                    + "][append = " + appendFirstWrite + "]");
        }
        
        return null;
    }
    
    /**
     * Returns a file representing the path to the file. Assumes a local file system.
     *
     * @param fileName the name of the file to access.
     * @return the path to the file, formatted for the local file system.
     */
    public File getFilePath(final String fileName) {
        return new File(new File(this.getFolder()), fileName);
    }
    
    /**
     * Returns a string representing the path to the file. Does not assume a local file system, and
     * therefore assumes any necessary delimiter is provided at the end of the folder path. This is
     * not equivalent to getFilePath().toString() whose use of java.io.File does assume a local file
     * system.
     *
     * @param fileName the name of the file to access.
     * @return the path to the file as configured.
     */
    public String getFilePathAsString(final String fileName) {
        return getFolder() + fileName;
    }
    
    /**
     * @return the folder
     */
    public String getFolder() {
        return this.folder;
    }
    
    @Override
    public Date getLastModified(final String fileName) throws ExceptionBase {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("getLastModified for [" + this.folder + "][" + fileName + "]");
        }
        
        return null;
    }
    
    @Override
    public long getSize(final String fileName) throws ExceptionBase {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("getSize for [" + this.folder + "][" + fileName + "]");
        }
        
        return 0;
    }
    
    @Override
    public InputStream readFile(final String fileName) throws ExceptionBase {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("readFile from [" + this.folder + "][" + fileName + "]");
        }
        
        return null;
    }
    
    /**
     * @param folder the folder to set
     */
    public void setFolder(final String folder) {
        this.folder = folder;
    }
    
    @Override
    public void writeFile(final InputStream inputStream, final String fileName)
            throws ExceptionBase {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("writeFile to [" + this.folder + "][" + fileName + "]");
        }
    }
}