async function clickMainButton() {
    const button = document.querySelector(".fold-controls-bttn.green");
    if (!button) {
      console.error("Main button not found!");
      return;
    }
    while (true) {
      button.click();
      await new Promise(resolve => setTimeout(resolve, 10));
    }
}
async function Run() {
    const threadCount = 42;

    for (let i = 0; i < threadCount; i++) {
      clickMainButton();
    }
}
  

Run().catch((error) => console.error("An error occurred during the Run:", error));
  