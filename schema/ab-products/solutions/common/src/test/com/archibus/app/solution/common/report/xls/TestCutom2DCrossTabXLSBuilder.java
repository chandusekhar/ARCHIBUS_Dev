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
public class TestCutom2DCrossTabXLSBuilder extends DataSourceTestBase {
    /**
     * view name.
     */
    private static final String VIEW = "test-xls-crosstable-2d.axvw";
    
    /**
     * GROUPBYFIELDS.
     */
    private static final String GROUPBYFIELDS = "[{id:'property.ctry_id',groupBy:'true',showTotals:'true',"
            + "title:'Country Code'},{id:'property.status',groupBy:'true',showTotals:'true',title:'Property Status'}]";
    
    /**
     * calculatedFields.
     */
    private static final String CALCULATEDFIELDS = "[{id:'property.area_summary',groupBy:'false',"
            + "showTotals:'true',title:'Area Summary', isNumeric:true},{id:'property.property_count',"
            + "groupBy:'false',showTotals:'true',title:'Property Count', isNumeric:true}]";
    
    /**
     * 
     * @throws ParseException if JSONArray throws.
     */
    public void testCustomizedBuild() throws ParseException {
        
        final List<Map<String, String>> groupByFieldsList = EventHandlerBase
            .fromJSONArray(new JSONArray(GROUPBYFIELDS));
        final DataSourceService service = new DataSourceService();
        final DataSet dataSet = service.getGroupingDataSet(VIEW, "propViewAnalysis2d_ds", null,
            null, "2d", ReportUtility.getGroupByFieldNames(groupByFieldsList), null, null, null);
        
        final List<Map<String, Object>> calculatedFieldsList = EventHandlerBase
            .fromJSONArray(new JSONArray(CALCULATEDFIELDS));
        final Cutom2DCrossTabXLSBuilder reportBuilder = new Cutom2DCrossTabXLSBuilder();
        reportBuilder.build(dataSet, "Test a crossTable 2D XLS report", groupByFieldsList,
            calculatedFieldsList);
    }
}
