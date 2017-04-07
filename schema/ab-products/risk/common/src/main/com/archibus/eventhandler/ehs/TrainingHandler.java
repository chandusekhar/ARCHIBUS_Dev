package com.archibus.eventhandler.ehs;

import java.util.*;

import com.archibus.app.common.recurring.RecurringScheduleService;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * Training handler.
 * 
 * 
 * 
 * @author Ioan Draghici
 * 
 */
public class TrainingHandler {
    
    /**
     * Activity parameter id: "NotifyTraining".
     */
    private static final String ACTIVITY_PARAMETER_NOTIFY_TRAINING = "AbRiskEHS-NotifyTraining";
    
    /**
     * Field name: "date_actual".
     */
    private static final String DATE_ACTUAL = "date_actual";
    
    /**
     * Field name: "date_recurrence_end".
     */
    private static final String DATE_RECURRENCE_END = "date_recurrence_end";
    
    /**
     * Constant : DOT.
     */
    private static final String DOT = ".";
    
    /**
     * Table name: "ehs_training".
     */
    private static final String EHS_TRAINING = "ehs_training";
    
    /**
     * Table name: "ehs_training_results".
     */
    private static final String EHS_TRAINING_RESULTS = "ehs_training_results";
    
    /**
     * Field name: "em_id".
     */
    private static final String EM_ID = "em_id";
    
    /**
     * Field name "incident_id".
     */
    private static final String INCIDENT_ID = "incident_id";
    
    /**
     * Field name: "needs_refresh".
     */
    private static final String NEEDS_REFRESH = "needs_refresh";
    
    /**
     * Field name: "needs_refresh".
     */
    private static final String RECURRING_RULE = "recurring_rule";
    
    /**
     * Field name: "status".
     */
    private static final String STATUS = "status";
    
    /**
     * Status: Pending.
     */
    private static final String STATUS_PENDING = "Pending";
    
    /**
     * Field name: "training_id".
     */
    private static final String TRAINING_ID = "training_id";
    
    /**
     * New records no.
     */
    private int recordNo;
    
    /**
     * Field names array for training table.
     */
    private final String[] resultsFields = { TRAINING_ID, EM_ID, DATE_ACTUAL, STATUS, INCIDENT_ID };
    
    /**
     * Field names array for training table.
     */
    private final String[] trainingFields = { TRAINING_ID, NEEDS_REFRESH, RECURRING_RULE,
            DATE_RECURRENCE_END };
    
    /**
     * Assign training to employee.
     * 
     * @param trainingId training id
     * @param employeeId employee id
     * @param initialDate initial date
     * @param incidentId incident id
     */
    public void assignTrainingToEmployee(final String trainingId, final String employeeId,
            final Date initialDate, final String incidentId) {
        // Get training record.
        final DataRecord recordTraining = getTraining(trainingId);
        final List<Date> trainingDates = getTrainingDates(recordTraining, initialDate);
        for (final Date trainingDate : trainingDates) {
            createResult(trainingId, employeeId, trainingDate, incidentId);
        }
        this.recordNo = trainingDates.size();
        if (!trainingDates.isEmpty()) {
            // notify employee
            notifyEmployee("New", trainingId, employeeId, trainingDates.get(0), null, trainingDates);
        }
    }
    
    /**
     * Cancel training of employee.
     * 
     * @param trainingId training id
     * @param employeeId employee id
     */
    public void cancelTrainingOfEmployee(final String trainingId, final String employeeId) {
        
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(EHS_TRAINING_RESULTS,
                    this.resultsFields);
        
        final ParsedRestrictionDef resDef = new ParsedRestrictionDef();
        
        resDef.addClause(EHS_TRAINING_RESULTS, TRAINING_ID, trainingId, Operation.EQUALS);
        resDef.addClause(EHS_TRAINING_RESULTS, EM_ID, employeeId, Operation.EQUALS);
        resDef.addClause(EHS_TRAINING_RESULTS, DATE_ACTUAL, new Date(), Operation.GT);
        
        final List<DataRecord> records = dataSource.getRecords(resDef);
        for (final DataRecord record : records) {
            notifyEmployee("Delete", trainingId, employeeId,
                record.getDate(EHS_TRAINING_RESULTS + DOT + DATE_ACTUAL), null, null);
            dataSource.deleteRecord(record);
        }
    }
    
    /**
     * @return the recordNo
     */
    public int getRecordNo() {
        return this.recordNo;
    }
    
    /**
     * Reschedule training program.
     * 
     * @param trainingId training program code
     * @param employeeId employee id
     * @param actualDate actual training date
     * @param newDate new training date
     */
    public void rescheduleTraining(final String trainingId, final String employeeId,
            final Date actualDate, final Date newDate) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(EHS_TRAINING_RESULTS,
                    this.resultsFields);
        dataSource.addRestriction(Restrictions.eq(EHS_TRAINING_RESULTS, TRAINING_ID, trainingId));
        dataSource.addRestriction(Restrictions.eq(EHS_TRAINING_RESULTS, EM_ID, employeeId));
        dataSource.addRestriction(Restrictions.eq(EHS_TRAINING_RESULTS, DATE_ACTUAL, actualDate));
        final DataRecord record = dataSource.getRecord();
        // set new scheduled date
        record.setValue(EHS_TRAINING_RESULTS + DOT + DATE_ACTUAL, newDate);
        dataSource.saveRecord(record);
        
