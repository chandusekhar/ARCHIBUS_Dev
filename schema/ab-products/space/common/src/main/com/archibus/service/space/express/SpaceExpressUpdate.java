package com.archibus.service.space.express;

import java.util.*;

import com.archibus.datasource.*;
import com.archibus.service.space.helper.SpaceTransactionUtil;

/**
 * Space Express Update class for updating logics.
 * 
 * <p>
 * History:
 * <li>21.2: Add for 21.2 Space Express.
 * 
 * @author Zhang Yi
 * 
 * 
 */
@SuppressWarnings("PMD.AvoidUsingSql")
public class SpaceExpressUpdate {
    
    /** single quotation. */
    public static final String SINGLE_QUOTATION = "'";
    
    /** comma. */
    public static final String COMMA = ",";
    
    /** Property name 'cat'. */
    public static final String CAT = "cat";
    
    /** table name 'rm'. */
    public static final String ROOM = "rm";
    
    /**
     * 
     * Update Room's capacity according to room categorys and types.
     * 
     * @param categories predefined a list of categories
     * @param types predefined a list of types
     * 
     */
    public void updateRoomCapacityByCategoryAndType(final List<String> categories,
            final List<Map<String, String>> types) {
        
        updateRoomCapcityByCategory(categories);
        
        updateRoomCapcityByType(categories, types);
        
    }
    
    /**
     * 
     * Update Room's capacity according to its room category.
     * 
     * @param categories predefined a list of categories
     * 
     *            Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    private void updateRoomCapcityByCategory(final List<String> categories) {
        String inConditionOfCategory = "";
        // construct a sql to batch update the all room’s capacity that matched the given room
        // categories.
        if (!categories.isEmpty()) {
            
            // prepare 'IN' condition of SQL Clause for categories
            inConditionOfCategory = getInConditionFromStringList(categories);
            
            // construct SQL for updating rooms
            final StringBuilder updateSQL = new StringBuilder();
            updateSQL.append(" Update  rm  SET cap_em = 1 WHERE rm.cap_em = 0 and rm.rm_cat IN ");
            updateSQL.append(inConditionOfCategory);
            
            // execute update SQL on rm table
            final DataSource dsRoom = SpaceTransactionUtil.getRmDataSource();
            dsRoom.addQuery(updateSQL.toString());
            dsRoom.executeUpdate();
        }
    }
    
    /**
     * 
     * Update Room's capacity according to its room types.
     * 
     * @param categories predefined a list of categories
     * @param types predefined a list of types
     * 
     *            Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    private void updateRoomCapcityByType(final List<String> categories,
            final List<Map<String, String>> types) {
        
        // construct a sql to batch update all room’s capacity that matched the given room types
        if (!types.isEmpty()) {
            
            // exclude the room types that already contained in room categories
            final List<Map<String, String>> filteredTypes =
                    this.removeTypesBelongToCategories(types, categories);
            
            if (!filteredTypes.isEmpty()) {
                
                // prepare 'IN' condition of SQL Clause for types
                final String whereConditionOfType =
                        getWhereConditionFromRoomTypeList(filteredTypes);
                
                // construct SQL for updating rooms with IN types condition
                final StringBuilder updateSQL = new StringBuilder();
                updateSQL.append(" Update rm SET cap_em = 1 WHERE rm.cap_em = 0 and ");
                updateSQL.append(whereConditionOfType);
                
                // execute update SQL on rm table
                final DataSource dsRoom = SpaceTransactionUtil.getRmDataSource();
                dsRoom.addQuery(updateSQL.toString());
                dsRoom.executeUpdate();
            }
        }
    }
    
    /**
     * 
     * Update Room's count_em for group by 'Occupancy' in Allocation tab of
     * "Allocation, Trends, and Benchmarks" report. *
     * 
     * @param restriction String restricton to rm join rmcat join bl
     * 
     *            Justification: Case #2.2: Statement with UPDATE ... WHERE pattern.
     */
    public static void updateRoomOccupancy(final String restriction) {
        
        // construct sql to batch update all room’s occupant by counting its contained employees.
        if (SqlUtils.isOracle()) {
            
            final StringBuilder updateSqlForOracle = new StringBuilder();
            
            updateSqlForOracle
                .append(" UPDATE ( select rm.count_em, rm.bl_id, rm.fl_id, rm.rm_id from rm inner join rmcat on rm.rm_cat=rmcat.rm_cat inner join bl on rm.bl_id=bl.bl_id where "
                        + restriction + ") ${sql.as} r ");
            updateSqlForOracle
                .append(" set r.count_em=(select count(1) from em where em.bl_id=r.bl_id and em.fl_id=r.fl_id and em.rm_id=r.rm_id) ");
            
            SqlUtils.executeUpdate(ROOM, updateSqlForOracle.toString());
            
        } else {
            
            final StringBuilder updateSql = new StringBuilder();
            
            updateSql
                .append(" UPDATE rm set rm.count_em=(select count(1) from em where em.bl_id=rm.bl_id and em.fl_id=rm.fl_id and em.rm_id=rm.rm_id) ");
            updateSql
                .append("from rm inner join rmcat on rm.rm_cat=rmcat.rm_cat inner join bl on rm.bl_id=bl.bl_id ");
            updateSql.append(" where ").append(restriction);
            
            SqlUtils.executeUpdate(ROOM, updateSql.toString());
        }
        
    }
    
