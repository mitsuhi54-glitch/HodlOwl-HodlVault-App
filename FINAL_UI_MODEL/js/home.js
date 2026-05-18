/**
 * ANIMATIONS MODULE
 * Placeholder for subtle scroll effects
 */
function initAnimations() {
  // Logic for staggered fade-ins
}

document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll('.counter');
  
  counters.forEach(counter => {
    const targetVal = counter.getAttribute('data-target');
    const finalTarget = +targetVal;
    const isFloat = targetVal.includes('.');
    
    // Config
    const duration = 1500; // ms
    const frameRate = 30; // ms per frame (~33fps)
    const characters = '0123456789';
    
    let startTime = null;
    let originalText = isFloat ? finalTarget.toFixed(2) : finalTarget.toString();
    
    // Format helper adding commas
    const addCommas = (str) => {
      let parts = str.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join('.');
    };
    
    // Number of characters ignoring commas
    const numLen = originalText.length;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressRatio = Math.min(progress / duration, 1);
      
      // We reveal the actual number from left to right based on progress
      // Characters not yet revealed will be randomized
      const numRevealed = Math.floor(progressRatio * numLen);
      
      let currentStr = '';
      for (let i = 0; i < numLen; i++) {
        // If it's a decimal dot, always keep it if it's supposed to be there
        if (originalText[i] === '.') {
          currentStr += '.';
          continue;
        }
        
        if (i < numRevealed) {
          currentStr += originalText[i];
        } else {
          // Add a random character
          currentStr += characters[Math.floor(Math.random() * characters.length)];
        }
      }
      
      counter.innerText = addCommas(currentStr);
      
      if (progress < duration) {
        // use setTimeout for framerate control instead of full requestAnimationFrame speed
        setTimeout(() => requestAnimationFrame(animate), frameRate);
      } else {
        counter.innerText = addCommas(originalText);
      }
    };
    
    requestAnimationFrame(animate);
  });
});
