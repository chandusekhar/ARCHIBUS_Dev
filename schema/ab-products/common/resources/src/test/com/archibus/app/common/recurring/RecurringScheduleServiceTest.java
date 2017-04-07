package com.archibus.app.common.recurring;

import java.util.*;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.DateTime;

/**
 * test class for com.archibus.app.common.recurring.RecurringScheduleService.
 * <p>
 * 
 * @author ASC-BJ: Guo Jiangtao
 * @since 20.3
 * 
 */
public class RecurringScheduleServiceTest extends DataSourceTestBase {
    
    /**
     * get method com.archibus.app.common.recurring.getDateList().
     */
    public void testGetDatesList() {
        
        final RecurringScheduleService service = new RecurringScheduleService();
        
        final String format = "yyyy-MM-dd";
        final Date dateStart = DateTime.stringToDate("2012-01-01", format);
        final Date dateEnd = DateTime.stringToDate("2012-01-10", format);
        final String recurringRule =
                "<recurring type=\"day\" value1=\"5\" value2=\"\" value3=\"\" total=\"10\"/>";
        final List<Date> dateList = service.getDatesList(dateStart, dateEnd, recurringRule);
        assertTrue(dateList.size() == 2);
    }
    
    /**
     * Get localized description for recurrence pattern.
     */
    public void testGetRecurringPatternDescription() {
        final RecurringScheduleService service = new RecurringScheduleService();
        final String ruleStr =
                "<recurring type=\"year\" value1=\"3\" value2=\"\" value3=\"oct\" value4=\"1\" total=\"10\"/>";
        
        final String description = service.getRecurringPatternDescription(ruleStr);
        assertEquals(
            "Yearly, Every 1 years, On The last Thursday of October, End After: 10 Occurrences",
            description);
        
    }
    
}
