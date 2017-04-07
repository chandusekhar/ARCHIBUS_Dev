package com.archibus.eventhandler.prevmaint;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

public class PmWorkOrderGeneratorTest extends DataSourceTestBase {
    
    private final Date dateStart;
    
    private final Date dateEnd;
    
    public PmWorkOrderGeneratorTest() {
        super();
        
        this.dateStart = (Date) Calendar.getInstance().getTime().clone();
        final Calendar current = Calendar.getInstance();
        current.add(Calendar.DAY_OF_MONTH, 10);
        this.dateEnd = (Date) current.getTime().clone();
        
    }
    
    public void DONOT_testGeneratePmps() {
        printMemory("Before test");
        System.currentTimeMillis();
        
        final DataSource dsPmps = DataSourceFactory.createDataSource();
        dsPmps.addTable("pmps");
        dsPmps.addField("pmp_id");
        dsPmps.addField("pmps_id");
        dsPmps.addField("instructions");
        
        final DataSource dsPmp = DataSourceFactory.createDataSource();
        dsPmp.addTable("pmp");
        dsPmp.addField("pmp_id");
        dsPmp.queryRecords(null, new DataSource.RecordHandler() {
            
            public boolean handleRecord(final DataRecord record) {
                final String pmpId = record.getString("pmp.pmp_id");
                
                final DataRecord pmpsRecord = dsPmps.createRecord();
                pmpsRecord.setNew(true);
                pmpsRecord.setValue("pmps.pmp_id", pmpId);
                pmpsRecord.setValue("pmps.pmps_id", new Integer(10));
                pmpsRecord.setValue("pmps.instructions", "'Do some work for PM Procedure: " + pmpId
                        + ". Do it now! Do it right! Do it good!");
                dsPmps.saveRecord(pmpsRecord);
                return true;
            }
        });
        
        dsPmps.commit();
    }
    
    public void testGeneratePmWorkOrders() {
        final String pmType = PmWorkOrderGenerator.PMTYPE_EQWO;
        final int groupOption = PmWorkOrderGenerator.GROUP_BY_PM_SCHEDULE;
        final boolean useGroupingCodes = false;
        final String pmsidRestriction = " 1=1 ";
        
        final PmWorkOrderGenerator generator =
                new PmWorkOrderGenerator(pmType, this.dateStart, this.dateEnd, groupOption,
                    useGroupingCodes, pmsidRestriction, null);
        
        printMemory("Before test");
        final long t = System.currentTimeMillis();
        
        generator.run();
        
        System.out.println("generatePmWorkOrders(): " + (System.currentTimeMillis() - t) + " ms");
        printMemory("After generatePmWorkOrders()");
    }
}
