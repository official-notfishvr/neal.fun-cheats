async function clickMainButton() {
    const button = document.querySelector("button.main-btn");
    if (!button) {
      console.error("Main button not found!");
      return;
    }
    while (true) {
      button.click();
      await new Promise(resolve => setTimeout(resolve, 10));
    }
}
async function buyUpgrades() {
    while (true) {
      const upgrades = document.querySelectorAll(".main-upgrades .upgrade");
      upgrades.forEach(upgrade => upgrade.click());
      await new Promise(resolve => setTimeout(resolve, 100));
    }
}
async function Run() {
    const threadCount = 10;

    for (let i = 0; i < threadCount; i++) {
      clickMainButton();
    }
    
    buyUpgrades();
}
  

Run().catch((error) => console.error("An error occurred during the Run:", error));
  