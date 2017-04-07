package com.archibus.app.common.finanal.impl;

import java.util.Calendar;

import com.archibus.datasource.DataSourceTestBase;

/**
 * Test class for DateUtils.java
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class DateUtilsTest extends DataSourceTestBase {

    /**
     * Test method for getFiscalYearForDate.
     */
    public void getFiscalYearForDate() {

        final Calendar calendar = Calendar.getInstance();
        calendar.set(2015, Calendar.JULY, 01);

        assertEquals(2016, DateUtils.getFiscalYearForDate(calendar.getTime()));
    }
}
