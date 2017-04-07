package com.archibus.app.sysadmin.updatewizard.app.packager;

import java.io.*;
import java.util.Enumeration;
import java.util.logging.Level;
import java.util.zip.*;

import com.archibus.app.sysadmin.updatewizard.app.util.AppUpdateWizardConstants;
import com.archibus.context.ContextStore;
import com.archibus.jobmanager.JobStatus;
import com.archibus.utility.*;

/**
 * Implements extract from zip file method.
 * 
 * @author Catalin Purice
 * 
 */
public class Extractor extends Packager {
    
    /**
     * @param counter Counter
     * @param status jobStatus
     */
    public Extractor(final int counter, final JobStatus status) {
        super(counter, status);
    }
    
    /**
     * extract from zip file with absolute path. The fileName can be "mysite-data.war",
     * "mysite-extensions.war" or other zip files. The destination folder will be
     * afmbase/temp/deployment
     * 
     * @param fileName file name
     * @throws IOException exception
     */
    public void extractZipFiles(final String fileName) throws IOException {
        String destinationPath = "";
        String zipFilePath = "";
        final String afmBase = ContextStore.get().getWebAppPath().toString();
        // set the destination folder and create the //temp directories
        if (fileName.equals(AppUpdateWizardConstants.EXTENSION_WAR_FILE_NAME)) {
            destinationPath = getTempExtensionPath();
            FileUtil.createFoldersIfNot(destinationPath);
            zipFilePath = afmBase + File.separator + fileName;
        } else if (fileName.equals(AppUpdateWizardConstants.DATA_WAR_FILE_NAME)) {
            destinationPath = getTempDataPath();
            FileUtil.createFoldersIfNot(destinationPath);
            zipFilePath = afmBase + File.separator + fileName;
        } else {
            destinationPath = getTempArchibusPath();
            FileUtil.createFoldersIfNot(destinationPath);
            zipFilePath = afmBase + File.separator + fileName;
        }
        this.pdwLogger.log(Level.INFO, "Expanding war file: " + afmBase + File.separator + fileName
                + "...");
        unZip(destinationPath, zipFilePath);
        this.pdwLogger.log(Level.INFO, "Expanding completed. ");
    }
    
    /**
     * 
     * @param destinationPath unzip to destination path
     * @param zipFilePath archive path
     * @throws IOException throws {@link IOException}
     */
    private void unZip(final String destinationPath, final String zipFilePath) throws IOException {
        ZipFile zipfile = null;
        BufferedInputStream inStream = null;
        FileOutputStream out = null;
        BufferedOutputStream dest = null;
        final byte[] data = new byte[PackagerConstants.BUFFER_SIZE];
        
        try {
            zipfile = new ZipFile(zipFilePath);
            final Enumeration<? extends ZipEntry> entries = zipfile.entries();
            
            while (entries.hasMoreElements()) {
                final ZipEntry entry = entries.nextElement();
                
                final File file = new File(destinationPath + File.separator + entry.getName());
                
                if (entry.isDirectory()) {
                    this.pdwLogger.log(Level.INFO, "Expanding folder: " + file.getAbsolutePath());
                    FileUtil.createFoldersIfNot(file.getAbsolutePath());
                    continue;
                } else {
                    FileUtil.createFoldersIfNot(new File(file.getParent()).getAbsolutePath());
                    this.pdwLogger.log(Level.INFO, "Expanding file: " + file.getAbsolutePath());
                }
                
                inStream = new BufferedInputStream(zipfile.getInputStream(entry));
                out = new FileOutputStream(destinationPath + File.separator + entry.getName());
                dest = new BufferedOutputStream(out, PackagerConstants.BUFFER_SIZE);
                
                int count = inStream.read(data, 0, PackagerConstants.BUFFER_SIZE);
                while (count != -1) {
                    dest.write(data, 0, count);
                    count = inStream.read(data, 0, PackagerConstants.BUFFER_SIZE);
                }
                dest.flush();
                dest.close();
                out.close();
                inStream.close();
                incrementJobCounter();
            }
        } catch (final IOException exIO) {
            this.pdwLogger.log(Level.SEVERE, "Error while expanding: " + exIO.getMessage());
            throw new ExceptionBase("Error while expanding file : ", exIO.getMessage(), exIO);
        } finally {
            if (dest != null) {
                dest.flush();
                dest.close();
            }
            if (out != null) {
                out.close();
            }
            if (zipfile != null) {
                zipfile.close();
            }
        }
    }
}
