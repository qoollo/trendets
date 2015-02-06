var d3 = typeof window === 'undefined' ? getMock() : require('./d3.min');    //  no d3 on server, folks

function getMock() {
    return {
        time: {
            scale: function () {
                return {
                    rangeRound: function () {
                        return {
                            domain: function () {
                                return function () {
                                    //  U still following me?
                                }
                            }
                        }
                    }
                }
            }
        },
        select: function () {
            return {
                node: function () {
                    return {
                        offsetWidth: null
                    }
                }
            }
        }
    }
}

module.exports = d3;