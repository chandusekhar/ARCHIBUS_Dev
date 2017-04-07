package com.archibus.eventhandler.Moves;

/**
 * Implements XLS data transfer for move management Transfer out: export data based on move type,
 * with some locked fields (read only for user) Transfer in: import only editable field
 * 
 * @author draghici
 */

import java.io.*;
import java.text.SimpleDateFormat;
import java.util.*;

import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.db.*;
import com.archibus.ext.datatransfer.*;
import com.archibus.ext.importexport.filebuilder.ImportExportFileBase;
import com.archibus.ext.importexport.log.*;
import com.archibus.ext.importexport.log.ComparisonLogs.LOG_TYPE;
import com.archibus.ext.report.xls.*;
import com.archibus.ext.report.xls.XlsBuilder.FileFormatType;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.schema.*;
import com.archibus.utility.*;

public class MoveDataTransfer extends DataTransferJob {
    
    private static String TABLE_NAME = "mo";
    
    protected Context context = null;
    
    protected ComparisonLogs dtLog = null;
    
    // the transfer status field
    static public final String TRANSFER_STATUS_FIELD = "transfer_status";
    
    // move type : Employee
    private static String[] FIELDS_EM = { "mo_id", "em_id", "from_bl_id", "from_fl_id",
            "from_rm_id", "to_bl_id", "to_fl_id", "to_rm_id", "from_phone", "to_phone",
            "to_comp_type", "to_phone_type", "to_mailstop", "to_jk_id_data", "to_jk_id_voice",
            "num_boxes", "date_start_req", "date_to_perform", "description", "comments" };
    
    // move type : New Hire
    private static String[] FIELDS_HIRE = { "mo_id", "em_id", "to_bl_id", "to_fl_id", "to_rm_id",
            "to_phone", "to_comp_type", "to_phone_type", "to_mailstop", "to_jk_id_data",
            "to_jk_id_voice", "date_start_req", "date_to_perform", "description", "comments" };
    
    // move type : Employee Leaving
    private static String[] FIELDS_LEAVING = { "mo_id", "em_id", "from_bl_id", "from_fl_id",
            "from_rm_id", "from_phone", "date_start_req", "date_to_perform", "description",
            "comments" };
    
    // move type : Equipment
    private static String[] FIELDS_EQUIPMENT = { "mo_id", "em_id", "from_bl_id", "from_fl_id",
            "from_rm_id", "to_bl_id", "to_fl_id", "to_rm_id", "to_jk_id_data", "to_jk_id_voice",
            "num_boxes", "date_start_req", "date_to_perform", "description", "comments" };
    
    // move type : Asset
    private static String[] FIELDS_ASSET = { "mo_id", "em_id", "from_bl_id", "from_fl_id",
            "from_rm_id", "to_bl_id", "to_fl_id", "to_rm_id", "to_jk_id_data", "to_jk_id_voice",
            "num_boxes", "date_start_req", "date_to_perform", "description", "comments" };
    
    // move type : Room
    private static String[] FIELDS_ROOM = { "mo_id", "em_id", "from_bl_id", "from_fl_id",
            "from_rm_id", "to_bl_id", "to_fl_id", "to_rm_id", "from_phone", "to_phone",
            "to_comp_type", "to_phone_type", "to_jk_id_data", "to_jk_id_voice", "num_boxes",
            "date_start_req", "date_to_perform", "description", "comments" };
    
    // list of read only/ protected fields
    private static String[] FIELDS_READ_ONLY = { "mo_id", "em_id", "from_bl_id", "from_fl_id",
            "from_rm_id", "from_phone", "date_start_req" };
    
