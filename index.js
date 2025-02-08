const inputElement = document.getElementById("input");
const resetButton = document.getElementById("reset");
const outputContainer = document.getElementById("outputContainer");
const separatorInput = document.getElementById("separator");
const styleInput = document.getElementById("input-style");
const inputsOnlyCheckBox = document.getElementById("inputs-only");
const separatorOptions = [" ", ";"];
const styleOptions = ["arcade", "ps", "xbox", "keyboard"];

let separator = separatorOptions[separatorInput.selectedIndex];
let style = styleOptions[styleInput.selectedIndex];
let inputsOnly = inputsOnlyCheckBox.checked;

const filters = ["HBS", "HD", ""];

const icons = {
  "T!": "tornado-mini.png",
};

const additionalMoves = {
  iws: "Instant while standing",
  WS: "While standing",
  ws: "While standing",
  FC: "Full crouch",
  fc: "Full crouch",
  hFC: "Half crouch",
  hfc: "Half crouch",
  SS: "Sidestep",
  ss: "Sidestep",
  SSL: "Sidestep left",
  ssl: "Sidestep left",
  SSR: "Sidestep right",
  ssr: "Sidestep right",
};

const info = {
  dash: "dash",
  microdash: "micro dash",
  deepdash: "deep dash",
  H: "During Heat",
  R: "Rage",
  P: "Successfully parry",
  J: "Jumping",
  BT: "Back turned",
  FUFT: "Face up, feet towards",
  FUFA: "Face up, feet away",
  FDFT: "Face down, feet towards",
  FDFA: "Face down, feet away",
  CD: "Crouch dash",
  OTG: 'Grounded opponent ("on the ground")',
  i: 'Active framed ("impact frames")',
  r: "Recovery",
  a: 'Opponent floats during recovery and recovers grounded ("airborne")',
  back: "Opponent recovers back turned",
  c: "Opponent recovers crouching",
  down: 'Opponent is grounded during recovery and recovers grounded ("downed")',
  g: "Opponent can guard during recovery",
  s: 'Opponent floats during recovery and recovers standing ("stagger")',
  h: "High",
  m: "Mid",
  l: "Low",
  s: "Special mid",
  a: "Aerial",
  H: "High (hits grounded)",
  M: "Mid (hits grounded)",
  L: "Low (hits grounded)",
  S: "Special mid (hits grounded)",
  t: "Throw",
  pc: "Powercrush",
  ps: "Parry state",
  js: "Jumping state",
  cs: "Crouching state",
  fs: "Floating state, i.e. can be juggled",
  is: "Intangible state",
  gs: "Grounded state",
  "S!": "Screw",
  "W!": "Wall splat / Wall bounce",
  "WB!": "Wall break",
  "F!": "Floor break",
  "FB!": "Floor break",
  "BB!": "Balcony break",
  CH: "Counter hit",
  CL: "Clean hit",
  "()": "Whiffed or blocked moves",
  "(x?)": "Repeat a string x times",
  "[]": "Damage or frame advantage of the following",
  "!": "Unblockable (modifier)",
};

const specialMoves = {
  HB: "2+3",
};

const specialStances = ["HBS"];

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
  qcf: "↓↘→",
  qcb: "↓↙←",
  hcf: "←↙↓↘→",
  hcb: "→↘↓↙←",
  dp: "→↓↓→",
  cc: "[↑★]",
  ss: "[↑★] (or [↓★])",
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
  setUrl("separator", event.target.value);
});

styleInput.addEventListener("change", (event) => {
  style = event.target.value;
  outputContainer.replaceChildren();
  convertInput(inputElement.value);
  setUrl("style", event.target.value);
});

inputElement.addEventListener("keyup", (event) => {
  outputContainer.replaceChildren();
  convertInput(event.target.value);
  setUrl("notation", event.target.value);
});

resetButton.addEventListener("click", () => {
  outputContainer.replaceChildren();
  inputElement.value = "";
});

inputsOnlyCheckBox.addEventListener("change", () => {
  inputsOnly = !inputsOnly;
  outputContainer.replaceChildren();
  convertInput(inputElement.value);
});

const inputOutput = {};

const setUrl = (key, value) => {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.set(key, value);
  const newUrl = `?style=${encodeURIComponent(
    getOrElse(urlParams, "style", "arcade"),
  )}&notation=${encodeURIComponent(
    getOrElse(urlParams, "notation", ""),
  )}&separator=${encodeURIComponent(getOrElse(urlParams, "separator", " "))}`;
  window.history.pushState({}, "", newUrl);
};

const getOrElse = (urlParams, name, defaultValue) =>
  urlParams.get(name) || defaultValue;

