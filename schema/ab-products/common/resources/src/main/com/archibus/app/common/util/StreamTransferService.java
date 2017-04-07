package com.archibus.app.common.util;

import java.io.*;

import com.archibus.jobmanager.JobBase;
import com.archibus.utility.*;

/**
 * Provides methods for handling and transferring a stream (file, socket, byteArray, etc.) to/from
 * the folder where this Web application is installed.
 *
 * @author Angel Delacruz
 * @author Valery Tydykov
 * @since 23.1
 */
public class StreamTransferService extends JobBase {

    /**
     * Property: Absolute path of folder where this Web application is installed.
     */
    private final String webAppPath;

    /**
     * Property: Name of project folder on the Web application server.
     */
    private final String projectFolderName;

    /**
     * Public default constructor: utility class is instantiable.
     *
     * @param webAppPath the webAppPath to set.
     * @param projectFolderName the projectFolderName to set.
     */
    public StreamTransferService(final String webAppPath, final String projectFolderName) {
        super();
        this.webAppPath = webAppPath;
        this.projectFolderName = projectFolderName;
    }

    /**
     * Getter for the webAppPath property.
     *
     * @see webAppPath
     * @return the webAppPath property.
     */
    public String getWebAppPath() {
        return this.webAppPath;
    }

    /**
     * Getter for the projectFolderName property.
     *
     * @see projectFolderName
     * @return the projectFolderName property.
     */
    public String getProjectFolderName() {
        return this.projectFolderName;
    }

    /**
     * Writes stream to file in /#Attribute%//@webAppPath%/[projectFolderName]/folderPath/filePath
     * folder.
     *
     * @param folderPath folder path relative to /#Attribute%//@webAppPath%/[projectFolderName].
     * @param filePath destination file path relative to
     *            /#Attribute%//@webAppPath%/[projectFolderName]/folderPath/.
     * @param overwrite if true will overwrite the destination file if it exists.
     * @param inputStream stream with file contents to be written.
     * @throws ExceptionBase if the destination file exists and overwrite is false, or if
     *             IOException was thrown during file writing.
     */
    public void writeStreamToFile(final String folderPath, final String filePath,
            final boolean overwrite, final InputStream inputStream) throws ExceptionBase {
        final File destination = new File(
            new File(new File(this.webAppPath, this.projectFolderName), folderPath), filePath);

        if (destination.exists() && !overwrite) {
            // @non-translatable
            final String message = "File exists and overwrite parameter is false.";
            throw new ExceptionBase(message);
        }

        FileUtil.copyStreamToFileCreateParentDirs(inputStream, destination);
    }
}
