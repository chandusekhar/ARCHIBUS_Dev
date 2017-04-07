package com.archibus.app.solution.common.webservice.logicexample;

/**
 * Web service example that calls an event-handler method.
 *
 * @author Sergey Kuramshin
 */
import java.util.Date;

import javax.jws.WebService;

import com.archibus.app.solution.logiccookbook.LogicExampleHandlers;
import com.archibus.context.*;
import com.archibus.datasource.data.*;

/**
 * Web service example that calls event-handler methods.
 * <p>
 * The service bean implements methods defined in the service interface (LogicExampleService).
 * 
 * @author Sergey Kuramshin
 */
@WebService(endpointInterface = "com.archibus.app.solution.common.webservice.logicexample.LogicExampleService")
public class LogicExampleServiceImpl implements LogicExampleService {

    /** {@inheritDoc} */
    public DataRecord getRecordByPrimaryKey(int woId) {
        LogicExampleHandlers handler = getEventHandler();

        DataRecord record = handler.getRecordByPrimaryKey(woId);
        return record;
    }

    /** {@inheritDoc} */
    public DataSetList getRecordsUsingDateRestriction(Date dateFrom) {
        LogicExampleHandlers handler = getEventHandler();

        DataSetList records = handler.getRecordsUsingDateRestriction(dateFrom);
        return records;
    }

    /**
     * helper method that returns a reference to the event-handler instance loaded by the workflow
     * rule container.
     * 
     * @return
     */
    private LogicExampleHandlers getEventHandler() {
        Context context = ContextStore.get();
        return (LogicExampleHandlers) context.getEventHandler("LogicExamples");
    }
}
