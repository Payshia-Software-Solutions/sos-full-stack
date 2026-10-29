const fs = require('fs');
const filePath = 'c:/xampp/htdocs/sos-full-stack/server/routes/UserRoutes/userFullDetailsRoutes.php';
let content = fs.readFileSync(filePath, 'utf8');

const target = `'GET /userFullDetails/search/$' => [$userFullDetailsController, 'searchUsers'],`;
const replacement = `'GET /userFullDetails/search' => [$userFullDetailsController, 'searchUsers'],
    'GET /userFullDetails/search/' => [$userFullDetailsController, 'searchUsers'],
    'GET /userFullDetails/search/$' => [$userFullDetailsController, 'searchUsers'],`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated userFullDetailsRoutes.php');
} else {
  console.log('Target not found');
}
