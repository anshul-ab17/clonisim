import express from "express";

const PORT =3003
const app = express();

app.get("/",(req, res) => {
	res.send("Api is running.");
});


app.listen(PORT,()=>{
	console.log(`Api on http://localhost:{PORT}`);
});
