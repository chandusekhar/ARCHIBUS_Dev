package com.archibus.app.sysadmin.updatewizard.app.packager;

import java.io.*;
import java.text.MessageFormat;
import java.util.*;
import java.util.zip.ZipFile;

import org.apache.commons.io.FileUtils;

import com.archibus.app.sysadmin.updatewizard.app.util.AppUpdateWizardConstants;
import com.archibus.context.ContextStore;
import com.archibus.utility.ExceptionBase;
import com.enterprisedt.util.debug.Logger;

/**
 * Utility class for Packager.
 * 
 * @author Catalin Purice
 * 
 */
public final class PackagerUtilities {
    
    /**
     * One second.
     */
    private static final int MILI_SEC = 1000;
    
    /**
     * Constructor.
     */
    private PackagerUtilities() {
    }
    /**
     * 
     * @return time stamp
     */
    public static String calculateTimeStamp() {
        final long timeSec = System.currentTimeMillis() / MILI_SEC;
        return Long.toString(timeSec);
    }
    
    /**
     * Counts files from a specific folder.
     * 
     * @param dir folder
     * @return number of files
     */
    public static int countFiles(final File dir) {
        return FileUtils.listFiles(dir, null, true).size();
    }
    
    /**
     * 
     * @param elements elements
     * @return number of files
     */
    private static int countFiles(final List<String> elements) {
        int count = 0;
        for (final String element : elements) {
            final String localElement = element.replace(PackagerConstants.ALL_CHAR, "");
            final File localFile = new File(localElement);
            if (localFile.isDirectory()) {
                count = count + PackagerUtilities.countFiles(localFile);
            } else {
                count++;
            }
        }
        return count;
    }
    
    /**
     * 
     * @param filePath file path
     * @return new File
     */
    public static File createFileNameIfNotExist(final String filePath) {
        final File destFile = new File(filePath);
        if (!destFile.exists()) {
            try {
                if (!destFile.createNewFile()) {
                    throw new IOException("Cannot create file: " + filePath);
                }
            } catch (final IOException exIO) {
                Logger.getLogger(PackagerUtilities.class).error(
                    MessageFormat.format("", new Object[] { exIO.getMessage() }));
            }
        }
        return destFile;
    }
    
    /**
     * 
     * @param dir folder to delete
     * @throws IOException exception
     */
    public static void deleteDir(final File dir) throws IOException {
        FileUtils.deleteDirectory(dir);
    }
    
    /**
     * 
     * @param dataElements data file elements
     * @return paths as strings
     */
    public static List<String> getDataPathsToZip(final List<FileElement> dataElements) {
        final List<String> pathList = new ArrayList<String>();
        final String ext = AppUpdateWizardConstants.DATA_PREFIX;
        for (final FileElement dataElement : dataElements) {
            if (ext.equals(dataElement.getType())) {
                pathList.add(dataElement.getPath());
            }
        }
        return pathList;
    }
    
    /**
     * 
     * @param extensionElements extension file elements
     * @return paths as strings
     */
    public static List<String> getExtensionPathsToZip(final List<FileElement> extensionElements) {
        final List<String> fileList = new ArrayList<String>();
        final String ext = AppUpdateWizardConstants.EXTENSION_PREFIX;
        for (final FileElement extensionElement : extensionElements) {
            if (ext.equals(extensionElement.getType())) {
                fileList.add(extensionElement.getPath());
            }
        }
        return fileList;
    }
    
    /**
     * 
     * @return no of selected data files
     * @throws IOException exception
     */
    public static int getNoOfDataFilesToZip() throws IOException {
        final List<FileElement> allElements = FileElement.getElementsFromPrefFile();
        final List<String> dataElements = getDataPathsToZip(allElements);
        return countFiles(dataElements);
    }
    
    /**
     * 
     * @return no of selected extension files
     * @throws IOException exception
     */
    public static int getNoOfExtensionsFilesToZip() throws IOException {
        final List<FileElement> allElements = FileElement.getElementsFromPrefFile();
        final List<String> extElements = getExtensionPathsToZip(allElements);
        return countFiles(extElements);
    }
    