    /**
     * Read only fields for each move type.
     */
    private static Map<MoveType, String> protectedFields = new HashMap<MoveType, String>();
    static {
        protectedFields
            .put(MoveType.EMPLOYEE,
                "mo.mo_id;mo.em_id;mo.from_bl_id;mo.from_fl_id;mo.from_rm_id;mo.from_phone;mo.date_start_req");
        protectedFields.put(MoveType.NEW_HIRE, "mo.mo_id;mo.em_id;mo.date_start_req");
        protectedFields
            .put(MoveType.LEAVING,
                "mo.mo_id;mo.em_id;mo.from_bl_id;mo.from_fl_id;mo.from_rm_id;mo.from_phone;mo.date_start_req");
        protectedFields.put(MoveType.EQUIPMENT,
            "mo.mo_id;mo.em_id;mo.from_bl_id;mo.from_fl_id;mo.from_rm_id;mo.date_start_req");
        protectedFields.put(MoveType.ASSET,
            "mo.mo_id;mo.em_id;mo.from_bl_id;mo.from_fl_id;mo.from_rm_id;mo.date_start_req");
        protectedFields
            .put(MoveType.ROOM,
                "mo.mo_id;mo.em_id;mo.from_bl_id;mo.from_fl_id;mo.from_rm_id;mo.from_phone;mo.date_start_req");
    }
    
    private DataTransferJob dtJobOut = null;
    
    private String project_id = null;
    
    private MoveType moveType = null;
    
    // this parameter is used for transfer in by record action
    private TRANS_NEXT_RECORD_STATUS transferNextRecordStatus;
    
    private String transferNextRecordErrorMessage = "";
    
    static private enum TRANS_NEXT_RECORD_STATUS {
        COMMENT, STOP, CONTINUE, ERROR;
        private static final Object[][] stringsToEnums = { { "COMMENT", COMMENT },
                { "STOP", STOP }, { "CONTINUE", CONTINUE }, { "ERROR", ERROR } };
        
        @Override
        public String toString() {
            return EnumTemplate.toString(stringsToEnums, this);
        }
        
        public static TRANS_NEXT_RECORD_STATUS fromString(final String source) {
            return (TRANS_NEXT_RECORD_STATUS) EnumTemplate.fromString(source, stringsToEnums,
                TRANS_NEXT_RECORD_STATUS.class);
        }
    };
    
    /**
     * Transfer In
     * 
     * @param type - move type
     * @param projectId - group move project
     * @param serverFileName - file name
     * @param format - transfer format
     * @param inputStream - input stream, uploaded file
     */
    public void moveTransferIn(final String type, final String projectId,
            final String serverFileName, final String format, final InputStream inputStream) {
        try {
            // initialize context
            this.context = ContextStore.get();
            this.project_id = projectId;
            this.moveType = MoveType.fromString(type);
            // retrieve xlsBuilder
            final ImportExportFileBase xlsBuilder =
                    getXLSBuilder(serverFileName, format, inputStream);
            XlsBuilder.FileFormatType.fromString(format);
            
            // get field names
            final List<String> fieldNames = xlsBuilder.getFieldNames();
            
            // remove the table names from the first field name
            for (int index = 0; index < fieldNames.size(); index++) {
                fieldNames.set(index, Utility.fieldNameFromFullName(fieldNames.get(index)));
            }
            
            // initialize job status
            this.updateJobStatus();
            
            // define a data transfer log for Transfer In action
            this.dtLog = new ComparisonLogs(TABLE_NAME, FileFormatType.fromString(format), true);
            
            if (xlsBuilder.getLastRowIndex() < 2) {
                throw new ExceptionBase(String.format("There is no data to be transfered in.."));
            } else {
                // update job status - total records
                this.status.setTotalNumber(xlsBuilder.getLastRowIndex() - 1);
                
                for (int row = 2; row <= xlsBuilder.getLastRowIndex(); row++) {
                    try {
                        moveTransferInRecord(xlsBuilder, row, fieldNames);
                    } catch (final ExceptionBase e) {
                        continue;
                    }
                }
            }
            
        } catch (final Exception e) {
            // @non-translatable
            throw new ExceptionBase(String.format("Fail to perform the Transfer In action - "
                    + e.getMessage()), e);
        }
    }
    
