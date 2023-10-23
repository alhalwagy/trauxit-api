const buttons = document.querySelectorAll(".swip__body")
const cards = document.querySelectorAll(".center")
const descriptions = document.querySelectorAll(".description")
function filter(category, items) {
    items.forEach(item => {
        const isItemFiltered = !item.classList.contains(category);
        if (isItemFiltered) {
            item.classList.add("hide");

        } else {
            item.classList.remove("hide");
        }
        item.classList.remove("d");
    });
}

buttons.forEach((button) => {
    button.addEventListener("click", () => {
        const currentCategory = button.dataset.filter;
        console.log(currentCategory);
        filter(currentCategory, cards)
    })
})
buttons.forEach((button) => {
    button.addEventListener("click", () => {
        const currentCategory = button.dataset.filter;
        console.log(currentCategory);
        filter(currentCategory, descriptions)
    })
})