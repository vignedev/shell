const Me = imports.misc.extensionUtils.getCurrentExtension();

const { Gio, Gdk } = imports.gi;

const DARK = ["dark", "adapta", "plata", "dracula"]

interface Settings extends GObject.Object {
    get_boolean(key: string): boolean;
    set_boolean(key: string, value: boolean): void;

    get_uint(key: string): number;
    set_uint(key: string, value: number): void;

    get_string(key: string): string;
    set_string(key: string, value: string): void;

    bind(key: string, object: GObject.Object, property: string, flags: any): void
}

function settings_new_id(schema_id: string): Settings | null {
    try {
        return new Gio.Settings({ schema_id });
    } catch (why) {
        if (schema_id !== "org.gnome.shell.extensions.user-theme") {
            global.log(`failed to get settings for ${schema_id}: ${why}`)
        }

        return null
    }
}

function settings_new_schema(schema: string): Settings {
    const GioSSS = Gio.SettingsSchemaSource;
    const schemaDir = Me.dir.get_child("schemas");

    let schemaSource = schemaDir.query_exists(null) ?
        GioSSS.new_from_directory(schemaDir.get_path(), GioSSS.get_default(), false) :
        GioSSS.get_default();

    const schemaObj = schemaSource.lookup(schema, true);

    if (!schemaObj) {
        throw new Error("Schema " + schema + " could not be found for extension "
            + Me.metadata.uuid + ". Please check your installation.")
    }

    return new Gio.Settings({ settings_schema: schemaObj });
}

const ACTIVE_HINT = "active-hint";
const COLUMN_SIZE = "column-size";
const GAP_INNER = "gap-inner";
const GAP_OUTER = "gap-outer";
const ROW_SIZE = "row-size";
const SHOW_TITLE = "show-title";
const SMART_GAPS = "smart-gaps";
const SNAP_TO_GRID = "snap-to-grid";
const TILE_BY_DEFAULT = "tile-by-default";
const HINT_COLOR_RGBA = "hint-color-rgba";
const HINT_BORDER_RADIUS = "hint-border-radius";
const STACK_BORDER_RADIUS_OFFSET = "stack-border-radius-offset";
const DEFAULT_RGBA_COLOR = "rgba(251, 184, 108, 1)"; //pop-orange
const LOG_LEVEL = "log-level";
const SHOW_SKIPTASKBAR = "show-skip-taskbar";

export class ExtensionSettings {
    ext: Settings = settings_new_schema(Me.metadata["settings-schema"]);
    int: Settings | null = settings_new_id("org.gnome.desktop.interface");
    mutter: Settings | null = settings_new_id("org.gnome.mutter");
    shell: Settings | null = settings_new_id("org.gnome.shell.extensions.user-theme");
    wm: Settings | null = settings_new_id("org.gnome.desktop.wm.preferences");

    // Getters

    active_hint(): boolean {
        return this.ext.get_boolean(ACTIVE_HINT);
    }

    column_size(): number {
        return this.ext.get_uint(COLUMN_SIZE);
    }

    dynamic_workspaces(): boolean {
        return this.mutter ? this.mutter.get_boolean("dynamic-workspaces") : false;
    }

    gap_inner(): number {
        return this.ext.get_uint(GAP_INNER);
    }

    gap_outer(): number {
        return this.ext.get_uint(GAP_OUTER);
    }

    hint_color_rgba() {
        let rgba = this.ext.get_string(HINT_COLOR_RGBA);
        let valid_color = new Gdk.RGBA().parse(rgba);

        if (!valid_color) {
            return DEFAULT_RGBA_COLOR;
        }

        return rgba;
    }

    hint_border_radius() {
        return this.ext.get_uint(HINT_BORDER_RADIUS);
    }

    stack_border_radius_offset() {
        return this.ext.get_uint(STACK_BORDER_RADIUS_OFFSET);
    }

    theme(): string {
        return this.shell
            ? this.shell.get_string("name")
            : this.int
                ? this.int.get_string("gtk-theme")
                : "Adwaita"
    }

    is_dark(): boolean {
        const theme = this.theme().toLowerCase()
        return DARK.some(dark => theme.includes(dark))
    }

    is_high_contrast(): boolean {
        return this.theme().toLowerCase() === "highcontrast"
    }

    row_size(): number {
        return this.ext.get_uint(ROW_SIZE);
    }

    show_title(): boolean {
        return this.ext.get_boolean(SHOW_TITLE);
    }

    smart_gaps(): boolean {
        return this.ext.get_boolean(SMART_GAPS);
    }

    snap_to_grid(): boolean {
        return this.ext.get_boolean(SNAP_TO_GRID);
    }

    tile_by_default(): boolean {
        return this.ext.get_boolean(TILE_BY_DEFAULT);
    }

    workspaces_only_on_primary(): boolean {
        return this.mutter
            ? this.mutter.get_boolean("workspaces-only-on-primary")
            : false;
    }

    log_level(): number {
        return this.ext.get_uint(LOG_LEVEL);
    }

    show_skiptaskbar(): boolean {
        return this.ext.get_boolean(SHOW_SKIPTASKBAR);
    }

    focus_mode(): string | null { 
        return this.wm?.get_string("focus-mode") || null
    }

    // Setters

    set_active_hint(set: boolean) {
        this.ext.set_boolean(ACTIVE_HINT, set);
    }

    set_column_size(size: number) {
        this.ext.set_uint(COLUMN_SIZE, size);
    }

    set_gap_inner(gap: number) {
        this.ext.set_uint(GAP_INNER, gap);
    }

    set_gap_outer(gap: number) {
        this.ext.set_uint(GAP_OUTER, gap);
    }

    set_hint_color_rgba(rgba: string) {
        let valid_color = new Gdk.RGBA().parse(rgba);

        if (valid_color) {
            this.ext.set_string(HINT_COLOR_RGBA, rgba);
        } else {
            this.ext.set_string(HINT_COLOR_RGBA, DEFAULT_RGBA_COLOR);
        }
    }

    set_hint_border_radius(radius: number) {
        this.ext.set_uint(HINT_BORDER_RADIUS, radius);
    }

    set_stack_border_radius_offset(offset: number) {
        this.ext.set_uint(STACK_BORDER_RADIUS_OFFSET, offset);
    }

    set_row_size(size: number) {
        this.ext.set_uint(ROW_SIZE, size);
    }

    set_show_title(set: boolean) {
        this.ext.set_boolean(SHOW_TITLE, set);
    }

    set_smart_gaps(set: boolean) {
        this.ext.set_boolean(SMART_GAPS, set);
    }

    set_snap_to_grid(set: boolean) {
        this.ext.set_boolean(SNAP_TO_GRID, set);
    }

    set_tile_by_default(set: boolean) {
        this.ext.set_boolean(TILE_BY_DEFAULT, set);
    }

    set_log_level(set: number) {
        this.ext.set_uint(LOG_LEVEL, set);
    }

    set_show_skiptaskbar(set: boolean) {
        this.ext.set_boolean(SHOW_SKIPTASKBAR, set);
    }

    set_focus_mode(set: string) {
        this.wm?.set_string("focus-mode", set);
    }
}
