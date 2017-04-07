package com.archibus.eventhandler.compliance;

import org.json.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 * Helper Classes for Compliance Bldgops Procedures related business logic.
 *
 * Added for 22.1 Compliance Bldgops Integration
 *
 * @author ASC-BJ:Zhang Yi
 */
public class ComplianceProcedureProcessor {
    
    /**
     * DataSource of Compliance Compliance Requirements and PM Procedures Mapping( table: regreq_pmp
     * ).
     *
     */
    private final DataSource dsRegreqPmp;
    
    /**
     * Constructor.
     *
     */
    public ComplianceProcedureProcessor() {
        super();
        
        this.dsRegreqPmp =
                DataSourceFactory.createDataSourceForFields("regreq_pmp", new String[] { "pmp_id",
                        Constant.REGULATION, Constant.REG_PROGRAM, Constant.REG_REQUIREMENT });
    }

    /**
     * For the given requirement and each procedure of procedures list, create the regreq_pmp
     * records.
     *
     * @param requirement JSONObject of field's name-value pairs
     * @param procedures List of Procedures
     */
    public void assignProcedures(final JSONObject requirement, final JSONArray procedures) {

        for (int i = 0; i < procedures.length(); i++) {

            final DataRecord record = this.dsRegreqPmp.createNewRecord();

            record.setValue("regreq_pmp.regulation", requirement.getString("reg"));
            record.setValue("regreq_pmp.reg_program", requirement.getString("prog"));
            record.setValue("regreq_pmp.reg_requirement", requirement.getString("req"));
            record.setValue("regreq_pmp.pmp_id", procedures.getJSONObject(i)
                .getString("pmp.pmp_id"));

            this.dsRegreqPmp.saveRecord(record);
        }
    }
}
