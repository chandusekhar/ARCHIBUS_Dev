package com.archibus.eventhandler.prevmaint;

import java.util.*;

import com.archibus.datasource.DataSourceTestBase;

public class PmScheduleGeneratorTest extends DataSourceTestBase {
    
    private final Date dateStart;
    
    private final Date dateEnd;
    
    public PmScheduleGeneratorTest() {
        super();
        
        this.dateStart = (Date) Calendar.getInstance().getTime().clone();
        final Calendar current = Calendar.getInstance();
        current.add(Calendar.DAY_OF_MONTH, 10);
        this.dateEnd = (Date) current.getTime().clone();
        
    }
    
    public void testCreateScheduledDatesCount() {
        final String restriction =
                "pms.pms_id = 1 OR pms.pms_id = 2 OR pms.pms_id = 3 OR pms.pms_id = 4 OR pms.pms_id = 5";
        
        final PmScheduleGenerator generator =
                new PmScheduleGenerator(this.dateStart, this.dateEnd, restriction, true);
        generator.run();
        
        assertEquals(5, generator.pmsCounter);
    }
    
    public void testCreateScheduledDatesForOneSchedule() {
        
        final String restriction = " 1=1 ";
        
        final PmScheduleGenerator generator =
                new PmScheduleGenerator(this.dateStart, this.dateEnd, restriction, true);
        
        printMemory("Before test");
        final long t = System.currentTimeMillis();
        
        generator.run();
        
        System.out.println("createScheduledDates(): " + (System.currentTimeMillis() - t) + " ms");
        printMemory("After createScheduledDates()");
    }
    
    public void testCreateScheduledDatesForDateRange() {
        
        final PmScheduleGenerator generator =
                new PmScheduleGenerator(this.dateStart, this.dateEnd, " 1=1 ", true);
        
        printMemory("Before test");
        final long t = System.currentTimeMillis();
        
        generator.run();
        
        System.out.println("createScheduledDates(): " + (System.currentTimeMillis() - t) + " ms");
        printMemory("After createScheduledDates()");
    }
}
