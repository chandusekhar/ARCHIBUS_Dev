package com.archibus.eventhandler.compliance;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * Provides TODO. Define test class for ComplianceCommonHandler class. - if it has behavior
 * 
 * @since 20.1
 * 
 */
public class ComplianceEventFillerTest extends DataSourceTestBase {
    
    /**
     * Test FillRegLocInformationToEvent method.
     */
    public static final void testFillRegLocInformationToEvent() {
        final DataSource recordDS = ComplianceUtility.getDataSourceRegLocJoinComplianceLoc();
        final DataRecord compRecord =
                recordDS.getRecord(Constant.COMPLIANCE_LOCATIONS + Constant.DOT
                        + Constant.LOCATION_ID + "=9");
        
        final DataSource eventDs = ComplianceUtility.getDataSourceEvent();
        final DataRecord eventRecord =
                eventDs.getRecord(Constant.ACTIVITY_LOG_ACTIVITY_LOG_ID + "=2355 ");
        
        new ComplianceEventFiller().fillRegLocInformationToEvent(compRecord, eventRecord);
        eventDs.saveRecord(eventRecord);
        
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause(Constant.ACTIVITY_LOG, Constant.LOCATION_ID, 9, Operation.EQUALS);
        restriction.addClause(Constant.ACTIVITY_LOG, Constant.ACTIVITY_LOG_ID, 2355,
            Operation.EQUALS);
        
        final List<DataRecord> records = eventDs.getRecords(restriction);
        // @translatable
        final String message1 = "Fill Success";
        
        // @translatable
        final String message2 = "Fill Fail";
        if (!records.isEmpty()) {
            
            System.out.print(message1);
        } else {
            System.out.print(message2);
        }
    }
}
