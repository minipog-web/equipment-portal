const { execSync } = require('child_process');

try {
    const siteId = "bc00bfcc-a99e-49b2-b045-7fcb4d950a47";
    const command = `npx -y netlify-cli@latest api listHooksBySiteId --data "{ \\"site_id\\": \\"${siteId}\\" }"`;
    const output = execSync(command).toString();
    console.log(output);
} catch (e) {
    console.error(e.message);
    if (e.stdout) console.error("STDOUT:", e.stdout.toString());
}
