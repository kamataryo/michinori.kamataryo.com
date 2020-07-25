const wizardForTrail = document.getElementById("wizard-trail");
const wizardSwitch = document.getElementById("wizard-switch");
const wizardDownload = document.getElementById("wizard-download");
const wizardForCopy = document.getElementById("wizard-copy");
const wizardForCopied = document.getElementById("wizard-copied");

/**
 *
 * @param {'trail' | 'switch' | 'download' | 'copy' |'copied'} wizardId
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
    case "switch":
      wizard = wizardSwitch;
      break;
    case "download":
      wizard = wizardDownload;
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