    /**
     * 
     * Remove room types that associated with the categories of list.
     * 
     * @param categories predefined a list of categories
     * @param types predefined a list of types
     * 
     * @return room types that not in categories list
     */
    private List<Map<String, String>> removeTypesBelongToCategories(
            final List<Map<String, String>> types, final List<String> categories) {
        
        final List<Map<String, String>> newTypes = new ArrayList<Map<String, String>>();
        
        for (final Map<String, String> type : types) {
            
            boolean found = false;
            for (final String cat : categories) {
                if (type.get(CAT).equals(cat)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                newTypes.add(type);
            }
        }
        return newTypes;
    }
    
    /**
     * 
     * Create a string used for where clause and return it.
     * 
     * @param types a list of types
     * 
     * @return Where condition string
     */
    private String getWhereConditionFromRoomTypeList(final List<Map<String, String>> types) {
        
        final StringBuilder conditionString = new StringBuilder();
        
        if (!types.isEmpty()) {
            
            // prepare SQL condition clause connected by 'or' types
            {
                conditionString.append("( ");
                
                for (final Map<String, String> type : types) {
                    
                    conditionString.append(" rm.rm_cat=");
                    conditionString.append(type.get(CAT));
                    conditionString.append(" and rm.rm_type=");
                    conditionString.append(type.get("type"));
                    conditionString.append(" or");
                }
                
                // replace last string 'or' with ')'
                final int indexOfLastChar = conditionString.length() - 1;
                conditionString.deleteCharAt(indexOfLastChar);
                conditionString.deleteCharAt(indexOfLastChar - 1);
                conditionString.append(" )");
            }
            
        }
        
        return conditionString.toString();
        
    }
    
    /**
     * 
     * Create a string used for IN sql clause and return it.
     * 
     * @param values a list of string values used for IN SQL
     * 
     * @return IN condition string
     */
    private String getInConditionFromStringList(final List<String> values) {
        
        final StringBuilder inConditionString = new StringBuilder();
        
        if (!values.isEmpty()) {
            
            // prepare 'IN' condition of SQL Clause
            {
                inConditionString.append("(");
                
                for (final String category : values) {
                    inConditionString.append(category);
                    inConditionString.append(COMMA);
                }
                
                // replace last char ',' with ')'
                final int indexOfLastChar = inConditionString.length() - 1;
                inConditionString.deleteCharAt(indexOfLastChar);
                inConditionString.append(")");
            }
            
        }
        
        return inConditionString.toString();
        
    }
}
