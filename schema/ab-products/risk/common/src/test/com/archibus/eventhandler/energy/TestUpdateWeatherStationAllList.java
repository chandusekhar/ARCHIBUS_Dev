package com.archibus.eventhandler.energy;

import com.archibus.datasource.DataSourceTestBase;

public class TestUpdateWeatherStationAllList extends DataSourceTestBase {
    public void testGetWeatherStationAllData() {
        try {
            UpdateWeatherStationAllList WeatherStationAllList = new UpdateWeatherStationAllList();
            WeatherStationAllList.populateWeatherStationList();
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }
}
