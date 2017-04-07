<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:import href="constants.xsl" />

  <!-- specified XSLT variables for this XSLT file -->
  <!-- totalRowsForFilter indicates the number of restriction clauses.  -->
	<xsl:variable name="totalRowsForFilter" select="2" />

	<!-- Get the absolute path to the graphics folder -->
	<xsl:variable name="abSchemaSystemGraphicsFolder"
	              select="//preferences/@abSchemaSystemGraphicsFolder" />
    <xsl:variable name="activity_graphic" translatable="true">Activity Graphic</xsl:variable>
	<!-- Here we are matching the root element of the XML view document and replacing it with the
	      actual HTML that will be rendered by the browser.  -->
  <xsl:template match="/">
    <html lang="EN">
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
      </head>
      <!-- Any initialization can be done in the body onLoad attribute. -->
      <body class="body" leftmargin="0" rightmargin="0" topmargin="0" bottomMargin="0">
        
        <!--  SetUpFieldsInformArray in inputs-validation.xsl creates the field
              information array that is used by the javascript form event handlers. -->
        <xsl:call-template name="SetUpFieldsInformArray">
          <xsl:with-param name="fieldNodes"
                          select="/*/afmTableGroup/dataSource/data/availableFields" />
        </xsl:call-template>
        
        <!-- This section changes the iTotalRowsForFilter value (used in ab-common-fitler.js)
              with the number defined in totalRowsForFilter above.   -->
        <script language="javascript">
          iTotalRowsForFilter=<xsl:value-of select="$totalRowsForFilter"/>;
        </script>
     
        <table width="100%" valign="top" cellpadding="0" cellspacing="0">
          <tr><td>
              <!-- Use standard table and field classes to control formatting -->
              <table class="topTitleBarTable">
                <tr><td class="topTitleBarTableTitle">
                  <!-- Add the title of this view header -->
                  <xsl:value-of select="/*/title" />
                  <xsl:value-of select="$whiteSpace" />
                </td></tr>
              </table>
          </td></tr>        
          <tr><td valign="top">
            <!-- begin the filter form.  afmInputsForm is defined in constants.xsl -->
            <form name="{$afmInputsForm}">
              <table>
                <tr><td>
                
                  <!--  $activityGraphic should be defined in the including XSL -->
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
          <tr><td class="instruction">
            <!-- Help text -->
            <!--  A message element with the name 'instructionText' should
                be present in the AXVW file.  -->
              <xsl:value-of select="//message[@name='instructionText']" />
          </td></tr>
        </table>
        <!-- calling common template common.xsl to add standard content used by the server
                for processing -->
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
    <!-- common.js - Common variables and functions -->
    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js">
      <xsl:value-of select="$whiteSpace" />
    </script>
    <!-- locale.js - Functions for localized formatting of currency and numbers -->
    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/locale.js">
      <xsl:value-of select="$whiteSpace" />
    </script>
    <!-- date-time.js - Functions for localized formatting of dates and times -->
    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/date-time.js">
      <xsl:value-of select="$whiteSpace" />
    </script>
    <!-- inputs-validation.js - Functions for formatting and validating user input in forms -->
    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/inputs-validation.js">
      <xsl:value-of select="$whiteSpace" />
    </script>
    <!-- ab-common-filter.js - Event handling functions for restriction filter forms -->
    <script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/ab-common-filter.js">
      <xsl:value-of select="$whiteSpace" />
    </script>
  </xsl:template>
  <xsl:template name="AfmTableGroup">
    <xsl:param name="afmTableGroup"/>

    <!-- Get the node containing the parsed restrictions on this table group -->
    <xsl:variable name="restrictionNode"
      select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']"/>
    
    <!-- Get the node containing the actions that are allowed for this form -->
    <xsl:variable name="afmAction"
      select="$afmTableGroup/dataSource/data/forFields/field/afmAction[@type='selectValue']"/>
    <table>
      <!-- first row contains field labels  -->
      <!--  Our field labels are defined in the AXVW file, in message elements
          with names of label1 and label2  -->
      <tr class="legendTitle">
        <td colspan="2">
          <xsl:value-of select="//message[@name='label1']" />
        </td>
        <td>
          <xsl:value-of select="$whiteSpace" />
        </td>
      </tr>
      <tr><td>
       
	<input type="hidden" name="operator1" value="{$restOp1}"/>
	<input type="hidden" name="conjunction1" value="{$restConj1}"/>
	<input type="hidden" name="field1" value="{$restField1}"/>
 		    <xsl:variable name="restrictionValue" select="$restrictionNode//field[concat(@table, '.', @name) = $restField1]/ancestor::clause" />
        <input class="inputField" id="values1" name="values1" title="Values 1"
               type="text" value="{translate($restrictionValue/@value,'%','')}"
               onblur="validationInputs(1);validationAndConvertionDateAndTime(1)"
	       onkeypress="return disableInputEnterKeyEvent( event)"/>
           
      </td>
      <td>
       
        <input class="AbActionButtonFormStdWidth" name="selectV1" type="button"
               title="{$afmAction/title}" value="{$afmAction/title}"
               onclick='onSelectV("{$afmAction/@serialized}",1); selectValueInputFieldID="values1";'/>
      </td>
      <td>
        <xsl:value-of select="$whiteSpace" />
      </td></tr>
      <tr class="legendTitle">
        <td colspan="2">
          <xsl:value-of select="//message[@name='label2']" />
        </td>
        <td>
          <xsl:value-of select="$whiteSpace" />
        </td>
      </tr>
      <tr><td>
	<input type="hidden" name="operator2" value="{$restOp2}"/>
	<input type="hidden" name="conjunction2" value="{$restConj2}"/>
	<input type="hidden" name="field2" value="{$restField2}"/>
 		    <xsl:variable name="restrictionValue" select="$restrictionNode//field[concat(@table, '.', @name) = $restField2]/ancestor::clause" />
        <input class="inputField" id="values2" name="values2" title="Values 2"
               type="text" value="{translate($restrictionValue/@value,'%','')}"
               onKeyUp="validationInputs(2)" onfocus="validationInputs(2)"
               onblur="validationAndConvertionDateAndTime(2)"
	       onkeypress="return disableInputEnterKeyEvent( event)"/>
      </td>
      <td>
        <input class="AbActionButtonFormStdWidth" name="selectV2" type="button"
               title="{$afmAction/title}" value="{$afmAction/title}"
               onclick='onSelectV("{$afmAction/@serialized}",2); selectValueInputFieldID="values2";'/>
      </td>
      <td>
        <xsl:value-of select="$whiteSpace" />
      </td></tr>
      <tr><td>
        <table><tr>
         
          <xsl:variable name="ACTIONS" select="//afmTableGroup/afmAction"/>
        	<xsl:for-each select="$ACTIONS">
        		<td>
        		  <input class="AbActionButtonFormStdWidth" type="button"
        		         value="{title}" title="{title}"
        		         onclick='sendingDataFromHiddenForm("","{@serialized}","{@frame}","{subFrame/@name}",true,"")'/>
        		</td>
        	</xsl:for-each>
        </tr></table>
      </td>
    </tr></table>
  </xsl:template>


  <!-- include XSL files that contain templates used above -->
  <xsl:include href="common.xsl" />
  <xsl:include href="locale.xsl" />
  <xsl:include href="inputs-validation.xsl" />
  <xsl:include href="ab-actions-bar.xsl" />
</xsl:stylesheet>
