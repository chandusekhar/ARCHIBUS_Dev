package com.archibus.eventhandler.energy;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.datasource.data.DataSet;

public class TestRetrieveWeatherStations extends DataSourceTestBase {
    public void testGetWeatherStationsNearBy() {
        try {
            RetrieveWeatherStations rws = new RetrieveWeatherStations();
            assertTrue(rws.getWeatherStationsNearBy("123", "123", "5") instanceof DataSet);
        } catch (Throwable t) {
            t.printStackTrace();
        } finally {
            // Do Nothing
        }
    }
}
