const inputElement = document.getElementById("input");
const resetButton = document.getElementById("reset");
const outputContainer = document.getElementById("outputContainer");
const separatorInput = document.getElementById("separator");
const styleInput = document.getElementById("input-style");
const separatorOptions = [" ", ";"];
const styleOptions = ["arcade", "ps", "xbox", "keyboard"];

let separator = separatorOptions[separatorInput.selectedIndex];
let style = styleOptions[styleInput.selectedIndex];

separatorInput.addEventListener("change", (event) => {
  separator = event.target.value;
  outputContainer.replaceChildren();
  convertInput(inputElement.value);
});

styleInput.addEventListener("change", (event) => {
  style = event.target.value;
  outputContainer.replaceChildren();
  convertInput(inputElement.value);
});

const filters = ["HBS", "T!", "HD", ""];

const directions = {
  n: "★",
  ub: "↖",
  u: "↑",
  uf: "↗",
  f: "→",
  df: "↘",
  d: "↓",
  db: "↙",
  b: "←",
  dash: "→→",
  qcf: "↓↘→",
  qcb: "↓↙←",
  hcf: "←↙↓↘→",
  hcb: "→↘↓↙←",
  dp: "→↓↓→",
};

const holdDirections = {
  UB: "⬁",
  U: "⇧",
  UF: "⬀",
  F: "⇨",
  DF: "⬂",
  D: "⇩",
  DB: "⬃",
  B: "⇦",
};

const limbs = {
  arcade: ["1", "2", "3", "4"],
  ps: ["□", "△", "X", "◯"],
  xbox: ["X", "Y", "A", "B"],
  keyboard: ["U", "I", "J", "K"],
};

separatorInput.addEventListener("change", (event) => {
  separator = event.target.value;
  outputContainer.replaceChildren();
  convertInput(inputElement.value);
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("separator", event.target.value);
  const newUrl = `?style=${encodeURIComponent(
    urlParams.get("style")
  )}&notation=${encodeURIComponent(
    urlParams.get("notation")
  )}&separator=${encodeURIComponent(urlParams.get("separator"))}`;
  window.history.pushState({}, "", newUrl);
});

styleInput.addEventListener("change", (event) => {
  style = event.target.value;
  outputContainer.replaceChildren();
  convertInput(inputElement.value);
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("style", event.target.value);
  const newUrl = `?style=${encodeURIComponent(
    urlParams.get("style")
  )}&notation=${encodeURIComponent(
    urlParams.get("notation")
  )}&separator=${encodeURIComponent(urlParams.get("separator"))}`;
  window.history.pushState({}, "", newUrl);
});

inputElement.addEventListener("keyup", (event) => {
  outputContainer.replaceChildren();
  convertInput(event.target.value);
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set("notation", event.target.value);
  const newUrl = `?style=${encodeURIComponent(
    urlParams.get("style")
  )}&notation=${encodeURIComponent(
    urlParams.get("notation")
  )}&separator=${encodeURIComponent(urlParams.get("separator"))}`;
  window.history.pushState({}, "", newUrl);
});

resetButton.addEventListener("click", (event) => {
  outputContainer.replaceChildren();
  inputElement.value = "";
});

