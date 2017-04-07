package com.archibus.app.common.finanal.metrics;

import java.util.*;

import com.archibus.app.common.finanal.impl.AssetType;
import com.archibus.datasource.DataSourceTestBase;

/**
 * Test class for metric provider utils.
 * <p>
 *
 *
 * @author Ioan Draghici
 * @since 23.1
 *
 */
public class MetricProviderUtilsTest extends DataSourceTestBase {

    /**
     * Test method.
     *
     */
    public void getRelatedMetricsTest() {
        final String activityParameterId =
                "AbRPLMStrategicFinancialAnalysis-UpdateTCO-OccupancyCosts";
        final List<String> relatedMetrics =
                ActivityParameterUtils.getValuesFromActivityParameter(activityParameterId);

        assertEquals(false, relatedMetrics.isEmpty());
    }

    public void getAssetTypeRestriction() {
        final List<String> types = new ArrayList<String>();
        types.add(AssetType.BUILDING.toString());
        types.add(AssetType.PROPERTY.toString());
        types.add(AssetType.EQUIPMENT.toString());

        final String restriction =
                MetricProviderUtils.getAssetTypeRestrictionForTable("finanal_params", types);

        assertEquals(true, !restriction.isEmpty());
    }

}
