
L.Editable.VertexMarker.include({
    options: {
        opacity: 0,
        draggable: true,
        className: 'leaflet-div-icon leaflet-vertex-icon',
    },

    isSame: function (vertex) {
        let isLatEqual = this.latlng.lat === vertex.latlng.lat;
        let isLngEqual = this.latlng.lng === vertex.latlng.lng;
        return isLatEqual && isLngEqual;
    },
    _getAfterVertices: function (number) {
        var vertices = []
        var currentIndex = this.getIndex();
        if (this.latlngs.length < number) number = this.latlngs.length
        var vertex = this.getNext()
        for (var i = 0; i < number; i++) {
            if (vertex.getIndex() === currentIndex) {
                continue;
            }
            vertices.push(vertex.getIndex())
            vertex = vertex.getNext()
        }
        return vertices;
    },
    _getBeforeVertices: function (number) {
        var vertices = []
        var currentIndex = this.getIndex();
        if (this.latlngs.length < number) number = this.latlngs.length
        var vertex = this.getPrevious()
        for (var i = 0; i < number; i++) {
            if (vertex.getIndex() === currentIndex) {
                continue;
            }
            vertices.push(vertex.getIndex())
            vertex = vertex.getPrevious()
        }
        return vertices;
    },
    // Return list of "number" vertices after and before the current vertex
    getVertices: function (number) {
        var after = this._getAfterVertices(number);
        var before = this._getBeforeVertices(number);
        var indexList = after.concat(before);
        indexList = indexList.filter((obj, index)=> {
            return indexList.indexOf(obj) === index;
        })
        var list = indexList.map((index) => {
            return this.latlngs[index]
        })
        list.push(this.latlng)
        return list;
   
    }
})

L.Editable.VertexIcon.include({
    options: {
        iconSize: new L.Point(10, 10)
    }
});
L.Editable.MiddleMarker.include({
    options: {
        opacity: 0.5,
        className: 'leaflet-div-icon leaflet-middle-icon',
        draggable: true,
    },
})
