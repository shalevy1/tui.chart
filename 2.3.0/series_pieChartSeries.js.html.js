tui.util.defineNamespace("fedoc.content", {});
fedoc.content["series_pieChartSeries.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview Pie chart series component.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar Series = require('./series');\nvar chartConst = require('../const');\nvar predicate = require('../helpers/predicate');\nvar renderUtil = require('../helpers/renderUtil');\n\nvar PieChartSeries = tui.util.defineClass(Series, /** @lends PieChartSeries.prototype */ {\n    /**\n     * Line chart series component.\n     * @constructs PieChartSeries\n     * @extends Series\n     * @param {object} params parameters\n     *      @param {object} params.model series model\n     *      @param {object} params.options series options\n     *      @param {object} params.theme series theme\n     */\n    init: function(params) {\n        Series.call(this, params);\n\n        this.isCombo = !!params.isCombo;\n\n        this.isShowOuterLabel = !!params.isShowOuterLabel || predicate.isShowOuterLabel(this.options);\n\n        /**\n         * range for quadrant.\n         * @type {?number}\n         */\n        this.quadrantRange = null;\n\n        /**\n         * previous clicked index.\n         * @type {?number}\n         */\n        this.prevClickedIndex = null;\n\n        this._setDefaultOptions();\n    },\n\n    /**\n     * Make valid angle.\n     * @param {number} angle - angle\n     * @param {number} defaultAngle - default angle\n     * @returns {number}\n     * @private\n     */\n    _makeValidAngle: function(angle, defaultAngle) {\n        if (tui.util.isUndefined(angle)) {\n            angle = defaultAngle;\n        } else if (angle &lt; 0) {\n            angle = chartConst.ANGLE_360 - (Math.abs(angle) % chartConst.ANGLE_360);\n        } else if (angle > 0) {\n            angle = angle % chartConst.ANGLE_360;\n        }\n\n        return angle;\n    },\n\n    /**\n     * Transform radius range.\n     * @param {Array.&lt;number>} radiusRange - radius range\n     * @returns {Array}\n     * @private\n     */\n    _transformRadiusRange: function(radiusRange) {\n        radiusRange = radiusRange || ['0%', '100%'];\n\n        return tui.util.map(radiusRange, function(percent) {\n            var ratio = parseInt(percent, 10) * 0.01;\n\n            return Math.max(Math.min(ratio, 1), 0);\n        });\n    },\n\n    /**\n     * Set default options for series of pie type chart.\n     * @private\n     */\n    _setDefaultOptions: function() {\n        var options = this.options;\n\n        options.startAngle = this._makeValidAngle(options.startAngle, 0);\n        options.endAngle = this._makeValidAngle(options.endAngle, options.startAngle);\n        options.radiusRange = this._transformRadiusRange(options.radiusRange);\n\n        if (options.radiusRange.length === 1) {\n            options.radiusRange.unshift(0);\n        }\n    },\n\n    /**\n     * Calculate angle for rendering.\n     * @returns {number}\n     * @private\n     */\n    _calculateAngleForRendering: function() {\n        var startAngle = this.options.startAngle;\n        var endAngle = this.options.endAngle;\n        var renderingAngle;\n\n        if (startAngle &lt; endAngle) {\n            renderingAngle = endAngle - startAngle;\n        } else if (startAngle > endAngle) {\n            renderingAngle = chartConst.ANGLE_360 - (startAngle - endAngle);\n        } else {\n            renderingAngle = chartConst.ANGLE_360;\n        }\n\n        return renderingAngle;\n    },\n\n    /**\n     * Make sectors information.\n     * @param {{cx: number, cy: number, r: number}} circleBound circle bound\n     * @returns {Array.&lt;object>} sectors information\n     * @private\n     */\n    _makeSectorData: function(circleBound) {\n        var self = this;\n        var seriesGroup = this._getSeriesDataModel().getFirstSeriesGroup();\n        var cx = circleBound.cx;\n        var cy = circleBound.cy;\n        var r = circleBound.r;\n        var angle = this.options.startAngle;\n        var angleForRendering = this._calculateAngleForRendering();\n        var delta = 10;\n        var holeRatio = this.options.radiusRange[0];\n        var centerR = r * 0.5;\n        var paths;\n\n        if (holeRatio) {\n            centerR += centerR * holeRatio;\n        }\n\n        paths = seriesGroup.map(function(seriesItem) {\n            var currentAngle = angleForRendering * seriesItem.ratio;\n            var endAngle = angle + currentAngle;\n            var popupAngle = angle + (currentAngle / 2);\n            var angles = {\n                start: {\n                    startAngle: angle,\n                    endAngle: angle\n                },\n                end: {\n                    startAngle: angle,\n                    endAngle: endAngle\n                }\n            };\n            var positionData = {\n                cx: cx,\n                cy: cy,\n                angle: popupAngle\n            };\n\n            angle = endAngle;\n\n            return {\n                ratio: seriesItem.ratio,\n                angles: angles,\n                centerPosition: self._getArcPosition(tui.util.extend({\n                    r: centerR\n                }, positionData)),\n                outerPosition: {\n                    start: self._getArcPosition(tui.util.extend({\n                        r: r\n                    }, positionData)),\n                    middle: self._getArcPosition(tui.util.extend({\n                        r: r + delta\n                    }, positionData))\n                }\n            };\n        });\n\n        return paths;\n    },\n\n    /**\n     * Make series data.\n     * @returns {{\n     *      chartBackground: string,\n     *      circleBound: ({cx: number, cy: number, r: number}),\n     *      sectorData: Array.&lt;object>\n     * }} add data for graph rendering\n     * @private\n     * @override\n     */\n    _makeSeriesData: function() {\n        var circleBound = this._makeCircleBound(),\n            sectorData = this._makeSectorData(circleBound);\n\n        return {\n            chartBackground: this.chartBackground,\n            circleBound: circleBound,\n            sectorData: sectorData\n        };\n    },\n\n    /**\n     * Get quadrant from angle.\n     * @param {number} angle - angle\n     * @param {boolean} isEnd whether end quadrant\n     * @returns {number}\n     * @private\n     */\n    _getQuadrantFromAngle: function(angle, isEnd) {\n        var quadrant = parseInt(angle / chartConst.ANGLE_90, 10) + 1;\n\n        if (isEnd &amp;&amp; (angle % chartConst.ANGLE_90 === 0)) {\n            quadrant += (quadrant === 1) ? 3 : -1;\n        }\n\n        return quadrant;\n    },\n\n    /**\n     * Get range for quadrant.\n     * @returns {{start: number, end: number}}\n     * @private\n     */\n    _getRangeForQuadrant: function() {\n        if (!this.quadrantRange) {\n            this.quadrantRange = {\n                start: this._getQuadrantFromAngle(this.options.startAngle),\n                end: this._getQuadrantFromAngle(this.options.endAngle, true)\n            };\n        }\n\n        return this.quadrantRange;\n    },\n\n    /**\n     * Whether in range for quadrant.\n     * @param {number} start - start quadrant\n     * @param {number} end - end quadrant\n     * @returns {boolean}\n     * @private\n     */\n    _isInQuadrantRange: function(start, end) {\n        var quadrantRange = this._getRangeForQuadrant();\n\n        return quadrantRange.start === start &amp;&amp; quadrantRange.end === end;\n    },\n\n    /**\n     * Calculate base size.\n     * @returns {number}\n     * @private\n     */\n    _calculateBaseSize: function() {\n        var dimension = this.boundsMaker.getDimension('series');\n        var width = dimension.width;\n        var height = dimension.height;\n        var quadrantRange;\n\n        if (!this.isCombo) {\n            quadrantRange = this._getRangeForQuadrant();\n            if (this._isInQuadrantRange(2, 3) || this._isInQuadrantRange(4, 1)) {\n                height *= 2;\n            } else if (this._isInQuadrantRange(1, 2) || this._isInQuadrantRange(3, 4)) {\n                width *= 2;\n            } else if (quadrantRange.start === quadrantRange.end) {\n                width *= 2;\n                height *= 2;\n            }\n        }\n\n        return Math.min(width, height);\n    },\n\n    /**\n     * Calculate radius.\n     * @returns {number}\n     * @private\n     */\n    _calculateRadius: function() {\n        var radiusRatio = this.isShowOuterLabel ? chartConst.PIE_GRAPH_SMALL_RATIO : chartConst.PIE_GRAPH_DEFAULT_RATIO;\n        var baseSize = this._calculateBaseSize();\n\n        return baseSize * radiusRatio * this.options.radiusRange[1] / 2;\n    },\n\n    /**\n     * Calculate center x, y.\n     * @param {number} radius - radius\n     * @returns {{cx: number, cy: number}}\n     * @private\n     */\n    _calculateCenterXY: function(radius) {\n        var dimension = this.boundsMaker.getDimension('series');\n        var halfRadius = radius / 2;\n        var cx = dimension.width / 2;\n        var cy = dimension.height / 2;\n\n        if (!this.isCombo) {\n            if (this._isInQuadrantRange(1, 1)) {\n                cx -= halfRadius;\n                cy += halfRadius;\n            } else if (this._isInQuadrantRange(1, 2)) {\n                cx -= halfRadius;\n            } else if (this._isInQuadrantRange(2, 2)) {\n                cx -= halfRadius;\n                cy -= halfRadius;\n            } else if (this._isInQuadrantRange(2, 3)) {\n                cy -= halfRadius;\n            } else if (this._isInQuadrantRange(3, 3)) {\n                cx += halfRadius;\n                cy -= halfRadius;\n            } else if (this._isInQuadrantRange(3, 4)) {\n                cx += halfRadius;\n            } else if (this._isInQuadrantRange(4, 1)) {\n                cy += halfRadius;\n            } else if (this._isInQuadrantRange(4, 4)) {\n                cx += halfRadius;\n                cy += halfRadius;\n            }\n        }\n\n        return {\n            cx: cx,\n            cy: cy\n        };\n    },\n\n    /**\n     * Make circle bound\n     * @returns {{cx: number, cy: number, r: number}} circle bounds\n     * @private\n     */\n    _makeCircleBound: function() {\n        var radius = this._calculateRadius();\n        var centerXY = this._calculateCenterXY(radius);\n\n        return tui.util.extend({\n            r: radius\n        }, centerXY);\n    },\n\n    /**\n     * Get arc position.\n     * @param {object} params parameters\n     *      @param {number} params.cx center x\n     *      @param {number} params.cy center y\n     *      @param {number} params.r radius\n     *      @param {number} params.angle angle(degree)\n     * @returns {{left: number, top: number}} arc position\n     * @private\n     */\n    _getArcPosition: function(params) {\n        return {\n            left: params.cx + (params.r * Math.sin(params.angle * chartConst.RAD)),\n            top: params.cy - (params.r * Math.cos(params.angle * chartConst.RAD))\n        };\n    },\n\n    /**\n     * Render raphael graph.\n     * @param {{width: number, height: number}} dimension dimension\n     * @param {object} seriesData series data\n     * @private\n     * @override\n     */\n    _renderGraph: function(dimension, seriesData, paper) {\n        var showTootltip = tui.util.bind(this.showTooltip, this, {\n            allowNegativeTooltip: !!this.allowNegativeTooltip,\n            seriesName: this.seriesName,\n            chartType: this.chartType\n        });\n        var callbacks = {\n            showTooltip: showTootltip,\n            hideTooltip: tui.util.bind(this.hideTooltip, this)\n        };\n        var params = this._makeParamsForGraphRendering(dimension, seriesData);\n\n        params.paper = paper;\n\n        return this.graphRenderer.render(this.seriesContainer, params, callbacks);\n    },\n\n    /**\n     * Resize.\n     * @override\n     */\n    resize: function() {\n        Series.prototype.resize.apply(this, arguments);\n        this._moveLegendLines();\n    },\n\n    /**\n     * showTooltip is mouseover event callback on series graph.\n     * @param {object} params parameters\n     *      @param {boolean} params.allowNegativeTooltip whether allow negative tooltip or not\n     * @param {{top:number, left: number, width: number, height: number}} bound graph bound information\n     * @param {number} groupIndex group index\n     * @param {number} index index\n     * @param {{left: number, top: number}} mousePosition mouse position\n     */\n    showTooltip: function(params, bound, groupIndex, index, mousePosition) {\n        this.fire('showTooltip', tui.util.extend({\n            indexes: {\n                groupIndex: groupIndex,\n                index: index\n            },\n            mousePosition: mousePosition\n        }, params));\n    },\n\n    /**\n     * hideTooltip is mouseout event callback on series graph.\n     */\n    hideTooltip: function() {\n        this.fire('hideTooltip');\n    },\n\n    /**\n     * Make series data by selection.\n     * @param {number} index index\n     * @returns {{indexes: {index: number, groupIndex: number}}} series data\n     * @private\n     */\n    _makeSeriesDataBySelection: function(index) {\n        return {\n            indexes: {\n                index: index,\n                groupIndex: index\n            }\n        };\n    },\n\n    /**\n     * Get series label.\n     * @param {object} params parameters\n     *      @param {string} params.legend legend\n     *      @param {string} params.label label\n     *      @param {string} params.separator separator\n     * @returns {string} series label\n     * @private\n     */\n    _getSeriesLabel: function(params) {\n        var seriesLabel = '';\n\n        if (this.options.showLegend) {\n            seriesLabel = '&lt;span class=\"tui-chart-series-legend\">' + params.legend + '&lt;/span>';\n        }\n\n        if (this.options.showLabel) {\n            seriesLabel += (seriesLabel ? params.separator : '') + params.label;\n        }\n\n        return seriesLabel;\n    },\n\n    /**\n     * Render center legend.\n     * @param {object} params parameters\n     *      @param {Array.&lt;object>} params.positions positions\n     *      @param {string} params.separator separator\n     *      @param {object} params.options options\n     *      @param {function} params.funcMoveToPosition function\n     * @param {HTMLElement} seriesLabelContainer series label area element\n     * @private\n     */\n    _renderLegendLabel: function(params, seriesLabelContainer) {\n        var self = this;\n        var dataProcessor = this.dataProcessor;\n        var seriesDataModel = this._getSeriesDataModel();\n        var positions = params.positions;\n        var htmls = tui.util.map(dataProcessor.getLegendLabels(this.seriesName), function(legend, index) {\n            var html = '',\n                label, position;\n\n            if (positions[index]) {\n                label = self._getSeriesLabel({\n                    legend: legend,\n                    label: seriesDataModel.getSeriesItem(0, index).label,\n                    separator: params.separator\n                });\n                position = params.funcMoveToPosition(positions[index], label);\n                html = self._makeSeriesLabelHtml(position, label, index);\n            }\n\n            return html;\n        });\n\n        seriesLabelContainer.innerHTML = htmls.join('');\n    },\n\n    /**\n     * Move to center position.\n     * @param {{left: number, top: number}} position position\n     * @param {string} label label\n     * @returns {{left: number, top: number}} center position\n     * @private\n     */\n    _moveToCenterPosition: function(position, label) {\n        var left = position.left - (renderUtil.getRenderedLabelWidth(label, this.theme.label) / 2),\n            top = position.top - (renderUtil.getRenderedLabelHeight(label, this.theme.label) / 2);\n\n        return {\n            left: left,\n            top: top\n        };\n    },\n\n    /**\n     * Pick poistions from sector data.\n     * @param {string} positionType position type\n     * @returns {Array} positions\n     * @private\n     */\n    _pickPositionsFromSectorData: function(positionType) {\n        return tui.util.map(this.seriesData.sectorData, function(datum) {\n            return datum.ratio ? datum[positionType] : null;\n        });\n    },\n\n    /**\n     * Render center legend.\n     * @param {HTMLElement} seriesLabelContainer series label area element\n     * @private\n     */\n    _renderCenterLegend: function(seriesLabelContainer) {\n        this._renderLegendLabel({\n            positions: this._pickPositionsFromSectorData('centerPosition'),\n            funcMoveToPosition: tui.util.bind(this._moveToCenterPosition, this),\n            separator: '&lt;br>'\n        }, seriesLabelContainer);\n    },\n\n    /**\n     * Add end position.\n     * @param {number} centerLeft center left\n     * @param {Array.&lt;object>} positions positions\n     * @private\n     */\n    _addEndPosition: function(centerLeft, positions) {\n        tui.util.forEachArray(positions, function(position) {\n            var end;\n\n            if (!position) {\n                return;\n            }\n\n            end = tui.util.extend({}, position.middle);\n            if (end.left &lt; centerLeft) {\n                end.left -= chartConst.SERIES_OUTER_LABEL_PADDING;\n            } else {\n                end.left += chartConst.SERIES_OUTER_LABEL_PADDING;\n            }\n            position.end = end;\n        });\n    },\n\n    /**\n     * Move to outer position.\n     * @param {number} centerLeft center left\n     * @param {object} position position\n     * @param {string} label label\n     * @returns {{left: number, top: number}} outer position\n     * @private\n     */\n    _moveToOuterPosition: function(centerLeft, position, label) {\n        var positionEnd = position.end,\n            left = positionEnd.left,\n            top = positionEnd.top - (renderUtil.getRenderedLabelHeight(label, this.theme.label) / 2);\n\n        if (left &lt; centerLeft) {\n            left -= renderUtil.getRenderedLabelWidth(label, this.theme.label) + chartConst.SERIES_LABEL_PADDING;\n        } else {\n            left += chartConst.SERIES_LABEL_PADDING;\n        }\n\n        return {\n            left: left,\n            top: top\n        };\n    },\n\n    /**\n     * Render outer legend.\n     * @param {HTMLElement} seriesLabelContainer series label area element\n     * @private\n     */\n    _renderOuterLegend: function(seriesLabelContainer) {\n        var centerLeft = this.getSeriesData().circleBound.cx;\n        var outerPositions = this._pickPositionsFromSectorData('outerPosition');\n        var filteredPositions = tui.util.filter(outerPositions, function(position) {\n            return position;\n        });\n\n        this._addEndPosition(centerLeft, filteredPositions);\n        this._renderLegendLabel({\n            positions: outerPositions,\n            funcMoveToPosition: tui.util.bind(this._moveToOuterPosition, this, centerLeft),\n            separator: ':&amp;nbsp;'\n        }, seriesLabelContainer);\n\n        this.graphRenderer.renderLegendLines(filteredPositions);\n    },\n\n    /**\n     * Render series label.\n     * @param {HTMLElement} seriesLabelContainer series label area element\n     * @private\n     */\n    _renderSeriesLabel: function(seriesLabelContainer) {\n        if (predicate.isLabelAlignOuter(this.options.labelAlign)) {\n            this._renderOuterLegend(seriesLabelContainer);\n        } else {\n            this._renderCenterLegend(seriesLabelContainer);\n        }\n    },\n\n    /**\n     * Animate series label area.\n     * @override\n     */\n    animateSeriesLabelArea: function() {\n        this.graphRenderer.animateLegendLines(this.selectedLegendIndex);\n        Series.prototype.animateSeriesLabelArea.call(this);\n    },\n\n    /**\n     * Move legend lines.\n     * @private\n     * @override\n     */\n    _moveLegendLines: function() {\n        var centerLeft = this.boundsMaker.getDimension('chart').width / 2,\n            outerPositions = this._pickPositionsFromSectorData('outerPosition'),\n            filteredPositions = tui.util.filter(outerPositions, function(position) {\n                return position;\n            });\n\n        this._addEndPosition(centerLeft, filteredPositions);\n        this.graphRenderer.moveLegendLines(filteredPositions);\n    },\n\n    /**\n     * Whether detected label element or not.\n     * @param {{left: number, top: number}} position - mouse position\n     * @returns {boolean}\n     * @private\n     */\n    _isDetectedLabel: function(position) {\n        var labelElement = document.elementFromPoint(position.left, position.top);\n\n        return tui.util.isString(labelElement.className);\n    },\n\n    /**\n     * On click series.\n     * @param {{left: number, top: number}} position mouse position\n     */\n    onClickSeries: function(position) {\n        var sectorInfo = this._executeGraphRenderer(position, 'findSectorInfo');\n        var prevIndex = this.prevClickedIndex;\n        var allowSelect = this.options.allowSelect;\n        var foundIndex, shouldSelect;\n\n        if ((sectorInfo || this._isDetectedLabel(position)) &amp;&amp; tui.util.isExisty(prevIndex) &amp;&amp; allowSelect) {\n            this.onUnselectSeries({\n                indexes: {\n                    index: prevIndex\n                }\n            });\n            this.prevClickedIndex = null;\n        }\n\n        if (!sectorInfo || sectorInfo.chartType !== this.chartType) {\n            return;\n        }\n\n        foundIndex = sectorInfo.index;\n        shouldSelect = foundIndex > -1 &amp;&amp; (foundIndex !== prevIndex);\n\n        if (allowSelect &amp;&amp; !shouldSelect) {\n            return;\n        }\n\n        this.onSelectSeries({\n            indexes: {\n                index: foundIndex\n            }\n        }, shouldSelect);\n\n        if (allowSelect &amp;&amp; foundIndex > -1) {\n            this.prevClickedIndex = foundIndex;\n        }\n    },\n\n    /**\n     * On move series.\n     * @param {{left: number, top: number}} position mouse position\n     */\n    onMoveSeries: function(position) {\n        this._executeGraphRenderer(position, 'moveMouseOnSeries');\n    }\n});\n\ntui.util.CustomEvents.mixin(PieChartSeries);\n\nmodule.exports = PieChartSeries;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"