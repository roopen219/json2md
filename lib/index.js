"use strict"

const converters = require("./converters")
    , indento = require("indento")
function json2md(data, prefix, _type) {
    prefix = prefix || ""
    if (typeof data === "string" || typeof data === "number") {
        return indento(data, 1, prefix)
    }

    let content = []

    // Handle arrays
    if (Array.isArray(data)) {
        for (let i = 0; i < data.length; ++i) {
            content.push(indento(json2md(data[i], "", _type), 1, prefix))
        }
        return content.join("\n")
    } else if (_type) {
    	let mdText = "";
        let func = converters[_type || type];
        if (typeof func === "function") {
            mdText += indento(func(_type ? data : data[type], json2md), 1, prefix) + "\n";
        } else {
            throw new Error("There is no such converter: " + type);
        }
        return mdText
    } else {
    	let mdText = "";
        Object.keys(data).forEach((type, index, array) => {
            let func = converters[_type || type];

            if (typeof func === "function") {
                mdText += indento(func(_type ? data : data[type], json2md), 1, prefix) + "\n";
            } else {
                throw new Error("There is no such converter: " + type);
            }
        });
        return mdText;
    }
}
json2md.async = (data, prefix, _type) => Promise.resolve().then(() => {
    prefix = prefix || ""
    if (typeof data === "string" || typeof data === "number") {
        return indento(data, 1, prefix)
    }

    let content = []

    if (Array.isArray(data)) {
        const promises = data.map((d, index) => Promise.resolve()
            .then(() => json2md.async(d, "", _type))
            .then((result) => indento(result, 1, prefix))
            .then((result) => {
                content[index] = result;
            })
        )
        return Promise.all(promises).then(() => content.join("\n"))
    } else {
        let type = Object.keys(data)[0]
          , func = converters[_type || type]

        if (typeof func === "function") {
            return Promise.resolve()
                .then(() => func(_type ? data : data[type], json2md))
                .then((result) => indento(result, 1, prefix) + "\n")
        }
        throw new Error("There is no such converter: " + type)
    }
})

json2md.converters = converters

module.exports = json2md
