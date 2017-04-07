package com.archibus.app.bldgops.express;

import java.util.List;

import com.archibus.app.bldgops.partinv.BldgopsPartInventorySupplyRequisition;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.*;
import com.aspose.cells.*;

/**
 * Class holds methods for inserting records for Bldgops Express Application.
 *
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Bldgops Express.
 *
 * @author Zhang Yi
 *
 *
 */
public final class BldgopsExpressInsert {
    
    /**
     * Indicates the table name 'afm_wf_steps'.
     *
     */
    private static final String AFM_WF_STEPS = "afm_wf_steps";
    
    /**
     * Indicates the field name 'activity_id'.
     *
     */
    private static final String ACTIVITY_ID = "activity_id";
    
    /**
     * Indicates the field name 'step'.
     *
     */
    private static final String STEP = "step";
    
    /**
     * Indicates the field name 'status'.
     *
     */
    private static final String STATUS = "status";
    
    /**
     * Indicates the field name 'display_order'.
     *
     */
    private static final String DISPLAY_ORDER = "display_order";
    
    /**
     * Indicates the table-field name 'afm_ptasks.activity_id'.
     *
     */
    private static final String AFM_PTASKS_ACTIVITY_ID = "afm_ptasks.activity_id";
    
    /**
     * Indicates the table-field name 'afm_ptasks.process_id'.
     *
     */
    private static final String AFM_PTASKS_PROCESS_ID = "afm_ptasks.process_id";
    
    /**
     * Indicates the table-field name 'afm_ptasks.task_id'.
     *
     */
    private static final String AFM_PTASKS_TASK_ID = "afm_ptasks.task_id";
    
    /**
     * Indicates the table-field name 'afm_ptasks.task_file'.
     *
     */
    private static final String AFM_PTASKS_TASK_FILES = "afm_ptasks.task_file";
    
    /**
     * Indicates the table-field name 'afm_wf_steps.activity_id'.
     *
     */
    private static final String AFM_WF_STEPS_ACTIVITY_ID = "afm_wf_steps.activity_id";
    
    /**
     * Indicates the table-field name 'afm_wf_steps.step'.
     *
     */
    private static final String AFM_WF_STEPS_STEP = "afm_wf_steps.step";
    
    /**
     * Indicates the table-field name 'afm_wf_steps.status'.
     *
     */
    private static final String AFM_WF_STEPS_STATUS = "afm_wf_steps.status";
    
    /**
     * Indicates value 'WEB_URL' of enum-list field 'afm_ptasks.task_file'.
     *
     */
    private static final String WEB_URL = "WEB URL";
    
    /**
     * Indicates the table-field name 'afm_ptasks.task_file'.
     *
     */
    private static final String AFM_PTASKS_TASK_TYPE = "afm_ptasks.task_type";
    
    /**
     * Indicates the table-field name 'afm_ptasks.display_order'.
     *
     */
    private static final String AFM_PTASKS_DISPLAY_ORDER = "afm_ptasks.display_order";
    
    /**
     * Indicates the display order of view - 'ab-bldgops-use-wr-only.axvw'.
     *
     */
    private static final int DISPLAY_ORDER_NUM = 1800;
    
    /**
     * Indicates the activity id 'AbBldgOpsOnDemandWork'.
     *
     */
    private static final String AB_BLDGOPS_ONDEMANDWORK = "AbBldgOpsOnDemandWork";
    
    /**
     * Indicates the task id 'Building Operations Console'.
     *
     */
    private static final String BLDGOPS_CONSOLE = "Building Operations Console";
    
    /**
     * Indicates the task id 'Group Work Requests into Work Orders'.
     *
     */
    private static final String GP_WORK_ORDER = "Group Work Requests into Work Orders";
    
    /**
     * Indicates the activity id 'AbSystemAdministration'.
     *
     */
    private static final String SYS_ADMIN = "AbSystemAdministration";
    
    /**
     * The locale code array.
     *
     */
    private static final String[] LOCALE_CODE = new String[] { "zh_CN", "nl_NL", "fr_FR", "de_DE",
            "es_ES", "it_IT" };
    
    /**
     * The task title fields for different locale languages.
     *
     */
    private static final String[] TASK_TITLE_FIELDS = new String[] { "afm_ptasks.task_ch",
            "afm_ptasks.task_nl", "afm_ptasks.task_fr", "afm_ptasks.task_de", "afm_ptasks.task_es",
            "afm_ptasks.task_it" };
    
