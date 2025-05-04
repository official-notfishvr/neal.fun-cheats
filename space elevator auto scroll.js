async function Run() {
  const scrollWrapper = document.getElementById("scroll-wrapper");
  if (!scrollWrapper) {
    console.error("Scroll wrapper not found.");
    return;
  }

  let currentScroll = 0;
  const scrollStep = 5;
  const delay = 10;

  function scrollUp() {
    currentScroll -= scrollStep;
    scrollWrapper.scrollTop = currentScroll;

    if (currentScroll <= 0) {
      console.log("Reached the top!");
      return;
    }

    setTimeout(scrollUp, delay);
  }

  scrollUp();
}

Run().catch((error) =>
  console.error("An error occurred during the Run:", error)
);
