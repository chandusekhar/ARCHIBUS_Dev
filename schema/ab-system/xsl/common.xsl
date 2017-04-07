<?xml version="1.0"?>
<!-- this xsl is contained in almost all other xslt files-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

	<!-- template common to set up debug and a hidde html form to send data to server  -->
	<xsl:template name="common">
		<xsl:param name="title"/>
		<xsl:param name="debug"/>
		<xsl:param name="afmHiddenForm"/>
		<xsl:param name="xml"/>
		<xsl:param name="afmInputsForm"/>
		<!-- javascript variables and functions used here are in common.js -->
		<script language="javascript">
			<!-- browser's title -->
			<!--xsl:if test="$title != ''">
				top.document.title="<xsl:value-of select="$title"/>";<xsl:text/>
			</xsl:if-->
			<!-- debug flag for some javascript critical functions -->
			<xsl:if test="$debug != ''">
				Debug = <xsl:value-of select="$debug"/>;<xsl:text/>
			</xsl:if>
			<xsl:if test="$afmHiddenForm != ''">
				afmHiddenFormName='<xsl:value-of select="$afmHiddenForm"/>';
			</xsl:if>
			<xsl:if test="$xml != ''">
				xmlName='<xsl:value-of select="$xml"/>';
			</xsl:if>
			<xsl:if test="$afmInputsForm != ''">
				afmInputsFormName='<xsl:value-of select="$afmInputsForm"/>';
			</xsl:if>
		</script>
		<!-- a hidden form to send a xml string to server for processing -->
		<xsl:if test="$afmHiddenForm != '' and $xml != ''">
			<form method="post" name="{$afmHiddenForm}" style="margin:0;display:none;">
				<input type="hidden" name="{$xml}" value=""/>
			</form>
		</xsl:if>
		<!-- fire the fireOnload action if fireOnload event exists in XML -->
		<xsl:variable name="fireOnloadAction" select="//afmAction[@fireOnLoad='true']"/>
		<xsl:if test="count($fireOnloadAction) &gt; 0">
			<script language="javascript">
				<!-- call sendingDataFromHiddenForm() in commom.js to send request to server -->
				sendingDataFromHiddenForm('', '<xsl:value-of select="$fireOnloadAction/@serialized"/>', '<xsl:value-of select="$fireOnloadAction/@frame"/>', '' ,false);
			</script>
		</xsl:if>

		<!-- warning message(localized) -->
		<span style="display:none" id="general_warning_message_empty_required_fields"  translatable="true">Some required fields have not been entered, please enter or select values for them!</span>
		<span style="display:none" id="general_delete_warning_message_empty_required_fields"  translatable="true">Are you sure you want to delete this record?</span>
		<span style="display:none" id="general_invalid_input_warning_message_integer"  translatable="true">Invalid input! Please enter an integer.</span>
		<span style="display:none" id="general_invalid_input_warning_message_numeric"  translatable="true">Invalid input! Please enter a numeric value.</span>
		<span style="display:none" id="general_invalid_input_warning_message_upperalphanumeric" name="general_invalid_input_warning_message_upperalphanumeric" translatable="true">Invalid input! please enter alphas and/or numbers.</span>
		<span style="display:none" id="document_delete_warning_message"  translatable="true">This action will delete the reference to the version of this document stored on the server.  Only the archived versions will remain on the server.  Do you wish to continue?</span>
		<span style="display:none" id="message_no_record_display"  translatable="true">No records to display.</span>
		<span style="display:none" id="message_more_record_display"  translatable="true">Not all records can be shown. Please use another view or another restriction to see the remaining data.</span>
		<span style="display:none" id="message_form_invalid_value"  translatable="true">One or more fields contain incorrect values. Form was not saved. Please correct highlighted values and save again.</span>
        <span style="display:none" id="message_filter"  translatable="true">Filter</span>
        <span style="display:none" id="message_clear"  translatable="true">Clear</span>
        <span style="display:none" id="message_collapse"  translatable="true">Collapse</span>
        <span style="display:none" id="message_grid_filter"  translatable="true">Enter one or more characters found within column value and click the Filter button.</span>
        		
		<xsl:for-each select="//message[@hidden='true']">
			<span style="display:none" id="message_{@name}"><xsl:value-of select="."/></span>
		</xsl:for-each>
		<!-- afm calendar localization strings -->
		<span style="display:none" id="sun" name="sun" translatable="true">Sun</span>
		<span style="display:none" id="mon" name="mon"  translatable="true">Mon</span>
		<span style="display:none" id="tue" name="tue" translatable="true">Tue</span>
		<span style="display:none" id="wed" name="wed" translatable="true">Wed</span>
		<span style="display:none" id="thur" name="thur" translatable="true">Thur</span>
		<span style="display:none" id="fri"  name="fri" translatable="true">Fri</span>
		<span style="display:none" id="sat" name="sat" translatable="true">Sat</span>
		<span style="display:none" id="today" name="today" translatable="true">Today</span>
		<span style="display:none" id="close" name="close" translatable="true">Close</span>
		<!-- afm calendar controller -->
		<div id="AFM_CALENDAR" style="position:absolute;display:none;background-color:white;layer-background-color:white;border:1px solid black;z-index:100"><xsl:value-of select="$whiteSpace"/></div>
		<iframe id="AFM_CALENDAR_IFRAME" title="Select Date Calendar" src="javascript:false;" scrolling="no" frameborder="0" style="position:absolute;top:0px;left:0px;display:none;"><xsl:value-of select="$whiteSpace"/></iframe>
	</xsl:template>
	<!-- set up the tgrp's title in the top of each html page -->
	<xsl:template name="table-group-title">
		<xsl:param name="title"/>
		<xsl:if test="$title!=''">
			<table class="panelReportHeader">
				<tr><td><xsl:text/><h1><xsl:value-of select="$title"/></h1></td></tr>
			</table>
		</xsl:if>
	</xsl:template>

	<!-- set up the logo title in the top of each html page -->
	<xsl:template name="logo_title">
		<xsl:param name="title"/>
		<xsl:param name="type"/>
		<xsl:param name="format"/>
		<xsl:param name="logoFile"/>
		<xsl:param name="showLogo"/>
		<xsl:param name="logoPath"/>
		<xsl:param name="hasRowAction"/>
		<xsl:param name="hasRowSelectionAction"/>
		<xsl:param name="hasAnyRecord"/>
		<xsl:param name="addNew"/>
		<xsl:param name="pdfAction"/>

        <xsl:variable name="logo" translatable="true">ARCHIBUS</xsl:variable>
		<!-- pdfAction could be a list of export report actions -->
		<!--  hasAnyRecord=false or hasRowAction=true or hasRowSelectionAction=true or type=form will not show logo -->
		<!--  showLogo=false or logoFile=empty will not show logo -->
		<xsl:variable name="bHasAnyRecord">
			<xsl:choose>
				<xsl:when test="$hasAnyRecord">true</xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="bHasRowAction">
			<xsl:choose>
				<xsl:when test="$hasRowAction">true</xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="bHasRowSelectionAction">
			<xsl:choose>
				<xsl:when test="$hasRowSelectionAction">true</xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>


		<xsl:variable name="bShowLogo">
			<xsl:choose>
				<!--xsl:when test="$bHasAnyRecord='true' and $bHasRowAction='false' and $bHasRowSelectionAction='false' and $type != 'form' and $showLogo = 'true' and $logoFile != ''">true</xsl:when-->
				<xsl:when test="$bHasRowAction='false' and $bHasRowSelectionAction='false' and $type != 'form' and $showLogo = 'true' and $logoFile != ''">true</xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<!--XXX-->
		<xsl:variable name="logoPDF">
			<xsl:choose>
				<xsl:when test="//preferences/@logoPDF"><xsl:value-of select="//preferences/@logoPDF"/></xsl:when>
				<xsl:otherwise><xsl:if test="$pdfAction!=''"><xsl:value-of select="$pdfAction[@id='export2Pdf']/icon/@request"/></xsl:if></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:variable name="logoEXCEL">
			<xsl:choose>
				<xsl:when test="//preferences/@logoEXCEL"><xsl:value-of select="//preferences/@logoEXCEL"/></xsl:when>
				<xsl:otherwise><xsl:if test="$pdfAction!=''"><xsl:value-of select="$pdfAction[@id='export2Excel' or @id='exportMdx2Excel']/icon/@request"/></xsl:if></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:choose>
			<xsl:when test="$bShowLogo='true'">
				<table class="panelReportHeader">
					<tr><td><img alt="{$logo}" src="{$logoPath}/{$logoFile}" border="0"/></td>
						<td style="width: 100%"><h1><xsl:value-of select="$title"/></h1></td>
						<xsl:if test="$pdfAction != ''">
							<td style="text-align: right; padding-right: 6px">
								<xsl:for-each select="$pdfAction">
									<xsl:choose>
										<xsl:when test="@id='export2Pdf'">
											<input class="AbActionButtonFormStdWidth"  src="{$logoPDF}" type="image" onclick='openPdfGeneratingView("{@serialized}")' alt="{title}" title="{title}"/>
										</xsl:when>
										<xsl:otherwise>
											<input class="AbActionButtonFormStdWidth"  src="{$logoEXCEL}" type="image" onclick='openExcelGeneratingView("{@serialized}")' alt="{title}" title="{title}"/>
										</xsl:otherwise>
									</xsl:choose>
								</xsl:for-each>
							</td>
						</xsl:if>
					</tr>
				</table>
			</xsl:when>
			<xsl:otherwise>
				<table class="panelReportHeader">
					<tr><td width="100%"><!--?????type="form", even no record in DB, but in XML, still a record with empty values for add new????? -->
							<xsl:choose>
								<xsl:when test="$type='form' and $format='editForm' and $addNew='true'">
									<xsl:value-of select="$title"/><xsl:value-of select="$whiteSpace"/><span  translatable="true">- Add New</span>
								</xsl:when>
								<xsl:otherwise>
									<h1><xsl:value-of select="$title"/></h1><xsl:value-of select="$whiteSpace"/>
								</xsl:otherwise>
							</xsl:choose>
						</td>
						<td style="text-align: right; padding-right: 8px">
							<span class="panelButton">
								<input class="panelButton_input" type="button" onclick="window.location.reload()" value="Refresh" title="Refresh This Panel" onkeypress="mapKeyPressToClick(event, this)"/>
							</span>
						</td>
						<xsl:if test="$pdfAction != ''">
							<td align="right">
								<xsl:for-each select="$pdfAction">
									<xsl:choose>
										<xsl:when test="@id='export2Pdf'">
											<input class="AbActionButtonFormStdWidth" src="{$logoPDF}" type="image" onclick='openPdfGeneratingView("{@serialized}")' alt="{title}" title="{title}"/>
										</xsl:when>
										<xsl:otherwise>
											<input class="AbActionButtonFormStdWidth" src="{$logoEXCEL}" type="image" onclick='openExcelGeneratingView("{@serialized}")' alt="{title}" title="{title}"/>
										</xsl:otherwise>
									</xsl:choose>
								</xsl:for-each>
							</td>
						</xsl:if>
					</tr>
				</table>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>

	<!-- linking CSS file -->
	<xsl:template name="LinkingCSS">
		<xsl:choose>
			<!-- testing if axvw has css file  -->
			<xsl:when test="/*/formatting/css/@file">
				<xsl:variable name="css" select="/*/formatting/css/@file"/>
				<xsl:variable name="isDefault" select="/*/formatting/css/@default"/>
                <!-- if user-defined CSS replaces the default CSS, assume the standard CSS folder -->
                <xsl:if test="$isDefault='true'">
					<link rel="stylesheet" type="text/css" href="{$abSchemaSystemCSSFolder}/{$css}"/>
                </xsl:if>
                <!-- if user-defined CSS does not replace the default CSS, include the default too -->
                <xsl:if test="$isDefault='false'">
					<link rel="stylesheet" type="text/css" href="{$css}"/>
    				<link rel="stylesheet" type="text/css" href="{$abSchemaSystemCSSFolder}/{$abCascadingStyleSheetFile}"/>
                </xsl:if>
			</xsl:when>
			<xsl:otherwise>
				<!-- using default css file -->
				<!-- abCascadingStyleSheetFile is defined in constants.xsl -->
				<link rel="stylesheet" type="text/css" href="{$abSchemaSystemCSSFolder}/{$abCascadingStyleSheetFile}"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
	<!-- html head setting  -->
	<xsl:template name="Html-Head-Setting">
		<META http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
		<META name="GENERATOR" content="ARCHIBUS"/>
		<META http-equiv="Content-Style-Type" content="text/css"/>
	</xsl:template>
	<!-- helper -->
	<xsl:template name="strip">
		<xsl:param name="str"/>
		<xsl:param name="character"/>
		<xsl:choose>
			<xsl:when test="$str!='' and starts-with($str, $character)">
				<xsl:variable name="temp_str" select="substring-after($str, $character)"/>
				<xsl:call-template name="strip">
					<xsl:with-param name="str" select="$temp_str"/>
					<xsl:with-param name="character" select="$character"/>
				</xsl:call-template>
			</xsl:when>
			<xsl:otherwise><xsl:value-of select="$str"/></xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>


