package com.archibus.app.solution.logiccookbook;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.util.*;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 * Examples of using essential parts of the Java programming language and API.
 * <p>
 * This class is not a workflow rule event handler, and cannot be called from a view directly.
 *
 * @author Sergey Kuramshin
 */
/**
 * Suppress PMD warning "SystemPrintln" in this class.
 * <p>
 * Justification: This is a simplified example. Don't do this in production code.
 * <p>
 * Suppress PMD warning "AvoidFinalLocalVariable". Normally final local variables are not required,
 * because we would use either constants or method parameters instead.
 */
@SuppressWarnings({ "PMD.SystemPrintln", "PMD.AvoidFinalLocalVariable" })
public class JavaExamples {

    /**
     * Constants: values used in the code that you might want to change later.
     */

    /**
     * Max number of records: 10.
     */
    public static final int MAX_NUMBER_OF_RECORDS = 10;

    /**
     * If the space percentage is empty, then record uses 100% of the space.
     */
    private static final double DEFAULT_SPACE_PERCENT = 100.0;

    /**
     * If dayPart <> 0, than record uses 50% of the most recently calculated pct_time.
     */
    private static final double DEFAULT_TIME_PERCENT = 50.0;

    /**
     * Max amount of expense: 1000.
     */
    private static final double MAX_AMOUNT_EXPENSE = 1000.0;

    /**
     * Total cost limit: 500.
     */
    private static final double MAX_TOTAL_COST = 500.0;

    /**
     * HQ building code.
     */
    private static final String BUILDING_HQ = "HQ";

    /**
     * Table name.
     */
    private static final String TABLE_COST_TRAN = "cost_tran";

    /**
     * Field name.
     */
    private static final String FIELD_AMOUNT_EXPENSE = "amount_expense";

    /**
     * Field name.
     */
    private static final String FIELD_COST_TRAN_ID = "cost_tran_id";

    /**
     * Table name.
     */
    private static final String TABLE_RMPCT = "rmpct";

    /**
     * Field name.
     */
    private static final String FIELD_PCT_SPACE = "pct_space";

    /**
     * Field name.
     */
    private static final String FIELD_PCT_TIME = "pct_time";

    /**
     * Period.
     */
    private static final String PERIOD = ".";

    /**
     * Constant for 100%.
     */
    private static final int PERCENT_100 = 100;

    /**
     * Shows using essential Java collection types.
     */
    public void useCollections() {
        // Use the List collection type to hold N objects (the number is not known in advance).
        final List<String> usernames = new ArrayList<String>();
        usernames.add("AI");
        usernames.add("GUEST");

        // For each user name stored in the list...
        for (final String username : usernames) {
            // Do not use System.out in production code!
            System.out.println(username);
        }

        // Use the Map collection type to store objects that can be retrieved using a key.
        // Store total cost as value, using the building name as a key.
        final Map<String, BigDecimal> totalCostsByBuilding = new HashMap<String, BigDecimal>();
        totalCostsByBuilding.put(BUILDING_HQ, new BigDecimal("1000.0"));
        totalCostsByBuilding.put("JFK A", new BigDecimal("500.0"));

        // Check if a key (building name) exists, and get value (total cost) by key.
        if (totalCostsByBuilding.containsKey(BUILDING_HQ)) {
            final BigDecimal cost = totalCostsByBuilding.get(BUILDING_HQ);
            System.out.println(cost);
        }

        // For each key (building name) in the Map...
        for (final String buildingId : totalCostsByBuilding.keySet()) {
            // Get the total cost for that building...
            final BigDecimal cost = totalCostsByBuilding.get(buildingId);

            // Simulate processing.
            final String message =
                    MessageFormat.format("Building {0}: cost = {1}", buildingId, cost);
            System.out.println(message);
        }
    }

