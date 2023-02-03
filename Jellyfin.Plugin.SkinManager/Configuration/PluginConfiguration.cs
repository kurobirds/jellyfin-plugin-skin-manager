using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.SkinManager.Configuration;

/// <summary>
/// Plugin configuration.
/// </summary>
public class PluginConfiguration : BasePluginConfiguration
{
    /// <summary>
    /// Initializes a new instance of the <see cref="PluginConfiguration"/> class.
    /// </summary>
    public PluginConfiguration()
    {
        // set default options here
        SelectedSkin = string.Empty;
        Options = System.Array.Empty<string>();
    }

    /// <summary>
    /// Gets or sets an enum option.
    /// </summary>
    public string SelectedSkin { get; set; }

#pragma warning disable CA1819
    /// <summary>
    /// Gets or sets an enum option.
    /// </summary>
    public string[] Options { get; set; }
#pragma warning restore CA1819
}