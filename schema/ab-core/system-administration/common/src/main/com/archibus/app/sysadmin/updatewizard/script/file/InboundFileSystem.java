package com.archibus.app.sysadmin.updatewizard.script.file;

import java.io.*;

import com.archibus.app.sysadmin.updatewizard.script.exception.StepException;

/**
 *
 * Inbound file system.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public class InboundFileSystem {

    /**
     * File.
     */
    private final File file;
    
    /**
     * Extension.
     */
    private final String extension;
    
    /**
     * Constructor.
     *
     * @param pathname path name
     */
    public InboundFileSystem(final String pathname) {
        super();
        this.file = getFileInstance(pathname);
        this.extension = getFileExtension(this.file.getName());
    }
    
    /**
     * Request the content of a particular file or files from a particular folder.
     *
     * @param pathname the file from which to retrieve content.
     * @return the file.
     */
    private File getFileInstance(final String pathname) {
        String fullPathName = pathname.toLowerCase();

        final PathCode relativePathCode = PathCode.has(pathname);

        switch (relativePathCode) {
            case WEB_APP_ENV:
                fullPathName =
                        fullPathName.replace(relativePathCode.getEnv(), PathType.WEB_APP.getPath());
                break;
            case DT_APP_ENV:
                fullPathName =
                        fullPathName.replace(relativePathCode.getEnv(),
                            PathType.DATA_TRANSFER.getPath());
                break;
            case NONE:
                fullPathName = PathType.NONE.getPath() + fullPathName;
                break;
            default:
        }

        return new File(fullPathName);
    }
    
    /**
     *
     * Return the input stream.
     *
     * @return InputStream
     * @throws StepException if the file not find or not supported
     */
    public InputStream getInputStream() throws StepException {
        InputStream inputStream = null;
        try {
            inputStream = new FileInputStream(this.file);
        } catch (final FileNotFoundException e) {
            throw new StepException("Missing file: " + this.file.getAbsolutePath(), e);
        }
        return inputStream;
    }
    
    /**
     * Getter for the file property.
     *
     * @see file
     * @return the file property.
     */
    public File getFile() {
        return this.file;
    }
    
    /**
     * Getter for the extension property.
     *
     * @see extension
     * @return the extension property.
     */
    public String getExtension() {
        return this.extension;
    }
    
    /**
     *
     * Get extension of the file.
     *
     * @param fileName file name
     * @return FileTypes.ExtentionType
     */
    private String getFileExtension(final String fileName) {
        return fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length()).trim()
                .toLowerCase();
    }
}
