package com.archibus.eventhandler.prevmaint;

import java.util.Calendar;

import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSourceTestBase;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class ForecastDatesGeneratorTest extends DataSourceTestBase {
    
    private final String isoDateStart;
    
    private final String isoDateEnd;
    
    public ForecastDatesGeneratorTest() {
        super();
        
        this.isoDateStart =
                String.valueOf(Calendar.getInstance().get(Calendar.YEAR)) + "-"
                        + String.valueOf(Calendar.getInstance().get(Calendar.MONTH)) + "-"
                        + String.valueOf(Calendar.getInstance().get(Calendar.DAY_OF_MONTH));
        
        Calendar.getInstance().add(Calendar.DAY_OF_MONTH, 10);
        this.isoDateEnd =
                String.valueOf(Calendar.getInstance().get(Calendar.YEAR)) + "-"
                        + String.valueOf(Calendar.getInstance().get(Calendar.MONTH)) + "-"
                        + String.valueOf(Calendar.getInstance().get(Calendar.DAY_OF_MONTH));
        
    }
    
    public void testForecastPMResources() {
        
        final EventHandlerContext eventHandlerContext = ContextStore.get().getEventHandlerContext();
        
        final String dateFrom =
                EventHandlerBase.formatSqlIsoToNativeDate(eventHandlerContext, this.isoDateStart);
        final String dateTo =
                EventHandlerBase.formatSqlIsoToNativeDate(eventHandlerContext, this.isoDateEnd);
        
        // Call ForecastDatesGenerator to create forecast records in database.
        final ForecastDatesGenerator forecastGenerator =
                new ForecastDatesGenerator("ALL", " 1=1 ", dateFrom, dateTo, null, null, null);
        
        forecastGenerator.run();
    }
    
    public void testForecastPM52W() {
        
        final EventHandlerContext eventHandlerContext = ContextStore.get().getEventHandlerContext();
        
        final String dateFrom =
                EventHandlerBase.formatSqlIsoToNativeDate(eventHandlerContext, this.isoDateStart);
        final String dateTo =
                EventHandlerBase.formatSqlIsoToNativeDate(eventHandlerContext, this.isoDateEnd);
        
        // Call ForecastDatesGenerator to create forecast records in database.
        final ForecastDatesGenerator forecastGenerator =
                new ForecastDatesGenerator("52W", " 1=1 ", dateFrom, dateTo, null, null, null);
        
        forecastGenerator.run();
    }
    
    public void testForecastPM12M() {
        
        final EventHandlerContext eventHandlerContext = ContextStore.get().getEventHandlerContext();
        
        final String dateFrom =
                EventHandlerBase.formatSqlIsoToNativeDate(eventHandlerContext, this.isoDateStart);
        final String dateTo =
                EventHandlerBase.formatSqlIsoToNativeDate(eventHandlerContext, this.isoDateEnd);
        
        // Call ForecastDatesGenerator to create forecast records in database.
        final ForecastDatesGenerator forecastGenerator =
                new ForecastDatesGenerator("12M", " 1=1 ", dateFrom, dateTo, null, null, null);
        
        forecastGenerator.run();
    }
    
}
