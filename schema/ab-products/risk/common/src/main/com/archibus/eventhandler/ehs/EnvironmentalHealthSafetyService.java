package com.archibus.eventhandler.ehs;

import java.util.*;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;

/**
 * Provide methods for Environmental Health and Safety activity.
 * <p>
 * <li/><b>assignTrainingsToEmployee</b> - Assign training to employee
 * <li/><b>assignPPEsToEmployee</b> - Assign PPE to employee
 * <li/><b>assignMonitoringsToEmployee</b> - Assign medical monitoring to employee
 * </p>
 * 
 * @author Ioan Draghici
 * 
 *         <p>
 *         Suppress PMD warning in this class.
 *         <p>
 *         Justification: It's an application interface class, cannot declare these methods
 *         elsewhere.
 */
@SuppressWarnings({ "PMD.TooManyMethods" })
public class EnvironmentalHealthSafetyService extends JobBase {
    /**
     * Job status message.
     */
    // @translatable
    private static final String MESSAGE_ASSIGN_MEDICAL_MONITORING =
            "Assign Medical Monitoring to Employee";
    
    /**
     * Job status message.
     */
    // @translatable
    private static final String MESSAGE_ASSIGN_PPE = "Assign PPE to Employee";
    
    /**
     * Job status message.
     */
    // @translatable
    private static final String MESSAGE_ASSIGN_TRAININGS = "Assign Trainings to Employee";
    
    /**
     * Job status message.
     */
    // @translatable
    private static final String MESSAGE_RESCHEDULE_TRAININGS = "Reschedule Training Programs";
    
    /**
     * Record number property.
     */
    private static final String RECORD_NO = "recordNo";
    
    /**
     * "Record was successfully saved".
     */
    // @translatable
    private static final String RECORD_SUCCESSFULLY_SAVED = "Record was successfully saved";
    
