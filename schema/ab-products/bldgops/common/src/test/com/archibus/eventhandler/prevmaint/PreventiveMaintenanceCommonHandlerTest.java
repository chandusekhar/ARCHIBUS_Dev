package com.archibus.eventhandler.prevmaint;

import java.text.ParseException;
import java.util.Calendar;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.utility.ExceptionBase;

public class PreventiveMaintenanceCommonHandlerTest extends DataSourceTestBase {
    
    private final String isoDateStart;
    
    private final String isoDateEnd;
    
    private final PreventiveMaintenanceCommonHandler pmHandler;
    
    public PreventiveMaintenanceCommonHandlerTest() {
        
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
        
        this.pmHandler = new PreventiveMaintenanceCommonHandler();
        
    }
    
    public void testGenerateScheduleDateAndForecastPM52Week() throws ExceptionBase, ParseException {
        
        this.pmHandler.generateScheduleDateAndForecastPM52Week(this.isoDateStart, this.isoDateEnd,
            " 1=1 ", "52W-P");
        this.pmHandler.generateScheduleDateAndForecastPM52Week(this.isoDateStart, this.isoDateEnd,
            " 1=1 ", "52W-W");
        this.pmHandler.generateScheduleDateAndForecastPM52Week(this.isoDateStart, this.isoDateEnd,
            " 1=1 ", "52W-L");
        this.pmHandler.generateScheduleDateAndForecastPM52Week(this.isoDateStart, this.isoDateEnd,
            " 1=1 ", "12M-L");
        
    }
    
    public void testGenerateScheduleDateAndForecastPMResources() throws ExceptionBase,
            ParseException {
        
        this.pmHandler.generateScheduleDateAndForecastPMResources(this.isoDateStart,
            this.isoDateEnd, "ALL", " 1=1 ");
        
    }
    
}
