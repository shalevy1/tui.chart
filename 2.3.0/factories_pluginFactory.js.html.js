tui.util.defineNamespace("fedoc.content", {});
fedoc.content["factories_pluginFactory.js.html"] = "      <div id=\"main\" class=\"main\">\n\n\n\n    \n    <section>\n        <article>\n            <pre class=\"prettyprint source linenums\"><code>/**\n * @fileoverview  Plugin factory play role register rendering plugin.\n *                Also, you can get plugin from this factory.\n * @author NHN Ent.\n *         FE Development Lab &lt;dl_javascript@nhnent.com>\n */\n\n'use strict';\n\nvar plugins = {},\n    factory = {\n        /**\n         * Get graph renderer.\n         * @param {string} libType type of graph library\n         * @param {string} chartType chart type\n         * @returns {object} renderer instance\n         */\n        get: function(libType, chartType) {\n            var plugin = plugins[libType],\n                Renderer, renderer;\n\n            if (!plugin) {\n                throw new Error('Not exist ' + libType + ' plugin.');\n            }\n\n            Renderer = plugin[chartType];\n            if (!Renderer) {\n                throw new Error('Not exist ' + chartType + ' chart renderer.');\n            }\n\n            renderer = new Renderer();\n\n            return renderer;\n        },\n        /**\n         * Plugin register.\n         * @param {string} libType type of graph library\n         * @param {object} plugin plugin to control library\n         */\n        register: function(libType, plugin) {\n            plugins[libType] = plugin;\n        }\n    };\n\nmodule.exports = factory;\n</code></pre>\n        </article>\n    </section>\n\n\n\n</div>\n\n"