package com.archibus.eventhandler.compliance;

import java.util.*;

import org.json.*;

import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.RequestHandler;
import com.archibus.jobmanager.*;
import com.archibus.utility.StringUtil;

/**
 * Helper Classes for Compliance Event related business logic.
 *
 *
 * @author ASC-BJ:Zhang Yi
 */
public class ComplianceServiceRequestGenerator extends JobBase {
    
    /**
     * Constant: table field name 'activity_log.site_id'.
     */
    public static final String ACTIVITY_LOG_SITE_ID = "activity_log.site_id";

    /**
     * Constant: table field name 'activity_log.bl_id'.
     */
    public static final String ACTIVITY_LOG_BL_ID = "activity_log.bl_id";

    /**
     * Constant: table field name 'activity_log.fl_id'.
     */
    public static final String ACTIVITY_LOG_FL_ID = "activity_log.fl_id";

    /**
     * Constant: table field name 'activity_log.rm_id'.
     */
    public static final String ACTIVITY_LOG_RM_ID = "activity_log.rm_id";

    /**
     * Constant: table field name 'activity_log.eq_id'.
     */
    public static final String ACTIVITY_LOG_EQ_ID = "activity_log.eq_id";

    /**
     * Constant: table field name 'activity_log.description'.
     */
    public static final String ACTIVITY_LOG_DESCRIPTION = "activity_log.description";

    /**
     * Constant: table field name 'activity_log.date_required'.
     */
    public static final String ACTIVITY_LOG_DATE_REQUIRED = "activity_log.date_required";

    /**
     * Constant: table field name 'activity_log.date_scheduled_end'.
     */
    public static final String ACTIVITY_LOG_DATE_SCHEDULED_END = "activity_log.date_scheduled_end";

    /**
     * Constant: table field name 'activity_log.date_scheduled'.
     */
    public static final String ACTIVITY_LOG_DATE_SCHEDULED = "activity_log.date_scheduled";
    
    /**
     * Constant: table field name 'activity_log.assessment_id'.
     */
    public static final String ACTIVITY_LOG_ASSESSMENT_ID = "activity_log.assessment_id";

    /**
     * Constant: table field name 'activity_log.prob_type'.
     */
    public static final String ACTIVITY_LOG_PROB_TYPE = "activity_log.prob_type";

    /**
     * Constant: table field name 'activity_log.requestor'.
     */
    public static final String ACTIVITY_LOG_REQUESTOR = "activity_log.requestor";

    /**
     * Constant: table field name 'activity_log.phone_requestor'.
     */
    public static final String ACTIVITY_LOG_PHONE_REQUESTOR = "activity_log.phone_requestor";

    /**
     * Constant: table field name 'activity_log.priority'.
     */
    public static final String ACTIVITY_LOG_PRIORITY = "activity_log.priority";
    
    /**
     * Constant: table field name 'activity_log.activity_type'.
     */
    public static final String ACTIVITY_LOG_ACTIVIT_TYPE = "activity_log.activity_type";
    
    /**
     * Constant: Enter key .
     */
    public static final String ENTER_KEY = "\n";

    /**
     * DataSource of Compliance Event( table: activity_log ).
     *
     */
    private final DataSource activityLogDs;

    /**
     * Constructor.
     *
     */
    public ComplianceServiceRequestGenerator() {
        
        super();
        
        this.activityLogDs = ComplianceUtility.getDataSourceEvent();
    }

    /**
     * This WFR takes a list of Compliance Event records and a service request record with user
     * entered value to create corresponding service request records.
     *
     * @param eventIDs List of event record
     * @param requestValues DataRecord of field's name-value pairs of service request
     * @param status job status
     */
    public void createServiceRequests(final JSONArray eventIDs, final DataRecord requestValues,
            final JobStatus status) {

        final int totalNo = eventIDs.length();
        status.setTotalNumber(totalNo);
        int counter = 0;

        for (int i = 0; i < eventIDs.length(); i++) {
            final int eventID =
                    ((JSONObject) eventIDs.get(i)).getInt(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID);
            
            final DataRecord eventRecord =
                    this.activityLogDs.getRecord("activity_log_id=" + eventID);
            
            this.createRequest(eventRecord, requestValues);
            
            // //Similar to CA, set the status of each compliance event to ‘IN PROGRESS’ after
            // service request creation.
            eventRecord.setValue(Constant.ACTIVITY_LOG + Constant.DOT + Constant.STATUS,
                "IN PROGRESS");
            this.activityLogDs.updateRecord(eventRecord);

            status.setCurrentNumber(counter++);
        }
        
        status.setCurrentNumber(totalNo);
        status.setCode(JobStatus.JOB_COMPLETE);
    }
    
