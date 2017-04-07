package com.archibus.app.sysadmin.updatewizard.app.util;

import java.io.*;

/**
 * Implements special File Utilities methods used by Application Update Wizard.
 * 
 * @author Catalin Purice
 * 
 */
public final class FileUtilities {
    
    /**
     * Constructor.
     */
    private FileUtilities() {
        
    }
    
    /**
     * Writes contents in destination file.
     * 
     * @param dest destination file
     * @param contents to write in destination file
     * @throws IOException in case there is any write issue
     */
    public static void writeContentsToFile(final File dest, final StringBuilder contents)
            throws IOException {
        final Writer output = new BufferedWriter(new FileWriter(dest));
        output.write(contents.toString());
        output.close();
    }
}