    /**
     * Transfer in row - import one row from file
     * 
     * @param xlsBuilder - XLS object
     * @param row - index of imported row
     * @param fieldNames - list with field names
     */
    private void moveTransferInRecord(final ImportExportFileBase xlsBuilder, final int row,
            final List<String> fieldNames) {
        
        // we need project_id and mo_type also
        if (!fieldNames.contains("mo_type")) {
            fieldNames.add("mo_type");
        }
        if (!fieldNames.contains("project_id")) {
            fieldNames.add("project_id");
        }
        
        final RecordPersistenceImplDT record =
                DataTransferUtility.createDTRecordPersistence(TABLE_NAME,
                    (ArrayList<String>) fieldNames);
        
        Map fieldValuesConverted = null;
        Map fieldValuesPkConverted = null;
        
        final HashMap<String, Object> fieldValues = new HashMap<String, Object>();
        final HashMap<String, Object> fieldValuesPk = new HashMap<String, Object>();
        
        Record.Immutable rec = null;
        Record.Immutable rec_pk = null;
        
        if (xlsBuilder.getCellData(row, 0) != null
                && xlsBuilder.getCellData(row, 0).toString().startsWith("#")) {
            // for comment line we don't do anything, return and go to next record
            this.transferNextRecordStatus = TRANS_NEXT_RECORD_STATUS.COMMENT;
        }
        
        prepareFieldValues(xlsBuilder, record, row, (ArrayList<String>) fieldNames, fieldValues,
            fieldValuesPk);
        
        try {
            fieldValuesConverted = record.convertFieldTypes(fieldValues);
            rec = record.retrieve(false, fieldValuesConverted);
        } catch (final ExceptionBase e) {
            if (this.dtLog != null) {
                this.dtLog.getLog(LOG_TYPE.ERROR).write(fieldValuesPk, e);
            }
        }
        
        // only try to retrieve if pk is not auto-numbered
        if (fieldValuesPk != null && fieldValuesPk.size() > 0) {
            try {
                fieldValuesPkConverted = record.convertFieldTypes(fieldValuesPk);
                rec_pk = record.retrieve(false, fieldValuesPkConverted);
            } catch (final ExceptionBase e) {
                if (this.dtLog != null) {
                    this.dtLog.getLog(LOG_TYPE.ERROR).write(fieldValuesPk, e);
                }
            }
        }
        // if the job is stopped, then stop transfer in.
        if (this.status != null) {
            if (this.status.isStopRequested() || this.status.getCode() == JobStatus.JOB_STOPPED
                    || this.status.getCode() == JobStatus.JOB_STOP_ACKNOWLEDGED) {
                this.transferNextRecordStatus = TRANS_NEXT_RECORD_STATUS.STOP;
                this.transferNextRecordErrorMessage = this.status.getMessage();
            } else {
                this.status.incrementCurrentNumber();
            }
        }
        if (rec_pk == null) {
            // is new record , we don't insert this
            final String crtId =
                    ((fieldValuesPkConverted != null && fieldValuesPkConverted.containsKey("mo_id")) ? fieldValuesPkConverted
                        .get("mo_id").toString() : "");
            final ExceptionBase e = new ExceptionBase();
            e.setPattern(String.format("Unable to find record [%s]", crtId));
            if (this.dtLog != null) {
                this.dtLog.getLog(LOG_TYPE.ERROR).write(fieldValues, e);
            }
        } else if (rec_pk != null && rec == null) {
            // update record
            try {
                // check if record mo_type and project_id are correct
                final String project_id = rec_pk.findFieldValue("mo.project_id").toString();
                if (!project_id.equals(this.project_id)) {
                    final ExceptionBase e = new ExceptionBase();
                    e.setPattern(String.format(
                        "Current record does not belog to selected project [%s]", this.project_id));
                    if (this.dtLog != null) {
                        this.dtLog.getLog(LOG_TYPE.ERROR).write(fieldValues, e);
                    }
                }
                final MoveType mo_type =
                        MoveType.fromString(rec_pk.findFieldValue("mo.mo_type").toString());
                if (!mo_type.equals(this.moveType)) {
                    final ExceptionBase e = new ExceptionBase();
                    e.setPattern(String.format("Current record is not an [%s] move.",
                        this.moveType.toString()));
                    if (this.dtLog != null) {
                        this.dtLog.getLog(LOG_TYPE.ERROR).write(fieldValues, e);
                    }
                }
                
                try {
                    checkValidEnumValues(record, fieldValues);
                } catch (final ExceptionBase e) {
                    if (this.dtLog != null) {
                        this.dtLog.getLog(LOG_TYPE.ERROR).write(fieldValues, e);
                    }
                }
                
                for (final String key : this.FIELDS_READ_ONLY) {
                    if (fieldValuesConverted.containsKey(key)) {
                        fieldValuesConverted.put(key,
                            rec_pk.findFieldValue(this.TABLE_NAME + "." + key));
                    }
                }
                
                record.update(fieldValuesConverted);
                this.dtLog.getLog(LOG_TYPE.UPDATE).write(fieldValues);
                
            } catch (final ExceptionBase e) {
                if (this.dtLog != null) {
                    this.dtLog.getLog(LOG_TYPE.ERROR).write(fieldValues, e);
                }
            }
        }
    }
    
