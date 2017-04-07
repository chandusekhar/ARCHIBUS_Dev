package com.archibus.eventhandler.energy;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

public class TestPopulateChartData extends DataSourceTestBase {
    public void testRun() {
        try {
            assertTrue(PopulateChartDataService.run());
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testDeleteChartPoints() {
        try {
            PopulateChartDataService.deleteChartPoints();
            String SQL = "SELECT bl_id, value_name, time_period, VALUE, outlier FROM energy_chart_point";
            String[] flds = { "bl_id", "value_name", "time_period", "VALUE", "outlier" };
            List<DataRecord> records = SqlUtils.executeQuery("energy_chart_point", flds, SQL);
            assertEquals(0, records.size());
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testPopulateElectricChartPoints() {
        try {
            PopulateChartDataService.populateElectricChartPoints();
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testPopulateGasChartPoints() {
        try {
            PopulateChartDataService.populateGasChartPoints();
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testPopulateRegressionChartConsumption() {
        try {
            PopulateChartDataService.populateRegressionChartConsumption();
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testPopulateRegressionChartDemand() {
        try {
            PopulateChartDataService.populateRegressionChartDemand();
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }

    public void testPopulateRegressionChartOat() {
        try {
            PopulateChartDataService.populateRegressionChartOat();
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }
}
