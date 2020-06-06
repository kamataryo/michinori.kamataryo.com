// copy to clipboard
document.getElementById("clip").addEventListener("click", () => {
  var url = document.getElementById("url");
  url.select();
  url.setSelectionRange(0, 99999);
  document.execCommand("copy");
  url.setSelectionRange(0, 0);
  toggleWizard("copy", false, 0);
  toggleWizard("copied", true, 0);
  toggleWizard("copied", false, 3000);
});

const wizardForTrail = document.getElementById("wizard-trail");
const wizardForCopy = document.getElementById("wizard-copy");
const wizardForCopied = document.getElementById("wizard-copied");
const distanceField = document.getElementById("distance");

/**
 *
 * @param {'trail' | 'copy' |'copied'} wizardId
 * @param {boolean} open
 * @param {number} delay
 */
export const toggleWizard = (wizardId, open, delay = 0) => {
  const nextDisplay = open ? "block" : "none";
  let wizard = null;
  switch (wizardId) {
    case "trail":
      wizard = wizardForTrail;
      break;
    case "copy":
      wizard = wizardForCopy;
      break;
    case "copied":
      wizard = wizardForCopied;
      break;
    default:
      break;
  }
  if (wizard) {
    setTimeout(() => (wizard.style.display = nextDisplay), delay);
  }
};

/**
 * @param {number} disatance
 */
export const setDistance = (distance) => {
  let label = "";
  if (distance < 1) {
    label = Math.round(distance * 1000) + " m";
  } else {
    label = Math.round(distance * 100) / 100 + " km";
  }
  distanceField.innerText = label;
};
