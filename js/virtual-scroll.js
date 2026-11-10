class VirtualScroll {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.itemHeight = options.itemHeight || 28;
        this.buffer = options.buffer || 15;
        this.items = [];
        
        this.container.style.position = 'relative';
        this.container.style.overflowY = 'auto';
        this.container.style.maxHeight = '320px';
        
        this.contentSpacer = document.createElement('div');
        this.contentSpacer.style.position = 'absolute';
        this.contentSpacer.style.top = '0';
        this.contentSpacer.style.left = '0';
        this.contentSpacer.style.right = '0';
        this.container.appendChild(this.contentSpacer);

        this.visibleContent = document.createElement('div');
        this.visibleContent.style.position = 'absolute';
        this.visibleContent.style.top = '0';
        this.visibleContent.style.left = '0';
        this.visibleContent.style.right = '0';
        this.container.appendChild(this.visibleContent);

        this.container.addEventListener('scroll', () => this.render());
    }

    setItems(items) {
        this.items = items;
        this.contentSpacer.style.height = `${this.items.length * this.itemHeight}px`;
        this.container.scrollTop = 0;
        this.render();
    }

    getVisibleRange() {
        const scrollTop = this.container.scrollTop;
        const viewportHeight = this.container.clientHeight;

        const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
        const endIndex = Math.min(
            this.items.length - 1,
            Math.floor((scrollTop + viewportHeight) / this.itemHeight) + this.buffer
        );

        return { start: startIndex, end: endIndex };
    }

    render() {
        if (this.items.length === 0) return;

        const scrollTop = this.container.scrollTop;
        const viewportHeight = this.container.clientHeight;

        let startIndex = Math.floor(scrollTop / this.itemHeight) - this.buffer;
        startIndex = Math.max(0, startIndex);

        let endIndex = Math.ceil((scrollTop + viewportHeight) / this.itemHeight) + this.buffer;
        endIndex = Math.min(this.items.length - 1, endIndex);

        this.visibleContent.style.transform = `translateY(${startIndex * this.itemHeight}px)`;

        let html = '';
        for (let i = startIndex; i <= endIndex; i++) {
            html += `
                <div class="word-row text-sm text-gpt-text flex items-center gap-3" style="height: ${this.itemHeight}px;">
                    <span class="text-gpt-muted font-medium w-8 text-right">${i + 1}.</span>
                    <span class="font-normal tracking-wide">${this.items[i]}</span>
                </div>
            `;
        }
        this.visibleContent.innerHTML = html;
    }
}

window.VirtualScroll = VirtualScroll;