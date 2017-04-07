var controller = View.createController('abEmException_Control', {
	type:'',
	/**
     * event handler after View Load
     */
	afterViewLoad: function(){
    	this.appendSelector("abSpExc_title",0);
    	this.abSpExc2.show(false);
    	this.abSpExc3.show(false);
    },
    /**
     * append selector
     */
    appendSelector: function(panelID,num){
        this.selectedScenario = null;
        var scenarioList_title_td = Ext.get('scenarioList_title_td');
        if (scenarioList_title_td != null) {
            scenarioList_title_td.remove();
        }
        var scenarioList_selector_td = Ext.get('scenarioList_selector_td');
        if (scenarioList_selector_td != null) {
            scenarioList_selector_td.remove();
        }
        
        var titleNode = document.getElementById(panelID);
        if (titleNode == null) 
            return;
        
        var items=[getMessage('option1'),getMessage('option2'),getMessage('option3')];
        var selectValues=["1","2","3"];
        var tot = items.length;
        var names = new Array();
        var nameIdMap = new Object();
        for (var i = 0; i < tot; i++) {
            var name = items[i];
            var selectValue=selectValues[i];
            names[names.length] = name;
            nameIdMap[name] = selectValue;
        }
        
        // If there are 0 or 1 records, there is no need to display the combo
        if (names.length < 1) 
            return;
        
        var prompt = getMessage('option0');
        var pn = titleNode.parentNode.parentNode;
        var cell = Ext.DomHelper.append(pn, {
            tag: 'td',
            id: 'scenarioList_title_td'
        });
        var tn = Ext.DomHelper.append(cell, '<p>' + prompt + '</p>', true);
        Ext.DomHelper.applyStyles(tn, "x-btn-text");
        cell = Ext.DomHelper.append(pn, {
            tag: 'td',
            id: 'scenarioList_selector_td'
        });
        var combo = Ext.DomHelper.append(cell, {
            tag: 'select',
            id: 'selector_' + "scenarioList"
        }, true);
        
        //kb:3037743,Employee Exception: first exception is alway shown as the selection no matter which exception you selected. changed for chrome nav.
        combo.dom.options[num] = new Option(names[num], nameIdMap[names[num]]);
        combo.dom.selectedIndex = num;

        for (var i = 0; i < names.length; i++) {
        	if(i!=num){
        		combo.dom.options[i] = new Option(names[i], nameIdMap[names[i]]);
        	}
        }
        
        combo.on('change', this.changeScenario, this, {
            delay: 100,
            single: false
        });
        
        this.type = combo.dom.value;
    },
    /**
     * change scenario
     */
    changeScenario: function(e, combo){
    	var selectType=combo.value;
    	var grid=controller.abSpExc;
    	switch (selectType)
 	   {
 	   case "1":
 		   this.abSpExc2.show(false);
 		   this.abSpExc3.show(false);
 		   this.appendSelector("abSpExc_title",0);
 		   this.abSpExc.show(true);
 		   break;
 	   case "2":
 		  this.abSpExc.show(false);
 		  this.abSpExc3.show(false);
 		  this.appendSelector("abSpExc2_title",1);
 		  this.abSpExc2.show(true);
 		  this.abSpExc2.refresh();
 		  break;
 	   case "3":
 		  this.abSpExc.show(false);
 		  this.abSpExc2.show(false);
 		  this.appendSelector("abSpExc3_title",2);
 		  this.abSpExc3.show(true);
 		  this.abSpExc3.refresh();
 		  break;
 	}
    }
})