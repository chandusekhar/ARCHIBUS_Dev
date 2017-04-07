package com.archibus.service.cost;

import java.util.*;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.jobmanager.JobStatus;

/**
 * 
 * Test class for SummarizeCosts.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.2
 * 
 */
public class SummarizeCostsTest extends DataSourceTestBase {
    
    /**
     * Test method for SummarizeCosts.calculate.
     * 
     */
    public void testCalculate() {
        final String summaryType = "ls";
        final Map<String, String> parameters = new HashMap<String, String>();
        parameters.put("multipleValueSeparator", ", ");
        parameters.put("ctry_id", "USA, FRA, GBR");
        parameters.put("cost_assoc_with", "ls");
        parameters.put("date_start", "2010-01-01");
        parameters.put("date_end", "2010-12-31");
        parameters.put("period", "year");
        parameters.put("cost_from", "011");
        parameters.put("currency_code", "EUR");
        parameters.put("exchange_rate", "PAYMENT");
        parameters.put("is_budget_currency", "false");
        parameters.put("vat_cost_type", "total");
        
        final RequestParameters requestParameters = new RequestParameters(parameters);
        
        final SummarizeCosts summarizeCosts2 = new SummarizeCosts(summaryType);
        final JobStatus jobStatus = new JobStatus();
        summarizeCosts2.calculate(requestParameters, true, jobStatus);
        
    }
    
    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "conversionDataSource.xml" };
    }
}