    /**
     * Start paginated report job.
     * 
     * @param context execution context.
     * @param job job object
     */
    static void startJob(final EventHandlerContext context, final Job job) {
        final JobManager.ThreadSafe jobManager = EventHandlerBase.getJobManager(context);
        final String jobId = jobManager.startJob(job);
        // add the status to the response
        final JSONObject result = new JSONObject();
        result.put("jobId", jobId);
        
        // get the job status from the job id
        final JobStatus status = jobManager.getJobStatus(jobId);
        result.put("jobStatus", status.toString());
        
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * Assign selected medical monitorings to employees.
     * 
     * @param monitoringIds list with selected medical monitorings
     * @param employeeIds list of employee ids
     * @param initialDate initial date
     * @param incidentId incident id
     */
    public void assignMonitoringsToEmployees(final List<Integer> monitoringIds,
            final List<String> employeeIds, final Date initialDate, final String incidentId) {
        // initialize job status
        final int totalNo = monitoringIds.size();
        int index = 0;
        initializeJobStatus(this.status, totalNo, index, MESSAGE_ASSIGN_MEDICAL_MONITORING);
        final MedicalMonitoringHandler medicalMonitoringHandler = new MedicalMonitoringHandler();
        // loop through PPE list
        for (final int monitoringId : monitoringIds) {
            // loop through employee list
            for (final String employeeId : employeeIds) {
                if (this.status.isStopRequested()) {
                    // check if stop was requested
                    stopJob(this.status, JobStatus.JOB_STOP_REQUESTED, totalNo);
                    break;
                }
                this.status.setCurrentNumber(index);
                
                // assign medical monitoring to employee
                medicalMonitoringHandler.assignMonitoringToEmployee(monitoringId, employeeId,
                    initialDate, incidentId);
                
                this.status.addProperty(RECORD_NO,
                    String.valueOf(medicalMonitoringHandler.getRecordNo()));
                index = index + 1;
            }
        }
        // complete job
        stopJob(this.status, JobStatus.JOB_COMPLETE, totalNo);
    }
    
    /**
     * Assign selected PPEs to employee.
     * 
     * @param ppeIds list with PPE id's
     * @param employeeIds List of employee ids
     * @param deliveryDate delivery date
     * @param buildingId building id
     * @param floorId floor id
     * @param roomId room id
     * @param incidentId incident id
     */
    public void assignPPEsToEmployees(final List<String> ppeIds, final List<String> employeeIds,
            final Date deliveryDate, final String buildingId, final String floorId,
            final String roomId, final String incidentId) {
        
        // initialize job status
        final int totalNo = ppeIds.size() + employeeIds.size();
        int index = 0;
        initializeJobStatus(this.status, totalNo, index, MESSAGE_ASSIGN_PPE);
        final PPEHandler ppeHandler = new PPEHandler();
        // loop through PPE list
        for (final String ppeId : ppeIds) {
            // loop through employee list
            for (final String employeeId : employeeIds) {
                if (this.status.isStopRequested()) {
                    // check if stop was requested
                    stopJob(this.status, JobStatus.JOB_STOP_REQUESTED, totalNo);
                    break;
                }
                this.status.setCurrentNumber(index);
                
                // assign ppe to employee
                ppeHandler.assignPPEToEmployee(ppeId, employeeId, deliveryDate, buildingId,
                    floorId, roomId, incidentId);
                
                this.status.addProperty(RECORD_NO, String.valueOf(ppeHandler.getRecordNo()));
                index = index + 1;
            }
        }
        // complete job
        stopJob(this.status, JobStatus.JOB_COMPLETE, totalNo);
    }
    
    /**
     * Assign selected training to employees.
     * 
     * @param trainingIds List of training ids
     * @param employeeIds List of employee ids
     * @param initialDate initial training date
     * @param incidentId incident id
     */
    public void assignTrainingToEmployees(final List<String> trainingIds,
            final List<String> employeeIds, final Date initialDate, final String incidentId) {
        
        // initialize job status
        final int totalNo = employeeIds.size() + trainingIds.size();
        int index = 0;
        initializeJobStatus(this.status, totalNo, index, MESSAGE_ASSIGN_TRAININGS);
        // initialize employee handler
        final TrainingHandler trainingHandler = new TrainingHandler();
        // loop through training list
        for (final String trainingId : trainingIds) {
            // loop through employee list
            for (final String employeeId : employeeIds) {
                if (this.status.isStopRequested()) {
                    // check if stop was requested
                    stopJob(this.status, JobStatus.JOB_STOP_REQUESTED, totalNo);
                    break;
                }
                this.status.setCurrentNumber(index);
                
                // assign training to employee
                trainingHandler.assignTrainingToEmployee(trainingId, employeeId, initialDate,
                    incidentId);
                
                this.status.addProperty(RECORD_NO, String.valueOf(trainingHandler.getRecordNo()));
                index = index + 1;
            }
        }
        // complete job
        stopJob(this.status, JobStatus.JOB_COMPLETE, totalNo);
    }
    
    /**
     * 
     * Cancel training assignments the incident document.
     * 
     * @param trainingId Training Id
     * @param employeeIds List of employee ids
     */
    public void cancelTrainingAssinments(final String trainingId, final List<String> employeeIds) {
        final TrainingHandler trainingHandler = new TrainingHandler();
        
        // loop through employee list
        for (final String employeeId : employeeIds) {
            // cancel training of employee
            trainingHandler.cancelTrainingOfEmployee(trainingId, employeeId);
            
        }
    }
    
    /**
     * 
     * Copies the incident document.
     * 
     * @param srcIncidentId incident ID to copy the document from
     * @param destIncidentId incident ID to copy the document to
     * @param destFileName destination file name (ehs_incidents.cause_doc field)
     */
    public void copyIncidentDocument(final int srcIncidentId, final int destIncidentId,
            final String destFileName) {
        final IncidentsHandler incidentHandler = new IncidentsHandler();
        incidentHandler.copyDocument(srcIncidentId, destIncidentId, destFileName);
    }
    
    /**
     * Notify employee about event.
     * 
     * @param type notification type
     * @param category notification category
     * @param primaryKey primary key object
     * @param newValues new values object
     * @param oldValues old values object
     */
    public void notifyEmployee(final String type, final String category,
            final Map<String, String> primaryKey, final Map<String, Object> newValues,
            final Map<String, Object> oldValues) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final EhsNotificationService notificationService =
                new EhsNotificationService(type, category);
        notificationService.setPrimaryKey(primaryKey);
        notificationService.setNewValues(newValues);
        notificationService.setOldValues(oldValues);
        
        startJob(context, notificationService);
    }
    
