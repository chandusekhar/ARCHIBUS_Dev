package com.archibus.eventhandler.sla;

import java.text.ParseException;
import java.util.*;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.utility.*;

/**
 *
 * Service Level Agreements Tools.
 */
public final class ServiceLevelAgreementTools {

    /**
     * SERVICE DESK - MAINTENANCE.
     */
    private static final String SERVICE_DESK_MAINTENANCE = "SERVICE DESK - MAINTENANCE";

    /**
     * Filter Restriction parameter name.
     */
    private static final String FILTER_RES = "filterRes";

    /**
     * Multiple Priorities.
     */
    private static final String MULTIPLE_PRIORITIES = "Multiple Priorities";

    /**
     * grouping field.
     */
    private static final String GROUPING = "grouping";

    /**
     * right bracket.
     */
    private static final String RIGHT_BRACKET = "]";

    /**
     * left bracket.
     */
    private static final String LFET_BRACKET = "[";

    /**
     * request DataSource name.
     */
    private static final String SLA_RQUEST_DS = "slaRquestDS";

    /**
     * Response DataSource name.
     */
    private static final String SLA_RESPONSE_DS = "slaResponseDS";

    /**
     * Steps DataSource name.
     */
    private static final String SLA_WORKFLOW_STEPS_DS = "slaWorkflowStepsDS";

    /**
     * DataSource axvw file.
     */
    private static final String DS_FILE = "ab-sla-find-groupings-ds.axvw";

    /**
     * Dot.
     */
    private static final String DOT = ".";

    /**
     * helpdesk_sla_request table.
     */
    private static final String HELPDESK_SLA_REQUEST = "helpdesk_sla_request";

    /**
     * helpdesk_sla_response table.
     */
    private static final String HELPDESK_SLA_RESPONSE = "helpdesk_sla_response";

    /**
     * helpdesk_sla_steps table.
     */
    private static final String HELPDESK_SLA_STEPS = "helpdesk_sla_steps";

    /**
     * ordering_seq field.
     */
    private static final String ORDERING_SEQ = "ordering_seq";

    /**
     * site_id field.
     */
    private static final String SITE_ID = "site_id";

    /**
     * bl_id field.
     */
    private static final String BL_ID = "bl_id";

    /**
     * fl_id field.
     */
    private static final String FL_ID = "fl_id";

    /**
     * rm_id field.
     */
    private static final String RM_ID = "rm_id";

    /**
     * requestor field.
     */
    private static final String REQUESTOR = "requestor";

    /**
     * em_std field.
     */
    private static final String EM_STD = "em_std";

    /**
     * dv_id field.
     */
    private static final String DV_ID = "dv_id";

    /**
     * dp_id field.
     */
    private static final String DP_ID = "dp_id";

    /**
     * prob_type field.
     */
    private static final String PROB_TYPE = "prob_type";

    /**
     * eq_std field.
     */
    private static final String EQ_STD = "eq_std";

    /**
     * eq_id field.
     */
    private static final String EQ_ID = "eq_id";

    /**
     * pmp_id field.
     */
    private static final String PMP_ID = "pmp_id";

    /**
     * default_priority field.
     */
    private static final String DEFAULT_PRIORITY = "default_priority";

    /**
     * activity_type field.
     */
    private static final String ACTIVITY_TYPE = "activity_type";

    /**
     * priority field.
     */
    private static final String PRIORITY = "priority";

    /**
     * manager field.
     */
    private static final String MANAGER = "manager";

    /**
     * dispatcher field.
     */
    private static final String DISPATCHER = "dispatcher";

    /**
     * supervisor field.
     */
    private static final String SUPERVISOR = "supervisor";

    /**
     * cf_id field.
     */
    private static final String CF_ID = "cf_id";

    /**
     * work_team_id field.
     */
    private static final String WORK_TEAM_ID = "work_team_id";

    /**
     * notify_service_provider field.
     */
    private static final String NOTIFY_SERVICE_PROVIDER = "notify_service_provider";

    /**
     * notify_requestor field.
     */
    private static final String NOTIFY_REQUESTOR = "notify_requestor";

    /**
     * notify_craftsperson field.
     */
    private static final String NOTIFY_CRAFTSPERSON = "notify_craftsperson";

    /**
     * default_duration field.
     */
    private static final String DEFAULT_DURATION = "default_duration";

    /**
     * autoschedule field.
     */
    private static final String AUTOSCHEDULE = "autoschedule";

    /**
     * autoissue field.
     */
    private static final String AUTOISSUE = "autoissue";

    /**
     * autodispatch field.
     */
    private static final String AUTODISPATCH = "autodispatch";

    /**
     * autocreate_wr field.
     */
    private static final String AUTOCREATE_WR = "autocreate_wr";

    /**
     * autocreate_wo field.
     */
    private static final String AUTOCREATE_WO = "autocreate_wo";

    /**
     * autoapprove field.
     */
    private static final String AUTOAPPROVE = "autoapprove";

    /**
     * autoaccept field.
     */
    private static final String AUTOACCEPT = "autoaccept";

    /**
     * servcont_id field.
     */
    private static final String SERVCONT_ID = "servcont_id";

    /**
     * time_to_respond field.
     */
    private static final String TIME_TO_RESPOND = "time_to_respond";

    /**
     * time_to_complete field.
     */
    private static final String TIME_TO_COMPLETE = "time_to_complete";

    /**
     * serv_window_start field.
     */
    private static final String SERV_WINDOW_START = "serv_window_start";

    /**
     * serv_window_end field.
     */
    private static final String SERV_WINDOW_END = "serv_window_end";

    /**
     * serv_window_days field.
     */
    private static final String SERV_WINDOW_DAYS = "serv_window_days";

    /**
     * interval_to_respond field.
     */
    private static final String INTERVAL_TO_RESPOND = "interval_to_respond";

    /**
     * interval_to_complete field.
     */
    private static final String INTERVAL_TO_COMPLETE = "interval_to_complete";

    /**
     * allow_work_on_holidays field.
     */
    private static final String ALLOW_WORK_ON_HOLIDAYS = "allow_work_on_holidays";

    /**
     * schedule_immediately field.
     */
    private static final String SCHEDULE_IMMEDIATELY = "schedule_immediately";

    /**
     * status field.
     */
    private static final String STATUS = "status";

