package com.archibus.app.sysadmin.updatewizard.schema;

import java.io.IOException;
import java.util.List;

/**
 * Schema update wizard service interface.
 *
 * @author Catalin Purice
 *
 */
public interface SchemaUpdateWizardService {
    
    /**
     *
     * @param likeWildCard from UI
     * @param includeVTables from UI
     * @param isPUWTables from UI
     * @return true if the table is a doc table
     */
    boolean hasBlobTables(String likeWildCard, boolean includeVTables, boolean isPUWTables);
    
    /**
     *
     * @param likeWildcard from UI
     * @param includeVTables from UI
     * @param recreateTable from UI
     * @param puwTables from UI
     * @param recreateFk from UI
     * @return job ID
     */
    String startCompareJob(String likeWildcard, boolean includeVTables, boolean recreateTable,
            boolean puwTables, boolean recreateFk);
    
    /**
     *
     * @param executeDbCommand from UI
     * @param toLogFile from UI
     * @param isRecreateTable from UI
     * @param recreateAllFK from UI
     * @param setToChar from UI
     * @param tableSpaceName from UI
     * @return job ID
     */
    String startUpdateSchemaJob(boolean executeDbCommand, boolean toLogFile,
            boolean isRecreateTable, boolean recreateAllFK, boolean setToChar, String tableSpaceName);
    
    /**
     * Prepare the schema DB to be used with Schema/Project Update Wizard.
     *
     * @return job ID
     */
    String startPrepareSchemaForDatabaseUpdateWizard();
    
    /**
     * Recreates logical objects (triggers,indexes,views ...).
     *
     * @return job ID
     */
    String startRecreateStructuresJob();
    
    /**
     *
     * Alters a single table.
     *
     * @param tableName table name
     * @return job ID
     */
    String startUpdateSchemaForTableJob(String tableName);
    
    /**
     *
     * Runs the script file.
     *
     * @param file file.
     * @return job ID
     * @throws IOException exception
     */
    String runScript(String file) throws IOException;
    
    /**
     *
     * returns the file names from personalized-database folder.
     *
     * @param filePath path
     * @return list of supported files
     */
    List<String> getServerFiles(final String filePath);

    /**
     *
     * Returns the server file contents.
     *
     * @param filePath path
     * @param fileName file name
     * @return file contents as String
     * @throws IOException throws IO Exception
     */
    String getServerFileContents(final String filePath, final String fileName) throws IOException;
    
}