    /**
     * Shows using essential Java data types.
     *
     * Use double data type for "real" numbers such as area or cost.
     *
     * @param costOfLabor The cost of labor.
     * @param costOfMaterials The cost of materials.
     * @param numberOfRequests The numer of work requests.
     */
    public void useDataTypes(final double costOfLabor, final double costOfMaterials,
            final int numberOfRequests) {
        // Use String data type for text field values or messages.
        final String firstName = "Albert";
        final String lastName = "Einstein";

        // Strings can be concatenated.
        final String fullName = firstName + " " + lastName;

        // Messages can be created from a pattern with place-holders, and a list of objects.
        final Date today = new Date();
        final String message = MessageFormat.format("Hello, {0}. Today is {1}", fullName, today);

        // Do not use System.out in production code!
        System.out.println(message);

        // Use boolean data type for true/false conditions (and do not use integer 1 and 0).
        final boolean notifyRequestor = true;
        if (notifyRequestor) {
            // Simulate notification.
            System.out.println("The WFR should notify requestor");
        }

        // Use integer data type for objects that can be counted.
        for (int i = 0; i < numberOfRequests; i++) {
            // Simulate request processing.
            System.out.println("Processing request: " + i);
        }

        final double totalCost = costOfLabor + costOfMaterials;
        if (totalCost > MAX_TOTAL_COST) {
            // Simulate workflow routing.
            System.out.println("This request needs manager approval");
        }

        // Use BigDecimal data type for calculations where precision loss in not acceptable.
        // Calculations that use double values will have rounding errors.
        BigDecimal totalExpense = BigDecimal.ZERO;
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(TABLE_COST_TRAN, new String[] {
                        FIELD_COST_TRAN_ID, FIELD_AMOUNT_EXPENSE });
        final List<DataRecord> costs = dataSource.getRecords();
        // Calculate the total expense as a sum of expense of each record.
        for (final DataRecord cost : costs) {
            final double amountExpense =
                    cost.getDouble(TABLE_COST_TRAN + PERIOD + FIELD_AMOUNT_EXPENSE);
            totalExpense = totalExpense.add(new BigDecimal(amountExpense));
        }
    }

    /**
     * Shows Java "for" loops and control statements.
     * <p>
     * Find first 10 records with amount_expense >= 1000; return IDs of those records.
     *
     * @return List of IDs of the found records.
     */
    public List<Integer> useForLoop() {
        // get cost records
        final DataSource dataSource =
                DataSourceFactory.createDataSourceForFields(TABLE_COST_TRAN, new String[] {
                        FIELD_COST_TRAN_ID, FIELD_AMOUNT_EXPENSE });
        final List<DataRecord> costs = dataSource.getRecords();

        // find first 10 records with amount_expense >= 1000
        // save their IDs in this list
        final List<Integer> searchResults = new ArrayList<Integer>();

        // for each cost record
        for (final DataRecord cost : costs) {
            final double amountExpense =
                    cost.getDouble(TABLE_COST_TRAN + PERIOD + FIELD_AMOUNT_EXPENSE);

            // we are not interested in records with amount_expense < 1000
            if (amountExpense < MAX_AMOUNT_EXPENSE) {
                // go to the next record
                continue;
            }

            // add record primary key to the search result list
            searchResults.add(cost.getInt("cost_tran.cost_tran_id"));

            // have we found 10 records with amount_expense >= 1000 already
            if (searchResults.size() == MAX_NUMBER_OF_RECORDS) {
                // stop iterating through records
                break;
            }
        }

        // after the loop, there will be 10 or less cost IDs in the search result list
        final String message = MessageFormat.format("Found {0} records", searchResults.size());
        // don't do this in production: don't use System.out!
        System.out.println(message);

        return searchResults;
    }

    /**
     * Shows how to retrieve and update records in a loop.
     */
    public void useGetAndUpdateRecordLoop() {
        // get all rmpct records
        final String table = TABLE_RMPCT;
        final String[] fields =
                { "pct_id", "date_start", "date_end", FIELD_PCT_TIME, FIELD_PCT_SPACE, "day_part" };
        final DataSource dataSource = DataSourceFactory.createDataSourceForFields(table, fields);
        final List<DataRecord> records = dataSource.getAllRecords();

        // for each record
        for (final DataRecord record : records) {
            double percentTime = record.getDouble(TABLE_RMPCT + PERIOD + FIELD_PCT_TIME);
            double percentSpace = record.getDouble(TABLE_RMPCT + PERIOD + FIELD_PCT_SPACE);
            final int dayPart = record.getInt("rmpct.day_part");

            // if the space percentage is empty, then record uses 100% of the space
            if (percentSpace == 0.0) {
                percentSpace = DEFAULT_SPACE_PERCENT;
                record.setValue("rmpct.pct_space", percentSpace);
            }

            // if dayPart <> 0, than record uses 50% of the most recently calculated pct_time
            if (dayPart != 0) {
                percentTime = percentTime * DEFAULT_TIME_PERCENT / PERCENT_100;
                record.setValue("rmpct.pct_time", percentTime);
            }

            // save changed record
            dataSource.saveRecord(record);
        }
    }
}
