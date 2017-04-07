package com.archibus.app.solution.common.report.xls;

import java.util.*;

import org.json.JSONArray;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;

/**
 * JUnit test StatisticsXLSReport.java to create a customized grid XLS report. Check the XLS report
 * XLS file under WebCentral/projects/users/afm
 * 
 * @author Yong Shao
 * 
 */
public class TestCutomGridXLSBuilder extends DataSourceTestBase {
    /**
     * 
     * TODO testCustomizedGridBuild.
     * 
     * @throws Exception if anything wrong.
     */
    public void testCustomizedGridBuild() throws Exception {
        /*
         * //XXX: called job API by javascript (see ab-command.js)// generateGridXLSReport(String
         * viewName, String dataSourceId, String title, List<Map<String, Object>> visibleFields,
         * String restriction, Map<String, Object> parameters)
         * 
         * DataSource dataSource = DataSourceFactory .loadDataSourceFromFile(viewName,
         * dataSourceId);
         * 
         * dataSource.setContext();
         * 
         * if (parameters != null) { ReportUtility.handleParameters(dataSource, parameters); }
         */
        
        final String view = "test-custom-xls-grid.axvw";
        final DataSource dataSource =
                DataSourceFactory.loadDataSourceFromFile(view,
                    "abRepmLsadminPropAndBlBench_ds_grid");
        final List<DataRecord> records = dataSource.getRecords();
        final String fields =
                "[{id:'property.pr_id',title:'Property Code', isNumeric:false},"
                        + " {id:'property.city_id',title:'City Code', isNumeric:false},"
                        + " {id:'property.value_book',title:'Book Value', isNumeric:true},"
                        + " {id:'property.value_market',title:'Market Value', isNumeric:true},"
                        + "{id:'property.sum_cost_total',title:'Expense Total', isNumeric:true}]";
        final List<Map<String, Object>> visibleFields =
                EventHandlerBase.fromJSONArray(new JSONArray(fields));
        
        final com.archibus.app.solution.common.report.xls.CutomGridXLSBuilder reportBuilder =
                new com.archibus.app.solution.common.report.xls.CutomGridXLSBuilder();
        reportBuilder.build(records, "Test a customized grid XLS report", visibleFields);
        
        /*
         * // set report url to job's status String// fileName = reportBuilder.getFileName(); String
         * url = reportBuilder.getURL(); JobResult result = new JobResult(title, fileName, url);
         * this.status.setResult(result);
         */
    }
}
