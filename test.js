var validate = require("./validate.js")

console.log(validate.transaction(
    {"type":"escrow",
    "from":["gines","jinny","lotus"],
    "to":["gines","jinny","lotus"],
    "amount":[100,1,300,1001],
    "chainHash":[{"from": "vojta", "hash": "x"}, {"from": "gines", "hash": "x"}, {"from": "pablo", "hash": "y"}],
    "timestamp":13453453049}
))