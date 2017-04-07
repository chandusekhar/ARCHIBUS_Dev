<?xml version="1.0" encoding="UTF-8"?>
<!-- Yong Shao -->
<!-- 2006-02-16 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	

	<xsl:template name="panel_report">
		<xsl:param name="panel"/>
		<xsl:param name="panel_id"/>
		<xsl:param name="afmTableGroup"/>
        <xsl:param name="tabIndex"/>

		<xsl:variable name="actionsPosition">
			<xsl:choose>
				<xsl:when test="$panel/@actionsPosition!=''"><xsl:value-of select="$panel/@actionsPosition"/></xsl:when>
				<xsl:otherwise>top</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:if test="($panel/@type='grid' and //preferences/pdfButton/@show='true') or($panel/@type='grid' and //preferences/export/excel/button/@show='true') or $panel/title!='' or count($panel/afmAction) &gt; 0">
		    <xsl:call-template name="panel_report_header">
			<xsl:with-param name="panel" select="$panel"/>
			<xsl:with-param name="panel_id" select="$panel_id"/>
			<xsl:with-param name="position" select="$actionsPosition"/>
			<xsl:with-param name="tabIndex" select="$tabIndex"/>
		    </xsl:call-template>				
		</xsl:if>
		<form name="{$panel_id}" style="display:inline">
            <xsl:if test="$panel/@type != 'grid'">
    		    <xsl:call-template name="panel_report_body">
        			<xsl:with-param name="panel" select="$panel"/>
        			<xsl:with-param name="panel_id" select="$panel_id"/>
        			<xsl:with-param name="position" select="$actionsPosition"/>
    		    </xsl:call-template>
            </xsl:if>
            <xsl:if test="$panel/@type = 'grid'">
    		<xsl:call-template name="panel_grid_body">
        	    <xsl:with-param name="panel" select="$panel"/>
 		    <xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
   		</xsl:call-template>
            </xsl:if>
		</form>
	</xsl:template>


	<xsl:template name="panel_report_header">
		<xsl:param name="panel"/>
		<xsl:param name="panel_id"/>	
		<xsl:param name="position"/>
		<xsl:param name="tabIndex"/>

		 <xsl:variable name="useHeaderClass">
                        <xsl:choose>
                                <xsl:when test="string-length($panel/@headerClass) &gt; 0"><xsl:value-of select="$panel/@headerClass"/></xsl:when>
                                <xsl:otherwise>panelReportHeader</xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>
		 <xsl:variable name="useHeaderStyle">
                        <xsl:choose>
                                <xsl:when test="string-length($panel/@headerStyle) &gt; 0"><xsl:value-of select="$panel/@headerStyle"/></xsl:when>
                                <xsl:otherwise><xsl:if test="not($useHeaderClass)">background-color:#DCE5F5</xsl:if></xsl:otherwise>
                        </xsl:choose>
                </xsl:variable>
		<table width="100%" class="{$useHeaderClass}" style="{$useHeaderStyle}" id="{$panel/@id}_head">
			<tr>				
				<td id="{$panel/@id}_title" class="{title/@class}">
					<xsl:value-of select="title"/>
				</td>
				<xsl:if test="contains($position,'top')">
					<td align="right">
						<xsl:for-each select="$panel/afmAction">
							<xsl:call-template name="helper_afmAction">
								<xsl:with-param name="afmAction" select="."/>
								<xsl:with-param name="form" select="$panel_id"/>
								<xsl:with-param name="bData" select="'true'"/>
								<xsl:with-param name="tabIndex" select="$tabIndex + position()"/>
							</xsl:call-template>
						</xsl:for-each>
						<xsl:for-each select="$panel/multiSelection/afmAction">
							<xsl:call-template name="helper_afmAction">
								<xsl:with-param name="afmAction" select="."/>
								<xsl:with-param name="form" select="$panel_id"/>
								<xsl:with-param name="bData" select="'true'"/>
								<xsl:with-param name="tabIndex" select="$tabIndex + position() + 50"/>
							</xsl:call-template>
						</xsl:for-each>
					</td>
				</xsl:if>
				
				<!--XXX-->
				<xsl:variable name="logoPDF">
					<xsl:choose>
						<xsl:when test="//preferences/@logoPDF"><xsl:value-of select="//preferences/@logoPDF"/></xsl:when>
						<xsl:otherwise><xsl:value-of select="concat(//preferences/@abSchemaSystemGraphicsFolder, '/pdf_icon_small.gif')"/></xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:variable name="logoEXCEL">
					<xsl:choose>
						<xsl:when test="//preferences/@logoEXCEL"><xsl:value-of select="//preferences/@logoEXCEL"/></xsl:when>
						<xsl:otherwise><xsl:value-of select="concat(//preferences/@abSchemaSystemGraphicsFolder, '/excel_icon.gif')"/></xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<td align="right">
					<input style="display:none" type="image" src="{$logoPDF}" class="AbActionButtonFormStdWidth" alt="PDF" title="PDF" id="Export:PDF" tabIndex_off="{$tabIndex+5}"/>
					<input style="display:none" type="image" src="{$logoEXCEL}" class="AbActionButtonFormStdWidth" alt="EXCEL" title="EXCEL" id="Export:EXCEL" tabIndex_off="{$tabIndex+10}"/>
				</td>
			</tr>
		</table>
	</xsl:template>
 	
	<xsl:template name="panel_report_body">
		<xsl:param name="panel"/>
		<xsl:param name="panel_id"/>
		<xsl:param name="position"/>

		<xsl:variable name="showCheckBox">
			<xsl:choose>
				<xsl:when test="count($panel/multiSelection/afmAction) &gt; 0">true</xsl:when>
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<table width="100%" class="panelReport" id="{$panel/@id}">
			<tr>
				<xsl:call-template name="panel_report_body_header">
					<xsl:with-param name="panel" select="$panel"/>
					<xsl:with-param name="showCheckBox" select="$showCheckBox"/>
				</xsl:call-template>
			</tr>
			<xsl:for-each select="$panel/table/row">
				<xsl:variable name="row_index" select="position()"/>
				<xsl:variable name="rowPKs">
					<xsl:for-each select="cell">
						<xsl:if test="key('panel_fields_array',@ref)/@primaryKey='true'">
							<xsl:value-of select="$whiteSpace"/>
							<xsl:value-of select="key('panel_fields_array',@ref)/@fullName"/>
							<xsl:text>=AFM_FLAG::QUOTE</xsl:text>
							<xsl:value-of select="@value"/>
							<xsl:text>AFM_FLAG::QUOTEAFM_FLAG::GROUP</xsl:text>
						</xsl:if>
					</xsl:for-each>
				</xsl:variable>
				
				<tr class="AbDataTable">
					<xsl:attribute name="style"><xsl:if test="position() mod 2 = 0">background-color:#F3F7FA;</xsl:if></xsl:attribute>
					<xsl:attribute name="id"><xsl:value-of select="$rowPKs"/></xsl:attribute>
                    
                    <!-- index column disabled by default -->
					<!--td><xsl:value-of select="position()"/></td-->
					<xsl:if test="$showCheckBox='true'">
						<td><input type="checkbox" name="bSelect" value="{$rowPKs}" title="{$rowPKs}" /></td>
					</xsl:if>
					<xsl:for-each select="cell">
						<xsl:variable name="field" select="key('panel_fields_array',@ref)"/>
						<xsl:variable name="hidden"><xsl:choose><xsl:when test="$field/@hidden"><xsl:value-of select="$field/@hidden"/></xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose></xsl:variable>
						<xsl:if test="$hidden='false'">
						<td>
							<xsl:if test="$field/@afmType='timemark'">
								<xsl:attribute name="id"><xsl:value-of select="concat('timeslot-',$row_index, '-', $field/@fullName)"/></xsl:attribute>
							</xsl:if>
							<xsl:attribute name="class">
								<xsl:choose>
									<xsl:when test="$field/@afmType='timemark'">timeslot</xsl:when>
									<xsl:otherwise><xsl:if test="@displayValue!=''"><xsl:value-of select="$field/@class"/></xsl:if></xsl:otherwise>
								</xsl:choose>
							</xsl:attribute>
							<xsl:attribute name="align"><xsl:if test="$field/@type='java.lang.Float' or $field/@type='java.lang.Double' or $field/@type='java.lang.Integer'">right</xsl:if></xsl:attribute>
							<xsl:choose>
								<xsl:when test="count($field/ui) &gt; 0">
									 <xsl:for-each select="$field/ui/*">
										<xsl:copy-of select="."/>
									 </xsl:for-each>
								</xsl:when>
								<xsl:otherwise>
									<xsl:if test="@displayValue!=''">
										<xsl:choose>
											<xsl:when test="count(afmAction) &gt; 0">
												<a  href="#">
												<xsl:attribute name="onclick">
													<xsl:variable name="eventHandler">
														<xsl:call-template name="helper_replace_eventHandlerPreParameters">
															<xsl:with-param name="eventHandler" select="afmAction/@onclick"/>
															<xsl:with-param name="form" select="$panel_id"/>
															<xsl:with-param name="serialized" select="afmAction/@serialized"/>
															<xsl:with-param name="rowPKs" select="$rowPKs"/>
															<xsl:with-param name="frame" select="afmAction/@frame"/>
														</xsl:call-template>
													</xsl:variable>																				
													<xsl:value-of select="concat($eventHandler,';return false;')"/>							
												</xsl:attribute>
												<xsl:value-of select="@displayValue"/>
												</a>
											</xsl:when>
											<xsl:otherwise><xsl:value-of select="@displayValue"/></xsl:otherwise>
										</xsl:choose>
									</xsl:if>
									<xsl:if test="@displayValue=''">
										<br />
									</xsl:if>
									<xsl:if test="not(@displayValue)">										
										<xsl:for-each select="afmAction">
											<xsl:call-template name="helper_afmAction">
												<xsl:with-param name="afmAction" select="."/>
												<xsl:with-param name="form" select="$panel_id"/>
												<xsl:with-param name="bData" select="'true'"/>
												<xsl:with-param name="clientData" select="$rowPKs"/>
												<xsl:with-param name="rowPKs" select="$rowPKs"/>
												<xsl:with-param name="buttonClass" select="'perRowButton'"/>
											</xsl:call-template>
										</xsl:for-each>
										<xsl:for-each select="$field/afmAction">
											<xsl:call-template name="helper_afmAction">
												<xsl:with-param name="afmAction" select="."/>
												<xsl:with-param name="form" select="$panel_id"/>
												<xsl:with-param name="bData" select="'true'"/>
												<xsl:with-param name="clientData" select="$rowPKs"/>
												<xsl:with-param name="rowPKs" select="$rowPKs"/>
												<xsl:with-param name="buttonClass" select="'perRowButton'"/>
											</xsl:call-template>
										</xsl:for-each>		
									</xsl:if>
								</xsl:otherwise>
							</xsl:choose>
						</td>
						</xsl:if>
					</xsl:for-each>
				</tr>
			</xsl:for-each>
			<!-- rows' actions??? -->
			<xsl:if test="contains($position,'bottom')">
				<tr class="panelReportHeader">
					<td colspan="200" align="center">
						<h1>
						<xsl:for-each select="$panel/afmAction">
							<xsl:call-template name="helper_afmAction">
								<xsl:with-param name="afmAction" select="."/>
								<xsl:with-param name="form" select="$panel_id"/>
								<xsl:with-param name="bData" select="'true'"/>
							</xsl:call-template>
						</xsl:for-each>
						<xsl:for-each select="$panel/multiSelection/afmAction">
							<xsl:call-template name="helper_afmAction">
								<xsl:with-param name="afmAction" select="."/>
								<xsl:with-param name="form" select="$panel_id"/>
								<xsl:with-param name="bData" select="'true'"/>
							</xsl:call-template>
						</xsl:for-each>
						</h1>
					</td>
				</tr>
			</xsl:if>
		</table>
		<xsl:if test="count($panel/table/row/cell) &lt;= 0">
			<div style='margin-left:5pt;' class="instruction">
				<p><span translatable="true">No Items.</span></p>							
			</div>			
		</xsl:if>
		<!-- XXXXXXXXX??????? -->
		<!--xsl:if test="(count($panel/table/row/cell) &gt; 0) and (count($panel/fields/field[@afmType='timemark']) &gt; 0)">
			<script language="javascript">
				var marks=[<xsl:for-each select="$panel/fields/field[@afmType='timemark']">'<xsl:value-of select="@value"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>];
				var resources=[<xsl:for-each select="$panel/table/row">[<xsl:for-each select="cell[@value!='']">'<xsl:value-of select="@value"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>]<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>];
				var helper = new TimelineHelper(<xsl:value-of select="count($panel/table/row)"/>,<xsl:value-of select="count($panel/fields/field[@afmType='timemark'])"/>,marks,resources);
				YAHOO.util.Event.addListener(window, 'load', YAHOO.timeline.initTimeline, helper);
			</script-->
			<div id="debug">  </div>
		<!--/xsl:if-->
	</xsl:template>

	<xsl:template name="panel_report_body_header">
		<xsl:param name="panel"/>
		<xsl:param name="showCheckBox"/>
        <!-- index column disabled by default -->
		<!--th><span translatable="true">Index</span></th-->				
		<!-- mutli-row select actions??? -->
		<xsl:if test="$showCheckBox='true'">
			<th><br /></th>
		</xsl:if>
		<xsl:for-each select="$panel/fields/field">
			<xsl:variable name="hidden"><xsl:choose><xsl:when test="@hidden"><xsl:value-of select="@hidden"/></xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose></xsl:variable>
			<xsl:if test="$hidden='false'">
				<th class="{@labelClass}">
					<xsl:choose>
						<xsl:when test="@singleLineHeading"><xsl:value-of select="@singleLineHeading"/></xsl:when>
						<xsl:otherwise><xsl:value-of select="title/text()"/></xsl:otherwise>
					</xsl:choose>		
				</th>
			</xsl:if>
		</xsl:for-each>
	</xsl:template>


</xsl:stylesheet>