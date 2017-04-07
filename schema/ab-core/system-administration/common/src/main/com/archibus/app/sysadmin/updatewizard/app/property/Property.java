package com.archibus.app.sysadmin.updatewizard.app.property;

import java.io.*;
import java.util.List;

import com.archibus.app.sysadmin.updatewizard.app.packager.PackagerConstants;
import com.archibus.app.sysadmin.updatewizard.app.util.AppUpdateWizardUtilities;

/**
 * 
 * Defines methods that manipulates application-update.properties file.
 * 
 * @author Catalin Purice
 * 
 */
public class Property {
    
    /**
     * input Stream.
     */
    private FileInputStream fis;
    
    /**
     * File writer.
     */
    private FileWriter fWrite;
    
    /**
     * Data Input Stream.
     */
    private DataInputStream inputStream;
    
    /**
     * Path to file.
     */
    private String path;
    
    /**
     * Adds data/extensions paths to file.
     * 
     * @param entriesList data list
     * @param type type of entry
     * @throws IOException exception throw if the Writer cannot be created
     */
    protected void addEntryToFile(final List<String> entriesList, final String type)
            throws IOException {
        if (!entriesList.isEmpty()) {
            this.fWrite.write(PackagerConstants.NEW_LINE);
            this.fWrite.write("");
            
            for (final String data : entriesList) {
                final String dataToWrite = type + data;
                this.fWrite.write(dataToWrite);
                this.fWrite.write(PackagerConstants.NEW_LINE);
                this.fWrite.write("");
                
            }
        }
        this.fWrite.close();
    }
    
    /**
     * close file.
     * 
     * @throws IOException exception
     */
    protected void closeFile() throws IOException {
        this.fis.close();
        this.inputStream.close();
    }
    
    /**
     * reload file into buffer.
     * 
     * @return BufferedReader
     * @throws IOException exception
     */
    protected BufferedReader getBufferReader() throws IOException {
        closeFile();
        this.fis = new FileInputStream(this.path);
        this.inputStream = new DataInputStream(this.fis);
        return new BufferedReader(new InputStreamReader(this.inputStream));
        
    }
    
    /**
     * @return the fis
     */
    protected FileInputStream getFis() {
        return this.fis;
    }
    
    /**
     * initialize property file.
     * 
     * @throws IOException exception
     */
    protected void initializePropertyFile() throws IOException {
        this.path = AppUpdateWizardUtilities.getAppUpdPrefFilePath();
        this.fis = new FileInputStream(this.path);
        this.inputStream = new DataInputStream(this.fis);
        this.fWrite = new FileWriter(new File(this.path), true);
    }
    
    /**
     * 
     * @param currentLine current line
     * @param commentTextList commented text
     * @return true if the line will be commented
     */
    protected boolean isToBeUpdated(final String currentLine, final List<String> commentTextList) {
        boolean toBeUpdatedLines = false;
        for (final String commentText : commentTextList) {
            final String commentTitle = commentText.toLowerCase();
            if (commentTitle.equals(currentLine.toLowerCase())) {
                toBeUpdatedLines = true;
                break;
            }
        } // end for
        return toBeUpdatedLines;
    }
    
    /**
     * 
     * @param contents file contents
     * @throws IOException exception
     */
    protected void writeContents(final StringBuilder contents) throws IOException {
        final Writer output = new BufferedWriter(new FileWriter(this.path));
        output.write(contents.toString());
        output.close();
    }
    
}