    /**
     * step_order field.
     */
    private static final String STEP_ORDER = "step_order";

    /**
     * step field.
     */
    private static final String STEP = "step";

    /**
     * em_id field.
     */
    private static final String EM_ID = "em_id";

    /**
     * vn_id field.
     */
    private static final String VN_ID = "vn_id";

    /**
     * step_type field.
     */
    private static final String STEP_TYPE = "step_type";

    /**
     * step_status field.
     */
    private static final String STEP_STATUS = "step_status";

    /**
     * role field.
     */
    private static final String ROLE = "role";

    /**
     * notify_responsible field.
     */
    private static final String NOTIFY_RESPONSIBLE = "notify_responsible";

    /**
     * multiple_required field.
     */
    private static final String MULTIPLE_REQUIRED = "multiple_required";

    /**
     * condition field.
     */
    private static final String CONDITION = "condition";

    /**
     * NULL string.
     */
    private static final String NULL = "NULL";

    /**
     * comma string.
     */
    private static final String COMMA = ",";

    /**
     * targetPage PARAMETER.
     */
    private static final String TARGET_PAGE_PARAMETER = "targetPage";

    /**
     * RECORD LIMIT PARAMETER.
     */
    private static final String RECORD_LIMIT_PARAMETER = "recordLimit";

    /**
     * Default record limit.
     */
    private static final int DEFAULT_RECORD_LIMIT = 100;

    /**
     * Max combination length.
     */
    private static final int MAX_COMBINATION_LENGTH = 10000;

    /**
     * service_name field.
     */
    private static final String SERVICE_NAME = "service_name";

    /**
     * workflow_name field.
     */
    private static final String WORKFLOW_NAME = "workflow_name";

    /**
     * One.
     */
    private static final String ONE = "1";

    /**
     * ZERO.
     */
    private static final String ZERO = "0";

    /**
     * Constructor method for removing warning: 'Utility classes should not have a public or default
     * constructor'.
     *
     */
    private ServiceLevelAgreementTools() {

    }

    /**
     * This method served as a custom refresh WFR new SLA interface grid.
     *
     * By Guo Jiangtao
     *
     * @param parameters Map<String, Object>
     *
     */
    public static void identifySLAGroups(final Map<String, Object> parameters) {

        int recordLimit = DEFAULT_RECORD_LIMIT;
        if (parameters.get(RECORD_LIMIT_PARAMETER) != null) {
            recordLimit = (Integer) parameters.get(RECORD_LIMIT_PARAMETER);
        }

        final List<DataRecord> requestParaters = new ArrayList<DataRecord>();
        final JSONArray groupingList = getSLAGroupsArray(parameters);

        int targetPage = 1;
        if (parameters.get(TARGET_PAGE_PARAMETER) != null) {
            targetPage = (Integer) parameters.get(TARGET_PAGE_PARAMETER);
        }

        int count = 0;
        for (int i = (targetPage - 1) * recordLimit; i < groupingList.length(); i++) {
            if (count < recordLimit) {
                requestParaters.add(
                    getRequestParametersByOrderingSeqs(groupingList.getJSONArray(i).toString()));
                count++;
            }
        }

        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(requestParaters);

        final JSONObject result = dataSet.toJSON();
        result.put("allCount", groupingList.length());
        ContextStore.get().getEventHandlerContext().addResponseParameter("jsonExpression",
            result.toString());
    }

    /**
     * Get request parameters by ordering sequences group.
     *
     * By Guo Jiangtao
     *
     * @param orderingSeqs grouping code
     * @return Request Parameters record
     */
    public static DataRecord getRequestParametersByOrderingSeqs(final String orderingSeqs) {
        // load the request source form the view
        final DataSource requestDataSource =
                DataSourceFactory.loadDataSourceFromFile(DS_FILE, "slaGroupingListDS");
        // load response data source form the view
        final DataSource responseDataSource =
                DataSourceFactory.loadDataSourceFromFile(DS_FILE, SLA_RESPONSE_DS);

        final List<DataRecord> requestSlaRecords = requestDataSource
            .getRecords("helpdesk_sla_request.ordering_seq IN ("
                    + orderingSeqs.toString().replace(LFET_BRACKET, "").replace(RIGHT_BRACKET, "")
                    + ") ");

        final DataRecord requestParameters = requestDataSource.createRecord();
        // store all the ordering_seq in the group
        requestParameters.setValue("bl.address1", orderingSeqs);
        try {
            requestParameters.setValue(HELPDESK_SLA_REQUEST + DOT + GROUPING,
                new JSONArray(orderingSeqs).getInt(0));
        } catch (final NumberFormatException e) {
            throw new ExceptionBase(null, e);
        } catch (final NoSuchElementException e) {
            throw new ExceptionBase(null, e);
        } catch (final ParseException e) {
            throw new ExceptionBase(null, e);
        }
        requestParameters.setValue(HELPDESK_SLA_REQUEST + DOT + PROB_TYPE,
            getMultipleFieldValues(HELPDESK_SLA_REQUEST + DOT + PROB_TYPE, requestSlaRecords));
        requestParameters.setValue(HELPDESK_SLA_REQUEST + DOT + SITE_ID,
            getMultipleFieldValues(HELPDESK_SLA_REQUEST + DOT + SITE_ID, requestSlaRecords));
        requestParameters.setValue(HELPDESK_SLA_REQUEST + DOT + BL_ID,
            getMultipleFieldValues(HELPDESK_SLA_REQUEST + DOT + BL_ID, requestSlaRecords));
        requestParameters.setValue(HELPDESK_SLA_REQUEST + DOT + FL_ID,
            getMultipleFieldValues(HELPDESK_SLA_REQUEST + DOT + FL_ID, requestSlaRecords));
        requestParameters.setValue(HELPDESK_SLA_REQUEST + DOT + RM_ID,
            getMultipleFieldValues(HELPDESK_SLA_REQUEST + DOT + RM_ID, requestSlaRecords));
        requestParameters.setValue(HELPDESK_SLA_REQUEST + DOT + REQUESTOR,
            getMultipleFieldValues(HELPDESK_SLA_REQUEST + DOT + REQUESTOR, requestSlaRecords));
        requestParameters.setValue(HELPDESK_SLA_REQUEST + DOT + EM_STD,
            getMultipleFieldValues(HELPDESK_SLA_REQUEST + DOT + EM_STD, requestSlaRecords));
        requestParameters.setValue(HELPDESK_SLA_REQUEST + DOT + DV_ID,
            getMultipleFieldValues(HELPDESK_SLA_REQUEST + DOT + DV_ID, requestSlaRecords));
        requestParameters.setValue(HELPDESK_SLA_REQUEST + DOT + DP_ID,
            getMultipleFieldValues(HELPDESK_SLA_REQUEST + DOT + DP_ID, requestSlaRecords));
        requestParameters.setValue(HELPDESK_SLA_REQUEST + DOT + EQ_STD,
            getMultipleFieldValues(HELPDESK_SLA_REQUEST + DOT + EQ_STD, requestSlaRecords));
        requestParameters.setValue(HELPDESK_SLA_REQUEST + DOT + EQ_ID,
            getMultipleFieldValues(HELPDESK_SLA_REQUEST + DOT + EQ_ID, requestSlaRecords));
        requestParameters.setValue(HELPDESK_SLA_REQUEST + DOT + PMP_ID,
            getMultipleFieldValues(HELPDESK_SLA_REQUEST + DOT + PMP_ID, requestSlaRecords));
        requestParameters.setValue(HELPDESK_SLA_REQUEST + DOT + DEFAULT_PRIORITY,
            requestSlaRecords.get(0).getInt(HELPDESK_SLA_REQUEST + DOT + DEFAULT_PRIORITY));

        final int order =
                requestSlaRecords.get(0).getInt(HELPDESK_SLA_REQUEST + DOT + ORDERING_SEQ);
        final List<DataRecord> responseSlaRecords = responseDataSource.getRecords(
            "helpdesk_sla_response.activity_type ='SERVICE DESK - MAINTENANCE' AND helpdesk_sla_response.ordering_seq= "
                    + order);
        if (responseSlaRecords.size() > 1) {
            requestParameters.setValue(HELPDESK_SLA_RESPONSE + DOT + SERVICE_NAME,
                MULTIPLE_PRIORITIES);
            requestParameters.setValue(HELPDESK_SLA_RESPONSE + DOT + WORKFLOW_NAME,
                MULTIPLE_PRIORITIES);
        } else if (responseSlaRecords.size() == 1) {
            requestParameters.setValue(HELPDESK_SLA_RESPONSE + DOT + WORKFLOW_NAME,
                responseSlaRecords.get(0).getString(HELPDESK_SLA_RESPONSE + DOT + WORKFLOW_NAME));
            requestParameters.setValue(HELPDESK_SLA_RESPONSE + DOT + SERVICE_NAME,
                responseSlaRecords.get(0).getString(HELPDESK_SLA_RESPONSE + DOT + SERVICE_NAME));
        }

        return requestParameters;

    }

