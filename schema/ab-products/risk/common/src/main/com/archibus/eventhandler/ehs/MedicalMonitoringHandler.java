package com.archibus.eventhandler.ehs;

import java.util.*;

import com.archibus.app.common.recurring.RecurringScheduleService;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Medical Monitoring handler.
 * 
 * @author Ioan Draghici
 * 
 */
public class MedicalMonitoringHandler {
    
    /**
     * Activity parameter id: "NotifyMedicalMonitoring".
     */
    private static final String ACTIVITY_PARAMETER_NOTIFY_MONITORING =
            "AbRiskEHS-NotifyMedicalMonitoring";
    
    /**
     * Field name.
     */
    private static final String DATE_ACTUAL = "date_actual";
    
    /**
     * Field name.
     */
    private static final String DATE_RECURRENCE_END = "date_recurrence_end";
    
    /**
     * Field name.
     */
    private static final String DESCRIPTION = "description";
    
    /**
     * Constant : DOT.
     */
    private static final String DOT = ".";
    
    /**
     * Table name.
     */
    private static final String EHS_MEDICAL_MON_RESULTS = "ehs_medical_mon_results";
    
    /**
     * Table name.
     */
    private static final String EHS_MEDICAL_MONITORING = "ehs_medical_monitoring";
    
    /**
     * Field name.
     */
    private static final String EM_ID = "em_id";
    
    /**
     * Field name "incident_id".
     */
    private static final String INCIDENT_ID = "incident_id";
    
    /**
     * Field name.
     */
    private static final String IS_RECURRING = "is_recurring";
    
    /**
     * Field name.
     */
    private static final String MEDICAL_MONITORING_ID = "medical_monitoring_id";
    
    /**
     * Field name.
     */
    private static final String MONITORING_TYPE = "monitoring_type";
    
    /**
     * Field name.
     */
    private static final String RECURRING_RULE = "recurring_rule";
    
    /**
     * Field name.
     */
    private static final String STATUS = "status";
    
    /**
     * Field value.
     */
    private static final String STATUS_PENDING = "Pending";
    
    /**
     * Field Names.
     */
    private final String[] medicalMonitoringFields = { MEDICAL_MONITORING_ID, MONITORING_TYPE,
            IS_RECURRING, DATE_RECURRENCE_END, RECURRING_RULE, "reg_program", "reg_requirement",
            "regulation", DESCRIPTION };
    
    /**
     * Field Names.
     */
    private final String[] medicalMonitoringResultsFields = { MEDICAL_MONITORING_ID,
            MONITORING_TYPE, DATE_ACTUAL, EM_ID, STATUS, INCIDENT_ID };
    
    /**
     * New records no.
     */
    private int recordNo;
    
    /**
     * Assign medical monitoring to employee.
     * 
     * @param monitoringId monitoring id
     * @param employeeId employee id
     * @param initialDate initial date
     * @param incidentId incident id
     */
    public void assignMonitoringToEmployee(final int monitoringId, final String employeeId,
            final Date initialDate, final String incidentId) {
        
        final DataRecord medicalMonitoring = getMedicalMonitoring(monitoringId);
        final List<Date> recurringDates = getMonitoringDates(medicalMonitoring, initialDate);
        for (final Date actualDate : recurringDates) {
            createMonitoringResult(medicalMonitoring, employeeId, actualDate, incidentId);
        }
        
        this.recordNo = recurringDates.size();
        
        if (!recurringDates.isEmpty()) {
            final Map<String, String> pkObject = new HashMap<String, String>();
            pkObject.put(MEDICAL_MONITORING_ID, String.valueOf(monitoringId));
            pkObject.put(EM_ID, employeeId);
            pkObject.put(DATE_ACTUAL, SqlUtils.normalizeValueForSql(recurringDates.get(0))
                .toString());
            
            final Map<String, Object> newValues = new HashMap<String, Object>();
            newValues.put(MEDICAL_MONITORING_ID, String.valueOf(monitoringId));
            newValues.put(EM_ID, employeeId);
            newValues.put(DATE_ACTUAL, SqlUtils.normalizeValueForSql(recurringDates.get(0))
                .toString());
            newValues.put(MONITORING_TYPE,
                medicalMonitoring.getValue(EHS_MEDICAL_MONITORING + DOT + MONITORING_TYPE));
            newValues.put(DESCRIPTION,
                medicalMonitoring.getValue(EHS_MEDICAL_MONITORING + DOT + DESCRIPTION));
            
            // notify employee
            notifyEmployee("New", pkObject, newValues, null, recurringDates);
        }
        
    }
    
    /**
     * @return the recordNo
     */
    public int getRecordNo() {
        return this.recordNo;
    }
    
