import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as ExtensionUtils from 'resource:///org/gnome/shell/misc/extensionUtils.js';

const DuolingoReminder = GObject.registerClass(
    class DuolingoReminder extends PanelMenu.Button {
        _init(settings) {
            super._init(0.0, 'Duolingo Reminder', false);
            this._settings = settings;
            this._timeoutId = null;
            this._lastCompletedDate = null;

            const basePath = GLib.path_get_dirname(import.meta.url.replace('file://', ''));
            this._greenIconPath = GLib.build_filenamev([basePath, 'icons', 'owl.svg']);
            this._redIconPath = GLib.build_filenamev([basePath, 'icons', 'owl_red.svg']);
            
            this._greenIconFile = Gio.File.new_for_path(this._greenIconPath);
            this._redIconFile = Gio.File.new_for_path(this._redIconPath);
            
            this._icon = new St.Icon({
                gicon: Gio.FileIcon.new(this._greenIconFile),
                style_class: 'system-status-icon',
                icon_size: 24
            });

            // Создаем контейнер для иконки и восклицательного знака
            this._iconContainer = new St.BoxLayout({
                style_class: 'icon-container',
                vertical: false
            });
            this.add_child(this._iconContainer);
            
            this._iconContainer.add_child(this._icon);

            this._exclamation = new St.Label({
                text: '!',
                style_class: 'exclamation-mark'
            });
            this._iconContainer.add_child(this._exclamation);
            this._exclamation.hide();
            this._blinkTimeoutId = null;

            const menuItem = new PopupMenu.PopupMenuItem('Отметить как выполнено');
            menuItem.connect('activate', () => {
                this._markAsCompleted();
            });

            this.menu.addMenuItem(menuItem);

            GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                this._updateVisibility();
                return GLib.SOURCE_REMOVE;
            });
            this._startTimer();
        }

        _startTimer() {
            if (this._timeoutId) {
                GLib.source_remove(this._timeoutId);
            }

            // Проверяем каждую минуту
            this._timeoutId = GLib.timeout_add_seconds(
                GLib.PRIORITY_DEFAULT,
                60,
                () => {
                    this._updateVisibility();
                    return GLib.SOURCE_CONTINUE;
                }
            );
        }

        _startBlinking() {
            if (this._blinkTimeoutId) {
                GLib.source_remove(this._blinkTimeoutId);
            }
            
            const blink = () => {
                if (this._exclamation.visible) {
                    if (this._exclamation.text === '!') {
                        this._exclamation.text = ' ';
                    } else {
                        this._exclamation.text = '!';
                    }
                }
                return GLib.SOURCE_CONTINUE;
            };
            
            this._blinkTimeoutId = GLib.timeout_add(
                GLib.PRIORITY_DEFAULT,
                500,
                blink
            );
        }

        _stopBlinking() {
            if (this._blinkTimeoutId) {
                GLib.source_remove(this._blinkTimeoutId);
                this._blinkTimeoutId = null;
            }
            this._exclamation.text = '!';
        }

        _updateVisibility() {
            const now = new Date();
            const hours = now.getHours();
            const lastCompleted = this._settings.get_string('last-completed');
            
            console.log(`[DuolingoReminder] Debug: Current time: ${now.toISOString()}`);
            console.log(`[DuolingoReminder] Debug: Last completed: ${lastCompleted}`);
            
            if (lastCompleted) {
                const lastDate = new Date(lastCompleted);
                console.log(`[DuolingoReminder] Debug: Last date: ${lastDate.toISOString()}`);
                console.log(`[DuolingoReminder] Debug: Same day? ${lastDate.toDateString() === now.toDateString()}`);
                
                if (lastDate.toDateString() === now.toDateString()) {
                    this.hide();
                    this._stopBlinking();
                    return;
                }
            }

            if (hours >= 12) {
                this.show();
                if (hours >= 20) {
                    this._icon.gicon = Gio.FileIcon.new(this._redIconFile);
                    this._exclamation.show();
                    this._startBlinking();
                } else {
                    this._icon.gicon = Gio.FileIcon.new(this._greenIconFile);
                    this._exclamation.hide();
                    this._stopBlinking();
                }
            } else {
                this.hide();
                this._stopBlinking();
            }
        }

        _markAsCompleted() {
            const now = new Date();
            this._settings.set_string('last-completed', now.toISOString());
            this.hide();
            this._exclamation.hide();
            this._stopBlinking();
        }

        hide() {
            this.container.hide();
        }

        show() {
            this.container.show();
        }

        destroy() {
            if (this._timeoutId) {
                GLib.source_remove(this._timeoutId);
                this._timeoutId = null;
            }
            this._stopBlinking();
            super.destroy();
        }
    }
);

export default class Extension {
    constructor() {
        this._indicator = null;
        this._settings = null;
    }

    enable() {
        console.log('[DuolingoReminder] enable');
        
        // Инициализация настроек
        this._settings = new Gio.Settings({
            schema_id: 'org.gnome.shell.extensions.duolingo-reminder'
        });

        this._indicator = new DuolingoReminder(this._settings);
        Main.panel.addToStatusArea('duolingo-reminder', this._indicator);
    }

    disable() {
        console.log('[DuolingoReminder] disable');
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        if (this._settings) {
            this._settings = null;
        }
    }
} 