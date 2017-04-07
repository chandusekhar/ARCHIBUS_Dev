package com.archibus.service;

import java.util.*;

import com.archibus.datasource.DataSourceTestBase;

/**
 * Test class for "Period.java".
 * <p>
 * 
 * @author Ioan Draghici
 * @since 21.3
 * 
 */
public class PeriodTest extends DataSourceTestBase {
    
    /**
     * Test method for Period.getDateAfter.
     */
    public void testGetDateAfter() {
        final String intervalType = "m";
        final int interval = 1;
        final Calendar calendar = Calendar.getInstance();
        calendar.set(2014, 0, 31);
        final Date startDate = calendar.getTime();
        calendar.set(2014, 2, 5);
        final Date targetDate = calendar.getTime();
        
        final Date recurringDate =
                Period.getDateAfter(startDate, targetDate, intervalType, interval);
        calendar.set(2014, 2, 28);
        
        assertEquals(calendar.getTime(), recurringDate);
    }
    
    /**
     * Test method for Period.getDateAfter2.
     */
    public void testGetDateAfter2() {
        final String intervalType = "m";
        final int interval = 1;
        final Calendar calendar = Calendar.getInstance();
        calendar.set(2014, 0, 31);
        final Date startDate = calendar.getTime();
        calendar.set(2014, 2, 5);
        final Date targetDate = calendar.getTime();
        
        final Date recurringDate =
                Period.getDateAfter2(startDate, targetDate, intervalType, interval);
        calendar.set(2014, 2, 31);
        
        assertEquals(calendar.getTime(), recurringDate);
    }
}
