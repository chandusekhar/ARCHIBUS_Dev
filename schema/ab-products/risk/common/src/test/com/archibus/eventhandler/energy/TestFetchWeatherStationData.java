package com.archibus.eventhandler.energy;

import com.archibus.datasource.DataSourceTestBase;

public class TestFetchWeatherStationData extends DataSourceTestBase {
    public void testGetWeatherStationData() {
        try {
            FetchWeatherStationData WeatherStationData = new FetchWeatherStationData();
            WeatherStationData.getWeatherStationData();
        } catch (Throwable t) {
            t.printStackTrace();
            fail();
        } finally {
            releaseTestContext(this.c);
        }
    }
}
