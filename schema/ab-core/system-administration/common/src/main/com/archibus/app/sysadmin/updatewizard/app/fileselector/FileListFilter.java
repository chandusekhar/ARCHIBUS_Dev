package com.archibus.app.sysadmin.updatewizard.app.fileselector;

import java.io.*;

import com.archibus.app.sysadmin.updatewizard.app.packager.FileElement;
import com.archibus.utility.FileUtil;

/**
 * File Filter.
 * 
 * @author Catalin Purice
 * 
 */
public class FileListFilter implements FilenameFilter {
    
    /**
     * Extension wildcard.
     */
    private final Wildcard filenameWC;
    
    /**
     * Extension wildcard.
     */
    private final Wildcard extensionWC;
    
    /**
     * Constructor.
     * 
     * @param element @see {@link FileElement}
     */
    public FileListFilter(final FileElement element) {
        this.filenameWC = new Wildcard(element.getFileNameOnly());
        this.extensionWC = new Wildcard(element.getExtension());
    }
    
    /**
     * Returns true if the file matches condition.
     * 
     * @param fullFilename full file name
     * @param file file
     * @return boolean
     */
    public boolean accept(final File file, final String fullFilename) {
        
        boolean fileOK = true;
        
        /**
         * Check the file name with no extension.
         */
        
        final String filename = FileUtil.getNameOnly(fullFilename, File.separator);
        
        if (this.filenameWC.hasStartPrefix()) {
            fileOK &= filename.startsWith(this.filenameWC.getStartPrefix());
        }
        
        if (this.filenameWC.hasEndPrefix()) {
            fileOK &= filename.endsWith(this.filenameWC.getEndPrefix());
        }
        
        fileOK &= containsMatchers(filename, this.filenameWC);
        
        /**
         * Check the extension.
         */
        
        final String extension = FileUtil.getExtension(fullFilename);
        
        if (this.extensionWC.hasStartPrefix()) {
            fileOK &= extension.startsWith(this.extensionWC.getStartPrefix());
        }
        
        if (this.extensionWC.hasEndPrefix()) {
            fileOK &= extension.endsWith(this.extensionWC.getEndPrefix());
        }
        
        fileOK &= containsMatchers(extension, this.extensionWC);
        
        return fileOK;
    }
    
    /**
     * 
     * Checks if the name match the wildcard.
     * 
     * @param name name
     * @param wildcard wildcard
     * @return true if the name match the wildcard and false otherwise
     */
    private boolean containsMatchers(final String name, final Wildcard wildcard) {
        
        boolean fileOK = true;
        
        for (final String match : wildcard.getMatchers()) {
            if (!name.contains(match)) {
                fileOK = false;
                break;
            }
        }
        return fileOK;
        
    }
    
}