    /**
     * Indicates the integer value 3.
     *
     */
    private static final int THREE = 3;
    
    /**
     * Indicates the integer value 4.
     *
     */
    private static final int FOUR = 4;
    
    /**
     * Indicates the integer value 5.
     *
     */
    private static final int FIVE = 5;
    
    /**
     * Indicates the integer value 6.
     *
     */
    private static final int SIX = 6;
    
    /**
     * Indicates the integer value 7.
     *
     */
    private static final int SEVEN = 7;
    
    /**
     * Indicates the integer value 8.
     *
     */
    private static final int EIGHT = 8;
    
    /**
     * Indicates the integer value 9.
     *
     */
    private static final int NINE = 9;
    
    /**
     * Indicates the integer value 10.
     *
     */
    private static final int TEN = 10;
    
    /**
     * Indicates the integer value 10.
     *
     */
    private static final int ELEVEN = 11;

    /**
     * Indicates the integer value 10.
     *
     */
    private static final int TWELVE = 12;

    /**
     * Indicates the integer value 10.
     *
     */
    private static final int THIRTEEN = 13;

    /**
     * Indicates the integer value 10.
     *
     */
    private static final int FOURTEEN = 14;

    /**
     * Indicates the integer value 10.
     *
     */
    private static final int FIFTEEN = 15;

    /**
     * Indicates the integer value 10.
     *
     */
    private static final int SIXTEEN = 16;

    /**
     * Indicates the process id 'ARCHIBUS Administrator - Apps'.
     *
     */
    private static final String ADMIN_APPS = "ARCHIBUS Administrator - Apps";
    
    /**
     * DataSource of ptask.
     *
     */
    private static final DataSource PTASK_DS = DataSourceFactory.createDataSourceForFields(
        "afm_ptasks", new String[] { "task_id", "task_file", ACTIVITY_ID, "process_id",
                DISPLAY_ORDER, "task_type", "task_ch", "task_nl", "task_fr", "task_de", "task_es",
                "task_it" });
    
    /**
     * DataSource of afm_wf_steps.
     *
     */
    private static final DataSource STEP_DS = DataSourceFactory.createDataSourceForFields(
        AFM_WF_STEPS, new String[] { ACTIVITY_ID, STATUS, STEP, "subject_message_id", "step_type",
                "step_status_result", "step_status_rejected", "status_after", "form_fields",
                DISPLAY_ORDER, "body_message_id", "step_ch", "step_nl", "step_fr", "step_de",
                "step_it", "step_es" });
    
    /**
     * Array of processes.
     *
     */
    private static final String[] PROCESSES = new String[] { "Call Center", "Craftsperson_WEB",
            "Craftsperson_WR", "Requestor_WEB", "Supervisor_WEB", "Supervisor_WR" };
    
    /**
     * Array of display order according to above processes.
     *
     */
    private static final int[] ORDERS = new int[] { 50, 300, 300, 300, 50, 50 };
    
    /**
     * table name - pt.
     *
     */
    private static final String PT_TABLE = "pt";
    
    /**
     * table name - pt_store_loc_pt.
     *
     */
    private static final String PT_STORE_LOC_PT_TABLE = "pt_store_loc_pt";
    
    /**
     * field names - pt table.
     *
     */
    private static final String[] PT_FIELDS = new String[] { "part_id", "cost_total",
            "cost_unit_avg", "cost_unit_last", "cost_unit_std", "date_of_last_cnt",
            "date_of_last_use", "qty_calc_wk_use", "qty_calc_yr_use", "qty_min_hand",
            "qty_on_reserve", "qty_on_hand", "qty_physical_count", "qty_to_date_yr_use",
            "qty_to_order" };
    
    
    /**
     * field name - pt_store_loc_pt.pt_store_loc_id.
     *
     */
    private static final String PT_STORE_LOC_ID = "pt_store_loc_pt.pt_store_loc_id";
    
    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     *
     */
    private BldgopsExpressInsert() {
        
    }
    
