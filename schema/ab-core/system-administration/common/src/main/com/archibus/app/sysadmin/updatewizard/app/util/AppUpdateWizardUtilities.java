package com.archibus.app.sysadmin.updatewizard.app.util;

import java.io.*;
import java.sql.Date;
import java.util.*;

import com.archibus.config.Project;
import com.archibus.context.ContextStore;

/**
 * Implements trivial common methods used in Application Update Wizard.
 * 
 * @author Catalin Purice
 * 
 */
public final class AppUpdateWizardUtilities {
    
    /**
     * Constructor.
     */
    private AppUpdateWizardUtilities() {
        
    }
    
    /**
     * Copy template file if doesn't exist in /WEB-INF/config location.
     * 
     * @throws IOException throws exception if the file cannot be copied
     */
    public static void copyTemplateFile() throws IOException {
        final String path = AppUpdateWizardUtilities.getAppUpdPrefFilePath();
        final File toFile = new File(path);
        if (!toFile.exists()) {
            
            final String templateFilePath =
                    ContextStore.get().getWebAppPath() + AppUpdateWizardConstants.TEMPLATE_PATH
                            + AppUpdateWizardConstants.DEPLOY_PACKAGE_FILE_NAME;
            final File tempFile = new File(templateFilePath);
            
            final FileReader inReader = new FileReader(tempFile);
            final FileWriter outWriter = new FileWriter(toFile);
            int line = inReader.read();
            while (line != -1) {
                outWriter.write(line);
                line = inReader.read();
            }
            
            inReader.close();
            outWriter.close();
        }
    }
    
    /**
     * 
     * @return active projects only
     */
    private static List<Project.Immutable> getActiveProjects() {
        final List<Project.Immutable> projects =
                ContextStore.get().getConfigManager().getProjects();
        final List<Project.Immutable> activeProjectList = new ArrayList<Project.Immutable>();
        for (int i = 0; i < projects.size(); i++) {
            final Project.Immutable project = projects.get(i);
            if (project.isOpen()) {
                activeProjectList.add(project);
            }
        }
        return activeProjectList;
    }
    
    /**
     * @return application update preferences path.
     */
    public static String getAppUpdPrefFilePath() {
        final String path =
                ContextStore.get().getWebAppPath() + File.separator + "WEB-INF" + File.separator
                        + "config" + File.separator
                        + AppUpdateWizardConstants.DEPLOY_PACKAGE_FILE_NAME;
        return path;
    }
    
    /**
     * Gets mysite-extensions.war details.
     * 
     * @return date of file creation
     */
    public static Date getExtensionsFileDetails() {
        final String path =
                ContextStore.get().getWebAppPath() + File.separator
                        + AppUpdateWizardConstants.EXTENSION_WAR_FILE_NAME;
        final File extFile = new File(path);
        Date time = null;
        if (extFile.exists()) {
            final long timestamp = extFile.lastModified();
            time = new Date(timestamp);
        }
        return time;
    }
    
    /**
     * Gets Active project folders.
     * 
     * @return JSONArray
     */
    public static List<Map<String, String>> getProjectFolders() {
        final List<Project.Immutable> activeProjects = getActiveProjects();
        final List<Map<String, String>> activeProjectFolders = new ArrayList<Map<String, String>>();
        
        for (int i = 0; i < activeProjects.size(); i++) {
            final Project.Immutable project = activeProjects.get(i);
            final String projectTitle = project.getTitle();
            final String graphicsEFld =
                    new File(project.getEnterpriseGraphicsFolderForSmartClient()).toString();
            final String drawingsFld =
                    new File(project.getDrawingsFolderForSmartClient()).toString();
            String graphicsFld = project.getEnterpriseGraphicsFolderForSmartClient();
            graphicsFld = new File(graphicsFld).getParent().toString();
            graphicsFld = graphicsFld + File.separator + "graphics";
            final String eGraphicsFld = new File(project.getEnterpriseGraphicsFolder()).toString();
            
            final Map<String, String> jsonObj = new HashMap<String, String>();
            jsonObj.put("title", projectTitle);
            jsonObj.put("graphicsEFolder", graphicsEFld);
            jsonObj.put("drawingsFolder", drawingsFld);
            jsonObj.put("graphicsFolder", graphicsFld);
            jsonObj.put("enterpriseGraphicsFolder", eGraphicsFld);
            
            activeProjectFolders.add(jsonObj);
        }
        return activeProjectFolders;
    }
    
    /**
     * Renames archibus.old file.
     * 
     * @param timeStamp time stamp
     * @throws IOException throws {@link IOException}
     */
    public static void renameOrigArchibusZip(final String timeStamp) throws IOException {
        final String archibusWARPath =
                ContextStore.get().getWebAppPath().toString() + File.separator
                        + AppUpdateWizardConstants.ARCHIBUS_WAR;
        final File archibusWAR = new File(archibusWARPath);
        final String archibusWAROLDPath =
                ContextStore.get().getWebAppPath().toString() + File.separator
                        + AppUpdateWizardConstants.ARCHIBUS_OLD;
        File archibusWAROLD = new File(archibusWAROLDPath);
        if (archibusWAROLD.exists() && archibusWAROLD.isFile()) {
            final String newArchibusWAROLD =
                    AppUpdateWizardConstants.ARCHIBUS_OLD + "_" + timeStamp;
            final String newArchibusWAROLDPath =
                    ContextStore.get().getWebAppPath().toString() + File.separator
                            + newArchibusWAROLD;
            archibusWAROLD = new File(newArchibusWAROLDPath);
        }
        if (!archibusWAR.renameTo(archibusWAROLD)) {
            throw new IOException();
        }
    }
}
