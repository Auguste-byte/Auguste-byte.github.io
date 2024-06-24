function strToDom(str) {
    const div = document.createElement('div');
    div.innerHTML = str;
    return div.firstElementChild;
}


class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toSvgPath() {
        return `${this.x} ${this.y}`;
    }

    static fromAngle(angle) {
        return new Point(Math.cos(angle), Math.sin(angle));
    }
}

class PieChart extends HTMLElement {
    static get observedAttributes() {
        return ['data', 'labels'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const svg = strToDom(`<svg viewBox="-1 -1 2 2" style="width: 100%; height: 100%;"></svg>`);
        this.shadowRoot.appendChild(svg);
        this.svg = svg;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data' || name === 'labels') {
            this.updateData();
            this.draw();
        }
    }

    updateData() {
        const colors = ['#FAAA32', '#3EFAD7', '#FA6A25', '#0C94FA', '#FA1F19', '#0CFAE2', '#AB6D23'];
        this.data = (this.getAttribute('data') || '0').split(';').map(v => parseFloat(v));
        this.labels = (this.getAttribute('labels') || '').split(';');

        this.paths = this.data.map((_, k) => {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('fill', colors[k % colors.length]);
            this.svg.appendChild(path);
            return path;
        });

        this.texts = this.data.map((_, k) => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('data-index', k);
            text.setAttribute('fill', 'black');
            text.setAttribute('font-size', '0.1');
            text.setAttribute('text-anchor', 'middle');
            this.svg.appendChild(text);
            return text;
        });
    }

    draw() {
        const total = this.data.reduce((acc, v) => acc + v, 0);
        let angle = 0;
        let start = new Point(1, 0);

        for (let k = 0; k < this.data.length; k++) {
            const ratio = this.data[k] / total;
            const endAngle = angle + ratio * 2 * Math.PI;
            const end = Point.fromAngle(endAngle);
            const largeFlag = ratio > 0.5 ? '1' : '0';

            this.paths[k].setAttribute('d', `M 0 0 L ${start.toSvgPath()} A 1 1 0 ${largeFlag} 1 ${end.toSvgPath()} L 0 0`);

            const midAngle = angle + ratio * Math.PI;
            const midPoint = Point.fromAngle(midAngle);
            const value = this.data[k];

            this.texts[k].setAttribute('x', midPoint.x * 0.7);
            this.texts[k].setAttribute('y', midPoint.y * 0.7);
            this.texts[k].textContent = `${this.labels[k] || ''} ${value}%`;

            angle = endAngle;
            start = end;
        }
    }
}

customElements.define('pie-chart', PieChart);



class PieChart2 extends HTMLElement {
    static get observedAttributes() {
        return ['data', 'labels'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const svg = strToDom(`<svg viewBox="0 0 100 100" style="width: 100%; height: 100%;"></svg>`);
        this.shadowRoot.appendChild(svg);
        this.svg = svg;
    }

    connectedCallback() {
        this.updateData();
        this.draw();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data') {
            this.updateData();
            this.draw();
        }
    }

    updateData() {
        const colors = ['#FAAA32', '#3EFAD7', '#FA6A25', '#0C94FA', '#FA1F19', '#0CFAE2', '#AB6D23'];
        this.data = (this.getAttribute('data') || '0').split(';').map(v => parseFloat(v));
        
        this.rects = this.data.map((_, k) => {
            if (!this.svg.querySelector(`rect[data-index="${k}"]`)) {
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('fill', colors[k % colors.length]);
                rect.setAttribute('data-index', k);
                this.svg.appendChild(rect);
                return rect;
            }
            return this.svg.querySelector(`rect[data-index="${k}"]`);
        });

        this.texts = this.data.map((_, k) => {
            if (!this.svg.querySelector(`text[data-index="${k}"]`)) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('data-index', k);
                text.setAttribute('fill', 'black');
                text.setAttribute('font-size', '3');
                text.setAttribute('text-anchor', 'middle');
                this.svg.appendChild(text);
                return text;
            }
            return this.svg.querySelector(`text[data-index="${k}"]`);
        });
    }

    draw() {
        
        const maxData = Math.max(...this.data);
        const chartHeight = 90;
        const barWidth = 90 / this.data.length;

        for (let k = 0; k < this.data.length; k++) {
            const value = this.data[k];
            const rect = this.rects[k];
            const text = this.texts[k];
            const height = (value / maxData) * chartHeight;

            rect.setAttribute('x', k * barWidth + 5);
            rect.setAttribute('y', chartHeight - height);
            rect.setAttribute('width', barWidth - 10);  
            rect.setAttribute('height', height);

            text.setAttribute('x', k * barWidth + barWidth / 2);
            text.setAttribute('y', chartHeight - height + height / 2 + 1);
            text.textContent = value;

            const annotation = k === 0 ? 'xp Done' : k === 1 ? 'xp Received' : '';
            text.textContent = `${value} ${annotation}`;
        }
    }
}

customElements.define('pie-chart2', PieChart2);