    /**
     * Insert records into afm_ptasks for 'Building Operations Console', task_id
     * 'ab-bldgops-console.axvw', activity_id 'AbBldgOpsOnDemandWork, and the following processes
     * and display orders.
     *
     */
    public static void insertPtasksForBldgopsConsole() {
        
        for (int i = 0; i < PROCESSES.length; i++) {
            
            if (!existPtask(AB_BLDGOPS_ONDEMANDWORK, PROCESSES[i], BLDGOPS_CONSOLE)) {
                
                insertNewPtask(AB_BLDGOPS_ONDEMANDWORK, PROCESSES[i], BLDGOPS_CONSOLE,
                    "/ab-products/bldgops/common/console/ab-bldgops-console.axvw", ORDERS[i]);
            }
            
        }
        
        if (!existPtask(SYS_ADMIN, ADMIN_APPS, GP_WORK_ORDER)) {
            
            insertNewPtask(SYS_ADMIN, ADMIN_APPS, GP_WORK_ORDER,
                "/ab-products/bldgops/express/ab-bldgops-use-wr-only.axvw", DISPLAY_ORDER_NUM);
        }
        
    }
    
    /**
     * Insert a new afm_ptasks record.
     *
     * @param activityId String activity id.
     * @param processId String process id.
     * @param taskId String task id.
     * @param taskFile String task file name.
     * @param order int display order.
     */
    private static void insertNewPtask(final String activityId, final String processId,
            final String taskId, final String taskFile, final int order) {
        
        final DataRecord newTask = PTASK_DS.createNewRecord();
        
        newTask.setValue(AFM_PTASKS_ACTIVITY_ID, activityId);
        newTask.setValue(AFM_PTASKS_PROCESS_ID, processId);
        newTask.setValue(AFM_PTASKS_TASK_ID, taskId);
        newTask.setValue(AFM_PTASKS_TASK_FILES, taskFile);
        newTask.setValue(AFM_PTASKS_TASK_TYPE, WEB_URL);
        newTask.setValue(AFM_PTASKS_DISPLAY_ORDER, order);
        
        for (int i = 0; i < LOCALE_CODE.length; i++) {
            
            final String localeString =
                    EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(),
                        LOCALE_CODE[i], taskId, "title", taskFile);
            
            newTask.setValue(TASK_TITLE_FIELDS[i], localeString);
            
        }
        
