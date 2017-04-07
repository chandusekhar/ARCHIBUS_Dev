package com.archibus.app.sysadmin.updatewizard.schema.filefilter;

import java.io.*;
import java.util.Locale;

/**
 * Set the filter properties for CSV files.
 *
 * @author Catalin Purice
 *
 */
public class CsvFileFilter implements FilenameFilter {

    /**
     * File name.
     */
    private final String name;
    
    /**
     * Constructor.
     *
     * @param filename file name
     */
    public CsvFileFilter(final String filename) {
        this.name = filename.toLowerCase(Locale.getDefault());
    }
    
    /**
     * Returns true if the file is a CSV and the name matches.
     *
     * @param directory path to file
     * @param filename file name
     * @return true if the file is what we are looking for
     */
    public boolean accept(final File directory, final String filename) {
        boolean fileOK = true;
        final String fname = filename.toLowerCase(Locale.getDefault());
        fileOK &= fname.equals(this.name);
        fileOK &= fname.endsWith(".csv");
        return fileOK;
    }
}
