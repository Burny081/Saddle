// Debug localStorage data
console.log('=== DEBUGGING COMPANY PHONE ISSUE ===');
console.log('1. Current localStorage data:');
const localData = localStorage.getItem('sps_company_settings');
if (localData) {
    console.log('   Raw localStorage:', localData);
    try {
        const parsed = JSON.parse(localData);
        console.log('   Parsed localStorage:', parsed);
        console.log('   Phone from localStorage:', parsed.phone);
    } catch (e) {
        console.error('   Error parsing localStorage:', e);
    }
} else {
    console.log('   No localStorage data found');
}

// Check if the React context is working
console.log('2. Check React DevTools for CompanyContext state');
console.log('3. Check Network tab for database requests');
console.log('=====================================');