    /**
     * transfer out data
     * 
     * @param type
     * @param format
     * @param recordNo
     * @param pkRestriction
     */
    public void moveTransferOut(final String type, final String format, final int recordNo,
            final String pkRestriction) {
        this.moveType = MoveType.fromString(type);
        final DataSource ds = getDataSource(this.moveType);
        ds.addRestriction(Restrictions.in("mo", "mo_id", pkRestriction));
        this.dtJobOut = (DataTransferJob) ContextStore.get().getBean(DataTransferJob.DTJOB_BEAN);
        this.updateJobStatus();
        // this.dtJobOut.transferOutDataSource(ds, format, "", "", false);
        this.dtJobOut.transferOutDataSourceWithProtectFields(ds, format, "", "", false,
            this.protectedFields.get(this.moveType));
    }
    
    /**
     * prepare xls values for import
     * 
     * @param xlsBuilder
     * @param record
     * @param row
     * @param fieldNames
     * @param fieldValues
     * @param fieldValuesPk
     */
    private void prepareFieldValues(final XlsBuilder xlsBuilder,
            final RecordPersistenceImplDT record, final int row,
            final ArrayList<String> fieldNames, final HashMap<String, Object> fieldValues,
            final HashMap<String, Object> fieldValuesPk) {
        
        for (int col = 0; col <= xlsBuilder.getLastColumnIndex(); col++) {
            // bypass the transfer_status field.
            if (fieldNames.get(col).contains(this.TRANSFER_STATUS_FIELD)) {
                continue;
            }
            final ArchibusFieldDefBase.Immutable fieldDef =
                    record.getQueryDef().findField(fieldNames.get(col), true);
            final Object xlsVal = xlsBuilder.getCellData(row, col);
            if (xlsVal == null) {
                fieldValues.put(Utility.fieldNameFromFullName(fieldNames.get(col).toString()), "");
            } else {
                // case when date value is auto-formatted by excel as calendar
                if (fieldDef.isDateTimeType() && xlsVal instanceof Calendar) {
                    final Calendar cal = (Calendar) xlsVal;
                    final SimpleDateFormat spDateFormat = new SimpleDateFormat("yyyy-MM-dd");
                    final String strVal = spDateFormat.format(cal.getTime());
                    fieldValues.put(Utility.fieldNameFromFullName(fieldNames.get(col).toString()),
                        strVal);
                } else {
                    fieldValues.put(Utility.fieldNameFromFullName(fieldNames.get(col).toString()),
                        xlsVal.toString());
                }
            }
            if (fieldDef != null && fieldDef.isPrimaryKey()) {
                // pk value can not be null or ""
                if (xlsVal != null) {
                    fieldValuesPk.put(
                        Utility.fieldNameFromFullName(fieldNames.get(col).toString()),
                        xlsVal.toString());
                }
            }
        }
    }
    
