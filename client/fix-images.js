const fs = require('fs');
const path = require('path');

const files = [
  "src/app/dashboard/SidebarNav.tsx",
  "src/app/dashboard/ceylon-pharmacy/[id]/dispense/page.tsx",
  "src/app/dashboard/ceylon-pharmacy/[id]/page.tsx",
  "src/app/dashboard/ceylon-pharmacy/[id]/pos/page.tsx",
  "src/app/dashboard/select-course/page.tsx",
  "src/app/login/page.tsx",
  "src/app/payment/page.tsx",
  "src/app/register/page.tsx",
  "src/components/admin/AdminSidebarNav.tsx",
  "src/components/auth/PaymentDialog.tsx",
  "src/components/dashboard/MobileHeader.tsx",
  "src/components/dashboard/SidebarNav.tsx",
  "src/components/ui/preloader.tsx"
];

let changedCount = 0;
for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('<Image src="https://content-provider.pharmacollege.lk/app-icon/android-chrome-192x192.png"')) {
        content = content.replace(/<Image src="https:\/\/content-provider\.pharmacollege\.lk\/app-icon\/android-chrome-192x192\.png"/g, '<Image unoptimized src="https://content-provider.pharmacollege.lk/app-icon/android-chrome-192x192.png"');
        fs.writeFileSync(filePath, content, 'utf8');
        changedCount++;
    }
  }
}
console.log("Updated " + changedCount + " files.");
