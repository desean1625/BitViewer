    BitViewer = function(container) {
    var self = this
    if (typeof container === "string") {
        container = document.querySelector(container);
    }
    this._container = container;
    container.innerText = "";
    this._controlsContiner = document.createElement("div");
    this._widthInput = document.createElement("input");
    this._dv2Button = document.createElement("button");
    this._dv2Button.innerText = "/2";
    this._dv2Button.onclick = function(e){
        if(self._widthInput.value > 1){
            self.setWidth((self._widthInput.value/2).toFixed(0))
        }
    }
    this._widthInput.onkeypress = function(e){
        console.log(e)
        if(e.keyCode === 13){
            self.setWidth(self._widthInput.value)
        }
    }
    this._controlsContiner.appendChild(this._widthInput);
    this._controlsContiner.appendChild(this._dv2Button);
        this._mu2Button = document.createElement("button");
    this._mu2Button.innerText = "*2";
    this._mu2Button.onclick = function(e){
        if(self._widthInput.value > 1){
            self.setWidth((self._widthInput.value*2).toFixed(0))
        }
    }
        this._controlsContiner.appendChild(this._mu2Button);
    this._controlsContiner.style = "height:10%;";
    this._bitContainer = document.createElement("div");
    this._bitContainer.style = "height:60%;";
    this._widthContainer = document.createElement("div");
    this._widthContainer.style = "height:30%;";
    container.appendChild(this._controlsContiner);
    container.appendChild(this._bitContainer);
    container.appendChild(this._widthContainer);
    this.bitPlot = new sigplot.Plot( this._bitContainer, {
        useDomMenu: true,noreadout: true,
        xlabel: null,
        ylabel: null,
        nopan: true,
        noxaxis: true,
        noyaxis: true
    });
    this.framePlot = new sigplot.Plot(this._widthContainer, {
        useDomMenu: true,
        xcnt: "disabled",
        rubberbox_action: null,noreadout: true,
        xlabel: null,
        ylabel: null,
        nopan: true,
        noxaxis: true,
        noyaxis: true
    });
    this._widthStart = 5;
    this._widthEnd = 1000;
    p = new sigplot_plugins.PeakSelector()
    p.addTo(this.framePlot)
    p.on("peakSelect", function(e) {
        self.setWidth(e.max.x + self._widthStart);
        
        console.log((self.randomSize + self.randomSize2 + self.pattern.length) + " " + (e.max.x + self._widthStart) + " frameSync:" + self.pattern.length)
    });
}
BitViewer.prototype.load = function(href) {

    //TODO: Loadhref and break bytes into bits
    var self = this;
    var randomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    var patternSize = randomInt(4, 7);
    var randomSize = randomInt(90, 300);
    var randomSize2 = randomInt(10, 49);
    var pattern = randomInt(0, Math.pow(2, 32)).toString(2).substr(0, patternSize);
    self.randomSize = randomSize;
    self.randomSize2 = randomSize2;
    self.pattern = pattern;
    var array = [];
    var interleave = "";
    while (interleave.length < randomSize) {
        interleave += randomInt(0, Math.pow(2, 32)).toString(2);
    }
    interleave = interleave.substr(0, randomSize);
    var interleave2 = "";
    while (interleave2.length < randomSize2) {
        interleave2 += randomInt(0, Math.pow(2, 32)).toString(2);
    }
    interleave2 = interleave2.substr(0, randomSize2);
    for (var z = 0; z < 9000; z++) {
        var random1 = "";
        while (random1.length < randomSize) {
            random1 += randomInt(0, Math.pow(2, 32)).toString(2);
        }
        random1 = random1.substr(0, randomSize);
        if (!(z % 5)) {
            random1 = interleave;
        }
        for (var i = random1.length - 1; i >= 0; i--) {
            array.push(parseInt(random1[i]));
        }
        for (var i = pattern.length - 1; i >= 0; i--) {
            array.push(parseInt(pattern[i]));
        }
        var random2 = "";
        while (random2.length < randomSize2) {
            random2 += randomInt(0, Math.pow(2, 32)).toString(2);
        }
        random2 = random2.substr(0, randomSize2);
        if (!(z % 3)) {
            random2 = interleave2;
        }
        for (var i = random2.length - 1; i >= 0; i--) {
            array.push(parseInt(random2[i]));
        }
    }
    this.bits = array;
    this.findWidths();
};
BitViewer.prototype.setWidth = function(width) {
    this.bitPlot.remove_layer(0);
    this.bitPlot.overlay_array(this.bits, {
        subsize: width
    });
    this._widthInput.value = ""+width;
    //this._widthInput.value = width;
};
BitViewer.prototype.findWidths = function() {
    patternSearch = [500, 500, 500, 500];
    temp = this.bits.slice(0, 7000)
    start = performance.now()
    var xpos = 0;
    for (var w = this._widthStart, l = this._widthEnd, xpos = 0; w < l; w++, xpos++) {
        if (!patternSearch[xpos]) {
            patternSearch[xpos] = 0;
        }
        var data = temp.slice();
        var newArray = [];
        while (data.length) {
            newArray.push(data.splice(0, w))
        }
        for (var i = 1; i < newArray.length - 1; i++) {
            for (var z = 0; z < w; z++) {
                if (newArray[i][z] == newArray[i - 1][z] && newArray[i][z] === newArray[i + 1][z] && newArray[i][z + 1] == newArray[i + 1][z + 1]) {
                    patternSearch[xpos] += 1;
                }
            }
        }
    }
    stop = performance.now();
    console.log(stop - start)
    this.framePlot.remove_layer(0);
    this.framePlot.overlay_array(patternSearch);
    this.framePlot.change_settings({
        xmin: this._widthStart+1,
        xmax: this._widthEnd - this._widthStart
    });
    this.patternSearch = patternSearch
}