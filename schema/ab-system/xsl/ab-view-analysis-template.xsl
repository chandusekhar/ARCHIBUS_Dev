<?xml version="1.0"?>
<!-- Yong Shao -->
<!-- 12-13-2004 -->
<!-- handling the XML of View Analysis: 1D???? -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">	
	<xsl:template name="Mdx">
	<xsl:param name="afmTableGroup"/>
	<xsl:param name="margin-left"/>
	<xsl:param name="level"/>
	<xsl:param name="format"/>
		<xsl:variable name="showGrid">
			<xsl:choose>
				<!-- check if there is showGrid in axvw -->
				<xsl:when test="$afmTableGroup/@showGrid">
					<xsl:value-of select="$afmTableGroup/@showGrid"/>
				</xsl:when>
				<!-- there is no showGrid in axvw, false is used as default -->
				<xsl:otherwise>false</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<table class="AbMdx_Table" valign="top">
			<tr><td>
				<xsl:variable name="chart" select="$afmTableGroup/dataSource/data/charts/chart[position()=1]"/>
				<xsl:variable name="chart_image" translatable="true">Chart</xsl:variable>
				<xsl:if test="count($chart) &gt; 0">
					<xsl:for-each select="$afmTableGroup/dataSource/data/charts/chart">
						<img alt="{$chart_image}" USEMAP="#{map/@name}" src="{@name}"/>
					</xsl:for-each>
				</xsl:if>
				<xsl:if test="count($chart) &lt;= 0">
					<xsl:if test="$afmTableGroup/dataSource/mdx/preferences/@dimensions = '1'">
						<table>
							<xsl:attribute name="border"><xsl:choose><xsl:when test="$showGrid='true'">1</xsl:when><xsl:otherwise>0</xsl:otherwise></xsl:choose></xsl:attribute>	
							<!-- headings -->
							<tr>
								<td class="AbMdx_DimensionNames">
                                    <xsl:call-template name="getTitle">
                                        <xsl:with-param name="element" select="$afmTableGroup/dataSource/data/rowDimension"/>
                                    </xsl:call-template>
								</td>
								<xsl:for-each select="$afmTableGroup/dataSource/mdx/preferences/measures/measure">
									<td class="AbMdx_DimensionColumnHeader">
                                        <xsl:call-template name="getTitle">
                                            <xsl:with-param name="element" select="."/>
                                        </xsl:call-template>
									</td>
								</xsl:for-each>
							</tr>
							<!-- values -->
							<xsl:for-each select="$afmTableGroup/dataSource/data/recordIndices/recordIndex">
								<xsl:variable name="rowDimensionName" select="@rowDimensionName"/>
								<xsl:variable name="rowDimensionMember" select="//rowDimension/member[@name=$rowDimensionName]"/>
								<xsl:variable name="rowHeadAction" select="$rowDimensionMember/afmAction"/>
								<tr>
									<td>
										<xsl:attribute name="class">
											<xsl:choose>
												<xsl:when test="$rowDimensionMember/@isAll='true'">AbMdx_TotalCellHeader</xsl:when>
												<xsl:otherwise>AbMdx_DimensionRowHeader</xsl:otherwise>
											</xsl:choose>
										</xsl:attribute>
										<xsl:call-template name="showingResult">
											<xsl:with-param name="value" select="$rowDimensionName"/>
											<xsl:with-param name="afmAction" select="$rowHeadAction"/>
										</xsl:call-template>
									</td>
									<xsl:for-each select="cell">
										<td>
											<xsl:attribute name="class">
                                                <xsl:value-of select="@class" />
											</xsl:attribute>
											<xsl:call-template name="showingResult">
												<xsl:with-param name="value" select="@displayValue"/>
												<xsl:with-param name="afmAction" select="$rowHeadAction"/>
												<xsl:with-param name="showDrillDown" select="@showDrillDown"/>
											</xsl:call-template>
										</td>
									</xsl:for-each>
								</tr>
							</xsl:for-each>
						</table>
					</xsl:if>
					<xsl:if test="$afmTableGroup/dataSource/mdx/preferences/@dimensions = '2'">
						<xsl:call-template name="Format2d_h">
							<xsl:with-param name="afmTableGroup" select="$afmTableGroup"/>
							<xsl:with-param name="showGrid" select="$showGrid"/>
						</xsl:call-template>
					</xsl:if>
				</xsl:if>
			</td></tr>
		</table>
		<xsl:if test="not (count($afmTableGroup/dataSource/data/records/record) &gt; 0)">
			<div style='margin-left:5pt;'>
				<table><tr>
					<td  class="instruction" align="center" valign="top">
						<p><span translatable="true">No Items.</span></p>
					</td>	
				</tr></table>
			</div>
		</xsl:if>
	</xsl:template>

	<xsl:template name="Format2d_h">
		<xsl:param name="afmTableGroup"/>
		<xsl:param name="showGrid"/>

		<xsl:variable name="rowDimension_counter" select="count($afmTableGroup/dataSource/data/rowDimension/member)"/>
		<table class="AbMdx_Table">
			<xsl:attribute name="border"><xsl:choose><xsl:when test="$showGrid='true'">1</xsl:when><xsl:otherwise>0</xsl:otherwise></xsl:choose></xsl:attribute>	
			<tr>
				<td colspan="2" class="AbMdx_DimensionNames">
					<br />	
				</td>
				<td colspan="{$rowDimension_counter}" class="AbMdx_DimensionNames">
                    <xsl:call-template name="getTitle">
                        <xsl:with-param name="element" select="$afmTableGroup/dataSource/data/rowDimension"/>
                    </xsl:call-template>
				</td>
			</tr>
			<tr>
				<td class="AbMdx_DimensionNames">
                    <xsl:call-template name="getTitle">
                        <xsl:with-param name="element" select="$afmTableGroup/dataSource/data/columnDimension"/>
                    </xsl:call-template>
				</td>
				<td class="AbMdx_DimensionNames">
					<br />	
				</td>
				<xsl:for-each select="$afmTableGroup/dataSource/data/rowDimension/member">
					<td>
						<xsl:attribute name="class">
							<xsl:choose>
								<xsl:when test="@isAll='true'">AbMdx_TotalCellHeader</xsl:when>
								<xsl:otherwise>AbMdx_DimensionColumnHeader</xsl:otherwise>
							</xsl:choose>
						</xsl:attribute>
						<xsl:call-template name="showingResult">
							<xsl:with-param name="value" select="@name"/>
							<xsl:with-param name="afmAction" select="afmAction"/>
						</xsl:call-template>
					</td>
				</xsl:for-each>
			</tr>
			<xsl:variable name="fields_counter" select="count($afmTableGroup/dataSource/data/fields/field)"/>
			<xsl:for-each select="$afmTableGroup/dataSource/data/columnDimension/member">
				<xsl:variable name="columnDimensionName" select="@name"/>
				<xsl:variable name="columnAction" select="afmAction"/>
				<xsl:variable name="classForMeasure">
					<xsl:choose>
						<xsl:when test="@isAll='true'">AbMdx_MeasureName</xsl:when>
						<xsl:otherwise>AbMdx_MeasureColumn</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<tr>
					<td rowspan="{$fields_counter}">
						<xsl:attribute name="class">
							<xsl:choose>
								<xsl:when test="@isAll='true'">AbMdx_TotalCellHeader</xsl:when>
								<xsl:otherwise>AbMdx_DimensionRowHeader</xsl:otherwise>
							</xsl:choose>
						</xsl:attribute>
						
						<xsl:call-template name="showingResult">
							<xsl:with-param name="value" select="@name"/>
							<xsl:with-param name="afmAction" select="afmAction"/>
						</xsl:call-template>
					</td>
					
					<td class="{$classForMeasure}">
                        <xsl:call-template name="getTitle">
                            <xsl:with-param name="element" select="$afmTableGroup/dataSource/mdx/preferences/measures/measure[position()=1]"/>
                        </xsl:call-template>
					</td>
					<xsl:for-each select="$afmTableGroup/dataSource/data/rowDimension/member">
						<xsl:variable name="rowDimensionName" select="@name"/>
						<xsl:variable name="recordIndexEntry" select="$afmTableGroup/dataSource/data/recordIndices/recordIndex[@columnDimensionName=$columnDimensionName and @rowDimensionName=$rowDimensionName]"/>
						<xsl:variable name="recordIndex" select="$recordIndexEntry/@recordIndex"/>
						<xsl:variable name="rowDimensionIsAll" select="$recordIndexEntry/@rowDimensionIsAll"/>
						<xsl:variable name="columnDimensionIsAll" select="$recordIndexEntry/@columnDimensionIsAll"/>
                        <xsl:variable name="recordAction" select="$afmTableGroup/dataSource/data/records/record[position()=$recordIndex]/afmAction"/>

                        <xsl:for-each select="$recordIndexEntry/cell">
							<xsl:if test="position()=1">
                                <td>
                                    <xsl:attribute name="class">
                                        <xsl:value-of select="@class" />
                                    </xsl:attribute>
                                    <xsl:call-template name="showingResult">
                                        <xsl:with-param name="value" select="@displayValue"/>
                                        <xsl:with-param name="afmAction" select="$recordAction"/>
                                        <xsl:with-param name="showDrillDown" select="@showDrillDown"/>
                                    </xsl:call-template>
                                </td>
							</xsl:if>
                        </xsl:for-each>
					</xsl:for-each>
				</tr>
				<xsl:for-each select="$afmTableGroup/dataSource/data/fields/field[position() &gt; 1]">
					<xsl:variable name="fieldName" select="concat(@table, '.', @name)"/>
					<xsl:variable name="fieldIndex" select="position()"/>
					<tr>
						<td class="{$classForMeasure}">
                            <xsl:call-template name="getTitle">
                                <xsl:with-param name="element" select="$afmTableGroup/dataSource/mdx/preferences/measures/measure[position()=$fieldIndex+1]"/>
                            </xsl:call-template>
						</td>
						<xsl:for-each select="$afmTableGroup/dataSource/data/rowDimension/member">
                            <xsl:variable name="rowDimensionName" select="@name"/>
                            <xsl:variable name="recordIndexEntry" select="$afmTableGroup/dataSource/data/recordIndices/recordIndex[@columnDimensionName=$columnDimensionName and @rowDimensionName=$rowDimensionName]"/>
                            <xsl:variable name="recordIndex" select="$recordIndexEntry/@recordIndex"/>
                            <xsl:variable name="rowDimensionIsAll" select="$recordIndexEntry/@rowDimensionIsAll"/>
                            <xsl:variable name="columnDimensionIsAll" select="$recordIndexEntry/@columnDimensionIsAll"/>
                            <xsl:variable name="recordAction" select="$afmTableGroup/dataSource/data/records/record[position()=$recordIndex]/afmAction"/>
                            <xsl:variable name="cell" select="$recordIndexEntry/cell[position()=$fieldIndex+1]"/>
                            
                            <td>
                                <xsl:attribute name="class">
                                    <xsl:value-of select="$cell/@class" />
                                </xsl:attribute>
                                <xsl:call-template name="showingResult">
                                    <xsl:with-param name="value" select="$cell/@displayValue"/>
                                    <xsl:with-param name="afmAction" select="$recordAction"/>
                                    <xsl:with-param name="showDrillDown" select="$cell/@showDrillDown"/>
                                </xsl:call-template>
                            </td>
						</xsl:for-each>
					</tr>
				</xsl:for-each>
			</xsl:for-each>
		</table>
	</xsl:template>
	
	<xsl:template name="showingResult">
		<xsl:param name="value"/>
		<xsl:param name="afmAction"/>
		<xsl:param name="showDrillDown"/>
        
        <xsl:choose>
            <xsl:when test="$showDrillDown = 'false' or count($afmAction) &lt;= 0">
                <xsl:value-of select="$value"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:variable name="actionTip" select="$afmAction/title"/>
                <xsl:variable name="actionSerialized" select="$afmAction/@serialized"/>
                <xsl:variable name="isNewWindow" select="$afmAction/@newWindow"/>
                <xsl:variable name="actionTarget">
                    <xsl:choose>
                        <xsl:when test="$isNewWindow='true'">_blank</xsl:when>
                        <xsl:otherwise>_self</xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <a href="#" title="{$actionTip}" onclick='sendingDataFromHiddenForm("","{$actionSerialized}","{$actionTarget}","",false,"");return false;'><xsl:value-of select="$value"/></a>
            </xsl:otherwise>
        </xsl:choose>
	</xsl:template>
    
    <xsl:template name="getTitle">
        <xsl:param name="element"/>
        <xsl:choose>
            <xsl:when test="$element/title">
                <xsl:value-of select="$element/title/text()"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$element/@name"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

</xsl:stylesheet>


