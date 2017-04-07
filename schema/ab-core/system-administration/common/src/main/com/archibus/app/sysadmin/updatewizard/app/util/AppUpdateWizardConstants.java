package com.archibus.app.sysadmin.updatewizard.app.util;

/**
 * Defines constants used in Application Update Wizard.
 * 
 * @author Catalin Purice
 * 
 */
public final class AppUpdateWizardConstants {
    
    /**
     * Properties file name template path.
     */
    public static final String TEMPLATE_PATH =
            "\\schema\\ab-core\\system-administration\\update-app-wizard\\templates\\";
    
    /**
     * Deployment properties file name.
     */
    public static final String DEPLOY_PACKAGE_FILE_NAME = "application-update.properties";
    
    /**
     * Constant.
     */
    public static final String EXTENSION_WAR_FILE_NAME = "mysite-extensions.war";
    
    /**
     * Constant.
     */
    public static final String DATA_WAR_FILE_NAME = "mysite-data.war";
    
    /**
     * Constant.
     */
    public static final String ARCHIBUS_WAR = "archibus.war";
    
    /**
     * Constant.
     */
    public static final String ARCHIBUS_OLD = "archibus_war.old";
    
    /**
     * Constant.
     */
    public static final String DATA_PREFIX_EQ = "data=";
    
    /**
     * Constant.
     */
    public static final String EXTENSION_PREFIX_EQ = "extension=";
    
    /**
     * Constant.
     */
    public static final String DATA_PREFIX = "data";
    
    /**
     * Constant.
     */
    public static final String EXTENSION_PREFIX = "extension";
    
    /**
     * Constant.
     */
    public static final String JAREXT = "*.jar";
    
    /**
     * Constant.
     */
    public static final char COMMENT_CHAR = '#';
    
    /**
     * Constant.
     */
    public static final String LOG_PREFIX_MESSAGE = "Package and Deploy Wizard: [{0}]";
    
    /**
     * Constant.
     */
    public static final int THIRTY = 30;
    
    /**
     * Constant.
     */
    public static final int SIXTY = 60;
    
    /**
     * Constant.
     */
    public static final int THREE = 3;
    
    /**
     * Constructor.
     */
    private AppUpdateWizardConstants() {
        // TODO Auto-generated constructor stub
    }
    
}
