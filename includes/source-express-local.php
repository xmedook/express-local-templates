<?php

use Elementor\TemplateLibrary\Source_Base;

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

class Express_Source_Custom_Local extends Source_Base
{

    public function get_id()
    {
        return 'express-local';
    }

    public function get_title()
    {
        return __('Express Local', 'elementor');
    }

    public function register_data()
    {
    }

    private function get_metadata_cache_path()
    {
        return EXPRESS_LOCAL_TEMPLATES_PATH . 'metadata-cache.json';
    }

    public function rebuild_metadata_cache()
    {
        $templates_dir = EXPRESS_LOCAL_TEMPLATES_PATH . 'templates/';
        $previews_dir = EXPRESS_LOCAL_TEMPLATES_PATH . 'previews/';
        $previews_url = EXPRESS_LOCAL_TEMPLATES_URL . 'previews/';

        if (!is_dir($templates_dir)) {
            return [];
        }

        // Attempt to fix permissions on production
        $this->fix_permissions($previews_dir);

        // Build a case-insensitive map of preview files
        $preview_files = [];
        if (is_dir($previews_dir)) {
            $p_files = scandir($previews_dir);
            foreach ($p_files as $f) {
                if ($f === '.' || $f === '..')
                    continue;
                $preview_files[strtolower($f)] = $f;
            }
        }

        $directory = new \RecursiveDirectoryIterator($templates_dir, \RecursiveDirectoryIterator::SKIP_DOTS);
        $iterator = new \RecursiveIteratorIterator($directory);
        $metadata = [];

        foreach ($iterator as $info) {
            if ($info->getExtension() !== 'json') {
                continue;
            }

            $file = $info->getPathname();
            $content = file_get_contents($file);
            $data = json_decode($content, true);
            if (!$data) {
                continue;
            }

            $filename = basename($file, '.json');

            // Determine category from relative path
            $relative_path = str_replace($templates_dir, '', $file);
            $path_parts = explode(DIRECTORY_SEPARATOR, $relative_path);
            $category = (count($path_parts) > 1) ? $path_parts[0] : 'Uncategorized';

            $thumbnail = '';
            $possible_extensions = ['jpg', 'jpeg', 'png', 'webp'];
            $lower_filename = strtolower($filename);

            foreach ($possible_extensions as $ext) {
                $target = $lower_filename . '.' . $ext;
                if (isset($preview_files[$target])) {
                    $thumbnail = $previews_url . $preview_files[$target];
                    break;
                }
            }

            $metadata[] = [
                'id' => $filename,
                'template_id' => $filename,
                'source' => $this->get_id(),
                'type' => isset($data['type']) ? $data['type'] : 'page',
                'title' => isset($data['title']) ? $data['title'] : $filename,
                'thumbnail' => $thumbnail,
                'category' => $category,
                'file_path' => $relative_path, // Store relative path for robust lookup
                'date' => filemtime($file),
            ];
        }

        file_put_contents($this->get_metadata_cache_path(), json_encode($metadata));
        return $metadata;
    }

    private function get_all_metadata()
    {
        $cache_path = $this->get_metadata_cache_path();
        if (file_exists($cache_path)) {
            $data = json_decode(file_get_contents($cache_path), true);
            // Schema validation: if file_path is missing, force rebuild
            if (!empty($data) && is_array($data[0]) && !isset($data[0]['file_path'])) {
                return $this->rebuild_metadata_cache();
            }
            return $data;
        }
        return $this->rebuild_metadata_cache();
    }

