package com.archibus.app.sysadmin.updatewizard.project.transfer;

import java.io.*;
import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardUtilities;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.ext.report.xls.XlsBuilder.FileFormatType;
import com.archibus.utility.StringUtil;

/**
 * Common properties for TransferFileIn and TrnsferFileOut.
 * 
 * @author Catalin Purice
 * 
 */
public class TransferFile {
    
    /**
     * Transfer folder.
     */
    private static final String DUW_FOLDER_PATH = ContextStore.get().getWebAppPath()
            + File.separator + "projects" + File.separator + "users" + File.separator + "public"
            + File.separator + "dt" + File.separator + ProjectUpdateWizardConstants.DUW_FOLDER;
    
    /**
     * file object.
     */
    private transient File file;
    
    /**
     * file name.
     */
    private transient String fileName;
    
    /**
     * table name.
     */
    private transient String tableName;
    
    /**
     * Set a new table name.
     * 
     * @param myTableName table name
     * @return current object
     */
    public TransferFile loadTableParam(final String myTableName) {
        this.tableName = myTableName;
        this.fileName = myTableName + SchemaUpdateWizardUtilities.DOT + FileFormatType.CSV;
        final String path = getTransferFolderIn() + File.separator + this.fileName;
        this.file = new File(path);
        return this;
    }
    
    /**
     * Return true if the table has fields that contains documents.
     * 
     * @return true/false
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification: Case #1: Statements with SELECT WHERE EXISTS ... pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public boolean isDocTable() {
        final String sql =
                "SELECT (CASE WHEN EXISTS (SELECT 1 FROM afm_flds where afm_type=2165 and afm_flds.table_name=afm_tbls.table_name) THEN 1 ELSE 0 END ) AS is_doc FROM afm_tbls WHERE table_name='"
                        + this.tableName + "'";
        final DataSource dsIsDoc =
                DataSourceFactory
                    .createDataSource()
                    .addTable(ProjectUpdateWizardConstants.AFM_TRANSFER_SET)
                    .addQuery(sql)
                    .addVirtualField(ProjectUpdateWizardConstants.AFM_TRANSFER_SET, "is_doc",
                        DataSource.DATA_TYPE_INTEGER);
        
        final DataRecord record = dsIsDoc.getRecord();
        return record.getInt("afm_transfer_set.is_doc") == 1 ? true : false;
    }
    
    /**
     * Create a new folder.
     * 
     * @param folder folder path
     * @throws IOException IO Exception
     */
    public static void createFolder(final String folder) throws IOException {
        try {
            if (!new File(folder).mkdirs()) {
                throw new IOException();
            }
        } catch (final IOException ioE) {
            ProjectUpdateWizardLogger.logException(ioE.getMessage());
        }
    }
    
    /**
     * Output folder.
     * 
     * @return transfer folder
     */
    public static String getTransferFolderOut() {
        
        return DUW_FOLDER_PATH + File.separator + ProjectUpdateWizardConstants.CURRENT_DB_FOLDER;
        
    }
    
    /**
     * Input folder.
     * 
     * @return transfer folder
     */
    public static String getTransferFolderIn() {
        
        return DUW_FOLDER_PATH + File.separator + getSessionFolderName();
        
    }
    
    /**
     * Returns the path to afm_tbls_table_types.csv file.
     * 
     * @return String
     */
    public static String getTableTypeFileFolder() {
        final String archibusPath = ContextStore.get().getWebAppPath();
        return archibusPath + File.separator + "schema" + File.separator + "ab-core"
                + File.separator + "system-administration" + File.separator + "dbwiz"
                + File.separator + "data";
    }
    
    /**
     * @return the file
     */
    public File getFile() {
        return this.file;
    }
    
    /**
     * @return the fileName
     */
    public String getFileName() {
        return this.fileName;
    }
    
    /**
     * @return the tableName
     */
    public String getTableName() {
        return this.tableName;
    }
    
    /**
     * 
     * Get Total Number Of Records To Be Exported/Imported for tables with status='PENDING'.
     * 
     * @return long
     */
    public static long getTotalNoOfRecordsToTransfer() {
        final Clause restriction =
                Restrictions.eq(ProjectUpdateWizardConstants.AFM_TRANSFER_SET, "status",
                    ProjectUpdateWizardConstants.PENDING);
        return DataStatistics.getInt(ProjectUpdateWizardConstants.AFM_TRANSFER_SET,
            "nrecords_source", "SUM", restriction);
    }
    
    /**
     * 
     * Reads Data Dictionary Folders from
     * archibus\\projects\\users\\public\\dt\\database-update\\<db type>.
     * 
     * @return array of string representing the folder names
     */
    public static String[] readDataDictionaryFolders() {
        
        final String dbTypeFolderName = getFolderNameByDbType();
        
        final File transferFolder = new File(DUW_FOLDER_PATH + File.separator + dbTypeFolderName);
        
        final String[] versionsDirectories = transferFolder.list(new FilenameFilter() {
            public boolean accept(final File dir, final String name) {
                return new File(dir, name).isDirectory();
            }
            
        });
        
        final List<String> allFolders = new ArrayList<String>();
        Collections.addAll(allFolders, ProjectUpdateWizardConstants.CURRENT_DB_FOLDER);
        if (StringUtil.notNullOrEmpty(versionsDirectories)) {
            Collections.addAll(allFolders, versionsDirectories);
        }
        return allFolders.toArray(new String[allFolders.size()]);
    }
    
    /**
     * 
     * Returns the name of the folder that should be under
     * archibus\\projects\\users\\public\\dt\\database-update\\ by database type as follows:
     * ORACLE,SYBASE,SQL SERVER.
     * 
     * @return DB type folder name
     */
    public static String getFolderNameByDbType() {
        String dbTypeFolderName = "sybase";
        if (SqlUtils.isOracle()) {
            dbTypeFolderName = "oracle";
        } else if (SqlUtils.isSqlServer()) {
            dbTypeFolderName = "sql server";
        }
        return dbTypeFolderName;
    }
    
    /**
     * 
     * Returns the folder where CSV Data Dictionary files exists.
     * 
     * @return String
     */
    public static String getSessionFolderName() {

        final Object selectedFolderValue =
                ContextStore.get().getHttpSession().getServletContext()
                .getAttribute("sessionFolder");

        String selectedFolderName = "";

        if (StringUtil.isNullOrEmpty(selectedFolderValue)
                || ProjectUpdateWizardConstants.CURRENT_DB_FOLDER
                .equalsIgnoreCase(selectedFolderValue.toString())) {
            selectedFolderName = ProjectUpdateWizardConstants.CURRENT_DB_FOLDER;
        } else {
            selectedFolderName =
                    String.valueOf(getFolderNameByDbType() + File.separator
                            + selectedFolderValue.toString());
        }

        return selectedFolderName;

    }
}
