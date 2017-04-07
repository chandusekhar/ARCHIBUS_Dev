/**
 * @author Guo
 */
var controller = View.createController('setHighlightPattern_Controller', {
    openerView: null,
    patterns: null,
    patternNames: null,
    
    afterInitialDataFetch: function(){
    	
    	this.populateSelectOptions(); 

        $('id_set_color').value = getMessage('setColor');
        this.openerView = View.getOpenerView();
        createOptionForColorName();
        var patternString = this.openerView.patternString;
        if (patternString) {
            var pattern = this.decodePattern(patternString);
            setLayoutByPattern(pattern);
        }else{
        	onSelectHighlightStyle();
        }
    },
    
    populateSelectOptions: function(){
    	try {
            var result = Workflow.call('AbCommonResources-HighlightPatternService-getHatchPatterns');
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
        var res = eval("(" + result.jsonExpression + ")");
        if(res){
	        this.patterns = {};
        	this.patternNames = new Array();
	        
	        for(var i=0; i < res.length; i++) {
	       	 	var pattern = eval("(" + res[i] + ")");
	       	 	this.patterns[pattern.name] = pattern;
	       	 	this.patternNames[i] = pattern.name;
	        }
	        
	        //sort
	        this.patternNames.sort();
	        
	        //reset the options
        	var select = document.getElementById('id_select_hatch_pattern');
	        select.options.length = 0; // clear out existing items
	        
			for (var i=0;i<this.patternNames.length;i++) {
	            select.options[i] = new Option(this.patternNames[i], this.patternNames[i]);
	        }
	        onChangeHatchPatternName();
        }
    },
    
    setHighlightPatternDialog_onOk: function(){
        this.encodePattern();
    },
    
    setHighlightPatternDialog_onCancel: function(){
        View.closeThisDialog();
    },
    
    encodePattern: function(){
        var pattern = new Object();
        pattern.style = getSelectedRadioValue('highlightStyle');
		
        if (pattern.style == "0") {
            pattern.colorIndex = $('id_color_index').value;
            
            var rgbColor = $("colorDiv").colorValue;
            if(valueExistsNotEmpty(rgbColor) && rgbColor.substring(0, 1) != '#'){
                    rgbColor =  '#'+ rgbColor ;
            }

            pattern.rgbColor = "";
            if (!pattern.colorIndex && rgbColor) {
                pattern.rgbColor = rgbColor;
            }
        }
        
        if (pattern.style == "1") {
            pattern.colorIndex = $('id_color_index').value;
            var rgbColor = $("colorDiv").colorValue;
            if(valueExistsNotEmpty(rgbColor) && rgbColor.substring(0, 1) != '#'){
                    rgbColor =  '#'+ rgbColor ;
            }

            pattern.rgbColor = "";
            if (!pattern.colorIndex && rgbColor) {
                pattern.rgbColor = rgbColor;
            }
            pattern.patternName = $('id_select_hatch_pattern').value;
            if (!pattern.patternName) {
                View.showMessage(getMessage("selectPatternName"));
                return;
            }
            pattern.scale = $('id_text_scale').value;
            if (!pattern.scale) {
                View.showMessage(getMessage('setHatchScale'));
                return;
            }
            pattern.angle = $('id_text_angle').value;
            if (!pattern.angle) {
                View.showMessage(getMessage('setHatchAngle'));
                return;
            }
        }
        
        if (pattern.style == "3") {
            var gradientNameWithPrefix = $('id_select_gradient_pattern').value;
            if (!gradientNameWithPrefix) {
                View.showMessage(getMessage('selectGradientName'));
                return;
            }    
                        
            var index = gradientNameWithPrefix.indexOf("gradient_");
            if(index>=0){
            	pattern.gradientName = gradientNameWithPrefix.substr(index+9,gradientNameWithPrefix.length-index-9).toUpperCase();
            } else {
            	pattern.gradientName = gradientNameWithPrefix.toUpperCase();
            }
            
            pattern.angle = 0.0;
            if ($('id_gradient_angle').value) {
                pattern.angle = $('id_gradient_angle').value;
            }
            
            pattern.centerOffset = $('id_center_check').checked ? 1 : 0;
            pattern.gradientColor0 = $("id_text_one").colorValue;
            if (!pattern.gradientColor0) {
                View.showMessage(getMessage('setGradientColor0'));
                return;
            }
            pattern.gradientColor1 = $("id_text_two").colorValue;
            if (!pattern.gradientColor1) {
                View.showMessage(getMessage('setGradientColor1'));
                return;
            }
            
            pattern.gradientValue0 = 0.0;
            pattern.gradientValue1 = 1.0;
        }
		
        var parameters = {
            "pattern": toJSON(pattern)
        };
        
        try {
            var result = Workflow.call('AbCommonResources-HighlightPatternService-encodePattern', parameters);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        var encodePatternString = result.jsonExpression;
		if(this.openerView.hpatternPanel!='undefined' && this.openerView.hpatternPanel!=null ){
	        this.openerView.hpatternPanel.setFieldValue(this.openerView.hpatternField, result.jsonExpression);
		}
		else{
			this.openerView.controllers.get('createHPatternGridController').afterSaveHPattern(result.jsonExpression);
		}
        View.closeThisDialog();
    },
    
    decodePattern: function(patternString){
        var parameters = {
            "patternString": patternString //'14 3 INVSPHERICAL 0.0000 1 4227072 0.0000 16777215 1.0000'
        };
        
        try {
            var result = Workflow.call('AbCommonResources-HighlightPatternService-decodePattern', parameters);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
        return eval("(" + result.jsonExpression + ")");
    }
});

/**
 * onchange event handler for radio input 'highlightStyle'.
 */
function onSelectHighlightStyle(){
    var style = getSelectedRadioValue('highlightStyle');
    switch (style) {
        case '0':{
            disableLayout("colorLayout", false);
            disableLayout("hatchPropertyLayout", true);
            disableLayout("gradientLayout", true);
            setColorLayoutByRadio();
            break;
        }
        case '1':{
            disableLayout("colorLayout", false);
            disableLayout("hatchPropertyLayout", false);
            disableLayout("gradientLayout", true);
            setColorLayoutByRadio();
            break;
        }
        case '3':{
            disableLayout("colorLayout", true);
            disableLayout("hatchPropertyLayout", true);
            disableLayout("gradientLayout", false);
            break;
        }
    }
}

/**
 * onchange event handler for radio input 'colorRadio'.
 */
function onSelectColorRadio(){
	$('id_color_index').value = '';
	$('id_select_name').value = '';
	$("colorDiv").colorValue = "";
	setColor('#f6f5ec');
	setColorLayoutByRadio();
}

/**
 * set layout by radio input 'colorRadio' value.
 */
function setColorLayoutByRadio(){
    var value = getSelectedRadioValue('colorRadio');
    switch (value) {
        case '1':{
            disableElement("id_color_index", false);
            disableElement("id_select_name", true);
            disableElement("id_set_color", true);
            break;
        }
        case '2':{
            disableElement("id_color_index", true);
            disableElement("id_select_name", false);
            disableElement("id_set_color", true);
            break;
        }
        case '3':{
            disableElement("id_color_index", true);
            disableElement("id_select_name", true);
            disableElement("id_set_color", false);
            break;
        }
    }
}

/**
 * disable html element.
 * @param {Id} String
 * @param {isDisable} Boolean
 */
function disableElement(Id, isDisable){
    Ext.get(Id).dom.disabled = isDisable;
}

/**
 * disable Layout.
 * @param {layoutName} String
 * @param {isDisable} Boolean
 */
function disableLayout(layoutName, isDisable){
    switch (layoutName) {
        case "colorLayout":{
            disableElement('id_number', isDisable);
            disableElement('id_color_index', isDisable);
            disableElement('id_name', isDisable);
            disableElement('id_select_name', isDisable);
            disableElement('id_true_color', isDisable);
            disableElement('id_set_color', isDisable);
            break;
        }
        case "hatchPropertyLayout":{
            disableElement('id_select_hatch_pattern', isDisable);
            disableElement('id_text_scale', isDisable);
            disableElement('id_text_angle', isDisable);
            break;
        }
        case "gradientLayout":{
            disableElement('id_text_one', isDisable);
            disableElement('id_button_one', isDisable);
            disableElement('id_text_two', isDisable);
            disableElement('id_button_two', isDisable);
            disableElement('id_center_check', isDisable);
            disableElement('id_gradient_angle', isDisable);
            disableElement('id_select_gradient_pattern', isDisable);
            break;
        }
    }
}

/**
 * returns value of the selected radio button.
 * @param {name} String Name attribute of the radio button HTML elements
 */
function getSelectedRadioValue(name){
    var radioButtons = document.getElementsByName(name);
    
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked == 1) {
            return radioButtons[i].value;
        }
    }
    return null;
}

/**
 * onchange event handler for text input 'id_color_index'.
 */
function onChangeNumber(){
    $('id_select_name').value = "";
    var element = $('id_color_index');
    var isValid = validationNumeric(element, 100, true);
    if (isValid) {
        var value = parseFloat(element.value);
        if (value > 255) {
            View.showMessage(getMessage('notInRange'));
            return;
        }
        else {
            setColor(value);
        }
    }
}

/**
 * onchange event handler for select 'id_select_name'.
 */
function onChangeName(){
    var value = $('id_select_name').value;
    if (value) {
        setColor(value);
        var textNumberElement = $('id_color_index');
        textNumberElement.disabled = false;
        textNumberElement.value = value;
    }
}

/**
 * onchange event handler for select 'id_select_hatch_pattern'.
 */
function onChangeHatchPatternName(){
    var value = $('id_select_hatch_pattern').value;
    $('id_text_scale').value = controller.patterns[value].scale;
    $('id_text_angle').value = controller.patterns[value].angle;
    setBackGroudImage('hatchDiv', value);
}

/**
 * onchange event handler for text input 'id_text_scale'.
 */
function onChangeHatchScale(){
    var element = $('id_text_scale');
    var isValid = validationNumeric(element, 100, true);
}

/**
 * onchange event handler for text input 'id_text_angle'.
 */
function onChangeHatchAngle(){
    var element = $('id_text_angle');
    var isValid = validationNumeric(element, 100, true);
}


/**
 * onchange event handler for text input 'id_gradient_angle'.
 */
function onChangeGradientAngle(){
    var element = $('id_gradient_angle');
    var isValid = validationNumeric(element, 100, true);
}

/**
 * onchange event handler for select 'id_select_hatch_pattern'.
 */
function onChangeGradientPatternName(){
    var value = $('id_select_gradient_pattern').value;
    setBackGroudImage('gradientDiv', value);
}

/**
 * set color accoring color radio value and input value.
 */
function setColor(inputValue, isRGB){
    var color = null;
    if (isRGB) {
        color = inputValue;
    }
    else {
        color = gAcadColorMgr.getRGB(inputValue, true, false);
    }
    var colorDiv = Ext.get('colorDiv');
    // colorDiv.setStyle('background-color', '#' + color);
    colorDiv.setStyle('background-color', color.indexOf('#')== -1 ? '#' + color: color);
}

/**
 * create 7 option for  <SELECT id="id_select_name">.
 */
function createOptionForColorName(){
    var colorNames = [];
    colorNames.push(getMessage('BLACK'));
    colorNames.push(getMessage('RED'));
    colorNames.push(getMessage('YELLOW'));
    colorNames.push(getMessage('GREEN'));
    colorNames.push(getMessage('CYAN'));
    colorNames.push(getMessage('BLUE'));
    colorNames.push(getMessage('MAGENTA'));
    colorNames.push(getMessage('WHITE'));
    
    var selectElement = $('id_select_name');
    var optionData = null;
    for (var i = 0; i < 8; i++) {
        optionData = new Option(colorNames[i], i);
        selectElement.options[selectElement.options.length] = optionData;
    }
}

/**
 * set true color.
 */
function setTrueColor(){
    $('id_select_name').value = "";
    $('id_color_index').value = "";
    oColorPicker = $("colorDiv");
    showColorPicker();
}

/**
 * set GradientColor1.
 */
function setGradientColor1(){
    oColorPicker = $("id_text_one");
    showColorPicker();
}

/**
 * set GradientColor2.
 */
function setGradientColor2(){
    oColorPicker = $("id_text_two");
    showColorPicker();
}

/**
 * set block element backgroud image.
 */
function setBackGroudImage(id, fileName){
    if (fileName) {
        var url = View.getBaseUrl() + '/schema/ab-core/graphics/hpatterns/' + fileName + '.png';
        Ext.get(id).setStyle('background-image', 'url(' + url + ')');
    }
    else {
        Ext.get(id).setStyle('background-image', '');
    }
}

/**
 * set layout by pattern.
 */
function setLayoutByPattern(pattern){
    var style = pattern.style;
    switch (style) {
        case 'SOLID':{
            $('id_solid').checked = true;
            setColorLayout(pattern);
            onSelectHighlightStyle();
            break;
        }
        case 'HATCHED':{
            $('id_hatch').checked = true;
            setColorLayout(pattern);
            setHatchLayout(pattern);
            onSelectHighlightStyle();
            break;
        }
        case 'GRADIENT':{
            $('id_gradent').checked = true;
			onSelectHighlightStyle();
            setGradientLayout(pattern);
            break;
        }
    }
}

/**
 * set color layout.
 */
function setColorLayout(pattern){
    var colorIndex = pattern.colorIndex;
	var rgbColor = pattern.rgbColor;
    if (colorIndex==7 && rgbColor != 'ffffff') {
		$('id_true_color').checked = true;        
        setColor(rgbColor, true);
        $("colorDiv").colorValue = '#' + rgbColor;
        disableElement("id_color_index", true);
        disableElement("id_select_name", true);       
    }
    else {
       $('id_color_index').value = colorIndex;
        if (colorIndex < 8) {
            $('id_name').checked = true;
            disableElement("id_color_index", true);
            $('id_select_name').selectedIndex = colorIndex + 1;
        }
        setColor(colorIndex);
        disableElement("id_set_color", true);
    }
}

/**
 * set hatch layout.
 * ensure that this collection  is kept in synch with associated axvw's select AND HighlightPatternService.java
 */
function setHatchLayout(pattern){
    var patternName = pattern.patternName;

    if(controller.patterns[patternName] != 'undefined'  ){
		$('id_select_hatch_pattern').value = patternName;
		$('id_text_scale').value = pattern.scale;
		$('id_text_angle').value = pattern.angle;
	    setBackGroudImage('hatchDiv', patternName);
	}
}


/**
 * set gradient layout.
 */
function setGradientLayout(pattern){
    var gradientName = 'gradient_' + pattern.gradientName.toLowerCase();
    gradientIndex = 0;
    switch (gradientName) {
        case 'gradient_curved':{
            gradientIndex = 1;
            break;
        }
        case 'gradient_cylinder':{
            gradientIndex = 2;
            break;
        }
        case 'gradient_hemispherical':{
            gradientIndex = 3;
            break;
        }
        case 'gradient_invcurved':{
            gradientIndex = 4;
            break;
        }
        case 'gradient_invcylinder':{
            gradientIndex = 5;
            break;
        }
        case 'gradient_invhemispherical':{
            gradientIndex = 6;
            break;
        }
        case 'gradient_invspherical':{
            gradientIndex = 7;
            break;
        }
        case 'gradient_linear':{
            gradientIndex = 8;
            break;
        }
        case 'gradient_spherical':{
            gradientIndex = 9;
            break;
        }
    }
    $('id_select_gradient_pattern').selectedIndex = gradientIndex
    $('id_text_one').style.backgroundColor = '#' + pattern.gradientColor0;
    $('id_text_two').style.backgroundColor = '#' + pattern.gradientColor1;
    $('id_text_one').colorValue = '#' + pattern.gradientColor0;
    $('id_text_two').colorValue = '#' + pattern.gradientColor1;
    $('id_center_check').checked = pattern.centerOffset == "1" ? true : false;
    $('id_gradient_angle').value = pattern.angle;
    onChangeGradientPatternName();
}

