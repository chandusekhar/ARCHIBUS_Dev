package com.archibus.app.sysadmin.updatewizard.project;

import java.util.List;

/**
 * Project update wizard service interface.
 * 
 * @author Catalin Purice
 * 
 */
@SuppressWarnings("PMD.TooManyMethods")
public interface ProjectUpdateWizardService {
    
    /**
     * Sets chosen action.
     * 
     * @param autonumId afm_flds_trans.autonumbered_id
     * @param chosenAction value to set
     */
    void setChosenAction(String autonumId, String chosenAction);
    
    /**
     * Populates the afm_transfer_set table with data.
     * 
     * @param tableTypesList list of table types group if selected from UI
     * @param isValidated true/false check box from UI option "Include validated tables"
     * @param namedTable represents table like input from UI
     * @param isTransferIn true if the user selects transfer in process from UI
     * @return job ID
     */
    String addTableNamesToTransferSet(List<String> tableTypesList, boolean isValidated,
            String namedTable, boolean isTransferIn);
    
    /**
     * Keep the ML Heading.
     */
    void keepMlHeading();
    
    /**
     * Starts compare job.
     * 
     * @return job ID
     */
    String startCompareJob();
    
    /**
     * Starts transfer in job.
     * 
     * @param isDeleteEachFile delete each file?
     * @param isLogSqlCommands log the SQL commands to external file
     * @param isExecuteSqlCommands executes the SQL commands directly on DB
     * @param ddSelected if the transfer in is actually a merge data dictionary operation then true
     * @return job ID
     */
    String startTransferInJob(final boolean isDeleteEachFile, boolean isLogSqlCommands,
            boolean isExecuteSqlCommands, boolean ddSelected);
    
    /**
     * Starts transfer out job.
     * 
     * @param isDeleteFiles true if the file will be deleted before transfer out job begins
     * @return job ID
     */
    String startTransferOutJob(boolean isDeleteFiles);
    
    /**
     * Starts apply chosen action job.
     * 
     * @param isExecute execute SQL commands directly
     * @param isLog log the SQL commands
     * @return job ID
     */
    String startApplyChosenActionJob(boolean isExecute, final boolean isLog);
    
    /**
     * Starts apply recommended job.
     * 
     * @param isExecute execute SQL commands directly
     * @param isLog log the SQL commands
     * @return job ID
     */
    String startApplyRecommActionJob(boolean isExecute, final boolean isLog);
    
    /**
     * Starts update ARCHIBUS schema job.
     * 
     * @return job ID
     */
    String startUpdateTableTypesJob();
    
    /**
     *
     * Validates user selection changed from "Merge Data Dictionary" tab.
     *
     * @return job ID
     */
    String startValidateChosenDataDictionaryChangesJob();
    
    /**
     * Checks if the file exists on the server.
     * 
     * @param fileName name of the file
     * @return true if the file exist and false otherwise
     */
    boolean fileExists(final String fileName);
    
    /**
     * Checks if the files exists on the server.
     * 
     * @param fileNamePath paths of the files
     * @return false if any of the files is missing and false otherwise
     */
    boolean filesExists(final List<String> fileNamePath);
    
    /**
     * getDataDictionaryFolders.
     * 
     * Returns the list of folders names from path
     * archibus\\projects\\users\\public\\dt\\database-update.
     * 
     * @return String[]
     */
    String[] getDataDictionaryFolders();
    
    /**
     * Set context folder.
     * 
     * @param folderName folder name
     */
    void setContextFolder(final String folderName);
}
