<?xml version="1.0" encoding="UTF-8"?>
<!-- top xsl called by Java to handle console filter form  -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	 <xsl:import href="constants.xsl" />

	<xsl:variable name="totalRowsForFilter" select="1" />
    <xsl:variable name="activity_graphic" translatable="true">Activity Graphic</xsl:variable>
	<!-- Get the absolute path to the graphics folder -->
	<xsl:variable name="abSystemGraphicsFolder" select="//preferences/@abSchemaSystemGraphicsFolder" />

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
              <table class="alterViewTopFrame" cellpadding="0" cellspacing="0">
                <tr><td class="alterViewTopFrameTitle">
                  <h1>
                  <!-- Add the title of this view header -->
                  <xsl:value-of select="/*/title" />
                  <xsl:value-of select="$whiteSpace" />
                  </h1>
                </td></tr>
              </table>
          </td></tr>        
          <tr><td valign="top">
            <!-- begin the filter form.  afmInputsForm is defined in constants.xsl -->
            <form name="{$afmInputsForm}">
              <table cellpadding="0" cellspacing="0">
                <tr><td>
                  <img alt="{$activity_graphic}" src="{$abSystemGraphicsFolder}/{$activityGraphic}">
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
      <table align="center">
 
        <tr class="legendTitle">
          <td>
            <label for="values1"><xsl:value-of select="/*/afmTableGroup/title" /></label>
          </td>
        </tr>
        <tr><td>
          <xsl:call-template name="afmFilterFormContent">
            <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
          </xsl:call-template>
        </td></tr>
        <tr>
          <!-- Help text -->
          <td class="instruction">
            <xsl:value-of select="//message[@name='instructionText']" />
          </td>
        </tr>
      </table>
  </xsl:template>
  <xsl:template name="afmFilterFormContent">
    <xsl:param name="afmTableGroup"/>
    
    <!-- Get the node containing the parsed restrictions on this table group -->
    <xsl:variable name="clauseNode"
      select="$afmTableGroup/dataSource/data/restrictions/restriction[@type='parsed']/clause[position()=1]"/>
    
    <!-- Get the node containing the actions that are allowed for this form -->
    <xsl:variable name="afmAction"
      select="$afmTableGroup/dataSource/data/forFields/field/afmAction[@type='selectValue']"/>
    <table><tr>
      <td>
    		<input type="hidden" name="operator1" value="{$restOp}"/>
    		<input type="hidden" name="conjunction1" value="{$restConj}"/>
    		<input type="hidden" name="field1" value="{$restField}"/>
		<xsl:variable name="clauseNode_value">
			<xsl:choose>
				<xsl:when test="$clauseNode/@op='LIKE'">
					<!--???????????? remove % : if original value has %?????????-->
					<xsl:value-of select="translate($clauseNode/@value,'%','')"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="$clauseNode/@value"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
        <input class="inputField" id="values1" name="values1" title="{$restField} value"
               type="text" value="{$clauseNode_value}"
               onblur="validationInputs(1);validationAndConvertionDateAndTime(1)" onkeypress="return disableInputEnterKeyEvent( event)"/>
      </td>
      <td>
        <input class="AbActionButtonFormStdWidth" name="selectV1" type="button"
               title="Click to View Select List" value="{$afmAction/title}"
               onclick='onSelectV("{$afmAction/@serialized}",1); selectValueInputFieldID="values1";'/>
      </td>
      <td>
        <table><tr>
          <xsl:variable name="ACTIONS" select="//afmTableGroup/afmAction"/>
        	<xsl:for-each select="$ACTIONS">
        		<td>
        		  <input class="AbActionButtonFormStdWidth" type="button"
        		         value="{title}" title="Click to view records after selecting from the list or after entering first characters in the box."
        		         onclick='sendingDataFromHiddenForm("","{@serialized}","_parent","{subFrame/@name}",true,"")'/>
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
