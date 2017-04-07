/**
 * @author Jiangtao Guo
 */
var abRecurringPatternCtrl = View.createController('abRecurringPatternCtrl',{
	
	// RecurringPattern object
	pattern : null,
	// Track if date fields are to remain hidden
	dateStartHidden: false,
	dateEndHidden: false,
	// scheduling limits
	schedulingLimits:{
		'day': 5,
		'week': 5,
		'month': 5,
		'year': 10
	},
	// all recurring types
	recurringTypes: ['none', 'once', 'day', 'week', 'month', 'year'],
	// visible recurring types - must be send from caller view and can contains less values
	visibleRecurrTypes: ['none', 'once', 'day', 'week', 'month', 'year'],
	
	/**
	 * load initial pattern from xmlPatternRecurrence variable in parameters, if exist
	 * else load default pattern
	 */
	afterViewLoad: function(){
		
		
		if (this.pattern==null){ 
		  if(View.parameters && valueExistsNotEmpty(View.parameters.xmlPatternRecurrence)){
		    this.pattern = new RecurringPattern(View.parameters.xmlPatternRecurrence);
		  }
		  else {
		    this.pattern = new RecurringPattern(null);
	    }	
	  }
		
		if (View.parameters && typeof(View.parameters.visibleRecurrTypes)!='undefined') {
			this.visibleRecurrTypes = View.parameters.visibleRecurrTypes;
		}
		
		if (View.parameters && typeof(View.parameters.schedulingLimits)!='undefined') {
			this.getSchedulingLimitsFromParameter(View.parameters.schedulingLimits);
		} else if (View.activityParameters && valueExists(View.activityParameters["AbCommonResources-RecurringSchedulingLimits"])) {
			var activityParameterValue = View.activityParameters["AbCommonResources-RecurringSchedulingLimits"];
			this.getSchedulingLimitsFromParameter(activityParameterValue);
		}

		// If view loaded in a popup window, then show Save and Cancel buttons, and
		//  optionally Date Start and Date End
	  if (View.parameters) {
		  if(typeof(View.parameters.xmlPatternRecurrence)!='undefined') {
	      this.editRecurringRule.actions.each(function (action) {
	        action.show(true);
	      });
	    }
	    var cntDatesHidden = 0;
	    // Hide date field if no initial value provided
		  if (typeof(View.parameters.dateStart)=='undefined') {
	      this.showDateStart(false);
	      cntDatesHidden++;
	    }
		  if (typeof(View.parameters.dateEnd)=='undefined') {
	      this.showDateEnd(false);
	      cntDatesHidden++;
	    }
	    // If both date fields are hidden, hide empty row at the top
	    if (cntDatesHidden==2) {
			  this.editRecurringRule.showField('vspacer1',false);
	    }
	    // Set initial pattern type
		  if(typeof(View.parameters.recurringPatternType)!='undefined') {
		  	var rtype = View.parameters.recurringPatternType;
				if(rtype=='none' || rtype=='once' || rtype=='day' || rtype=='week' || rtype=='month' || rtype=='year'){
					this.pattern.type = rtype;
				}
	    }
	  }
	  //  Hide Date Start and End fields by default for embedded panel
	  else {
	  	this.showDateStart(false);
	  	this.showDateEnd(false);
	  	// Hide empty space above panel
			this.editRecurringRule.showField('vspacer1',false);
	  }
	  
	},

  afterInitialDataFetch: function(){
  	// If view loaded in a popup window, then set Date fields if values provided
	  if (View.parameters) {
		  if (typeof(View.parameters.dateStart)!='undefined') {
		  this.setDateStart(View.parameters.dateStart);
		}
		  if (typeof(View.parameters.dateEnd)!='undefined') {
		  this.setDateEnd(View.parameters.dateEnd);
		}
		// Enable/Disable date fields if flags set
		  if (typeof(View.parameters.enableDateStart)!='undefined') {
		  this.enableDateStart(View.parameters.enableDateStart);
		}
		  if (typeof(View.parameters.enableDateEnd)!='undefined') {
		  this.enableDateEnd(View.parameters.enableDateEnd);
		}
	  }
	  
    this.pattern.show();
	
	if (View.parameters) {
	  if (typeof(View.parameters.enableRecurringPattern)!='undefined') {
		this.enableRecurringPattern(View.parameters.enableRecurringPattern);
	  }
	}
	
	this.showRecurringTypes();

	if (View.parameters) {
      this.editRecurringRule.show(true)
    }
	
},
	/**
	 * Get default values for scheduling limits from parameters value. ""
	 */
    getSchedulingLimitsFromParameter: function(paramValue) {
    	if (valueExistsNotEmpty(paramValue)) {
    		var values = paramValue.split(";");
    		for (var i = 0; i < values.length / 2; i++) {
    			this.schedulingLimits[values[i*2]] = values[i*2+1];
    		}
    	}
    },
    
    /**
     * Scheduling limits for each recurring type.
     */
    setSchedulingLimits: function(dayVal, weekVal, monthVal, yearVal) {
    	if (valueExistsNotEmpty(dayVal)) {
    		this.schedulingLimits['day'] = dayVal;
    	}
    	if (valueExistsNotEmpty(weekVal)) {
    		this.schedulingLimits['week'] = weekVal;
    	}
    	if (valueExistsNotEmpty(monthVal)) {
    		this.schedulingLimits['month'] = monthVal;
    	}
    	if (valueExistsNotEmpty(yearVal)) {
    		this.schedulingLimits['year'] = yearVal;
    	}
    },
    
	/**
	 * listener for Save button
	 */
	editRecurringRule_onSave: function(){
		if (View.parameters) {
			var newXmlPattern = this.getRecurringPattern();
			var parameters = {
			  xmlPatternRecurrence: null,
			  dateStart: null,
			  dateEnd: null,
			  recurringPatternType: null,
			  totalOccurrences: null,
			  interval: null,
			  daysOfWeek: null,
			  dayOfMonth: null,
			  weekOfMonth: null,
			  monthOfYear: null
			  
		    };
			// Save the new XML pattern
			parameters.xmlPatternRecurrence = newXmlPattern;
			// get localized form of new XML pattern
			parameters.description = getRecurringRuleDescription(newXmlPattern);
			// Save date start/end, recurring pattern type, total occurrences, and other settings
			parameters.dateStart = this.getDateStart();
			parameters.dateEnd = this.getDateEnd();
			parameters.recurringPatternType = this.getRecurringPatternType();
			parameters.totalOccurrences = this.getVal_EndAfterOccurrences();
			parameters.interval = this.getInterval();
			parameters.daysOfWeek = this.getDaysOfWeek();
			parameters.dayOfMonth = this.getDayOfMonth();
			parameters.weekOfMonth = this.getWeekOfMonth();
			parameters.monthOfYear = this.getMonthOfYear();
			// Return the new XML pattern
			if(typeof(View.parameters.callback)=='function'){
				  View.parameters.callback(newXmlPattern,parameters);
			}
	    } 
		View.closeThisDialog();
	},
	
	/**
	 * set recurring pattern from xml value
	 */
	setRecurringPattern: function(value, isDisable){
		this.pattern = new  RecurringPattern(value);
		this.pattern.show();
		if(isDisable){
			this.pattern.enable(false);
		}
    this.editRecurringRule.show(true)        
	},
	
	/**
	 * get xml recurring pattern value from interface
	 */
	getRecurringPattern: function(){
		return this.pattern.getXmlPattern();
	},
	
	/**
	 * get recurring pattern type (none, daily, weekly, etc.)
	 */
	getRecurringPatternType: function(){
		if(this.pattern){
			return this.pattern.getType();
		}
		else return 'none';
	},

	/**
	 * set recurring pattern type (none, daily, weekly, etc.)
	 */
	setRecurringPatternType: function(rtype){
		if(rtype=='none' || rtype=='once' || rtype=='day' || rtype=='week' || rtype=='month' || rtype=='year'){
			this.pattern.type = rtype;
		  this.pattern.show();
		}
	},

	/**
	 * clear recurring pattern controls
	 */
	clearRecurringPattern: function(){
		if(this.pattern){
			this.pattern.clear();
		}
	},
	
	/**
	 * enable/disable recurring pattern controls
	 */
	enableRecurringPattern: function(isEnabled){
		if(this.pattern && valueExistsNotEmpty(isEnabled)){
			this.pattern.enable(isEnabled);
			this.enableDateStart(isEnabled);
			this.enableDateEnd(isEnabled);
		}
		else if (this.pattern) {
			this.pattern.enable(true);
			this.enableDateStart(true);
			this.enableDateEnd(true);
	  }
	},

	/**
	 * show/hide panel with recurring pattern controls
	 */
	showRecurringPatternPanel: function(isShow){
		if(valueExistsNotEmpty(isShow)){
			this.editRecurringRule.show(isShow);
		}
		else {
			this.editRecurringRule.show(true);
	  }
	},
	
	/**
	 * show/hide Date Start field
	 */
	showDateStart: function(isShow){
		if(valueExistsNotEmpty(isShow)){
			this.editRecurringRule.showField('gp.date_start',isShow);
			this.dateStartHidden = !isShow;
		}
		else {
			this.editRecurringRule.showField('gp.date_start',true);
			this.dateStartHidden = false;
	  }
	  if (this.dateStartHidden) {
			Ext.get('div_hspacer2').setDisplayed(true);
	  }
	},

	/**
	 * show/hide Date End field
	 */
	showDateEnd: function(isShow){
		if(valueExistsNotEmpty(isShow)){
			this.editRecurringRule.showField('gp.date_end',isShow);
			this.dateEndHidden = !isShow;
		}
		else {
			this.editRecurringRule.showField('gp.date_end',true);
			this.dateEndHidden = false;
	  }
	},

	/**
	 * enable/disable Date Start field
	 */
	enableDateStart: function(isEnable){
		if(valueExistsNotEmpty(isEnable)){
			this.editRecurringRule.enableField('gp.date_start',isEnable);
		}
		else {
			this.editRecurringRule.enableField('gp.date_start',true);
	  }
	},

	/**
	 * enable/disable Date End field
	 */
	enableDateEnd: function(isEnable){
		if(valueExistsNotEmpty(isEnable)){
			this.editRecurringRule.enableField('gp.date_end',isEnable);
		}
		else {
			this.editRecurringRule.enableField('gp.date_end',true);
	  }
	},

	/**
	 * get value of Date Start field from interface
	 */
	getDateStart: function(){
		return this.editRecurringRule.getFieldValue('gp.date_start');
	},
	
	/**
	 * get value of Date End field from interface
	 */
	getDateEnd: function(){
		return this.editRecurringRule.getFieldValue('gp.date_end');
	},

	/**
	 * set value of Date Start field in interface
	 */
	setDateStart: function(dateVal){
		this.editRecurringRule.setFieldValue('gp.date_start',dateVal);
	},
	
	/**
	 * set value of Date End field in interface
	 */
	setDateEnd: function(dateVal){
		this.editRecurringRule.setFieldValue('gp.date_end',dateVal);
	},

	/**
	 * get value of End After xxx Occurrences from interface
	 */
	getVal_EndAfterOccurrences: function(){
		var total = this.pattern.getFieldTotal()
		if(total==''){
			total = 0;
		}else{
			total = parseInt(total);
		}
		return total;
	},
	
    /**
     * Get the recurring schedule interval type.
     * 
     */
    getRecurringType: function() {
    	return this.pattern.type;
	},    

    /**
     * Get the recurring schedule interval.
     * 
     */
    getInterval: function() {
    	var recurringType = this.getRecurringType();
		var interval = 0;
    	
        if (recurringType == 'once') {
            interval = 1;
        }

        else if (recurringType == 'day') {
            interval = parseInt(this.pattern.value1);
        }
        
        else if (recurringType == 'week') {
           interval = parseInt(this.pattern.value2);
        }
        
        else if (recurringType == 'month') {
            interval = parseInt(this.pattern.value3);            
        }
        else if (recurringType == 'year') {
            
            if (this.pattern.value4=='') {
                interval = parseInt(this.pattern.value3);
                
            } else {
                interval = parseInt(this.pattern.value4);
            }
        }			
        return interval;    		
	},    
        
    /**
     * Get the recurring schedule total occurrences.
     * 
     */
    getTotal: function()  {
		return (this.pattern.total=='') ? 0 : parseInt(this.pattern.total);
    },

    /**
     * Get the recurring schedule days of the week.
     * 
     */
    getDaysOfWeek: function() {
        var daysOfWeek = '';
        var recurringType = this.getRecurringType();
        if (recurringType == 'week') {
            daysOfWeek = this.pattern.value1;
            
        } else if (recurringType == 'month') {           
            daysOfWeek = this.pattern.value2;
        } else if (recurringType == 'year' && this.pattern.value4 != '') {            
            daysOfWeek = this.pattern.value2;
        }
       return daysOfWeek;
    },
    
    /**
     * Get the recurring schedule day of the month.
     * 
     */
    getDayOfMonth: function() {
        var dayOfMonth = 0;
        var recurringType = this.getRecurringType();
		
        if ((recurringType == 'month' && this.pattern.value2 == '')
                || (recurringType == 'year' && this.pattern.value4 == '')) {
            
			if (this.pattern.value1 != '') {
              dayOfMonth = parseInt(this.pattern.value1);
			}
            
        }
        
        return dayOfMonth;
    },
    
    /**
     * Get the recurring schedule week of the month.
     * 
     */
    getWeekOfMonth: function() {
        var weekOfMonth = 0;
    	var weeksOfMonth = [ "1st","2nd","3rd","4th","last" ];
        var recurringType = this.getRecurringType();
		        
        if ((recurringType == 'month' && this.pattern.value2 != '')
                || (recurringType == 'year' && this.pattern.value4 != '')) {

    	    for (var i=0; i<weeksOfMonth.length; i++){
    		   if (weeksOfMonth[i] == this.pattern.value1) {
			     weekOfMonth = i+1;
			   }
    	    }				
        }
        
        return weekOfMonth;
    },
    
    /**
     * Get the recurring schedule month of the year.
     * 
     */
    getMonthOfYear: function() {
        var monthOfYear = 0;
        var monthsOfYear = [ "jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec" ];				
        var recurringType = this.getRecurringType();
		
        if (recurringType == 'year') {
		    var monthStr; 
            
            if (this.pattern.value4 == '') {
                
                monthStr = this.pattern.value2;
            } else {
                
                monthStr = this.pattern.value3;
            }
            
     	    for (var i=0; i<monthsOfYear.length; i++){
    		   if (monthsOfYear[i] == monthStr) {
			     monthOfYear = i+1;
			   }
    	    }				
       }
	   
       return monthOfYear;        
    },
	
	/**
	 * show/hide Date Start field when pattern type changes
	 * do not show if it was permanently hidden
	 */
	showDateStartByType: function(isEnable){
		if(valueExistsNotEmpty(isEnable) && (!isEnable || !this.dateStartHidden)){
			this.editRecurringRule.showField('gp.date_start',isEnable);
		}
		else if (!this.dateStartHidden) {
			this.editRecurringRule.showField('gp.date_start',true);
	  }
	},

	/**
	 * show/hide Date End field when pattern type changes
	 * do not show if it was permanently hidden
	 */
	showDateEndByType: function(isEnable){
		if(valueExistsNotEmpty(isEnable) && (!isEnable || !this.dateEndHidden)){
			this.editRecurringRule.showField('gp.date_end',isEnable);
		}
		else if (!this.dateEndHidden) {
			this.editRecurringRule.showField('gp.date_end',true);
	  }
	},
	
	showRecurringTypes: function(){
		for (var i = 0 ; i < this.recurringTypes.length; i++){
			var type = this.recurringTypes[i];
			if (this.visibleRecurrTypes.indexOf(type) == -1) {
				$("recurringType_" + type).style.display = 'none';
			}
		}
	}

});

