package com.archibus.app.sysadmin.updatewizard.schema.filefilter;

import java.io.*;
import java.util.Locale;

/**
 * Set the filter properties.
 * 
 * @author Catalin Purice
 * 
 */
public class SqlFileFilter implements FilenameFilter {
    
    /**
     * Db type name (oracle,sybase,mssql).
     */
    private final transient String dbType;
    
    /**
     * Constructor.
     * 
     * @param dbType file name
     */
    public SqlFileFilter(final String dbType) {
        this.dbType = dbType.toLowerCase(Locale.getDefault());
    }
    
    /**
     * Returns true if the file has the format schemawiz*dbType.sql.
     *
     * @param directory path to file
     * @param filename file name
     * @return true if the file is what we are looking for
     */
    public boolean accept(final File directory, final String filename) {
        boolean fileOK = true;
        final String fname = filename.toLowerCase(Locale.getDefault());
        fileOK &= fname.startsWith("schemawiz");
        fileOK &= fname.contains(this.dbType);
        fileOK &= fname.endsWith(".sql");
        return fileOK;
    }
}
