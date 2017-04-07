package com.archibus.app.sysadmin.updatewizard.app.util;

import java.io.*;
import java.util.logging.*;

import com.archibus.context.ContextStore;
import com.archibus.utility.ExceptionBase;

/**
 * 
 * Package and deploy wizard logger.
 * 
 * @author Catalin Purice
 * @since 21.3
 * 
 */
public final class AppUpdateWizardLogger {
    
    /**
     * Logger file name.
     */
    private static final String LOG_FILE_NAME = "package-and-deploy-wizard.log";
    
    /**
     * Path to log file name.
     */
    private static final String PATH_TO_LOG_FILE_NAME = "WEB-INF" + File.separator + "config"
            + File.separator + LOG_FILE_NAME;
    
    /**
     * The logger.
     */
    private static final Logger LOGGER = Logger.getLogger("PACKAGE AND DEPLOY WIZARD LOGGER.");
    
    /**
     * 
     * Private default constructor: utility class is non-instantiable.
     */
    private AppUpdateWizardLogger() {
        
    }
    
    /**
     * Initialize the file logger.
     * 
     * @param append append to log file
     * @return logger
     */
    public static Logger initLogger(final boolean append) {
        /**
         * File handler.
         */
        FileHandler handler = null;
        try {
            handler = new FileHandler(getAbsolutePath(), append);
            handler.setFormatter(new Formatter() {
                /**
                 * Overrides the format method in order to write the log into a more compact form.
                 */
                @Override
                public String format(final LogRecord record) {
                    return record.getMessage() + System.getProperty("line.separator");
                }
            });
            LOGGER.setLevel(Level.INFO);
            LOGGER.addHandler(handler);
            LOGGER.info("START logger");
        } catch (final SecurityException e) {
            throw new ExceptionBase(null, e.getMessage(), e);
        } catch (final IOException e) {
            throw new ExceptionBase(null, e.getMessage(), e);
        }
        
        return LOGGER;
    }
    
    /**
     * Getter for the logger property.
     * 
     * @see logger
     * @return the logger property.
     */
    public static Logger getLogger() {
        return LOGGER;
    }
    
    /**
     * Getter for absolute path.
     *
     * @return absolute path.
     */
    public static String getAbsolutePath() {
        return ContextStore.get().getWebAppPath() + File.separator + PATH_TO_LOG_FILE_NAME;
    }

    /**
     * Getter for relative path.
     *
     * @return relative path.
     */
    public static String getRelativePath() {
        return ContextStore.get().getContextPath() + File.separator + PATH_TO_LOG_FILE_NAME;
    }

    /**
     * Getter log file name.
     *
     * @return log file name.
     */
    public static String getLogFileName() {
        return LOG_FILE_NAME;
    }
    
    /**
     *
     * Close the handlers.
     * 
     */
    public static void close() {
        for (final Handler handler : LOGGER.getHandlers()) {
            handler.close();
        }
    }
    
}