    /**
     * create datasource object based on move type
     * 
     * @param type
     * @return
     */
    private DataSource getDataSource(final MoveType type) {
        DataSource ds = null;
        if (MoveType.EMPLOYEE.equals(type)) {
            ds = DataSourceFactory.createDataSourceForFields(TABLE_NAME, FIELDS_EM);
        } else if (MoveType.NEW_HIRE.equals(type)) {
            ds = DataSourceFactory.createDataSourceForFields(TABLE_NAME, FIELDS_HIRE);
        } else if (MoveType.LEAVING.equals(type)) {
            ds = DataSourceFactory.createDataSourceForFields(TABLE_NAME, FIELDS_LEAVING);
        } else if (MoveType.EQUIPMENT.equals(type)) {
            ds = DataSourceFactory.createDataSourceForFields(TABLE_NAME, FIELDS_EQUIPMENT);
        } else if (MoveType.ASSET.equals(type)) {
            ds = DataSourceFactory.createDataSourceForFields(TABLE_NAME, FIELDS_ASSET);
        } else if (MoveType.ROOM.equals(type)) {
            ds = DataSourceFactory.createDataSourceForFields(TABLE_NAME, FIELDS_ROOM);
        }
        return ds;
    }
    
    /**
     * create xls object from input stream
     * 
     * @param serverFileName
     * @param format
     * @return
     */
    private ImportExportFileBase getXLSBuilder(final String serverFileName, final String format,
            InputStream inputStream) {
        
        if (serverFileName.compareToIgnoreCase("null") != 0
                && StringUtil.notNullOrEmpty(serverFileName)) {
            DataTransferUtility.getFileStoredPath(serverFileName, "");
            FileInputStream fileInputStream = null;
            try {
                fileInputStream = new FileInputStream(serverFileName);
            } catch (final FileNotFoundException e) {
                throw new ExceptionBase(String.format(
                    "Unable to find the file [%s] on the server.", serverFileName));
            } finally {
                inputStream = fileInputStream;
            }
        }
        
        final XlsBuilder.FileFormatType fileFormatType =
                XlsBuilder.FileFormatType.fromString(format);
        final ImportExportFileBase xlsBuilder = new ImportExportFileBase(fileFormatType);
        xlsBuilder.open(inputStream, fileFormatType);
        return xlsBuilder;
    }
    
    /**
     * validate xls value for enumeration list fields
     * 
     * @param record
     * @param fieldValues
     */
    private void checkValidEnumValues(final RecordPersistenceImpl record, final Map fieldValues) {
        for (final Iterator it = fieldValues.keySet().iterator(); it.hasNext();) {
            final String fieldName = (String) it.next();
            final Object fieldValue = fieldValues.get(fieldName);
            
            final ArchibusFieldDefBase.Immutable fieldDef = record.findFieldDef(fieldName);
            if ((fieldDef instanceof FieldEnumImpl) && (fieldValue != null)) {
                
                final ArrayList enumValues =
                        ((FieldEnumImpl) fieldDef).getValues(this.context.getLocale());
                if (!((FieldEnumImpl) fieldDef).contains(fieldValue, this.context.getLocale())) {
                    
                    // set default enum values
                    final Vector enumOptions = (Vector) enumValues.iterator().next();
                    fieldValues.put(fieldName, enumOptions.elementAt(0));
                    
                    // @translatable
                    final String error =
                            "WARNING: The enumeration value [{0}] for field [{1}] does not exist in ARCHIBUS schema, thus the default enum value has been inserted or updated.";
                    final ExceptionBase exception = new ExceptionBase();
                    exception.setPattern(error);
                    exception.setTranslatable(false);
                    
                    final Object[] args = { fieldValue.toString(), fieldName };
                    exception.setArgs(args);
                    throw exception;
                }
            }
        }
    }
    
    /**
     * when reporting is started, initialize job's status
     */
    private void updateJobStatus() {
        final JobResult result = new JobResult("", "", "");
        if (this.dtJobOut != null && this.dtJobOut.getStatus() != null) {
            this.dtJobOut.getStatus().setResult(result);
        } else if (this.status != null) {
            this.status.setResult(result);
        }
    }
    
    @Override
    public JobStatus getStatus() {
        if (this.dtJobOut != null) {
            return this.dtJobOut.getStatus();
        } else {
            return this.status;
        }
    }
}