    /**
     * Create single service request record.
     *
     * @param eventRecord Compliance Event Record
     * @param requestValues DataRecord record with values user entered for new requests
     */
    private void createRequest(final DataRecord eventRecord, final DataRecord requestValues) {

        final DataRecord requestRecord = this.activityLogDs.createNewRecord();
        
        // TODO: need to confirm if copy all other field values from event to new request
        
        // Site Code, Building Code, Floor Code, Room Code, Equipment Code – Use event’s
        // compliance_locations record, if any.
        requestRecord.setValue(ACTIVITY_LOG_SITE_ID, eventRecord.getString(ACTIVITY_LOG_SITE_ID));
        requestRecord.setValue(ACTIVITY_LOG_BL_ID, eventRecord.getString(ACTIVITY_LOG_BL_ID));
        requestRecord.setValue(ACTIVITY_LOG_FL_ID, eventRecord.getString(ACTIVITY_LOG_FL_ID));
        requestRecord.setValue(ACTIVITY_LOG_RM_ID, eventRecord.getString(ACTIVITY_LOG_RM_ID));
        requestRecord.setValue(ACTIVITY_LOG_EQ_ID, eventRecord.getString(ACTIVITY_LOG_EQ_ID));

        final StringBuilder description = constructDescription(eventRecord, requestValues);

        requestRecord.setValue(ACTIVITY_LOG_DESCRIPTION, description.toString());
        
        requestRecord.setValue(ACTIVITY_LOG_ASSESSMENT_ID,
            eventRecord.getValue(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID));

        requestRecord
        .setValue(ACTIVITY_LOG_PROB_TYPE, eventRecord.getValue(ACTIVITY_LOG_PROB_TYPE));

        requestRecord
        .setValue(ACTIVITY_LOG_REQUESTOR, eventRecord.getValue(ACTIVITY_LOG_REQUESTOR));

        requestRecord.setValue(ACTIVITY_LOG_PHONE_REQUESTOR,
            eventRecord.getValue(ACTIVITY_LOG_PHONE_REQUESTOR));

        requestRecord.setValue(ACTIVITY_LOG_PRIORITY, eventRecord.getValue(ACTIVITY_LOG_PRIORITY));
        
        requestRecord.setValue(ACTIVITY_LOG_ACTIVIT_TYPE,
            requestValues.getValue(ACTIVITY_LOG_ACTIVIT_TYPE));
        
        // save and submit the new service request
        final DataRecord newRequestRecord = this.activityLogDs.saveRecord(requestRecord);
        
        final int requestId = newRequestRecord.getInt(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID);
        final RequestHandler requestHandler = new RequestHandler();
        final Map<String, Object> recordValues = requestRecord.getValues();
        recordValues.put(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID, requestId);
        requestHandler.submitRequest(String.valueOf(requestId),
            EventHandlerBase.toJSONObject(recordValues));
    }

    /**
     * Initialize the final description field's value: If the user fills in the Description field in
     * the dialog box, add a newline and append the Event description and Event Dates to the user’s
     * description.
     *
     * @param eventRecord Compliance Event Record
     * @param requestValues DataRecord record with values user entered for new requests
     *
     * @return StringBuilder of description value
     */
    private StringBuilder constructDescription(final DataRecord eventRecord,
            final DataRecord requestValues) {
        // If the user fills in the Description field in the dialog box, add newline and append
        // the Event description and Event Dates to the user’s description.
        final StringBuilder description = new StringBuilder();
        
        final String inputDescription = requestValues.getString(ACTIVITY_LOG_DESCRIPTION);
        if (StringUtil.notNullOrEmpty(inputDescription)) {
            description.append(inputDescription);
        }

        final String eventDescription = eventRecord.getString(ACTIVITY_LOG_DESCRIPTION);
        if (StringUtil.notNullOrEmpty(eventDescription)) {
            description.append(description.length() > 0 ? ENTER_KEY + eventDescription
                    : eventDescription);
        }
        
        this.appendDateFieldValueToDescription(description, eventRecord, ACTIVITY_LOG_DATE_REQUIRED);
        this.appendDateFieldValueToDescription(description, eventRecord,
            ACTIVITY_LOG_DATE_SCHEDULED_END);
        this.appendDateFieldValueToDescription(description, eventRecord,
            ACTIVITY_LOG_DATE_SCHEDULED);

        return description;
    }

    /**
     * Append date field value to description.
     *
     * @param description StringBuilder
     * @param srcRecord DataRecord event record
     * @param srcFieldName String date field name
     */
    private void appendDateFieldValueToDescription(final StringBuilder description,
            final DataRecord srcRecord, final String srcFieldName) {
        
        final Date dateValue = srcRecord.getDate(srcFieldName);
        if (dateValue != null) {
            description.append(description.length() > 0 ? ENTER_KEY + dateValue.toString()
                    : dateValue.toString());
            
        }

    }
}
