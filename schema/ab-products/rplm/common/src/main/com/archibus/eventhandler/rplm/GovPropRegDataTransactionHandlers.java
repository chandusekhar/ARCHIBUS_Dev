package com.archibus.eventhandler.rplm;

/**
 * KB 3025764 03/15/2010 Ioan modified to use method parameters
 */

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.utility.*;

public class GovPropRegDataTransactionHandlers extends EventHandlerBase {
    
    /**
     * approve selected transaction
     * 
     * @param propertyId
     * @param transactionId
     * @param userName
     * @throws ExceptionBase
     */
    public void approveGovPropRegDataTransaction(final String propertyId,
            final String transactionId, final String userName) throws ExceptionBase {
        final Integer iTransaction = Integer.valueOf(transactionId);
        /*
         * check if is new transaction
         */
        DataSource ds = DataSourceFactory.createDataSource();
        ds.addTable("grp");
        ds.addField("unique_identifier");
        ds.addRestriction(Restrictions.eq("grp", "unique_identifier", propertyId));
        final List<DataRecord> records = ds.getRecords();
        final boolean isNewGRP = records.isEmpty();
        
        final String[] fields =
                { "annual_operating_costs", "city", "condition_index", "congressional_district",
                        "country", "county", "disposition_date", "disposition_method_id",
                        "disposition_value", "grp_type_id", "grp_use_id", "historical_status",
                        "installation_identifier", "installation_name", "latitude",
                        "lease_authority_id", "lease_maintenance_ind", "legal_interest_ind",
                        "longitude", "mission_dependency", "net_proceeds", "outgrant_indicator",
                        "real_property_name", "recipient", "reporting_grp_agency_id",
                        "restrictions", "size_gross_area", "size_rural_acres",
                        "size_structural_unit", "size_unit_of_measure", "size_urban_acres",
                        "state", "status_indicator", "street_address",
                        "sub_installation_identifier", "sustainability", "using_grp_agency_id",
                        "utilization", "value", "zip_code", "sustainability", "btu_consumption",
                        "count_emp_fed", "count_emp_contractor", "count_emp_fed_telework",
                        "dispos_anticipated", "dispos_anticipated_method",
                        "dispos_anticipated_year", "excess_is_anticipated",
                        "excess_anticipated_year", "sale_candidate", "sale_anticipated_year",
                        "lease_id", "date_lease_expiration", "lease_option_to_term_early" };
        ds = DataSourceFactory.createDataSourceForFields("grp", fields);
        ds.addField("unique_identifier");
        ds.addField("last_updated_by");
        ds.addField("date_last_update");
        ds.addField("time_last_update");
        
        /*
         * if is new grp record, create the grp record with data from transaction record
         */
        DataRecord record = null;
        if (isNewGRP) {
            record = ds.createNewRecord();
            for (final String field : fields) {
                final Restriction restriction =
                        Restrictions.and(
                            Restrictions.eq("grp_trans", "grp_trans_id", transactionId),
                            Restrictions.isNotNull("grp_trans", field));
                getFieldLastValue(record, field, restriction);
            }
        } else {
            ds.addRestriction(Restrictions.eq("grp", "unique_identifier", propertyId));
            record = ds.getRecord();
            // get the last value from from all property transactions
            for (final String field : fields) {
                final Restriction restriction =
                        Restrictions.and(Restrictions.in("grp_trans", "status", "CREATED, POSTED"),
                            Restrictions.eq("grp_trans", "grp_trans_id", transactionId),
                            Restrictions.isNotNull("grp_trans", field));
                getFieldLastValue(record, field, restriction);
            }
        }
        record.setValue("grp.unique_identifier", propertyId);
        record.setValue("grp.last_updated_by", userName);
        record.setValue("grp.date_last_update", Utility.currentDate());
        record.setValue("grp.time_last_update", Utility.currentTime());
        ds.saveRecord(record);
        
        final Restriction restriction =
                Restrictions.and(Restrictions.eq("grp_trans", "unique_identifier", propertyId),
                    Restrictions.eq("grp_trans", "grp_trans_id", iTransaction),
                    Restrictions.eq("grp_trans", "status", "CREATED"));
        approveRejectTransaction(propertyId, userName, restriction, "POSTED");
    }
    
