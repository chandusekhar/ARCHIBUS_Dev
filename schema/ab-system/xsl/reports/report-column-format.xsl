<?xml version="1.0" encoding="UTF-8"?>
<!-- processing reports in column format -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template name="ReportColumnFormat">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="margin-left"/>
		<xsl:param name="level"/>
					
		<div style='margin-left:{$margin-left*30}pt;'>
			<!-- statistics information -->
			<xsl:variable name="hasStatistics" select="$afmTableGroup/statistics/statistic"/>
			<xsl:if test="count($hasStatistics) &gt; 0">
				<table cellspacing="0" cellpadding="0">
				<tr><td><!-- calling tempalte ReportTable_statistics in report-table-statistics.xsl to set up statistics report-->
						<xsl:call-template name="ReportTable_statistics">
							<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						</xsl:call-template>
					</td>
				</tr>
				</table>
			</xsl:if>
			<!-- write report data in column format -->
			<xsl:call-template name="ReportColumnContent">
				<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
			</xsl:call-template>
			<xsl:if test="count($afmTableGroup/dataSource/data/records/record) = 0">
				<div>
					<table cellspacing="0" cellpadding="0" style="margin-left:10">	
					<tr><td class="instruction">
						<span translatable="true">No Items.</span>
						</td>
					</tr>
					</table>
				</div>
			</xsl:if>
			<xsl:if test="count($afmTableGroup/afmAction[@eventName != 'renderShowPrintablePdf']) &gt; 0">
				<table border="0" cellspacing="0" cellpadding="0" align="center">
					<tr align="center">
						<xsl:for-each select="$afmTableGroup/afmAction[@eventName != 'renderShowPrintablePdf']">
							<td align="center">
								<input class="AbActionButtonFormStdWidth" type="button" value="{title}" title="{title}" onclick='sendingDataFromHiddenForm("","{@serialized}","{@target}","", false, "");return false;'/>
							</td>
						</xsl:for-each>
					</tr>
				</table>
			</xsl:if>
		</div>
	</xsl:template>

	<!-- xsl template ReportColumnContent called in this xsl -->
	<xsl:template name="ReportColumnContent">
		<xsl:param name="afmTableGroup"/>
		<xsl:variable name="field" select="$afmTableGroup/dataSource/data/fields/field"/>
		<xsl:variable name="record" select="$afmTableGroup/dataSource/data/records/record"/>
		<!-- user's setting for column number in view (default as 1) -->
		<xsl:variable name="columnNumber">
			<xsl:choose>
				<xsl:when test="$afmTableGroup/@column">
					<xsl:choose>
						<!-- cannot be less than 1 -->
						<xsl:when test="$afmTableGroup/@column &lt; 1">1</xsl:when>
						<xsl:otherwise>
							<xsl:value-of select="$afmTableGroup/@column"/>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:when>
				<xsl:otherwise>1</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		
		<!-- total number of visible fields -->
		<xsl:variable name="iTotalFields">
				<xsl:for-each select="$field[@format!='Memo']">
					<xsl:if test="position()=last()">
						<xsl:value-of select="last()"/>
					</xsl:if>
				</xsl:for-each>
		</xsl:variable>
		<xsl:variable name="accept_columnNumber">
			<xsl:choose>
				<xsl:when test="$columnNumber &gt; $iTotalFields"><xsl:value-of select="$iTotalFields"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="$columnNumber"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<!--  looping each record -->
		<xsl:for-each select="$record">
			<xsl:variable name="recordIndex" select="position()"/>
			<table class="columnReportContent">
				<tr>
					<!-- table for each row except for memo fields-->
					<!-- column detail -->
					<xsl:call-template name="columns">
						<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
						<xsl:with-param name="field" select="$field"/>
						<!-- select individual record -->
						<xsl:with-param name="record" select="."/>
						<xsl:with-param name="startingIndex" select="1"/>
						<xsl:with-param name="columnNumber" select="$accept_columnNumber"/>
						<xsl:with-param name="iTotalFields" select="$iTotalFields"/>
					</xsl:call-template>
				</tr>
				<tr>
					<!-- table for memo fields in current row -->
					<td COLSPAN="{$columnNumber}" valign="top">
						<table cellspacing="0" cellpadding="0" valign="top"  border="0">
							<xsl:for-each select="$field[@format='Memo']">
								<xsl:variable name="visibility">
									<xsl:if test="@hidden">
										<xsl:if test="@hidden='true'">display:none</xsl:if>
									</xsl:if>
								</xsl:variable>

								<xsl:variable name="memoFieldName">
									<xsl:choose><xsl:when test="count(title) &gt; 0"><xsl:value-of select="title"/></xsl:when><xsl:otherwise><xsl:value-of select="@singleLineHeading"/></xsl:otherwise></xsl:choose>
								</xsl:variable>
								<xsl:variable name="memoRecordValueIndex" select="concat(@table,'.',@name)"/>
								<tr valign="top" style="{$visibility}">
									<td scope="row" class="AbHeaderRecord" valign="top" nowrap="1">
										<xsl:value-of select="$memoFieldName"/>:<xsl:value-of select="$whiteSpace"/>
									</td>
									<td class="AbDataRecord">
										<xsl:for-each select="$record[position()=$recordIndex]/@*">
											<xsl:if test="name()=$memoRecordValueIndex">
												<xsl:call-template name="memo_field_value_handler">
													<xsl:with-param name="memo_value" select="."/>
												</xsl:call-template>
											</xsl:if>
										</xsl:for-each>
									</td>
								</tr>
							</xsl:for-each>
							<!-- in case that there is no memo field -->
							<tr><td><xsl:value-of select="$whiteSpace"/></td></tr>
						</table>
					</td>
				</tr>
			</table>
		</xsl:for-each>
		<div>
			<!-- check if there is a report records max limitaion -->
			<xsl:variable name="moreRecords" select="$afmTableGroup/dataSource/data/records/@moreRecords"/>
			<xsl:if test="$moreRecords='true'">
				<table cellspacing="0" cellpadding="0">
				<tr><td class="instruction" align="center" valign="top">
						<p><span translatable="true">Not all records can be shown. Please use another view or another restriction to see the remaining data</span></p>
					</td>
				</tr></table>
			</xsl:if>
		</div>
	</xsl:template>

	<!-- xsl template columns called in this xsl -->
	<xsl:template name="columns">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="field"/>
		<xsl:param name="record"/>
		<xsl:param name="startingIndex"/>
		<xsl:param name="columnNumber"/>
		<xsl:param name="iTotalFields"/>

		<!-- total number of visible memo fields -->
		<xsl:variable name="iTotalMemoFields">
			<xsl:for-each select="$field[@format='Memo']">
				<xsl:if test="position()=last()">
					<xsl:value-of select="last()"/>
				</xsl:if>
			</xsl:for-each>
		</xsl:variable>

		<xsl:variable name="columnWidthData">
			<xsl:value-of select="ceiling(100 div $columnNumber)"/>
		</xsl:variable>
		<!-- check recursive columnNumber -->
		<xsl:if test="$columnNumber &gt; 0">	
			<!--control the fields in current column -->
			<xsl:variable name="iDividedNumber">
				<xsl:choose>
					<xsl:when test="($iTotalFields mod $columnNumber)=0">
						<xsl:value-of select="($iTotalFields div $columnNumber)"/>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of select="ceiling($iTotalFields div $columnNumber)"/>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>

			<!-- current column -->
			<td valign="top" width="{$columnWidthData}%">
				<table valign="top" border="0">
					<colgroup span="2">
						<xsl:for-each select="$field[@format!='Memo']">
							<xsl:variable name="positionIndex" select="position()"/>
							<xsl:variable name="FieldName">
								<xsl:choose><xsl:when test="count(title) &gt; 0"><xsl:value-of select="title"/></xsl:when><xsl:otherwise><xsl:value-of select="@singleLineHeading"/></xsl:otherwise></xsl:choose>
							</xsl:variable>
							
							<xsl:variable name="recordValueIndex" select="concat(@table,'.',@name)"/>
							<xsl:variable name="afmType" select="@afmType"/>
							<xsl:variable name="visiblity">
								<xsl:if test="@hidden">
									<xsl:if test="@hidden='true'">display:none</xsl:if>
								</xsl:if>
							</xsl:variable>
							<xsl:variable name="DOCAfmAction" select="$record/field[@id=$recordValueIndex]/afmAction"/>
							<!-- control how many fields in this column -->
							<xsl:if test="($positionIndex &gt;= $startingIndex) and ($positionIndex &lt; ($startingIndex + $iDividedNumber))">
								<tr style="{$visiblity}">
									<td scope="row" class="AbHeaderRecord" nowrap="1">
										<xsl:value-of select="$FieldName"/>:<xsl:value-of select="$whiteSpace"/>
									</td>
									<td class="AbDataRecord" nowrap="1">
										<xsl:attribute name="align">
											<xsl:choose>
												<xsl:when test="(@type='java.lang.Float' or @type='java.lang.Double' or @type='java.lang.Integer') and (count(enumeration)=0)">right</xsl:when>
												<xsl:otherwise>left</xsl:otherwise>
											</xsl:choose>
										</xsl:attribute>
										<xsl:if test="$afmType='2165' and count($DOCAfmAction) &gt; 0">
												<a href="#" onclick='sendingDataFromHiddenForm("","{$DOCAfmAction/@serialized}","{$DOCAfmAction/@target}","",false,"");return false;'><xsl:value-of select="$record/@*[name()=$recordValueIndex]"/></a>
										</xsl:if>
										<xsl:if test="$afmType!='2165' or count($DOCAfmAction) &lt;= 0">
											<xsl:value-of select="$record/@*[name()=$recordValueIndex]"/>
										</xsl:if>										
									</td>
								</tr>
							</xsl:if>
						</xsl:for-each>
					</colgroup>
				</table>
			</td>
			<!-- recursive calling template -->
			<xsl:call-template name="columns">
				<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
				<xsl:with-param name="field" select="$field"/>
				<xsl:with-param name="record" select="$record"/>
				<xsl:with-param name="startingIndex" select="$startingIndex + $iDividedNumber"/>
				<xsl:with-param name="columnNumber" select="$columnNumber - 1"/>
				<xsl:with-param name="iTotalFields" select="$iTotalFields - $iDividedNumber"/>
			</xsl:call-template>
		</xsl:if>
	</xsl:template>
</xsl:stylesheet>