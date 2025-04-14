const { Builder, By, Key, until } = require("selenium-webdriver");
const edge = require("selenium-webdriver/edge");
const fs = require("fs");
const path = require("path");

const url = "https://sves.org.in/Ecap/StudentMaster.aspx";

// Hardcoded credentials (replace with process.argv if needed)
const id = process.argv[2];
const password = process.argv[3];
const outingType = process.argv[4]; // outing type
const returnTime = process.argv[5];


// Helper to get current time in required format
function getTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}

// Fill outing details
async function addOutingDetails(driver) {
  // outing type
  await driver.wait(until.elementLocated(By.id("ddloutingtype")), 10000);
  const outingTypeSelect = await driver.findElement(By.id("ddloutingtype"));
  await outingTypeSelect.sendKeys(outingType);

  // Outing Date input field
  const outingDateInput = await driver.findElement(By.id("txtfrom"));
  const outingTime = getTime();
  await outingDateInput.clear();
  await outingDateInput.sendKeys(outingTime);

  // Return Date input field
  const returnDateInput = await driver.findElement(By.id("txtto"));
  await returnDateInput.clear();
  await returnDateInput.sendKeys(returnTime);

  // Purpose of Outing
  const purposeField = await driver.findElement(By.id("txtpurpose"));
  await purposeField.sendKeys(outingType === "H" ? "Home" : "Local");

  console.log("✅ Outing details auto-filled:", outingTime);
}

// Navigate and submit outing request
async function loadRequestPage(driver) {
  await driver.wait(until.elementLocated(By.id("menu")), 10000);

  const menuItems = await driver.findElements(By.css("#menu li a.menuLink"));
  const filteredItems = (
    await Promise.all(
      menuItems.map(async (item) => {
        const text = await item.getText();
        return { text: text.trim(), item };
      })
    )
  ).filter(({ text }) => text === "HOSTEL OUTING REQUEST");

  if (filteredItems.length === 0) {
    console.log("❌ HOSTEL OUTING REQUEST link not found.");
    return;
  }

  const { item } = filteredItems[0];
  console.log("🔗 Clicking HOSTEL OUTING REQUEST...");
  await item.click();

  await driver.switchTo().frame(0);
  // Wait for and click the "New Request" button
  await driver.wait(
    until.elementLocated(By.xpath('//*[@id="divbutton"]/input')),
    10000
  );
  const newRequestButton = await driver.findElement(
    By.xpath('//*[@id="divbutton"]/input')
  );
  await driver.wait(until.elementIsEnabled(newRequestButton), 10000);
  await newRequestButton.click();
  console.log("🆕 'New Request' button clicked.");

  // Proceed to fill the details
  await addOutingDetails(driver);
}

// Start the automation
async function loadDriver() {
  let options = new edge.Options();
  options.addArguments("--headless");
  options.addArguments("--disable-gpu");
  options.addArguments("--window-size=1920,1080");

  const driver = await new Builder()
    .forBrowser("MicrosoftEdge")
    .setEdgeOptions(options)
    .build();

  try {
    await driver.get(url);

    await driver.findElement(By.id("txtId2")).sendKeys(id);
    await driver.findElement(By.id("txtPwd2")).sendKeys(password, Key.RETURN);
    // await driver.wait(until.urlContains("StudentMaster.aspx"), 10000);

    await loadRequestPage(driver);

    const image = await driver.takeScreenshot();
    const screenshotPath = path.join(__dirname, "screenshot.png");
    fs.writeFileSync(screenshotPath, image, "base64");

    console.log("Screenshot taken and saved.");

  } catch (err) {
    console.error("❌ Login or automation failed:", err.message);
    process.exit(1);
  } finally {
    // await driver.quit();
  }
}

loadDriver();