    /**
     * Gets no of files from archive.
     * 
     * @param zipFilePath ZIP file
     * @return no of files
     * @throws IOException exception
     */
    public static int getNoOfFilesFromZip(final String zipFilePath) throws IOException {
        ZipFile zipfile = null;
        int count = 0;
        try {
            zipfile = new ZipFile(zipFilePath);
            count = zipfile.size();
        } catch (final IOException exIO) {
            throw new ExceptionBase("Error while packing data: ", exIO.getMessage(), exIO);
            
        } finally {
            if (zipfile != null) {
                zipfile.close();
            }
        }
        return count;
    }
    
    /**
     * 
     * @param fileName file name
     * @return true if the file exist
     */
    public static boolean isFileExists(final String fileName) {
        String fullPath = fileName;
        if (fileName.equals(AppUpdateWizardConstants.ARCHIBUS_WAR)) {
            fullPath =
                    ContextStore.get().getWebAppPath().toString() + File.separator
                            + AppUpdateWizardConstants.ARCHIBUS_WAR;
        } else if (fileName.equals(AppUpdateWizardConstants.DATA_WAR_FILE_NAME)) {
            fullPath =
                    ContextStore.get().getWebAppPath().toString() + File.separator
                            + AppUpdateWizardConstants.DATA_WAR_FILE_NAME;
        } else {
            fullPath =
                    ContextStore.get().getWebAppPath().toString() + File.separator
                            + AppUpdateWizardConstants.EXTENSION_WAR_FILE_NAME;
        }
        final File file = new File(fullPath);
        
        boolean fileExist = false;
        if (file.exists() && file.isFile()) {
            fileExist = true;
        }
        return fileExist;
    }
    
    /**
     * 
     * @param elem file element
     * @param list list of elements
     * @return true if the path or file is valid
     */
    public static boolean isValidAndUniquePath(final FileElement elem, final List<FileElement> list) {
        
        String filePath = elem.getPath();
        
        if (elem.isJarExpression()) {
            filePath = elem.getPath().replace(AppUpdateWizardConstants.JAREXT, "");
        } else if (elem.getPath().contains(PackagerConstants.ALL_CHAR)) {
            filePath = elem.getPath().replace(PackagerConstants.ALL_CHAR, "");
        }
        final File file = new File(filePath);
        
        boolean isValid = true;
        
        if (file.exists()) {
            for (final FileElement d : list) {
                final String path = d.getPath().replace(PackagerConstants.ALL_CHAR, "");
                final File dfile = new File(path);
                final String pathFromList = dfile.getPath();
                final String newPath = file.getPath();
                if (pathFromList.equals(newPath) && d.getType().equals(elem.getType())) {
                    isValid = false;
                    break;
                }
            }
        } else {
            isValid = false;
        }
        return isValid;
    }
    
    /**
     * 
     * @param line line from file
     * @return true if the line is valid
     */
    public static boolean isValidLine(final String line) {
        return (line.contains(AppUpdateWizardConstants.EXTENSION_PREFIX_EQ)
                || line.contains(AppUpdateWizardConstants.DATA_PREFIX_EQ)
                || line.contains("extension =") || line.contains("data =")) ? true : false;
    }
    
    /**
     * 
     * @param temporaryFolder tempFolder
     * @throws IOException throws exception in case the file cannot be renamed
     */
    public static void moveArchibusZip(final String temporaryFolder) throws IOException {
        final String oldPath =
                temporaryFolder + File.separator + AppUpdateWizardConstants.ARCHIBUS_WAR;
        final String newPath =
                ContextStore.get().getWebAppPath().toString() + File.separator
                        + AppUpdateWizardConstants.ARCHIBUS_WAR;
        final File archibusWAR = new File(oldPath);
        if (archibusWAR.exists()) {
            final File newFile = new File(newPath);
            if (!archibusWAR.renameTo(newFile)) {
                throw new IOException();
            }
        } else {
            // file not present
            return;
        }
    }
    
    /**
     * 
     * @param temporaryFolder folder
     */
    public static void removeTempFolders(final String temporaryFolder) {
        try {
            PackagerUtilities.deleteDir(new File(temporaryFolder));
        } catch (final IOException e) {
            throw new ExceptionBase();
        }
    }
    
}