    /**
     * Get multiple field values from records.
     *
     * By Guo Jiangtao
     *
     * @param fieldName field name
     * @param records records from database
     * @return multiple field value
     */
    private static String getMultipleFieldValues(final String fieldName,
            final List<DataRecord> records) {
        final String separator = ", \u200C";
        String fieldValues = "";
        for (final DataRecord record : records) {
            final String fieldValue = record.getString(fieldName);
            if (StringUtil.notNullOrEmpty(fieldValue) && (fieldValues + separator)
                .indexOf(separator + fieldValue + separator) == -1) {
                fieldValues += separator + fieldValue;
            }
        }

        if (StringUtil.notNullOrEmpty(fieldValues)) {
            fieldValues = fieldValues.substring(separator.length());
        }

        return fieldValues;
    }

    /**
     * Get SLA group json array.
     *
     * By Guo Jiangtao
     *
     * @param parameters Map<String, Object>
     * @return return the group array
     */
    private static JSONArray getSLAGroupsArray(final Map<String, Object> parameters) {

        // load the response data source form the view
        final DataSource requestDataSource =
                DataSourceFactory.loadDataSourceFromFile(DS_FILE, SLA_RQUEST_DS);

        // load the response data source form the view
        final DataSource responseDataSource =
                DataSourceFactory.loadDataSourceFromFile(DS_FILE, SLA_RESPONSE_DS);

        // load the workflow steps data source form the view
        final DataSource workflowStepsDataSource =
                DataSourceFactory.loadDataSourceFromFile(DS_FILE, SLA_WORKFLOW_STEPS_DS);

        // GET all records of helpdesk_sla_request, helpdesk_sla_response, helpdesk_sla_steps of On
        // Demand
        List<DataRecord> requestRecordList = requestDataSource.getAllRecords();
        List<DataRecord> responseRecordList = responseDataSource.getAllRecords();
        List<DataRecord> responseStepsRecordList = workflowStepsDataSource.getAllRecords();

        // Put helpdesk_sla_request record to map with key ordering_seq to make it easier to look up
        // record by ordering_seq
        final Map<Integer, DataRecord> requestRecordMap = new HashMap<Integer, DataRecord>();

        // Translate related helpdesk_sla_response, helpdesk_sla_steps of given ordering_seq to
        // String to make it easier to compare, we may group helpdesk_sla_request records if they
        // have same response string, so for below map, the key is response string, and value is all
        // ordering_seq with same response string, format like "1,2,3", which means ordering_seq 1,2
        // ,3 have the same response parameters
        Map<String, String> responseStringMap = new HashMap<String, String>();

        // for each helpdesk_sla_request record, get the response string, and concat all
        // ordering_seq together, format like "1,2,3"
        for (int i = requestRecordList.size() - 1; i > -1; i--) {

            final DataRecord requestRecord = requestRecordList.get(i);

            // Put helpdesk_sla_request record to map with key ordering_seq to make it easier to
            // look up record by ordering_seq
            requestRecordMap.put(requestRecord.getInt(HELPDESK_SLA_REQUEST + DOT + ORDERING_SEQ),
                requestRecord);

            // get the response string of given helpdesk_sla_request record
            final String responseString =
                    getResponseString(requestRecord, responseRecordList, responseStepsRecordList);

            // concat all ordering_seq with same response string together, format like "1,2,3"
            if (responseStringMap.get(responseString) != null) {
                responseStringMap.put(responseString, responseStringMap.get(responseString) + COMMA
                        + getOrderSeqString(requestRecord) + "");
            } else {
                responseStringMap.put(responseString, getOrderSeqString(requestRecord) + "");
            }
        }

        requestRecordList = null;
        responseRecordList = null;
        responseStepsRecordList = null;

        Map<Integer, Integer> filteredRequestRecordPrimaryKeyMap = new HashMap<Integer, Integer>();

        if (StringUtil.notNullOrEmpty(parameters.get(FILTER_RES))) {
            filteredRequestRecordPrimaryKeyMap =
                    getFilteredRequestRecordPrimaryKeyMap(requestDataSource, parameters);
            responseStringMap =
                    filterResponseStringMap(filteredRequestRecordPrimaryKeyMap, responseStringMap);
        }

        JSONArray groupings =
                getGroupingsFromResponseStringMap(requestRecordMap, responseStringMap);
        if (StringUtil.notNullOrEmpty(parameters.get(FILTER_RES))) {
            groupings = filterGroupings(filteredRequestRecordPrimaryKeyMap, groupings);
        }

        return groupings;

    }

