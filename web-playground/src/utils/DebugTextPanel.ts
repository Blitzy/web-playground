interface DebugTextPanelLine {
    id: string;
    el: HTMLDivElement;
    update: () => string;
}

export class DebugTextPanel {
    dom: HTMLDivElement;

    private _lines: DebugTextPanelLine[];
    
    constructor() {
        this.dom = document.createElement('div');
        document.body.append(this.dom);
        this.dom.id = 'gl-stats';
        this.dom.style.cssText = `
            position: fixed;
            left: 0;
            bottom: 0;
        `;

        this.update();
    }

    addLine(id: string, update: () => string): void {
        if (!this._lines) {
            this._lines = [];
        }

        const el = document.createElement('div');
        el.id = id;
        this.dom.append(el);

        this._lines.push({id, el, update });

        this.update();
    }

    removeLine(id: string): void {
        if (!this._lines) {
            console.error(`Debug Text Panel lines have not been initialized, cant remove line ${id}`);
            return;
        }

        this._lines = this._lines.filter((line) => {
            if (line.id !== id) {
                line.el.remove();
                return false;
            } else {
                return true;
            }
        });
    }

    update(): void {
        if (this._lines && this._lines.length > 0) {
            for (const line of this._lines) {
                const content = line.update();
                line.el.textContent = content;
            }
        }
    }
}