    /**
     * Reschedule training programs.
     * 
     * @param trainings list of training programs code
     * @param newDate new schedule date
     */
    public void rescheduleTrainings(final List<Map<String, Object>> trainings, final Date newDate) {
        // initialize job status
        final int totalNo = trainings.size();
        int index = 0;
        initializeJobStatus(this.status, totalNo, index, MESSAGE_RESCHEDULE_TRAININGS);
        final TrainingHandler trainingHandler = new TrainingHandler();
        // loop through training list
        for (final Map<String, Object> training : trainings) {
            if (this.status.isStopRequested()) {
                // check if stop was requested
                stopJob(this.status, JobStatus.JOB_STOP_REQUESTED, totalNo);
                break;
            }
            this.status.setCurrentNumber(index);
            final String trainingId = (String) training.get("trainingId");
            final String employeeId = (String) training.get("employeeId");
            final Date actualDate = java.sql.Date.valueOf(training.get("dateActual").toString());
            
            // assign training to employee
            trainingHandler.rescheduleTraining(trainingId, employeeId, actualDate, newDate);
            
            index = index + 1;
        }
        // complete job
        stopJob(this.status, JobStatus.JOB_COMPLETE, totalNo);
    }
    
    /**
     * 
     * Saves Incident record.
     * 
     * @param context the Event Handler context, from which are used: viewName, dataSourceId,
     *            isNewRecord, fieldValues, oldFieldValues
     */
    public void saveIncident(final EventHandlerContext context) {
        final IncidentsHandler incidentHandler = new IncidentsHandler();
        
        final String viewName = context.getString("viewName", "");
        final String dataSourceId = context.getString("dataSourceId", "");
        final boolean isNewRecord = context.getBoolean("isNewRecord", false);
        final JSONObject fieldValues = context.getJSONObject("fieldValues", new JSONObject());
        final JSONObject oldFieldValues = context.getJSONObject("oldFieldValues", new JSONObject());
        
        final DataRecord record =
                DataRecord.createRecordFromJSON(fieldValues, oldFieldValues, isNewRecord);
        
        final DataRecord savedRecord = incidentHandler.saveIncident(record, viewName, dataSourceId);
        context.setResponse(savedRecord);
        
        // set message to the response
        final String localizedMessage =
                EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(),
                    RECORD_SUCCESSFULLY_SAVED, this.getClass().getName());
        context.addResponseParameter("message", localizedMessage);
    }
    
    /**
     * Submit redline to incident.
     * 
     * @param incidentId incident id
     * @param name document name
     * @param description document description
     * @param data image data
     * @param docAuthor document author; logged employee code
     * @param docDate document date
     */
    public void submitRedlineToIncident(final int incidentId, final String name,
            final String description, final String data, final String docAuthor, final Date docDate) {
        final IncidentsHandler incidentHandler = new IncidentsHandler();
        incidentHandler.submitRedline(incidentId, name, description, data, docAuthor, docDate);
    }
    
    /**
     * Initialize job status.
     * 
     * @param status job status
     * @param totalNo total records
     * @param currentNo current record
     * @param message status message
     */
    private void initializeJobStatus(final JobStatus status, final int totalNo,
            final int currentNo, final String message) {
        
        status.setTotalNumber(totalNo);
        status.setCurrentNumber(currentNo);
        // get localized message
        final String localizedMessage =
                EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(),
                    message, this.getClass().getName());
        status.setMessage(localizedMessage);
    }
    
    /**
     * Update job status when stop was requested.
     * 
     * @param status job status
     * @param code job status code
     * @param currentNo current number
     */
    private void stopJob(final JobStatus status, final int code, final int currentNo) {
        status.setCode(code);
        status.setCurrentNumber(currentNo);
    }
    
}