RecurringPattern = Base.extend({
    type: '', // recurring type. possible values are none|once|day|week|month|year
    value1: '', // the first value of the selected type
    value2: '', // the second value of the selected type
    value3: '', // the third value of the selected type
    value4: '', // the fourth value of the selected type (TBD: Future use to implement 2nd yearly pattern)
    total: '', // the total value of the selected type
    xmlPattern: '', // the encode xml recurring pattern
    
    constructor: function(xmlPattern){
        this.xmlPattern = xmlPattern;
        if(this.xmlPattern){
        	this.decode();
        }
        
        this.addEventListener();
    },
    
    // add event listener to the interface elements
    addEventListener: function(){
    	var elements = ["day_value1", "week_value2"
                        , "month_type1_value1","month_type2_value1","month_type2_value2","month_value3"
                        , "year_value1","year_value2","year_value3"
                        ,"total"];
    	for(var i=0;i<elements.length;i++){
    		Ext.get(elements[i]).addListener('blur', this.valid, this);
    	}
    	
    	Ext.get("month_type_1").addListener('click', this.onClickMonthTypeCheckBox, this);
    	Ext.get("month_type_2").addListener('click', this.onClickMonthTypeCheckBox, this);
    	Ext.get("year").addListener('click', this.valid, this);
    },
    
    // show recurring pattern in the control interface
    show: function(){
    	 this.clear();
	     this.setTypeField();
	     onSelectRecurringType();
	     this.setValuesByType();
    	
    },
    
    // get recurring pattern from the control interface
    getXmlPattern: function(){
    	this.type = this.getType();
    	this.value1 = this.getFieldValue1();
    	this.value2 = this.getFieldValue2();
    	this.value3 = this.getFieldValue3();
    	this.total = this.getFieldTotal();
    	this.valid();
    	this.encode();
    	
    	return this.xmlPattern;
    	
    },
    
    // decode the xml pattern
    decode: function(){
        var xmlDocument = parseXml(this.xmlPattern, null, true);
        var nodes = selectNodes(xmlDocument, null, '//recurring');
        if (nodes.length > 0) {
            this.type = nodes[0].getAttribute('type');
            this.value1 = nodes[0].getAttribute('value1');
            this.value2 = nodes[0].getAttribute('value2');
            this.value3 = nodes[0].getAttribute('value3');
            this.total = nodes[0].getAttribute('total');
        }
    },
    
    // encode to xml pattern
    encode: function(){
    	if(this.type=='none'){
    		this.xmlPattern = '';
    	}else{
    		this.xmlPattern = '<recurring type="' + this.type + '" value1="' + this.value1 + '"'
            + ' value2="' + this.value2 + '"'
            + ' value3="' + this.value3 + '"'
            + ' total="' + this.total + '"'
            + '/>';
    	}
    },
    
    // set type radio
    setTypeField: function(){
    	var radioButtons = document.getElementsByName('type_option');
	     for (var i = 0; i < radioButtons.length; i++) {
	    	if (radioButtons[i].value == this.type) {
	    		radioButtons[i].checked = true;
	    		break;
	        }
	     }
    },
    
    // set type radio
    setValuesByType: function(){
    	$('total').value = this.total;
    	switch (this.type){
    		case 'day':
    			$('day_value1').value = this.value1;
  			break;
			case 'week':
				$('week_value2').value = this.value2;
				var weekOption = this.value1.split(',');
				for(var i=0;i<weekOption.length;i++){
					$('weekly_'+i).checked = weekOption[i]=='1'?true:false;
				}
  			break;
  			case 'month':
  				$('month_value3').value = this.value3;
  				if(this.value2 =='' && this.value1==''){
  					$('month_type_1').checked = 0;
  					$('month_type_2').checked = 0;
  				}	
  				else if(!this.value2){
  					$('month_type_1').checked = 1;
  					$('month_type_2').checked = 0;
  					$('month_type1_value1').value = this.value1;
  				}else{
  					$('month_type_2').checked = 1;
  					$('month_type_1').checked = 0;
  					$('month_type2_value1').value = this.value1;
  					$('month_type2_value2').value = this.value2;
  				}
  			break;
  			case 'year':
  				$('year_value1').value = this.value1;
  				$('year_value2').value = this.value2;
  				$('year_value3').value = this.value3;
  			break;
			default:
  			;
    	}
    },
    
    
    // get type from the control interface
    getType: function(){
    	return getSelectedRadioButton("type_option");
    	
    },
    
    // get value1 from the control interface
    getFieldValue1: function(){
    	var value1 = '';
    	var type = getSelectedRadioButton("type_option");
    	
        if (type == 'day') {
            value1 = $('day_value1').value;
        }
        
        if (type == 'week') {
            value1 = ((document.getElementById("weekly_0").checked) ? '1' : '0') + ',' +
            ((document.getElementById("weekly_1").checked) ? '1' : '0') +
            ',' +
            ((document.getElementById("weekly_2").checked) ? '1' : '0') +
            ',' +
            ((document.getElementById("weekly_3").checked) ? '1' : '0') +
            ',' +
            ((document.getElementById("weekly_4").checked) ? '1' : '0') +
            ',' +
            ((document.getElementById("weekly_5").checked) ? '1' : '0') +
            ',' +
            ((document.getElementById("weekly_6").checked) ? '1' : '0')
        }
        
        if (type == 'month') {
        	var monthType = getSelectedRadioButton("month_type");
        	if(monthType=='1'){
        		value1 = $('month_type1_value1').value;
        	}else{
        		value1 = $('month_type2_value1').value;
        	}
            
        }
        
        if (type == 'year') {
            value1 = $('year_value1').value;
        }
        
        return value1;
    },
    
    // get type from the control interface
    getFieldValue2: function(){
    	var value2 = '';
    	var type = getSelectedRadioButton("type_option");
        
        if (type == 'week') {
            value2 = $('week_value2').value;
        }
        
        if (type == 'month') {
        	var monthType = getSelectedRadioButton("month_type");
        	if(monthType=='2'){
        		value2 = $('month_type2_value2').value;
        	}
        }
        
        if (type == 'year') {
            value2 = $('year_value2').value;
        }
        
        return value2;
    },
    
    // get type from the control interface
    getFieldValue3: function(){
    	var value3 = '';
    	var type = getSelectedRadioButton("type_option");
        
        if (type == 'month') {
        	value3 = $('month_value3').value;
        }
        
        if (type == 'year') {
            value3 = $('year_value3').value;
        }
        
        return value3;
    	
    },
    
    // get type from the control interface
    getFieldTotal: function(){
    	return  $('total').value;
    	
    },
    
    // clear all interface values
    clear: function(){
    	 this.enable(true);
    	 var radioButtons = document.getElementsByName('type_option');
    	 radioButtons[0].checked = true;
	     for (var i = 1; i < radioButtons.length; i++) {
	    	radioButtons[i].checked = false;
	     }
	     
	     var monthRadio = document.getElementsByName('month_type');
	     for (var i = 0; i < monthRadio.length; i++) {
	    	 monthRadio[i].checked = false;
	     }
	     
	     enabledDay(false);
         enabledWeek(false);
         enabledMonth(false);
         enabledYear(false);
         enableField(["total"],false);
         
         //clear fields values
         clearFieldsValue([ "weekly_0","weekly_1","weekly_2","weekly_3","weekly_4","weekly_5","weekly_6"
                            , "month_type1_value1","month_type2_value1","month_type2_value2","month_value3"
                            , "year_value1","year_value2","year_value3"
                            ,"total"]);
         
         //set default values
         $('day_value1').value = '1';
         
         //KB3035716  - all the "Every XXX" edit boxes should have a default value of 1 on view load
         $('week_value2').value = '1';
         $('month_value3').value = '1';
         $('year_value3').value = '1';
         
    },
    
    // enable or disable all interface values
    enable: function(isEnable){
    	 var radioButtons = document.getElementsByName('type_option');
	     for (var i = 0; i < radioButtons.length; i++) {
	    	radioButtons[i].disabled = !isEnable;
	     }
	     var radioButtons = document.getElementsByName('month_type');
	     for (var i = 0; i < radioButtons.length; i++) {
	    	radioButtons[i].disabled = !isEnable;
	     }
         enableField(["day_value1", "week_value2","weekly_0","weekly_1","weekly_2","weekly_3","weekly_4","weekly_5","weekly_6"
                      , "month_type1_value1","month_type2_value1","month_type2_value2","month_value3"
                      , "year_value1","year_value2","year_value3"
                      ,"total"],isEnable);
         
         if(isEnable){
        	 onSelectRecurringType();
         }
    },
    
    // validate the recurring pattern
    valid: function(event){
    	this.type = this.getType();
    	this.value1 = this.getFieldValue1();
    	this.value2 = this.getFieldValue2();
    	this.value3 = this.getFieldValue3();
    	this.total = this.getFieldTotal();
        
      if (this.total!='') {  // KB 3034744, allow total to be blank
    	  if(!this.isPositiveInteger(this.total)){
    		  this.total = 1;
    	  }
    	}
    	
        if (this.type == 'day') {
        	if(!this.isPositiveInteger(this.value1)){
        		this.value1 = 1;
        	}
        }
        
        if (this.type == 'week') {
        	if(!this.isPositiveInteger(this.value2)){
        		this.value2 = 1;
        	}
        	
        	//KB3034923 - do not automatically checks the "Monday" option when click interface
        	//if(!valueExistsNotEmpty(event) && this.value1.indexOf('1')==-1){
        	//	this.value1 = '1,0,0,0,0,0,0';
        	//}
        }
        
        if (this.type == 'month') {
        	if(!this.isPositiveInteger(this.value3)){
        		this.value3 = 1;
        	}
        	
        	var monthType = getSelectedRadioButton("month_type");
        	if(monthType=='1'){
        		if(!this.isPositiveInteger(this.value1)){
            		this.value1 = 1;
            	}else if(this.value1>31){
            		this.value1 = 31;
            	}
        	}else if(monthType=='2'){
        		if(this.value1==''){
        			this.value1 = '1st'
        		}
        		if(this.value2==''){
        			this.value2 = 'mon'
        		}
        	}else{
        		this.value1 = '';
        	    this.value2 = '';
        	}
        }
        
        if (this.type == 'year') {
        	if(!this.isPositiveInteger(this.value3)){
        		this.value3 = 1;
        	}
        	
        	//if(this.value2==''){
    		//	this.value2 = 'jan'
    		//}
        	
        	if(this.value2!=''){
        		if(!this.isPositiveInteger(this.value1)){
            		this.value1 = 1;
            	}else if(this.value1>29 && this.value2=='feb'){
            		this.value1 = 29;
            	}else if(this.value1>30 && (this.value2=='apr'||this.value2=='jun'||this.value2=='sep'||this.value2=='nov')){
            		this.value1 = 30;
            	}else if(this.value1>31){
            		this.value1 = 31;
            	} 
        	}
        }
        
        this.setValuesByType();
    },
    
    isPositiveInteger: function(value){
    	var bReturned = false; 
    	var objRegExp  = /^[0-9]*[1-9][0-9]*$/;
		if(value!='' && objRegExp.test(value)){
			bReturned = true;
		}
		return bReturned;
    },
    
    onClickMonthTypeCheckBox: function(event){
    	//KB3035716 - fix issue : select Monthly, then select "Day x of month" checkbox.  You then cannot select the other checkbox.
    	if(valueExistsNotEmpty(event)){
    		if(event.target.checked){
    			if(event.target.id == 'month_type_1'){
    				$('month_type_2').checked = false;
    				if(!$('month_type1_value1').value){
    					$('month_type1_value1').value = 1;
    				}
    			}else{
    				$('month_type_1').checked = false;
    				if(!$('month_type2_value1').value){
    					$('month_type2_value1').value = '1st';
    				}
    				
    				if(!$('month_type2_value2').value){
    					$('month_type2_value2').value = 'mon';
    				}
    			}
    		}
    	}
    }
});

