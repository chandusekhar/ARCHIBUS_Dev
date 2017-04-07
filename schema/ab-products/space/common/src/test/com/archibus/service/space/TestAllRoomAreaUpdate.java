package com.archibus.service.space;

import com.archibus.datasource.DataSourceTestBase;

public class TestAllRoomAreaUpdate extends DataSourceTestBase {

    public void testCalculateOccupiable() {
        AllRoomAreaUpdate.calculateOccupiable();
    }

    public void testCalculateNonoccupiable() {
        AllRoomAreaUpdate.calculateNonoccupiable();
    }
}