    /**
     * Create medical monitoring result.
     * <p>
     * Suppress PMD warning in this method.
     * <p>
     * Justification: the incident id is not mandatory, so we just don't set it to the record if
     * missing.
     * 
     * @param monitoring medical monitoring record
     * @param employeeId employee code
     * @param actualDate monitoring date
     * @param incidentId incident id
     */
    @SuppressWarnings({ "PMD.EmptyCatchBlock" })
    // TODO: (VT): I disagree with the suppression. If incidentId is expected to be an Integer, the
    // incidentId parameter should have type Integer, then the parsing is unnecessary.
    private void createMonitoringResult(final DataRecord monitoring, final String employeeId,
            final Date actualDate, final String incidentId) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(EHS_MEDICAL_MON_RESULTS,
                    this.medicalMonitoringResultsFields);
        final DataRecord record = dataSource.createNewRecord();
        // set field values
        record.setValue(EHS_MEDICAL_MON_RESULTS + DOT + MEDICAL_MONITORING_ID,
            monitoring.getInt(EHS_MEDICAL_MONITORING + DOT + MEDICAL_MONITORING_ID));
        record.setValue(EHS_MEDICAL_MON_RESULTS + DOT + EM_ID, employeeId);
        record.setValue(EHS_MEDICAL_MON_RESULTS + DOT + DATE_ACTUAL, actualDate);
        record.setValue(EHS_MEDICAL_MON_RESULTS + DOT + STATUS, STATUS_PENDING);
        record.setValue(EHS_MEDICAL_MON_RESULTS + DOT + MONITORING_TYPE,
            monitoring.getValue(EHS_MEDICAL_MONITORING + DOT + MONITORING_TYPE));
        
        try {
            final Integer incidentIdInt = Integer.valueOf(incidentId);
            record.setValue(EHS_MEDICAL_MON_RESULTS + DOT + INCIDENT_ID, incidentIdInt);
            // CHECKSTYLE:OFF Justification Suppress empty block warning
        } catch (final NumberFormatException e) {
            // the incident id is not mandatory, so we just don't set it to the record if missing
            // CHECKSTYLE:ON
        }
        
        // save record
        dataSource.saveRecord(record);
    }
    
    /**
     * Get medical monitoring record.
     * 
     * @param monitoringId medical monitoring id.
     * @return data record
     */
    private DataRecord getMedicalMonitoring(final int monitoringId) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(EHS_MEDICAL_MONITORING,
                    this.medicalMonitoringFields);
        dataSource.addRestriction(Restrictions.eq(EHS_MEDICAL_MONITORING, MEDICAL_MONITORING_ID,
            monitoringId));
        return dataSource.getRecord();
    }
    
    /**
     * Get monitoring dates.
     * 
     * @param monitoring monitoring record
     * @param initialDate initial date
     * @return dates list
     */
    private List<Date> getMonitoringDates(final DataRecord monitoring, final Date initialDate) {
        List<Date> dates = new ArrayList<Date>();
        final boolean isRecurring =
                monitoring.getInt(EHS_MEDICAL_MONITORING + DOT + IS_RECURRING) == 1;
        if (isRecurring) {
            final Date endDate =
                    monitoring.getDate(EHS_MEDICAL_MONITORING + DOT + DATE_RECURRENCE_END);
            final String recurringRule =
                    monitoring.getString(EHS_MEDICAL_MONITORING + DOT + RECURRING_RULE);
            
            final RecurringScheduleService recurringScheduleService =
                    new RecurringScheduleService();
            dates = recurringScheduleService.getDatesList(initialDate, endDate, recurringRule);
        } else {
            dates.add(initialDate);
        }
        return dates;
    }
    
    /**
     * Notify employee about medical monitoring.
     * 
     * @param type notification type
     * @param pkObject primary key object
     * @param newValues new values object
     * @param oldValues old values object
     * @param renewalDates list with renewal dates
     */
    private void notifyEmployee(final String type, final Map<String, String> pkObject,
            final Map<String, Object> newValues, final Map<String, Object> oldValues,
            final List<Date> renewalDates) {
        // get activity parameter value
        final String paramValue =
                ContextStore.get().getProject().getActivityParameterManager()
                    .getParameterValue(ACTIVITY_PARAMETER_NOTIFY_MONITORING);
        if (Integer.valueOf(paramValue) == 1) {
            // send notifications
            
            final EhsNotificationService notificationService =
                    new EhsNotificationService(type, "MedMonitoring");
            notificationService.setPrimaryKey(pkObject);
            notificationService.setNewValues(newValues);
            notificationService.setOldValues(oldValues);
            notificationService.setDates(renewalDates);
            EnvironmentalHealthSafetyService.startJob(ContextStore.get().getEventHandlerContext(),
                notificationService);
        }
    }
    
}