/**
 * Returns value of the selected radio button.
 * 
 * @param {name}
 *            Name attribute of the radio button HTML elements.
 */
function getSelectedRadioButton(name){
    var radioButtons = document.getElementsByName(name);
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked == 1) {
            return radioButtons[i].value;
        }
    }
    return "";
}


/**
 * onclick event handler for radio recurring_type.
 */
function onSelectRecurringType(){
    var type = getSelectedRadioButton("type_option");
    if (type == "none") {
        enabledDay(false);
        enabledWeek(false);
        enabledMonth(false);
        enabledYear(false);
        enableField(["total"],false);
        abRecurringPatternCtrl.showDateStartByType(false);
        abRecurringPatternCtrl.showDateEndByType(false);
    }
    if (type == "once") {
        enabledDay(false);
        enabledWeek(false);
        enabledMonth(false);
        enabledYear(false);
        enableField(["total"],false);
        abRecurringPatternCtrl.showDateStartByType(true);
        abRecurringPatternCtrl.showDateEndByType(false);
    }
    if (type == "day") {
        enabledDay(true);
        enabledWeek(false);
        enabledMonth(false);
        enabledYear(false);
        enableField(["total"],true);
    }
    if (type == "week") {
        enabledDay(false);
        enabledWeek(true);
        enabledMonth(false);
        enabledYear(false);
        enableField(["total"],true);
    }
    if (type == "month") {
        enabledDay(false);
        enabledWeek(false);
        enabledMonth(true);
        enabledYear(false);
        enableField(["total"],true);
    }
    if (type == "year") {
        enabledDay(false);
        enabledWeek(false);
        enabledMonth(false);
        enabledYear(true);
        enableField(["total"],true);
    }
    if (type != "none" && type != "once" ) {
        abRecurringPatternCtrl.showDateStartByType(true);
        abRecurringPatternCtrl.showDateEndByType(true);
    }
    
    //add note
    addNote();
    
    //display area by type
    displayAreaBytype(type);
}

