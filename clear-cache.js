// Clear localStorage and force reload company data
console.log('=== CLEARING COMPANY DATA CACHE ===');

// Clear all SPS-related localStorage
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('sps')) {
        keysToRemove.push(key);
    }
}

keysToRemove.forEach(key => {
    console.log(`Removing localStorage key: ${key}`);
    localStorage.removeItem(key);
});

console.log('localStorage cleared. Reload the page to force refresh.');
console.log('====================================');