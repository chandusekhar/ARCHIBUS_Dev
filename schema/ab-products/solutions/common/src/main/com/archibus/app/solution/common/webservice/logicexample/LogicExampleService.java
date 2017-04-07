package com.archibus.app.solution.common.webservice.logicexample;

import java.util.Date;

import javax.jws.WebService;

import com.archibus.datasource.data.*;

/**
 * Web service example that calls event-handler methods.
 * <p>
 * The service interface defines operations that can be invoked by web service clients.
 * 
 * @author Sergey Kuramshin
 */
@WebService
public interface LogicExampleService {

    /**
     * Finds and returns a record specified by its primary key value.
     *
     * @param woId Primary key value in the "wo" table.
     * @return DataRecord, or null if no record exists for specified primary key.
     */
    DataRecord getRecordByPrimaryKey(int woId);

    /**
     * Returns all records that match specified date restriction.
     *
     * @param dateFrom records should have date_assigned >= this date.
     * @return List<DataRecord>, empty if there are no such records.
     */
    DataSetList getRecordsUsingDateRestriction(Date dateFrom);
}
