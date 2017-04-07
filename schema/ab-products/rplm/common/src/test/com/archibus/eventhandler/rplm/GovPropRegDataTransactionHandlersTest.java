package com.archibus.eventhandler.rplm;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.Utility;

public class GovPropRegDataTransactionHandlersTest extends DataSourceTestBase {
    
    GovPropRegDataTransactionHandlers classHandler = new GovPropRegDataTransactionHandlers();
    
    public void testRejectGovPropRegDataTransaction() {
        String property = "PROP_33";
        String transction = "17";
        String user = "AFM";
        this.classHandler.rejectGovPropRegDataTransaction(property, transction, user);
    }
    
    public void testApproveGovPropRegDataTransaction() {
        String property = "PROP_33";
        String transction = "17";
        String user = "AFM";
        this.classHandler.approveGovPropRegDataTransaction(property, transction, user);
    }
    
    public void testInsertItemGovPropRegData() {
        String dsTable = "grp_trans";
        String[] dsFields = { "grp_trans_id", "trans_type", "date_of_transaction",
                "time_of_transaction", "status", "user_name_requestor", "real_property_name",
                "grp_type_id", "grp_use_id", "legal_interest_ind", "lease_maintenance_ind",
                "lease_authority_id", "status_indicator", "outgrant_indicator",
                "historical_status", "reporting_grp_agency_id", "using_grp_agency_id",
                "size_rural_acres", "size_urban_acres", "size_gross_area", "size_structural_unit",
                "size_unit_of_measure", "utilization", "value", "condition_index",
                "mission_dependency", "annual_operating_costs", "street_address", "latitude",
                "longitude", "unique_identifier", "city", "state", "country", "county",
                "congressional_district", "zip_code", "installation_identifier",
                "sub_installation_identifier", "installation_name", "restrictions",
                "disposition_method_id", "disposition_date", "disposition_value", "net_proceeds",
                "recipient", "description_of_change", "comments", "sustainability" };
        DataSource ds = DataSourceFactory.createDataSourceForFields(dsTable, dsFields);
        DataRecord record = ds.createNewRecord();
        
        record.setValue("grp_trans.trans_type", "INSERT");
        record.setValue("grp_trans.date_of_transaction", Utility.currentDate());
        record.setValue("grp_trans.time_of_transaction", Utility.currentTime());
        record.setValue("grp_trans.status", "CREATED");
        record.setValue("grp_trans.user_name_requestor", "AFM");
        record.setValue("grp_trans.real_property_name", "Property 2");
        record.setValue("grp_trans.legal_interest_ind", "G");
        record.setValue("grp_trans.lease_maintenance_ind", "Y");
        record.setValue("grp_trans.lease_authority_id", "NA");
        record.setValue("grp_trans.status_indicator", "A");
        record.setValue("grp_trans.outgrant_indicator", "Y");
        record.setValue("grp_trans.historical_status", 5);
        record.setValue("grp_trans.size_unit_of_measure", 3);
        record.setValue("grp_trans.utilization", 2);
        record.setValue("grp_trans.mission_dependency", 9);
        record.setValue("grp_trans.unique_identifier", "Property 2");
        record.setValue("grp_trans.disposition_method_id", "NA");
        record.setValue("grp_trans.disposition_date", Utility.currentDate());
        record.setValue("grp_trans.sustainability", 1);
        record.setValue("grp_trans.description_of_change", "second test");
        
        this.classHandler.insertItemGovPropRegData(record);
    }
    
}
