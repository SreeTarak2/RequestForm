const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
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
      const screenshotPath = path.join(__dirname, "screenshot.png");
      if (fs.existsSync(screenshotPath)) {
        const base64Image = fs.readFileSync(screenshotPath, {
          encoding: "base64",
        });
        res.json({
          message: "Outing request submitted!",
          screenshot: `data:image/png;base64,${base64Image}`,
        });
      } else {
        res.json({
          message: "Outing request submitted, but no screenshot found.",
        });
      }
    } else {
      res
        .status(500)
        .json({ message: "There was an error submitting your request." });
    }
  });
});

app.listen(port, () => {
  console.log(`Server started on port : ${port}`);
});
