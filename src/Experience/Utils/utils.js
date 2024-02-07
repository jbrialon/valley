export function findMaxConsecutive(revealedSteps) {
  // Sort the array to ensure numbers are in ascending order
  revealedSteps.sort((a, b) => a - b);

  let maxConsecutive = 1;
  let currentConsecutive = 1;

  for (let i = 0; i < revealedSteps.length - 1; i++) {
    // Check if the current element is consecutive to the next
    if (revealedSteps[i] + 1 === revealedSteps[i + 1]) {
      currentConsecutive++;
    } else {
      // If not consecutive, update maxConsecutive if needed and reset currentConsecutive
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      currentConsecutive = 1;
    }
  }

  // Check one last time in case the longest sequence is at the end of the array
  maxConsecutive = Math.max(maxConsecutive, currentConsecutive);

  return maxConsecutive;
}

export function findMissingSteps(revealedSteps) {
  // Sort the array to ensure we're working with the steps in order
  revealedSteps.sort((a, b) => a - b);

  // Array to hold all missing steps
  let missingSteps = [];

  // Loop through the array to find all gaps in the sequence
  for (let i = 0; i < revealedSteps.length - 1; i++) {
    // Calculate the gap between the current step and the next step
    let gap = revealedSteps[i + 1] - revealedSteps[i];

    // If there's a gap, add all missing steps in that gap to the missingSteps array
    for (let step = 1; step < gap; step++) {
      missingSteps.push(revealedSteps[i] + step);
    }
  }

  // Return the array of missing steps
  console.log(revealedSteps, missingSteps);
  return missingSteps;
}
