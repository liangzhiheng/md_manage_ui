const express = require("express");
const app = express();

const proxy = require("http-proxy-middleware").createProxyMiddleware;

app.use("/user", proxy({ target: `http://127.0.0.1:8000/user` }));


app.use(express.static("node_modules/layui/dist"))
app.use(express.static("src"))

app.listen(3000)