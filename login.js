const pinBoxes =
    document.querySelectorAll(
        ".pin-box"
    );

pinBoxes.forEach(
    (
        box,
        index
    ) => {

        box.addEventListener(
            "input",
            () => {

                if(
                    box.value &&
                    index < 3
                ){

                    pinBoxes[
                        index + 1
                    ].focus();
                }
            }
        );
    }
);

function verifyPin(){

    const pin =
        [...document.querySelectorAll(
            ".pin-box"
        )]
        .map(
            box => box.value
        )
        .join("");

    if(
        pin === "1234"
    ){

        sessionStorage.setItem(
            "loggedIn",
            "true"
        );

        window.location.href =
            "index.html";
    }
}

const texts = [
    "Track Expenses.",
    "Manage Budget.",
    "Save Money.",
    "Achieve Goals."
];

let index = 0;

setInterval(() => {

    index =
        (index + 1) %
        texts.length;

    document.getElementById(
        "changingText"
    ).textContent =
        texts[index];

}, 1300);