/**
 * enable or disable the radio 'day'.
 * 
 * @param {isEnabled}
 *            is enable.
 */
function enabledDay(isEnabled){
    enableField(["day_value1"],isEnabled);
}

/**
 * enable or disable the radio 'week'.
 * 
 * @param {isEnabled}
 *            is enable.
 */
function enabledWeek(isEnabled){
    enableField(["week_value2","weekly_0","weekly_1","weekly_2","weekly_3","weekly_4","weekly_5","weekly_6"],isEnabled);
}

/**
 * enable or disable the radio 'month'
 * 
 * @param {isEnabled}
 *            is enable.
 */
function enabledMonth(isEnabled){
    enableField(["month_type1_value1","month_type2_value1","month_type2_value2","month_value3"],isEnabled);
}

/**
 * enable or disable the radio 'year'.
 * 
 * @param {isEnabled}
 *            is enable.
 */
function enabledYear(isEnabled){
    enableField(["year_value1","year_value2","year_value3"],isEnabled);
}

/**
 * enable or disable field element
 * 
 * @param {isEnabled}
 *            is enable.
 */
function enableField(fields, isEnabled){
	for(var i=0;i<fields.length;i++){
		var field = $(fields[i]);
		field.disabled = !isEnabled;
	}
}

/**
 * clear field value or checks
 * 
 */
