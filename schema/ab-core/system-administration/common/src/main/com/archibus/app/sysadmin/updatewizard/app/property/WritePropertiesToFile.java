package com.archibus.app.sysadmin.updatewizard.app.property;

import java.io.*;
import java.util.*;

import com.archibus.app.sysadmin.updatewizard.app.packager.*;
import com.archibus.app.sysadmin.updatewizard.app.util.FileUtilities;

/**
 * Implements methods that merge properties from one file to another.
 * 
 * @author Catalin Purice
 * 
 */
public class WritePropertiesToFile {
    
    /**
     * Constant.
     */
    protected static final String OPERATOR_EQ = "=";
    
    /**
     * destination property file.
     */
    private final File dest;
    
    /**
     * source property file.
     */
    private final File source;
    
    /**
     * @param source source file
     * @param dest destination file
     */
    public WritePropertiesToFile(final File source, final File dest) {
        super();
        this.source = source;
        this.dest = dest;
    }
    
    /**
     * @return the dest
     */
    public File getDest() {
        return this.dest;
    }
    
    /**
     * @return the source
     */
    public File getSource() {
        return this.source;
    }
    
    /**
     * 
     * @param toWriteProp Properties that differs
     * @throws IOException exception
     */
    protected void writeProperties(final Properties toWriteProp) throws IOException {
        // load files into memory
        final FileInputStream sourcefis = new FileInputStream(this.source);
        final DataInputStream sourceIn = new DataInputStream(sourcefis);
        final BufferedReader sourceBr = new BufferedReader(new InputStreamReader(sourceIn));
        
        final StringBuilder contents = new StringBuilder();
        
        String curLine = sourceBr.readLine();
        final FileElement sourceElem = new FileElement();
        
        while (curLine != null) {
            sourceElem.setLine(curLine);
            final Enumeration<?> propEnum = toWriteProp.keys();
            // ignore commented lines
            if (sourceElem.isComment()) {
                // copy commented lines
                contents.append(curLine + PackagerConstants.NEW_LINE);
            } else {
                while (propEnum.hasMoreElements()) {
                    final String key = (String) propEnum.nextElement();
                    if (curLine.contains(key)) {
                        final String value = toWriteProp.getProperty(key);
                        curLine = key + OPERATOR_EQ + value;
                        toWriteProp.remove(key);
                        break;
                    }
                }
                contents.append(curLine + PackagerConstants.NEW_LINE);
            }
            curLine = sourceBr.readLine();
        } // end while
        
        sourceBr.close();
        
        final Enumeration<?> propEnum = toWriteProp.keys();
        while (propEnum.hasMoreElements()) {
            final String key = (String) propEnum.nextElement();
            final String value = toWriteProp.getProperty(key);
            curLine = key + OPERATOR_EQ + value;
            contents.append(curLine + PackagerConstants.NEW_LINE);
        }
        
        FileUtilities.writeContentsToFile(this.dest, contents);
    }
    
}
