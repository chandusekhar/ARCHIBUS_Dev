package com.archibus.app.common.util;

import java.io.InputStream;

import com.archibus.jobmanager.JobBase;
import com.archibus.utility.ExceptionBase;

/**
 * Exposes generic utility methods from different classes. Can be used by different applications.
 * The purpose of this class is strictly as a single common WFR interface and afm_wf_rules entry for
 * common tools/utilities that are needed from client side by multiple activities.
 * <p>
 * In this class, add only WFR interface methods that call methods of your common resource utility
 * class defined elsewhere.
 * <p>
 * DO NOT add interface methods to any activity-specific classes, those must have their own WFR
 * interfaces under the appropriate activity_id.
 * <p>
 * DO NOT use this class as a "dumping ground" for jobs or methods that are hard to classify, create
 * a separate class!
 * <p>
 * The ApplicationUtilityService bean is defined in
 * /WEB-INF/config/context/applications/applications-child-context.xml.
 *
 * @author Angel Delacruz
 * @author Valery Tydykov
 * @since 23.1
 */
public class ApplicationUtilityService extends JobBase {

    /**
     * Property: Absolute path of folder where this Web application is installed.
     */
    private String webAppPath;

    /**
     * Property: Name of project folder on the Web application server.
     */
    private String projectFolderName;

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
     * Setter for the webAppPath property.
     *
     * @see webAppPath
     * @param webAppPath the webAppPath to set.
     */
    public void setWebAppPath(final String webAppPath) {
        this.webAppPath = webAppPath;
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
     * Setter for the projectFolderName property.
     *
     * @see projectFolderName
     * @param projectFolderName the projectFolderName to set.
     */
    public void setProjectFolderName(final String projectFolderName) {
        this.projectFolderName = projectFolderName;
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

        new StreamTransferService(this.webAppPath, this.projectFolderName)
            .writeStreamToFile(folderPath, filePath, overwrite, inputStream);
    }
}
