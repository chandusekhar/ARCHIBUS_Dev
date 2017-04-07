package com.archibus.app.sysadmin.updatewizard.script.file;

import java.io.*;
import java.util.*;

import org.apache.commons.io.FileUtils;

import com.archibus.utility.ExceptionBase;

/**
 *
 * Provides utilities for server files used in DUW-script.
 * <p>
 *
 * @author Catalin Purice
 * @since 22.1
 *
 */
public final class ServerFileUtils {

    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private ServerFileUtils() {
        super();
    }

    /**
     *
     * Return all files from location above.
     *
     * @param pathName path
     *
     * @return list of paths.
     */
    public static List<String> getServerFiles(final String pathName) {
        final List<String> acceptedFiles = new ArrayList<String>();
        final File serverFolder = new InboundFileSystem(pathName).getFile();
        if (serverFolder.exists()) {
            final Collection<File> files = FileUtils.listFiles(serverFolder,
                new String[] { FileType.ExtensionType.DUW.name(),
                        FileType.ExtensionType.DUW.name().toLowerCase(),
                        FileType.ExtensionType.TXT.name(),
                        FileType.ExtensionType.TXT.name().toLowerCase(),
                        FileType.ExtensionType.SQL.name(),
                        FileType.ExtensionType.SQL.name().toLowerCase() },
                false);
            for (final File file : files) {
                acceptedFiles.add(file.getName());
            }
        } else {
            throw new ExceptionBase(
                "Server path does not exist: " + serverFolder.getAbsolutePath());
        }
        return acceptedFiles;
    }

    /**
     *
     * Get file contents.
     *
     * @param pathName path
     * @param fileName file name
     * @return file contents as text
     * @throws IOException if any error occurs
     */
    public static String getFileContents(final String pathName, final String fileName)
            throws IOException {

        final File file = new File(new InboundFileSystem(pathName).getFile().getAbsolutePath()
                + File.separatorChar + fileName);

        final StringBuilder fileContents = new StringBuilder();
        BufferedReader reader = null;
        try {
            reader = new BufferedReader(new FileReader(file));
            for (String line = reader.readLine(); line != null; line = reader.readLine()) {
                fileContents.append(line);
                fileContents.append(System.getProperty("line.separator"));
            }
        } catch (final FileNotFoundException e) {
            throw new ExceptionBase("File not found: " + file.getAbsolutePath(),
                e.getLocalizedMessage());
        } catch (final IOException e) {
            throw new ExceptionBase("I/O error. ", e.getLocalizedMessage());
        } finally {
            if (reader != null) {
                reader.close();
            }
        }
        return fileContents.toString();
    }
}
