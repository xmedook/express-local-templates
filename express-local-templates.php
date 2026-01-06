<?php
/**
 * Plugin Name: Express Local Templates (DEV)
 * Description: [DEVELOPMENT VERSION] Adds custom local JSON templates to the Elementor editor via a custom button and modal.
 * Version: 1.4.0-dev
 * Author: nexo | koode.mx
 */

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

define('EXPRESS_LOCAL_TEMPLATES_PATH', plugin_dir_path(__FILE__));
define('EXPRESS_LOCAL_TEMPLATES_URL', plugin_dir_url(__FILE__));

/**
 * Fix for Elementor's Image Manager crashing on local template IDs.
 */
add_filter('wp_get_attachment_image_src', function ($image, $attachment_id, $size, $icon) {
	if (!is_numeric($attachment_id) && !empty($attachment_id)) {
		return ['', 0, 0, false]; // Return a dummy array to prevent "offset on bool" warning in Elementor
	}
	return $image;
}, 5, 4);

add_filter('wp_get_attachment_metadata', function ($data, $attachment_id) {
	if (!is_numeric($attachment_id) && !empty($attachment_id)) {
		return ['sizes' => []]; // Return a dummy array to prevent "offset on bool" warning in Elementor
	}
	return $data;
}, 5, 2);

/**
 * Enqueue editor assets.
 */
function express_enqueue_editor_assets()
{
	wp_enqueue_style(
		'express-editor-style',
		EXPRESS_LOCAL_TEMPLATES_URL . 'assets/css/editor.css',
		array(),
		'1.4.0'
	);

	wp_enqueue_script(
		'express-editor-script',
		EXPRESS_LOCAL_TEMPLATES_URL . 'assets/js/editor.js',
		array('jquery'),
		'1.4.0',
		true
	);

	require_once EXPRESS_LOCAL_TEMPLATES_PATH . 'includes/source-express-local.php';
	$source = new Express_Source_Custom_Local();

	wp_localize_script(
		'express-editor-script',
		'ExpressData',
		array(
			'ajax_url' => admin_url('admin-ajax.php'),
			'nonce' => wp_create_nonce('express_local_templates'),
		)
	);
}
add_action('elementor/editor/before_enqueue_scripts', 'express_enqueue_editor_assets');

/**
 * Enqueue styles in the preview iframe.
 */
function express_enqueue_preview_assets()
{
	wp_enqueue_style(
		'express-editor-style',
		EXPRESS_LOCAL_TEMPLATES_URL . 'assets/css/editor.css',
		array(),
		'1.4.0'
	);
}
add_action('elementor/preview/enqueue_styles', 'express_enqueue_preview_assets');

/**
 * AJAX endpoint to get templates list (paginated).
 */
function express_get_templates()
{
	check_ajax_referer('express_local_templates', 'nonce');

	if (!current_user_can('edit_posts')) {
		wp_send_json_error('Unauthorized');
	}

	$offset = isset($_POST['offset']) ? (int) $_POST['offset'] : 0;
	$search = isset($_POST['search']) ? sanitize_text_field($_POST['search']) : '';
	$category = isset($_POST['category']) ? sanitize_text_field($_POST['category']) : 'all';
	$exact_match = isset($_POST['exact_match']) ? sanitize_text_field($_POST['exact_match']) : 'false';
	$rebuild = isset($_POST['rebuild']) && $_POST['rebuild'] === 'true';

	require_once EXPRESS_LOCAL_TEMPLATES_PATH . 'includes/source-express-local.php';
	$source = new Express_Source_Custom_Local();

	if ($rebuild) {
		$source->rebuild_metadata_cache();
	}

	$data = $source->get_items([
		'offset' => $offset,
		'limit' => 80,
		'search' => $search,
		'category' => $category,
		'exact_match' => $exact_match,
		'paginated' => true
	]);

	wp_send_json_success($data);
}
add_action('wp_ajax_express_get_templates', 'express_get_templates');

/**
 * AJAX endpoint to get template data.
 */
function express_get_template_data()
{
	check_ajax_referer('express_local_templates', 'nonce');

	if (!current_user_can('edit_posts')) {
		wp_send_json_error('Unauthorized');
	}

	$template_id = isset($_POST['template_id']) ? sanitize_text_field($_POST['template_id']) : '';

	if (empty($template_id)) {
		wp_send_json_error('Missing template ID');
	}

	require_once EXPRESS_LOCAL_TEMPLATES_PATH . 'includes/source-express-local.php';
	$source = new Express_Source_Custom_Local();
	$data = $source->get_data(array('template_id' => $template_id));

	if (is_wp_error($data)) {
		wp_send_json_error($data->get_error_message());
	}

	wp_send_json_success($data);
}
add_action('wp_ajax_express_get_template_data', 'express_get_template_data');