const convertInput = (rawNotations) => {
  if (inputsOnly) {
    filters.forEach((filter) => {
      rawNotations = rawNotations.replaceAll(filter, "");
    });
  }
  const notationRegex = /([a-z])+|([1-4\+\,\-\/])+|([a-zA-Z0-9\~\+\!\,\-\/])+/g;
  const directionRegex = /[udfb]/g;
  const holdDirectionRegex = /[UDFB]/g;
  const limbRegex = /[1-4]/g;
  const notations = rawNotations.split(separator);

  notations.forEach((notation) => {
    if (specialMoves[notation]) {
      const specialMoveOutput = addLimbInputs(specialMoves[notation]);
      outputContainer.appendChild(specialMoveOutput);
      addArrow();
      inputOutput[notation] = specialMoveOutput;
      console.log("inputOutput", inputOutput);

      return;
    }

    if (icons[notation]) {
      if (inputsOnly) {
        // Ignore it
        return;
      } else {
        outputContainer.appendChild(addIcon(icons[notation]));
      }
      addArrow();
      return;
    }

    specialStances.forEach((specialStance) => {
      console.log("stance", specialStance);
      if (notation.includes(specialStance)) {
        if (inputsOnly) {
          console.log("specialStances inputs only", notation);
          // Ignore it
          return;
        } else {
          const text = document.createElement("div");
          text.textContent = specialStance;
          outputContainer.appendChild(text);
          console.log("notation", notation);
        }
        notation = notation.replaceAll(specialStance, "");
      }
    });

    for (const additionalMove in additionalMoves) {
      if (notation.includes(additionalMove)) {
        if (inputsOnly && !notation.includes("FC")) {
          // Combos with FC require that info to work properly, do not ignore
          console.log("additionalMoves inputs only", notation);
        } else {
          const text = document.createElement("div");
          text.textContent = additionalMoves[additionalMove];
          outputContainer.appendChild(text);
        }
        notation = notation.replaceAll(additionalMove, "");
        console.log("notation", notation);
      }
    }

    if (notation.length > 0) {
      const inputs = notation.match(notationRegex);
      if (inputs) {
        inputs.forEach((input) => {
          console.log("input", input);

          // if (additionalMoves[input]) {
          //   const text = document.createElement("div");
          //   text.textContent = additionalMoves[input];
          //   outputContainer.appendChild(text);
          // } else if (input.search(directionRegex) !== -1) {
          if (input.search(directionRegex) !== -1) {
            addInput(input, directions, addDirection);
          } else if (input.search(holdDirectionRegex) !== -1) {
            addInput(input, holdDirections, addHoldDirection);
          } else if (input.search(limbRegex) !== -1) {
            const splitNotationsByComma = input
              .split(",")
              .filter((entry) => entry); // Remove empty values;
            splitNotationsByComma.forEach((splitInput) => {
              if (splitInput.indexOf("+") !== -1) {
                outputContainer.appendChild(addLimbInputs(splitInput));
              } else {
                for (
                  let charIndex = 0;
                  charIndex < splitInput.length;
                  charIndex++
                ) {
                  const inputChar = splitInput.charAt(charIndex);
                  if (inputChar.search(limbRegex) !== -1) {
                    // Notation like SIT1 ends up here, so check if the current char
                    // actually is a number
                    outputContainer.appendChild(addLimbInputs(inputChar));
                  }
                }
              }
            });
          } else {
            console.log("no match", input);
          }
        });
      }
      addArrow();
    }
  });
  // Remove the last arrow
  if (outputContainer.lastChild) {
    outputContainer.removeChild(outputContainer.lastChild);
  }
};
// let orInput =
// input.indexOf("-") !== -1 || input.indexOf("/") !== -1;

/*               if (orInput) {
                const orElement = document.createElement("div");
                orElement.className = "or-input";
                orElement.textContent = ")";
                outputContainer.appendChild(orElement);
              }
 */
/* 
if (limb.indexOf("-") !== -1 || limb.indexOf("/") !== -1) {
                  const orElement = document.createElement("div");
                  orElement.className = "or-input";
                  orElement.textContent = "( or";
                  outputContainer.appendChild(orElement);
                }
  */

// let bracketInput = notation.indexOf("~") !== -1;
// notation = notation.replaceAll("~", "");
// if (bracketInput) {
// const openBracket = document.createElement("div");
// openBracket.className = "bracket";
// openBracket.textContent = "[";
// outputContainer.appendChild(openBracket);
// }
// if (bracketInput) {
// const closeBracket = document.createElement("div");
// closeBracket.className = "bracket";
// closeBracket.textContent = "]";
// outputContainer.appendChild(closeBracket);
// }

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

const addIcon = (src) => {
  const icon = document.createElement("img");
  icon.src = src;
  icon.alt = "Tornado";
  return icon;
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

const addInput = (input, inputMapping, inputFunc) => {
  if (inputMapping[input]) {
    outputContainer.appendChild(inputFunc(input));
  } else {
    [...input].forEach((direction) => {
      outputContainer.appendChild(inputFunc(direction));
    });
  }
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