function clearFieldsValue(fields){
	for(var i=0;i<fields.length;i++){
		var field = $(fields[i]);
		field.value = '';
		field.checked = false;
	}
}

/**
 * add note to the control
 * 
 */
function addNote(){
	var note = '';
	var controller = View.controllers.get('abRecurringPatternCtrl');
	var type = getSelectedRadioButton("type_option");
	var schedulingLimit = controller.schedulingLimits[type];
	if (valueExistsNotEmpty(schedulingLimit) && schedulingLimit != -1) {
		note = getMessage("noteSchedulingLimits").replace('{0}', schedulingLimit);
	}
    
	Ext.get('control_note').update(note);
}

/**
 * diaplay area by recurring type
 * 
 */
function displayAreaBytype(type){
	//hide all area first
	Ext.get('div_once').setDisplayed(false);
	Ext.get('div_day').setDisplayed(false);
	Ext.get('div_week').setDisplayed(false);
	Ext.get('div_month').setDisplayed(false);
	Ext.get('div_year').setDisplayed(false);
	
	//display given area only
	var area = Ext.get('div_'+type);
	if(area){
		area.setDisplayed(true);
	}
}

/**
 * Returns localized description for recurring rule
 * @param xmlRecurringRule xml rule defintion
 * @returns string
 */
function getRecurringRuleDescription(xmlRecurringRule){
	if (valueExistsNotEmpty(xmlRecurringRule)) {
		try {
			var result = Workflow.callMethod("AbCommonResources-RecurringScheduleService-getRecurringPatternDescription", xmlRecurringRule);
			return result.message;
		} catch (e) {
			Workflow.handleError(e);
		}
	}
}
