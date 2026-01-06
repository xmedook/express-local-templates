(function ($) {
    const ExpressEditor = {
        offset: 0,
        limit: 80,
        search: '',
        category: 'all',
        exactMatch: false,
        loading: false,
        hasMore: true,
        elementorVersion: null,

        init: function () {
            console.log('Express: Initializing...');
            if (!window.elementor) {
                console.log('Express: window.elementor not found');
                return;
            }

            // Detect Elementor version
            this.elementorVersion = elementor.config && elementor.config.version ? elementor.config.version : 'unknown';
            console.log('Express: Elementor version detected:', this.elementorVersion);
            console.log('Express: $e command system available:', typeof $e !== 'undefined' && typeof $e.run === 'function');

            elementor.on('preview:loaded', () => {
                console.log('Express: Preview loaded event fired');
                this.injectButton();
            });
            // Also try immediately
            this.injectButton();
        },

        injectButton: function () {
            console.log('Express: injectButton called');
            const self = this;

            const interval = setInterval(() => {
                try {
                    const $previewContents = elementor.$previewContents;
                    if (!$previewContents || $previewContents.length === 0) {
                        return;
                    }

                    const $addSection = $previewContents.find('.elementor-add-new-section');
                    if ($addSection.length === 0) {
                        return;
                    }

                    if ($addSection.find('.express-add-template-button').length > 0) {
                        return;
                    }

                    console.log('Express: Found add section area, attempting injection...');

                    // Create button
                    const $btn = $('<div class="elementor-add-section-area-button express-add-template-button" title="Express Local Templates" style="background-color: #6d28d9 !important; color: #fff !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 18px !important; cursor: pointer !important; margin-left: 5px !important; width: 40px !important; height: 40px !important; border-radius: 50% !important; box-shadow: 0 0 8px rgba(0, 0, 0, 0.3) !important; z-index: 99999 !important; position: relative !important;"><i class="eicon-folder"></i></div>');

                    $btn.on('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Express: Button clicked');
                        self.openModal();
                    });

                    const $addBtn = $addSection.find('.elementor-add-section-button');
                    if ($addBtn.length > 0) {
                        $addBtn.after($btn);
                    } else {
                        $addSection.append($btn);
                    }

                } catch (err) {
                    console.error('Express: Error in interval:', err.message);
                }
            }, 1000);
        },

        openModal: function () {
            console.log('Express: openModal called');
            const self = this;

            // Reset state
            self.offset = 0;
            self.search = '';
            self.category = 'all';
            self.exactMatch = false;
            self.hasMore = true;
            self.loading = false;

            // Remove existing modal if any
            $('#express-modal-overlay').remove();

            let html = `
                <div id="express-modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 999999;">
                    <div id="express-modal" style="background: #fff; width: 95%; max-width: 1400px; height: 90%; border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
                        <div id="express-modal-header" style="padding: 15px 25px; background: #fff; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #edf2f7;">
                            <div style="display: flex; align-items: center; gap: 20px; flex: 1;">
                                <h3 style="margin: 0; font-size: 20px; color: #1a202c; font-weight: 700;">Express Local Templates</h3>
                                <div style="position: relative; flex: 0 1 400px; display: flex; align-items: center; gap: 15px;">
                                    <div style="position: relative; flex: 1;">
                                        <input type="text" id="express-template-search" placeholder="Search templates..." style="width: 100%; padding: 10px 15px 10px 40px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;">
                                        <i class="eicon-search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #a0aec0;"></i>
                                    </div>
                                    <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #718096; cursor: pointer; white-space: nowrap;">
                                        <input type="checkbox" id="express-exact-match" style="cursor: pointer;"> Exact ID
                                    </label>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <button id="express-force-dirty" title="Force Publish Button" style="background: #ff4d4d; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s;">Force Dirty</button>
                                <button id="express-refresh-cache" title="Refresh Cache" style="background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; cursor: pointer; color: #4a5568; display: flex; align-items: center; transition: all 0.2s;"><i class="eicon-sync"></i></button>
                                <span id="express-modal-close" style="font-size: 28px; cursor: pointer; color: #a0aec0; line-height: 1; transition: color 0.2s;">&times;</span>
                            </div>
                        </div>
                        <div style="flex: 1; display: flex; overflow: hidden;">
                            <!-- Sidebar -->
                            <div id="express-modal-sidebar" style="width: 240px; background: #f8fafc; border-right: 1px solid #edf2f7; padding: 20px; overflow-y: auto;">
                                <h4 style="margin: 0 0 15px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #718096; font-weight: 700;">Categories</h4>
                                <ul id="express-category-list" style="list-style: none; padding: 0; margin: 0;">
                                    <li class="express-category-item active" data-category="all" style="padding: 10px 15px; border-radius: 6px; cursor: pointer; font-size: 14px; color: #4a5568; margin-bottom: 4px; transition: all 0.2s; font-weight: 500;">All Templates</li>
                                    <!-- Categories will be loaded here -->
                                </ul>
                            </div>
                            <!-- Main Content -->
                            <div id="express-modal-content" style="flex: 1; padding: 30px; overflow-y: auto; background: #fff;">
                                <div id="express-templates-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 25px;">
                                    <!-- Templates will be loaded here -->
                                </div>
                                <div id="express-load-more-container" style="text-align: center; padding: 40px 0; display: none;">
                                    <button id="express-load-more-btn" style="background: #6d28d9; color: #fff; border: none; padding: 12px 40px; border-radius: 8px; font-weight: 700; cursor: pointer; transition: transform 0.2s, background 0.2s; box-shadow: 0 4px 12px rgba(109, 40, 217, 0.3);">Load More</button>
                                </div>
                                <div id="express-no-results" style="text-align: center; padding: 80px 0; display: none; color: #a0aec0;">
                                    <i class="eicon-search" style="font-size: 64px; display: block; margin-bottom: 20px; opacity: 0.5;"></i>
                                    <p style="font-size: 18px; font-weight: 500;">No templates found matching your criteria.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <style>
                    .express-category-item:hover { background: #edf2f7; color: #2d3748; }
                    .express-category-item.active { background: #6d28d9; color: #fff !important; }
                    #express-modal-close:hover { color: #4a5568; }
                    #express-refresh-cache:hover { background: #edf2f7; color: #2d3748; border-color: #cbd5e0; }
                    #express-force-dirty:hover { background: #e03e3e; transform: scale(1.05); }
                    #express-load-more-btn:hover { background: #5b21b6; transform: translateY(-2px); }
                    #express-load-more-btn:active { transform: translateY(0); }
                    #express-template-search:focus { border-color: #6d28d9; box-shadow: 0 0 0 3px rgba(109, 40, 217, 0.1); }
                </style>
            `;

            $('body').append(html);

            // Event Listeners
            $('#express-modal-close, #express-modal-overlay').on('click', function (e) {
                if (e.target === this || e.target.id === 'express-modal-close') {
                    $('#express-modal-overlay').remove();
                }
            });

            $('#express-template-search').on('input', function () {
                self.search = $(this).val();
                self.resetAndLoad();
            });

            $('#express-exact-match').on('change', function () {
                self.exactMatch = $(this).is(':checked');
                self.resetAndLoad();
            });

            $(document).on('click', '.express-category-item', function () {
                $('.express-category-item').removeClass('active');
                $(this).addClass('active');
                self.category = $(this).data('category');
                self.resetAndLoad();
            });

            $('#express-load-more-btn').on('click', function () {
                self.loadTemplates();
            });

            $('#express-refresh-cache').on('click', function () {
                $(this).find('i').addClass('eicon-animation-spin');
                self.resetAndLoad(true);
            });

            $('#express-force-dirty').on('click', function () {
                self.triggerDirtyState(true);
            });

            // Initial load
            self.loadTemplates();
        },

        resetAndLoad: function (rebuild = false) {
            this.offset = 0;
            this.hasMore = true;
            $('#express-templates-grid').empty();
            this.loadTemplates(rebuild);
        },

        loadTemplates: function (rebuild = false) {
            const self = this;
            if (self.loading || !self.hasMore) return;

            self.loading = true;
            $('#express-load-more-btn').text('Loading...').prop('disabled', true);
            $('#express-no-results').hide();

            $.ajax({
                url: ExpressData.ajax_url,
                method: 'POST',
                data: {
                    action: 'express_get_templates',
                    nonce: ExpressData.nonce,
                    offset: self.offset,
                    search: self.search,
                    category: self.category,
                    exact_match: self.exactMatch ? 'true' : 'false',
                    rebuild: rebuild
                },
                success: function (response) {
                    self.loading = false;
                    $('#express-refresh-cache i').removeClass('eicon-animation-spin');

                    if (response.success) {
                        const data = response.data;
                        const templates = data.templates;
                        self.hasMore = data.has_more;
                        self.offset += templates.length;

                        // Update categories in sidebar if provided
                        if (data.categories && $('#express-category-list .express-category-item').length === 1) {
                            let catHtml = '';
                            data.categories.forEach(cat => {
                                catHtml += `<li class="express-category-item" data-category="${cat}" style="padding: 10px 15px; border-radius: 6px; cursor: pointer; font-size: 14px; color: #4a5568; margin-bottom: 4px; transition: all 0.2s; font-weight: 500;">${cat}</li>`;
                            });
                            $('#express-category-list').append(catHtml);
                        }

                        if (templates.length === 0 && self.offset === 0) {
                            $('#express-no-results').show();
                            $('#express-load-more-container').hide();
                        } else {
                            self.renderTemplates(templates);
                            if (self.hasMore) {
                                $('#express-load-more-container').show();
                                $('#express-load-more-btn').text('Load More').prop('disabled', false);
                            } else {
                                $('#express-load-more-container').hide();
                            }
                        }
                    } else {
                        console.error('Express: Error loading templates:', response.data);
                    }
                },
                error: function () {
                    self.loading = false;
                    $('#express-refresh-cache i').removeClass('eicon-animation-spin');
                    console.error('Express: AJAX Error loading templates');
                }
            });
        },

        renderTemplates: function (templates) {
            const self = this;
            let html = '';

            templates.forEach(template => {
                html += `
                    <div class="express-template-item" data-id="${template.template_id}" style="border: 1px solid #edf2f7; border-radius: 10px; overflow: hidden; background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.3s ease;">
                        <div class="express-template-preview" style="position: relative; height: 160px; background: #f7fafc; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden;">
                            ${template.thumbnail ? `<img src="${template.thumbnail}" style="width: 100%; height: 100%; object-fit: contain; transition: transform 0.5s ease;" />` : '<div style="color: #cbd5e0; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">No Preview</div>'}
                            <div class="express-template-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(109, 40, 217, 0.85); display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.3s ease; backdrop-filter: blur(2px);">
                                <button class="express-insert-btn" data-id="${template.template_id}" style="background: #fff; color: #6d28d9; border: none; padding: 10px 25px; border-radius: 6px; font-weight: 700; cursor: pointer; transform: translateY(15px); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">Insert</button>
                            </div>
                        </div>
                        <div class="express-template-footer" style="padding: 15px; display: flex; flex-direction: column; gap: 4px; border-top: 1px solid #edf2f7;">
                            <div class="express-template-title" style="font-weight: 700; color: #2d3748; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${template.title}">${template.title}</div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="font-size: 10px; color: #a0aec0; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">${template.category}</div>
                                <div style="font-size: 10px; color: #cbd5e0; font-weight: 600;">ID: ${template.template_id}</div>
                            </div>
                        </div>
                    </div>
                `;
            });

            const $grid = $('#express-templates-grid');
            $grid.append(html);

            // Re-attach events for new items
            $('.express-template-item').off('mouseenter mouseleave').on('mouseenter', function () {
                $(this).css({ 'transform': 'translateY(-5px)', 'box-shadow': '0 12px 20px rgba(0,0,0,0.08)', 'border-color': '#6d28d9' });
                $(this).find('.express-template-overlay').css('opacity', '1');
                $(this).find('.express-insert-btn').css('transform', 'translateY(0)');
                $(this).find('img').css('transform', 'scale(1.05)');
            }).on('mouseleave', function () {
                $(this).css({ 'transform': 'translateY(0)', 'box-shadow': '0 2px 4px rgba(0,0,0,0.02)', 'border-color': '#edf2f7' });
                $(this).find('.express-template-overlay').css('opacity', '0');
                $(this).find('.express-insert-btn').css('transform', 'translateY(15px)');
                $(this).find('img').css('transform', 'scale(1)');
            });

            $('.express-insert-btn').off('click').on('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const templateId = $(this).data('id');
                self.insertTemplate(templateId);
            });
        },

        insertTemplate: function (templateId) {
            console.log('Express: Inserting template:', templateId);
            const self = this;
            const $btn = $(`.express-insert-btn[data-id="${templateId}"]`);
            const originalText = $btn.text();
            $btn.text('Loading...').prop('disabled', true);

            $.ajax({
                url: ExpressData.ajax_url,
                method: 'POST',
                data: {
                    action: 'express_get_template_data',
                    template_id: templateId,
                    nonce: ExpressData.nonce
                },
                success: function (response) {
                    if (response.success) {
                        const data = response.data;
                        if (data && data.content) {
                            console.log('Express: Template data received, attempting insertion...');

                            // Try modern $e command system first (Elementor 3.0+)
                            if (typeof $e !== 'undefined' && typeof $e.run === 'function') {
                                console.log('Express: Using $e.run command system for insertion');
                                try {
                                    const currentDoc = elementor.documents.getCurrent();
                                    const container = currentDoc.container;

                                    // Ensure data.content is an array
                                    const contentArray = Array.isArray(data.content) ? data.content : [data.content];

                                    // Try Method 1: document/elements/create (most reliable for new elements)
                                    console.log('Express: Attempting $e.run with document/elements/create...');
                                    try {
                                        contentArray.forEach((element) => {
                                            $e.run('document/elements/create', {
                                                container: container,
                                                model: element,
                                                options: {
                                                    edit: false
                                                }
                                            });
                                        });
                                        console.log('Express: ✓ Template inserted successfully via $e.run (create)');
                                        $('#express-modal-overlay').remove();
                                        return;
                                    } catch (createError) {
                                        console.warn('Express: create method failed:', createError.message);

                                        // Try Method 2: document/elements/import
                                        console.log('Express: Attempting $e.run with document/elements/import...');
                                        $e.run('document/elements/import', {
                                            container: container,
                                            model: container.model,
                                            data: contentArray,
                                            options: {
                                                at: container.children.length,
                                                rebuild: true
                                            }
                                        });
                                        console.log('Express: ✓ Template inserted successfully via $e.run (import)');
                                        $('#express-modal-overlay').remove();
                                        return;
                                    }
                                } catch (e) {
                                    console.warn('Express: All $e.run methods failed, using fallback:', e.message);
                                }
                            }

                            // Fallback to legacy method
                            console.log('Express: Using legacy addChildModel method');
                            elementor.getPreviewView().addChildModel(data.content);

                            // Aggressive dirty state trigger for legacy method
                            setTimeout(() => {
                                self.triggerDirtyState(false, data.content);
                            }, 500);

                            $('#express-modal-overlay').remove();
                        }
                    } else {
                        alert('Error: ' + response.data);
                        $btn.text(originalText).prop('disabled', false);
                    }
                },
                error: function () {
                    alert('AJAX Error');
                    $btn.text(originalText).prop('disabled', false);
                }
            });
        },

        triggerDirtyState: function (manual = false, content = null) {
            const version = '1.3.1';
            console.log(`Express: Triggering dirty state (v${version}, manual: ${manual})...`);

            try {
                const currentDoc = elementor.documents && elementor.documents.getCurrent();
                console.log('Express: Current document:', currentDoc);
                console.log('Express: Document editor:', currentDoc ? currentDoc.editor : 'N/A');
                console.log('Express: Elementor saver:', elementor.saver);

                if (currentDoc) {
                    console.log('Express: Applying dirty state methods...');

                    // Method 1: Modern $e commands (Most reliable for Elementor 3.0+)
                    if (window.$e && typeof $e.run === 'function') {
                        // Try document/save/set-is-modified
                        try {
                            $e.run('document/save/set-is-modified', { status: true });
                            console.log('Express: ✓ $e.run set-is-modified executed');
                        } catch (e) {
                            console.warn('Express: $e.run set-is-modified failed:', e.message);
                        }

                        // Try document/save/mark-as-dirty
                        try {
                            $e.run('document/save/mark-as-dirty');
                            console.log('Express: ✓ $e.run mark-as-dirty executed');
                        } catch (e) {
                            console.warn('Express: $e.run mark-as-dirty failed:', e.message);
                        }

                        // Try editor/documents/set-editing-mode
                        try {
                            $e.run('editor/documents/set-editing-mode', { mode: 'edit' });
                            console.log('Express: ✓ $e.run set-editing-mode executed');
                        } catch (e) {
                            console.warn('Express: $e.run set-editing-mode failed:', e.message);
                        }
                    }

                    // Method 2: Document model set dirty (Fundamental Backbone way)
                    if (currentDoc.model) {
                        currentDoc.model.set('dirty', true);
                        currentDoc.model.trigger('change');
                        currentDoc.model.trigger('change:dirty');
                        currentDoc.model.trigger('status:change');
                        console.log('Express: ✓ Document model dirty triggers executed');
                    }

                    // Method 3: Document setDirty (if it exists as a function)
                    if (typeof currentDoc.setDirty === 'function') {
                        currentDoc.setDirty(true);
                        console.log('Express: ✓ currentDoc.setDirty() executed');
                    }

                    // Method 4: Document config dirty
                    if (currentDoc.config) {
                        currentDoc.config.isDirty = true;
                        console.log('Express: ✓ Document config.isDirty set');
                    }

                    // Method 5: Container modification (Elementor 3.0+)
                    if (currentDoc.container && currentDoc.container.model) {
                        currentDoc.container.model.set('editedChanged', true);
                        console.log('Express: ✓ Container model editedChanged set');
                    }
                }

                // Method 6: Saver footerSaver setDirty
                if (elementor.saver && elementor.saver.footerSaver) {
                    if (typeof elementor.saver.footerSaver.setDirty === 'function') {
                        elementor.saver.footerSaver.setDirty();
                        console.log('Express: ✓ footerSaver.setDirty() executed');
                    }
                }

                // Method 7: Channel triggers
                if (elementor.channels) {
                    if (elementor.channels.editor) {
                        elementor.channels.editor.trigger('status:change', true);
                        console.log('Express: ✓ Editor channel status:change triggered');
                    }
                    if (elementor.channels.data) {
                        elementor.channels.data.trigger('dirty');
                        elementor.channels.data.trigger('change');
                        console.log('Express: ✓ Data channel dirty triggered');
                    }
                }

                // Method 8: Direct DOM manipulation (Ensures button is clickable)
                const $publishBtn = jQuery('#elementor-panel-saver-button-publish, #elementor-panel-saver-button-save-options');
                $publishBtn.removeClass('elementor-disabled');
                $publishBtn.prop('disabled', false);
                console.log('Express: ✓ Publish button DOM manipulation applied');

                // Method 9: Modern saver update via $e
                if (window.$e && typeof $e.run === 'function') {
                    try {
                        $e.run('document/save/update');
                        console.log('Express: ✓ $e.run document/save/update executed');
                    } catch (e) {
                        // Fallback to legacy if $e fails
                        if (elementor.saver && typeof elementor.saver.update === 'function') {
                            elementor.saver.update();
                            console.log('Express: ✓ Saver update() executed (legacy)');
                        }
                    }
                } else if (elementor.saver && typeof elementor.saver.update === 'function') {
                    elementor.saver.update();
                    console.log('Express: ✓ Saver update() executed (legacy)');
                }

                // Method 10: Add history record (forces Elementor to recognize change)
                if (elementor.history && elementor.history.history) {
                    try {
                        const historyItem = {
                            type: 'add',
                            title: 'Express: Template Imported',
                            subTitle: 'Template inserted from Express Local Templates',
                            action: 'add',
                            items: []
                        };
                        elementor.history.history.addItem(historyItem);
                        console.log('Express: ✓ History item added');
                    } catch (e) {
                        console.warn('Express: History add failed:', e.message);
                    }
                }

                // Method 11: Trigger page settings change
                if (elementor.settings && elementor.settings.page && elementor.settings.page.model) {
                    try {
                        elementor.settings.page.model.trigger('change');
                        console.log('Express: ✓ Page settings change triggered');
                    } catch (e) {
                        console.warn('Express: Page settings trigger failed:', e.message);
                    }
                }

                console.log('Express: All dirty state methods completed');
                console.log('Express: Checking button state...');
                const $btn = jQuery('#elementor-panel-saver-button-publish, #elementor-panel-saver-button-save-options');
                console.log('Express: Button has elementor-disabled class:', $btn.hasClass('elementor-disabled'));
                console.log('Express: Button disabled attribute:', $btn.prop('disabled'));
                console.log('Express: Button element:', $btn[0]);

                if (manual) {
                    alert('Force Dirty triggers executed. Check the Publish button!\n\nButton disabled: ' + $btn.prop('disabled') + '\nHas disabled class: ' + $btn.hasClass('elementor-disabled'));
                }

            } catch (e) {
                console.error('Express: Error in triggerDirtyState:', e);
            }
        }
    };

    // Expose to global scope IMMEDIATELY
    window.ExpressEditor = ExpressEditor;

    $(window).on('load', function () {
        console.log('Express: Editor script loaded');
        window.ExpressEditor.init();
    });
})(jQuery);