    public function get_items($args = [])
    {
        $all_templates = $this->get_all_metadata();

        // Filter by category
        if (!empty($args['category']) && $args['category'] !== 'all') {
            $category = $args['category'];
            $all_templates = array_filter($all_templates, function ($item) use ($category) {
                return $item['category'] === $category;
            });
        }

        // Filter by search
        if (!empty($args['search'])) {
            $search = strtolower($args['search']);
            $exact_match = isset($args['exact_match']) && $args['exact_match'] === 'true';

            if ($exact_match) {
                $all_templates = array_filter($all_templates, function ($item) use ($search) {
                    return strtolower($item['template_id']) === $search;
                });
            } else {
                // Prioritize exact ID match if it exists
                $exact_id_match = null;
                foreach ($all_templates as $key => $item) {
                    if (strtolower($item['template_id']) === $search) {
                        $exact_id_match = $item;
                        unset($all_templates[$key]);
                        break;
                    }
                }

                $all_templates = array_filter($all_templates, function ($item) use ($search) {
                    return strpos(strtolower($item['title']), $search) !== false ||
                        strpos(strtolower($item['template_id']), $search) !== false;
                });

                if ($exact_id_match) {
                    array_unshift($all_templates, $exact_id_match);
                }
            }
        }

        // Sort by date desc (if not exact match search)
        if (empty($args['search']) || (isset($args['exact_match']) && $args['exact_match'] !== 'true')) {
            usort($all_templates, function ($a, $b) {
                return $b['date'] - $a['date'];
            });
        }

        // Paginate
        $total = count($all_templates);
        $offset = isset($args['offset']) ? (int) $args['offset'] : 0;
        $limit = isset($args['limit']) ? (int) $args['limit'] : 80;

        $paged_templates = array_slice($all_templates, $offset, $limit);

        // Format for Elementor
        foreach ($paged_templates as &$item) {
            $item['human_date'] = date('Y-m-d', $item['date']);
            $item['human_modified_date'] = date('Y-m-d', $item['date']);
            $item['author'] = 'nexo | koode.mx';
            $item['status'] = 'publish';
            $item['hasPageSettings'] = false;
            $item['tags'] = [];
            $item['export_link'] = '';
            $item['url'] = '';
        }

        if (isset($args['paginated']) && $args['paginated']) {
            // Get unique categories for the sidebar
            $categories = array_unique(array_column($this->get_all_metadata(), 'category'));
            sort($categories);

            return [
                'templates' => $paged_templates,
                'total' => $total,
                'has_more' => ($offset + $limit) < $total,
                'categories' => $categories
            ];
        }

        return $paged_templates;
    }

    public function get_item($template_id)
    {
        $all_metadata = $this->get_all_metadata();
        foreach ($all_metadata as $item) {
            if ($item['template_id'] === $template_id) {
                $item['human_date'] = date('Y-m-d', $item['date']);
                $item['human_modified_date'] = date('Y-m-d', $item['date']);
                $item['author'] = 'nexo | koode.mx';
                $item['status'] = 'publish';
                $item['hasPageSettings'] = false;
                $item['tags'] = [];
                $item['export_link'] = '';
                $item['url'] = '';
                return $item;
            }
        }
        return false;
    }

    public function get_data(array $args)
    {
        $template_id = $args['template_id'];

        // Find in metadata to get the correct file path (handles case sensitivity and subdirectories)
        $all_metadata = $this->get_all_metadata();
        $target_file = '';
        foreach ($all_metadata as $item) {
            if ($item['template_id'] === $template_id) {
                $target_file = $item['file_path'];
                break;
            }
        }

        if (!$target_file) {
            $target_file = $template_id . '.json';
        }

        $file_path = EXPRESS_LOCAL_TEMPLATES_PATH . 'templates/' . $target_file;

        if (!file_exists($file_path)) {
            return new \WP_Error('not_found', 'Template not found at: ' . $file_path);
        }

        $data = json_decode(file_get_contents($file_path), true);

        if (!$data || !isset($data['content'])) {
            return new \WP_Error('invalid_data', 'Invalid template data.');
        }

        return [
            'content' => $data['content'],
        ];
    }

    public function delete_template($template_id)
    {
        return new \WP_Error('read_only', 'This source is read-only.');
    }

    public function save_item($template_data)
    {
        return new \WP_Error('read_only', 'This source is read-only.');
    }

    public function update_item($new_data)
    {
        return new \WP_Error('read_only', 'This source is read-only.');
    }

    public function export_template($template_id)
    {
        return new \WP_Error('not_supported', 'Export is not supported for this source.');
    }

    /**
     * Attempt to fix file permissions for a directory and its contents.
     * 
     * @param string $dir Path to the directory.
     */
    private function fix_permissions($dir)
    {
        if (!is_dir($dir)) {
            return;
        }

        // Set directory permissions to 755
        @chmod($dir, 0755);

        $files = scandir($dir);
        foreach ($files as $file) {
            if ($file === '.' || $file === '..') {
                continue;
            }

            $path = $dir . DIRECTORY_SEPARATOR . $file;

            if (is_dir($path)) {
                $this->fix_permissions($path);
            } else {
                // Set file permissions to 644
                @chmod($path, 0644);
            }
        }
    }
}