    /**
     * filter response string Map.
     *
     * @param filteredRequestRecordPrimaryKeyMap filteredRequestRecordPrimaryKeyMap
     * @param responseStringMap responseStringMap
     * @return filtered response string Map
     */
    private static Map<String, String> filterResponseStringMap(
            final Map<Integer, Integer> filteredRequestRecordPrimaryKeyMap,
            final Map<String, String> responseStringMap) {
        final Map<String, String> newResponseStringMap = new HashMap<String, String>();
        for (final Map.Entry<String, String> orderingSeqsEntry : responseStringMap.entrySet()) {
            final String orderingSeqsString = orderingSeqsEntry.getValue();
            if (orderingSeqsString.indexOf(COMMA) != -1) {
                boolean matchFilter = false;
                final Vector<String> orderingSeqs =
                        new Vector<String>(Arrays.asList(orderingSeqsString.split(COMMA)));

                for (final String orderingSeq : orderingSeqs) {
                    if (!matchFilter) {
                        final int orderSeq = Integer.valueOf(orderingSeq);
                        matchFilter = isMatchFilter(filteredRequestRecordPrimaryKeyMap, orderSeq);
                    } else {
                        break;
                    }
                }

                if (matchFilter) {
                    newResponseStringMap.put(orderingSeqsEntry.getKey(),
                        orderingSeqsEntry.getValue());
                }
            }
        }

        return newResponseStringMap;

    }

    /**
     * filter groupings.
     *
     * @param filteredRequestRecordPrimaryKeyMap filteredRequestRecordPrimaryKeyMap
     * @param groupings groupings
     * @return filtered grouping
     */
    private static JSONArray filterGroupings(
            final Map<Integer, Integer> filteredRequestRecordPrimaryKeyMap,
            final JSONArray groupings) {

        final JSONArray filterGroupings = new JSONArray();
        if (!filteredRequestRecordPrimaryKeyMap.isEmpty()) {

            for (int i = 0; i < groupings.length(); i++) {
                boolean matchFilter = false;
                final JSONArray grouping = groupings.getJSONArray(i);
                for (int j = 0; j < grouping.length(); j++) {
                    if (!matchFilter) {
                        final int orderSeq = grouping.getInt(j);
                        matchFilter = isMatchFilter(filteredRequestRecordPrimaryKeyMap, orderSeq);
                    } else {
                        break;
                    }
                }

                if (matchFilter) {
                    filterGroupings.put(grouping);
                }

            }
        }

        return filterGroupings;

    }

    /**
     * filter groupings.
     *
     * @param requestDataSource requestDataSource
     * @param parameters parameters
     * @return filteredRequestRecordPrimaryKeyMap
     */
    private static Map<Integer, Integer> getFilteredRequestRecordPrimaryKeyMap(
            final DataSource requestDataSource, final Map<String, Object> parameters) {

        // initialize the data source
        requestDataSource.setContext();

        // apply grid parameters to the data source
        if (parameters != null) {
            // query all data go get all grouping code
            parameters.put(RECORD_LIMIT_PARAMETER, -1);
            requestDataSource.setParameter("requestFilterRes", parameters.get(FILTER_RES));
        }

        List<DataRecord> filteredRequestRecordList = requestDataSource.getRecords();
        final Map<Integer, Integer> filteredRequestRecordPrimaryKeyMap =
                new HashMap<Integer, Integer>();
        for (final DataRecord record : filteredRequestRecordList) {
            filteredRequestRecordPrimaryKeyMap.put(
                record.getInt(HELPDESK_SLA_REQUEST + DOT + ORDERING_SEQ),
                record.getInt(HELPDESK_SLA_REQUEST + DOT + ORDERING_SEQ));
        }

        // release memory
        filteredRequestRecordList = null;

        return filteredRequestRecordPrimaryKeyMap;

    }

    /**
     * is ordering sequence match filter.
     *
     * @param filteredRequestRecordPrimaryKeyMap filteredRequestRecordPrimaryKeyMap
     * @param orderSeq orderSeq
     * @return match result
     */
    private static boolean isMatchFilter(
            final Map<Integer, Integer> filteredRequestRecordPrimaryKeyMap, final int orderSeq) {
        boolean matchFilter = false;
        for (final Integer pk : filteredRequestRecordPrimaryKeyMap.keySet()) {
            if (pk == orderSeq) {
                matchFilter = true;
                break;
            }
        }
        return matchFilter;
    }

