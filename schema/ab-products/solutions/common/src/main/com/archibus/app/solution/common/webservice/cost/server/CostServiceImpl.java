package com.archibus.app.solution.common.webservice.cost.server;

import java.util.List;

import javax.jws.WebService;

import com.archibus.app.common.finance.dao.datasource.ActualCostDataSource;
import com.archibus.app.common.finance.domain.ActualCost;
import com.archibus.utility.ExceptionBase;

/**
 * This is an example of WebService, exposed by WebCentral, to be consumed by an abstract ERP system
 * (such as SAP, Oracle). It uploads general ledger information (a subset of the Costs (cost_tran)
 * table) into the ERP system. This scenario is used for uploading costs, such as real estate
 * charges, that accounting should charge to tenants. The costs to be returned are restricted by
 * Cost Category, month and year; the returned costs contain fields: Due Date, Cost Category,
 * Description, Cost Status, Lease Code, Property Code, Account Code, Amount Expense, Amount Income,
 * Date Transaction Created, and Cost Code.
 * 
 * 
 * The costService-remote bean is defined in
 * /WEB-INF/config/context/remoting/examples/webservices-cxf/webservices.xml. The supporting
 * DataSource beans are defined in
 * /WEB-INF/config/context/applications/examples/applications-child-context.xml.
 * 
 * For instructions on how to demonstrate this example, see Online Help.
 * 
 * @author Valery Tydykov
 * 
 */
@WebService(
        endpointInterface = "com.archibus.app.solution.common.webservice.cost.server.CostService",
        serviceName = "CostService")
public class CostServiceImpl implements CostService {
    private ActualCostDataSource actualCostDataSource;
    
    public ActualCostDataSource getActualCostDataSource() {
        return this.actualCostDataSource;
    }
    
    /** {@inheritDoc} */
    public ActualCost[] getActualCostsByCategoryAndMonth(final String costCategoryId,
            final int month, final int year) throws ExceptionBase {
        // get ActualCosts from the DataSource
        final List<ActualCost> actualCosts =
                this.actualCostDataSource.getActualCostsByCategoryAndMonth(costCategoryId, month,
                    year);
        
        return actualCosts.toArray(new ActualCost[actualCosts.size()]);
    }
    
    public void setActualCostDataSource(final ActualCostDataSource actualCostDataSource) {
        this.actualCostDataSource = actualCostDataSource;
    }
}
