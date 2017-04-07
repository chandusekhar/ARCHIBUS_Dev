<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="../../../ab-system/xsl/constants.xsl" />
  <xsl:variable name="activityGraphic">ab-activity-emrelations-mgr.gif</xsl:variable>
  <xsl:variable name="activity_graphic" translatable="true">Activity Graphic</xsl:variable>
	<xsl:variable name="restOp1">=</xsl:variable>
	
	<!-- restConj1 is the retriction conjuntion for the first field in
	     our form:  AND, OR, ) AND (, etc. -->
	<xsl:variable name="restConj1">AND</xsl:variable>
	
	<!-- restField1 is the first field we are restricting on.
	    Must be in the form: table.field, where the table is a source
	    for the table group we are restricting. -->
	<xsl:variable name="restField1">visitors.visitor_id</xsl:variable>

  <!-- Define the op, conj and field name  for the second restriction field.  -->
	<xsl:variable name="restOp2">LIKE</xsl:variable>
	<xsl:variable name="restConj2">AND</xsl:variable>
	<xsl:variable name="restField2">visitors.name_last</xsl:variable>

  <!-- specified XSLT variables for this XSLT file -->
  <!-- totalRowsForFilter indicates the number of restriction clauses.  -->
	<xsl:variable name="totalRowsForFilter" select="2" />
  <xsl:template match="/">
    <html>
      <title>
        <xsl:value-of select="/*/title" />
        <xsl:value-of select="$whiteSpace" />
      </title>
      <head>
        <!-- LinkingCSS in common.xsl includes the default style sheets -->
        <xsl:call-template name="LinkingCSS" />
        <!-- afmJavascript includes necessary javascript files -->
        <xsl:call-template name="afmJavascript" />
        <!-- template: SetUpLocales is in locale.xsl -->
        <xsl:call-template name="SetUpLocales" />
        <script language="javascript">
          iTotalRowsForFilter=<xsl:value-of select="$totalRowsForFilter"/>;
          
         // Custom validation for this form: visitor must enter an id or name
	function sendingDatacustom(strUrl, strSerialized, strTarget, subFrameName ,bData, newWindowSettings)
	{
		var objForm  = document.forms[afmInputsFormName];
		var strValue1 = objForm.elements['values1'].value;
		var strValue2 = objForm.elements['values2'].value;
		// nested if statements because embedding javascript 'and' operator in XSL isn't straightforward
		if (strValue1 == "")
			if (strValue2 == "")
			{
				alert("<xsl:value-of select='//message[@name="noRestrictionError"]' />");
				return;
			}
		sendingDataFromHiddenForm(strUrl, strSerialized, strTarget, subFrameName ,bData, newWindowSettings);
	}
        </script>

      </head>
      <!-- Any initialization can be done in the body onLoad attribute. -->
      <body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
        <xsl:call-template name="SetUpFieldsInformArray">
          <xsl:with-param name="fieldNodes"
                          select="/*/afmTableGroup/dataSource/data/availableFields" />
        </xsl:call-template>
        <table width="100%" valign="top" style="border-collapse: collapse">
          <tr><td>
              <table class="alterViewTopFrame">
                <tr><td class="alterViewTopFrameTitle">
                		<h1>
                  		<xsl:value-of select="/*/title" />
                  		<xsl:value-of select="$whiteSpace" />
                  		</h1>
                </td></tr>
              </table>
          </td></tr>        
          <tr><td valign="top">
            <!-- begin the filter form.  afmInputsForm is defined in constants.xsl -->
            <form name="{$afmInputsForm}">
              <table style="border-collapse: collapse">
                <tr><td>
                  <img alt="{$activity_graphic}" src="{$abSchemaSystemGraphicsFolder}/{$activityGraphic}">
                  <xsl:value-of select="$whiteSpace" /></img>
                </td>
                <td valign="top">
                  <!-- Call the AfmTableGroup template to output the form controls here.  -->
                  <xsl:call-template name="AfmTableGroup">
                    <xsl:with-param name="afmTableGroup" select="//afmTableGroup"/>
                  </xsl:call-template>
                </td></tr>  
              </table>
            </form>
          </td></tr>
        </table>
        <xsl:call-template name="common">
          <xsl:with-param name="title" select="/*/title"/>
          <xsl:with-param name="debug" select="//@debug"/>
          <xsl:with-param name="afmHiddenForm" select="$afmHiddenForm"/>
          <xsl:with-param name="xml" select="$xml"/>
          <xsl:with-param name="afmInputsForm" select="$afmInputsForm"/>
        </xsl:call-template>
      </body>
    </html>
  </xsl:template>
  <xsl:template name="afmJavascript">
    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js">
      <xsl:value-of select="$whiteSpace" />
    </script>
    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js">
      <xsl:value-of select="$whiteSpace" />
    </script>
    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js">
      <xsl:value-of select="$whiteSpace" />
    </script>
    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/inputs-validation.js">
      <xsl:value-of select="$whiteSpace" />
    </script>
    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-common-filter.js">
      <xsl:value-of select="$whiteSpace" />
    </script>
  </xsl:template>
  <xsl:template name="AfmTableGroup">
    <xsl:param name="afmTableGroup"/>
      <table align="center">
      
        <tr><td>
          <!-- the content of filter form -->
          <xsl:call-template name="afmFilterFormContent">
            <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
          </xsl:call-template>
        </td></tr>
        <tr>
          <td class="instruction">
            <xsl:value-of select="//message[@name='instructionText']" />
          </td>
        </tr>
      </table>
  </xsl:template>

  <xsl:template name="afmFilterFormContent">
    <xsl:param name="afmTableGroup"/>
    <xsl:variable name="restrictionNode" select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']"/>
  
    <xsl:variable name="afmAction" select="$afmTableGroup/dataSource/data/forFields/field/afmAction[@type='selectValue']"/>
    <table>
      <tr class="legendTitle">
        <td colspan="3">
          <xsl:value-of select="//message[@name='label1']" />
        </td>
        <td>
          <xsl:value-of select="$whiteSpace" />
        </td>
        <td colspan="2">
          <xsl:value-of select="//message[@name='label2']" />
        </td>
      </tr>
      <tr><td>
    		<input type="hidden" name="operator1" value="{$restOp1}"/>
    		<input type="hidden" name="conjunction1" value="{$restConj1}"/>
    		<input type="hidden" name="field1" value="{$restField1}"/>
		<input class="inputField" id="values1" name="values1" title="Visitor ID"
		type="text" value="{translate($restrictionNode//field[concat(@table,'.',@name)=$restField1]/ancestor::clause/@value,'%','')}"
		onblur="validationInputs(1)"/>
       </td>     
      <td>
        <input class="AbActionButtonFormStdWidth" name="selectV1" type="button"
               title="Click to View Select List" value="{$afmAction/title}"
               onclick='onSelectV("{$afmAction/@serialized}",1); selectValueInputFieldID="values1";'/>
      </td>
      <td>
        <xsl:value-of select="$whiteSpace" />
      </td>
      <td>
        <xsl:value-of select="$whiteSpace" />
      </td>
      <td>
    		<input type="hidden" name="operator2" value="{$restOp2}"/>
    		<input type="hidden" name="conjunction2" value="{$restConj2}"/>
    		<input type="hidden" name="field2" value="{$restField2}"/>
		<input class="inputField" id="values2" name="values2" title="Visitor Last Name"
		       type="text" value="{translate($restrictionNode//field[concat(@table,'.',@name)=$restField2]/ancestor::clause/@value,'%','')}"
		       onblur="validationInputs(2)"/>
      </td>
      <td>
		<input class="AbActionButtonFormStdWidth" name="selectV2" type="button"
		       title="Click to View Select List" value="{$afmAction/title}"
		       onclick='onSelectV("{$afmAction/@serialized}",2); selectValueInputFieldID="values2";'/>
      </td>
      <td>
        <table><tr>
       		<xsl:variable name="OKAfmAction" select="//afmAction[@type='applyRestriction1']"/>
			<input  class="AbActionButtonFormStdWidth" type="button" value="{$OKAfmAction/title}" title="{$OKAfmAction/title}" onclick='sendingDatacustom("","{$OKAfmAction/@serialized}","_parent","{$OKAfmAction/subFrame/@name}",true,"")'/>
        </tr></table>
      </td>
    </tr></table>
  </xsl:template>
  <!-- include XSL files that contain templates used above -->
  <xsl:include href="../../../ab-system/xsl/common.xsl" />
  <xsl:include href="../../../ab-system/xsl/locale.xsl" />
  <xsl:include href="../../../ab-system/xsl/inputs-validation.xsl" />
  <xsl:include href="../../../ab-system/xsl/ab-actions-bar.xsl" />
</xsl:stylesheet>
