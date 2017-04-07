package com.archibus.app.sysadmin.updatewizard.app.property;

import java.io.*;
import java.util.*;

/**
 * 
 * Merges the properties files.
 * 
 * @author Catalin Purice
 * 
 */
public class MergePropertyFiles extends WritePropertiesToFile {
    
    /**
     * @param source source file
     * @param dest destination file
     */
    public MergePropertyFiles(final File source, final File dest) {
        super(source, dest);
    }
    
    /**
     * 
     * @throws IOException exception
     */
    public void mergeFiles() throws IOException {
        
        final Properties sourceProp = new Properties();
        final InputStream sourceFile = new FileInputStream(getSource());
        sourceProp.load(sourceFile);
        
        final Properties destProp = new Properties();
        final InputStream destFile = new FileInputStream(getDest());
        destProp.load(destFile);
        boolean isChanged = false;
        
        final Properties toWriteProp = new Properties();
        
        final Enumeration<?> sEnum = sourceProp.keys();
        
        while (sEnum.hasMoreElements()) {
            final String sourceKey = (String) sEnum.nextElement();
            final String sourceValue = sourceProp.getProperty(sourceKey);
            
            if (destProp.getProperty(sourceKey) == null) {
                toWriteProp.setProperty(sourceKey, sourceValue);
                destProp.remove(sourceKey);
                isChanged = true;
            } else {
                final String destValue = destProp.getProperty(sourceKey);
                if (!sourceValue.equals(destValue)) {
                    toWriteProp.setProperty(sourceKey, sourceValue);
                    destProp.remove(sourceKey);
                    isChanged = true;
                }
            }
        }
        final Enumeration<?> pEnum = destProp.keys();
        
        while (pEnum.hasMoreElements()) {
            final String key = (String) pEnum.nextElement();
            final String value = destProp.getProperty(key);
            toWriteProp.setProperty(key, value);
            isChanged = true;
        }
        
        if (isChanged) {
            writeProperties(toWriteProp);
        }
        sourceFile.close();
        destFile.close();
    }
}