    /**
     * get groupings from response string map.
     *
     * @param requestRecordMap requestRecordMap
     * @param responseStringMap responseStringMap
     * @return groupings
     */
    private static JSONArray getGroupingsFromResponseStringMap(
            final Map<Integer, DataRecord> requestRecordMap,
            final Map<String, String> responseStringMap) {
        // the array return to the client is grouping list, every group with format like
        // '1,2,3', which means helpdesk_sla_request with ordering_seq 1, 2, 3 can group
        // together
        final JSONArray returnGroupsJson = new JSONArray();

        // for the same response string, they may have several ordering_seq, but only
        // helpdesk_sla_request records with one field value different and the other fields are same
        // can group together. so, call getRealGroupsFromPossibleOrder() to pick them out and add
        // them to response json array
        for (final Map.Entry<String, String> possibleGroup : responseStringMap.entrySet()) {
            final String possibleOrderSeqs = possibleGroup.getValue();
            if (possibleOrderSeqs.indexOf(COMMA) != -1) {

                final HashSet<String> selectedOrderSeqs = new HashSet<String>();

                final Vector<String> possibleOrderSeqsVector =
                        new Vector<String>(Arrays.asList(possibleOrderSeqs.split(COMMA)));

                final int totalSize = possibleOrderSeqsVector.size();
                for (int i = totalSize; i >= 1; i--) {
                    // remove the selected order seqs to improve performance
                    for (final String item : selectedOrderSeqs) {
                        possibleOrderSeqsVector.remove(item);
                    }

                    Vector<Vector<String>> combinations = new Vector<Vector<String>>();

                    if (i == possibleOrderSeqsVector.size()) {
                        combinations.add(possibleOrderSeqsVector);
                    } else {
                        if (possibleOrderSeqsVector.size() > 1
                                && possibleOrderSeqsVector.size() > i) {
                            combinations = combine(possibleOrderSeqsVector, i);
                        }
                    }

                    if (combinations.size() < MAX_COMBINATION_LENGTH) {
                        getGroupsFromCombinations(requestRecordMap, returnGroupsJson,
                            selectedOrderSeqs, combinations);
                    } else {
                        getGroupsByField(returnGroupsJson, possibleOrderSeqsVector,
                            requestRecordMap);
                        break;

                    }

                }

            }
        }
        return returnGroupsJson;
    }

    /**
     * get groups from combinations.
     *
     * @param requestRecordMap requestRecordMap
     * @param returnGroupsJson returnGroupsJson
     * @param selectedOrderSeqs selectedOrderSeqs
     * @param combinations combinations
     */
    private static void getGroupsFromCombinations(final Map<Integer, DataRecord> requestRecordMap,
            final JSONArray returnGroupsJson, final HashSet<String> selectedOrderSeqs,
            final Vector<Vector<String>> combinations) {

        for (int index = combinations.size() - 1; index > -1; index--) {
            final Vector<String> combination = combinations.elementAt(index);
            if (isGivenCombinationCanGroup(combination, requestRecordMap, selectedOrderSeqs)) {
                try {
                    returnGroupsJson.put(new JSONArray(combination.toString()));
                } catch (final ParseException e) {
                    throw new ExceptionBase(null, e);
                }
            }
        }

    }

    /**
     * Get Groups ByField.
     *
     * @param returnGroupsJson returnGroupsJson
     * @param possibleOrderSeqs possibleOrderSeqs
     * @param requestRecordMap requestRecordMap
     */
    private static void getGroupsByField(final JSONArray returnGroupsJson,
            final Vector<String> possibleOrderSeqs,
            final Map<Integer, DataRecord> requestRecordMap) {

        final String[] requestFields = { SITE_ID, BL_ID, FL_ID, RM_ID, REQUESTOR, EM_STD, DV_ID,
                DP_ID, PROB_TYPE, EQ_STD, EQ_ID, PMP_ID };

        final HashSet<String> possibleGroups = new HashSet<String>();
        final HashSet<String> selectedOrderSeqs = new HashSet<String>();

        // compare field one by one to pick out records that only have one field different and other
        // field value are same.
        for (final String field : requestFields) {
            for (final String possibleOrderSeq1 : possibleOrderSeqs) {
                selectGroupByField(possibleOrderSeqs, requestRecordMap, possibleGroups,
                    selectedOrderSeqs, field, possibleOrderSeq1);
            }

            // remove the selected order seqs to improve performance
            for (final String item : selectedOrderSeqs) {
                possibleOrderSeqs.remove(item);
            }

        }

        for (final String group : possibleGroups) {

            final Vector<String> combination =
                    new Vector<String>(Arrays.asList(group.replace(" ", "")
                        .replace(LFET_BRACKET, "").replace(RIGHT_BRACKET, "").split(COMMA)));

            if (!havingSameGroupingCode(combination, requestRecordMap)) {
                try {
                    returnGroupsJson.put(new JSONArray(group));
                } catch (final ParseException e) {
                    throw new ExceptionBase(null, e);
                }
            }

        }

    }

    /**
     * Select Group By Field.
     *
     * @param possibleOrderSeqs possibleOrderSeqs
     * @param requestRecordMap requestRecordMap
     * @param possibleGroups possibleGroups
     * @param selectedOrderSeqs selectedOrderSeqs
     * @param field field
     * @param possibleOrderSeq1 possibleOrderSeq1
     */
    private static void selectGroupByField(final Vector<String> possibleOrderSeqs,
            final Map<Integer, DataRecord> requestRecordMap, final HashSet<String> possibleGroups,
            final HashSet<String> selectedOrderSeqs, final String field,
            final String possibleOrderSeq1) {
        final Vector<String> combination = new Vector<String>();
        for (final String possibleOrderSeq2 : possibleOrderSeqs) {
            if (possibleOrderSeq1.equals(possibleOrderSeq2) || isOnlyGivenFieldDifferent(
                possibleOrderSeq1, possibleOrderSeq2, field, requestRecordMap)) {
                combination.add(possibleOrderSeq2);
            }
        }

        if (combination.size() > 1) {
            possibleGroups.add(combination.toString());
            for (final String item : combination) {
                selectedOrderSeqs.add(item);
            }
        }
    }

    /**
     * Judge is only given field different.
     *
     * @param possibleValue1 possibleValue1
     * @param possibleValue2 possibleValue2
     * @param field field
     * @param requestRecordMap requestRecordMap
     * @return is different
     */
    private static boolean isOnlyGivenFieldDifferent(final String possibleValue1,
            final String possibleValue2, final String field,
            final Map<Integer, DataRecord> requestRecordMap) {

        boolean isOnlyGivenFieldDifferent = true;

        final String[] requestFields = { SITE_ID, BL_ID, FL_ID, RM_ID, REQUESTOR, EM_STD, DV_ID,
                DP_ID, PROB_TYPE, EQ_STD, EQ_ID, PMP_ID };

        final DataRecord possibleRecord1 = requestRecordMap.get(Integer.valueOf(possibleValue1));
        final DataRecord possibleRecord2 = requestRecordMap.get(Integer.valueOf(possibleValue2));

        for (final String fieldName : requestFields) {
            if (!(SITE_ID.equals(fieldName) && BL_ID.equals(field))) {
                final String value1 =
                        possibleRecord1.getString(HELPDESK_SLA_REQUEST + DOT + fieldName);
                final String value2 =
                        possibleRecord2.getString(HELPDESK_SLA_REQUEST + DOT + fieldName);
                isOnlyGivenFieldDifferent = compareFiledValue(field, fieldName, value1, value2);
                if (!isOnlyGivenFieldDifferent) {
                    break;
                }
            }

        }

        return isOnlyGivenFieldDifferent;
    }

