package com.archibus.eventhandler.ehs;

import java.util.*;

import com.archibus.app.common.recurring.RecurringScheduleService;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * Personal Protective Equipment (PPE) Handler.
 * 
 * @author Ioan Draghici
 * 
 */
public class PPEHandler {
    
    /**
     * Field name: "bl_id".
     */
    private static final String BL_ID = "bl_id";
    
    /**
     * Field name: "date_use".
     */
    private static final String DATE_DELIVERY = "date_delivered";
    
    /**
     * Field name: "date_recurrence_end".
     */
    private static final String DATE_RECURRENCE_END = "date_recurrence_end";
    
    /**
     * Field name: "date_use".
     */
    private static final String DATE_USE = "date_use";
    
    /**
     * Constant : DOT.
     */
    private static final String DOT = ".";
    
    /**
     * Table name: "ehs_em_ppe_types".
     */
    private static final String EHS_EM_PPE_TYPES = "ehs_em_ppe_types";
    
    /**
     * Table name: "ehs_ppe_types".
     */
    private static final String EHS_PPE_TYPES = "ehs_ppe_types";
    
    /**
     * Field name: "em_id".
     */
    private static final String EM_ID = "em_id";
    
    /**
     * Field name: "fl_id".
     */
    private static final String FL_ID = "fl_id";
    
    /**
     * Field name: "incident_id".
     */
    private static final String INCIDENT_ID = "incident_id";
    
    /**
     * Field name: "needs_renewal".
     */
    private static final String NEEDS_RENEWAL = "needs_renewal";
    
    /**
     * Field name: "ehs_ppe_types".
     */
    private static final String PPE_TYPE_ID = "ppe_type_id";
    
    /**
     * Field name: "recurring_rule".
     */
    private static final String RECURRING_RULE = "recurring_rule";
    
    /**
     * Field name: "rm_id".
     */
    private static final String RM_ID = "rm_id";
    
    /**
     * Field Names.
     */
    private final String[] emPpeTypesFields = { PPE_TYPE_ID, DATE_USE, EM_ID, BL_ID, FL_ID, RM_ID,
            DATE_DELIVERY, INCIDENT_ID };
    
    /**
     * Field Names.
     */
    private final String[] ppeTypesFields = { PPE_TYPE_ID, NEEDS_RENEWAL, "eq_std", "description",
            DATE_RECURRENCE_END, RECURRING_RULE };
    
    /**
     * New records no.
     */
    private int recordNo;
    
    /**
     * Assign PPE to Employee.
     * 
     * @param ppeId ppe code
     * @param employeeId employee code
     * @param deliveryDate delivery date
     * @param buildingId building code
     * @param floorId floor code
     * @param roomId room code
     * @param incidentId incident code
     */
    public void assignPPEToEmployee(final String ppeId, final String employeeId,
            final Date deliveryDate, final String buildingId, final String floorId,
            final String roomId, final String incidentId) {
        final DataRecord ppeType = getPPEType(ppeId);
        final List<Date> renewalDates = getRenewalDates(ppeType, deliveryDate);
        for (final Date renewalDate : renewalDates) {
            createResult(ppeId, employeeId, buildingId, floorId, roomId, incidentId, renewalDate);
        }
        this.recordNo = renewalDates.size();
        
        if (!renewalDates.isEmpty()) {
            final Map<String, String> pkObject = new HashMap<String, String>();
            pkObject.put(PPE_TYPE_ID, ppeId);
            pkObject.put(EM_ID, employeeId);
            pkObject.put(DATE_DELIVERY, SqlUtils.normalizeValueForSql(renewalDates.get(0))
                .toString());
            
            final Map<String, Object> newValues = new HashMap<String, Object>();
            newValues.put(PPE_TYPE_ID, ppeId);
            newValues.put(EM_ID, employeeId);
            newValues.put(DATE_DELIVERY, SqlUtils.normalizeValueForSql(renewalDates.get(0))
                .toString());
            newValues.put(INCIDENT_ID, incidentId);
            
            // notify employee
            // notifyEmployee("New", pkObject, newValues, null, renewalDates);
        }
    }
    
    /**
     * @return the recordNo
     */
    public int getRecordNo() {
        return this.recordNo;
    }
    
    /**
     * Create PPE em record.
     * 
     * @param ppeId ppe type code
     * @param employeeId employee code
     * @param buildingId building code
     * @param floorId floor code
     * @param roomId room code
     * @param incidentId incident code
     * @param renewalDate renewal date (date put in use)
     */
    private void createResult(final String ppeId, final String employeeId, final String buildingId,
            final String floorId, final String roomId, final String incidentId,
            final Date renewalDate) {
        final DataSource dataSource =
                DataSourceFactory
                    .createDataSourceForFields(EHS_EM_PPE_TYPES, this.emPpeTypesFields);
        final DataRecord record = dataSource.createNewRecord();
        // set field values
        record.setValue(EHS_EM_PPE_TYPES + DOT + PPE_TYPE_ID, ppeId);
        record.setValue(EHS_EM_PPE_TYPES + DOT + EM_ID, employeeId);
        record.setValue(EHS_EM_PPE_TYPES + DOT + DATE_USE, renewalDate);
        record.setValue(EHS_EM_PPE_TYPES + DOT + BL_ID, buildingId);
        record.setValue(EHS_EM_PPE_TYPES + DOT + FL_ID, floorId);
        record.setValue(EHS_EM_PPE_TYPES + DOT + RM_ID, roomId);
        
        if (StringUtil.notNullOrEmpty(incidentId)) {
            final Integer incidentIdInt = Integer.valueOf(incidentId);
            record.setValue(EHS_EM_PPE_TYPES + DOT + INCIDENT_ID, incidentIdInt);
        }
        
        // save record
        dataSource.saveRecord(record);
    }
    
    /**
     * Get PPE type record.
     * 
     * @param ppeTypeId ppe type code
     * @return data record
     */
    private DataRecord getPPEType(final String ppeTypeId) {
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(EHS_PPE_TYPES, this.ppeTypesFields);
        dataSource.addRestriction(Restrictions.eq(EHS_PPE_TYPES, PPE_TYPE_ID, ppeTypeId));
        return dataSource.getRecord();
    }
    
    /**
     * Get Renewal dates list if PPE must be renew.
     * 
     * @param ppeType ppe type data record
     * @param deliveryDate delivery date.
     * @return list of renewal dates
     */
    private List<Date> getRenewalDates(final DataRecord ppeType, final Date deliveryDate) {
        List<Date> dates = new ArrayList<Date>();
        final boolean isRenewalRequired = ppeType.getInt(EHS_PPE_TYPES + DOT + NEEDS_RENEWAL) == 1;
        if (isRenewalRequired) {
            // call common wfr and get recurring dates
            final String recurringRule = ppeType.getString(EHS_PPE_TYPES + DOT + RECURRING_RULE);
            final Date endDate = ppeType.getDate(EHS_PPE_TYPES + DOT + DATE_RECURRENCE_END);
            final RecurringScheduleService recurringScheduleService =
                    new RecurringScheduleService();
            dates = recurringScheduleService.getDatesList(deliveryDate, endDate, recurringRule);
        } else {
            dates.add(deliveryDate);
        }
        return dates;
    }
    
}
