using System;
using System.Collections.Generic;
using Jellyfin.Plugin.SkinManager.Configuration;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;

namespace Jellyfin.Plugin.SkinManager;

/// <summary>
/// The main plugin.
/// </summary>
public class Plugin : BasePlugin<PluginConfiguration>, IHasWebPages
{
    /// <summary>
    /// Initializes a new instance of the <see cref="Plugin"/> class.
    /// </summary>
    /// <param name="applicationPaths">Instance of the <see cref="IApplicationPaths"/> interface.</param>
    /// <param name="xmlSerializer">Instance of the <see cref="IXmlSerializer"/> interface.</param>
    public Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer)
        : base(applicationPaths, xmlSerializer)
    {
        Instance = this;
    }

    /// <inheritdoc />
    public override string Name => "SkinManager";

    /// <inheritdoc />
    public override Guid Id => Guid.Parse("e9ca8b8e-ca6d-40e7-85dc-58e536df8eb3");

    /// <summary>
    /// Gets the current plugin instance.
    /// </summary>
    public static Plugin? Instance { get; private set; }

    /// <inheritdoc />
    public override string Description => "Skin Manager";

    /// <inheritdoc />
    public IEnumerable<PluginPageInfo> GetPages()
    {
        return new[]
        {
            // HTML
            new PluginPageInfo
            {
                Name = Name,
                EmbeddedResourcePath = $"{GetType().Namespace}.Configuration.configPage.html"
            },
            // CSS
            new PluginPageInfo
            {
                Name = $"{Name}.css",
                EmbeddedResourcePath = $"{GetType().Namespace}.Configuration.css.SkinManager.css"
            },
            // JS
            new PluginPageInfo
            {
                Name = $"{Name}.js",
                EmbeddedResourcePath = $"{GetType().Namespace}.Configuration.js.SkinManager.js"
            },
            new PluginPageInfo
            {
                Name = $"{Name}PreLoad.js",
                EmbeddedResourcePath = $"{GetType().Namespace}.Configuration.js.SkinManagerPreLoad.js"
            },
        };
    }
}