    /*
     * insert new property/transaction item
     */
    public void insertItemGovPropRegData(final DataRecord record) throws ExceptionBase {
        /*
         * 06/15/2010 IOAN Kb 3028001 changed to custom query because the some enumeration list
         * fields come with a default value and are not saved for new record
         */
        String strFlds = "";
        String strValues = "";
        final Iterator<DataValue> it_fld = record.getFields().iterator();
        while (it_fld.hasNext()) {
            final DataValue crtField = it_fld.next();
            strFlds += (strFlds.equals("") ? "" : ",") + crtField.getName();
            strValues += (strValues.equals("") ? "" : ",") + crtField.getDbValue();
        }
        final String strQuery =
                "INSERT INTO grp_trans (" + strFlds + ") VALUES (" + strValues + ")";
        SqlUtils.executeUpdate("grp_trans", strQuery);
    }
    
    /**
     * Reject GRP transaction.
     * 
     * @param propertyId
     * @param transactionId
     * @param userName
     * @throws ExceptionBase
     */
    public void rejectGovPropRegDataTransaction(final String propertyId,
            final String transactionId, final String userName) throws ExceptionBase {
        final Integer iTransaction = Integer.valueOf(transactionId);
        
        final Restriction restriction =
                Restrictions.and(Restrictions.eq("grp_trans", "unique_identifier", propertyId),
                    Restrictions.eq("grp_trans", "grp_trans_id", iTransaction));
        approveRejectTransaction(propertyId, userName, restriction, "REJECTED");
    }
    
    /**
     * approve /reject selected transaction
     * 
     * Update grp_trans record, set grp_trans.status = status, grp_trans.user_name_app_rej =
     * userName grp_trans.date_of_app_rej = current date, grp_trans.time_of_app_rej = current time
     * 
     * @param propertyId
     * @param userName
     * @param restriction
     * @param status
     */
    private void approveRejectTransaction(final String propertyId, final String userName,
            final Restriction restriction, final String status) {
        final DataSource dsTrans = DataSourceFactory.createDataSource();
        dsTrans.addTable("grp_trans");
        dsTrans.addField("unique_identifier");
        dsTrans.addField("grp_trans_id");
        dsTrans.addField("status");
        dsTrans.addField("user_name_app_rej");
        dsTrans.addField("date_of_app_rej");
        dsTrans.addField("time_of_app_rej");
        dsTrans.addRestriction(restriction);
        final DataRecord recordTrans = dsTrans.getRecord();
        if (recordTrans != null) {
            recordTrans.setValue("grp_trans.status", status);
            recordTrans.setValue("grp_trans.user_name_app_rej", userName);
            recordTrans.setValue("grp_trans.date_of_app_rej", Utility.currentDate());
            recordTrans.setValue("grp_trans.time_of_app_rej", Utility.currentTime());
            dsTrans.saveRecord(recordTrans);
        }
    }
    
    /**
     * get last value for field from all property transactions
     * 
     * @param transactionId
     * @param record
     * @param field
     */
    private void getFieldLastValue(final DataRecord record, final String field,
            final Restriction restriction) {
        DataSource dsField;
        dsField = DataSourceFactory.createDataSource();
        dsField.addTable("grp_trans");
        dsField.addField("unique_identifier");
        dsField.addField("grp_trans_id");
        dsField.addField("status");
        dsField.addField(field);
        dsField.addSort("grp_trans", "grp_trans_id", DataSource.SORT_DESC);
        dsField.addRestriction(restriction);
        dsField.setMaxRecords(1);
        final DataRecord crtRecord = dsField.getRecord();
        if (crtRecord != null) {
            final DataValue crtValue = crtRecord.findField("grp_trans." + field);
            if (!crtValue.isEmpty()) {
                record.setValue("grp." + field, crtValue.getValue());
            }
        }
    }
}