        PTASK_DS.saveRecord(newTask);
    }
    
    /**
     * @return if exist the ptask record by fiven activity id, process id and task id.
     *
     * @param activityId String activity id.
     * @param processId String process id.
     * @param taskId String task id.
     *
     */
    private static boolean existPtask(final String activityId, final String processId,
            final String taskId) {
        
        boolean found = false;
        
        if (PTASK_DS.getRecord("activity_id='" + activityId + "' and process_id='" + processId
                + "' and task_id='" + taskId + "' ") != null) {
            
            found = true;
        }
        
        return found;
    }
    
    /**
     *
     * Insert afm_wf_steps records from spreadsheet file.
     *
     * @param workRequestsOnly int '1' or '0' to indicate if user choose 'work request only' on
     *            client side.
     */
    public static void insertWorkflowStepsFromXls(final int workRequestsOnly) {
        
        final String fullFileName =
                ContextStore.get().getWebAppPath() + "/schema/ab-products/bldgops/express/"
                        + "afm_wf_steps_UPGRADE.xlsx";
        
        final Cells cells = readCellsFromXlsFile(fullFileName);
        
        for (final Object rowObj : cells.getRows()) {
            
            final Row row = (Row) rowObj;
            
            final DataRecord stepRecord = readStepRow(row);
            
            if (stepRecord != null) {
                
                insertOrUpdateStepRecord(stepRecord);
                
                final String status = stepRecord.getString(AFM_WF_STEPS_STATUS);
                if (workRequestsOnly == 1 && "A".equalsIgnoreCase(status)) {
                    stepRecord.setValue(AFM_WF_STEPS_STATUS, "AA");
                    insertOrUpdateStepRecord(stepRecord);
                }
                
            }
        }
    }
    
    /**
     * @return cells of xls file.
     *
     * @param fullFileName String full name of xls file
     */
    private static Cells readCellsFromXlsFile(final String fullFileName) {
        
        Workbook workBook;
        Cells cells = null;
        try {
            workBook = new Workbook(fullFileName);
            final Worksheet sheet = workBook.getWorksheets().get(0);
            cells = sheet.getCells();
            // CHECKSTYLE:OFF Suppress IllegalCatch warning. Justification: third-party API
            // method throws a checked Exception, which needs to be wrapped in ExceptionBase
        } catch (final Exception originalException) {
            // CHECKSTYLE:ON
            final ExceptionBase exception =
                    ExceptionBaseFactory.newNonTranslatableException("Read Xls File Error", null);
            exception.setNested(originalException);
            
            throw exception;
        }
        
        return cells;
    }
    
    /**
     *
     * Read and Parse afm_wf_steps row, and return a DataRecord.
     *
     * @param row Row of category in spreadsheet
     *
     * @return DataRecord
     *
     */
    private static DataRecord readStepRow(final Row row) {
        
        DataRecord step = null;
        
        if (row != null && row.get(0) != null
                && StringUtil.notNullOrEmpty(row.get(0).getStringValue())
                && !"#afm_wf_steps.activity_id".equalsIgnoreCase(row.get(0).getStringValue())) {
            
            step = STEP_DS.createNewRecord();
            
            step.setValue(AFM_WF_STEPS_ACTIVITY_ID, row.get(0).getStringValue());
            step.setValue(AFM_WF_STEPS_STATUS, row.get(1).getStringValue());
            step.setValue(AFM_WF_STEPS_STEP, row.get(2).getStringValue());
            step.setValue("afm_wf_steps.subject_message_id", row.get(THREE).getStringValue());
            step.setValue("afm_wf_steps.step_type", row.get(FOUR).getStringValue());
            step.setValue("afm_wf_steps.step_status_result", row.get(FIVE).getStringValue());
            step.setValue("afm_wf_steps.step_status_rejected", row.get(SIX).getStringValue());
            step.setValue("afm_wf_steps.status_after", row.get(SEVEN).getStringValue());
            step.setValue("afm_wf_steps.form_fields", row.get(EIGHT).getStringValue());
            step.setValue("afm_wf_steps.display_order", row.get(NINE).getIntValue());
            step.setValue("afm_wf_steps.body_message_id", row.get(TEN).getStringValue());
            step.setValue("afm_wf_steps.step_ch", row.get(ELEVEN).getStringValue());
            step.setValue("afm_wf_steps.step_nl", row.get(TWELVE).getStringValue());
            step.setValue("afm_wf_steps.step_fr", row.get(THIRTEEN).getStringValue());
            step.setValue("afm_wf_steps.step_de", row.get(FOURTEEN).getStringValue());
            step.setValue("afm_wf_steps.step_it", row.get(FIFTEEN).getStringValue());
            step.setValue("afm_wf_steps.step_es", row.get(SIXTEEN).getStringValue());
            
        }
        
        return step;
    }
    
    /**
     *
     * Insert the step record if it's not existed in table 'afm_wf_steps'; or update the existed
     * one.
     *
     * @param stepRecord DataRecord afm_wf_steps record
     *
     *
     */
    private static void insertOrUpdateStepRecord(final DataRecord stepRecord) {
        
        final ParsedRestrictionDef resDef = new ParsedRestrictionDef();
        
        resDef.addClause(AFM_WF_STEPS, ACTIVITY_ID, stepRecord.getValue(AFM_WF_STEPS_ACTIVITY_ID),
            Operation.EQUALS);
        
        resDef.addClause(AFM_WF_STEPS, STATUS, stepRecord.getValue(AFM_WF_STEPS_STATUS),
            Operation.EQUALS);
        
        resDef.addClause(AFM_WF_STEPS, STEP, stepRecord.getValue(AFM_WF_STEPS_STEP),
            Operation.EQUALS);
        
        final List<DataRecord> steps = STEP_DS.getRecords(resDef);
        
        if (steps.isEmpty()) {
            
            STEP_DS.saveRecord(stepRecord);
            
        } else {
            
            STEP_DS.updateRecord(stepRecord);
        }
        
    }
    
    /**
     *
     * associate part to main storage location.
     *
     */
    public static void associatePartToMainLocation() {
        
        final DataSource ptDS = DataSourceFactory.createDataSourceForFields(PT_TABLE, PT_FIELDS);
        final DataSource ptStoreLocPtDS =
                DataSourceFactory.createDataSourceForFields(PT_STORE_LOC_PT_TABLE, PT_FIELDS);
        ptStoreLocPtDS.addField("pt_store_loc_id");
        final String mainLocation = BldgopsPartInventorySupplyRequisition.getMainStorageLocation();
        final List<DataRecord> ptRecords = ptDS.getAllRecords();
        for (final DataRecord ptRecord : ptRecords) {
            final DataRecord ptLocPtRecord = ptStoreLocPtDS.createNewRecord();
            ptLocPtRecord.setValue(PT_STORE_LOC_ID, mainLocation);
            for (final String fieldName : PT_FIELDS) {
                ptLocPtRecord.setValue("pt_store_loc_pt." + fieldName,
                    ptRecord.getValue("pt." + fieldName));
            }
            
            ptStoreLocPtDS.saveRecord(ptLocPtRecord);
        }
    }
}