    /**
     * compare filed value.
     *
     * @param field field
     * @param fieldName fieldName
     * @param value1 value1
     * @param value2 value2
     * @return is different
     */
    private static boolean compareFiledValue(final String field, final String fieldName,
            final String value1, final String value2) {
        boolean isValid = true;

        if (fieldName.equals(field)) {
            isValid = !isFieldValueSame(value1, value2);
        } else {
            isValid = !isFieldValueDifferent(value1, value2);
        }
        return isValid;
    }

    /**
     * Judge is field value different.
     *
     * @param value1 value1
     * @param value2 value2
     * @return is different
     */
    private static boolean isFieldValueDifferent(final String value1, final String value2) {
        boolean isDifferent = false;

        final boolean onlyOneIsNull =
                (value1 == null && value2 != null) || (value1 != null && value2 == null);
        final boolean bothNotNullButValueDifferent =
                value1 != null && value2 != null && !value1.equals(value2);

        if (onlyOneIsNull || bothNotNullButValueDifferent) {
            isDifferent = true;
        }
        return isDifferent;
    }

    /**
     * Judge Is field value same.
     *
     * @param value1 value1
     * @param value2 value2
     * @return is same
     */
    private static boolean isFieldValueSame(final String value1, final String value2) {
        boolean isSame = false;
        final boolean bothNull = value1 == null && value2 == null;
        final boolean bothNotNullButValueSame =
                value1 != null && value2 != null && value1.equals(value2);
        if (bothNull || bothNotNullButValueSame) {
            isSame = true;
        }
        return isSame;
    }

    /**
     * Judge the given ordering sequence having same grouping code.
     *
     * @param possibleOrderSeqsVector possibleOrderSeqsVector
     * @param requestRecordMap requestRecordMap
     * @return true if having same grouping code
     */
    private static boolean havingSameGroupingCode(final Vector<String> possibleOrderSeqsVector,
            final Map<Integer, DataRecord> requestRecordMap) {

        boolean havingSameGroupingCode = true;
        final int groupingCode =
                requestRecordMap.get(Integer.valueOf(possibleOrderSeqsVector.get(0)))
                    .getInt(HELPDESK_SLA_REQUEST + DOT + GROUPING);

        for (final String orderingSeq : possibleOrderSeqsVector) {
            if (!(requestRecordMap.get(Integer.valueOf(orderingSeq))
                .getInt(HELPDESK_SLA_REQUEST + DOT + GROUPING) == groupingCode)
                    || groupingCode == 0) {
                havingSameGroupingCode = false;
                break;
            }
        }

        return havingSameGroupingCode;
    }

    /**
     * Check combination can be grouped or not.
     *
     * @param combination combination
     * @param requestRecordMap requestRecordMap
     * @param selectedOrderSeqs selectedOrderSeqs
     * @return true can be grouped, false cannot be grouped
     */
    private static boolean isGivenCombinationCanGroup(final Vector<String> combination,
            final Map<Integer, DataRecord> requestRecordMap,
            final HashSet<String> selectedOrderSeqs) {
        boolean canGroup = false;
        final String[] requestFields = { SITE_ID, BL_ID, FL_ID, RM_ID, REQUESTOR, EM_STD, DV_ID,
                DP_ID, PROB_TYPE, EQ_STD, EQ_ID, PMP_ID };

        int size = 1;
        if (combination.size() > 1
                && isCombinationNotInSelectedOrderSeqs(combination, selectedOrderSeqs)) {
            for (final String field : requestFields) {
                size = getCombinationSizeByField(combination, requestRecordMap, size, field);

            }
        }

        if (combination.size() > 1 && size == combination.size()) {
            canGroup = true;
            for (final String item : combination) {
                selectedOrderSeqs.add(item);
            }

        }

        if (canGroup) {
            canGroup = !havingSameGroupingCode(combination, requestRecordMap);
        }

        return canGroup;
    }

    /**
     * get combination size by field.
     *
     * @param combination combination
     * @param requestRecordMap requestRecordMap
     * @param size size
     * @param field field
     * @return combination size
     */
    private static int getCombinationSizeByField(final Vector<String> combination,
            final Map<Integer, DataRecord> requestRecordMap, final int size, final String field) {

        int combinationSize = size;
        final HashSet<String> fieldValues = new HashSet<String>();
        for (final String orderSeq : combination) {
            final DataRecord record = requestRecordMap.get(Integer.valueOf(orderSeq));

            if (SITE_ID.equals(field)
                    && record.getString(HELPDESK_SLA_REQUEST + DOT + BL_ID) != null) {
                break;
            }

            if (record.getString(HELPDESK_SLA_REQUEST + DOT + field) == null
                    || "".equals(record.getString(HELPDESK_SLA_REQUEST + DOT + field))) {
                break;
            } else {
                fieldValues.add(record.getString(HELPDESK_SLA_REQUEST + DOT + field));
            }
        }

        if (fieldValues.size() > 0) {
            combinationSize = size * fieldValues.size();
        }

        return combinationSize;
    }

    /**
     * Check is combination not in selected order seqs.
     *
     * @param combination combination
     * @param selectedOrderSeqs selectedOrderSeqs
     * @return RESULT
     */
    private static boolean isCombinationNotInSelectedOrderSeqs(final Vector<String> combination,
            final HashSet<String> selectedOrderSeqs) {
        boolean isNotInSelectedOrderSeqs = true;
        for (final String item : combination) {
            if (selectedOrderSeqs.contains(item)) {
                isNotInSelectedOrderSeqs = false;
                break;
            }
        }

        return isNotInSelectedOrderSeqs;
    }

