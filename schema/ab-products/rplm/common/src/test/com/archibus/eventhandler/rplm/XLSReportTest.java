package com.archibus.eventhandler.rplm;

import java.util.*;

import org.json.JSONObject;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.ext.report.xls.XlsBuilder.Color;

public class XLSReportTest extends DataSourceTestBase {
    
    XLSReport handlerClass = new XLSReport();
    
    public void testSetStripMinus() {
        
        this.handlerClass.setStripMinus(true);
    }
    
    public void testSetMonthFormat() {
        this.handlerClass.setMonthFormat(true);
    }
    
    public void testSetQuarterFormat() {
        this.handlerClass.setQuarterFormat(true);
    }
    
    public void testSetProjectionType() {
        this.handlerClass.setProjectionType("");
    }
    
    public void testSetCalculationType() {
        this.handlerClass.setCalculationType("");
    }
    
    public void testWriteColumnHead() {
        this.handlerClass.writeColumnHead(1, 1, new JSONObject());
    }
    
    public void testAddCustomTotalRow() {
        this.handlerClass.addCustomTotalRow(3, 3, new ArrayList<Map<String, Object>>(), null);
    }
    
    public void testWriteFieldValue() {
        this.handlerClass.writeFieldValue(new HashMap<String, Object>(), 2, 3, "");
    }
    
    public void testWriteTitleOfFirstGroupByField() {
        this.handlerClass.writeTitleOfFirstGroupByField(1, 1, "TITLE", new Color(0, 0, 0));
    }
    
    public void testWriteTitleOfSecondGroupByField() {
        this.handlerClass.writeTitleOfSecondGroupByField(1, 1, "TITLE", new Color(0, 0, 0));
    }
    
    public void testWriteCalculatedFieldTitle() {
        this.handlerClass.writeCalculatedFieldTitle(1, 1, "Title");
    }
    
}
