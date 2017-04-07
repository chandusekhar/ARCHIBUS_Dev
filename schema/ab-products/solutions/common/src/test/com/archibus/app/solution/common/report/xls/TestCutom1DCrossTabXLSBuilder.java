package com.archibus.app.solution.common.report.xls;

import java.text.ParseException;
import java.util.*;

import org.json.JSONArray;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.datasource.data.DataSet;
import com.archibus.eventhandler.*;
import com.archibus.ext.report.ReportUtility;

/**
 * 
 * @author Shao
 * 
 */
public class TestCutom1DCrossTabXLSBuilder extends DataSourceTestBase {
    /**
     * view name.
     */
    private static final String VIEW = "test-xls-crosstable-1d.axvw";
    
    /**
     * GROUPBYFIELDS.
     */
    private static final String GROUPBYFIELDS = "[{id:'wr.month',groupBy:'true',"
            + "showTotals:'true',title:'Month', isNumeric:false}]";
    
    /**
     * calculatedFields.
     */
    private static final String CALCULATEDFIELDS = "[{id:'wr.total_requests',groupBy:'false',"
            + "showTotals:'true',title:'Work requests', isNumeric:true}]";
    
    /**
     * 
     * @throws ParseException if JSONArray throws.
     */
    public void testCustomizedBuild() throws ParseException {
        
        final List<Map<String, String>> groupByFieldsList = EventHandlerBase
            .fromJSONArray(new JSONArray(GROUPBYFIELDS));
        
        final DataSourceService service = new DataSourceService();
        final DataSet dataSet = service.getGroupingDataSet(VIEW, "crossTableByMonth_ds", null,
            null, "1d", ReportUtility.getGroupByFieldNames(groupByFieldsList), null, null, null);
        
        final List<Map<String, Object>> calculatedFieldsList = EventHandlerBase
            .fromJSONArray(new JSONArray(CALCULATEDFIELDS));
        
        final Cutom1DCrossTabXLSBuilder reportBuilder = new Cutom1DCrossTabXLSBuilder();
        
        reportBuilder.build(dataSet, "Test a 1D CrossTab XLS report", groupByFieldsList,
            calculatedFieldsList);
        
    }
}
