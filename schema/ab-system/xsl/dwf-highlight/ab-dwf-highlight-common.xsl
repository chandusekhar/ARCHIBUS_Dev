<?xml version="1.0" encoding="UTF-8"?>
<!-- Yong Shao -->
<!-- 11/29/2006 -->
<!-- optimize DWF dynamic highlight performance and centralize highlight XSL and JS -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="HighlightHandler">
		<xsl:param name="afmTableGroup"/>
		<xsl:variable name="mainTableName" select="$afmTableGroup/dataSource/database/tables/table[@role='main']/@name"/>
		var arrRecordPKsList = new Array(); var arrRecordHpattenList = new Array();
		<xsl:for-each select="$afmTableGroup/dataSource/data/records/record">
		        var pKValues = ''; var tempHpatternValues = '';
			<xsl:for-each select="@*">
				<xsl:variable name="value" select="."/>
				<xsl:variable name="table" select="substring-before(name(),'.')"/>
				<xsl:variable name="name" select="substring-after(name(),'.')"/>
				<xsl:variable name="field" select="$afmTableGroup/dataSource/data/fields/field[@table=$table][@name=$name]"/>
				<xsl:if test="$field/@primaryKey='true' and ($table = $mainTableName or $table = 'rm' or $table = 'bl')">pKValues=pKValues+'<xsl:value-of select="$value"/>;';</xsl:if>
				<xsl:if test="$field/@afmType='2100' and $value != ''">strDrawingName='<xsl:value-of select="$value"/>';</xsl:if>

				<xsl:if test="$field/@afmType='2145'">tempHpatternValues='<xsl:value-of select="$value"/>';</xsl:if>
			</xsl:for-each>
			arrRecordPKsList.push(pKValues);arrRecordHpattenList.push(tempHpatternValues);
		</xsl:for-each>
	</xsl:template>

	<!-- restricted by dv and dp -->
	<xsl:template name="HighlightHandler_dv_dp">
		<xsl:param name="afmTableGroup"/>
		<xsl:variable name="mainTableName" select="$afmTableGroup/dataSource/database/tables/table[@role='main']/@name"/>
		var arrRecordPKsList = new Array(); var arrRecordHpattenList = new Array();
		<xsl:for-each select="$afmTableGroup/dataSource/data/records/record">
			<xsl:if test="(@dp.dv_id = //preferences/@em_dv_id and @dp.dp_id = //preferences/@em_dp_id) or (@dp.dv_id = '' and @dp.dp_id = '')">
				var pKValues = ''; var tempHpatternValues = '';
				 <xsl:for-each select="@*">
				<xsl:variable name="value" select="."/>
				<xsl:variable name="table" select="substring-before(name(),'.')"/>
				<xsl:variable name="name" select="substring-after(name(),'.')"/>
				<xsl:variable name="field" select="$afmTableGroup/dataSource/data/fields/field[@table=$table][@name=$name]"/>
				<xsl:if test="$field/@primaryKey='true' and ($table = $mainTableName or $table = 'rm' or $table = 'bl')">pKValues=pKValues+'<xsl:value-of select="$value"/>;';</xsl:if>
				<xsl:if test="$field/@afmType='2100' and $value != ''">strDrawingName='<xsl:value-of select="$value"/>';</xsl:if>
				<xsl:if test="$field/@afmType='2145'">tempHpatternValues='<xsl:value-of select="$value"/>';</xsl:if>
				</xsl:for-each>
				arrRecordPKsList.push(pKValues);arrRecordHpattenList.push(tempHpatternValues);
			</xsl:if>
		</xsl:for-each>
	</xsl:template>

	<xsl:template name="HighlightEvents">
		 <!-- load common JS to highlight DWF -->
		<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/dwf-highlight/ab-dwf-highlight-common.js"><xsl:value-of select="$whiteSpace" /></script>
		<!-- EVENT HANDLERS -->
		<!-- OnBeginLoadItem: Fires before the Express Viewer loads a DWF -->
		<SCRIPT LANGUAGE="javascript" FOR="objViewer" EVENT="OnBeginLoadItem(strType, strData)">OnBeginLoadItem(strType, strData);</SCRIPT>
		<!-- OnEndLoadItem : Fires after the Express Viewer attempts to load a DWF -->
		<SCRIPT LANGUAGE="javascript" FOR="objViewer" EVENT="OnEndLoadItem(strType, strData, nResult)">OnEndLoadItem (strType, strData, nResult);</SCRIPT>
		<!-- OnLeaveURL: Fires when the mouse moves away from a URL object in Express Viewer -->
		<SCRIPT LANGUAGE="javascript" FOR="objViewer" EVENT="OnLeaveURL(nX, nY, objLink)">OnLeaveURL(nX, nY, objLink);</SCRIPT>
		<!-- OnOverURL: Fires when the mouse moves onto a URL object in Express Viewer -->
		<SCRIPT LANGUAGE="javascript" FOR="objViewer" EVENT="OnOverURL(nX, nY, objLink, objHandled)">OnOverURL(nX, nY, objLink, objHandled);</SCRIPT>
		<!-- OnExecuteURL: Fires when the user clicks on a URL object in Express Viewer -->
		<SCRIPT LANGUAGE="javascript" FOR="objViewer" EVENT="OnExecuteURL(objLink, nIndex, objHandled)">var strDynamicHighlight = '<xsl:value-of select="//preferences/@dynamicDrawingHighlights"/>';OnExecuteURL(objLink, nIndex, objHandled);</SCRIPT>
		<!-- OnExecuteURL: Fires when the user click on a highlighted object in Express Viewer -->
		<SCRIPT LANGUAGE="javascript" FOR="objViewer" EVENT="OnSelectObject(objNode, objHandled)">var strDynamicHighlight = '<xsl:value-of select="//preferences/@dynamicDrawingHighlights"/>';OnSelectObject(objNode, objHandled);</SCRIPT>
		<!-- OnExecuteURL: Fires when the user mouses onto a highlighted object in Express Viewer -->
		<SCRIPT LANGUAGE="javascript" FOR="objViewer" EVENT="OnOverObject(objNode, objHandled)">OnOverObject(objNode, objHandled);</SCRIPT>
		<!-- OnExecuteURL: Fires when the user mouses out of a highlighted object in Express Viewer -->
		<SCRIPT LANGUAGE="javascript" FOR="objViewer" EVENT="OnLeaveObject(objNode)">OnLeaveObject(objNode)</SCRIPT>
	</xsl:template>

	<xsl:template name="DWF_HTML_STRINGS">
		<span translatable="true" id="UNABLE_LOAD" name="UNABLE_LOAD" style="display:none">Express Viewer is unable to load the file:</span>
		<span translatable="true" id="CONTACT_SYS" name="CONTACT_SYS" style="display:none">Please contact your system administrator.</span>
		<span translatable="true" id="NO_DWF" name="NO_DWF" style="display:none">The selected drawing file does not exist:</span>
		<span translatable="true" id="NO_ASSOCIATED_DWF" name="NO_ASSOCIATED_DWF" style="display:none">There is no drawing file associated with the selected item.</span>
		<span translatable="true" id="GENERAL_WARNING" name="GENERAL_WARNING" style="display:none">DWF Viewer failed to load. ARCHIBUS Web Central supports DWF drawings on Internet Explorer 6 or later.  If you are using a supported browser, contact your system administrator to install the Autodesk DWF Viewer. You can also download it from autodesk website.</span>
		<span translatable="true" id="DOWNLOAD" name="DOWNLOAD" style="display:none">DOWNLOAD</span>
	</xsl:template>

	<xsl:template name="DWF_HTML_HEADER">
		 <title><xsl:value-of select="/*/title" /><xsl:value-of select="$whiteSpace" /></title>
		 <STYLE>.visShow { visibility:visible } .visHide { visibility:hidden }</STYLE>
		 <xsl:call-template name="LinkingCSS" />
                <script language="JScript" type="text/jscript" src="{$abSchemaSystemJavascriptFolder}/dwf-highlight/activateActiveX_onload.js"><xsl:value-of select="$whiteSpace" /></script>
        	<script language="JavaScript" src="{$abSchemaSystemJavascriptFolder}/common.js"><xsl:value-of select="$whiteSpace" /></script>
		<xsl:call-template name="HighlightEvents"/>
		<xsl:for-each select="//formatting/js">
			<xsl:variable name="customized_js" select="@file"/>
			<xsl:if test="$customized_js">
				<script language="JavaScript" src="{$customized_js}"><xsl:value-of select="$whiteSpace"/></script>
			</xsl:if>
		</xsl:for-each>
		<xsl:for-each select="//style[@type='text/css']">
			<xsl:copy-of select="."/>
		</xsl:for-each>
		<script language="javascript">
			projectDrawingsFolder='<xsl:value-of select="$projectDrawingsFolder"/>';
			var strDynamicHighlight = '<xsl:value-of select="//preferences/@dynamicDrawingHighlights"/>';
			var strMainTable = '<xsl:value-of select="/*/afmTableGroup/dataSource/database/tables/table[@role='main']/@name"/>';
			var DWF_defaultHighlightColor='<xsl:value-of select="//preferences/@dwfDefaultHighlightColor"/>';
                        <xsl:call-template name="HighlightHandler">
				<xsl:with-param name="afmTableGroup" select="/*/afmTableGroup"/>
			</xsl:call-template>
		</script>
	</xsl:template>

	<xsl:template name="DWF_HTML_BODY">
		 <xsl:param name="width"/>
		 <xsl:param name="height"/>
		 <xsl:variable name="absoluteAppPath_expressViewer5" select="//preferences/@absoluteAppPath"/>
		 <xsl:variable name="isDwfViewer7" select="//preferences/@dwfViewer7"/>
		 <body   class="body"  onresize="reSize()" onload="setUpDWFFileLink();loadDwfViewer('{$width}','{$height}','{$absoluteAppPath_expressViewer5}', '{$isDwfViewer7}');loadDrawing();" leftmargin="0" rightmargin="0" topmargin="0">
			<xsl:call-template name="DWF_HTML_BODY_CONTENT" />
		</body>
	</xsl:template>

	<xsl:template name="DWF_HTML_BODY_CONTENT">
		 <table align="center" width="100%" valign="top">
			<tr valign="top">
				<td align="center" valign="top" class="instruction">
					<span class="instruction" id="DWF_headerMessage" name="DWF_headerMessage"><xsl:value-of select="//message[@name='DWF_headerMessage']"/></span>
				</td>
			</tr>
			<tr valign="top">
				<td align="center" valign="top">
					<div id="loadingMessage" class="visHide"><span translatable="true">Loading...</span></div>
                                        <div id="dwfViewerControl"></div>
				</td>
			</tr>
			<tr valign="top">
				<td id="instructionText" class="instruction" align="center">
					<xsl:value-of select="/*/message[@name='instructionText']" />
					<xsl:call-template name="DWF_HTML_STRINGS"/>
                                  </td>
			</tr>
			<tr valign="top" id="DWF_WIND_CLOSE_BUTTON" name="DWF_WIND_CLOSE_BUTTON"  style="display:none">
				<td align="center" valign="top" >
					<xsl:variable name="close" translatable="true">Close</xsl:variable>
					<input class="AbActionButtonFormStdWidth"  type="button" value="{$close}" onclick="window.close()"/>
				</td>
			</tr>
		</table>
	</xsl:template>
</xsl:stylesheet>
