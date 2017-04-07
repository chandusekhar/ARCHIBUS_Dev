package com.archibus.service.metrics;

import java.util.*;
import java.util.regex.*;

import org.json.*;

import com.archibus.app.common.metrics.DbConstants;
import com.archibus.app.common.metrics.dao.IMetricDao;
import com.archibus.app.common.metrics.dao.datasource.MetricDataSource;
import com.archibus.app.common.metrics.domain.Metric;
import com.archibus.app.common.recurring.RecurringScheduleService;
import com.archibus.datasource.*;

/**
 * Test class for Metrics Service.
 *
 * @author Ioan Draghici
 *
 *         <p>
 *         Suppress PMD warning in this class.
 *         <p>
 *         Justification: test class.
 */
@SuppressWarnings({ "PMD.SystemPrintln", "PMD.AvoidFinalLocalVariable" })
public class TestMetricsService extends DataSourceTestBase {

    /**
     * Test scorecard.
     */
    private static final String SCORECARD_NAME = "SPACE";

    /**
     * Test metric.
     */
    private static final String METRIC_NAME = "areaPerOcc_WFR";

    /**
     * Test portfolio.
     */
    private static final String GRANULARITY_NAME = "ALL";

    /**
     * Test recurring period.
     */
    public void testRecurringPeriod() {
        final String recurringRule =
                "<recurring type=\"month\" value1=\"\" value2=\"\" value3=\"3\" total=\"\"/>";
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());
        calendar.add(Calendar.MONTH, Integer.valueOf("-3"));
        final Date currentDate = calendar.getTime();

        final RecurringScheduleService recurringService = new RecurringScheduleService();
        final List<Date> dates = recurringService.getDatesList(currentDate, null, recurringRule);

        assertNotNull(dates);

    }

    /**
     * Test the collectData() method.
     */
    public void testCollectData() {
        final MetricsService service = new MetricsService();
        service.collectData();
        System.out.println("DONE");
    }

    /**
     * Test the testMetric(metricName) method.
     */
    public void testTestMetric() {
        final String metricName = "Churn_percent";
        final MetricsService service = new MetricsService();
        service.testMetric(metricName);
    }

    /**
     * Test for collectDataForMetricAndDate(metricName, date) method.
     */
    public void testCollectDataForMetricAndDate() {
        final String metricName = METRIC_NAME;
        final Date collectDate = new Date();
        final MetricsService service = new MetricsService();
        service.collectDataForMetricAndDate(metricName, collectDate);
    }

    /**
     * Test method for collect date.
     */
    public void testCollectDate() {
        final String metricName = METRIC_NAME;
        final IMetricDao<Metric> metricDao =
                new MetricDataSource<Metric>("metric", DbConstants.AFM_METRIC_DEFINITIONS);
        final Metric metric = metricDao.getByName(metricName);

        final Date lastCollectDate = metric.getLastCollectDate(false);
        System.out.println("Last collect date = " + lastCollectDate.toString());

    }

    /**
     * Tests the getGranularitiesForMetric() method.
     */
    public void testGetGranularitiesForMetric() {
        final MetricsService service = new MetricsService();
        final JSONArray availableGranularities = service.getGranularitiesForMetric(METRIC_NAME);

        assertNotNull(availableGranularities);
        assertEquals(1, availableGranularities.length());

        final JSONObject granularity = availableGranularities.getJSONObject(0);
        assertEquals(GRANULARITY_NAME, granularity.getString("collectGroupBy"));
        assertEquals("Portfolio-Wide", granularity.getString("granularityTitle"));
        assertEquals("Gross Area", granularity.getString("metricTitle"));
    }

    /**
     * Tests the getTrendValuesForScorecard() method.
     */
    public void testGetTrendValuesForScorecard() {
        final MetricsService service = new MetricsService();
        final JSONArray data = service.getTrendValuesForScorecard(SCORECARD_NAME, GRANULARITY_NAME);

        assertNotNull(data);
    }

    /**
     * Tests the getTrendValuesForMetric() method.
     */
    public void testGetTrendValuesForMetric() {
        final MetricsService service = new MetricsService();
        final JSONArray data = service.getTrendValuesForMetric(METRIC_NAME, GRANULARITY_NAME,
            DataSource.SORT_DESC);

        assertNotNull(data);
    }

    /**
     * Test method for getPreviousCollectDateList method.
     */
    public void testGetPreviousCollectDateList() {
        final Date referenceDate = getCurrentDate();
        String recurringRule =
                "<recurring type=\"week\" value1=\"1,0,0,0,0,0,0\" value2=\"1\" value3=\"\" total=\"\"/>";
        recurringRule =
                "<recurring type=\"month\" value1=\"last\" value2=\"day\" value3=\"6\" total=\"\"/>";
        final int periodsNo = 12;

        final MetricsServiceHelper metricsServiceHelper = new MetricsServiceHelper();
        final List<Date> dates = metricsServiceHelper.getPreviousCollectDateList(recurringRule,
            referenceDate, periodsNo);

        assertEquals(periodsNo + 1, dates.size());
    }

    /**
     * Test field existence in sql statement using regular expression.
     */
    public void testRegularExpression() {
        final String fieldName = "amount_income";
        final String sqlStatement = "amount_expense_base - amount_income + alfa";
        final String patternTemplate = "(^%s[^\\w])|([^\\w]%s[^\\w])|([^\\w]%s$)";
        final String pattern = String.format(patternTemplate, fieldName, fieldName, fieldName);
        final Pattern regEx = Pattern.compile(pattern);
        final Matcher matcher = regEx.matcher(sqlStatement);
        assertEquals(true, matcher.find());
        assertEquals(0, matcher.groupCount());

    }

    /**
     * Test for generateSampleData method.
     */
    public void testGenerateSampleData() {
        final String metricName = "fin_RealEstateOpEx";
        final String collectGroupBy = "bu_id;bl_id";

        final MetricsService service = new MetricsService();
        service.generateSampleData(metricName, collectGroupBy, 100);
        SqlUtils.commit();
    }

    /**
     * Teste method for metric maintenance job.
     *
     */
    public void testRunMaintenanceJob() {
        final MetricsService service = new MetricsService();
        service.runMaintenanceJob();
    }

    public void testArchiveMetric() {
        final String metricName = "fin_RealEstateOpEx";
        final int days = 50;

        final MetricsServiceHelper serviceHelper = new MetricsServiceHelper();
        serviceHelper.archiveMetricValues(metricName, days);
    }

    /**
     * Get current date without time.
     *
     * @return date object
     */
    private Date getCurrentDate() {
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 0);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        return calendar.getTime();
    }

    @Override
    protected String[] getConfigLocations() {
        return new String[] { "context\\core\\core-infrastructure.xml", "appContext-test.xml",
                "metricBeans.xml" };
    }
}
