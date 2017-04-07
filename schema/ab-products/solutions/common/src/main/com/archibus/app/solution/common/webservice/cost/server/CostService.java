package com.archibus.app.solution.common.webservice.cost.server;

import javax.jws.WebService;

import com.archibus.app.common.finance.domain.ActualCost;
import com.archibus.utility.ExceptionBase;

@WebService
public interface CostService {
    /**
     * Get actual costs restricted by cost category, month and year; the returned costs contain
     * fields: Due Date, Cost Category, Description, Cost Status, Lease Code, Property Code, Account
     * Code, Amount Expense, Amount Income, Date Transaction Created, and Cost Code.
     * 
     * @param costCategoryId
     * @param month
     * @param year
     * @return actual costs.
     * @throws ExceptionBase
     */
    ActualCost[] getActualCostsByCategoryAndMonth(String costCategoryId, int month, int year)
            throws ExceptionBase;
}