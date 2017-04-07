package com.archibus.eventhandler.CapitalProjects;

import java.io.FileInputStream;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.ext.report.ReportUtility;
import com.archibus.utility.*;

public class MsProjectUtility {
    
    private static final String ASPOSE_TASKS_LIC_FILE_NAME = "aspose.tasks.lic";
    
    private static final String APPLICATIONS_TASKS_PATH = "/context/applications/mpp/";
    
    private static final String TEMPLATE_FILE_NAME = "blankproject";

    /**
     * This is a static class that should not be instantiated.
     */
    private MsProjectUtility() throws InstantiationException {
    }

    public static boolean loadTasksLibraryLicense() {
        final String licenseFilePath =
                ReportUtility.getConfigPath() + APPLICATIONS_TASKS_PATH
                + ASPOSE_TASKS_LIC_FILE_NAME;
        try {
            
            final com.aspose.tasks.License license = new com.aspose.tasks.License();
            license.setLicense(new FileInputStream(licenseFilePath));

            return true;
        } catch (final Exception e) {
            throw new ExceptionBase(String.format(
            // @non-translatable
                "Failed to load Aspose.Tasks license from license file=[%s]", licenseFilePath), e);
        }
    }

    /**
     * Get ms project template file stored path.
     */
    public static String getTemplateFilePath(final String versionSuffix) {
        return getFilePath("", versionSuffix);
    }

    /**
     * Get ms project template file stored path.
     */
    public static String getFilePath(final String fileName, final String versionSuffix) {
        final String configPath =
                ContextStore.get().getConfigManager().getAttribute("/*/preferences/@configPath");
        if (StringUtil.notNullOrEmpty(fileName)) {
            return Utility.replaceInvalidCharactersInFilePath(configPath) + APPLICATIONS_TASKS_PATH
                    + fileName;
        } else {
            return Utility.replaceInvalidCharactersInFilePath(configPath) + APPLICATIONS_TASKS_PATH
                    + TEMPLATE_FILE_NAME + versionSuffix.toLowerCase() + ".mpp";
        }
        
    }
    
    public static java.util.Date convertDate(final java.sql.Date taskStartDate,
            final int incrementHours) {
        java.util.Date newTaskStartDate = new java.util.Date(taskStartDate.getTime());
        final java.util.Calendar cal = java.util.Calendar.getInstance(); // creates calendar
        cal.setTime(newTaskStartDate); // sets calendar time/date
        cal.add(java.util.Calendar.HOUR_OF_DAY, incrementHours); // adds 8 hour
        newTaskStartDate = new java.util.Date(cal.getTimeInMillis());
        return newTaskStartDate;
    }

    /**
     * Description of the Method
     *
     * @param taskName Description of the Parameter
     * @return Description of the Return Value
     */
    public static Map<String, String> splitContent(final String taskName) {
        
        final Map<String, String> map = new HashMap<String, String>();
        final int index = taskName.indexOf("|");
        
        if (index < 0) {
            if (taskName.length() == 0) {
            } else {
                map.put(MsProjectConstants.ContentKey.FIRST.toString(), taskName);
                map.put(MsProjectConstants.ContentKey.SECOND.toString(), "");
            }
        } else if (index == 0) {
            map.put(MsProjectConstants.ContentKey.FIRST.toString(), "");
            map.put(MsProjectConstants.ContentKey.SECOND.toString(),
                StringUtil.notNull(taskName.substring(index + 1)).trim());
        } else if (index == taskName.length() - 1) {
            map.put(MsProjectConstants.ContentKey.FIRST.toString(),
                StringUtil.notNull(taskName.substring(0, index)).trim());
            map.put(MsProjectConstants.ContentKey.SECOND.toString(), "");
        } else {
            map.put(MsProjectConstants.ContentKey.FIRST.toString(),
                StringUtil.notNull(taskName.substring(0, index)).trim());
            map.put(MsProjectConstants.ContentKey.SECOND.toString(),
                StringUtil.notNull(taskName.substring(index + 1)).trim());
        }
        
        return map;
    }
}