        notifyEmployee("Update", trainingId, employeeId, newDate, actualDate, null);
    }
    
    /**
     * Create training result record.
     * <p>
     * Suppress PMD warning in this method.
     * <p>
     * Justification: the incident id is not mandatory, so we just don't set it to the record if
     * missing.
     * 
     * @param trainingId training code
     * @param employeeId employee code
     * @param actualDate actual date
     * @param incidentId incident id
     */
    @SuppressWarnings({ "PMD.EmptyCatchBlock" })
    // TODO: (VT): I disagree with the suppression. If incidentId is expected to be an Integer, the
    // incidentId parameter should have type Integer, then the parsing is unnecessary.
    private void createResult(final String trainingId, final String employeeId,
            final Date actualDate, final String incidentId) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(EHS_TRAINING_RESULTS,
                    this.resultsFields);
        final DataRecord record = dataSource.createNewRecord();
        // set values
        record.setValue(EHS_TRAINING_RESULTS + DOT + TRAINING_ID, trainingId);
        record.setValue(EHS_TRAINING_RESULTS + DOT + EM_ID, employeeId);
        record.setValue(EHS_TRAINING_RESULTS + DOT + DATE_ACTUAL, actualDate);
        record.setValue(EHS_TRAINING_RESULTS + DOT + STATUS, STATUS_PENDING);
        
        try {
            final Integer incidentIdInt = Integer.valueOf(incidentId);
            record.setValue(EHS_TRAINING_RESULTS + DOT + INCIDENT_ID, incidentIdInt);
            // CHECKSTYLE:OFF Justification Suppress empty block warning
        } catch (final NumberFormatException e) {
            // the incident id is not mandatory, so we just don't set it to the record if missing
            // CHECKSTYLE:ON
        }
        
        // save record
        dataSource.saveRecord(record);
    }
    
    /**
     * Read training record from database.
     * 
     * @param trainingId training code
     * @return data record
     */
    private DataRecord getTraining(final String trainingId) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(EHS_TRAINING, this.trainingFields);
        dataSource.addRestriction(Restrictions.eq(EHS_TRAINING, TRAINING_ID, trainingId));
        return dataSource.getRecord();
    }
    
    /**
     * Get training dates.
     * 
     * @param training training record
     * @param initialDate initial date
     * @return list of training dates.
     */
    private List<Date> getTrainingDates(final DataRecord training, final Date initialDate) {
        List<Date> dates = new ArrayList<Date>();
        final boolean isRefreshRequired = training.getInt(EHS_TRAINING + DOT + NEEDS_REFRESH) == 1;
        if (isRefreshRequired) {
            // we must call common wfr here to get training dates
            final String recurringRule = training.getString(EHS_TRAINING + DOT + RECURRING_RULE);
            final Date endDate = training.getDate(EHS_TRAINING + DOT + DATE_RECURRENCE_END);
            final RecurringScheduleService recurringScheduleService =
                    new RecurringScheduleService();
            dates = recurringScheduleService.getDatesList(initialDate, endDate, recurringRule);
        } else {
            dates.add(initialDate);
        }
        return dates;
    }
    
    /**
     * Notify employee about scheduled trainings.
     * 
     * @param type notification type
     * @param trainingId training id
     * @param employeeId employee id
     * @param newDate new date value
     * @param oldDate old date value
     * @param trainingDates list with new training dates
     */
    private void notifyEmployee(final String type, final String trainingId,
            final String employeeId, final Date newDate, final Date oldDate,
            final List<Date> trainingDates) {
        // get activity parameter value
        final String paramValue =
                ContextStore.get().getProject().getActivityParameterManager()
                    .getParameterValue(ACTIVITY_PARAMETER_NOTIFY_TRAINING);
        if (Integer.valueOf(paramValue) == 1) {
            // send notifications
            final Map<String, String> primaryKey = new HashMap<String, String>();
            primaryKey.put(TRAINING_ID, trainingId);
            primaryKey.put(EM_ID, employeeId);
            primaryKey.put(DATE_ACTUAL, SqlUtils.normalizeValueForSql(newDate).toString());
            
            final Map<String, Object> newValues = new HashMap<String, Object>();
            newValues.put(TRAINING_ID, trainingId);
            newValues.put(EM_ID, employeeId);
            newValues.put(DATE_ACTUAL, SqlUtils.normalizeValueForSql(newDate).toString());
            
            final Map<String, Object> oldValues = new HashMap<String, Object>();
            if (oldDate != null) {
                oldValues.put(TRAINING_ID, trainingId);
                oldValues.put(EM_ID, employeeId);
                oldValues.put(DATE_ACTUAL, SqlUtils.normalizeValueForSql(oldDate).toString());
            }
            
            final EhsNotificationService notificationService =
                    new EhsNotificationService(type, "Training");
            notificationService.setPrimaryKey(primaryKey);
            notificationService.setNewValues(newValues);
            notificationService.setOldValues(oldValues);
            notificationService.setDates(trainingDates);
            EnvironmentalHealthSafetyService.startJob(ContextStore.get().getEventHandlerContext(),
                notificationService);
        }
    }
    
}
