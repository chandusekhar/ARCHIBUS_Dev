package com.archibus.app.common.fileaccess;

import java.io.*;
import java.util.Date;

import com.archibus.utility.*;

/**
 * Provides read/write access to a file. File is accessed using file system.
 *
 * @author Valery Tydykov
 * @author Yong Shao
 *
 */
// TODO unit test
public class FileAccessProviderFileSystem extends AbstractFileAccessProvider {
    /**
     * Constant: ERROR_MESSAGE_FILE_MISSING.
     */
    // @translatable
    private static final String ERROR_MESSAGE_FILE_MISSING =
            "File=[{0}/{1}] is missing. Please contact your system administrator.";
    
    @Override
    public Date getLastModified(final String fileName) {
        super.getLastModified(fileName);
        
        return FileUtil.getLastModified(getFilePath(fileName).getPath());
    }
    
    @Override
    public long getSize(final String fileName) {
        super.getSize(fileName);
        
        return FileUtil.getSize(getFilePath(fileName).getPath());
    }
    
    @Override
    public InputStream readFile(final String fileName) throws ExceptionBase {
        super.readFile(fileName);
        
        InputStream inputStream = null;
        try {
            inputStream = new FileInputStream(getFilePath(fileName));
        } catch (final FileNotFoundException e) {
            final ExceptionBase exception =
                    ExceptionBaseFactory.newTranslatableException(ERROR_MESSAGE_FILE_MISSING,
                        new Object[] { this.getFolder(), fileName });
            exception.setNested(e);
            throw exception;
        }
        
        return inputStream;
    }
    
    @Override
    public void writeFile(final InputStream inputStream, final String fileName)
            throws ExceptionBase {
        super.writeFile(inputStream, fileName);
        
        // copy input stream to the file
        FileCopy.copy(inputStream, getFilePath(fileName));
    }
}
