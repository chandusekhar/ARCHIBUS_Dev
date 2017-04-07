package com.archibus.service.common;

import java.util.*;

import org.json.JSONObject;

import com.archibus.datasource.data.DataRecord;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * Statistic data service. Provides workflow rules for statistic data.
 * 
 * 
 * @author Ioan Draghici
 * @since 20.1
 * 
 */
public class StatisticDataService {
    
    /**
     * Calculate and return statistic data records for: minimum, maximum, average and totals.
     * Records number is also included if is required.
     * 
     * @param context event handler context
     */
    public void getStatisticDataRecords(final EventHandlerContext context) {
        
        // get statistic data record.
        final StatisticDataHelper statisticDataHelper = new StatisticDataHelper();
        final Map<String, DataRecord> statisticData =
                statisticDataHelper.getStatisticDataRecord(context);
        
        final JSONObject data = new JSONObject();
        // add records to JSON object
        final Iterator<String> keys = statisticData.keySet().iterator();
        while (keys.hasNext()) {
            final String key = keys.next();
            final DataRecord record = statisticData.get(key);
            data.put(key, record.toJSON());
        }
        // add JSON object to context
        context.addResponseParameter("jsonExpression", data.toString());
    }
    
}