    /**
     * get response string.
     *
     * @param requestRecord requestRecord
     * @param responseRecordList responseRecordList
     * @param responseStepsRecordList responseStepsRecordList
     * @return response string
     */
    private static String getResponseString(final DataRecord requestRecord,
            final List<DataRecord> responseRecordList,
            final List<DataRecord> responseStepsRecordList) {

        // count the priority
        final int priorityCount = countPriority(requestRecord, responseRecordList);

        final String[] requestFields = { SITE_ID, BL_ID, FL_ID, RM_ID, REQUESTOR, EM_STD, DV_ID,
                DP_ID, PROB_TYPE, EQ_STD, EQ_ID, DEFAULT_PRIORITY, ACTIVITY_TYPE, PMP_ID };

        String responseString = "";

        for (final String field : requestFields) {
            if (DEFAULT_PRIORITY.equals(field) && priorityCount == 1) {
                responseString += ONE;
            } else {
                if (requestRecord.getValue(HELPDESK_SLA_REQUEST + DOT + field) != null) {
                    responseString += ONE;
                } else {
                    responseString += ZERO;
                }
            }
        }

        // translate all priorities response parameters to string and concat them together to make
        // the compare easier
        for (final DataRecord responseRecord : responseRecordList) {
            if (SERVICE_DESK_MAINTENANCE
                .equals(responseRecord.getString(HELPDESK_SLA_RESPONSE + DOT + ACTIVITY_TYPE))
                    && requestRecord
                        .getInt(HELPDESK_SLA_REQUEST + DOT + ORDERING_SEQ) == responseRecord
                            .getInt(HELPDESK_SLA_RESPONSE + DOT + ORDERING_SEQ)) {

                responseString += translateResponseParameterToStringByPriority(responseRecord,
                    responseStepsRecordList);
            }
        }

        return responseString;
    }

    /**
     * Count Priority.
     *
     * @param requestRecord heldesk_sla_request record
     * @param responseRecordList heldesk_sla_response records
     * @return the count of priority
     */
    private static int countPriority(final DataRecord requestRecord,
            final List<DataRecord> responseRecordList) {

        int priorityCount = 0;
        for (final DataRecord responseRecord : responseRecordList) {
            if (SERVICE_DESK_MAINTENANCE
                .equals(responseRecord.getString(HELPDESK_SLA_RESPONSE + DOT + ACTIVITY_TYPE))
                    && requestRecord
                        .getInt(HELPDESK_SLA_REQUEST + DOT + ORDERING_SEQ) == responseRecord
                            .getInt(HELPDESK_SLA_RESPONSE + DOT + ORDERING_SEQ)) {

                priorityCount++;

            }
        }

        return priorityCount;
    }

    /**
     * translate response parameter to string by priority.
     *
     * @param responseRecord responseRecord
     * @param responseStepsRecordList responseStepsRecordList
     * @return translate string
     */
    private static String translateResponseParameterToStringByPriority(
            final DataRecord responseRecord, final List<DataRecord> responseStepsRecordList) {

        final String[] responseFields = { PRIORITY, ACTIVITY_TYPE, MANAGER, DISPATCHER, SUPERVISOR,
                CF_ID, WORK_TEAM_ID, NOTIFY_SERVICE_PROVIDER, NOTIFY_REQUESTOR, NOTIFY_CRAFTSPERSON,
                DEFAULT_DURATION, AUTOSCHEDULE, AUTOISSUE, AUTODISPATCH, AUTOCREATE_WR,
                AUTOCREATE_WO, AUTOAPPROVE, AUTOACCEPT, SERVCONT_ID, TIME_TO_RESPOND,
                TIME_TO_COMPLETE, SERV_WINDOW_START, SERV_WINDOW_END, SERV_WINDOW_DAYS,
                INTERVAL_TO_RESPOND, INTERVAL_TO_COMPLETE, ALLOW_WORK_ON_HOLIDAYS,
                SCHEDULE_IMMEDIATELY };

        final String[] stepFields =
                { PRIORITY, ACTIVITY_TYPE, STATUS, STEP_ORDER, STEP, EM_ID, CF_ID, VN_ID, STEP_TYPE,
                        STEP_STATUS, ROLE, NOTIFY_RESPONSIBLE, MULTIPLE_REQUIRED, CONDITION };

        String responseParameterString = "";
        for (final String field : responseFields) {
            if (responseRecord.getValue(HELPDESK_SLA_RESPONSE + DOT + field) != null) {
                responseParameterString +=
                        responseRecord.getValue(HELPDESK_SLA_RESPONSE + DOT + field);
            } else {
                responseParameterString += NULL;
            }
        }

        final String recordPK = responseRecord.getString("helpdesk_sla_response.activity_type")
                + responseRecord.getInt("helpdesk_sla_response.ordering_seq")
                + responseRecord.getInt("helpdesk_sla_response.priority");

        for (final DataRecord record : responseStepsRecordList) {
            if (recordPK.equals(record.getString("helpdesk_sla_steps.activity_type")
                    + record.getInt("helpdesk_sla_steps.ordering_seq")
                    + record.getInt("helpdesk_sla_steps.priority"))) {
                for (final String field : stepFields) {
                    if (record.getValue(HELPDESK_SLA_STEPS + DOT + field) != null) {
                        responseParameterString +=
                                record.getValue(HELPDESK_SLA_STEPS + DOT + field);
                    } else {
                        responseParameterString += NULL;
                    }
                }
            }
        }

        return responseParameterString;
    }

    /**
     * get OrderSeq String.
     *
     * @param requestRecord requestRecord
     * @return OrderSeq String
     */
    private static String getOrderSeqString(final DataRecord requestRecord) {
        final String recordPK =
                "" + requestRecord.getInt(HELPDESK_SLA_REQUEST + DOT + ORDERING_SEQ);
        return recordPK;
    }

    /**
     * Get sub group from give data.
     *
     * @param data data
     * @param length sub group length
     * @return all sub groups
     */

