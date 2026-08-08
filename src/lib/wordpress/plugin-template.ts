/**
 * Source du plugin WordPress, généré à la demande avec la clé du site déjà
 * inscrite dedans. Le client n'a donc rien à copier-coller : il téléverse et
 * active, c'est tout.
 *
 * Le plugin n'embarque pas w.js — il pointe vers le CDN. Les mises à jour du
 * widget arrivent ainsi chez tout le monde sans nouvelle version du plugin.
 */

export const PLUGIN_VERSION = "1.0.0";

export function buildPluginPhp(params: {
  siteKey: string;
  origin: string;
  siteName: string;
}): string {
  // Échappement pour insertion dans une chaîne PHP entre apostrophes.
  const esc = (value: string) => value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

  return `<?php
/**
 * Plugin Name: Wizecatch
 * Description: Collect customer reviews and privacy-friendly visitor analytics — no cookie banner required.
 * Version: ${PLUGIN_VERSION}
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * License: GPLv2 or later
 */

if (!defined('ABSPATH')) {
    exit; // Accès direct interdit.
}

define('WIZECATCH_VERSION', '${PLUGIN_VERSION}');
define('WIZECATCH_DEFAULT_KEY', '${esc(params.siteKey)}');
define('WIZECATCH_ORIGIN', '${esc(params.origin)}');
define('WIZECATCH_DASHBOARD', '${esc(params.origin)}/dashboard');

/* -------------------------------------------------------------------------
 * Réglages
 * ---------------------------------------------------------------------- */

function wizecatch_defaults() {
    return array(
        'site_key'  => WIZECATCH_DEFAULT_KEY,
        'enabled'   => 1,
        // Le formulaire d'avis peut être coupé sans arrêter la mesure
        // d'audience : certains sites ne veulent que les statistiques.
        'show_form' => 1,
    );
}

function wizecatch_options() {
    $saved = get_option('wizecatch_options', array());
    return wp_parse_args(is_array($saved) ? $saved : array(), wizecatch_defaults());
}

register_activation_hook(__FILE__, function () {
    if (get_option('wizecatch_options') === false) {
        add_option('wizecatch_options', wizecatch_defaults());
    }
});

/* -------------------------------------------------------------------------
 * Injection du script
 * ---------------------------------------------------------------------- */

add_action('wp_footer', function () {
    $options = wizecatch_options();

    if (empty($options['enabled']) || empty($options['site_key'])) {
        return;
    }

    printf(
        '<script src="%s/w.js" data-site="%s"%s async></script>' . "\\n",
        esc_url(WIZECATCH_ORIGIN),
        esc_attr($options['site_key']),
        empty($options['show_form']) ? ' data-form="off"' : ''
    );
}, 20);

/* -------------------------------------------------------------------------
 * Mur d'avis — volontairement opt-in
 *
 * Rien ne s'affiche tant que le shortcode n'est pas posé quelque part : un
 * site peut très bien collecter des avis sans jamais les afficher.
 * ---------------------------------------------------------------------- */

add_shortcode('wizecatch_wall', function ($atts) {
    $atts = shortcode_atts(array('layout' => ''), $atts, 'wizecatch_wall');

    $allowed = array('list', 'grid', 'carousel');
    $layout  = in_array($atts['layout'], $allowed, true) ? $atts['layout'] : '';

    return $layout !== ''
        ? '<div data-wizecatch-wall="' . esc_attr($layout) . '"></div>'
        : '<div data-wizecatch-wall></div>';
});

/* -------------------------------------------------------------------------
 * Page de réglages
 * ---------------------------------------------------------------------- */

add_action('admin_menu', function () {
    add_options_page(
        'Wizecatch',
        'Wizecatch',
        'manage_options',
        'wizecatch',
        'wizecatch_settings_page'
    );
});

add_action('admin_init', function () {
    register_setting('wizecatch', 'wizecatch_options', array(
        'sanitize_callback' => function ($input) {
            return array(
                'site_key'  => sanitize_text_field($input['site_key'] ?? ''),
                'enabled'   => empty($input['enabled']) ? 0 : 1,
                'show_form' => empty($input['show_form']) ? 0 : 1,
            );
        },
    ));
});

function wizecatch_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $options = wizecatch_options();
    ?>
    <div class="wrap">
        <h1>Wizecatch</h1>

        <?php if (empty($options['site_key'])) : ?>
            <div class="notice notice-warning">
                <p>Add your site key below to start collecting.</p>
            </div>
        <?php else : ?>
            <div class="notice notice-success">
                <p>Connected to <code><?php echo esc_html($options['site_key']); ?></code> —
                   <a href="<?php echo esc_url(WIZECATCH_DASHBOARD); ?>" target="_blank" rel="noopener">open your dashboard</a>.</p>
            </div>
        <?php endif; ?>

        <form method="post" action="options.php">
            <?php settings_fields('wizecatch'); ?>

            <table class="form-table" role="presentation">
                <tr>
                    <th scope="row"><label for="wizecatch_site_key">Site key</label></th>
                    <td>
                        <input type="text" id="wizecatch_site_key"
                               name="wizecatch_options[site_key]"
                               value="<?php echo esc_attr($options['site_key']); ?>"
                               class="regular-text" />
                        <p class="description">Already filled in for you. Only change it to point this site at a different Wizecatch site.</p>
                    </td>
                </tr>

                <tr>
                    <th scope="row">Collection</th>
                    <td>
                        <label>
                            <input type="checkbox" name="wizecatch_options[enabled]" value="1"
                                   <?php checked($options['enabled'], 1); ?> />
                            Enable Wizecatch on this site
                        </label>
                        <p class="description">Turn this off to stop everything without deactivating the plugin.</p>

                        <br />

                        <label>
                            <input type="checkbox" name="wizecatch_options[show_form]" value="1"
                                   <?php checked($options['show_form'], 1); ?> />
                            Show the review form to visitors
                        </label>
                        <p class="description">
                            Leave this off to collect visitor statistics only — nothing is shown to your visitors.
                        </p>
                    </td>
                </tr>

                <tr>
                    <th scope="row">Displaying your reviews</th>
                    <td>
                        <p>
                            Nothing is displayed automatically. To show your published reviews,
                            add this shortcode to any page or post:
                        </p>
                        <p><code>[wizecatch_wall]</code></p>
                        <p class="description">
                            Optional layout: <code>[wizecatch_wall layout="grid"]</code> —
                            accepts <code>list</code>, <code>grid</code> or <code>carousel</code>.
                            Without it, the layout set in your dashboard is used.
                        </p>
                    </td>
                </tr>
            </table>

            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

/* -------------------------------------------------------------------------
 * Lien de réglages depuis la liste des extensions
 * ---------------------------------------------------------------------- */

add_filter('plugin_action_links_' . plugin_basename(__FILE__), function ($links) {
    $settings = '<a href="' . esc_url(admin_url('options-general.php?page=wizecatch')) . '">Settings</a>';
    array_unshift($links, $settings);
    return $links;
});
`;
}

export function buildReadme(siteName: string): string {
  return `=== Wizecatch ===
Requires at least: 5.8
Requires PHP: 7.4
Stable tag: ${PLUGIN_VERSION}
License: GPLv2 or later

Collect customer reviews and privacy-friendly visitor analytics with no cookie banner.

== Installation ==

1. In WordPress, go to Plugins > Add New > Upload Plugin
2. Choose this ZIP file and click Install Now
3. Click Activate

That's it — your site key (${siteName}) is already configured.

== Displaying your reviews ==

Nothing is displayed automatically. Add the shortcode [wizecatch_wall]
to any page where you want your published reviews to appear.

Optional layout: [wizecatch_wall layout="grid"]
Accepts list, grid or carousel.

== Collecting statistics only ==

Go to Settings > Wizecatch and untick "Show the review form to visitors".
Visits keep being measured, and nothing is shown to your visitors.
`;
}
