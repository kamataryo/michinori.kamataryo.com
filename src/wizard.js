/**
 *
 * @param {'trail' | 'drawing' | 'download' | 'copy' |'copied'} wizardId
 * @param {boolean} open
 * @param {number} delay
 */
export const toggleWizard = (wizardId, open, delay = 0) => {
  const wizard = document.getElementById(`wizard-${wizardId}`);
  if (wizard) {
    setTimeout(() => (wizard.style.display = open ? "block" : "none"), delay);
  }
};