    public static Vector<Vector<String>> combine(final Vector<String> data, final int length) {
        final int size = data.size();

        final Vector<Vector<String>> result = new Vector<Vector<String>>();

        final int[] flagArray = new int[size];
        initializeFlagArray(length, size, flagArray);

        boolean flag = true;
        boolean tempFlag = false;
        int pos = 0;
        int sum = 0;

        do {
            sum = 0;
            pos = 0;
            tempFlag = true;
            result.add(getCombination(flagArray, data, length));

            pos = findFirst10AndChangeTo01(size, flagArray, pos);

            for (int i = 0; i < pos; i++) {
                if (flagArray[i] == 1) {
                    sum++;
                }
            }
            for (int i = 0; i < pos; i++) {
                if (i < sum) {
                    flagArray[i] = 1;
                } else {
                    flagArray[i] = 0;
                }
            }

            for (int i = size - length; i < size; i++) {
                if (flagArray[i] == 0) {
                    tempFlag = false;
                    break;
                }
            }

            if (!tempFlag) {
                flag = true;
            } else {
                flag = false;
            }

            if (result.size() > MAX_COMBINATION_LENGTH) {
                flag = false;
            }

        } while (flag);

        result.add(getCombination(flagArray, data, length));

        return result;
    }

    /**
     * Find first '10' and change to '01'.
     *
     * @param size size
     * @param flagArray flagArray
     * @param pos pos
     * @return pos
     */
    private static int findFirst10AndChangeTo01(final int size, final int[] flagArray,
            final int pos) {
        int newPos = pos;
        for (int i = 0; i < size - 1; i++) {
            if (flagArray[i] == 1 && flagArray[i + 1] == 0) {
                flagArray[i] = 0;
                flagArray[i + 1] = 1;
                newPos = i;
                break;
            }
        }
        return newPos;
    }

    /**
     * Initialize flag array.
     *
     * @param length length
     * @param size size
     * @param flagArray flagArray
     */
    private static void initializeFlagArray(final int length, final int size,
            final int[] flagArray) {
        for (int i = 0; i < size; i++) {
            flagArray[i] = 0;
        }

        // initializing
        for (int i = 0; i < length; i++) {
            flagArray[i] = 1;
        }
    }

    /**
     * get combination.
     *
     * @param bs bs
     * @param a a
     * @param m m
     * @return combination
     */
    private static Vector<String> getCombination(final int[] bs, final Vector<String> a,
            final int m) {
        final Vector<String> result = new Vector<String>();
        for (int i = 0; i < bs.length; i++) {
            if (bs[i] == 1) {
                result.add(a.get(i));
            }
        }
        return result;
    }

    /**
     * Get response parameters by ordering sequence.
     *
     * By Guo Jiangtao
     *
     * @param orderingSeq orderingSeq
     * @return response data set
     */
    public static DataSetList getResponseParametersByOrderingSeq(final int orderingSeq) {
        // load the request data source form the view
        final DataSource requestDataSource =
                DataSourceFactory.loadDataSourceFromFile(DS_FILE, SLA_RQUEST_DS);
        // load the response data source form the view
        final DataSource responseDataSource =
                DataSourceFactory.loadDataSourceFromFile(DS_FILE, SLA_RESPONSE_DS);

        final List<DataRecord> requestSlaRecords = requestDataSource
            .getRecords(HELPDESK_SLA_REQUEST + DOT + ORDERING_SEQ + "=" + orderingSeq);

        final int order =
                requestSlaRecords.get(0).getInt(HELPDESK_SLA_REQUEST + DOT + ORDERING_SEQ);
        final List<DataRecord> responseSlaRecords = responseDataSource
            .getRecords("helpdesk_sla_response.activity_type='SERVICE DESK - MAINTENANCE' "
                    + " AND helpdesk_sla_response.ordering_seq=" + order);
        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(responseSlaRecords);

        return dataSet;

    }

    /**
     * Get workflow steps by ordering sequence.
     *
     * @param orderingSeq orderingSeq
     * @return workflow steps data set
     */
    public static DataSetList getWorkflowStepsByOrderingSeq(final int orderingSeq) {
        // load the request data source form the view
        final DataSource requestDataSource =
                DataSourceFactory.loadDataSourceFromFile(DS_FILE, SLA_RQUEST_DS);
        // load the workflow steps data source form the view
        final DataSource workflowStepsDataSource =
                DataSourceFactory.loadDataSourceFromFile(DS_FILE, SLA_WORKFLOW_STEPS_DS);

        final List<DataRecord> requestSlaRecords =
                requestDataSource.getRecords("helpdesk_sla_request.ordering_seq=" + orderingSeq);

        final int order = requestSlaRecords.get(0).getInt("helpdesk_sla_request.ordering_seq");
        final List<DataRecord> workflowStepsRecords = workflowStepsDataSource
            .getRecords("helpdesk_sla_steps.activity_type='SERVICE DESK - MAINTENANCE' "
                    + " AND helpdesk_sla_steps.ordering_seq=" + order);
        final DataSetList dataSet = new DataSetList();
        dataSet.addRecords(workflowStepsRecords);

        return dataSet;

    }

    /**
     * Create groupings.
     *
     * By Guo Jiangtao
     *
     * @param groupings grouping array
     */
    public static void createGroupings(final JSONArray groupings) {
        for (int i = 0; i < groupings.length(); i++) {
            final String grouping = groupings.getString(i);
            final String restriciton = "helpdesk_sla_request.ordering_seq IN("
                    + grouping.replace(LFET_BRACKET, "").replace(RIGHT_BRACKET, "") + ")";
            int groupingNumber =
                    DataStatistics.getIntWithoutVpa(HELPDESK_SLA_REQUEST, GROUPING, "MIN", restriciton);

            if (groupingNumber == 0) {
                groupingNumber = DataStatistics.getIntWithoutVpa(HELPDESK_SLA_REQUEST, GROUPING, "MAX") + 1;
            }

            final DataSource requestDataSource =
                    DataSourceFactory.loadDataSourceFromFile(DS_FILE, SLA_RQUEST_DS);
            final List<DataRecord> requestSlaRecords = requestDataSource.getRecords(restriciton);
            for (final DataRecord record : requestSlaRecords) {
                record.setValue("helpdesk_sla_request.grouping", groupingNumber);
                requestDataSource.saveRecord(record);
            }
        }
    }

    /**
     * Create all groupings.
     *
     * By Guo Jiangtao
     */
    public static void createAllGroupings() {
        final Map<String, Object> parameters = new HashMap<String, Object>();
        final JSONArray groupings = getSLAGroupsArray(parameters);
        createGroupings(groupings);
    }

}
