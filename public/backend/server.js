const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;
app.use(cors({
  origin: "https://sreetarak2.github.io"
}));
app.use(express.json());
app.use(express.static("public"));

app.post("/submit", (req, res) => {
  const { rollno, password, outingType, returnTime } = req.body;
  const selenium = spawn("node", [
    "test.js",
    rollno,
    password,
    outingType,
    returnTime,
  ]);

  let stdoutData = "";
  let stderrData = "";

  selenium.stdout.on("data", (data) => {
    stdoutData += data.toString();
    console.log(`Selenium: ${data}`);
  });

  selenium.stderr.on("data", (data) => {
    stderrData += data.toString();
    console.error(`Error: ${data}`);
  });

  selenium.on("close", (code) => {
    if (code === 0) {
      res.status(200).json({ message: "Outing request submitted!" });
    } else {
      res.status(500).json({
        message: "There was an error submitting your request.",
        error: stderrData || "Unknown error occurred during automation.",
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on port : ${port}`);
});
