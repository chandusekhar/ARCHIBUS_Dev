package com.archibus.eventhandler.tools;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 *  This event handler implements business logic related to searching for dup files.
 *  Copyright (c) 2008, ARCHIBUS, Inc.
 *
 *@author     Kaori Emery
 *@created    November 20, 2008
 *@version    1.0
 */
public class SearchForDups extends EventHandlerBase {
    
    /**
     *  runFileSearch
     *
     *@param  context        Description of the Parameter
     */ 
	public void runFileSearch(EventHandlerContext context) {
		String searchDirectory = context.getString("searchDirectory");
		String directoriesToIgnore = context.getString("directoriesToIgnore");
		FileSearch search = new FileSearch(searchDirectory, directoriesToIgnore);
		context.addResponseParameter("message", search.getAxvwCount()+"");
		context.addResponseParameter("jsonExpression", search.getDuplicateArray().toString());
	}
}
