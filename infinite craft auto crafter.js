let lastClearButtonClick = 0;
const DRAG_STEPS = 10;
const CLEAR_BUTTON_DELAY = 5500;
const THREAD_COUNT = 8;
const TARGET_COORDINATES = [
    { x: 300, y: 300 },
];

const OFFSET_VALUES = [
    { x: 50, y: 50 }, 
    { x: 100, y: 100 },
    { x: 150, y: 150 },
    { x: 200, y: 200 },
];

function simulateDragAndDrop(element, startX, startY, targetX, targetY, steps = DRAG_STEPS) {
    function triggerMouseEvent(target, eventType, clientX, clientY) {
        const event = new MouseEvent(eventType, {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY,
            view: window,
        });
        target.dispatchEvent(event);
    }

    console.log(`Dragging from (${startX}, ${startY}) to (${targetX}, ${targetY})`);

    triggerMouseEvent(element, "mousedown", startX, startY);

    const deltaX = (targetX - startX) / steps;
    const deltaY = (targetY - startY) / steps;
    let currentX = startX;
    let currentY = startY;

    return new Promise((resolve) => {
        function moveMouse() {
            currentX += deltaX;
            currentY += deltaY;

            triggerMouseEvent(document, "mousemove", currentX, currentY);

            if (Math.abs(currentX - targetX) < Math.abs(deltaX) && Math.abs(currentY - targetY) < Math.abs(deltaY)) {
                triggerMouseEvent(document, "mouseup", targetX, targetY);
                console.log("Drag-and-drop completed.");

                element.style.position = "absolute";
                element.style.left = `${targetX}px`;
                element.style.top = `${targetY}px`;

                resolve();
            } else {
                requestAnimationFrame(moveMouse);
            }
        }
        requestAnimationFrame(moveMouse);
    });
}

function saveProcessedPairs(processedPairs) {
    localStorage.setItem("processedPairs", JSON.stringify([...processedPairs]));
}

async function clickClearButtonNonBlocking() {
    const clearBtn = document.querySelector(".clear");
    if (clearBtn) {
        const now = Date.now();
        if (now - lastClearButtonClick < CLEAR_BUTTON_DELAY) {
            console.log("Clear button click throttled.");
            return;
        }

        console.log("Waiting before clicking the clear button...");
        lastClearButtonClick = now;
        setTimeout(() => {
            clearBtn.click();
            console.log("Clear button clicked.");
        }, CLEAR_BUTTON_DELAY);
    } else {
        console.warn("Clear button not found.");
    }
}

async function processCombination(firstItem, secondItem, target1X, target1Y, target2X, target2Y, offsetIndex) {
    const firstRect = firstItem.getBoundingClientRect();
    const secondRect = secondItem.getBoundingClientRect();

    const firstStartX = firstRect.x + firstRect.width / 2;
    const firstStartY = firstRect.y + firstRect.height / 2;
    const secondStartX = secondRect.x + secondRect.width / 2;
    const secondStartY = secondRect.y + secondRect.height / 2;

    const offset = OFFSET_VALUES[offsetIndex];

    await simulateDragAndDrop(firstItem, firstStartX, firstStartY, target1X + offset.x, target1Y + offset.y);
    await simulateDragAndDrop(secondItem, secondStartX, secondStartY, target2X + offset.x, target2Y + offset.y);
    await clickClearButtonNonBlocking();
}

async function processItems(itemsRow, processedPairs, threadIndex) {
    const items = [...itemsRow.getElementsByClassName("item")];
    console.log(`Found ${items.length} items in row.`);

    const target = TARGET_COORDINATES[threadIndex]; 

    let offsetIndex = 0;
    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            const pairKey = `${i}-${j}`;
            if (!processedPairs.has(pairKey)) {
                processedPairs.add(pairKey);
                saveProcessedPairs(processedPairs);

                console.log(`Processing combination: ${pairKey}`);

                await processCombination(
                    items[i], 
                    items[j], 
                    target.x, 
                    target.y, 
                    target.x, 
                    target.y,
                    offsetIndex
                );

                offsetIndex = (offsetIndex + 1) % OFFSET_VALUES.length;
            }
        }
    }
}

async function processThread(threadIndex, itemsRows, processedPairs) {
    const rowSubset = itemsRows.filter((_, index) => index % THREAD_COUNT === threadIndex);

    for (const row of rowSubset) {
        console.log(`Thread ${threadIndex}: Processing row:`, row);
        await processItems(row, processedPairs, threadIndex); 
    }
    console.log(`Thread ${threadIndex}: Processing completed.`);
}

async function Run() {
    const processedPairs = new Set(JSON.parse(localStorage.getItem("processedPairs") || "[]"));
    const itemsRows = [...document.querySelectorAll(".items-inner")];
    console.log(`Found ${itemsRows.length} item rows.`);

    const threadPromises = Array.from({ length: THREAD_COUNT }, (_, index) =>
        processThread(index, itemsRows, processedPairs)
    );

    await Promise.all(threadPromises);
    console.log("All threads completed.");
}

Run().catch((error) => console.error("An error occurred during the Run:", error));
