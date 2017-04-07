package com.archibus.app.sysadmin.updatewizard.project.loader;

import java.io.*;
import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.transfer.TransferFile;
import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.db.RecordPersistenceImplDT;
import com.archibus.ext.datatransfer.DataTransferUtility;
import com.archibus.ext.importexport.filebuilder.ImportExportFileBase;
import com.archibus.ext.report.xls.*;
import com.archibus.ext.report.xls.XlsBuilder.FileFormatType;
import com.archibus.schema.ArchibusFieldDefBase;
import com.archibus.utility.*;

/**
 * Loads data from CSV file into java objects.
 * 
 * @author Catalin Purice
 * 
 */
public class DataSourceFile {
    
    /**
     * Full file path.
     */
    private transient String fileFullPath;
    
    /**
     * table names.
     */
    private transient String tableName;
    
    /**
     * fields names.
     */
    private final List<String> fieldNames = new ArrayList<String>();
    
    /**
     * XLS Builder.
     */
    private ImportExportFileBase xlsBuilder = new ImportExportFileBase(FileFormatType.CSV);
    
    /**
     * no of records.
     */
    private int noOfRecords;
    
    /**
     * Constructor.
     * 
     * @param fileName full path of file name
     */
    public DataSourceFile(final String fileName) {
        addFile(fileName);
    }
    
    /**
     * 
     * @param fileName full path of file name
     * @return current object
     */
    private DataSourceFile addFile(final String fileName) {
        final String fileNameLow = fileName.toLowerCase(Locale.getDefault());
        if ("afm_tbls_table_types.csv".equalsIgnoreCase(fileName)) {
            // gets the file from a different location provided by the product.
            this.fileFullPath =
                    TransferFile.getTableTypeFileFolder() + File.separator + fileNameLow;
            this.tableName = ProjectUpdateWizardConstants.AFM_TBLS;
        } else {
            this.fileFullPath = TransferFile.getTransferFolderIn() + File.separator + fileNameLow;
            this.tableName = fileNameLow.replace(".csv", "");
        }
        this.xlsBuilder = getXLSBuilder();
        try {
            final ArrayList<String> localFieldNames =
                    DataTransferUtility.getFieldNames(this.xlsBuilder,
                        XlsBuilder.FileFormatType.CSV);
            this.noOfRecords = this.xlsBuilder.getLastRowIndex() - 1;
            for (int index = 0; index < localFieldNames.size(); index++) {
                localFieldNames.set(index,
                    Utility.fieldNameFromFullName(localFieldNames.get(index)));
            }
            initializeFieldNames(localFieldNames);
        } catch (final IndexOutOfBoundsException e) {
            ProjectUpdateWizardLogger.logWarning(String.format(
                "Parsing [%s] file error: " + e.getMessage(), fileNameLow));
        }
        return this;
    }
    
    /**
     * gets all records from csv file as a list of map.
     * 
     * @return all values from file
     */
    public List<Map<String, Object>> getAllRecords() {
        
        final List<Map<String, Object>> allFieldValues = new ArrayList<Map<String, Object>>();
        if (this.xlsBuilder.getLastRowIndex() < 2) {
            throw new ExceptionBase(String.format("There is no data to be transfered in.."));
        } else {
            for (int row = 2; row <= this.xlsBuilder.getLastRowIndex(); row++) {
                try {
                    final Map<String, Object> fieldValues = buildRecords(row);
                    allFieldValues.add(fieldValues);
                } catch (final ExceptionBase e) {
                    continue;
                }
            }
        }
        return allFieldValues;
    }
    
    /**
     * 
     * @param row row
     * @return Map
     */
    private Map<String, Object> buildRecords(final int row) {
        final RecordPersistenceImplDT record =
                DataTransferUtility.createDTRecordPersistence(this.tableName,
                    (ArrayList<String>) this.fieldNames);
        final HashMap<String, Object> fieldValues = new HashMap<String, Object>();
        final HashMap<String, Object> fieldValuesPk = new HashMap<String, Object>();
        prepareFieldValues(record, row, fieldValues, fieldValuesPk);
        return record.convertFieldTypes(fieldValues);
    }
    
    /**
     * Get the xlsBuilder.
     * 
     * @return transfer file builder
     */
    private ImportExportFileBase getXLSBuilder() {
        
        InputStream inputStream = null;
        
        if (this.fileFullPath.compareToIgnoreCase("null") != 0
                && StringUtil.notNullOrEmpty(this.fileFullPath)) {
            DataTransferUtility.getFileStoredPath(this.fileFullPath, "");
            FileInputStream fileInputStream = null;
            try {
                fileInputStream = new FileInputStream(this.fileFullPath);
            } catch (final FileNotFoundException e) {
                throw new ExceptionBase(String.format("Unable to find the file [%s] on the server",
                    this.fileFullPath));
            } finally {
                inputStream = fileInputStream;
            }
        }
        
        final XlsBuilder.FileFormatType fileFormatType = XlsBuilder.FileFormatType.CSV;
        final ImportExportFileBase localXlsBuilder = new ImportExportFileBase(fileFormatType);
        localXlsBuilder.open(inputStream, fileFormatType);
        return localXlsBuilder;
    }
    
    /**
     * prepare xls values for import.
     * 
     * @param record records
     * @param row row
     * @param fieldValues field values
     * @param fieldValuesPk primary key field values
     */
    private void prepareFieldValues(final RecordPersistenceImplDT record, final int row,
            final Map<String, Object> fieldValues, final Map<String, Object> fieldValuesPk) {
        
        for (final String fieldName : this.fieldNames) {
            // bypass the transfer_status field.
            /*
             * if (fieldNames.get(col).contains(TRANS_STATUS_FLD)) { continue; }
             */
            final ArchibusFieldDefBase.Immutable fieldDef =
                    record.getQueryDef().findField(fieldName, true);
            final int col = this.fieldNames.indexOf(fieldName);
            final Object xlsVal = this.xlsBuilder.getCellDataAsString(row, col);
            if (xlsVal == null) {
                fieldValues.put(Utility.fieldNameFromFullName(this.fieldNames.get(col).toString()),
                    "");
            } else {
                // case when date value is auto-formatted by excel as calendar
                /*
                 * if (fieldDef.isDateTimeType() && xlsVal instanceof Calendar) { Calendar cal =
                 * (Calendar) xlsVal; SimpleDateFormat spDateFormat = new
                 * SimpleDateFormat("yyyy-MM-dd"); String strVal =
                 * spDateFormat.format(cal.getTime());
                 * fieldValues.put(Utility.fieldNameFromFullName(fieldNames.get(col).toString()),
                 * strVal); } else {
                 */
                fieldValues.put(Utility.fieldNameFromFullName(this.fieldNames.get(col).toString()),
                    xlsVal.toString());
                // }
            }
            if (fieldDef != null && fieldDef.isPrimaryKey() && xlsVal != null) {
                // pk value can not be null or ""
                fieldValuesPk.put(
                    Utility.fieldNameFromFullName(this.fieldNames.get(col).toString()),
                    xlsVal.toString());
            }
        }
    }
    
    /**
     * @return the noOfRecords
     */
    public int getNoOfRecords() {
        return this.noOfRecords;
    }
    
    /**
     * 
     * @param fieldNamesFromFile field names
     */
    private void initializeFieldNames(final List<String> fieldNamesFromFile) {
        for (int col = 0; col <= this.xlsBuilder.getLastColumnIndex(); col++) {
            this.fieldNames.add(fieldNamesFromFile.get(col));
        }
    }
}