const convertInput = (rawNotations) => {
  filters.forEach((filter) => {
    rawNotations = rawNotations.replaceAll(filter, "");
  });
  const splitNotationRegex = /([a-z])+|([1-4\+\,\~\-\/])+|([A-Z])*/g;
  // const notationRegex = /([a-zA-Z\~1-4\+\,\~\-\/])+/g;
  const directionRegex = /[a-z]/g;
  const holdDirectionRegex = /[A-Z]/g;
  const limbRegex = /[1-4]/g;
  const notations = rawNotations.split(separator);
  notations.forEach((notation) => {
    console.log("notation", notation);
    if (notation.length > 0) {
      const inputs = notation.match(splitNotationRegex);
      if (inputs) {
        let bracketInput = notation.indexOf("~") !== -1;
        if (bracketInput) {
          const openBracket = document.createElement("div");
          openBracket.className = "bracket";
          openBracket.textContent = "[";
          outputContainer.appendChild(openBracket);
        }
        inputs.forEach((input) => {
          console.log("input", input);
          if (input.indexOf("~") !== -1) {
            console.log("Ignore symbol");
          } else if (input.search(directionRegex) !== -1) {
            if (directions[input]) {
              outputContainer.appendChild(addDirection(input));
            } else {
              [...input].forEach((direction) => {
                outputContainer.appendChild(addDirection(direction));
              });
            }
          } else if (input.search(holdDirectionRegex) !== -1) {
            if (holdDirections[input]) {
              outputContainer.appendChild(addHoldDirection(input));
            } else {
              [...input].forEach((holdDirection) => {
                outputContainer.appendChild(addHoldDirection(holdDirection));
              });
            }
          } else if (input.search(limbRegex) !== -1) {
            if (input.indexOf("+") !== -1) {
              outputContainer.appendChild(addLimbInputs(input));
            } else {
              let orInput =
                input.indexOf("-") !== -1 || input.indexOf("/") !== -1;
              input = input.replaceAll(",", "");
              input = input.replaceAll("~", "");

              [...input].forEach((limb) => {
                if (limb.indexOf("-") !== -1 || limb.indexOf("/") !== -1) {
                  const orElement = document.createElement("div");
                  orElement.className = "or-input";
                  orElement.textContent = "( or";
                  outputContainer.appendChild(orElement);
                } else {
                  outputContainer.appendChild(addLimbInputs(limb));
                }
              });

              if (orInput) {
                const orElement = document.createElement("div");
                orElement.className = "or-input";
                orElement.textContent = ")";
                outputContainer.appendChild(orElement);
              }
            }
          } else {
            console.log("no match", input);
          }
        });
        if (bracketInput) {
          const closeBracket = document.createElement("div");
          closeBracket.className = "bracket";
          closeBracket.textContent = "]";
          outputContainer.appendChild(closeBracket);
        }
      }
      addArrow();
    }
  });
  // Remove the last arrow
  if (outputContainer.lastChild) {
    outputContainer.removeChild(outputContainer.lastChild);
  }
};

const addDirection = (notation) => {
  const direction = document.createElement("div");
  direction.className = "direction";
  direction.textContent = directions[notation];
  return direction;
};

const addHoldDirection = (notation) => {
  const holdDirection = document.createElement("div");
  holdDirection.className = "direction";
  holdDirection.textContent = holdDirections[notation];
  return holdDirection;
};

const addLimbInputs = (notation) => {
  const output = document.createElement("div");
  output.className = "output";
  output.style.rotate = "55deg";
  // Wonky order due to CSS rotation
  let order = ["two", "four", "one", "three"];
  if (["arcade", "keyboard"].includes(style)) {
    if (style === "arcade") {
      output.style.transform = "skewY(-10deg)";
    }
    output.style.rotate = "";
    order = ["one", "two", "three", "four"];
  }
  order.forEach((name) => {
    const outputButton = document.createElement("div");
    outputButton.className = "output-button";
    if (["ps", "xbox"].includes(style)) {
      outputButton.style.rotate = "-55deg";
      outputButton.style.borderRadius = "100%";
    } else if (style === "arcade") {
      outputButton.style.transform = "skewY(10deg)";
      outputButton.style.borderRadius = "100%";
    }
    if (notation.indexOf(convertNameToInput(name)) != -1) {
      outputButton.className += ` active ${style}-${name}`;
      if (style === "ps") {
        const inputShape = document.createElement("div");
        if (name === "two") {
          const innerTriangle = document.createElement("div");
          inputShape.appendChild(innerTriangle);
          outputButton.style.alignItems = "initial";
        } else if (name === "three") {
          outputButton.textContent = convertInputToSymbol(name);
        }
        outputButton.appendChild(inputShape);
      } else {
        outputButton.textContent = convertInputToSymbol(name);
      }
    }
    output.appendChild(outputButton);
  });
  return output;
};

const addArrow = () => {
  const arrowElement = document.createElement("div");
  arrowElement.className = "arrow";
  outputContainer.appendChild(arrowElement);
};

const convertNameToInput = (name) => {
  switch (name) {
    case "one":
      return 1;
    case "two":
      return 2;
    case "three":
      return 3;
    case "four":
      return 4;
    default:
      break;
  }
};

const convertInputToSymbol = (name) => {
  switch (name) {
    case "one":
      return limbs[style][0];
    case "two":
      return limbs[style][1];
    case "three":
      return limbs[style][2];
    case "four":
      return limbs[style][3];
    default:
      break;
  }
};

const checkForQuery = () => {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("style")) {
    const value = decodeURIComponent(urlParams.get("style"));
    styleInput.selectedIndex = 3;
    styleInput.value = value;
    style = value;
  }

  if (urlParams.get("separator")) {
    const value = decodeURIComponent(urlParams.get("separator"));
    convertInput(value);
    separatorInput.value = value;
    separator = value;
  }

  if (urlParams.get("notation")) {
    const value = decodeURIComponent(urlParams.get("notation"));
    convertInput(value);
    inputElement.value = value;
  }
};
checkForQuery();
