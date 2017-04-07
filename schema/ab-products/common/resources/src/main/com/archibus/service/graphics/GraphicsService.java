package com.archibus.service.graphics;

import java.io.*;

import com.archibus.config.ContextCacheable;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.JobBase;

/**
 * Enterprise Graphics handlers.
 * 
 * @author Ioan Draghici
 * 
 */

public class GraphicsService extends JobBase {

    /**
     * Constants. Translatable messages used for job status display.
     */
    // @translatable
    private static final String MESSAGE_READ_GRAPHICS_FOLDER = "Read Folder Content";

    /**
     * Constants. Translatable messages used for job status display.
     */
    // @translatable
    private static final String MESSAGE_DELETING_FILES = "Deleting Files";

    /**
     * Delete all files from current project enterprise graphic folder.
     * 
     * @throws IOException throw IO exception
     */
    public void deleteAllEnterpriseGraphics() throws IOException {

        ContextCacheable.Immutable context = ContextStore.get().getCurrentContext();
        String graphicsFolder = getGraphicsFolderFullPath();

        this.status.setMessage(EventHandlerBase.localizeString(context,
            MESSAGE_READ_GRAPHICS_FOLDER, this.getClass().getName()));
        File[] filesList = readGraphicsFolder(graphicsFolder);

        this.status.setMessage(EventHandlerBase.localizeString(context, MESSAGE_DELETING_FILES,
            this.getClass().getName()));

        for (File file : filesList) {
            if (file.isFile()) {
                file.delete();
            }
        }
    }

    /**
     * Delete all unused files from current project enterprise graphic folder.
     */
    public void deleteUnusedEnterpriseGraphics() {

        ContextCacheable.Immutable context = ContextStore.get().getCurrentContext();
        String graphicsFolder = getGraphicsFolderFullPath();

        this.status.setMessage(EventHandlerBase.localizeString(context,
            MESSAGE_READ_GRAPHICS_FOLDER, this.getClass().getName()));
        File[] filesList = readGraphicsFolder(graphicsFolder);

        this.status.setMessage(EventHandlerBase.localizeString(context, MESSAGE_DELETING_FILES,
            this.getClass().getName()));

        for (File file : filesList) {
            if (file.isFile() && isUnused(file)) {
                file.delete();
            }
        }
    }

    /**
     * Read graphics folder content.
     * 
     * @param folder - folder path
     * @return collection of files
     */
    private File[] readGraphicsFolder(String folder) {
        File graphicsFolder = new File(folder);
        return graphicsFolder.listFiles();
    }

    /**
     * Get application installation path.
     * 
     * @return String - application parent folder
     */
    private String getApplicationParentPath() {
        String path = ContextStore.get().getWebAppPath().toString();
        return new File(path).getParent().toString();
    }

    /**
     * Get full path for enterprise graphics folder.
     * 
     * @return String - full path of enterprise graphic folder
     */
    private String getGraphicsFolderFullPath() {
        String applicationPath = getApplicationParentPath();
        String graphicsFolder = ContextStore.get().getProject().getEnterpriseGraphicsFolder();
        return (applicationPath + graphicsFolder);
    }

    /**
     * Check if current file is unused.
     * 
     * @param file - current graphic file
     * @return boolean true if is unused, false otherwise
     */
    private boolean isUnused(File file) {

        DataSource dsDwgs = DataSourceFactory.createDataSource();
        dsDwgs.addTable("afm_dwgs");
        dsDwgs.addField("dwg_name");
        /*
         * dwg_name db type is char. We must remove trailing spaces - MSSQL issue
         */
        if (dsDwgs.isOracle()) {
            dsDwgs.addRestriction(Restrictions.sql("INSTR(UPPER('"
                    + SqlUtils.makeLiteralOrBlank(file.getName())
                    + "'), UPPER(RTRIM(dwg_name))) = 1"));
        } else if (dsDwgs.isSqlServer() || dsDwgs.isSybase()) {
            dsDwgs.addRestriction(Restrictions.sql("CHARINDEX(UPPER(RTRIM(dwg_name)), UPPER('"
                    + SqlUtils.makeLiteralOrBlank(file.getName()) + "')) = 1"));
        }
        return dsDwgs.getRecords().isEmpty();
    }

}
