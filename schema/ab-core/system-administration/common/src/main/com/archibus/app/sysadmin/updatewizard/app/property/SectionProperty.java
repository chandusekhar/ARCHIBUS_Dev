package com.archibus.app.sysadmin.updatewizard.app.property;

import java.io.*;
import java.util.List;

import com.archibus.app.sysadmin.updatewizard.app.packager.*;
import com.archibus.app.sysadmin.updatewizard.app.util.AppUpdateWizardConstants;
import com.archibus.utility.StringUtil;

/**
 * 
 * @author Catalin Purice
 * 
 */
public class SectionProperty extends Property {
    
    /**
     * Comment/un-comment Application deploy.
     * 
     * @param commentTextList comment text
     * @param unComment true if we want to un-comment selected lines
     * @throws IOException exception
     */
    public void commentAppDeploy(final List<String> commentTextList, final boolean unComment)
            throws IOException {
        final StringBuilder contents = new StringBuilder();
        final BufferedReader bReader = getBufferReader();
        String currentLine = bReader.readLine();
        
        // Read File Line By Line
        while (currentLine != null) {
            contents.append(currentLine + PackagerConstants.NEW_LINE);
            if (isToBeUpdated(currentLine, commentTextList)) {
                // comment all lines until /br
                commentSection(bReader, contents, unComment);
            }
            currentLine = bReader.readLine();
        } // end file while
        bReader.close();
        writeContents(contents);
    }
    
    /**
     * 
     * @param elemFile element file
     * @param toBeCommented true if the line will be commented
     * @return the new line
     */
    private String commentLine(final FileElement elemFile, final boolean toBeCommented) {
        // if the line is commented but we have to un-comment it
        String currentLine = elemFile.getLine();
        if (elemFile.isComment()) {
            if (!toBeCommented) {
                currentLine = currentLine.substring(1, currentLine.length());
            }
        } else {
            if (toBeCommented) {
                currentLine = AppUpdateWizardConstants.COMMENT_CHAR + currentLine;
            }
        }
        return currentLine;
    }
    
    /**
     * Adds or removes "#" in front of the line.
     * 
     * @param bReader BufferedReader
     * @param contents file contents
     * @param toBeCommented if true then the line is uncommented
     * @throws IOException exception
     */
    private void commentSection(final BufferedReader bReader, final StringBuilder contents,
            final boolean toBeCommented) throws IOException {
        String currentLine = bReader.readLine();
        // comment all lines until /br
        while (currentLine != null) {
            if (StringUtil.isNullOrEmpty(currentLine)) {
                contents.append(PackagerConstants.NEW_LINE);
                contents.append("");
                break;
            }
            final FileElement elemFile = new FileElement();
            elemFile.setLine(currentLine);
            if (elemFile.isValid()) {
                currentLine = commentLine(elemFile, toBeCommented);
            }
            contents.append(currentLine + PackagerConstants.NEW_LINE);
            // read next line
            currentLine = bReader.readLine();
        }
    }
}
